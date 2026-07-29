UPDATE "players" p
SET "team_id" = fixed."id"
FROM "teams" current_team
JOIN "teams" fixed
  ON fixed."workspace_id" = current_team."workspace_id"
 AND fixed."is_fixed_home_team" = true
WHERE p."team_id" = current_team."id"
  AND p."team_id" <> fixed."id";
