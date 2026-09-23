"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

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
import { parseGoalkeeperStats, parseOutfieldStats } from "@/lib/validators";
import { getAdminWorkspaceId } from "@/lib/admin-auth";

async function requireOwnedTeam(id: number) {
  const workspaceId = await getAdminWorkspaceId();
  const row = await db.select({ id: teams.id }).from(teams)
    .where(and(eq(teams.id, id), eq(teams.workspaceId, workspaceId))).limit(1);
  if (!row[0]) throw new Error("Invalid team.");
  return workspaceId;
}

async function requireMutableTeam(id: number) {
  const workspaceId = await getAdminWorkspaceId();
  const row = await db.select({ isFixedHomeTeam: teams.isFixedHomeTeam }).from(teams)
    .where(and(eq(teams.id, id), eq(teams.workspaceId, workspaceId))).limit(1);
  if (!row[0]) throw new Error("Invalid team.");
  if (row[0].isFixedHomeTeam) throw new Error("The fixed home team cannot be deleted.");
  return workspaceId;
}

async function requireOpponentTeam(id: number) {
  const workspaceId = await getAdminWorkspaceId();
  const row = await db.select({ isFixedHomeTeam: teams.isFixedHomeTeam }).from(teams)
    .where(and(eq(teams.id, id), eq(teams.workspaceId, workspaceId))).limit(1);
  if (!row[0] || row[0].isFixedHomeTeam) throw new Error("Select a valid opponent team.");
}

async function getFixedHomeTeamId() {
  const workspaceId = await getAdminWorkspaceId();
  const row = await db.select({ id: teams.id }).from(teams)
    .where(and(eq(teams.workspaceId, workspaceId), eq(teams.isFixedHomeTeam, true))).limit(1);
  if (!row[0]) throw new Error("The fixed home team is missing.");
  return row[0].id;
}

async function requireOwnedCompetition(id: number) {
  const workspaceId = await getAdminWorkspaceId();
  const row = await db.select({ id: competitions.id }).from(competitions)
    .where(and(eq(competitions.id, id), eq(competitions.workspaceId, workspaceId))).limit(1);
  if (!row[0]) throw new Error("Invalid competition.");
  return workspaceId;
}

async function requireOwnedPlayer(id: number) {
  const workspaceId = await getAdminWorkspaceId();
  const row = await db.select({ id: players.id }).from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .where(and(eq(players.id, id), eq(teams.workspaceId, workspaceId))).limit(1);
  if (!row[0]) throw new Error("Invalid player.");
}

async function requireOwnedMatch(id: number) {
  const workspaceId = await getAdminWorkspaceId();
  const row = await db.select({ id: matches.id, videoAnalysisId: matches.videoAnalysisId }).from(matches)
    .innerJoin(competitions, eq(matches.competitionId, competitions.id))
    .where(and(eq(matches.id, id), eq(competitions.workspaceId, workspaceId))).limit(1);
  if (!row[0]) throw new Error("Invalid match.");
  return row[0];
}

function requireManualStatsMatch(match: { videoAnalysisId: string | null }) {
  if (match.videoAnalysisId) {
    throw new Error("This match is managed by VideoAnaliseJogadores. Correct it there and synchronize it again.");
  }
}

function optionalText(value: FormDataEntryValue | null, max = 255) {
  if (!value) {
    return null;
  }
  const parsed = String(value).trim();
  return parsed.length ? parsed.slice(0, max) : null;
}

function optionalImageUrl(value: FormDataEntryValue | null, label: string) {
  const parsed = optionalText(value, 2000);
  if (!parsed) {
    return null;
  }

  if (parsed.startsWith("/") && !parsed.startsWith("//")) {
    return parsed;
  }

  try {
    const url = new URL(parsed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    // Fall through to the friendly validation message below.
  }

  throw new Error(`${label} must be a valid HTTP(S) URL.`);
}

function optionalInt(value: FormDataEntryValue | null) {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : null;
}

function toRequiredId(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Invalid identifier.");
  }
  return Math.floor(parsed);
}

export async function createSeasonAction(formData: FormData) {
  const workspaceId = await getAdminWorkspaceId();
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("The season name must be at least 2 characters long.");
  }

  await db.insert(seasons).values({ name, workspaceId }).onConflictDoNothing();
  revalidatePath("/admin/seasons");
}

