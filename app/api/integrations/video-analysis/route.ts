import { and, eq, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import {
  competitions,
  goalkeeperMatchStats,
  matches,
  playerMatchStats,
  players,
  seasons,
  teamCompetitions,
  teams,
} from "@/db/schema";
import { authenticateVideoAnalysisConnection } from "@/lib/video-analysis-connection";

export const dynamic = "force-dynamic";

const outfieldKeys = [
  "shortPassSuccess", "shortPassFail", "longPassSuccess", "longPassFail",
  "crossSuccess", "crossFail", "dribbleSuccess", "dribbleFail",
  "throwSuccess", "throwFail", "shotsOnTarget", "shotsOffTarget",
  "aerialDuelSuccess", "aerialDuelFail", "defensiveDuelSuccess", "defensiveDuelFail",
  "defensivePositioningToCorrect", "throughPasses", "runsInBehind",
  "setPieceCrossSuccess", "setPieceCrossFail", "interceptedCrosses", "goals",
  "assists", "foulsSuffered", "foulsCommitted", "recoveries", "interceptions",
  "offsides", "possessionLosses", "responsibilityGoal", "yellowCards", "redCards",
] as const;

const goalkeeperKeys = ["saves", "incompleteSaves", "shotsConceded", "goalsConceded"] as const;

const seasonSchema = z.object({ id: z.string().min(1), name: z.string().trim().min(1).max(120) });
const competitionSchema = z.object({ id: z.string().min(1), name: z.string().trim().min(1).max(120) });
const playerSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(140),
  position: z.string().trim().max(40).nullable().optional(),
  isGoalkeeper: z.boolean(),
});
const teamSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  players: z.array(playerSchema).default([]),
});
const statValuesSchema = z.record(z.string(), z.number().int().nonnegative());
const matchPlayerSchema = playerSchema.extend({
  minutesPlayed: z.number().int().min(0).max(180),
  stats: statValuesSchema,
  goalkeeperStats: statValuesSchema,
});

const payloadSchema = z.discriminatedUnion("kind", [
  z.object({ version: z.literal(1), kind: z.literal("season"), sourceWorkspaceId: z.string().min(1), season: seasonSchema }),
  z.object({ version: z.literal(1), kind: z.literal("competition"), sourceWorkspaceId: z.string().min(1), season: seasonSchema, competition: competitionSchema }),
  z.object({ version: z.literal(1), kind: z.literal("team"), sourceWorkspaceId: z.string().min(1), team: teamSchema }),
  z.object({
    version: z.literal(1),
    kind: z.literal("match"),
    sourceWorkspaceId: z.string().min(1),
    season: seasonSchema,
    competition: competitionSchema,
    team: teamSchema,
    opponent: z.object({ id: z.string().min(1), name: z.string().trim().min(1).max(120) }),
    match: z.object({
      id: z.string().min(1),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      roundName: z.string().trim().max(120).nullable(),
      homeAway: z.enum(["home", "away"]),
    }),
    players: z.array(matchPlayerSchema).min(1).max(30),
  }),
]);

type Payload = z.infer<typeof payloadSchema>;
type SeasonPayload = z.infer<typeof seasonSchema>;
type CompetitionPayload = z.infer<typeof competitionSchema>;
type TeamPayload = z.infer<typeof teamSchema>;
type PlayerPayload = z.infer<typeof playerSchema>;

async function authorize(request: Request, sourceWorkspaceId: string) {
  return (await authenticateVideoAnalysisConnection(request, sourceWorkspaceId)).workspaceId;
}

export async function DELETE(request: Request) {
  try {
    const connection = await authenticateVideoAnalysisConnection(request);
    const { videoAnalysisConnections } = await import("@/db/schema");
    await db.delete(videoAnalysisConnections).where(eq(videoAnalysisConnections.id, connection.id));
    return NextResponse.json({ connected: false });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "The connection could not be revoked." }, { status: 500 });
  }
}

