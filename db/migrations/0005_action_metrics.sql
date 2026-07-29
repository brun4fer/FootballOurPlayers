ALTER TABLE "player_match_stats" RENAME COLUMN "possession_losses" TO "other_possession_losses";
ALTER TABLE "team_match_stats" RENAME COLUMN "possession_losses" TO "other_possession_losses";

ALTER TABLE "player_match_stats"
  ADD COLUMN "defensive_positioning_to_correct" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "through_passes" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "runs_in_behind" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "set_piece_cross_success" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "set_piece_cross_fail" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "intercepted_crosses" integer DEFAULT 0 NOT NULL;

ALTER TABLE "team_match_stats"
  ADD COLUMN "defensive_positioning_to_correct" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "through_passes" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "runs_in_behind" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "set_piece_cross_success" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "set_piece_cross_fail" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "intercepted_crosses" integer DEFAULT 0 NOT NULL;
