type SearchParamValue = string | string[] | undefined;

export function getSearchQuery(params: Record<string, SearchParamValue>) {
  const value = params.q;

  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export function normalizeSearchText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesSearch(query: string, values: unknown[]) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) => normalizeSearchText(value).includes(normalizedQuery));
}

export function filterBySearch<T>(
  items: readonly T[],
  query: string,
  getValues: (item: T) => unknown[],
) {
  if (!normalizeSearchText(query)) {
    return [...items];
  }

  return items.filter((item) => matchesSearch(query, getValues(item)));
}

export function getMatchSearchValues(match: {
  matchdayNumber?: number | string;
  opponentTeamName?: string;
  date?: string;
}) {
  return [
    match.opponentTeamName,
    match.date,
    match.matchdayNumber,
    `Matchday ${match.matchdayNumber ?? ""}`,
    `Match ${match.matchdayNumber ?? ""}`,
    `Feirense x ${match.opponentTeamName ?? ""}`,
  ];
}

export function formatMatchLabel(match: {
  matchdayNumber?: number | string;
  opponentTeamName?: string;
}) {
  return `Matchday ${match.matchdayNumber ?? "-"} x ${match.opponentTeamName ?? "-"}`;
}

export function describeList(values: string[], fallback = "All", limit = 4) {
  const cleanValues = values.map((value) => value.trim()).filter(Boolean);

  if (cleanValues.length === 0) {
    return fallback;
  }

  const uniqueValues = [...new Set(cleanValues)];
  const visibleValues = uniqueValues.slice(0, limit);
  const remainingCount = uniqueValues.length - visibleValues.length;

  if (remainingCount <= 0) {
    return visibleValues.join(", ");
  }

  return `${visibleValues.join(", ")} +${remainingCount}`;
}
