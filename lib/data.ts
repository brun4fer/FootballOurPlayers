import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  competitions,
  goalkeeperMatchStats,
  matches,
  playerMatchStats,
  players,
  publicReports,
  seasons,
  teamCompetitions,
  teamMatchStats,
  teams,
} from "@/db/schema";

const ANALYZED_TEAM_NAME = "Feirense";

export type PublicReportFilters = {
  competitionId?: number;
  playerId?: number;
  matchId?: number;
  matchIds?: number[];
  playerIds?: number[];
  selectedMatchIds?: number[];
  selectedPlayers?: number[];
  selectedMatchdays?: number[];
};

function isAnalyzedTeam(name: string) {
  return name.trim().toLowerCase() === ANALYZED_TEAM_NAME.toLowerCase();
}

function formatHomeAwayLabel(value: "home" | "away") {
  return value === "home" ? "Casa" : "Fora";
}

export function formatMatchLabel(match: {
  opponentTeamName: string;
  matchdayNumber: number;
  homeAway: "home" | "away";
}) {
  return `Feirense vs ${match.opponentTeamName} - Jornada ${match.matchdayNumber} (${formatHomeAwayLabel(match.homeAway)})`;
}

export async function getSeasons() {
  return db.query.seasons.findMany({
    orderBy: (table, { desc }) => [desc(table.id)],
  });
}

export async function getCompetitions() {
  return db
    .select({
      id: competitions.id,
      name: competitions.name,
      seasonId: competitions.seasonId,
      seasonName: seasons.name,
    })
    .from(competitions)
    .innerJoin(seasons, eq(competitions.seasonId, seasons.id))
    .orderBy(desc(competitions.id));
}

export async function getTeams() {
  return db.query.teams.findMany({
    orderBy: (table, { asc }) => [asc(table.name)],
  });
}

export async function getTeamCompetitionLinks() {
  return db
    .select({
      id: teamCompetitions.id,
      teamName: teams.name,
      competitionName: competitions.name,
      seasonName: seasons.name,
    })
    .from(teamCompetitions)
    .innerJoin(teams, eq(teamCompetitions.teamId, teams.id))
    .innerJoin(competitions, eq(teamCompetitions.competitionId, competitions.id))
    .innerJoin(seasons, eq(competitions.seasonId, seasons.id))
    .orderBy(desc(teamCompetitions.id));
}

