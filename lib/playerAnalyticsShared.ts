export type ComparisonRankingMetricKey =
  | "shortPassAccuracy"
  | "longPassAccuracy"
  | "crossAccuracy"
  | "individualActionAccuracy"
  | "throwAccuracy"
  | "shotAccuracy"
  | "duelAccuracy";

const SERIES_COLORS = [
  "#00e7ff",
  "#ff2ea6",
  "#84cc16",
  "#f97316",
  "#38bdf8",
  "#f59e0b",
];

export const COMPARISON_RANKING_METRICS: Array<{
  key: ComparisonRankingMetricKey;
  label: string;
}> = [
  { key: "shortPassAccuracy", label: "Short Pass %" },
  { key: "longPassAccuracy", label: "Long Pass %" },
  { key: "crossAccuracy", label: "Crossing %" },
  { key: "individualActionAccuracy", label: "Individual Actions %" },
  { key: "throwAccuracy", label: "Throws %" },
  { key: "shotAccuracy", label: "Shots %" },
  { key: "duelAccuracy", label: "Duels %" },
];

export const EVOLUTION_COLORS = SERIES_COLORS;

export function getSeriesColor(seed: string | number) {
  const raw = String(seed);
  let hash = 0;

  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) >>> 0;
  }

  return SERIES_COLORS[hash % SERIES_COLORS.length];
}
