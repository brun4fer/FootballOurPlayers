import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const matchId = Number(process.argv[2]);
  if (!Number.isInteger(matchId) || matchId <= 0) throw new Error("Provide a valid match ID.");
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT p.id AS player_id, p.name AS player_name, p.team_id, t.name AS team_name,
      t.is_fixed_home_team, s.minutes_played, s.short_pass_success, s.short_pass_fail
    FROM player_match_stats s
    JOIN players p ON p.id = s.player_id
    JOIN teams t ON t.id = p.team_id
    WHERE s.match_id = ${matchId}
    ORDER BY p.name
  `;
  console.log(JSON.stringify(rows, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
