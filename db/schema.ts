import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const createOutfieldStatColumns = () => ({
  minutesPlayed: integer("minutes_played").notNull().default(0),
  shortPassSuccess: integer("short_pass_success").notNull().default(0),
  shortPassFail: integer("short_pass_fail").notNull().default(0),
  longPassSuccess: integer("long_pass_success").notNull().default(0),
  longPassFail: integer("long_pass_fail").notNull().default(0),
  crossSuccess: integer("cross_success").notNull().default(0),
  crossFail: integer("cross_fail").notNull().default(0),
  dribbleSuccess: integer("dribble_success").notNull().default(0),
  dribbleFail: integer("dribble_fail").notNull().default(0),
  throwSuccess: integer("throw_success").notNull().default(0),
  throwFail: integer("throw_fail").notNull().default(0),
  shotsOnTarget: integer("shots_on_target").notNull().default(0),
  shotsOffTarget: integer("shots_off_target").notNull().default(0),
  aerialDuelSuccess: integer("aerial_duel_success").notNull().default(0),
  aerialDuelFail: integer("aerial_duel_fail").notNull().default(0),
  defensiveDuelSuccess: integer("defensive_duel_success").notNull().default(0),
  defensiveDuelFail: integer("defensive_duel_fail").notNull().default(0),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  foulsSuffered: integer("fouls_suffered").notNull().default(0),
  foulsCommitted: integer("fouls_committed").notNull().default(0),
  recoveries: integer("recoveries").notNull().default(0),
  interceptions: integer("interceptions").notNull().default(0),
  offsides: integer("offsides").notNull().default(0),
  possessionLosses: integer("possession_losses").notNull().default(0),
  responsibilityGoal: integer("responsibility_goal").notNull().default(0),
  yellowCards: integer("yellow_cards").notNull().default(0),
  redCards: integer("red_cards").notNull().default(0),
});

const createGoalkeeperStatColumns = () => ({
  minutesPlayed: integer("minutes_played").notNull().default(0),
  saves: integer("saves").notNull().default(0),
  incompleteSaves: integer("incomplete_saves").notNull().default(0),
  shotsConceded: integer("shots_conceded").notNull().default(0),
  goalsConceded: integer("goals_conceded").notNull().default(0),
});

export const homeAwayEnum = pgEnum("home_away", ["home", "away"]);

export const seasons = pgTable(
  "seasons",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex("seasons_name_unique").on(table.name),
  }),
);

export const competitions = pgTable(
  "competitions",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
  },
  (table) => ({
    seasonIdx: index("competitions_season_id_idx").on(table.seasonId),
    nameSeasonUnique: uniqueIndex("competitions_name_season_unique").on(
      table.name,
      table.seasonId,
    ),
  }),
);

export const teams = pgTable(
  "teams",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    emblemUrl: text("emblem_url"),
  },
  (table) => ({
    nameUnique: uniqueIndex("teams_name_unique").on(table.name),
  }),
);

export const teamCompetitions = pgTable(
  "team_competitions",
  {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    competitionId: integer("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
  },
  (table) => ({
    teamIdx: index("team_competitions_team_id_idx").on(table.teamId),
    competitionIdx: index("team_competitions_competition_id_idx").on(
      table.competitionId,
    ),
    teamCompetitionUnique: uniqueIndex("team_competitions_unique").on(
      table.teamId,
      table.competitionId,
    ),
  }),
);

export const players = pgTable(
  "players",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 140 }).notNull(),
    photo: text("photo"),
    height: integer("height"),
    weight: integer("weight"),
    nationality: varchar("nationality", { length: 100 }),
    agent: varchar("agent", { length: 120 }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    position1: varchar("position1", { length: 40 }),
    position2: varchar("position2", { length: 40 }),
    position3: varchar("position3", { length: 40 }),
    isGoalkeeper: boolean("is_goalkeeper").notNull().default(false),
  },
  (table) => ({
    teamIdx: index("players_team_id_idx").on(table.teamId),
    keeperIdx: index("players_is_goalkeeper_idx").on(table.isGoalkeeper),
  }),
);

