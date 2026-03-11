import { goalkeeperStatFields, offensiveDistributionKeys, outfieldStatFields } from "@/lib/stat-fields";

type NumericRecord = Record<string, number>;
type AnyRecord = Record<string, unknown>;

type PercentageMetrics = {
  passAccuracy: number;
  crossAccuracy: number;
  duelSuccessRate: number;
  shotAccuracy: number;
};

function ratio(numerator: number, denominator: number) {
  if (!denominator) {
    return 0;
  }
  return numerator / denominator;
}

export function percent(numerator: number, denominator: number) {
  return ratio(numerator, denominator) * 100;
}

export function per90(stat: number, minutesPlayed: number) {
  if (!minutesPlayed) {
    return 0;
  }
  return (stat / minutesPlayed) * 90;
}

export function sumNumericRows<T extends NumericRecord>(rows: T[]): T {
  const first = rows[0];

  if (!first) {
    return {} as T;
  }

  const totals: NumericRecord = Object.keys(first).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as NumericRecord);

  for (const row of rows) {
    for (const key of Object.keys(first)) {
      totals[key] += Number(row[key] ?? 0);
    }
  }

  return totals as T;
}

export function computeOutfieldPercentages(totals: NumericRecord): PercentageMetrics {
  const passSuccess = Number(totals.shortPassSuccess ?? 0) + Number(totals.longPassSuccess ?? 0);
  const passFail = Number(totals.shortPassFail ?? 0) + Number(totals.longPassFail ?? 0);
  const crossSuccess = Number(totals.crossSuccess ?? 0);
  const crossFail = Number(totals.crossFail ?? 0);
  const duelSuccess =
    Number(totals.aerialDuelSuccess ?? 0) + Number(totals.defensiveDuelSuccess ?? 0);
  const duelFail = Number(totals.aerialDuelFail ?? 0) + Number(totals.defensiveDuelFail ?? 0);
  const shotsOn = Number(totals.shotsOnTarget ?? 0);
  const shotsOff = Number(totals.shotsOffTarget ?? 0);

  return {
    passAccuracy: percent(passSuccess, passSuccess + passFail),
    crossAccuracy: percent(crossSuccess, crossSuccess + crossFail),
    duelSuccessRate: percent(duelSuccess, duelSuccess + duelFail),
    shotAccuracy: percent(shotsOn, shotsOn + shotsOff),
  };
}

export function computePer90Values(totals: NumericRecord) {
  const minutes = Number(totals.minutesPlayed ?? 0);
  const per90Values: Record<string, number> = {};

  for (const field of outfieldStatFields) {
    if (field.key === "minutesPlayed") {
      continue;
    }
    per90Values[field.key] = per90(Number(totals[field.key] ?? 0), minutes);
  }

  for (const field of goalkeeperStatFields) {
    if (field.key === "minutesPlayed") {
      continue;
    }
    per90Values[field.key] = per90(Number(totals[field.key] ?? 0), minutes);
  }

  return per90Values;
}

export function formatFixed(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.00";
}

export function buildOffensiveDistribution(totals: NumericRecord) {
  return offensiveDistributionKeys.map((item) => ({
    name: item.label,
    value: Number(totals[item.key] ?? 0),
  }));
}

export function buildRadarProfile(totals: NumericRecord) {
  const minutes = Number(totals.minutesPlayed ?? 0);
  return [
    { metric: "Passing", value: per90((totals.shortPassSuccess ?? 0) + (totals.longPassSuccess ?? 0), minutes) },
    { metric: "Creation", value: per90((totals.assists ?? 0) + (totals.crossSuccess ?? 0), minutes) },
    { metric: "Finishing", value: per90((totals.goals ?? 0) + (totals.shotsOnTarget ?? 0), minutes) },
    { metric: "Dribbling", value: per90(totals.dribbleSuccess ?? 0, minutes) },
    { metric: "Defense", value: per90((totals.interceptions ?? 0) + (totals.recoveries ?? 0), minutes) },
    { metric: "Duels", value: per90((totals.aerialDuelSuccess ?? 0) + (totals.defensiveDuelSuccess ?? 0), minutes) },
  ];
}

export function mergeMatchRows<T extends AnyRecord>(rows: T[]) {
  const sorted = [...rows].sort(
    (a, b) =>
      Number(a.matchdayNumber ?? a.match ?? 0) - Number(b.matchdayNumber ?? b.match ?? 0),
  );
  return sorted;
}
