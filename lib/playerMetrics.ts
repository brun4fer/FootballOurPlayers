type UnknownRow = Record<string, unknown>;

export type PlayerMatchMetricsRow = {
  matchId: number;
  matchdayNumber: number;
  date: string;
  opponentTeamName: string;
  minutesPlayed: number;
  shortPassSuccess: number;
  shortPassFail: number;
  longPassSuccess: number;
  longPassFail: number;
  crossSuccess: number;
  crossFail: number;
  dribbleSuccess: number;
  dribbleFail: number;
  throwSuccess: number;
  throwFail: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  aerialDuelSuccess: number;
  aerialDuelFail: number;
  defensiveDuelSuccess: number;
  defensiveDuelFail: number;
  goals: number;
  assists: number;
  foulsSuffered: number;
  foulsCommitted: number;
  recoveries: number;
  interceptions: number;
  possessionLosses: number;
  responsibilityGoal: number;
  yellowCards: number;
  redCards: number;
};

export type PlayerMetricsTotals = Omit<PlayerMatchMetricsRow, "matchId" | "matchdayNumber" | "date" | "opponentTeamName">;

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function ratio(success: number, fail: number) {
  const total = success + fail;
  if (!total) {
    return 0;
  }
  return (success / total) * 100;
}

function per90(value: number, minutes: number) {
  if (!minutes) {
    return 0;
  }
  return (value / minutes) * 90;
}

function clamp0to100(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}

function normalizeByCap(value: number, cap: number) {
  if (!cap) {
    return 0;
  }
  return clamp0to100((value / cap) * 100);
}

export function formatMetric(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.00";
}

export function normalizePlayerRows(rows: UnknownRow[]): PlayerMatchMetricsRow[] {
  return rows
    .map((row) => ({
      matchId: toNumber(row.matchId),
      matchdayNumber: toNumber(row.matchdayNumber),
      date: String(row.date ?? ""),
      opponentTeamName: String(row.opponentTeamName ?? "-"),
      minutesPlayed: toNumber(row.minutesPlayed),
      shortPassSuccess: toNumber(row.shortPassSuccess),
      shortPassFail: toNumber(row.shortPassFail),
      longPassSuccess: toNumber(row.longPassSuccess),
      longPassFail: toNumber(row.longPassFail),
      crossSuccess: toNumber(row.crossSuccess),
      crossFail: toNumber(row.crossFail),
      dribbleSuccess: toNumber(row.dribbleSuccess),
      dribbleFail: toNumber(row.dribbleFail),
      throwSuccess: toNumber(row.throwSuccess),
      throwFail: toNumber(row.throwFail),
      shotsOnTarget: toNumber(row.shotsOnTarget),
      shotsOffTarget: toNumber(row.shotsOffTarget),
      aerialDuelSuccess: toNumber(row.aerialDuelSuccess),
      aerialDuelFail: toNumber(row.aerialDuelFail),
      defensiveDuelSuccess: toNumber(row.defensiveDuelSuccess),
      defensiveDuelFail: toNumber(row.defensiveDuelFail),
      goals: toNumber(row.goals),
      assists: toNumber(row.assists),
      foulsSuffered: toNumber(row.foulsSuffered),
      foulsCommitted: toNumber(row.foulsCommitted),
      recoveries: toNumber(row.recoveries),
      interceptions: toNumber(row.interceptions),
      possessionLosses: toNumber(row.possessionLosses),
      responsibilityGoal: toNumber(row.responsibilityGoal),
      yellowCards: toNumber(row.yellowCards),
      redCards: toNumber(row.redCards),
    }))
    .sort(
      (a, b) =>
        a.matchdayNumber - b.matchdayNumber ||
        a.date.localeCompare(b.date) ||
        a.matchId - b.matchId,
    );
}

export function sumPlayerTotals(rows: PlayerMatchMetricsRow[]): PlayerMetricsTotals {
  return rows.reduce<PlayerMetricsTotals>(
    (acc, row) => ({
      minutesPlayed: acc.minutesPlayed + row.minutesPlayed,
      shortPassSuccess: acc.shortPassSuccess + row.shortPassSuccess,
      shortPassFail: acc.shortPassFail + row.shortPassFail,
      longPassSuccess: acc.longPassSuccess + row.longPassSuccess,
      longPassFail: acc.longPassFail + row.longPassFail,
      crossSuccess: acc.crossSuccess + row.crossSuccess,
      crossFail: acc.crossFail + row.crossFail,
      dribbleSuccess: acc.dribbleSuccess + row.dribbleSuccess,
      dribbleFail: acc.dribbleFail + row.dribbleFail,
      throwSuccess: acc.throwSuccess + row.throwSuccess,
      throwFail: acc.throwFail + row.throwFail,
      shotsOnTarget: acc.shotsOnTarget + row.shotsOnTarget,
      shotsOffTarget: acc.shotsOffTarget + row.shotsOffTarget,
      aerialDuelSuccess: acc.aerialDuelSuccess + row.aerialDuelSuccess,
      aerialDuelFail: acc.aerialDuelFail + row.aerialDuelFail,
      defensiveDuelSuccess: acc.defensiveDuelSuccess + row.defensiveDuelSuccess,
      defensiveDuelFail: acc.defensiveDuelFail + row.defensiveDuelFail,
      goals: acc.goals + row.goals,
      assists: acc.assists + row.assists,
      foulsSuffered: acc.foulsSuffered + row.foulsSuffered,
      foulsCommitted: acc.foulsCommitted + row.foulsCommitted,
      recoveries: acc.recoveries + row.recoveries,
      interceptions: acc.interceptions + row.interceptions,
      possessionLosses: acc.possessionLosses + row.possessionLosses,
      responsibilityGoal: acc.responsibilityGoal + row.responsibilityGoal,
      yellowCards: acc.yellowCards + row.yellowCards,
      redCards: acc.redCards + row.redCards,
    }),
    {
      minutesPlayed: 0,
      shortPassSuccess: 0,
      shortPassFail: 0,
      longPassSuccess: 0,
      longPassFail: 0,
      crossSuccess: 0,
      crossFail: 0,
      dribbleSuccess: 0,
      dribbleFail: 0,
      throwSuccess: 0,
      throwFail: 0,
      shotsOnTarget: 0,
      shotsOffTarget: 0,
      aerialDuelSuccess: 0,
      aerialDuelFail: 0,
      defensiveDuelSuccess: 0,
      defensiveDuelFail: 0,
      goals: 0,
      assists: 0,
      foulsSuffered: 0,
      foulsCommitted: 0,
      recoveries: 0,
      interceptions: 0,
      possessionLosses: 0,
      responsibilityGoal: 0,
      yellowCards: 0,
      redCards: 0,
    },
  );
}