export const matches = pgTable(
  "matches",
  {
    id: serial("id").primaryKey(),
    matchdayNumber: integer("matchday_number").notNull(),
    competitionId: integer("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    opponentTeamId: integer("opponent_team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    homeAway: homeAwayEnum("home_away").notNull(),
    date: date("date", { mode: "string" }).notNull(),
  },
  (table) => ({
    competitionIdx: index("matches_competition_id_idx").on(table.competitionId),
    opponentIdx: index("matches_opponent_team_id_idx").on(table.opponentTeamId),
    dateIdx: index("matches_date_idx").on(table.date),
    matchdayCompetitionUnique: uniqueIndex("matches_matchday_competition_unique").on(
      table.matchdayNumber,
      table.competitionId,
    ),
  }),
);

export const playerMatchStats = pgTable(
  "player_match_stats",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    matchId: integer("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    ...createOutfieldStatColumns(),
  },
  (table) => ({
    playerIdx: index("player_match_stats_player_id_idx").on(table.playerId),
    matchIdx: index("player_match_stats_match_id_idx").on(table.matchId),
    playerMatchUnique: uniqueIndex("player_match_stats_player_match_unique").on(
      table.playerId,
      table.matchId,
    ),
  }),
);

export const goalkeeperMatchStats = pgTable(
  "goalkeeper_match_stats",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    matchId: integer("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    ...createGoalkeeperStatColumns(),
  },
  (table) => ({
    playerIdx: index("goalkeeper_match_stats_player_id_idx").on(table.playerId),
    matchIdx: index("goalkeeper_match_stats_match_id_idx").on(table.matchId),
    playerMatchUnique: uniqueIndex("goalkeeper_match_stats_player_match_unique").on(
      table.playerId,
      table.matchId,
    ),
  }),
);

export const teamMatchStats = pgTable(
  "team_match_stats",
  {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    matchId: integer("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    ...createOutfieldStatColumns(),
  },
  (table) => ({
    teamIdx: index("team_match_stats_team_id_idx").on(table.teamId),
    matchIdx: index("team_match_stats_match_id_idx").on(table.matchId),
    teamMatchUnique: uniqueIndex("team_match_stats_team_match_unique").on(
      table.teamId,
      table.matchId,
    ),
  }),
);

export const seasonsRelations = relations(seasons, ({ many }) => ({
  competitions: many(competitions),
}));

export const competitionsRelations = relations(competitions, ({ one, many }) => ({
  season: one(seasons, {
    fields: [competitions.seasonId],
    references: [seasons.id],
  }),
  matches: many(matches),
  teamCompetitions: many(teamCompetitions),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  players: many(players),
  teamCompetitions: many(teamCompetitions),
  teamMatchStats: many(teamMatchStats),
  opponentMatches: many(matches),
}));

export const teamCompetitionsRelations = relations(
  teamCompetitions,
  ({ one }) => ({
    team: one(teams, {
      fields: [teamCompetitions.teamId],
      references: [teams.id],
    }),
    competition: one(competitions, {
      fields: [teamCompetitions.competitionId],
      references: [competitions.id],
    }),
  }),
);

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  playerMatchStats: many(playerMatchStats),
  goalkeeperMatchStats: many(goalkeeperMatchStats),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  competition: one(competitions, {
    fields: [matches.competitionId],
    references: [competitions.id],
  }),
  opponentTeam: one(teams, {
    fields: [matches.opponentTeamId],
    references: [teams.id],
  }),
  playerMatchStats: many(playerMatchStats),
  goalkeeperMatchStats: many(goalkeeperMatchStats),
  teamMatchStats: many(teamMatchStats),
}));

export const playerMatchStatsRelations = relations(
  playerMatchStats,
  ({ one }) => ({
    player: one(players, {
      fields: [playerMatchStats.playerId],
      references: [players.id],
    }),
    match: one(matches, {
      fields: [playerMatchStats.matchId],
      references: [matches.id],
    }),
  }),
);

export const goalkeeperMatchStatsRelations = relations(
  goalkeeperMatchStats,
  ({ one }) => ({
    player: one(players, {
      fields: [goalkeeperMatchStats.playerId],
      references: [players.id],
    }),
    match: one(matches, {
      fields: [goalkeeperMatchStats.matchId],
      references: [matches.id],
    }),
  }),
);

export const teamMatchStatsRelations = relations(teamMatchStats, ({ one }) => ({
  team: one(teams, {
    fields: [teamMatchStats.teamId],
    references: [teams.id],
  }),
  match: one(matches, {
    fields: [teamMatchStats.matchId],
    references: [matches.id],
  }),
}));

export type Season = typeof seasons.$inferSelect;
export type Competition = typeof competitions.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamCompetition = typeof teamCompetitions.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type PlayerMatchStats = typeof playerMatchStats.$inferSelect;
export type GoalkeeperMatchStats = typeof goalkeeperMatchStats.$inferSelect;
export type TeamMatchStats = typeof teamMatchStats.$inferSelect;

export type NewSeason = typeof seasons.$inferInsert;
export type NewCompetition = typeof competitions.$inferInsert;
export type NewTeam = typeof teams.$inferInsert;
export type NewTeamCompetition = typeof teamCompetitions.$inferInsert;
export type NewPlayer = typeof players.$inferInsert;
export type NewMatch = typeof matches.$inferInsert;
export type NewPlayerMatchStats = typeof playerMatchStats.$inferInsert;
export type NewGoalkeeperMatchStats = typeof goalkeeperMatchStats.$inferInsert;
export type NewTeamMatchStats = typeof teamMatchStats.$inferInsert;
