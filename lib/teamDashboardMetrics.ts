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
  return `Feirense x ${row.opponentTeamName} (Jornada ${row.matchdayNumber})`;
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
    { label: "Ações Individuais Certas", total: totals.dribbleSuccess },
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
      metric: "Lançamentos Laterais",
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
    {
      metric: "Recuperações",
      total: totals.recoveries,
      per90: per90(totals.recoveries, totalMinutes),
    },
    {
      metric: "Interceções",
      total: totals.interceptions,
      per90: per90(totals.interceptions, totalMinutes),
    },
    {
      metric: "Foras de Jogo",
      total: totals.offsides,
      per90: per90(totals.offsides, totalMinutes),
    },
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
    {
      metric: "Cartões Vermelhos",
      total: totals.redCards,
      per90: per90(totals.redCards, totalMinutes),
    },
    {
      metric: "Responsabilidade em Golos",
      total: totals.responsibilityGoal,
      per90: per90(totals.responsibilityGoal, totalMinutes),
    },
    {
      metric: "Remates Sofridos",
      total: totals.shotsConceded,
      per90: per90(totals.shotsConceded, totalMinutes),
    },
    {
      metric: "Remates",
      total: totalShots,
      per90: per90(totalShots, totalMinutes),
    },
    {
      metric: "Golos Sofridos",
      total: totals.goalsConceded,
      per90: per90(totals.goalsConceded, totalMinutes),
    },
    {
      metric: "Golos Marcados",
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
      title: "Média Passe Curto",
      value: `${formatMetric(shortPassAverage)}%`,
      description: "Percentagem média por jornada no filtro atual.",
    },
    {
      title: "Média Passe Longo",
      value: `${formatMetric(longPassAverage)}%`,
      description: "Capacidade média de ligar jogo longo.",
    },
    {
      title: "Média Cruzamento",
      value: `${formatMetric(crossAverage)}%`,
      description: "Qualidade média da bola colocada na área.",
    },
    {
      title: "Média Ações Individuais",
      value: `${formatMetric(dribbleAverage)}%`,
      description: "Sucesso médio nas ações individuais.",
    },
    {
      title: "Média Duelos Aéreos",
      value: `${formatMetric(aerialDuelAverage)}%`,
      description: "Sucesso médio nos duelos aéreos.",
    },
    {
      title: "Média Eficácia de Remate",
      value: `${formatMetric(shotAccuracyAverage)}%`,
      description: "Remates enquadrados face ao total de remates.",
    },
    {
      title: "Média Lançamentos Laterais",
      value: `${formatMetric(throwInAverage)}%`,
      description: "Sucesso médio nos lançamentos laterais.",
    },
    {
      title: "Golos por Jornada",
      value: formatMetric(goalsPer90),
      description: `${rows.length} jornadas no período filtrado.`,
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
      metric: "Cruzamentos",
      total: totals.crossSuccess + totals.crossFail,
      percentage: percent(totals.crossSuccess, totals.crossFail),
      per90: per90(totals.crossSuccess + totals.crossFail, totalMinutes),
    },
    {
      metric: "Ações Individuais",
      total: totals.dribbleSuccess + totals.dribbleFail,
      percentage: percent(totals.dribbleSuccess, totals.dribbleFail),
      per90: per90(totals.dribbleSuccess + totals.dribbleFail, totalMinutes),
    },
    {
      metric: "Lançamentos Laterais",
      total: totals.throwSuccess + totals.throwFail,
      percentage: percent(totals.throwSuccess, totals.throwFail),
      per90: per90(totals.throwSuccess + totals.throwFail, totalMinutes),
    },
    {
      metric: "Remates",
      total: totals.shotsOnTarget + totals.shotsOffTarget,
      percentage: percent(totals.shotsOnTarget, totals.shotsOffTarget),
      per90: per90(totals.shotsOnTarget + totals.shotsOffTarget, totalMinutes),
    },
    {
      metric: "Duelos Aéreos",
      total: totals.aerialDuelSuccess + totals.aerialDuelFail,
      percentage: percent(totals.aerialDuelSuccess, totals.aerialDuelFail),
      per90: per90(totals.aerialDuelSuccess + totals.aerialDuelFail, totalMinutes),
    },
    {
      metric: "Duelos Defensivos",
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
      description: "Precisão de passe curto jornada a jornada.",
      color: "#00e7ff",
      value: (row) => percent(row.shortPassSuccess, row.shortPassFail),
    },
    {
      key: "long-pass",
      title: "Passe Longo %",
      description: "Capacidade de ligar jogo longo com qualidade.",
      color: "#ff2ea6",
      value: (row) => percent(row.longPassSuccess, row.longPassFail),
    },
    {
      key: "crossing",
      title: "Cruzamentos %",
      description: "Eficiência da equipa nas bolas colocadas na área.",
      color: "#22d3ee",
      value: (row) => percent(row.crossSuccess, row.crossFail),
    },
    {
      key: "individual-actions",
      title: "Ações Individuais %",
      description: "Sucesso das ações individuais por jornada.",
      color: "#84cc16",
      value: (row) => percent(row.dribbleSuccess, row.dribbleFail),
    },
    {
      key: "throw-ins",
      title: "Lançamentos Laterais %",
      description: "Sucesso nos lançamentos laterais por jornada.",
      color: "#a78bfa",
      displayMode: "percentage",
      value: (row) => throwInAccuracy(row),
    },
    {
      key: "shot-accuracy",
      title: "Eficácia de Remate %",
      description: "Remates enquadrados face ao total de remates por jornada.",
      color: "#f97316",
      displayMode: "percentage",
      value: (row) => shotAccuracy(row),
    },
    {
      key: "duels",
      title: "Duelos Aéreos %",
      description: "Sucesso nos duelos aéreos por jornada.",
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
      title: "Passes Curtos Certos",
      description: "Volume de passes curtos certos por jornada.",
      color: "#38bdf8",
      displayMode: "raw",
      value: (row) => row.shortPassSuccess,
    },
    {
      key: "long-pass-success",
      title: "Passes Longos Certos",
      description: "Volume de passes longos certos por jornada.",
      color: "#ec4899",
      displayMode: "raw",
      value: (row) => row.longPassSuccess,
    },
    {
      key: "cross-success",
      title: "Cruzamentos Certos",
      description: "Volume de cruzamentos certos por jornada.",
      color: "#06b6d4",
      displayMode: "raw",
      value: (row) => row.crossSuccess,
    },
    {
      key: "individual-actions-success",
      title: "Ações Individuais Certas",
      description: "Volume de ações individuais certas por jornada.",
      color: "#84cc16",
      displayMode: "raw",
      value: (row) => row.dribbleSuccess,
    },
    {
      key: "throw-ins-success",
      title: "Lançamentos Laterais Certos",
      description: "Volume de lançamentos laterais certos por jornada.",
      color: "#a78bfa",
      displayMode: "raw",
      value: (row) => row.throwSuccess,
    },
    {
      key: "shots-total",
      title: "Remates",
      description: "Volume total de remates por jornada.",
      color: "#f97316",
      displayMode: "raw",
      value: (row) => row.shotsOnTarget + row.shotsOffTarget,
    },
    {
      key: "aerial-duels-success",
      title: "Duelos Aéreos Ganhos",
      description: "Volume de duelos aéreos ganhos por jornada.",
      color: "#f59e0b",
      displayMode: "raw",
      value: (row) => row.aerialDuelSuccess,
    },
    {
      key: "recoveries",
      title: "Recuperações",
      description: "Volume de recuperações por jornada.",
      color: "#22c55e",
      displayMode: "raw",
      value: (row) => row.recoveries,
    },
    {
      key: "interceptions",
      title: "Interceções",
      description: "Volume de interceções por jornada.",
      color: "#14b8a6",
      displayMode: "raw",
      value: (row) => row.interceptions,
    },
    {
      key: "possession-losses",
      title: "Perdas de Posse",
      description: "Volume de perdas de posse por jornada.",
      color: "#ef4444",
      displayMode: "raw",
      value: (row) => row.possessionLosses,
    },
    {
      key: "goals",
      title: "Golos Marcados",
      description: "Golos marcados por jornada.",
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
