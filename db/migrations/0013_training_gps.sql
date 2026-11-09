CREATE TABLE "training_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"season_id" integer NOT NULL,
	"training_date" date NOT NULL,
	"microcycle_number" integer NOT NULL,
	"training_unit_number" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "training_sessions_team_season_microcycle_unit_unique" UNIQUE("team_id","season_id","microcycle_number","training_unit_number")
);
--> statement-breakpoint
CREATE TABLE "training_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_session_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	CONSTRAINT "training_participants_training_player_unique" UNIQUE("training_session_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "player_gps_training_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"training_session_id" integer NOT NULL,
	"player_id" integer NOT NULL,
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
	"changes_of_direction" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "player_gps_training_stats_player_training_unique" UNIQUE("player_id","training_session_id")
);
--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_participants" ADD CONSTRAINT "training_participants_training_session_id_training_sessions_id_fk" FOREIGN KEY ("training_session_id") REFERENCES "public"."training_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_participants" ADD CONSTRAINT "training_participants_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "player_gps_training_stats" ADD CONSTRAINT "player_gps_training_stats_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "player_gps_training_stats" ADD CONSTRAINT "player_gps_training_stats_training_session_id_training_sessions_id_fk" FOREIGN KEY ("training_session_id") REFERENCES "public"."training_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "player_gps_training_stats" ADD CONSTRAINT "player_gps_training_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "training_sessions_workspace_id_idx" ON "training_sessions" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "training_sessions_season_id_idx" ON "training_sessions" USING btree ("season_id");
--> statement-breakpoint
CREATE INDEX "training_sessions_team_id_idx" ON "training_sessions" USING btree ("team_id");
--> statement-breakpoint
CREATE INDEX "training_sessions_date_idx" ON "training_sessions" USING btree ("training_date");
--> statement-breakpoint
CREATE INDEX "training_participants_training_session_id_idx" ON "training_participants" USING btree ("training_session_id");
--> statement-breakpoint
CREATE INDEX "training_participants_player_id_idx" ON "training_participants" USING btree ("player_id");
--> statement-breakpoint
CREATE INDEX "player_gps_training_stats_workspace_id_idx" ON "player_gps_training_stats" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "player_gps_training_stats_training_session_id_idx" ON "player_gps_training_stats" USING btree ("training_session_id");
--> statement-breakpoint
CREATE INDEX "player_gps_training_stats_player_id_idx" ON "player_gps_training_stats" USING btree ("player_id");
