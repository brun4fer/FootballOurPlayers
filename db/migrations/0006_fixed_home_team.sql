ALTER TABLE "teams" ADD COLUMN "is_fixed_home_team" boolean DEFAULT false NOT NULL;

INSERT INTO "teams" ("name", "workspace_id", "is_fixed_home_team")
SELECT 'CD Feirense', w."id", true
FROM "workspaces" w
WHERE NOT EXISTS (
  SELECT 1 FROM "teams" t
  WHERE t."workspace_id" = w."id" AND lower(t."name") = 'cd feirense'
);

UPDATE "teams"
SET "name" = 'CD Feirense', "is_fixed_home_team" = true
WHERE lower("name") = 'cd feirense';

CREATE INDEX "teams_fixed_home_team_idx"
ON "teams" USING btree ("workspace_id", "is_fixed_home_team");
