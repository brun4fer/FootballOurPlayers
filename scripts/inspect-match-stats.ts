import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const matchId = Number(process.argv[2]);
  if (!Number.isInteger(matchId) || matchId <= 0) throw new Error("Provide a valid match ID.");
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT p.id AS player_id, p.name AS player_name, p.team_id, t.name AS team_name,
      t.is_fixed_home_team, s.id AS stats_id, s.minutes_played,
      s.short_pass_success, s.short_pass_fail,
      CASE WHEN s.id IS NULL THEN false ELSE true END AS has_stats
    FROM players p
    JOIN teams t ON t.id = p.team_id
    LEFT JOIN player_match_stats s ON s.player_id = p.id AND s.match_id = ${matchId}
    WHERE t.is_fixed_home_team = true
    ORDER BY p.name
  `;
  console.log(JSON.stringify(rows, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
