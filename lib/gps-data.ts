import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { matches, playerGpsMatchStats, players, teams } from "@/db/schema";
import { getWorkspaceId } from "@/lib/auth";
import type { GpsValues } from "@/lib/gps-metrics";

export type GpsStatRow = GpsValues & {
  id: number;
  playerId: number;
  playerName: string;
  matchId: number;
  matchdayNumber: number;
  matchDate: string;
  opponentTeamName: string;
};

const gpsSelection = {
  id: playerGpsMatchStats.id,
  playerId: playerGpsMatchStats.playerId,
  playerName: players.name,
  matchId: playerGpsMatchStats.matchId,
  matchdayNumber: matches.matchdayNumber,
  matchDate: matches.date,
  opponentTeamName: teams.name,
  minutesPlayed: playerGpsMatchStats.minutesPlayed,
  totalDistance: playerGpsMatchStats.totalDistance,
  runningDistance: playerGpsMatchStats.runningDistance,
  sprintDistance: playerGpsMatchStats.sprintDistance,
  hsrDistance: playerGpsMatchStats.hsrDistance,
  maximumSpeed: playerGpsMatchStats.maximumSpeed,
  sprints: playerGpsMatchStats.sprints,
  repeatedSprints: playerGpsMatchStats.repeatedSprints,
  hsrRuns: playerGpsMatchStats.hsrRuns,
  totalAccelerations: playerGpsMatchStats.totalAccelerations,
  highIntensityAccelerations: playerGpsMatchStats.highIntensityAccelerations,
  totalDecelerations: playerGpsMatchStats.totalDecelerations,
  highIntensityDecelerations: playerGpsMatchStats.highIntensityDecelerations,
  changesOfDirection: playerGpsMatchStats.changesOfDirection,
};

export async function getExistingGpsStats(playerId?: number, matchId?: number) {
  if (!playerId || !matchId) return null;
  const workspaceId = await getWorkspaceId();

  return db.query.playerGpsMatchStats.findFirst({
    where: (table, { and: all, eq: equal }) =>
      all(
        equal(table.workspaceId, workspaceId),
        equal(table.playerId, playerId),
        equal(table.matchId, matchId),
      ),
  });
}

export async function getGpsStats(options: {
  competitionId?: number;
  playerIds?: number[];
  matchIds?: number[];
}): Promise<GpsStatRow[]> {
  if (!options.competitionId) return [];
  const workspaceId = await getWorkspaceId();
  const conditions = [
    eq(playerGpsMatchStats.workspaceId, workspaceId),
    eq(matches.competitionId, options.competitionId),
  ];

  if (options.playerIds?.length) {
    conditions.push(inArray(playerGpsMatchStats.playerId, options.playerIds));
  }
  if (options.matchIds?.length) {
    conditions.push(inArray(playerGpsMatchStats.matchId, options.matchIds));
  }

  return db
    .select(gpsSelection)
    .from(playerGpsMatchStats)
    .innerJoin(players, eq(playerGpsMatchStats.playerId, players.id))
    .innerJoin(matches, eq(playerGpsMatchStats.matchId, matches.id))
    .innerJoin(teams, eq(matches.opponentTeamId, teams.id))
    .where(and(...conditions))
    .orderBy(asc(matches.matchdayNumber), asc(matches.date), asc(players.name));
}