export function computeAccuracyMetrics(totals: PlayerMetricsTotals) {
  return {
    shortPassAccuracy: ratio(totals.shortPassSuccess, totals.shortPassFail),
    longPassAccuracy: ratio(totals.longPassSuccess, totals.longPassFail),
    crossAccuracy: ratio(totals.crossSuccess, totals.crossFail),
    dribbleAccuracy: ratio(totals.dribbleSuccess, totals.dribbleFail),
    throwAccuracy: ratio(totals.throwSuccess, totals.throwFail),
    shotAccuracy: ratio(totals.shotsOnTarget, totals.shotsOffTarget),
    aerialDuelSuccessRate: ratio(totals.aerialDuelSuccess, totals.aerialDuelFail),
    defensiveDuelSuccessRate: ratio(totals.defensiveDuelSuccess, totals.defensiveDuelFail),
  };
}

export function computeMinuteMetrics(totals: PlayerMetricsTotals, matchesPlayed: number) {
  return {
    totalMinutes: totals.minutesPlayed,
    averageMinutes: matchesPlayed ? totals.minutesPlayed / matchesPlayed : 0,
    matchesPlayed,
  };
}

export function computeShotMetrics(totals: PlayerMetricsTotals) {
  const totalShots = totals.shotsOnTarget + totals.shotsOffTarget;
  return {
    totalShots,
    shotsOnTarget: totals.shotsOnTarget,
    shotsOffTarget: totals.shotsOffTarget,
    shotAccuracy: ratio(totals.shotsOnTarget, totals.shotsOffTarget),
  };
}

export function computePer90Metrics(totals: PlayerMetricsTotals) {
  return {
    recoveriesPer90: per90(totals.recoveries, totals.minutesPlayed),
    interceptionsPer90: per90(totals.interceptions, totals.minutesPlayed),
    foulsSufferedPer90: per90(totals.foulsSuffered, totals.minutesPlayed),
    foulsCommittedPer90: per90(totals.foulsCommitted, totals.minutesPlayed),
    possessionLossesPer90: per90(totals.possessionLosses, totals.minutesPlayed),
  };
}

export function buildMatchEvolutionSeries(rows: PlayerMatchMetricsRow[]) {
  return rows.map((row) => ({
    matchLabel: `Feirense vs ${row.opponentTeamName} (Jornada ${row.matchdayNumber})`,
    remates: row.shotsOnTarget + row.shotsOffTarget,
    assists: row.assists,
    goals: row.goals,
    dribbles: row.dribbleSuccess,
    passesCertos: row.shortPassSuccess + row.longPassSuccess,
  }));
}

export function buildOffensiveDistributionSeries(totals: PlayerMetricsTotals) {
  return [
    { name: "Passes Curtos Certos", value: totals.shortPassSuccess },
    { name: "Passes Longos Certos", value: totals.longPassSuccess },
    { name: "Cruzamentos Certos", value: totals.crossSuccess },
    { name: "Dribles Certos", value: totals.dribbleSuccess },
    { name: "Remates à Baliza", value: totals.shotsOnTarget },
  ];
}

export function buildRadarNormalizedMetrics(totals: PlayerMetricsTotals) {
  const accuracy = computeAccuracyMetrics(totals);
  const defensiveActionsPer90 = per90(totals.recoveries + totals.interceptions, totals.minutesPlayed);
  const finishingVolumePer90 = per90(totals.goals + totals.shotsOnTarget, totals.minutesPlayed);
  const duelAccuracy =
    (accuracy.aerialDuelSuccessRate + accuracy.defensiveDuelSuccessRate) / 2;

  return [
    {
      metric: "Passing",
      value: clamp0to100((accuracy.shortPassAccuracy + accuracy.longPassAccuracy) / 2),
    },
    { metric: "Crossing", value: clamp0to100(accuracy.crossAccuracy) },
    { metric: "Dribbling", value: clamp0to100(accuracy.dribbleAccuracy) },
    { metric: "Duels", value: clamp0to100(duelAccuracy) },
    { metric: "Defense", value: normalizeByCap(defensiveActionsPer90, 20) },
    {
      metric: "Finishing",
      value: clamp0to100((accuracy.shotAccuracy + normalizeByCap(finishingVolumePer90, 6)) / 2),
    },
  ];
}

export function buildComparisonRadarSeries(
  primaryTotals: PlayerMetricsTotals,
  secondaryTotals: PlayerMetricsTotals,
) {
  const primary = buildRadarNormalizedMetrics(primaryTotals);
  const secondary = buildRadarNormalizedMetrics(secondaryTotals);

  return primary.map((item, index) => ({
    metric: item.metric,
    primary: item.value,
    secondary: secondary[index]?.value ?? 0,
  }));
}
