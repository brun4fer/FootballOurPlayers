import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  competitions,
  goalkeeperMatchStats,
  matches,
  playerMatchStats,
  players,
  seasons,
  teamCompetitions,
  teamMatchStats,
  teams,
} from "@/db/schema";

const ANALYZED_TEAM_NAME = "Feirense";

function isAnalyzedTeam(name: string) {
  return name.trim().toLowerCase() === ANALYZED_TEAM_NAME.toLowerCase();
}

function formatHomeAwayLabel(value: "home" | "away") {
  return value === "home" ? "Home" : "Away";
}

export function formatMatchLabel(match: {
  opponentTeamName: string;
  matchdayNumber: number;
  homeAway: "home" | "away";
}) {
  return `Feirense vs ${match.opponentTeamName} - Matchday ${match.matchdayNumber} (${formatHomeAwayLabel(match.homeAway)})`;
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

export async function getDashboardPlayersByCompetition(competitionId?: number) {
  if (!competitionId) {
    return [] as Array<{ id: number; name: string; teamName: string }>;
  }

  const rows = await db
    .select({
      id: players.id,
      name: players.name,
      teamName: teams.name,
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

export async function getPlayerCompetitionMatchStats(playerId?: number, competitionId?: number) {
  if (!playerId || !competitionId) {
    return [] as Array<Record<string, number | string>>;
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
    .where(and(eq(playerMatchStats.playerId, playerId), eq(matches.competitionId, competitionId)))
    .orderBy(asc(matches.matchdayNumber), asc(matches.date));
}

export async function getCompetitionPlayerTotals(competitionId?: number) {
  if (!competitionId) {
    return [];
  }

  return db
    .select({
      playerId: players.id,
      playerName: players.name,
      teamName: teams.name,
      goals: sql<number>`coalesce(sum(${playerMatchStats.goals}), 0)`,
      assists: sql<number>`coalesce(sum(${playerMatchStats.assists}), 0)`,
      shotsOnTarget: sql<number>`coalesce(sum(${playerMatchStats.shotsOnTarget}), 0)`,
      recoveries: sql<number>`coalesce(sum(${playerMatchStats.recoveries}), 0)`,
      minutesPlayed: sql<number>`coalesce(sum(${playerMatchStats.minutesPlayed}), 0)`,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .innerJoin(playerMatchStats, eq(playerMatchStats.playerId, players.id))
    .innerJoin(matches, eq(playerMatchStats.matchId, matches.id))
    .where(eq(matches.competitionId, competitionId))
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

export async function getCompetitionTeamTotals(competitionId?: number) {
  if (!competitionId) {
    return [];
  }

  return db
    .select({
      teamId: teams.id,
      teamName: teams.name,
      goals: sql<number>`coalesce(sum(${teamMatchStats.goals}), 0)`,
      assists: sql<number>`coalesce(sum(${teamMatchStats.assists}), 0)`,
      shotsOnTarget: sql<number>`coalesce(sum(${teamMatchStats.shotsOnTarget}), 0)`,
      recoveries: sql<number>`coalesce(sum(${teamMatchStats.recoveries}), 0)`,
      minutesPlayed: sql<number>`coalesce(sum(${teamMatchStats.minutesPlayed}), 0)`,
    })
    .from(teamMatchStats)
    .innerJoin(teams, eq(teamMatchStats.teamId, teams.id))
    .innerJoin(matches, eq(teamMatchStats.matchId, matches.id))
    .where(eq(matches.competitionId, competitionId))
    .groupBy(teams.id, teams.name)
    .orderBy(asc(teams.name));
}
