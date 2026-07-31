import type { TeamDashboardMatchAggregate } from "@/lib/data";

export type TeamDashboardTotals = Omit<
  TeamDashboardMatchAggregate,
  "matchId" | "matchdayNumber" | "date" | "opponentTeamName" | "manualPossessionLosses"
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
  defensivePositioningToCorrect: 0,
  throughPasses: 0,
  runsInBehind: 0,
  setPieceCrossSuccess: 0,
  setPieceCrossFail: 0,
  interceptedCrosses: 0,
  goals: 0,
  assists: 0,
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

function formatMatchLabel(row: TeamDashboardMatchAggregate, teamName: string) {
  return `${teamName} x ${row.opponentTeamName} (Matchday ${row.matchdayNumber})`;
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
      defensivePositioningToCorrect: acc.defensivePositioningToCorrect + toSafeNumber(row.defensivePositioningToCorrect),
      throughPasses: acc.throughPasses + toSafeNumber(row.throughPasses),
      runsInBehind: acc.runsInBehind + toSafeNumber(row.runsInBehind),
      setPieceCrossSuccess: acc.setPieceCrossSuccess + toSafeNumber(row.setPieceCrossSuccess),
      setPieceCrossFail: acc.setPieceCrossFail + toSafeNumber(row.setPieceCrossFail),
      interceptedCrosses: acc.interceptedCrosses + toSafeNumber(row.interceptedCrosses),
      goals: acc.goals + toSafeNumber(row.goals),
      assists: acc.assists + toSafeNumber(row.assists),
      foulsSuffered: acc.foulsSuffered + toSafeNumber(row.foulsSuffered),
      foulsCommitted: acc.foulsCommitted + toSafeNumber(row.foulsCommitted),
      recoveries: acc.recoveries + toSafeNumber(row.recoveries),
      interceptions: acc.interceptions + toSafeNumber(row.interceptions),
      offsides: acc.offsides + toSafeNumber(row.offsides),
      possessionLosses: acc.possessionLosses + (row.manualPossessionLosses
        ? toSafeNumber(row.possessionLosses)
        : toSafeNumber(row.shortPassFail) + toSafeNumber(row.longPassFail) +
          toSafeNumber(row.crossFail) + toSafeNumber(row.dribbleFail) +
          toSafeNumber(row.throwFail) + toSafeNumber(row.shotsOffTarget) +
          toSafeNumber(row.possessionLosses)),
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
      metric: "Short Passes",
      success: totals.shortPassSuccess,
      fail: totals.shortPassFail,
      percentage: percent(totals.shortPassSuccess, totals.shortPassFail),
    },
    {
      metric: "Long Passes",
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
      metric: "Set-Piece Crosses",
      success: totals.setPieceCrossSuccess,
      fail: totals.setPieceCrossFail,
      percentage: percent(totals.setPieceCrossSuccess, totals.setPieceCrossFail),
    },
    {
      metric: "Saves (GK)",
      success: totals.saves,
      fail: totals.incompleteSaves,
      percentage: percent(totals.saves, totals.incompleteSaves),
    },
  ];
}

