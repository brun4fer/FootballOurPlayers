import "dotenv/config";

import { randomBytes, scrypt as scryptCallback } from "crypto";
import { promisify } from "util";
import { neon } from "@neondatabase/serverless";

const scrypt = promisify(scryptCallback);

async function main() {
  const username = process.argv[2]?.trim();
  const password = process.env.RESET_PASSWORD;
  const databaseUrl = process.env.DATABASE_URL;

  if (!username) {
    throw new Error("Usage: npm run db:reset-password -- <username>");
  }

  if (!password) {
    throw new Error("RESET_PASSWORD is required in the environment.");
  }

  if (password.length < 10) {
    throw new Error("RESET_PASSWORD must contain at least 10 characters.");
  }

  if (password !== password.trim()) {
    throw new Error("RESET_PASSWORD cannot start or end with whitespace.");
  }

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required in the environment.");
  }

  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  const passwordHash = `scrypt:${salt}:${key.toString("hex")}`;
  const sql = neon(databaseUrl);

  const [updatedUsers, deletedSessions] = await sql.transaction([
    sql`
      UPDATE users
      SET password_hash = ${passwordHash}, must_change_password = true
      WHERE lower(username) = lower(${username})
      RETURNING id, username
    `,
    sql`
      DELETE FROM sessions
      WHERE user_id IN (
        SELECT id FROM users WHERE lower(username) = lower(${username})
      )
      RETURNING id
    `,
  ]);

  if (updatedUsers.length !== 1) {
    throw new Error(`User '${username}' was not found; no password was changed.`);
  }

  console.log(
    `Password reset for '${updatedUsers[0].username}'. ${deletedSessions.length} existing session(s) invalidated.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
