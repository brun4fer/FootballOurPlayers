CREATE TABLE "competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"season_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goalkeeper_match_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"matchday_id" integer NOT NULL,
	"minutes_played" integer DEFAULT 0 NOT NULL,
	"saves" integer DEFAULT 0 NOT NULL,
	"incomplete_saves" integer DEFAULT 0 NOT NULL,
	"shots_conceded" integer DEFAULT 0 NOT NULL,
	"goals_conceded" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matchdays" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"competition_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_match_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"matchday_id" integer NOT NULL,
	"minutes_played" integer DEFAULT 0 NOT NULL,
	"short_pass_success" integer DEFAULT 0 NOT NULL,
	"short_pass_fail" integer DEFAULT 0 NOT NULL,
	"long_pass_success" integer DEFAULT 0 NOT NULL,
	"long_pass_fail" integer DEFAULT 0 NOT NULL,
	"cross_success" integer DEFAULT 0 NOT NULL,
	"cross_fail" integer DEFAULT 0 NOT NULL,
	"dribble_success" integer DEFAULT 0 NOT NULL,
	"dribble_fail" integer DEFAULT 0 NOT NULL,
	"throw_success" integer DEFAULT 0 NOT NULL,
	"throw_fail" integer DEFAULT 0 NOT NULL,
	"shots_on_target" integer DEFAULT 0 NOT NULL,
	"shots_off_target" integer DEFAULT 0 NOT NULL,
	"aerial_duel_success" integer DEFAULT 0 NOT NULL,
	"aerial_duel_fail" integer DEFAULT 0 NOT NULL,
	"defensive_duel_success" integer DEFAULT 0 NOT NULL,
	"defensive_duel_fail" integer DEFAULT 0 NOT NULL,
	"goals" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL,
	"fouls_suffered" integer DEFAULT 0 NOT NULL,
	"fouls_committed" integer DEFAULT 0 NOT NULL,
	"recoveries" integer DEFAULT 0 NOT NULL,
	"interceptions" integer DEFAULT 0 NOT NULL,
	"offsides" integer DEFAULT 0 NOT NULL,
	"possession_losses" integer DEFAULT 0 NOT NULL,
	"responsibility_goal" integer DEFAULT 0 NOT NULL,
	"yellow_cards" integer DEFAULT 0 NOT NULL,
	"red_cards" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(140) NOT NULL,
	"photo" text,
	"height" integer,
	"weight" integer,
	"nationality" varchar(100),
	"agent" varchar(120),
	"team_id" integer NOT NULL,
	"position1" varchar(40),
	"position2" varchar(40),
	"position3" varchar(40),
	"is_goalkeeper" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"competition_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_match_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"matchday_id" integer NOT NULL,
	"minutes_played" integer DEFAULT 0 NOT NULL,
	"short_pass_success" integer DEFAULT 0 NOT NULL,
	"short_pass_fail" integer DEFAULT 0 NOT NULL,
	"long_pass_success" integer DEFAULT 0 NOT NULL,
	"long_pass_fail" integer DEFAULT 0 NOT NULL,
	"cross_success" integer DEFAULT 0 NOT NULL,
	"cross_fail" integer DEFAULT 0 NOT NULL,
	"dribble_success" integer DEFAULT 0 NOT NULL,
	"dribble_fail" integer DEFAULT 0 NOT NULL,
	"throw_success" integer DEFAULT 0 NOT NULL,
	"throw_fail" integer DEFAULT 0 NOT NULL,
	"shots_on_target" integer DEFAULT 0 NOT NULL,
	"shots_off_target" integer DEFAULT 0 NOT NULL,
	"aerial_duel_success" integer DEFAULT 0 NOT NULL,
	"aerial_duel_fail" integer DEFAULT 0 NOT NULL,
	"defensive_duel_success" integer DEFAULT 0 NOT NULL,
	"defensive_duel_fail" integer DEFAULT 0 NOT NULL,
	"goals" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL,
	"fouls_suffered" integer DEFAULT 0 NOT NULL,
	"fouls_committed" integer DEFAULT 0 NOT NULL,
	"recoveries" integer DEFAULT 0 NOT NULL,
	"interceptions" integer DEFAULT 0 NOT NULL,
	"offsides" integer DEFAULT 0 NOT NULL,
	"possession_losses" integer DEFAULT 0 NOT NULL,
	"responsibility_goal" integer DEFAULT 0 NOT NULL,
	"yellow_cards" integer DEFAULT 0 NOT NULL,
	"red_cards" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalkeeper_match_stats" ADD CONSTRAINT "goalkeeper_match_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalkeeper_match_stats" ADD CONSTRAINT "goalkeeper_match_stats_matchday_id_matchdays_id_fk" FOREIGN KEY ("matchday_id") REFERENCES "public"."matchdays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matchdays" ADD CONSTRAINT "matchdays_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_matchday_id_matchdays_id_fk" FOREIGN KEY ("matchday_id") REFERENCES "public"."matchdays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_competitions" ADD CONSTRAINT "team_competitions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_competitions" ADD CONSTRAINT "team_competitions_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_match_stats" ADD CONSTRAINT "team_match_stats_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_match_stats" ADD CONSTRAINT "team_match_stats_matchday_id_matchdays_id_fk" FOREIGN KEY ("matchday_id") REFERENCES "public"."matchdays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "competitions_season_id_idx" ON "competitions" USING btree ("season_id");--> statement-breakpoint
CREATE UNIQUE INDEX "competitions_name_season_unique" ON "competitions" USING btree ("name","season_id");--> statement-breakpoint
CREATE INDEX "goalkeeper_match_stats_player_id_idx" ON "goalkeeper_match_stats" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "goalkeeper_match_stats_matchday_id_idx" ON "goalkeeper_match_stats" USING btree ("matchday_id");--> statement-breakpoint
CREATE UNIQUE INDEX "goalkeeper_match_stats_player_matchday_unique" ON "goalkeeper_match_stats" USING btree ("player_id","matchday_id");--> statement-breakpoint
CREATE INDEX "matchdays_competition_id_idx" ON "matchdays" USING btree ("competition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "matchdays_number_competition_unique" ON "matchdays" USING btree ("number","competition_id");--> statement-breakpoint
CREATE INDEX "player_match_stats_player_id_idx" ON "player_match_stats" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "player_match_stats_matchday_id_idx" ON "player_match_stats" USING btree ("matchday_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_match_stats_player_matchday_unique" ON "player_match_stats" USING btree ("player_id","matchday_id");--> statement-breakpoint
CREATE INDEX "players_team_id_idx" ON "players" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "players_is_goalkeeper_idx" ON "players" USING btree ("is_goalkeeper");--> statement-breakpoint
CREATE UNIQUE INDEX "seasons_name_unique" ON "seasons" USING btree ("name");--> statement-breakpoint
CREATE INDEX "team_competitions_team_id_idx" ON "team_competitions" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_competitions_competition_id_idx" ON "team_competitions" USING btree ("competition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_competitions_unique" ON "team_competitions" USING btree ("team_id","competition_id");--> statement-breakpoint
CREATE INDEX "team_match_stats_team_id_idx" ON "team_match_stats" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_match_stats_matchday_id_idx" ON "team_match_stats" USING btree ("matchday_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_match_stats_team_matchday_unique" ON "team_match_stats" USING btree ("team_id","matchday_id");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_name_unique" ON "teams" USING btree ("name");