export function buildTeamNumericRows(
  totals: TeamDashboardTotals,
  matchCount: number,
): TeamNumericRow[] {
  const totalMinutes = matchCount * 90;
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
    { metric: "Defensive Positioning to Correct", total: totals.defensivePositioningToCorrect, per90: per90(totals.defensivePositioningToCorrect, totalMinutes) },
    { metric: "Through Passes", total: totals.throughPasses, per90: per90(totals.throughPasses, totalMinutes) },
    { metric: "Runs in Behind", total: totals.runsInBehind, per90: per90(totals.runsInBehind, totalMinutes) },
    { metric: "Intercepted Crosses", total: totals.interceptedCrosses, per90: per90(totals.interceptedCrosses, totalMinutes) },
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
    {
      metric: "Assists",
      total: totals.assists,
      per90: per90(totals.assists, totalMinutes),
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
  const matchCount = rows.length;
  const goalsPerMatchday = matchCount ? totals.goals / matchCount : 0;
  const efficiencyDescription = `Weighted efficiency across ${matchCount} recorded matchday(s).`;

  return [
    {
      title: "Average Short Pass Efficiency",
      value: `${formatMetric(percent(totals.shortPassSuccess, totals.shortPassFail))}%`,
      description: efficiencyDescription,
    },
    {
      title: "Average Long Pass Efficiency",
      value: `${formatMetric(percent(totals.longPassSuccess, totals.longPassFail))}%`,
      description: efficiencyDescription,
    },
    {
      title: "Average Cross Efficiency",
      value: `${formatMetric(percent(totals.crossSuccess, totals.crossFail))}%`,
      description: efficiencyDescription,
    },
    {
      title: "Average Set-Piece Cross Efficiency",
      value: `${formatMetric(percent(totals.setPieceCrossSuccess, totals.setPieceCrossFail))}%`,
      description: efficiencyDescription,
    },
    {
      title: "Average Individual Action Efficiency",
      value: `${formatMetric(percent(totals.dribbleSuccess, totals.dribbleFail))}%`,
      description: efficiencyDescription,
    },
    {
      title: "Average Throw-in Efficiency",
      value: `${formatMetric(percent(totals.throwSuccess, totals.throwFail))}%`,
      description: efficiencyDescription,
    },
    {
      title: "Average Shot Efficiency",
      value: `${formatMetric(percent(totals.shotsOnTarget, totals.shotsOffTarget))}%`,
      description: efficiencyDescription,
    },
    {
      title: "Average Aerial Duel Efficiency",
      value: `${formatMetric(percent(totals.aerialDuelSuccess, totals.aerialDuelFail))}%`,
      description: efficiencyDescription,
    },
    {
      title: "Average Defensive Duel Efficiency",
      value: `${formatMetric(percent(totals.defensiveDuelSuccess, totals.defensiveDuelFail))}%`,
      description: efficiencyDescription,
    },
    {
      title: "Average Save Efficiency",
      value: `${formatMetric(percent(totals.saves, totals.incompleteSaves))}%`,
      description: efficiencyDescription,
    },
    {
      title: "Goals per Matchday",
      value: formatMetric(goalsPerMatchday),
      description: `${matchCount} matchdays in the filtered period.`,
    },
  ];
}

export function buildTeamAnalyticsTableRows(
  totals: TeamDashboardTotals,
  matchCount: number,
): TeamAnalyticsTableRow[] {
  const totalMinutes = matchCount * 90;

  return [
    {
      metric: "Short Passes",
      total: totals.shortPassSuccess + totals.shortPassFail,
      percentage: percent(totals.shortPassSuccess, totals.shortPassFail),
      per90: per90(totals.shortPassSuccess + totals.shortPassFail, totalMinutes),
    },
    {
      metric: "Long Passes",
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
      per90: per90(totals.defensiveDuelSuccess + totals.defensiveDuelFail, totalMinutes),
    },
    {
      metric: "Set-Piece Crosses",
      total: totals.setPieceCrossSuccess + totals.setPieceCrossFail,
      percentage: percent(totals.setPieceCrossSuccess, totals.setPieceCrossFail),
      per90: per90(totals.setPieceCrossSuccess + totals.setPieceCrossFail, totalMinutes),
    },
  ];
}

function teamMatchPossessionLosses(row: TeamDashboardMatchAggregate) {
  if (row.manualPossessionLosses) {
    return row.possessionLosses;
  }

  return (
    row.shortPassFail +
    row.longPassFail +
    row.crossFail +
    row.dribbleFail +
    row.throwFail +
    row.shotsOffTarget +
    row.possessionLosses
  );
}

function teamMatchTotalActions(row: TeamDashboardMatchAggregate) {
  const recordedFailedPossessionActions =
    row.shortPassFail +
    row.longPassFail +
    row.crossFail +
    row.dribbleFail +
    row.throwFail +
    row.shotsOffTarget;
  const additionalPossessionLosses = row.manualPossessionLosses
    ? Math.max(0, row.possessionLosses - recordedFailedPossessionActions)
    : row.possessionLosses;

  return (
    row.shortPassSuccess +
    row.shortPassFail +
    row.longPassSuccess +
    row.longPassFail +
    row.crossSuccess +
    row.crossFail +
    row.dribbleSuccess +
    row.dribbleFail +
    row.throwSuccess +
    row.throwFail +
    row.shotsOnTarget +
    row.shotsOffTarget +
    row.aerialDuelSuccess +
    row.aerialDuelFail +
    row.defensiveDuelSuccess +
    row.defensiveDuelFail +
    row.defensivePositioningToCorrect +
    row.throughPasses +
    row.runsInBehind +
    row.setPieceCrossSuccess +
    row.setPieceCrossFail +
    row.interceptedCrosses +
    row.goals +
    row.assists +
    row.foulsSuffered +
    row.foulsCommitted +
    row.recoveries +
    row.interceptions +
    row.offsides +
    additionalPossessionLosses +
    row.responsibilityGoal +
    row.yellowCards +
    row.redCards +
    row.saves +
    row.incompleteSaves
  );
}

export function buildTeamEvolutionCharts(
  rows: TeamDashboardMatchAggregate[],
  teamName: string,
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
      title: "Short Pass Accuracy %",
      description: "Short-pass accuracy by matchday.",
      color: "#00e7ff",
      value: (row) => percent(row.shortPassSuccess, row.shortPassFail),
    },
    {
      key: "long-pass",
      title: "Long Pass Accuracy %",
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
      key: "set-piece-crossing",
      title: "Set-Piece Crosses %",
      description: "Set-piece cross efficiency by matchday.",
      color: "#0891b2",
      value: (row) => percent(row.setPieceCrossSuccess, row.setPieceCrossFail),
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
    {
      key: "defensive-duels",
      title: "Defensive Duels %",
      description: "Defensive-duel efficiency by matchday.",
      color: "#10b981",
      displayMode: "percentage",
      value: (row) => percent(row.defensiveDuelSuccess, row.defensiveDuelFail),
    },
    {
      key: "saves",
      title: "Save Efficiency %",
      description: "Goalkeeper save efficiency by matchday.",
      color: "#3b82f6",
      displayMode: "percentage",
      value: (row) => percent(row.saves, row.incompleteSaves),
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
      key: "total-actions",
      title: "Total Actions",
      description: "All recorded team actions by matchday.",
      color: "#00e7ff",
      displayMode: "raw",
      value: (row) => teamMatchTotalActions(row),
    },
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
      key: "set-piece-cross-success",
      title: "Successful Set-Piece Crosses",
      description: "Successful set-piece cross volume per matchday.",
      color: "#0891b2",
      displayMode: "raw",
      value: (row) => row.setPieceCrossSuccess,
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
      title: "Successful Throw-ins",
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
      key: "defensive-duels-success",
      title: "Defensive Duels Won",
      description: "Defensive duels won per matchday.",
      color: "#10b981",
      displayMode: "raw",
      value: (row) => row.defensiveDuelSuccess,
    },
    {
      key: "defensive-positioning",
      title: "Defensive Positioning to Correct",
      description: "Defensive positioning corrections per matchday.",
      color: "#fb7185",
      displayMode: "raw",
      value: (row) => row.defensivePositioningToCorrect,
    },
    {
      key: "through-passes",
      title: "Through Passes",
      description: "Through-pass volume per matchday.",
      color: "#8b5cf6",
      displayMode: "raw",
      value: (row) => row.throughPasses,
    },
    {
      key: "runs-in-behind",
      title: "Runs in Behind",
      description: "Runs in behind per matchday.",
      color: "#d946ef",
      displayMode: "raw",
      value: (row) => row.runsInBehind,
    },
    {
      key: "intercepted-crosses",
      title: "Intercepted Crosses",
      description: "Intercepted crosses per matchday.",
      color: "#0d9488",
      displayMode: "raw",
      value: (row) => row.interceptedCrosses,
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
      value: (row) => teamMatchPossessionLosses(row),
    },
    {
      key: "fouls-won",
      title: "Fouls Won",
      description: "Fouls won per matchday.",
      color: "#2dd4bf",
      displayMode: "raw",
      value: (row) => row.foulsSuffered,
    },
    {
      key: "fouls-committed",
      title: "Fouls Committed",
      description: "Fouls committed per matchday.",
      color: "#f43f5e",
      displayMode: "raw",
      value: (row) => row.foulsCommitted,
    },
    {
      key: "offsides",
      title: "Offsides",
      description: "Offsides per matchday.",
      color: "#e879f9",
      displayMode: "raw",
      value: (row) => row.offsides,
    },
    {
      key: "goals",
      title: "Goals Scored",
      description: "Goals scored per matchday.",
      color: "#eab308",
      displayMode: "raw",
      value: (row) => row.goals,
    },
    {
      key: "assists",
      title: "Assists",
      description: "Assists per matchday.",
      color: "#a3e635",
      displayMode: "raw",
      value: (row) => row.assists,
    },
    {
      key: "errors-leading-to-goals",
      title: "Errors Leading to Goals",
      description: "Errors leading to goals per matchday.",
      color: "#dc2626",
      displayMode: "raw",
      value: (row) => row.responsibilityGoal,
    },
    {
      key: "yellow-cards",
      title: "Yellow Cards",
      description: "Yellow cards per matchday.",
      color: "#facc15",
      displayMode: "raw",
      value: (row) => row.yellowCards,
    },
    {
      key: "red-cards",
      title: "Red Cards",
      description: "Red cards per matchday.",
      color: "#ef4444",
      displayMode: "raw",
      value: (row) => row.redCards,
    },
    {
      key: "goalkeeper-saves",
      title: "Saves",
      description: "Goalkeeper saves per matchday.",
      color: "#60a5fa",
      displayMode: "raw",
      value: (row) => row.saves,
    },
    {
      key: "incomplete-saves",
      title: "Incomplete Saves",
      description: "Incomplete goalkeeper saves per matchday.",
      color: "#818cf8",
      displayMode: "raw",
      value: (row) => row.incompleteSaves,
    },
    {
      key: "shots-faced",
      title: "Shots Faced",
      description: "Shots faced per matchday.",
      color: "#6366f1",
      displayMode: "raw",
      value: (row) => row.shotsConceded,
    },
    {
      key: "goals-conceded",
      title: "Goals Conceded",
      description: "Goals conceded per matchday.",
      color: "#be123c",
      displayMode: "raw",
      value: (row) => row.goalsConceded,
    },
  ];

  return [...percentageMetrics, ...numericMetrics].map((metric) => ({
    key: metric.key,
    title: metric.title,
    description: metric.description,
    color: metric.color,
    displayMode: metric.displayMode ?? "percentage",
    data: rows.map((row) => ({
      matchLabel: formatMatchLabel(row, teamName),
      matchdayNumber: row.matchdayNumber,
      opponentTeamName: row.opponentTeamName,
      team: metric.value(row),
    })),
  }));
}