export async function updateSeasonAction(formData: FormData) {
  const workspaceId = await getAdminWorkspaceId();
  const id = toRequiredId(formData.get("id"));
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("The season name must be at least 2 characters long.");
  }

  await db.update(seasons).set({ name }).where(and(eq(seasons.id, id), eq(seasons.workspaceId, workspaceId)));
  revalidatePath("/admin/seasons");
}

export async function deleteSeasonAction(formData: FormData) {
  const workspaceId = await getAdminWorkspaceId();
  const id = toRequiredId(formData.get("id"));
  await db.delete(seasons).where(and(eq(seasons.id, id), eq(seasons.workspaceId, workspaceId)));
  revalidatePath("/admin/seasons");
  revalidatePath("/admin/competitions");
  revalidatePath("/admin/matches");
  revalidatePath("/admin/stats");
}

export async function createCompetitionAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 120);
  const seasonId = toRequiredId(formData.get("seasonId"));
  const workspaceId = await getAdminWorkspaceId();
  const ownedSeason = await db.select({ id: seasons.id }).from(seasons)
    .where(and(eq(seasons.id, seasonId), eq(seasons.workspaceId, workspaceId))).limit(1);
  if (!ownedSeason[0]) throw new Error("Invalid season.");
  if (!name || name.length < 2) {
    throw new Error("The competition name must be at least 2 characters long.");
  }

  await db
    .insert(competitions)
    .values({
      name,
      seasonId,
      workspaceId,
    })
    .onConflictDoNothing();

  revalidatePath("/admin/competitions");
  revalidatePath("/admin/matches");
}

export async function updateCompetitionAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  const name = optionalText(formData.get("name"), 120);
  const seasonId = toRequiredId(formData.get("seasonId"));
  const workspaceId = await requireOwnedCompetition(id);
  const ownedSeason = await db.select({ id: seasons.id }).from(seasons)
    .where(and(eq(seasons.id, seasonId), eq(seasons.workspaceId, workspaceId))).limit(1);
  if (!ownedSeason[0]) throw new Error("Invalid season.");
  if (!name || name.length < 2) {
    throw new Error("The competition name must be at least 2 characters long.");
  }

  await db
    .update(competitions)
    .set({
      name,
      seasonId,
    })
    .where(and(eq(competitions.id, id), eq(competitions.workspaceId, workspaceId)));

  revalidatePath("/admin/competitions");
  revalidatePath("/admin/matches");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function deleteCompetitionAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  const workspaceId = await requireOwnedCompetition(id);
  await db.delete(competitions).where(and(eq(competitions.id, id), eq(competitions.workspaceId, workspaceId)));
  revalidatePath("/admin/competitions");
  revalidatePath("/admin/matches");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function createTeamAction(formData: FormData) {
  const workspaceId = await getAdminWorkspaceId();
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("The team name must be at least 2 characters long.");
  }

  const emblemUrl = optionalImageUrl(formData.get("emblemUrl"), "The crest");

  await db.insert(teams).values({ name, emblemUrl, workspaceId }).onConflictDoNothing();
  revalidatePath("/admin/teams");
}

export async function updateTeamAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  const workspaceId = await requireOwnedTeam(id);
  const fixedTeam = await db.select({
    isFixedHomeTeam: teams.isFixedHomeTeam,
    name: teams.name,
  }).from(teams)
    .where(and(eq(teams.id, id), eq(teams.workspaceId, workspaceId))).limit(1);
  const name = fixedTeam[0]?.isFixedHomeTeam
    ? fixedTeam[0].name
    : optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("The team name must be at least 2 characters long.");
  }

  const emblemUrl = optionalImageUrl(formData.get("emblemUrl"), "The crest");

  await db
    .update(teams)
    .set({
      name,
      emblemUrl,
    })
    .where(and(eq(teams.id, id), eq(teams.workspaceId, workspaceId)));
  revalidatePath("/admin/teams");
  revalidatePath("/admin/players");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function deleteTeamAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  const workspaceId = await requireMutableTeam(id);
  await db.delete(teams).where(and(eq(teams.id, id), eq(teams.workspaceId, workspaceId)));
  revalidatePath("/admin/teams");
  revalidatePath("/admin/players");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function assignTeamCompetitionAction(formData: FormData) {
  const teamId = toRequiredId(formData.get("teamId"));
  const competitionId = toRequiredId(formData.get("competitionId"));
  await Promise.all([requireOwnedTeam(teamId), requireOwnedCompetition(competitionId)]);

  await db
    .insert(teamCompetitions)
    .values({ teamId, competitionId })
    .onConflictDoNothing();

  revalidatePath("/admin/teams");
  revalidatePath("/admin/stats");
}

