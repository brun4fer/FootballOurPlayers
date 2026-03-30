import {
  getCompetitionOptions,
  getMatchOptionsByCompetition,
} from "@/lib/data";

type SearchParamValue = string | string[] | undefined;

export type TeamAnalyticsSearchParams = Record<string, SearchParamValue>;

export type CompetitionOption = {
  id: number;
  name: string;
};

export type TeamMatchOption = {
  id: number;
  matchdayNumber: number;
  opponentTeamName: string;
  date: string;
};

export type TeamAnalyticsBaseData = {
  competitions: CompetitionOption[];
  selectedCompetitionId?: number;
  matchOptions: TeamMatchOption[];
  matchIdSet: Set<number>;
};

export function parseOptionalId(value: SearchParamValue) {
  if (!value || Array.isArray(value)) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

export function parseIdList(value: SearchParamValue) {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const splitValues = rawValues.flatMap((item) => item.split(","));

  return [
    ...new Set(
      splitValues
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item) && item > 0)
        .map((item) => Math.floor(item)),
    ),
  ];
}

export function filterValidIds(ids: number[], availableIds: Set<number>) {
  return ids.filter((id) => availableIds.has(id));
}

export function resolveSingleId(
  value: SearchParamValue,
  availableIds: Set<number>,
  fallbackId?: number,
) {
  const parsed = parseOptionalId(value);

  if (parsed && availableIds.has(parsed)) {
    return parsed;
  }

  return fallbackId && availableIds.has(fallbackId) ? fallbackId : undefined;
}

export async function getTeamAnalyticsBaseData(
  params: TeamAnalyticsSearchParams,
): Promise<TeamAnalyticsBaseData> {
  const competitions = (await getCompetitionOptions()) as CompetitionOption[];
  const availableCompetitionIds = new Set(competitions.map((competition) => competition.id));
  const requestedCompetitionId = parseOptionalId(params.competitionId);
  const selectedCompetitionId =
    requestedCompetitionId && availableCompetitionIds.has(requestedCompetitionId)
      ? requestedCompetitionId
      : competitions[0]?.id;

  if (!selectedCompetitionId) {
    return {
      competitions,
      selectedCompetitionId: undefined,
      matchOptions: [],
      matchIdSet: new Set<number>(),
    };
  }

  const matchOptions = (await getMatchOptionsByCompetition(selectedCompetitionId)).map((match) => ({
    id: match.id,
    matchdayNumber: match.matchdayNumber,
    opponentTeamName: match.opponentTeamName,
    date: match.date,
  }));

  return {
    competitions,
    selectedCompetitionId,
    matchOptions,
    matchIdSet: new Set(matchOptions.map((match) => match.id)),
  };
}
