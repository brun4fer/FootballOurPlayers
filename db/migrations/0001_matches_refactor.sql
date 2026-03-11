DO $$ BEGIN
 CREATE TYPE "public"."home_away" AS ENUM('home', 'away');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "matchdays" RENAME TO "matches";
--> statement-breakpoint
ALTER TABLE "matches" RENAME COLUMN "number" TO "matchday_number";
--> statement-breakpoint
ALTER TABLE "player_match_stats" RENAME COLUMN "matchday_id" TO "match_id";
--> statement-breakpoint
ALTER TABLE "goalkeeper_match_stats" RENAME COLUMN "matchday_id" TO "match_id";
--> statement-breakpoint
ALTER TABLE "team_match_stats" RENAME COLUMN "matchday_id" TO "match_id";
--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "opponent_team_id" integer;
--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "home_away" "home_away";
--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "date" date;
--> statement-breakpoint
UPDATE "matches"
SET "opponent_team_id" = (
  SELECT "id"
  FROM "teams"
  WHERE lower("name") <> 'feirense'
  ORDER BY "id"
  LIMIT 1
)
WHERE "opponent_team_id" IS NULL;
--> statement-breakpoint
UPDATE "matches"
SET "opponent_team_id" = (
  SELECT "id"
  FROM "teams"
  ORDER BY "id"
  LIMIT 1
)
WHERE "opponent_team_id" IS NULL;
--> statement-breakpoint
UPDATE "matches" SET "home_away" = 'home' WHERE "home_away" IS NULL;
--> statement-breakpoint
UPDATE "matches" SET "date" = CURRENT_DATE WHERE "date" IS NULL;
--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "opponent_team_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "home_away" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "date" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matchdays_competition_id_competitions_id_fk";
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_opponent_team_id_teams_id_fk" FOREIGN KEY ("opponent_team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "player_match_stats" DROP CONSTRAINT IF EXISTS "player_match_stats_matchday_id_matchdays_id_fk";
--> statement-breakpoint
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "goalkeeper_match_stats" DROP CONSTRAINT IF EXISTS "goalkeeper_match_stats_matchday_id_matchdays_id_fk";
--> statement-breakpoint
ALTER TABLE "goalkeeper_match_stats" ADD CONSTRAINT "goalkeeper_match_stats_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "team_match_stats" DROP CONSTRAINT IF EXISTS "team_match_stats_matchday_id_matchdays_id_fk";
--> statement-breakpoint
ALTER TABLE "team_match_stats" ADD CONSTRAINT "team_match_stats_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
DROP INDEX IF EXISTS "matchdays_competition_id_idx";
--> statement-breakpoint
DROP INDEX IF EXISTS "matchdays_number_competition_unique";
--> statement-breakpoint
CREATE INDEX "matches_competition_id_idx" ON "matches" USING btree ("competition_id");
--> statement-breakpoint
CREATE INDEX "matches_opponent_team_id_idx" ON "matches" USING btree ("opponent_team_id");
--> statement-breakpoint
CREATE INDEX "matches_date_idx" ON "matches" USING btree ("date");
--> statement-breakpoint
CREATE UNIQUE INDEX "matches_matchday_competition_unique" ON "matches" USING btree ("matchday_number","competition_id");
--> statement-breakpoint
DROP INDEX IF EXISTS "player_match_stats_matchday_id_idx";
--> statement-breakpoint
DROP INDEX IF EXISTS "player_match_stats_player_matchday_unique";
--> statement-breakpoint
CREATE INDEX "player_match_stats_match_id_idx" ON "player_match_stats" USING btree ("match_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "player_match_stats_player_match_unique" ON "player_match_stats" USING btree ("player_id","match_id");
--> statement-breakpoint
DROP INDEX IF EXISTS "goalkeeper_match_stats_matchday_id_idx";
--> statement-breakpoint
DROP INDEX IF EXISTS "goalkeeper_match_stats_player_matchday_unique";
--> statement-breakpoint
CREATE INDEX "goalkeeper_match_stats_match_id_idx" ON "goalkeeper_match_stats" USING btree ("match_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "goalkeeper_match_stats_player_match_unique" ON "goalkeeper_match_stats" USING btree ("player_id","match_id");
--> statement-breakpoint
DROP INDEX IF EXISTS "team_match_stats_matchday_id_idx";
--> statement-breakpoint
DROP INDEX IF EXISTS "team_match_stats_team_matchday_unique";
--> statement-breakpoint
CREATE INDEX "team_match_stats_match_id_idx" ON "team_match_stats" USING btree ("match_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "team_match_stats_team_match_unique" ON "team_match_stats" USING btree ("team_id","match_id");