export async function removeTeamCompetitionAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  const workspaceId = await getAdminWorkspaceId();
  const ownedLink = await db.select({ id: teamCompetitions.id }).from(teamCompetitions)
    .innerJoin(teams, eq(teamCompetitions.teamId, teams.id))
    .where(and(eq(teamCompetitions.id, id), eq(teams.workspaceId, workspaceId))).limit(1);
  if (!ownedLink[0]) throw new Error("Invalid association.");
  await db.delete(teamCompetitions).where(eq(teamCompetitions.id, id));
  revalidatePath("/admin/teams");
  revalidatePath("/admin/competitions");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function createPlayerAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 140);
  const teamId = await getFixedHomeTeamId();
  if (!name || name.length < 2) {
    throw new Error("The player name must be at least 2 characters long.");
  }

  const photo = optionalImageUrl(formData.get("photo"), "A photo");

  await db.insert(players).values({
    name,
    teamId,
    photo,
    height: optionalInt(formData.get("height")),
    weight: optionalInt(formData.get("weight")),
    nationality: optionalText(formData.get("nationality"), 100),
    agent: optionalText(formData.get("agent"), 120),
    position1: optionalText(formData.get("position1"), 40),
    position2: optionalText(formData.get("position2"), 40),
    position3: optionalText(formData.get("position3"), 40),
    isGoalkeeper: formData.get("isGoalkeeper") === "on",
  });

  revalidatePath("/admin/players");
  revalidatePath("/admin/stats");
}

export async function updatePlayerAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  const name = optionalText(formData.get("name"), 140);
  const teamId = await getFixedHomeTeamId();
  await requireOwnedPlayer(id);
  if (!name || name.length < 2) {
    throw new Error("The player name must be at least 2 characters long.");
  }

  const photo = optionalImageUrl(formData.get("photo"), "A photo");

  await db
    .update(players)
    .set({
      name,
      teamId,
      photo,
      height: optionalInt(formData.get("height")),
      weight: optionalInt(formData.get("weight")),
      nationality: optionalText(formData.get("nationality"), 100),
      agent: optionalText(formData.get("agent"), 120),
      position1: optionalText(formData.get("position1"), 40),
      position2: optionalText(formData.get("position2"), 40),
      position3: optionalText(formData.get("position3"), 40),
      isGoalkeeper: formData.get("isGoalkeeper") === "on",
    })
    .where(eq(players.id, id));

  revalidatePath("/admin/players");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function deletePlayerAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  await requireOwnedPlayer(id);
  await db.delete(players).where(eq(players.id, id));
  revalidatePath("/admin/players");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

function toRequiredHomeAway(value: FormDataEntryValue | null): "home" | "away" {
  if (value === "home" || value === "away") {
    return value;
  }
  throw new Error("Home/Away must be either 'home' or 'away'.");
}

function toRequiredDateString(value: FormDataEntryValue | null): string {
  if (!value) {
    throw new Error("The match date is required.");
  }
  const parsed = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed)) {
    throw new Error("The date must use the YYYY-MM-DD format.");
  }
  return parsed;
}

