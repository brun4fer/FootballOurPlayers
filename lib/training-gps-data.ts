import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  playerGpsTrainingStats,
  players,
  seasons,
  teams,
  trainingParticipants,
  trainingSessions,
} from "@/db/schema";
import { getWorkspaceId } from "@/lib/auth";
import type { GpsValues } from "@/lib/gps-metrics";

export type TrainingSessionOption = {
  id: number;
  seasonId: number;
  seasonName: string;
  teamId: number;
  teamName: string;
  trainingDate: string;
  microcycleNumber: number;
  trainingUnitNumber: number;
  durationMinutes: number;
};

export type TrainingGpsStatRow = GpsValues & {
  id: number;
  trainingSessionId: number;
  playerId: number;
  playerName: string;
  seasonId: number;
  seasonName: string;
  teamName: string;
  trainingDate: string;
  microcycleNumber: number;
  trainingUnitNumber: number;
};

export function formatTrainingLabel(training: Pick<TrainingSessionOption, "trainingDate" | "microcycleNumber" | "trainingUnitNumber">) {
  const date = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${training.trainingDate}T00:00:00Z`));
  return `${date} · MC ${training.microcycleNumber} · TU ${training.trainingUnitNumber}`;
}

export async function getTrainingSessions(seasonId?: number): Promise<TrainingSessionOption[]> {
  const workspaceId = await getWorkspaceId();
  const conditions = [eq(trainingSessions.workspaceId, workspaceId)];
  if (seasonId) conditions.push(eq(trainingSessions.seasonId, seasonId));

  return db
    .select({
      id: trainingSessions.id,
      seasonId: trainingSessions.seasonId,
      seasonName: seasons.name,
      teamId: trainingSessions.teamId,
      teamName: teams.name,
      trainingDate: trainingSessions.trainingDate,
      microcycleNumber: trainingSessions.microcycleNumber,
      trainingUnitNumber: trainingSessions.trainingUnitNumber,
      durationMinutes: trainingSessions.durationMinutes,
    })
    .from(trainingSessions)
    .innerJoin(seasons, eq(trainingSessions.seasonId, seasons.id))
    .innerJoin(teams, eq(trainingSessions.teamId, teams.id))
    .where(and(...conditions))
    .orderBy(desc(trainingSessions.trainingDate), desc(trainingSessions.microcycleNumber), desc(trainingSessions.trainingUnitNumber));
}

export async function getTrainingParticipantOptions(trainingSessionId?: number) {
  if (!trainingSessionId) return [] as Array<{ id: number; name: string }>;
  const workspaceId = await getWorkspaceId();
  return db
    .select({ id: players.id, name: players.name })
    .from(trainingParticipants)
    .innerJoin(trainingSessions, eq(trainingParticipants.trainingSessionId, trainingSessions.id))
    .innerJoin(players, eq(trainingParticipants.playerId, players.id))
    .where(and(eq(trainingParticipants.trainingSessionId, trainingSessionId), eq(trainingSessions.workspaceId, workspaceId)))
    .orderBy(asc(players.name));
}

export async function getTrainingParticipantIds(trainingSessionId?: number) {
  return (await getTrainingParticipantOptions(trainingSessionId)).map((player) => player.id);
}

export async function getExistingTrainingGpsStats(playerId?: number, trainingSessionId?: number) {
  if (!playerId || !trainingSessionId) return null;
  const workspaceId = await getWorkspaceId();
  return db.query.playerGpsTrainingStats.findFirst({
    where: (table, { and: all, eq: equal }) => all(
      equal(table.workspaceId, workspaceId),
      equal(table.playerId, playerId),
      equal(table.trainingSessionId, trainingSessionId),
    ),
  });
}

const trainingGpsSelection = {
  id: playerGpsTrainingStats.id,
  trainingSessionId: playerGpsTrainingStats.trainingSessionId,
  playerId: playerGpsTrainingStats.playerId,
  playerName: players.name,
  seasonId: trainingSessions.seasonId,
  seasonName: seasons.name,
  teamName: teams.name,
  trainingDate: trainingSessions.trainingDate,
  microcycleNumber: trainingSessions.microcycleNumber,
  trainingUnitNumber: trainingSessions.trainingUnitNumber,
  minutesPlayed: trainingSessions.durationMinutes,
  totalDistance: playerGpsTrainingStats.totalDistance,
  runningDistance: playerGpsTrainingStats.runningDistance,
  sprintDistance: playerGpsTrainingStats.sprintDistance,
  hsrDistance: playerGpsTrainingStats.hsrDistance,
  maximumSpeed: playerGpsTrainingStats.maximumSpeed,
  sprints: playerGpsTrainingStats.sprints,
  repeatedSprints: playerGpsTrainingStats.repeatedSprints,
  hsrRuns: playerGpsTrainingStats.hsrRuns,
  totalAccelerations: playerGpsTrainingStats.totalAccelerations,
  highIntensityAccelerations: playerGpsTrainingStats.highIntensityAccelerations,
  totalDecelerations: playerGpsTrainingStats.totalDecelerations,
  highIntensityDecelerations: playerGpsTrainingStats.highIntensityDecelerations,
  changesOfDirection: playerGpsTrainingStats.changesOfDirection,
};

export async function getTrainingGpsStats(options: {
  seasonId?: number;
  playerIds?: number[];
  trainingIds?: number[];
  microcycleNumbers?: number[];
  trainingUnitNumbers?: number[];
}): Promise<TrainingGpsStatRow[]> {
  if (!options.seasonId) return [];
  const workspaceId = await getWorkspaceId();
  const conditions = [
    eq(playerGpsTrainingStats.workspaceId, workspaceId),
    eq(trainingSessions.seasonId, options.seasonId),
  ];
  if (options.playerIds?.length) conditions.push(inArray(playerGpsTrainingStats.playerId, options.playerIds));
  if (options.trainingIds?.length) conditions.push(inArray(playerGpsTrainingStats.trainingSessionId, options.trainingIds));
  if (options.microcycleNumbers?.length) conditions.push(inArray(trainingSessions.microcycleNumber, options.microcycleNumbers));
  if (options.trainingUnitNumbers?.length) conditions.push(inArray(trainingSessions.trainingUnitNumber, options.trainingUnitNumbers));

  return db
    .select(trainingGpsSelection)
    .from(playerGpsTrainingStats)
    .innerJoin(players, eq(playerGpsTrainingStats.playerId, players.id))
    .innerJoin(trainingSessions, eq(playerGpsTrainingStats.trainingSessionId, trainingSessions.id))
    .innerJoin(seasons, eq(trainingSessions.seasonId, seasons.id))
    .innerJoin(teams, eq(trainingSessions.teamId, teams.id))
    .where(and(...conditions))
    .orderBy(asc(trainingSessions.trainingDate), asc(trainingSessions.microcycleNumber), asc(trainingSessions.trainingUnitNumber), asc(players.name));
}
