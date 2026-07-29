import "dotenv/config";

import { neon } from "@neondatabase/serverless";

const slug = process.argv[2];
const apply = process.argv.includes("--apply");

if (!slug) {
  throw new Error("Usage: npx tsx scripts/clear-workspace-data.ts <workspace-slug> [--apply]");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
const workspaceRows = await sql`SELECT id, name, slug FROM workspaces WHERE slug = ${slug}`;
const workspace = workspaceRows[0];

if (!workspace) {
  throw new Error(`Workspace '${slug}' was not found.`);
}

const counts = await sql`
  SELECT
    (SELECT count(*)::int FROM users WHERE workspace_id = ${workspace.id}) AS users,
    (SELECT count(*)::int FROM seasons WHERE workspace_id = ${workspace.id}) AS seasons,
    (SELECT count(*)::int FROM competitions WHERE workspace_id = ${workspace.id}) AS competitions,
    (SELECT count(*)::int FROM teams WHERE workspace_id = ${workspace.id}) AS teams,
    (SELECT count(*)::int FROM players p JOIN teams t ON t.id = p.team_id WHERE t.workspace_id = ${workspace.id}) AS players,
    (SELECT count(*)::int FROM public_reports WHERE workspace_id = ${workspace.id}) AS reports
`;
const fixedHomeTeams = await sql`
  SELECT id, name, is_fixed_home_team
  FROM teams
  WHERE workspace_id = ${workspace.id} AND is_fixed_home_team = true
`;

console.log(JSON.stringify({ workspace, before: counts[0], fixedHomeTeams, mode: apply ? "apply" : "preview" }, null, 2));

if (apply) {
  await sql.transaction([
    sql`DELETE FROM public_reports WHERE workspace_id = ${workspace.id}`,
    sql`DELETE FROM seasons WHERE workspace_id = ${workspace.id}`,
    sql`DELETE FROM teams WHERE workspace_id = ${workspace.id}`,
  ]);

  console.log("Operational workspace data cleared. The workspace and users were preserved.");
}
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