export async function getPlayers() {
  return db
    .select({
      id: players.id,
      name: players.name,
      teamId: players.teamId,
      teamName: teams.name,
      photo: players.photo,
      height: players.height,
      weight: players.weight,
      nationality: players.nationality,
      agent: players.agent,
      isGoalkeeper: players.isGoalkeeper,
      position1: players.position1,
      position2: players.position2,
      position3: players.position3,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .orderBy(asc(players.name));
}

export async function getMatches() {
  return db
    .select({
      id: matches.id,
      matchdayNumber: matches.matchdayNumber,
      competitionId: matches.competitionId,
      competitionName: competitions.name,
      seasonName: seasons.name,
      opponentTeamId: matches.opponentTeamId,
      opponentTeamName: teams.name,
      homeAway: matches.homeAway,
      date: matches.date,
    })
    .from(matches)
    .innerJoin(competitions, eq(matches.competitionId, competitions.id))
    .innerJoin(seasons, eq(competitions.seasonId, seasons.id))
    .innerJoin(teams, eq(matches.opponentTeamId, teams.id))
    .orderBy(desc(matches.date), desc(matches.id));
}

export async function getCompetitionOptions() {
  return db.query.competitions.findMany({
    orderBy: (table, { asc }) => [asc(table.name)],
  });
}

export async function getTeamOptionsByCompetition(competitionId?: number) {
  if (!competitionId) {
    return [] as Array<{ id: number; name: string }>;
  }

  const options = await db
    .select({ id: teams.id, name: teams.name })
    .from(teamCompetitions)
    .innerJoin(teams, eq(teamCompetitions.teamId, teams.id))
    .where(eq(teamCompetitions.competitionId, competitionId))
    .orderBy(asc(teams.name));

  const analyzedOptions = options.filter((team) => isAnalyzedTeam(team.name));
  return analyzedOptions.length ? analyzedOptions : options;
}

export async function getMatchOptionsByCompetition(competitionId?: number) {
  if (!competitionId) {
    return [] as Array<{
      id: number;
      matchdayNumber: number;
      opponentTeamName: string;
      homeAway: "home" | "away";
      date: string;
    }>;
  }

  return db
    .select({
      id: matches.id,
      matchdayNumber: matches.matchdayNumber,
      opponentTeamName: teams.name,
      homeAway: matches.homeAway,
      date: matches.date,
    })
    .from(matches)
    .innerJoin(teams, eq(matches.opponentTeamId, teams.id))
    .where(eq(matches.competitionId, competitionId))
    .orderBy(asc(matches.matchdayNumber), asc(matches.date));
}

export async function getPlayerOptionsByTeam(teamId?: number) {
  if (!teamId) {
    return [] as Array<{
      id: number;
      name: string;
      isGoalkeeper: boolean;
    }>;
  }

  return db
    .select({
      id: players.id,
      name: players.name,
      isGoalkeeper: players.isGoalkeeper,
    })
    .from(players)
    .where(eq(players.teamId, teamId))
    .orderBy(asc(players.name));
}

export async function getAnalyzedTeamPlayerOptionsByCompetition(competitionId?: number) {
  if (!competitionId) {
    return [] as Array<{
      id: number;
      name: string;
      isGoalkeeper: boolean;
    }>;
  }

  return db
    .select({
      id: players.id,
      name: players.name,
      isGoalkeeper: players.isGoalkeeper,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .innerJoin(
      teamCompetitions,
      and(eq(teamCompetitions.teamId, teams.id), eq(teamCompetitions.competitionId, competitionId)),
    )
    .where(eq(teams.name, ANALYZED_TEAM_NAME))
    .orderBy(asc(players.name));
}

export async function getExistingPlayerMatchStats(playerId?: number, matchId?: number) {
  if (!playerId || !matchId) {
    return null;
  }

  return db.query.playerMatchStats.findFirst({
    where: (table, { and, eq }) => and(eq(table.playerId, playerId), eq(table.matchId, matchId)),
  });
}

export async function getExistingGoalkeeperStats(playerId?: number, matchId?: number) {
  if (!playerId || !matchId) {
    return null;
  }

  return db.query.goalkeeperMatchStats.findFirst({
    where: (table, { and, eq }) => and(eq(table.playerId, playerId), eq(table.matchId, matchId)),
  });
}

export async function getExistingTeamMatchStats(teamId?: number, matchId?: number) {
  if (!teamId || !matchId) {
    return null;
  }

  return db.query.teamMatchStats.findFirst({
    where: (table, { and, eq }) => and(eq(table.teamId, teamId), eq(table.matchId, matchId)),
  });
}

type TeamOutfieldTotals = {
  minutesPlayed: number;
  shortPassSuccess: number;
  shortPassFail: number;
  longPassSuccess: number;
  longPassFail: number;
  crossSuccess: number;
  crossFail: number;
  dribbleSuccess: number;
  dribbleFail: number;
  throwSuccess: number;
  throwFail: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  aerialDuelSuccess: number;
  aerialDuelFail: number;
  defensiveDuelSuccess: number;
  defensiveDuelFail: number;
  goals: number;
  assists: number;
  foulsSuffered: number;
  foulsCommitted: number;
  recoveries: number;
  interceptions: number;
  offsides: number;
  possessionLosses: number;
  responsibilityGoal: number;
  yellowCards: number;
  redCards: number;
};

export type TeamDashboardMatchAggregate = {
  matchId: number;
  matchdayNumber: number;
  date: string;
  opponentTeamName: string;
  minutesPlayed: number;
  shortPassSuccess: number;
  shortPassFail: number;
  longPassSuccess: number;
  longPassFail: number;
  crossSuccess: number;
  crossFail: number;
  dribbleSuccess: number;
  dribbleFail: number;
  throwSuccess: number;
  throwFail: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  aerialDuelSuccess: number;
  aerialDuelFail: number;
  defensiveDuelSuccess: number;
  defensiveDuelFail: number;
  goals: number;
  foulsSuffered: number;
  foulsCommitted: number;
  recoveries: number;
  interceptions: number;
  offsides: number;
  possessionLosses: number;
  yellowCards: number;
  redCards: number;
  responsibilityGoal: number;
  saves: number;
  incompleteSaves: number;
  shotsConceded: number;
  goalsConceded: number;
};

export async function getCalculatedTeamTotalsByMatch(
  matchId?: number,
): Promise<TeamOutfieldTotals | null> {
  if (!matchId) {
    return null;
  }

  const rows = await db
    .select({
      minutesPlayed: sql<number>`coalesce(sum(${playerMatchStats.minutesPlayed}), 0)`,
      shortPassSuccess: sql<number>`coalesce(sum(${playerMatchStats.shortPassSuccess}), 0)`,
      shortPassFail: sql<number>`coalesce(sum(${playerMatchStats.shortPassFail}), 0)`,
      longPassSuccess: sql<number>`coalesce(sum(${playerMatchStats.longPassSuccess}), 0)`,
      longPassFail: sql<number>`coalesce(sum(${playerMatchStats.longPassFail}), 0)`,
      crossSuccess: sql<number>`coalesce(sum(${playerMatchStats.crossSuccess}), 0)`,
      crossFail: sql<number>`coalesce(sum(${playerMatchStats.crossFail}), 0)`,
      dribbleSuccess: sql<number>`coalesce(sum(${playerMatchStats.dribbleSuccess}), 0)`,
      dribbleFail: sql<number>`coalesce(sum(${playerMatchStats.dribbleFail}), 0)`,
      throwSuccess: sql<number>`coalesce(sum(${playerMatchStats.throwSuccess}), 0)`,
      throwFail: sql<number>`coalesce(sum(${playerMatchStats.throwFail}), 0)`,
      shotsOnTarget: sql<number>`coalesce(sum(${playerMatchStats.shotsOnTarget}), 0)`,
      shotsOffTarget: sql<number>`coalesce(sum(${playerMatchStats.shotsOffTarget}), 0)`,
      aerialDuelSuccess: sql<number>`coalesce(sum(${playerMatchStats.aerialDuelSuccess}), 0)`,
      aerialDuelFail: sql<number>`coalesce(sum(${playerMatchStats.aerialDuelFail}), 0)`,
      defensiveDuelSuccess: sql<number>`coalesce(sum(${playerMatchStats.defensiveDuelSuccess}), 0)`,
      defensiveDuelFail: sql<number>`coalesce(sum(${playerMatchStats.defensiveDuelFail}), 0)`,
      goals: sql<number>`coalesce(sum(${playerMatchStats.goals}), 0)`,
      assists: sql<number>`coalesce(sum(${playerMatchStats.assists}), 0)`,
      foulsSuffered: sql<number>`coalesce(sum(${playerMatchStats.foulsSuffered}), 0)`,
      foulsCommitted: sql<number>`coalesce(sum(${playerMatchStats.foulsCommitted}), 0)`,
      recoveries: sql<number>`coalesce(sum(${playerMatchStats.recoveries}), 0)`,
      interceptions: sql<number>`coalesce(sum(${playerMatchStats.interceptions}), 0)`,
      offsides: sql<number>`coalesce(sum(${playerMatchStats.offsides}), 0)`,
      possessionLosses: sql<number>`coalesce(sum(${playerMatchStats.possessionLosses}), 0)`,
      responsibilityGoal: sql<number>`coalesce(sum(${playerMatchStats.responsibilityGoal}), 0)`,
      yellowCards: sql<number>`coalesce(sum(${playerMatchStats.yellowCards}), 0)`,
      redCards: sql<number>`coalesce(sum(${playerMatchStats.redCards}), 0)`,
    })
    .from(playerMatchStats)
    .innerJoin(players, eq(playerMatchStats.playerId, players.id))
    .innerJoin(teams, eq(players.teamId, teams.id))
    .where(and(eq(playerMatchStats.matchId, matchId), eq(teams.name, ANALYZED_TEAM_NAME)));

  return rows[0] ?? null;
}

export async function getDashboardPlayersByCompetition(competitionId?: number) {
  if (!competitionId) {
    return [] as Array<{ id: number; name: string; teamName: string; isGoalkeeper: boolean }>;
  }

  const rows = await db
    .select({
      id: players.id,
      name: players.name,
      teamName: teams.name,
      isGoalkeeper: players.isGoalkeeper,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .innerJoin(
      teamCompetitions,
      and(eq(teamCompetitions.teamId, teams.id), eq(teamCompetitions.competitionId, competitionId)),
    )
    .orderBy(asc(players.name));

  const analyzedPlayers = rows.filter((row) => isAnalyzedTeam(row.teamName));
  return analyzedPlayers.length ? analyzedPlayers : rows;
}

export async function getPlayerCompetitionMatchStats(
  playerId?: number,
  competitionId?: number,
  matchIds?: number[],
) {
  if (!playerId || !competitionId) {
    return [] as Array<Record<string, number | string>>;
  }

  const conditions = [eq(playerMatchStats.playerId, playerId), eq(matches.competitionId, competitionId)];
  if (matchIds && matchIds.length > 0) {
    conditions.push(inArray(matches.id, matchIds));
  }

  return db
    .select({
      id: playerMatchStats.id,
      matchId: playerMatchStats.matchId,
      matchdayNumber: matches.matchdayNumber,
      homeAway: matches.homeAway,
      date: matches.date,
      opponentTeamName: teams.name,
      minutesPlayed: playerMatchStats.minutesPlayed,
      shortPassSuccess: playerMatchStats.shortPassSuccess,
      shortPassFail: playerMatchStats.shortPassFail,
      longPassSuccess: playerMatchStats.longPassSuccess,
      longPassFail: playerMatchStats.longPassFail,
      crossSuccess: playerMatchStats.crossSuccess,
      crossFail: playerMatchStats.crossFail,
      dribbleSuccess: playerMatchStats.dribbleSuccess,
      dribbleFail: playerMatchStats.dribbleFail,
      throwSuccess: playerMatchStats.throwSuccess,
      throwFail: playerMatchStats.throwFail,
      shotsOnTarget: playerMatchStats.shotsOnTarget,
      shotsOffTarget: playerMatchStats.shotsOffTarget,
      aerialDuelSuccess: playerMatchStats.aerialDuelSuccess,
      aerialDuelFail: playerMatchStats.aerialDuelFail,
      defensiveDuelSuccess: playerMatchStats.defensiveDuelSuccess,
      defensiveDuelFail: playerMatchStats.defensiveDuelFail,
      goals: playerMatchStats.goals,
      assists: playerMatchStats.assists,
      foulsSuffered: playerMatchStats.foulsSuffered,
      foulsCommitted: playerMatchStats.foulsCommitted,
      recoveries: playerMatchStats.recoveries,
      interceptions: playerMatchStats.interceptions,
      offsides: playerMatchStats.offsides,
      possessionLosses: playerMatchStats.possessionLosses,
      responsibilityGoal: playerMatchStats.responsibilityGoal,
      yellowCards: playerMatchStats.yellowCards,
      redCards: playerMatchStats.redCards,
    })
    .from(playerMatchStats)
    .innerJoin(matches, eq(playerMatchStats.matchId, matches.id))
    .innerJoin(teams, eq(matches.opponentTeamId, teams.id))
    .where(and(...conditions))
    .orderBy(asc(matches.matchdayNumber), asc(matches.date));
}

export async function getGoalkeeperCompetitionMatchStats(
  playerId?: number,
  competitionId?: number,
  matchIds?: number[],
) {
  if (!playerId || !competitionId) {
    return [] as Array<Record<string, number | string>>;
  }

  const conditions = [eq(goalkeeperMatchStats.playerId, playerId), eq(matches.competitionId, competitionId)];
  if (matchIds && matchIds.length > 0) {
    conditions.push(inArray(matches.id, matchIds));
  }

  return db
    .select({
      matchId: goalkeeperMatchStats.matchId,
      matchdayNumber: matches.matchdayNumber,
      date: matches.date,
      opponentTeamName: teams.name,
      minutesPlayed: goalkeeperMatchStats.minutesPlayed,
      saves: goalkeeperMatchStats.saves,
      incompleteSaves: goalkeeperMatchStats.incompleteSaves,
      shotsConceded: goalkeeperMatchStats.shotsConceded,
      goalsConceded: goalkeeperMatchStats.goalsConceded,
    })
    .from(goalkeeperMatchStats)
    .innerJoin(matches, eq(goalkeeperMatchStats.matchId, matches.id))
    .innerJoin(teams, eq(matches.opponentTeamId, teams.id))
    .where(and(...conditions))
    .orderBy(asc(matches.matchdayNumber), asc(matches.date));
}

export async function getCompetitionPlayerTotals(competitionId?: number, matchIds?: number[]) {
  if (!competitionId) {
    return [];
  }

  const whereCondition =
    matchIds && matchIds.length > 0
      ? and(eq(matches.competitionId, competitionId), inArray(matches.id, matchIds))
      : eq(matches.competitionId, competitionId);

  return db
    .select({
      playerId: players.id,
      playerName: players.name,
      teamName: teams.name,
      shortPassSuccess: sql<number>`coalesce(sum(${playerMatchStats.shortPassSuccess}), 0)`,
      shortPassFail: sql<number>`coalesce(sum(${playerMatchStats.shortPassFail}), 0)`,
      longPassSuccess: sql<number>`coalesce(sum(${playerMatchStats.longPassSuccess}), 0)`,
      longPassFail: sql<number>`coalesce(sum(${playerMatchStats.longPassFail}), 0)`,
      crossSuccess: sql<number>`coalesce(sum(${playerMatchStats.crossSuccess}), 0)`,
      crossFail: sql<number>`coalesce(sum(${playerMatchStats.crossFail}), 0)`,
      dribbleSuccess: sql<number>`coalesce(sum(${playerMatchStats.dribbleSuccess}), 0)`,
      dribbleFail: sql<number>`coalesce(sum(${playerMatchStats.dribbleFail}), 0)`,
      throwSuccess: sql<number>`coalesce(sum(${playerMatchStats.throwSuccess}), 0)`,
      throwFail: sql<number>`coalesce(sum(${playerMatchStats.throwFail}), 0)`,
      shotsOnTarget: sql<number>`coalesce(sum(${playerMatchStats.shotsOnTarget}), 0)`,
      shotsOffTarget: sql<number>`coalesce(sum(${playerMatchStats.shotsOffTarget}), 0)`,
      aerialDuelSuccess: sql<number>`coalesce(sum(${playerMatchStats.aerialDuelSuccess}), 0)`,
      aerialDuelFail: sql<number>`coalesce(sum(${playerMatchStats.aerialDuelFail}), 0)`,
      defensiveDuelSuccess: sql<number>`coalesce(sum(${playerMatchStats.defensiveDuelSuccess}), 0)`,
      defensiveDuelFail: sql<number>`coalesce(sum(${playerMatchStats.defensiveDuelFail}), 0)`,
      goals: sql<number>`coalesce(sum(${playerMatchStats.goals}), 0)`,
      assists: sql<number>`coalesce(sum(${playerMatchStats.assists}), 0)`,
      recoveries: sql<number>`coalesce(sum(${playerMatchStats.recoveries}), 0)`,
      interceptions: sql<number>`coalesce(sum(${playerMatchStats.interceptions}), 0)`,
      yellowCards: sql<number>`coalesce(sum(${playerMatchStats.yellowCards}), 0)`,
      redCards: sql<number>`coalesce(sum(${playerMatchStats.redCards}), 0)`,
      minutesPlayed: sql<number>`coalesce(sum(${playerMatchStats.minutesPlayed}), 0)`,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .innerJoin(playerMatchStats, eq(playerMatchStats.playerId, players.id))
    .innerJoin(matches, eq(playerMatchStats.matchId, matches.id))
    .where(whereCondition)
    .groupBy(players.id, players.name, teams.name)
    .orderBy(sql`coalesce(sum(${playerMatchStats.goals}), 0) desc`, asc(players.name));
}

export async function getPlayerForReport(playerId: number) {
  return db
    .select({
      id: players.id,
      name: players.name,
      photo: players.photo,
      nationality: players.nationality,
      height: players.height,
      weight: players.weight,
      agent: players.agent,
      isGoalkeeper: players.isGoalkeeper,
      position1: players.position1,
      position2: players.position2,
      position3: players.position3,
      teamName: teams.name,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .where(eq(players.id, playerId))
    .then((rows) => rows[0] ?? null);
}

export async function getPlayerCompetitionOptions(playerId: number) {
  return db
    .selectDistinct({
      id: competitions.id,
      name: competitions.name,
    })
    .from(playerMatchStats)
    .innerJoin(matches, eq(playerMatchStats.matchId, matches.id))
    .innerJoin(competitions, eq(matches.competitionId, competitions.id))
    .where(eq(playerMatchStats.playerId, playerId))
    .orderBy(asc(competitions.name));
}

export async function getReportOutfieldStats(playerId: number, competitionId?: number) {
  const whereClause = competitionId
    ? and(eq(playerMatchStats.playerId, playerId), eq(matches.competitionId, competitionId))
    : eq(playerMatchStats.playerId, playerId);

  return db
    .select({
      matchdayNumber: matches.matchdayNumber,
      competitionId: matches.competitionId,
      homeAway: matches.homeAway,
      date: matches.date,
      opponentTeamName: teams.name,
      minutesPlayed: playerMatchStats.minutesPlayed,
      shortPassSuccess: playerMatchStats.shortPassSuccess,
      shortPassFail: playerMatchStats.shortPassFail,
      longPassSuccess: playerMatchStats.longPassSuccess,
      longPassFail: playerMatchStats.longPassFail,
      crossSuccess: playerMatchStats.crossSuccess,
      crossFail: playerMatchStats.crossFail,
      dribbleSuccess: playerMatchStats.dribbleSuccess,
      dribbleFail: playerMatchStats.dribbleFail,
      throwSuccess: playerMatchStats.throwSuccess,
      throwFail: playerMatchStats.throwFail,
      shotsOnTarget: playerMatchStats.shotsOnTarget,
      shotsOffTarget: playerMatchStats.shotsOffTarget,
      aerialDuelSuccess: playerMatchStats.aerialDuelSuccess,
      aerialDuelFail: playerMatchStats.aerialDuelFail,
      defensiveDuelSuccess: playerMatchStats.defensiveDuelSuccess,
      defensiveDuelFail: playerMatchStats.defensiveDuelFail,
      goals: playerMatchStats.goals,
      assists: playerMatchStats.assists,
      foulsSuffered: playerMatchStats.foulsSuffered,
      foulsCommitted: playerMatchStats.foulsCommitted,
      recoveries: playerMatchStats.recoveries,
      interceptions: playerMatchStats.interceptions,
      offsides: playerMatchStats.offsides,
      possessionLosses: playerMatchStats.possessionLosses,
      responsibilityGoal: playerMatchStats.responsibilityGoal,
      yellowCards: playerMatchStats.yellowCards,
      redCards: playerMatchStats.redCards,
    })
    .from(playerMatchStats)
    .innerJoin(matches, eq(playerMatchStats.matchId, matches.id))
    .innerJoin(teams, eq(matches.opponentTeamId, teams.id))
    .where(whereClause)
    .orderBy(asc(matches.matchdayNumber), asc(matches.date));
}

export async function getReportGoalkeeperStats(playerId: number, competitionId?: number) {
  const whereClause = competitionId
    ? and(eq(goalkeeperMatchStats.playerId, playerId), eq(matches.competitionId, competitionId))
    : eq(goalkeeperMatchStats.playerId, playerId);

  return db
    .select({
      matchdayNumber: matches.matchdayNumber,
      homeAway: matches.homeAway,
      date: matches.date,
      opponentTeamName: teams.name,
      minutesPlayed: goalkeeperMatchStats.minutesPlayed,
      saves: goalkeeperMatchStats.saves,
      incompleteSaves: goalkeeperMatchStats.incompleteSaves,
      shotsConceded: goalkeeperMatchStats.shotsConceded,
      goalsConceded: goalkeeperMatchStats.goalsConceded,
    })
    .from(goalkeeperMatchStats)
    .innerJoin(matches, eq(goalkeeperMatchStats.matchId, matches.id))
    .innerJoin(teams, eq(matches.opponentTeamId, teams.id))
    .where(whereClause)
    .orderBy(asc(matches.matchdayNumber), asc(matches.date));
}

export async function getCompetitionTeamTotals(competitionId?: number, matchIds?: number[]) {
  if (!competitionId) {
    return [];
  }

  const whereCondition =
    matchIds && matchIds.length > 0
      ? and(eq(matches.competitionId, competitionId), inArray(matches.id, matchIds))
      : eq(matches.competitionId, competitionId);

  return db
    .select({
      teamId: teams.id,
      teamName: teams.name,
      goals: sql<number>`coalesce(sum(${playerMatchStats.goals}), 0)`,
      assists: sql<number>`coalesce(sum(${playerMatchStats.assists}), 0)`,
      shotsTotal: sql<number>`coalesce(sum(${playerMatchStats.shotsOnTarget} + ${playerMatchStats.shotsOffTarget}), 0)`,
      shotsOnTarget: sql<number>`coalesce(sum(${playerMatchStats.shotsOnTarget}), 0)`,
      shotsOffTarget: sql<number>`coalesce(sum(${playerMatchStats.shotsOffTarget}), 0)`,
      recoveries: sql<number>`coalesce(sum(${playerMatchStats.recoveries}), 0)`,
      interceptions: sql<number>`coalesce(sum(${playerMatchStats.interceptions}), 0)`,
      possessionLosses: sql<number>`coalesce(sum(${playerMatchStats.possessionLosses}), 0)`,
      yellowCards: sql<number>`coalesce(sum(${playerMatchStats.yellowCards}), 0)`,
      redCards: sql<number>`coalesce(sum(${playerMatchStats.redCards}), 0)`,
      minutesPlayed: sql<number>`coalesce(sum(${playerMatchStats.minutesPlayed}), 0)`,
    })
    .from(playerMatchStats)
    .innerJoin(players, eq(playerMatchStats.playerId, players.id))
    .innerJoin(teams, eq(players.teamId, teams.id))
    .innerJoin(matches, eq(playerMatchStats.matchId, matches.id))
    .where(whereCondition)
    .groupBy(teams.id, teams.name)
    .orderBy(asc(teams.name));
}

export async function createPublicReport(filters: PublicReportFilters) {
  const id = crypto.randomUUID();

  await db.insert(publicReports).values({
    id,
    filters,
  });

  return id;
}

export async function getPublicReportById(id: string) {
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return null;
  }

  const row = await db.query.publicReports.findFirst({
    columns: {
      id: true,
      filters: true,
      createdAt: true,
    },
    where: (table, { eq }) => eq(table.id, id),
  });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    createdAt: row.createdAt,
    filters: (row.filters ?? {}) as PublicReportFilters,
  };
}

export async function getAnalyzedTeamMatchAggregates(
  competitionId?: number,
  matchIds?: number[],
): Promise<TeamDashboardMatchAggregate[]> {
  if (!competitionId) {
    return [];
  }

  const matchConditions = [eq(matches.competitionId, competitionId)];
  if (matchIds && matchIds.length > 0) {
    matchConditions.push(inArray(matches.id, matchIds));
  }

  const matchRows = await db
    .select({
      matchId: matches.id,
      matchdayNumber: matches.matchdayNumber,
      date: matches.date,
      opponentTeamName: teams.name,
    })
    .from(matches)
    .innerJoin(teams, eq(matches.opponentTeamId, teams.id))
    .where(and(...matchConditions))
    .orderBy(asc(matches.matchdayNumber), asc(matches.date));

  if (matchRows.length === 0) {
    return [];
  }

  const analyzedTeam = await db.query.teams.findFirst({
    columns: { id: true },
    where: (table, { eq }) => eq(table.name, ANALYZED_TEAM_NAME),
  });

  if (!analyzedTeam) {
    return matchRows.map((row) => ({
      ...row,
      minutesPlayed: 0,
      shortPassSuccess: 0,
      shortPassFail: 0,
      longPassSuccess: 0,
      longPassFail: 0,
      crossSuccess: 0,
      crossFail: 0,
      dribbleSuccess: 0,
      dribbleFail: 0,
      throwSuccess: 0,
      throwFail: 0,
      shotsOnTarget: 0,
      shotsOffTarget: 0,
      aerialDuelSuccess: 0,
      aerialDuelFail: 0,
      defensiveDuelSuccess: 0,
      defensiveDuelFail: 0,
      goals: 0,
      foulsSuffered: 0,
      foulsCommitted: 0,
      recoveries: 0,
      interceptions: 0,
      offsides: 0,
      possessionLosses: 0,
      yellowCards: 0,
      redCards: 0,
      responsibilityGoal: 0,
      saves: 0,
      incompleteSaves: 0,
      shotsConceded: 0,
      goalsConceded: 0,
    }));
  }

  const scopedMatchIds = matchRows.map((match) => match.matchId);

  const outfieldRows = await db
    .select({
      matchId: playerMatchStats.matchId,
      minutesPlayed: sql<number>`coalesce(sum(${playerMatchStats.minutesPlayed}), 0)`,
      shortPassSuccess: sql<number>`coalesce(sum(${playerMatchStats.shortPassSuccess}), 0)`,
      shortPassFail: sql<number>`coalesce(sum(${playerMatchStats.shortPassFail}), 0)`,
      longPassSuccess: sql<number>`coalesce(sum(${playerMatchStats.longPassSuccess}), 0)`,
      longPassFail: sql<number>`coalesce(sum(${playerMatchStats.longPassFail}), 0)`,
      crossSuccess: sql<number>`coalesce(sum(${playerMatchStats.crossSuccess}), 0)`,
      crossFail: sql<number>`coalesce(sum(${playerMatchStats.crossFail}), 0)`,
      dribbleSuccess: sql<number>`coalesce(sum(${playerMatchStats.dribbleSuccess}), 0)`,
      dribbleFail: sql<number>`coalesce(sum(${playerMatchStats.dribbleFail}), 0)`,
      throwSuccess: sql<number>`coalesce(sum(${playerMatchStats.throwSuccess}), 0)`,
      throwFail: sql<number>`coalesce(sum(${playerMatchStats.throwFail}), 0)`,
      shotsOnTarget: sql<number>`coalesce(sum(${playerMatchStats.shotsOnTarget}), 0)`,
      shotsOffTarget: sql<number>`coalesce(sum(${playerMatchStats.shotsOffTarget}), 0)`,
      aerialDuelSuccess: sql<number>`coalesce(sum(${playerMatchStats.aerialDuelSuccess}), 0)`,
      aerialDuelFail: sql<number>`coalesce(sum(${playerMatchStats.aerialDuelFail}), 0)`,
      defensiveDuelSuccess: sql<number>`coalesce(sum(${playerMatchStats.defensiveDuelSuccess}), 0)`,
      defensiveDuelFail: sql<number>`coalesce(sum(${playerMatchStats.defensiveDuelFail}), 0)`,
      goals: sql<number>`coalesce(sum(${playerMatchStats.goals}), 0)`,
      foulsSuffered: sql<number>`coalesce(sum(${playerMatchStats.foulsSuffered}), 0)`,
      foulsCommitted: sql<number>`coalesce(sum(${playerMatchStats.foulsCommitted}), 0)`,
      recoveries: sql<number>`coalesce(sum(${playerMatchStats.recoveries}), 0)`,
      interceptions: sql<number>`coalesce(sum(${playerMatchStats.interceptions}), 0)`,
      offsides: sql<number>`coalesce(sum(${playerMatchStats.offsides}), 0)`,
      possessionLosses: sql<number>`coalesce(sum(${playerMatchStats.possessionLosses}), 0)`,
      yellowCards: sql<number>`coalesce(sum(${playerMatchStats.yellowCards}), 0)`,
      redCards: sql<number>`coalesce(sum(${playerMatchStats.redCards}), 0)`,
      responsibilityGoal: sql<number>`coalesce(sum(${playerMatchStats.responsibilityGoal}), 0)`,
    })
    .from(playerMatchStats)
    .innerJoin(players, eq(playerMatchStats.playerId, players.id))
    .where(and(eq(players.teamId, analyzedTeam.id), inArray(playerMatchStats.matchId, scopedMatchIds)))
    .groupBy(playerMatchStats.matchId);

  const goalkeeperRows = await db
    .select({
      matchId: goalkeeperMatchStats.matchId,
      saves: sql<number>`coalesce(sum(${goalkeeperMatchStats.saves}), 0)`,
      incompleteSaves: sql<number>`coalesce(sum(${goalkeeperMatchStats.incompleteSaves}), 0)`,
      shotsConceded: sql<number>`coalesce(sum(${goalkeeperMatchStats.shotsConceded}), 0)`,
      goalsConceded: sql<number>`coalesce(sum(${goalkeeperMatchStats.goalsConceded}), 0)`,
    })
    .from(goalkeeperMatchStats)
    .innerJoin(players, eq(goalkeeperMatchStats.playerId, players.id))
    .where(and(eq(players.teamId, analyzedTeam.id), inArray(goalkeeperMatchStats.matchId, scopedMatchIds)))
    .groupBy(goalkeeperMatchStats.matchId);

  const outfieldMap = new Map(outfieldRows.map((row) => [row.matchId, row]));
  const goalkeeperMap = new Map(goalkeeperRows.map((row) => [row.matchId, row]));
  const toSafeNumber = (value: unknown) => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return matchRows.map((match) => {
    const outfield = outfieldMap.get(match.matchId);
    const goalkeeper = goalkeeperMap.get(match.matchId);

    return {
      matchId: toSafeNumber(match.matchId),
      matchdayNumber: toSafeNumber(match.matchdayNumber),
      date: match.date,
      opponentTeamName: match.opponentTeamName,
      minutesPlayed: toSafeNumber(outfield?.minutesPlayed),
      shortPassSuccess: toSafeNumber(outfield?.shortPassSuccess),
      shortPassFail: toSafeNumber(outfield?.shortPassFail),
      longPassSuccess: toSafeNumber(outfield?.longPassSuccess),
      longPassFail: toSafeNumber(outfield?.longPassFail),
      crossSuccess: toSafeNumber(outfield?.crossSuccess),
      crossFail: toSafeNumber(outfield?.crossFail),
      dribbleSuccess: toSafeNumber(outfield?.dribbleSuccess),
      dribbleFail: toSafeNumber(outfield?.dribbleFail),
      throwSuccess: toSafeNumber(outfield?.throwSuccess),
      throwFail: toSafeNumber(outfield?.throwFail),
      shotsOnTarget: toSafeNumber(outfield?.shotsOnTarget),
      shotsOffTarget: toSafeNumber(outfield?.shotsOffTarget),
      aerialDuelSuccess: toSafeNumber(outfield?.aerialDuelSuccess),
      aerialDuelFail: toSafeNumber(outfield?.aerialDuelFail),
      defensiveDuelSuccess: toSafeNumber(outfield?.defensiveDuelSuccess),
      defensiveDuelFail: toSafeNumber(outfield?.defensiveDuelFail),
      goals: toSafeNumber(outfield?.goals),
      foulsSuffered: toSafeNumber(outfield?.foulsSuffered),
      foulsCommitted: toSafeNumber(outfield?.foulsCommitted),
      recoveries: toSafeNumber(outfield?.recoveries),
      interceptions: toSafeNumber(outfield?.interceptions),
      offsides: toSafeNumber(outfield?.offsides),
      possessionLosses: toSafeNumber(outfield?.possessionLosses),
      yellowCards: toSafeNumber(outfield?.yellowCards),
      redCards: toSafeNumber(outfield?.redCards),
      responsibilityGoal: toSafeNumber(outfield?.responsibilityGoal),
      saves: toSafeNumber(goalkeeper?.saves),
      incompleteSaves: toSafeNumber(goalkeeper?.incompleteSaves),
      shotsConceded: toSafeNumber(goalkeeper?.shotsConceded),
      goalsConceded: toSafeNumber(goalkeeper?.goalsConceded),
    };
  });
}
