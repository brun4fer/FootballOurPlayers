import "dotenv/config";

import { db } from "../db";
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
} from "../db/schema";

async function seed() {
  await db.delete(teamMatchStats);
  await db.delete(goalkeeperMatchStats);
  await db.delete(playerMatchStats);
  await db.delete(matches);
  await db.delete(players);
  await db.delete(teamCompetitions);
  await db.delete(competitions);
  await db.delete(teams);
  await db.delete(seasons);

  const [season] = await db
    .insert(seasons)
    .values({ name: "2025/2026" })
    .returning({ id: seasons.id });

  const insertedCompetitions = await db
    .insert(competitions)
    .values([
      { name: "Primeira Liga", seasonId: season.id },
      { name: "Taça de Portugal", seasonId: season.id },
    ])
    .returning({ id: competitions.id, name: competitions.name });

  const primeiraLiga = insertedCompetitions.find((item) => item.name === "Primeira Liga");
  if (!primeiraLiga) {
    throw new Error("Competition seed resolution failed.");
  }

  const insertedTeams = await db
    .insert(teams)
    .values([
      { name: "Feirense" },
      { name: "SL Benfica" },
      { name: "FC Porto" },
      { name: "Sporting CP" },
    ])
    .returning({ id: teams.id, name: teams.name });

  const feirense = insertedTeams.find((team) => team.name === "Feirense");
  const benfica = insertedTeams.find((team) => team.name === "SL Benfica");
  const porto = insertedTeams.find((team) => team.name === "FC Porto");
  const sporting = insertedTeams.find((team) => team.name === "Sporting CP");
  if (!feirense || !benfica || !porto || !sporting) {
    throw new Error("Team seed resolution failed.");
  }

  await db.insert(teamCompetitions).values([
    { teamId: feirense.id, competitionId: primeiraLiga.id },
    { teamId: benfica.id, competitionId: primeiraLiga.id },
    { teamId: porto.id, competitionId: primeiraLiga.id },
    { teamId: sporting.id, competitionId: primeiraLiga.id },
  ]);

  const insertedPlayers = await db
    .insert(players)
    .values([
      {
        name: "Caio Secco",
        teamId: feirense.id,
        position1: "GK",
        isGoalkeeper: true,
        nationality: "Brazil",
      },
      {
        name: "Ruben Alves",
        teamId: feirense.id,
        position1: "CM",
        position2: "DM",
        nationality: "Portugal",
      },
      {
        name: "Fabio Ronaldo",
        teamId: feirense.id,
        position1: "RW",
        position2: "LW",
        nationality: "Portugal",
      },
      {
        name: "Vasco Rocha",
        teamId: feirense.id,
        position1: "CF",
        nationality: "Portugal",
      },
    ])
    .returning({
      id: players.id,
      name: players.name,
      isGoalkeeper: players.isGoalkeeper,
    });

  const gk = insertedPlayers.find((player) => player.name === "Caio Secco");
  const cm = insertedPlayers.find((player) => player.name === "Ruben Alves");
  const winger = insertedPlayers.find((player) => player.name === "Fabio Ronaldo");
  const striker = insertedPlayers.find((player) => player.name === "Vasco Rocha");
  if (!gk || !cm || !winger || !striker) {
    throw new Error("Player seed resolution failed.");
  }

  const insertedMatches = await db
    .insert(matches)
    .values([
      {
        matchdayNumber: 1,
        competitionId: primeiraLiga.id,
        opponentTeamId: benfica.id,
        homeAway: "home",
        date: "2025-08-10",
      },
      {
        matchdayNumber: 2,
        competitionId: primeiraLiga.id,
        opponentTeamId: porto.id,
        homeAway: "away",
        date: "2025-08-17",
      },
      {
        matchdayNumber: 3,
        competitionId: primeiraLiga.id,
        opponentTeamId: sporting.id,
        homeAway: "home",
        date: "2025-08-24",
      },
    ])
    .returning({ id: matches.id, matchdayNumber: matches.matchdayNumber });

  const match1 = insertedMatches.find((match) => match.matchdayNumber === 1);
  const match2 = insertedMatches.find((match) => match.matchdayNumber === 2);
  const match3 = insertedMatches.find((match) => match.matchdayNumber === 3);
  if (!match1 || !match2 || !match3) {
    throw new Error("Match seed resolution failed.");
  }

  await db.insert(playerMatchStats).values([
    {
      playerId: cm.id,
      matchId: match1.id,
      minutesPlayed: 90,
      shortPassSuccess: 41,
      shortPassFail: 5,
      longPassSuccess: 7,
      longPassFail: 2,
      crossSuccess: 1,
      crossFail: 1,
      dribbleSuccess: 3,
      dribbleFail: 1,
      throwSuccess: 0,
      throwFail: 0,
      shotsOnTarget: 1,
      shotsOffTarget: 1,
      aerialDuelSuccess: 2,
      aerialDuelFail: 1,
      defensiveDuelSuccess: 6,
      defensiveDuelFail: 2,
      goals: 0,
      assists: 1,
      foulsSuffered: 2,
      foulsCommitted: 1,
      recoveries: 8,
      interceptions: 4,
      offsides: 0,
      possessionLosses: 8,
      responsibilityGoal: 0,
      yellowCards: 0,
      redCards: 0,
    },
    {
      playerId: winger.id,
      matchId: match2.id,
      minutesPlayed: 84,
      shortPassSuccess: 28,
      shortPassFail: 6,
      longPassSuccess: 3,
      longPassFail: 2,
      crossSuccess: 2,
      crossFail: 3,
      dribbleSuccess: 5,
      dribbleFail: 3,
      throwSuccess: 0,
      throwFail: 0,
      shotsOnTarget: 2,
      shotsOffTarget: 2,
      aerialDuelSuccess: 1,
      aerialDuelFail: 2,
      defensiveDuelSuccess: 2,
      defensiveDuelFail: 2,
      goals: 1,
      assists: 0,
      foulsSuffered: 3,
      foulsCommitted: 1,
      recoveries: 4,
      interceptions: 2,
      offsides: 1,
      possessionLosses: 11,
      responsibilityGoal: 0,
      yellowCards: 0,
      redCards: 0,
    },
    {
      playerId: striker.id,
      matchId: match3.id,
      minutesPlayed: 90,
      shortPassSuccess: 20,
      shortPassFail: 5,
      longPassSuccess: 2,
      longPassFail: 1,
      crossSuccess: 0,
      crossFail: 0,
      dribbleSuccess: 3,
      dribbleFail: 2,
      throwSuccess: 0,
      throwFail: 0,
      shotsOnTarget: 3,
      shotsOffTarget: 1,
      aerialDuelSuccess: 5,
      aerialDuelFail: 3,
      defensiveDuelSuccess: 1,
      defensiveDuelFail: 2,
      goals: 2,
      assists: 0,
      foulsSuffered: 2,
      foulsCommitted: 2,
      recoveries: 3,
      interceptions: 1,
      offsides: 2,
      possessionLosses: 9,
      responsibilityGoal: 0,
      yellowCards: 1,
      redCards: 0,
    },
  ]);

  await db.insert(goalkeeperMatchStats).values([
    {
      playerId: gk.id,
      matchId: match1.id,
      minutesPlayed: 90,
      saves: 5,
      incompleteSaves: 1,
      shotsConceded: 6,
      goalsConceded: 1,
    },
    {
      playerId: gk.id,
      matchId: match2.id,
      minutesPlayed: 90,
      saves: 6,
      incompleteSaves: 1,
      shotsConceded: 7,
      goalsConceded: 1,
    },
  ]);

  await db.insert(teamMatchStats).values([
    {
      teamId: feirense.id,
      matchId: match1.id,
      minutesPlayed: 990,
      shortPassSuccess: 390,
      shortPassFail: 62,
      longPassSuccess: 58,
      longPassFail: 28,
      crossSuccess: 10,
      crossFail: 18,
      dribbleSuccess: 19,
      dribbleFail: 13,
      throwSuccess: 12,
      throwFail: 3,
      shotsOnTarget: 6,
      shotsOffTarget: 5,
      aerialDuelSuccess: 26,
      aerialDuelFail: 23,
      defensiveDuelSuccess: 34,
      defensiveDuelFail: 29,
      goals: 1,
      assists: 1,
      foulsSuffered: 13,
      foulsCommitted: 12,
      recoveries: 62,
      interceptions: 28,
      offsides: 1,
      possessionLosses: 82,
      responsibilityGoal: 0,
      yellowCards: 2,
      redCards: 0,
    },
    {
      teamId: feirense.id,
      matchId: match2.id,
      minutesPlayed: 990,
      shortPassSuccess: 360,
      shortPassFail: 70,
      longPassSuccess: 50,
      longPassFail: 30,
      crossSuccess: 9,
      crossFail: 22,
      dribbleSuccess: 16,
      dribbleFail: 15,
      throwSuccess: 11,
      throwFail: 2,
      shotsOnTarget: 5,
      shotsOffTarget: 7,
      aerialDuelSuccess: 24,
      aerialDuelFail: 28,
      defensiveDuelSuccess: 30,
      defensiveDuelFail: 34,
      goals: 1,
      assists: 1,
      foulsSuffered: 11,
      foulsCommitted: 14,
      recoveries: 58,
      interceptions: 26,
      offsides: 2,
      possessionLosses: 89,
      responsibilityGoal: 0,
      yellowCards: 3,
      redCards: 0,
    },
  ]);

  console.log("Seed completed successfully.");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
