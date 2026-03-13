import { z } from "zod";

import {
  type GoalkeeperStatKey,
  goalkeeperStatFields,
  type OutfieldStatKey,
  outfieldStatFields,
} from "@/lib/stat-fields";
import { toInt } from "@/lib/utils";

const idSchema = z.coerce.number().int().positive();
const optionalIdSchema = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
}, idSchema.optional());

export const seasonSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export const competitionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  seasonId: idSchema,
});

export const teamSchema = z.object({
  name: z.string().trim().min(2).max(120),
  emblemUrl: z.string().trim().max(2000).optional(),
});

export const teamCompetitionSchema = z.object({
  teamId: idSchema,
  competitionId: idSchema,
});

export const playerSchema = z.object({
  name: z.string().trim().min(2).max(140),
  photo: z.string().trim().max(2000).optional(),
  height: z.coerce.number().int().nonnegative().optional(),
  weight: z.coerce.number().int().nonnegative().optional(),
  nationality: z.string().trim().max(100).optional(),
  agent: z.string().trim().max(120).optional(),
  teamId: idSchema,
  position1: z.string().trim().max(40).optional(),
  position2: z.string().trim().max(40).optional(),
  position3: z.string().trim().max(40).optional(),
  isGoalkeeper: z.boolean().default(false),
});

export const matchSchema = z.object({
  matchdayNumber: z.coerce.number().int().positive(),
  competitionId: idSchema,
  opponentTeamId: idSchema,
  homeAway: z.enum(["home", "away"]),
  date: z.string().date(),
});

export const outfieldStatsBaseSchema = z.object({
  playerId: optionalIdSchema,
  teamId: optionalIdSchema,
  matchId: idSchema,
});

export const goalkeeperStatsBaseSchema = z.object({
  playerId: idSchema,
  matchId: idSchema,
});

export type ParsedOutfieldStats = {
  playerId?: number;
  teamId?: number;
  matchId: number;
} & Record<OutfieldStatKey, number>;

export type ParsedGoalkeeperStats = {
  playerId: number;
  matchId: number;
} & Record<GoalkeeperStatKey, number>;

export function parseOutfieldStats(formData: FormData): ParsedOutfieldStats {
  const numericStats = outfieldStatFields.reduce((acc, field) => {
    acc[field.key] = toInt(formData.get(field.key));
    return acc;
  }, {} as Record<OutfieldStatKey, number>);

  const base = outfieldStatsBaseSchema.parse({
    playerId: formData.get("playerId"),
    teamId: formData.get("teamId"),
    matchId: formData.get("matchId"),
  });

  return { ...base, ...numericStats };
}

export function parseGoalkeeperStats(formData: FormData): ParsedGoalkeeperStats {
  const numericStats = goalkeeperStatFields.reduce((acc, field) => {
    acc[field.key] = toInt(formData.get(field.key));
    return acc;
  }, {} as Record<GoalkeeperStatKey, number>);

  const base = goalkeeperStatsBaseSchema.parse({
    playerId: formData.get("playerId"),
    matchId: formData.get("matchId"),
  });

  return { ...base, ...numericStats };
}