export async function createMatchAction(formData: FormData) {
  const matchdayNumber = toRequiredId(formData.get("matchdayNumber"));
  const competitionId = toRequiredId(formData.get("competitionId"));
  const opponentTeamId = toRequiredId(formData.get("opponentTeamId"));
  await Promise.all([requireOwnedCompetition(competitionId), requireOpponentTeam(opponentTeamId)]);
  const homeAway = "home" as const;
  const date = toRequiredDateString(formData.get("date"));

  await db
    .insert(matches)
    .values({ matchdayNumber, roundName: String(matchdayNumber), competitionId, opponentTeamId, homeAway, date })
    .onConflictDoNothing();

  revalidatePath("/admin/matches");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function updateMatchAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  const matchdayNumber = toRequiredId(formData.get("matchdayNumber"));
  const competitionId = toRequiredId(formData.get("competitionId"));
  const opponentTeamId = toRequiredId(formData.get("opponentTeamId"));
  await Promise.all([requireOwnedMatch(id), requireOwnedCompetition(competitionId), requireOpponentTeam(opponentTeamId)]);
  const homeAway = "home" as const;
  const date = toRequiredDateString(formData.get("date"));

  await db
    .update(matches)
    .set({ matchdayNumber, roundName: String(matchdayNumber), competitionId, opponentTeamId, homeAway, date })
    .where(eq(matches.id, id));

  revalidatePath("/admin/matches");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function deleteMatchAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  await requireOwnedMatch(id);
  await db.delete(matches).where(eq(matches.id, id));
  revalidatePath("/admin/matches");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function upsertPlayerStatsAction(formData: FormData) {
  const data = parseOutfieldStats(formData);
  if (!data.playerId) {
    throw new Error("A player is required.");
  }
  const [, match] = await Promise.all([requireOwnedPlayer(data.playerId), requireOwnedMatch(data.matchId)]);
  requireManualStatsMatch(match);

  await db
    .insert(playerMatchStats)
    .values({
      playerId: data.playerId,
      matchId: data.matchId,
      minutesPlayed: data.minutesPlayed,
      shortPassSuccess: data.shortPassSuccess,
      shortPassFail: data.shortPassFail,
      longPassSuccess: data.longPassSuccess,
      longPassFail: data.longPassFail,
      crossSuccess: data.crossSuccess,
      crossFail: data.crossFail,
      dribbleSuccess: data.dribbleSuccess,
      dribbleFail: data.dribbleFail,
      throwSuccess: data.throwSuccess,
      throwFail: data.throwFail,
      shotsOnTarget: data.shotsOnTarget,
      shotsOffTarget: data.shotsOffTarget,
      aerialDuelSuccess: data.aerialDuelSuccess,
      aerialDuelFail: data.aerialDuelFail,
      defensiveDuelSuccess: data.defensiveDuelSuccess,
      defensiveDuelFail: data.defensiveDuelFail,
      defensivePositioningToCorrect: data.defensivePositioningToCorrect,
      throughPasses: data.throughPasses,
      runsInBehind: data.runsInBehind,
      setPieceCrossSuccess: data.setPieceCrossSuccess,
      setPieceCrossFail: data.setPieceCrossFail,
      interceptedCrosses: data.interceptedCrosses,
      goals: data.goals,
      assists: data.assists,
      foulsSuffered: data.foulsSuffered,
      foulsCommitted: data.foulsCommitted,
      recoveries: data.recoveries,
      interceptions: data.interceptions,
      offsides: data.offsides,
      possessionLosses: data.possessionLosses,
      responsibilityGoal: data.responsibilityGoal,
      yellowCards: data.yellowCards,
      redCards: data.redCards,
    })
    .onConflictDoUpdate({
      target: [playerMatchStats.playerId, playerMatchStats.matchId],
      set: {
        minutesPlayed: data.minutesPlayed,
        shortPassSuccess: data.shortPassSuccess,
        shortPassFail: data.shortPassFail,
        longPassSuccess: data.longPassSuccess,
        longPassFail: data.longPassFail,
        crossSuccess: data.crossSuccess,
        crossFail: data.crossFail,
        dribbleSuccess: data.dribbleSuccess,
        dribbleFail: data.dribbleFail,
        throwSuccess: data.throwSuccess,
        throwFail: data.throwFail,
        shotsOnTarget: data.shotsOnTarget,
        shotsOffTarget: data.shotsOffTarget,
        aerialDuelSuccess: data.aerialDuelSuccess,
        aerialDuelFail: data.aerialDuelFail,
        defensiveDuelSuccess: data.defensiveDuelSuccess,
        defensiveDuelFail: data.defensiveDuelFail,
        defensivePositioningToCorrect: data.defensivePositioningToCorrect,
        throughPasses: data.throughPasses,
        runsInBehind: data.runsInBehind,
        setPieceCrossSuccess: data.setPieceCrossSuccess,
        setPieceCrossFail: data.setPieceCrossFail,
        interceptedCrosses: data.interceptedCrosses,
        goals: data.goals,
        assists: data.assists,
        foulsSuffered: data.foulsSuffered,
        foulsCommitted: data.foulsCommitted,
        recoveries: data.recoveries,
        interceptions: data.interceptions,
        offsides: data.offsides,
        possessionLosses: data.possessionLosses,
        responsibilityGoal: data.responsibilityGoal,
        yellowCards: data.yellowCards,
        redCards: data.redCards,
      },
    });

  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function upsertGoalkeeperStatsAction(formData: FormData) {
  const data = parseGoalkeeperStats(formData);
  const [, match] = await Promise.all([requireOwnedPlayer(data.playerId), requireOwnedMatch(data.matchId)]);
  requireManualStatsMatch(match);

  await db
    .insert(goalkeeperMatchStats)
    .values({
      playerId: data.playerId,
      matchId: data.matchId,
      minutesPlayed: data.minutesPlayed,
      saves: data.saves,
      incompleteSaves: data.incompleteSaves,
      shotsConceded: data.shotsConceded,
      goalsConceded: data.goalsConceded,
    })
    .onConflictDoUpdate({
      target: [goalkeeperMatchStats.playerId, goalkeeperMatchStats.matchId],
      set: {
        minutesPlayed: data.minutesPlayed,
        saves: data.saves,
        incompleteSaves: data.incompleteSaves,
        shotsConceded: data.shotsConceded,
        goalsConceded: data.goalsConceded,
      },
    });

  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function upsertTeamStatsAction(formData: FormData) {
  const data = parseOutfieldStats(formData);
  if (!data.teamId) {
    throw new Error("A team is required.");
  }
  const [, match] = await Promise.all([requireOwnedTeam(data.teamId), requireOwnedMatch(data.matchId)]);
  requireManualStatsMatch(match);

  await db
    .insert(teamMatchStats)
    .values({
      teamId: data.teamId,
      matchId: data.matchId,
      minutesPlayed: data.minutesPlayed,
      shortPassSuccess: data.shortPassSuccess,
      shortPassFail: data.shortPassFail,
      longPassSuccess: data.longPassSuccess,
      longPassFail: data.longPassFail,
      crossSuccess: data.crossSuccess,
      crossFail: data.crossFail,
      dribbleSuccess: data.dribbleSuccess,
      dribbleFail: data.dribbleFail,
      throwSuccess: data.throwSuccess,
      throwFail: data.throwFail,
      shotsOnTarget: data.shotsOnTarget,
      shotsOffTarget: data.shotsOffTarget,
      aerialDuelSuccess: data.aerialDuelSuccess,
      aerialDuelFail: data.aerialDuelFail,
      defensiveDuelSuccess: data.defensiveDuelSuccess,
      defensiveDuelFail: data.defensiveDuelFail,
      defensivePositioningToCorrect: data.defensivePositioningToCorrect,
      throughPasses: data.throughPasses,
      runsInBehind: data.runsInBehind,
      setPieceCrossSuccess: data.setPieceCrossSuccess,
      setPieceCrossFail: data.setPieceCrossFail,
      interceptedCrosses: data.interceptedCrosses,
      goals: data.goals,
      assists: data.assists,
      foulsSuffered: data.foulsSuffered,
      foulsCommitted: data.foulsCommitted,
      recoveries: data.recoveries,
      interceptions: data.interceptions,
      offsides: data.offsides,
      possessionLosses: data.possessionLosses,
      responsibilityGoal: data.responsibilityGoal,
      yellowCards: data.yellowCards,
      redCards: data.redCards,
    })
    .onConflictDoUpdate({
      target: [teamMatchStats.teamId, teamMatchStats.matchId],
      set: {
        minutesPlayed: data.minutesPlayed,
        shortPassSuccess: data.shortPassSuccess,
        shortPassFail: data.shortPassFail,
        longPassSuccess: data.longPassSuccess,
        longPassFail: data.longPassFail,
        crossSuccess: data.crossSuccess,
        crossFail: data.crossFail,
        dribbleSuccess: data.dribbleSuccess,
        dribbleFail: data.dribbleFail,
        throwSuccess: data.throwSuccess,
        throwFail: data.throwFail,
        shotsOnTarget: data.shotsOnTarget,
        shotsOffTarget: data.shotsOffTarget,
        aerialDuelSuccess: data.aerialDuelSuccess,
        aerialDuelFail: data.aerialDuelFail,
        defensiveDuelSuccess: data.defensiveDuelSuccess,
        defensiveDuelFail: data.defensiveDuelFail,
        defensivePositioningToCorrect: data.defensivePositioningToCorrect,
        throughPasses: data.throughPasses,
        runsInBehind: data.runsInBehind,
        setPieceCrossSuccess: data.setPieceCrossSuccess,
        setPieceCrossFail: data.setPieceCrossFail,
        interceptedCrosses: data.interceptedCrosses,
        goals: data.goals,
        assists: data.assists,
        foulsSuffered: data.foulsSuffered,
        foulsCommitted: data.foulsCommitted,
        recoveries: data.recoveries,
        interceptions: data.interceptions,
        offsides: data.offsides,
        possessionLosses: data.possessionLosses,
        responsibilityGoal: data.responsibilityGoal,
        yellowCards: data.yellowCards,
        redCards: data.redCards,
      },
    });

  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}
