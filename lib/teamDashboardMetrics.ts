import type { TeamDashboardMatchAggregate } from "@/lib/data";

export type TeamDashboardTotals = Omit<
  TeamDashboardMatchAggregate,
  "matchId" | "matchdayNumber" | "date" | "opponentTeamName"
>;

export type TeamOffensiveChartDatum = {
  label: string;
  total: number;
};

export type TeamPercentageRow = {
  metric: string;
  success: number;
  fail: number;
  percentage: number;
};

export type TeamNumericRow = {
  metric: string;
  total: number;
  per90: number;
};

export type TeamEvolutionPoint = {
  matchLabel: string;
  matchdayNumber: number;
  opponentTeamName: string;
  team: number;
};

export type TeamEvolutionChartSeries = {
  key: string;
  title: string;
  description: string;
  color: string;
  displayMode?: "raw" | "percentage" | "per90";
  data: TeamEvolutionPoint[];
};

export type TeamOverviewStat = {
  title: string;
  value: string | number;
  description?: string;
};

export type TeamAnalyticsTableRow = {
  metric: string;
  total: number;
  percentage: number;
  per90: number;
};

const EMPTY_TOTALS: TeamDashboardTotals = {
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
  foulsSuffered: 0,
  foulsCommitted: 0,
  recoveries: 0,
  interceptions: 0,
  offsides: 0,
  possessionLosses: 0,
  yellowCards: 0,
  redCards: 0,
  responsibilityGoal: 0,
  saves: 0,
  incompleteSaves: 0,
  shotsConceded: 0,
  goalsConceded: 0,
};

function toSafeNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function percent(success: number, fail: number) {
  const denominator = success + fail;
  if (!denominator) {
    return 0;
  }
  return (success / denominator) * 100;
}

