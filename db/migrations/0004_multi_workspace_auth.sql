-- Point-in-time safety copy of all user-owned data before repartitioning.
CREATE SCHEMA IF NOT EXISTS "_backup_20260724";
CREATE TABLE "_backup_20260724"."seasons" AS TABLE "seasons";
CREATE TABLE "_backup_20260724"."competitions" AS TABLE "competitions";
CREATE TABLE "_backup_20260724"."teams" AS TABLE "teams";
CREATE TABLE "_backup_20260724"."team_competitions" AS TABLE "team_competitions";
CREATE TABLE "_backup_20260724"."players" AS TABLE "players";
CREATE TABLE "_backup_20260724"."matches" AS TABLE "matches";
CREATE TABLE "_backup_20260724"."player_match_stats" AS TABLE "player_match_stats";
CREATE TABLE "_backup_20260724"."goalkeeper_match_stats" AS TABLE "goalkeeper_match_stats";
CREATE TABLE "_backup_20260724"."team_match_stats" AS TABLE "team_match_stats";
CREATE TABLE "_backup_20260724"."public_reports" AS TABLE "public_reports";

CREATE TABLE "workspaces" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(120) NOT NULL,
  "slug" varchar(80) NOT NULL
);
CREATE UNIQUE INDEX "workspaces_slug_unique" ON "workspaces" ("slug");

CREATE TABLE "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "username" varchar(80) NOT NULL,
  "password_hash" text NOT NULL,
  "workspace_id" integer NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
  "must_change_password" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "users_username_unique" ON "users" (lower("username"));
CREATE INDEX "users_workspace_id_idx" ON "users" ("workspace_id");

CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY NOT NULL,
  "token_hash" varchar(64) NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "sessions" ("token_hash");
CREATE INDEX "sessions_user_id_idx" ON "sessions" ("user_id");
CREATE INDEX "sessions_expires_at_idx" ON "sessions" ("expires_at");

INSERT INTO "workspaces" ("name", "slug") VALUES
  ('Paulo', 'paulo'),
  ('Simao', 'simao');

ALTER TABLE "seasons" ADD COLUMN "workspace_id" integer;
ALTER TABLE "competitions" ADD COLUMN "workspace_id" integer;
ALTER TABLE "teams" ADD COLUMN "workspace_id" integer;
ALTER TABLE "public_reports" ADD COLUMN "workspace_id" integer;

-- Petrolul/Dinamo and their competitions belong to Simao.
UPDATE "competitions" SET "workspace_id" = (SELECT id FROM workspaces WHERE slug = 'simao')
WHERE id IN (2, 3);
UPDATE "teams" SET "workspace_id" = (SELECT id FROM workspaces WHERE slug = 'simao')
WHERE id IN (4, 12);

-- Feirense/Ovarense and their competitions belong to Paulo.
UPDATE "competitions" SET "workspace_id" = (SELECT id FROM workspaces WHERE slug = 'paulo')
WHERE id IN (4, 5);
UPDATE "teams" SET "workspace_id" = (SELECT id FROM workspaces WHERE slug = 'paulo')
WHERE id IN (13, 14);

-- Fail safely if unexpected unclassified data exists.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM competitions WHERE workspace_id IS NULL) THEN
    RAISE EXCEPTION 'Unclassified competitions exist; migration cancelled';
  END IF;
  IF EXISTS (SELECT 1 FROM teams WHERE workspace_id IS NULL) THEN
    RAISE EXCEPTION 'Unclassified teams exist; migration cancelled';
  END IF;
END $$;

-- The existing season becomes Simao's; Paulo receives an independent copy.
UPDATE "seasons" SET "workspace_id" = (SELECT id FROM workspaces WHERE slug = 'simao');
DROP INDEX IF EXISTS "seasons_name_unique";
INSERT INTO "seasons" ("name", "workspace_id")
SELECT "name", (SELECT id FROM workspaces WHERE slug = 'paulo')
FROM "seasons"
WHERE "workspace_id" = (SELECT id FROM workspaces WHERE slug = 'simao');
UPDATE "competitions"
SET "season_id" = (
  SELECT id FROM seasons
  WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'paulo')
  ORDER BY id DESC LIMIT 1
)
WHERE "workspace_id" = (SELECT id FROM workspaces WHERE slug = 'paulo');

-- Public reports are classified from their saved filters; reports without enough
-- information remain with Paulo, the original owner of this deployment.
UPDATE "public_reports" r SET "workspace_id" = COALESCE(
  (SELECT c.workspace_id FROM competitions c WHERE c.id = (r.filters->>'competitionId')::integer),
  (SELECT t.workspace_id FROM players p JOIN teams t ON t.id = p.team_id
   WHERE p.id = (r.filters->>'playerId')::integer),
  (SELECT c.workspace_id FROM matches m JOIN competitions c ON c.id = m.competition_id
   WHERE m.id = (r.filters->>'matchId')::integer),
  (SELECT id FROM workspaces WHERE slug = 'paulo')
);

ALTER TABLE "seasons" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "competitions" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "teams" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "public_reports" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_workspace_id_workspaces_id_fk"
  FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE cascade;
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_workspace_id_workspaces_id_fk"
  FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE cascade;
ALTER TABLE "teams" ADD CONSTRAINT "teams_workspace_id_workspaces_id_fk"
  FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE cascade;
ALTER TABLE "public_reports" ADD CONSTRAINT "public_reports_workspace_id_workspaces_id_fk"
  FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE cascade;

DROP INDEX IF EXISTS "seasons_name_unique";
DROP INDEX IF EXISTS "teams_name_unique";
CREATE UNIQUE INDEX "seasons_name_workspace_unique" ON "seasons" ("name", "workspace_id");
CREATE UNIQUE INDEX "teams_name_workspace_unique" ON "teams" ("name", "workspace_id");

INSERT INTO "users" ("username", "password_hash", "workspace_id", "must_change_password") VALUES
  ('Paulo', 'scrypt:09b51061e0e92ea168ca39d2da1f51dd:2c2f998c6517954b25dc0af89e6f31d48b19d810141f75bdc907901b26e15b4c5e1e23a31e935f50d2b10fcbb3ade2cd31f434394a1b54d3c40045288a62587e',
   (SELECT id FROM workspaces WHERE slug = 'paulo'), true),
  ('Simao', 'scrypt:330f37a8915cf5790966c765c45d10ec:006675777e06d369b60b3992b7d630226c72c11008576f60e8038c94d903290dbdd99197851a8613981d96a1feebd4d606fe05fb063e0f91d14ed850c027abfa',
   (SELECT id FROM workspaces WHERE slug = 'simao'), true);
