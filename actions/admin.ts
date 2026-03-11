"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

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

function optionalText(value: FormDataEntryValue | null, max = 255) {
  if (!value) {
    return null;
  }
  const parsed = String(value).trim();
  return parsed.length ? parsed.slice(0, max) : null;
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
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("Season name must have at least 2 characters.");
  }

  await db.insert(seasons).values({ name }).onConflictDoNothing();
  revalidatePath("/admin/seasons");
}

export async function updateSeasonAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("Season name must have at least 2 characters.");
  }

  await db.update(seasons).set({ name }).where(eq(seasons.id, id));
  revalidatePath("/admin/seasons");
}

export async function deleteSeasonAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  await db.delete(seasons).where(eq(seasons.id, id));
  revalidatePath("/admin/seasons");
  revalidatePath("/admin/competitions");
  revalidatePath("/admin/matches");
  revalidatePath("/admin/stats");
}

export async function createCompetitionAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 120);
  const seasonId = toRequiredId(formData.get("seasonId"));
  if (!name || name.length < 2) {
    throw new Error("Competition name must have at least 2 characters.");
  }

  await db
    .insert(competitions)
    .values({
      name,
      seasonId,
    })
    .onConflictDoNothing();

  revalidatePath("/admin/competitions");
  revalidatePath("/admin/matches");
}

export async function updateCompetitionAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  const name = optionalText(formData.get("name"), 120);
  const seasonId = toRequiredId(formData.get("seasonId"));
  if (!name || name.length < 2) {
    throw new Error("Competition name must have at least 2 characters.");
  }

  await db
    .update(competitions)
    .set({
      name,
      seasonId,
    })
    .where(eq(competitions.id, id));

  revalidatePath("/admin/competitions");
  revalidatePath("/admin/matches");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function deleteCompetitionAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  await db.delete(competitions).where(eq(competitions.id, id));
  revalidatePath("/admin/competitions");
  revalidatePath("/admin/matches");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function createTeamAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("Team name must have at least 2 characters.");
  }

  await db.insert(teams).values({ name }).onConflictDoNothing();
  revalidatePath("/admin/teams");
}

export async function updateTeamAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("Team name must have at least 2 characters.");
  }

  await db.update(teams).set({ name }).where(eq(teams.id, id));
  revalidatePath("/admin/teams");
  revalidatePath("/admin/players");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function deleteTeamAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  await db.delete(teams).where(eq(teams.id, id));
  revalidatePath("/admin/teams");
  revalidatePath("/admin/players");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function assignTeamCompetitionAction(formData: FormData) {
  const teamId = toRequiredId(formData.get("teamId"));
  const competitionId = toRequiredId(formData.get("competitionId"));

  await db
    .insert(teamCompetitions)
    .values({ teamId, competitionId })
    .onConflictDoNothing();

  revalidatePath("/admin/teams");
  revalidatePath("/admin/stats");
}

export async function removeTeamCompetitionAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  await db.delete(teamCompetitions).where(eq(teamCompetitions.id, id));
  revalidatePath("/admin/teams");
  revalidatePath("/admin/competitions");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function createPlayerAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 140);
  const teamId = toRequiredId(formData.get("teamId"));
  if (!name || name.length < 2) {
    throw new Error("Player name must have at least 2 characters.");
  }

  await db.insert(players).values({
    name,
    teamId,
    photo: optionalText(formData.get("photo"), 2000),
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
  const teamId = toRequiredId(formData.get("teamId"));
  if (!name || name.length < 2) {
    throw new Error("Player name must have at least 2 characters.");
  }

  await db
    .update(players)
    .set({
      name,
      teamId,
      photo: optionalText(formData.get("photo"), 2000),
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
  await db.delete(players).where(eq(players.id, id));
  revalidatePath("/admin/players");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

function toRequiredHomeAway(value: FormDataEntryValue | null): "home" | "away" {
  if (value === "home" || value === "away") {
    return value;
  }
  throw new Error("Home/Away must be home or away.");
}

function toRequiredDateString(value: FormDataEntryValue | null): string {
  if (!value) {
    throw new Error("Match date is required.");
  }
  const parsed = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed)) {
    throw new Error("Date must be in YYYY-MM-DD format.");
  }
  return parsed;
}

export async function createMatchAction(formData: FormData) {
  const matchdayNumber = toRequiredId(formData.get("matchdayNumber"));
  const competitionId = toRequiredId(formData.get("competitionId"));
  const opponentTeamId = toRequiredId(formData.get("opponentTeamId"));
  const homeAway = toRequiredHomeAway(formData.get("homeAway"));
  const date = toRequiredDateString(formData.get("date"));

  await db
    .insert(matches)
    .values({ matchdayNumber, competitionId, opponentTeamId, homeAway, date })
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
  const homeAway = toRequiredHomeAway(formData.get("homeAway"));
  const date = toRequiredDateString(formData.get("date"));

  await db
    .update(matches)
    .set({ matchdayNumber, competitionId, opponentTeamId, homeAway, date })
    .where(eq(matches.id, id));

  revalidatePath("/admin/matches");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function deleteMatchAction(formData: FormData) {
  const id = toRequiredId(formData.get("id"));
  await db.delete(matches).where(eq(matches.id, id));
  revalidatePath("/admin/matches");
  revalidatePath("/admin/stats");
  revalidatePath("/dashboard");
}

export async function upsertPlayerStatsAction(formData: FormData) {
  const data = parseOutfieldStats(formData);
  if (!data.playerId) {
    throw new Error("Player is required.");
  }

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
    throw new Error("Team is required.");
  }

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