function per90(value: number, totalMinutes: number) {
  if (!totalMinutes) {
    return 0;
  }
  return (value / totalMinutes) * 90;
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function aerialDuelPercentage(values: {
  aerialDuelSuccess: number;
  aerialDuelFail: number;
}) {
  return percent(values.aerialDuelSuccess, values.aerialDuelFail);
}

function shotAccuracy(values: {
  shotsOnTarget: number;
  shotsOffTarget: number;
}) {
  return percent(values.shotsOnTarget, values.shotsOffTarget);
}

function throwInAccuracy(values: {
  throwSuccess: number;
  throwFail: number;
}) {
  return percent(values.throwSuccess, values.throwFail);
}

function formatMatchLabel(row: TeamDashboardMatchAggregate) {
  return `Feirense x ${row.opponentTeamName} (Matchday ${row.matchdayNumber})`;
}

export function formatMetric(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.00";
}

export function aggregateTeamDashboardTotals(
  rows: TeamDashboardMatchAggregate[],
): TeamDashboardTotals {
  return rows.reduce<TeamDashboardTotals>(
    (acc, row) => ({
      minutesPlayed: acc.minutesPlayed + toSafeNumber(row.minutesPlayed),
      shortPassSuccess: acc.shortPassSuccess + toSafeNumber(row.shortPassSuccess),
      shortPassFail: acc.shortPassFail + toSafeNumber(row.shortPassFail),
      longPassSuccess: acc.longPassSuccess + toSafeNumber(row.longPassSuccess),
      longPassFail: acc.longPassFail + toSafeNumber(row.longPassFail),
      crossSuccess: acc.crossSuccess + toSafeNumber(row.crossSuccess),
      crossFail: acc.crossFail + toSafeNumber(row.crossFail),
      dribbleSuccess: acc.dribbleSuccess + toSafeNumber(row.dribbleSuccess),
      dribbleFail: acc.dribbleFail + toSafeNumber(row.dribbleFail),
      throwSuccess: acc.throwSuccess + toSafeNumber(row.throwSuccess),
      throwFail: acc.throwFail + toSafeNumber(row.throwFail),
      shotsOnTarget: acc.shotsOnTarget + toSafeNumber(row.shotsOnTarget),
      shotsOffTarget: acc.shotsOffTarget + toSafeNumber(row.shotsOffTarget),
      aerialDuelSuccess: acc.aerialDuelSuccess + toSafeNumber(row.aerialDuelSuccess),
      aerialDuelFail: acc.aerialDuelFail + toSafeNumber(row.aerialDuelFail),
      defensiveDuelSuccess: acc.defensiveDuelSuccess + toSafeNumber(row.defensiveDuelSuccess),
      defensiveDuelFail: acc.defensiveDuelFail + toSafeNumber(row.defensiveDuelFail),
      goals: acc.goals + toSafeNumber(row.goals),
      foulsSuffered: acc.foulsSuffered + toSafeNumber(row.foulsSuffered),
      foulsCommitted: acc.foulsCommitted + toSafeNumber(row.foulsCommitted),
      recoveries: acc.recoveries + toSafeNumber(row.recoveries),
      interceptions: acc.interceptions + toSafeNumber(row.interceptions),
      offsides: acc.offsides + toSafeNumber(row.offsides),
      possessionLosses: acc.possessionLosses + toSafeNumber(row.possessionLosses),
      yellowCards: acc.yellowCards + toSafeNumber(row.yellowCards),
      redCards: acc.redCards + toSafeNumber(row.redCards),
      responsibilityGoal: acc.responsibilityGoal + toSafeNumber(row.responsibilityGoal),
      saves: acc.saves + toSafeNumber(row.saves),
      incompleteSaves: acc.incompleteSaves + toSafeNumber(row.incompleteSaves),
      shotsConceded: acc.shotsConceded + toSafeNumber(row.shotsConceded),
      goalsConceded: acc.goalsConceded + toSafeNumber(row.goalsConceded),
    }),
    { ...EMPTY_TOTALS },
  );
}

export function buildTeamOffensiveChartData(
  totals: TeamDashboardTotals,
): TeamOffensiveChartDatum[] {
  return [
    { label: "Successful Short Passes", total: totals.shortPassSuccess },
    { label: "Successful Long Passes", total: totals.longPassSuccess },
    { label: "Successful Crosses", total: totals.crossSuccess },
    { label: "Successful Individual Actions", total: totals.dribbleSuccess },
    { label: "Shots", total: totals.shotsOnTarget + totals.shotsOffTarget },
  ];
}

export function buildTeamPercentageRows(totals: TeamDashboardTotals): TeamPercentageRow[] {
  return [
    {
      metric: "Passe Curto",
      success: totals.shortPassSuccess,
      fail: totals.shortPassFail,
      percentage: percent(totals.shortPassSuccess, totals.shortPassFail),
    },
    {
      metric: "Passe Longo",
      success: totals.longPassSuccess,
      fail: totals.longPassFail,
      percentage: percent(totals.longPassSuccess, totals.longPassFail),
    },
    {
      metric: "Crosses",
      success: totals.crossSuccess,
      fail: totals.crossFail,
      percentage: percent(totals.crossSuccess, totals.crossFail),
    },
    {
      metric: "Individual Actions",
      success: totals.dribbleSuccess,
      fail: totals.dribbleFail,
      percentage: percent(totals.dribbleSuccess, totals.dribbleFail),
    },
    {
      metric: "Throw-ins",
      success: totals.throwSuccess,
      fail: totals.throwFail,
      percentage: percent(totals.throwSuccess, totals.throwFail),
    },
    {
      metric: "Shots",
      success: totals.shotsOnTarget,
      fail: totals.shotsOffTarget,
      percentage: percent(totals.shotsOnTarget, totals.shotsOffTarget),
    },
    {
      metric: "Aerial Duels",
      success: totals.aerialDuelSuccess,
      fail: totals.aerialDuelFail,
      percentage: percent(totals.aerialDuelSuccess, totals.aerialDuelFail),
    },
    {
      metric: "Defensive Duels",
      success: totals.defensiveDuelSuccess,
      fail: totals.defensiveDuelFail,
      percentage: percent(totals.defensiveDuelSuccess, totals.defensiveDuelFail),
    },
    {
      metric: "Saves (GK)",
      success: totals.saves,
      fail: totals.incompleteSaves,
      percentage: percent(totals.saves, totals.incompleteSaves),
    },
  ];
}

export function buildTeamNumericRows(totals: TeamDashboardTotals): TeamNumericRow[] {
  const totalMinutes = totals.minutesPlayed;
  const totalShots = totals.shotsOnTarget + totals.shotsOffTarget;

  return [
    {
      metric: "Fouls Won",
      total: totals.foulsSuffered,
      per90: per90(totals.foulsSuffered, totalMinutes),
    },
    {
      metric: "Fouls Committed",
      total: totals.foulsCommitted,
      per90: per90(totals.foulsCommitted, totalMinutes),
    },
    {
      metric: "Recoveries",
      total: totals.recoveries,
      per90: per90(totals.recoveries, totalMinutes),
    },
    {
      metric: "Interceptions",
      total: totals.interceptions,
      per90: per90(totals.interceptions, totalMinutes),
    },
    {
      metric: "Offsides",
      total: totals.offsides,
      per90: per90(totals.offsides, totalMinutes),
    },
    {
      metric: "Possession Losses",
      total: totals.possessionLosses,
      per90: per90(totals.possessionLosses, totalMinutes),
    },
    {
      metric: "Yellow Cards",
      total: totals.yellowCards,
      per90: per90(totals.yellowCards, totalMinutes),
    },
    {
      metric: "Red Cards",
      total: totals.redCards,
      per90: per90(totals.redCards, totalMinutes),
    },
    {
      metric: "Errors Leading to Goals",
      total: totals.responsibilityGoal,
      per90: per90(totals.responsibilityGoal, totalMinutes),
    },
    {
      metric: "Shots Faced",
      total: totals.shotsConceded,
      per90: per90(totals.shotsConceded, totalMinutes),
    },
    {
      metric: "Shots",
      total: totalShots,
      per90: per90(totalShots, totalMinutes),
    },
    {
      metric: "Goals Conceded",
      total: totals.goalsConceded,
      per90: per90(totals.goalsConceded, totalMinutes),
    },
    {
      metric: "Goals Scored",
      total: totals.goals,
      per90: per90(totals.goals, totalMinutes),
    },
  ];
}

export function buildGoalkeeperSummary(totals: TeamDashboardTotals) {
  return {
    totalSaves: totals.saves,
    totalIncompleteSaves: totals.incompleteSaves,
    savePercentage: percent(totals.saves, totals.incompleteSaves),
  };
}

export function buildTeamOverviewStats(
  rows: TeamDashboardMatchAggregate[],
  totals: TeamDashboardTotals,
): TeamOverviewStat[] {
  const shortPassAverage = average(
    rows.map((row) => percent(row.shortPassSuccess, row.shortPassFail)),
  );
  const longPassAverage = average(
    rows.map((row) => percent(row.longPassSuccess, row.longPassFail)),
  );
  const crossAverage = average(rows.map((row) => percent(row.crossSuccess, row.crossFail)));
  const dribbleAverage = average(
    rows.map((row) => percent(row.dribbleSuccess, row.dribbleFail)),
  );
  const aerialDuelAverage = average(rows.map((row) => aerialDuelPercentage(row)));
  const shotAccuracyAverage = average(rows.map((row) => shotAccuracy(row)));
  const throwInAverage = average(rows.map((row) => throwInAccuracy(row)));
  const goalsPer90 = per90(totals.goals, totals.minutesPlayed);

  return [
    {
      title: "Average Passe Curto",
      value: `${formatMetric(shortPassAverage)}%`,
      description: "Percentage average per matchday no current filter.",
    },
    {
      title: "Average Passe Longo",
      value: `${formatMetric(longPassAverage)}%`,
      description: "Average ability to connect with long passes.",
    },
    {
      title: "Average Cruzamento",
      value: `${formatMetric(crossAverage)}%`,
      description: "Average quality of deliveries into the box.",
    },
    {
      title: "Average Individual Actions",
      value: `${formatMetric(dribbleAverage)}%`,
      description: "Average individual-action success rate.",
    },
    {
      title: "Average Aerial Duels",
      value: `${formatMetric(aerialDuelAverage)}%`,
      description: "Average aerial-duel success rate.",
    },
    {
      title: "Average Shot Accuracy",
      value: `${formatMetric(shotAccuracyAverage)}%`,
      description: "Shots on target as a percentage of all shots.",
    },
    {
      title: "Average Throw-ins",
      value: `${formatMetric(throwInAverage)}%`,
      description: "Average throw-in success rate.",
    },
    {
      title: "Goals per Matchday",
      value: formatMetric(goalsPer90),
      description: `${rows.length} matchdays in the filtered period.`,
    },
  ];
}

export function buildTeamAnalyticsTableRows(
  totals: TeamDashboardTotals,
): TeamAnalyticsTableRow[] {
  const totalMinutes = totals.minutesPlayed;

  return [
    {
      metric: "Passe Curto",
      total: totals.shortPassSuccess + totals.shortPassFail,
      percentage: percent(totals.shortPassSuccess, totals.shortPassFail),
      per90: per90(totals.shortPassSuccess + totals.shortPassFail, totalMinutes),
    },
    {
      metric: "Passe Longo",
      total: totals.longPassSuccess + totals.longPassFail,
      percentage: percent(totals.longPassSuccess, totals.longPassFail),
      per90: per90(totals.longPassSuccess + totals.longPassFail, totalMinutes),
    },
    {
      metric: "Crosses",
      total: totals.crossSuccess + totals.crossFail,
      percentage: percent(totals.crossSuccess, totals.crossFail),
      per90: per90(totals.crossSuccess + totals.crossFail, totalMinutes),
    },
    {
      metric: "Individual Actions",
      total: totals.dribbleSuccess + totals.dribbleFail,
      percentage: percent(totals.dribbleSuccess, totals.dribbleFail),
      per90: per90(totals.dribbleSuccess + totals.dribbleFail, totalMinutes),
    },
    {
      metric: "Throw-ins",
      total: totals.throwSuccess + totals.throwFail,
      percentage: percent(totals.throwSuccess, totals.throwFail),
      per90: per90(totals.throwSuccess + totals.throwFail, totalMinutes),
    },
    {
      metric: "Shots",
      total: totals.shotsOnTarget + totals.shotsOffTarget,
      percentage: percent(totals.shotsOnTarget, totals.shotsOffTarget),
      per90: per90(totals.shotsOnTarget + totals.shotsOffTarget, totalMinutes),
    },
    {
      metric: "Aerial Duels",
      total: totals.aerialDuelSuccess + totals.aerialDuelFail,
      percentage: percent(totals.aerialDuelSuccess, totals.aerialDuelFail),
      per90: per90(totals.aerialDuelSuccess + totals.aerialDuelFail, totalMinutes),
    },
    {
      metric: "Defensive Duels",
      total: totals.defensiveDuelSuccess + totals.defensiveDuelFail,
      percentage: percent(totals.defensiveDuelSuccess, totals.defensiveDuelFail),
      per90: per90(
        totals.defensiveDuelSuccess + totals.defensiveDuelFail,
        totalMinutes,
      ),
    },
  ];
}

export function buildTeamEvolutionCharts(
  rows: TeamDashboardMatchAggregate[],
): TeamEvolutionChartSeries[] {
  const percentageMetrics: Array<{
    key: string;
    title: string;
    description: string;
    color: string;
    displayMode?: "raw" | "percentage" | "per90";
    value: (row: TeamDashboardMatchAggregate) => number;
  }> = [
    {
      key: "short-pass",
      title: "Passe Curto %",
      description: "Short-pass accuracy by matchday.",
      color: "#00e7ff",
      value: (row) => percent(row.shortPassSuccess, row.shortPassFail),
    },
    {
      key: "long-pass",
      title: "Passe Longo %",
      description: "Ability to connect accurately with long passes.",
      color: "#ff2ea6",
      value: (row) => percent(row.longPassSuccess, row.longPassFail),
    },
    {
      key: "crossing",
      title: "Crosses %",
      description: "Team efficiency when delivering the ball into the box.",
      color: "#22d3ee",
      value: (row) => percent(row.crossSuccess, row.crossFail),
    },
    {
      key: "individual-actions",
      title: "Individual Actions %",
      description: "Individual-action success per matchday.",
      color: "#84cc16",
      value: (row) => percent(row.dribbleSuccess, row.dribbleFail),
    },
    {
      key: "throw-ins",
      title: "Throw-ins %",
      description: "Success in throw-ins per matchday.",
      color: "#a78bfa",
      displayMode: "percentage",
      value: (row) => throwInAccuracy(row),
    },
    {
      key: "shot-accuracy",
      title: "Shot Accuracy %",
      description: "Shots on target as a percentage of all shots per matchday.",
      color: "#f97316",
      displayMode: "percentage",
      value: (row) => shotAccuracy(row),
    },
    {
      key: "duels",
      title: "Aerial Duels %",
      description: "Success in aerial duels per matchday.",
      color: "#f59e0b",
      displayMode: "percentage",
      value: (row) => aerialDuelPercentage(row),
    },
  ];

  const numericMetrics: Array<{
    key: string;
    title: string;
    description: string;
    color: string;
    displayMode?: "raw" | "percentage" | "per90";
    value: (row: TeamDashboardMatchAggregate) => number;
  }> = [
    {
      key: "short-pass-success",
      title: "Successful Short Passes",
      description: "Successful short-pass volume per matchday.",
      color: "#38bdf8",
      displayMode: "raw",
      value: (row) => row.shortPassSuccess,
    },
    {
      key: "long-pass-success",
      title: "Successful Long Passes",
      description: "Successful long-pass volume per matchday.",
      color: "#ec4899",
      displayMode: "raw",
      value: (row) => row.longPassSuccess,
    },
    {
      key: "cross-success",
      title: "Successful Crosses",
      description: "Successful cross volume per matchday.",
      color: "#06b6d4",
      displayMode: "raw",
      value: (row) => row.crossSuccess,
    },
    {
      key: "individual-actions-success",
      title: "Successful Individual Actions",
      description: "Successful individual-action volume per matchday.",
      color: "#84cc16",
      displayMode: "raw",
      value: (row) => row.dribbleSuccess,
    },
    {
      key: "throw-ins-success",
      title: "Throw-ins Certos",
      description: "Successful throw-in volume per matchday.",
      color: "#a78bfa",
      displayMode: "raw",
      value: (row) => row.throwSuccess,
    },
    {
      key: "shots-total",
      title: "Shots",
      description: "Total shot volume per matchday.",
      color: "#f97316",
      displayMode: "raw",
      value: (row) => row.shotsOnTarget + row.shotsOffTarget,
    },
    {
      key: "aerial-duels-success",
      title: "Aerial Duels Won",
      description: "Aerial duels won per matchday.",
      color: "#f59e0b",
      displayMode: "raw",
      value: (row) => row.aerialDuelSuccess,
    },
    {
      key: "recoveries",
      title: "Recoveries",
      description: "Recovery volume per matchday.",
      color: "#22c55e",
      displayMode: "raw",
      value: (row) => row.recoveries,
    },
    {
      key: "interceptions",
      title: "Interceptions",
      description: "Interception volume per matchday.",
      color: "#14b8a6",
      displayMode: "raw",
      value: (row) => row.interceptions,
    },
    {
      key: "possession-losses",
      title: "Possession Losses",
      description: "Possession-loss volume per matchday.",
      color: "#ef4444",
      displayMode: "raw",
      value: (row) => row.possessionLosses,
    },
    {
      key: "goals",
      title: "Goals Scored",
      description: "Goals scored per matchday.",
      color: "#eab308",
      displayMode: "raw",
      value: (row) => row.goals,
    },
  ];

  return [...percentageMetrics, ...numericMetrics].map((metric) => ({
    key: metric.key,
    title: metric.title,
    description: metric.description,
    color: metric.color,
    displayMode: metric.displayMode ?? "percentage",
    data: rows.map((row) => ({
      matchLabel: formatMatchLabel(row),
      matchdayNumber: row.matchdayNumber,
      opponentTeamName: row.opponentTeamName,
      team: metric.value(row),
    })),
  }));
}
