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
  value: number;
};

export type TeamEvolutionChartSeries = {
  title: string;
  color: string;
  data: TeamEvolutionPoint[];
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

function formatMatchLabel(row: TeamDashboardMatchAggregate) {
  return `Feirense vs ${row.opponentTeamName} (Jornada ${row.matchdayNumber})`;
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
    { label: "Passes Curtos Certos", total: totals.shortPassSuccess },
    { label: "Passes Longos Certos", total: totals.longPassSuccess },
    { label: "Cruzamentos Certos", total: totals.crossSuccess },
    { label: "Dribles Certos", total: totals.dribbleSuccess },
    { label: "Remates", total: totals.shotsOnTarget + totals.shotsOffTarget },
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
      metric: "Cruzamentos",
      success: totals.crossSuccess,
      fail: totals.crossFail,
      percentage: percent(totals.crossSuccess, totals.crossFail),
    },
    {
      metric: "Ações Individuais",
      success: totals.dribbleSuccess,
      fail: totals.dribbleFail,
      percentage: percent(totals.dribbleSuccess, totals.dribbleFail),
    },
    {
      metric: "Lançamentos",
      success: totals.throwSuccess,
      fail: totals.throwFail,
      percentage: percent(totals.throwSuccess, totals.throwFail),
    },
    {
      metric: "Remates",
      success: totals.shotsOnTarget,
      fail: totals.shotsOffTarget,
      percentage: percent(totals.shotsOnTarget, totals.shotsOffTarget),
    },
    {
      metric: "Duelos Aéreos",
      success: totals.aerialDuelSuccess,
      fail: totals.aerialDuelFail,
      percentage: percent(totals.aerialDuelSuccess, totals.aerialDuelFail),
    },
    {
      metric: "Duelos Defensivos",
      success: totals.defensiveDuelSuccess,
      fail: totals.defensiveDuelFail,
      percentage: percent(totals.defensiveDuelSuccess, totals.defensiveDuelFail),
    },
    {
      metric: "Defesas (GR)",
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
      metric: "Faltas Sofridas",
      total: totals.foulsSuffered,
      per90: per90(totals.foulsSuffered, totalMinutes),
    },
    {
      metric: "Faltas Cometidas",
      total: totals.foulsCommitted,
      per90: per90(totals.foulsCommitted, totalMinutes),
    },
    { metric: "Recuperacoes", total: totals.recoveries, per90: per90(totals.recoveries, totalMinutes) },
    {
      metric: "Interceções",
      total: totals.interceptions,
      per90: per90(totals.interceptions, totalMinutes),
    },
    { metric: "Foras de Jogo", total: totals.offsides, per90: per90(totals.offsides, totalMinutes) },
    {
      metric: "Perdas de Posse",
      total: totals.possessionLosses,
      per90: per90(totals.possessionLosses, totalMinutes),
    },
    {
      metric: "Cartões Amarelos",
      total: totals.yellowCards,
      per90: per90(totals.yellowCards, totalMinutes),
    },
    { metric: "Cartões Vermelhos", total: totals.redCards, per90: per90(totals.redCards, totalMinutes) },
    {
      metric: "Responsabilidade em Golos",
      total: totals.responsibilityGoal,
      per90: per90(totals.responsibilityGoal, totalMinutes),
    },
    {
      metric: "Remates Concedidos",
      total: totals.shotsConceded,
      per90: per90(totals.shotsConceded, totalMinutes),
    },
    { metric: "Remates", total: totalShots, per90: per90(totalShots, totalMinutes) },
    {
      metric: "Golos Sofridos",
      total: totals.goalsConceded,
      per90: per90(totals.goalsConceded, totalMinutes),
    },
    { metric: "Golos Marcados", total: totals.goals, per90: per90(totals.goals, totalMinutes) },
  ];
}

export function buildGoalkeeperSummary(totals: TeamDashboardTotals) {
  return {
    totalSaves: totals.saves,
    totalIncompleteSaves: totals.incompleteSaves,
    savePercentage: percent(totals.saves, totals.incompleteSaves),
  };
}

export function buildTeamEvolutionCharts(
  rows: TeamDashboardMatchAggregate[],
): TeamEvolutionChartSeries[] {
  const metrics: Array<{
    title: string;
    color: string;
    value: (row: TeamDashboardMatchAggregate) => number;
  }> = [
    {
      title: "Passes Curtos Sucesso",
      color: "#00e7ff",
      value: (row) => row.shortPassSuccess,
    },
    {
      title: "Passes Longos Sucesso",
      color: "#ff2ea6",
      value: (row) => row.longPassSuccess,
    },
    {
      title: "Cruzamentos Sucesso",
      color: "#22d3ee",
      value: (row) => row.crossSuccess,
    },
    {
      title: "Ações Individuais Sucesso",
      color: "#84cc16",
      value: (row) => row.dribbleSuccess,
    },
    {
      title: "Remates",
      color: "#38bdf8",
      value: (row) => row.shotsOnTarget + row.shotsOffTarget,
    },
    {
      title: "Recuperações",
      color: "#f59e0b",
      value: (row) => row.recoveries,
    },
    {
      title: "Interceções",
      color: "#14b8a6",
      value: (row) => row.interceptions,
    },
    {
      title: "Golos Marcados",
      color: "#f43f5e",
      value: (row) => row.goals,
    },
    {
      title: "Golos Sofridos",
      color: "#c084fc",
      value: (row) => row.goalsConceded,
    },
  ];

  return metrics.map((metric) => ({
    title: metric.title,
    color: metric.color,
    data: rows.map((row) => ({
      matchLabel: formatMatchLabel(row),
      value: metric.value(row),
    })),
  }));
}
