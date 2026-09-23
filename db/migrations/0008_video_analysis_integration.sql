ALTER TABLE "workspaces" ADD COLUMN "video_analysis_workspace_id" varchar(191);
ALTER TABLE "seasons" ADD COLUMN "video_analysis_id" varchar(191);
ALTER TABLE "competitions" ADD COLUMN "video_analysis_id" varchar(191);
ALTER TABLE "teams" ADD COLUMN "video_analysis_id" varchar(191);
ALTER TABLE "players" ADD COLUMN "video_analysis_id" varchar(191);
ALTER TABLE "matches" ADD COLUMN "round_name" varchar(120);
ALTER TABLE "matches" ADD COLUMN "video_analysis_id" varchar(191);
ALTER TABLE "matches" ADD COLUMN "video_analysis_synced_at" timestamp with time zone;

DROP INDEX IF EXISTS "matches_matchday_competition_unique";

CREATE UNIQUE INDEX "workspaces_video_analysis_workspace_unique" ON "workspaces" ("video_analysis_workspace_id");
CREATE UNIQUE INDEX "seasons_video_analysis_id_unique" ON "seasons" ("video_analysis_id");
CREATE UNIQUE INDEX "competitions_video_analysis_id_unique" ON "competitions" ("video_analysis_id");
CREATE UNIQUE INDEX "teams_video_analysis_id_unique" ON "teams" ("video_analysis_id");
CREATE UNIQUE INDEX "players_video_analysis_id_unique" ON "players" ("video_analysis_id");
CREATE UNIQUE INDEX "matches_video_analysis_id_unique" ON "matches" ("video_analysis_id");
