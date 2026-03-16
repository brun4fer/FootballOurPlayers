"use server";

import { redirect } from "next/navigation";

import { createPublicReport, type PublicReportFilters } from "@/lib/data";

function toOptionalId(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

function toIdList(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as number[];
  }

  return [...new Set(
    value
      .map((entry) => Number(entry))
      .filter((entry) => Number.isFinite(entry) && entry > 0)
      .map((entry) => Math.floor(entry)),
  )];
}

function sanitizeFilters(raw: unknown): PublicReportFilters {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const competitionId = toOptionalId(source.competitionId);
  const playerId = toOptionalId(source.playerId);
  const matchId = toOptionalId(source.matchId);
  const matchIds = toIdList(source.matchIds);
  const playerIds = toIdList(source.playerIds);
  const selectedMatchIds = toIdList(source.selectedMatchIds);
  const selectedPlayers = toIdList(source.selectedPlayers);
  const selectedMatchdays = toIdList(source.selectedMatchdays);

  return {
    competitionId,
    playerId,
    matchId,
    matchIds,
    playerIds,
    selectedMatchIds,
    selectedPlayers,
    selectedMatchdays,
  };
}

export async function generatePublicReportAction(formData: FormData) {
  const rawFilters = formData.get("filters");
  const parsedFilters = (() => {
    if (!rawFilters || typeof rawFilters !== "string") {
      return {};
    }
    try {
      return JSON.parse(rawFilters) as unknown;
    } catch {
      return {};
    }
  })();

  const reportId = await createPublicReport(sanitizeFilters(parsedFilters));
  redirect(`/report/${reportId}`);
}
