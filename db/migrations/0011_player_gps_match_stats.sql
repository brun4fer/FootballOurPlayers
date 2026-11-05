CREATE TABLE "player_gps_match_stats" (
  "id" serial PRIMARY KEY NOT NULL,
  "workspace_id" integer NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "player_id" integer NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "match_id" integer NOT NULL REFERENCES "matches"("id") ON DELETE CASCADE,
  "minutes_played" double precision DEFAULT 0 NOT NULL,
  "total_distance" double precision DEFAULT 0 NOT NULL,
  "running_distance" double precision DEFAULT 0 NOT NULL,
  "sprint_distance" double precision DEFAULT 0 NOT NULL,
  "hsr_distance" double precision DEFAULT 0 NOT NULL,
  "maximum_speed" double precision DEFAULT 0 NOT NULL,
  "sprints" integer DEFAULT 0 NOT NULL,
  "repeated_sprints" integer DEFAULT 0 NOT NULL,
  "hsr_runs" integer DEFAULT 0 NOT NULL,
  "total_accelerations" integer DEFAULT 0 NOT NULL,
  "high_intensity_accelerations" integer DEFAULT 0 NOT NULL,
  "total_decelerations" integer DEFAULT 0 NOT NULL,
  "high_intensity_decelerations" integer DEFAULT 0 NOT NULL,
  "changes_of_direction" integer DEFAULT 0 NOT NULL
);

CREATE INDEX "player_gps_match_stats_workspace_id_idx" ON "player_gps_match_stats" ("workspace_id");
CREATE INDEX "player_gps_match_stats_player_id_idx" ON "player_gps_match_stats" ("player_id");
CREATE INDEX "player_gps_match_stats_match_id_idx" ON "player_gps_match_stats" ("match_id");
CREATE UNIQUE INDEX "player_gps_match_stats_player_match_unique" ON "player_gps_match_stats" ("player_id", "match_id");
