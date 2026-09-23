DROP INDEX IF EXISTS "workspaces_video_analysis_workspace_unique";
ALTER TABLE "workspaces" DROP COLUMN IF EXISTS "video_analysis_workspace_id";

CREATE TABLE "video_analysis_link_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" integer NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "token_hash" varchar(64) NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "video_analysis_connections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" integer NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "external_workspace_id" varchar(191) NOT NULL,
  "external_workspace_name" varchar(120) NOT NULL,
  "token_hash" varchar(64) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_used_at" timestamp with time zone,
  "revoked_at" timestamp with time zone
);

CREATE UNIQUE INDEX "video_analysis_link_tokens_token_hash_unique" ON "video_analysis_link_tokens" ("token_hash");
CREATE INDEX "video_analysis_link_tokens_workspace_id_idx" ON "video_analysis_link_tokens" ("workspace_id");
CREATE INDEX "video_analysis_link_tokens_expires_at_idx" ON "video_analysis_link_tokens" ("expires_at");
CREATE UNIQUE INDEX "video_analysis_connections_workspace_id_unique" ON "video_analysis_connections" ("workspace_id");
CREATE UNIQUE INDEX "video_analysis_connections_external_workspace_id_unique" ON "video_analysis_connections" ("external_workspace_id");
CREATE UNIQUE INDEX "video_analysis_connections_token_hash_unique" ON "video_analysis_connections" ("token_hash");
