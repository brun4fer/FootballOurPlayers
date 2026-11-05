ALTER TABLE "player_gps_match_stats"
  ALTER COLUMN "minutes_played" TYPE integer
  USING ROUND("minutes_played")::integer;