async function syncSeason(workspaceId: number, source: SeasonPayload) {
  const existing = await db.query.seasons.findFirst({
    where: or(
      eq(seasons.videoAnalysisId, source.id),
      and(eq(seasons.workspaceId, workspaceId), eq(seasons.name, source.name)),
    ),
  });
  if (existing) {
    const [updated] = await db.update(seasons).set({ name: source.name, videoAnalysisId: source.id })
      .where(eq(seasons.id, existing.id)).returning({ id: seasons.id });
    return updated.id;
  }
  const [created] = await db.insert(seasons).values({ name: source.name, workspaceId, videoAnalysisId: source.id })
    .returning({ id: seasons.id });
  return created.id;
}

async function syncCompetition(workspaceId: number, source: CompetitionPayload, seasonId: number) {
  const existing = await db.query.competitions.findFirst({
    where: or(
      eq(competitions.videoAnalysisId, source.id),
      and(eq(competitions.workspaceId, workspaceId), eq(competitions.seasonId, seasonId), eq(competitions.name, source.name)),
    ),
  });
  if (existing) {
    const [updated] = await db.update(competitions).set({ name: source.name, seasonId, videoAnalysisId: source.id })
      .where(eq(competitions.id, existing.id)).returning({ id: competitions.id });
    return updated.id;
  }
  const [created] = await db.insert(competitions).values({ name: source.name, seasonId, workspaceId, videoAnalysisId: source.id })
    .returning({ id: competitions.id });
  return created.id;
}

async function syncPlayer(teamId: number, source: PlayerPayload) {
  const existing = await db.query.players.findFirst({
    where: or(
      eq(players.videoAnalysisId, source.id),
      and(eq(players.teamId, teamId), eq(players.name, source.name)),
    ),
  });
  const values = {
    name: source.name,
    teamId,
    videoAnalysisId: source.id,
    position1: source.position || null,
    isGoalkeeper: source.isGoalkeeper,
  };
  if (existing) {
    const [updated] = await db.update(players).set(values).where(eq(players.id, existing.id)).returning({ id: players.id });
    return updated.id;
  }
  const [created] = await db.insert(players).values(values).returning({ id: players.id });
  return created.id;
}

async function syncTeam(workspaceId: number, source: TeamPayload, isFixedHomeTeam = true) {
  const existing = await db.query.teams.findFirst({
    where: or(
      eq(teams.videoAnalysisId, source.id),
      and(eq(teams.workspaceId, workspaceId), eq(teams.name, source.name)),
    ),
  });
  if (isFixedHomeTeam) await db.update(teams).set({ isFixedHomeTeam: false }).where(eq(teams.workspaceId, workspaceId));
  const values = { name: source.name, workspaceId, videoAnalysisId: source.id, isFixedHomeTeam };
  const teamId = existing
    ? (await db.update(teams).set(values).where(eq(teams.id, existing.id)).returning({ id: teams.id }))[0].id
    : (await db.insert(teams).values(values).returning({ id: teams.id }))[0].id;
  for (const player of source.players) await syncPlayer(teamId, player);
  return teamId;
}

async function syncOpponent(workspaceId: number, source: { id: string; name: string }) {
  const existing = await db.query.teams.findFirst({
    where: or(
      eq(teams.videoAnalysisId, source.id),
      and(eq(teams.workspaceId, workspaceId), eq(teams.name, source.name)),
    ),
  });
  const values = { name: source.name, workspaceId, videoAnalysisId: source.id, isFixedHomeTeam: false };
  return existing
    ? (await db.update(teams).set(values).where(eq(teams.id, existing.id)).returning({ id: teams.id }))[0].id
    : (await db.insert(teams).values(values).returning({ id: teams.id }))[0].id;
}

async function linkTeamCompetition(teamId: number, competitionId: number) {
  await db.insert(teamCompetitions).values({ teamId, competitionId }).onConflictDoNothing();
}

function selectedStats(keys: readonly string[], values: Record<string, number>) {
  return Object.fromEntries(keys.map((key) => [key, Math.max(0, Math.floor(values[key] || 0))]));
}

async function syncMatch(workspaceId: number, payload: Extract<Payload, { kind: "match" }>) {
  const seasonId = await syncSeason(workspaceId, payload.season);
  const competitionId = await syncCompetition(workspaceId, payload.competition, seasonId);
  const teamId = await syncTeam(workspaceId, payload.team, true);
  const opponentTeamId = await syncOpponent(workspaceId, payload.opponent);
  await Promise.all([linkTeamCompetition(teamId, competitionId), linkTeamCompetition(opponentTeamId, competitionId)]);

  const existing = await db.query.matches.findFirst({ where: eq(matches.videoAnalysisId, payload.match.id) });
  const parsedRound = Number(payload.match.roundName?.match(/\d+/)?.[0]);
  const matchdayNumber = Number.isSafeInteger(parsedRound) && parsedRound > 0
    ? parsedRound
    : Number((await db.select({ count: sql<number>`count(*)` }).from(matches).where(eq(matches.competitionId, competitionId)))[0]?.count || 0) + 1;
  const matchValues = {
    matchdayNumber,
    roundName: payload.match.roundName,
    competitionId,
    opponentTeamId,
    homeAway: payload.match.homeAway,
    date: payload.match.date,
    videoAnalysisId: payload.match.id,
    videoAnalysisSyncedAt: new Date().toISOString(),
  } as const;
  const matchId = existing
    ? (await db.update(matches).set(matchValues).where(eq(matches.id, existing.id)).returning({ id: matches.id }))[0].id
    : (await db.insert(matches).values(matchValues).returning({ id: matches.id }))[0].id;

  const statements: any[] = [
    db.delete(goalkeeperMatchStats).where(eq(goalkeeperMatchStats.matchId, matchId)),
    db.delete(playerMatchStats).where(eq(playerMatchStats.matchId, matchId)),
  ];
  for (const sourcePlayer of payload.players) {
    const playerId = await syncPlayer(teamId, sourcePlayer);
    statements.push(db.insert(playerMatchStats).values({
      playerId,
      matchId,
      minutesPlayed: sourcePlayer.minutesPlayed,
      ...selectedStats(outfieldKeys, sourcePlayer.stats),
    } as typeof playerMatchStats.$inferInsert));
    if (sourcePlayer.isGoalkeeper) {
      statements.push(db.insert(goalkeeperMatchStats).values({
        playerId,
        matchId,
        minutesPlayed: sourcePlayer.minutesPlayed,
        ...selectedStats(goalkeeperKeys, sourcePlayer.goalkeeperStats),
      } as typeof goalkeeperMatchStats.$inferInsert));
    }
  }
  await db.batch(statements as any);
  return { matchId, competitionId };
}

export async function POST(request: Request) {
  try {
    const parsed = payloadSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid synchronization payload.", details: parsed.error.flatten() }, { status: 400 });
    const payload = parsed.data;
    const workspaceId = await authorize(request, payload.sourceWorkspaceId);

    if (payload.kind === "season") {
      const seasonId = await syncSeason(workspaceId, payload.season);
      return NextResponse.json({ synchronized: true, kind: payload.kind, seasonId });
    }
    if (payload.kind === "competition") {
      const seasonId = await syncSeason(workspaceId, payload.season);
      const competitionId = await syncCompetition(workspaceId, payload.competition, seasonId);
      return NextResponse.json({ synchronized: true, kind: payload.kind, seasonId, competitionId });
    }
    if (payload.kind === "team") {
      const teamId = await syncTeam(workspaceId, payload.team, true);
      return NextResponse.json({ synchronized: true, kind: payload.kind, teamId, playerCount: payload.team.players.length });
    }

    const result = await syncMatch(workspaceId, payload);
    return NextResponse.json({ synchronized: true, kind: payload.kind, ...result, href: `/admin/stats?competitionId=${result.competitionId}&matchId=${result.matchId}` });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Synchronization failed." }, { status: 500 });
  }
}
