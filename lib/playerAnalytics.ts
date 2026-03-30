import {
  getCompetitionOptions,
  getDashboardPlayersByCompetition,
  getGoalkeeperCompetitionMatchStats,
  getMatchOptionsByCompetition,
  getPlayerCompetitionMatchStats,
} from "@/lib/data";
import {
  aggregateOutfieldTotals,
  buildComparisonMetrics,
  buildGoalkeeperPercentualActions,
  buildNumericActions,
  buildPercentualActions,
  formatMetric,
  normalizeGoalkeeperRows,
  normalizeOutfieldRows,
  percent,
  type GoalkeeperMatchRow,
  type OutfieldMatchRow,
  type OutfieldTotals,
} from "@/lib/dashboardMetrics";
import {
  COMPARISON_RANKING_METRICS,
  EVOLUTION_COLORS,
  getSeriesColor,
  type ComparisonRankingMetricKey,
} from "@/lib/playerAnalyticsShared";

type SearchParamValue = string | string[] | undefined;

export type PlayerAnalyticsSearchParams = Record<string, SearchParamValue>;

export type CompetitionOption = {
  id: number;
  name: string;
};

export type PlayerOption = {
  id: number;
  name: string;
  teamName: string;
  isGoalkeeper: boolean;
};

export type MatchOption = {
  id: number;
  matchdayNumber: number;
  opponentTeamName: string;
  homeAway: "home" | "away";
  date: string;
};

export type PlayerAnalyticsBaseData = {
  competitions: CompetitionOption[];
  selectedCompetitionId?: number;
  playerOptions: PlayerOption[];
  matchOptions: MatchOption[];
  playerIdSet: Set<number>;
  matchIdSet: Set<number>;
};

export type LoadedPlayerAnalyticsData = {
  playerMap: Map<number, PlayerOption>;
  outfieldRowsByPlayer: Map<number, OutfieldMatchRow[]>;
  goalkeeperRowsByPlayer: Map<number, GoalkeeperMatchRow[]>;
};

export type OverviewStat = {
  title: string;
  value: string | number;
  description?: string;
};

export type PercentageRow = {
  metric: string;
  success: number;
  fail: number;
  percentage: number;
};

export type NumericRow = {
  metric: string;
  total: string | number;
  per90?: number;
};

export type ComparisonSummaryRow = {
  label: string;
  shortPassAccuracy: number;
  longPassAccuracy: number;
  crossAccuracy: number;
  individualActionAccuracy: number;
  throwAccuracy: number;
  shotAccuracy: number;
  duelAccuracy: number;
  recoveries: number;
  interceptions: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
};

export type ActionProfilePoint = {
  metric: string;
  value: number;
};

export type ActionProfileScope = {
  key: string;
  label: string;
  totals: OutfieldTotals;
};

export type ActionProfileSeries = {
  dataKey: string;
  label: string;
  color: string;
};

export type ActionProfileComparisonPoint = {
  metric: string;
  [key: string]: string | number;
};

export type EvolutionMetricKey =
  | "shortPassSuccess"
  | "longPassSuccess"
  | "crossSuccess"
  | "dribbleSuccess"
  | "throwSuccess"
  | "shotsOnTarget"
  | "aerialDuelSuccess"
  | "defensiveDuelSuccess";

export type EvolutionMetricDefinition = {
  key: EvolutionMetricKey;
  label: string;
};

export type EvolutionLine = {
  playerId: number;
  dataKey: string;
  label: string;
  color: string;
};

export type EvolutionPoint = {
  matchLabel: string;
  [key: string]: string | number;
};

const ACTION_PROFILE_DEFINITIONS = [
  {
    label: "Passes Curtos",
    value: (totals: OutfieldTotals) => totals.shortPassSuccess + totals.shortPassFail,
  },
  {
    label: "Passes Longos",
    value: (totals: OutfieldTotals) => totals.longPassSuccess + totals.longPassFail,
  },
  {
    label: "Cruzamentos",
    value: (totals: OutfieldTotals) => totals.crossSuccess + totals.crossFail,
  },
  {
    label: "Acoes Individuais",
    value: (totals: OutfieldTotals) => totals.dribbleSuccess + totals.dribbleFail,
  },
  {
    label: "Lancamentos",
    value: (totals: OutfieldTotals) => totals.throwSuccess + totals.throwFail,
  },
  {
    label: "Remates",
    value: (totals: OutfieldTotals) => totals.shotsOnTarget + totals.shotsOffTarget,
  },
  {
    label: "Duelos Aereos",
    value: (totals: OutfieldTotals) => totals.aerialDuelSuccess + totals.aerialDuelFail,
  },
  {
    label: "Duelos Defensivos",
    value: (totals: OutfieldTotals) =>
      totals.defensiveDuelSuccess + totals.defensiveDuelFail,
  },
] as const;

export const EVOLUTION_METRICS: EvolutionMetricDefinition[] = [
  { key: "shortPassSuccess", label: "Passes Curtos Sucesso" },
  { key: "longPassSuccess", label: "Passes Longos Sucesso" },
  { key: "crossSuccess", label: "Cruzamentos Sucesso" },
  { key: "dribbleSuccess", label: "Acoes Individuais Sucesso" },
  { key: "throwSuccess", label: "Lancamentos Sucesso" },
  { key: "shotsOnTarget", label: "Remates Enquadrados" },
  { key: "aerialDuelSuccess", label: "Duelos Aereos Sucesso" },
  { key: "defensiveDuelSuccess", label: "Duelos Defensivos Sucesso" },
];

export { COMPARISON_RANKING_METRICS, EVOLUTION_COLORS, getSeriesColor };
export type { ComparisonRankingMetricKey };

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

export function mergeSelectedIds(single?: number, multiple: number[] = []) {
  return [...new Set([...(single ? [single] : []), ...multiple])];
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

export async function getPlayerAnalyticsBaseData(
  params: PlayerAnalyticsSearchParams,
): Promise<PlayerAnalyticsBaseData> {
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
      playerOptions: [],
      matchOptions: [],
      playerIdSet: new Set<number>(),
      matchIdSet: new Set<number>(),
    };
  }

  const [playerOptions, matchOptions] = await Promise.all([
    getDashboardPlayersByCompetition(selectedCompetitionId),
    getMatchOptionsByCompetition(selectedCompetitionId),
  ]);

  return {
    competitions,
    selectedCompetitionId,
    playerOptions: playerOptions as PlayerOption[],
    matchOptions: matchOptions as MatchOption[],
    playerIdSet: new Set(playerOptions.map((player) => player.id)),
    matchIdSet: new Set(matchOptions.map((match) => match.id)),
  };
}

export async function loadPlayerAnalyticsData(options: {
  competitionId?: number;
  playerOptions: PlayerOption[];
  playerIds: number[];
  matchIds?: number[];
}): Promise<LoadedPlayerAnalyticsData> {
  const { competitionId, playerOptions, playerIds, matchIds } = options;
  const playerMap = new Map(playerOptions.map((player) => [player.id, player]));
  const outfieldRowsByPlayer = new Map<number, OutfieldMatchRow[]>();
  const goalkeeperRowsByPlayer = new Map<number, GoalkeeperMatchRow[]>();

  if (!competitionId || playerIds.length === 0) {
    return {
      playerMap,
      outfieldRowsByPlayer,
      goalkeeperRowsByPlayer,
    };
  }

  await Promise.all(
    playerIds.map(async (playerId) => {
      const player = playerMap.get(playerId);
      const outfieldRowsRaw = await getPlayerCompetitionMatchStats(
        playerId,
        competitionId,
        matchIds && matchIds.length > 0 ? matchIds : undefined,
      );

      outfieldRowsByPlayer.set(
        playerId,
        normalizeOutfieldRows(outfieldRowsRaw as Array<Record<string, unknown>>, {
          id: playerId,
          name: player?.name ?? `Jogador ${playerId}`,
        }),
      );

      if (!player?.isGoalkeeper) {
        return;
      }

      const goalkeeperRowsRaw = await getGoalkeeperCompetitionMatchStats(
        playerId,
        competitionId,
        matchIds && matchIds.length > 0 ? matchIds : undefined,
      );

      goalkeeperRowsByPlayer.set(
        playerId,
        normalizeGoalkeeperRows(
          goalkeeperRowsRaw as Array<Record<string, unknown>>,
          playerId,
        ),
      );
    }),
  );

  return {
    playerMap,
    outfieldRowsByPlayer,
    goalkeeperRowsByPlayer,
  };
}

export function buildMetricEvolutionData(
  metricKey: EvolutionMetricKey,
  rowsByPlayer: Map<number, OutfieldMatchRow[]>,
  lines: EvolutionLine[],
): EvolutionPoint[] {
  const linesByPlayer = new Map(lines.map((line) => [line.playerId, line]));
  const byMatch = new Map<
    number,
    { matchdayNumber: number; date: string; opponentTeamName: string; values: Record<string, number> }
  >();

  for (const [playerId, rows] of rowsByPlayer.entries()) {
    const line = linesByPlayer.get(playerId);

    if (!line) {
      continue;
    }

    for (const row of rows) {
      const current = byMatch.get(row.matchId) ?? {
        matchdayNumber: row.matchdayNumber,
        date: row.date,
        opponentTeamName: row.opponentTeamName,
        values: {},
      };

      current.values[line.dataKey] = Number(row[metricKey] ?? 0);
      current.values[`${line.dataKey}__minutes`] = Number(row.minutesPlayed ?? 0);
      byMatch.set(row.matchId, current);
    }
  }

  return [...byMatch.values()]
    .sort((a, b) => a.matchdayNumber - b.matchdayNumber || a.date.localeCompare(b.date))
    .map((entry) => {
      const point: EvolutionPoint = {
        matchLabel: `Feirense vs ${entry.opponentTeamName} - Jornada ${entry.matchdayNumber}`,
        matchdayNumber: entry.matchdayNumber,
        opponentTeamName: entry.opponentTeamName,
      };

      for (const line of lines) {
        point[line.dataKey] = entry.values[line.dataKey] ?? 0;
        point[`${line.dataKey}__minutes`] = entry.values[`${line.dataKey}__minutes`] ?? 0;
      }

      return point;
    });
}

export function buildPlayerOverviewStats(
  totals: OutfieldTotals,
  matchesPlayed: number,
): OverviewStat[] {
  const metrics = buildComparisonMetrics(totals);
  const numeric = buildNumericActions(
    totals,
    {
      minutesPlayed: 0,
      saves: 0,
      incompleteSaves: 0,
      shotsConceded: 0,
      goalsConceded: 0,
    },
    matchesPlayed,
  );

  return [
    { title: "Golos", value: totals.goals },
    { title: "Assistencias", value: totals.assists },
    { title: "Precisao de Passe", value: `${formatMetric(metrics.passAccuracy)}%` },
    {
      title: "Precisao de Remate",
      value: `${formatMetric(percent(totals.shotsOnTarget, totals.shotsOffTarget))}%`,
    },
    { title: "Minutos", value: totals.minutesPlayed },
    { title: "Acoes / 90", value: formatMetric(numeric.actionsPer90) },
  ];
}

export function buildPlayerPercentageRows(totals: OutfieldTotals): PercentageRow[] {
  const percentualActions = buildPercentualActions(totals);

  return [
    {
      metric: "Passe Curto",
      success: percentualActions.shortPass.success,
      fail: percentualActions.shortPass.fail,
      percentage: percentualActions.shortPass.percentage,
    },
    {
      metric: "Passe Longo",
      success: percentualActions.longPass.success,
      fail: percentualActions.longPass.fail,
      percentage: percentualActions.longPass.percentage,
    },
    {
      metric: "Cruzamentos",
      success: percentualActions.cross.success,
      fail: percentualActions.cross.fail,
      percentage: percentualActions.cross.percentage,
    },
    {
      metric: "Acoes Individuais",
      success: percentualActions.dribble.success,
      fail: percentualActions.dribble.fail,
      percentage: percentualActions.dribble.percentage,
    },
    {
      metric: "Lancamentos",
      success: percentualActions.throw.success,
      fail: percentualActions.throw.fail,
      percentage: percentualActions.throw.percentage,
    },
    {
      metric: "Remates",
      success: percentualActions.shot.success,
      fail: percentualActions.shot.fail,
      percentage: percentualActions.shot.percentage,
    },
    {
      metric: "Duelos Aereos",
      success: percentualActions.aerialDuel.success,
      fail: percentualActions.aerialDuel.fail,
      percentage: percentualActions.aerialDuel.percentage,
    },
    {
      metric: "Duelos Defensivos",
      success: percentualActions.defensiveDuel.success,
      fail: percentualActions.defensiveDuel.fail,
      percentage: percentualActions.defensiveDuel.percentage,
    },
  ];
}

export function buildGoalkeeperSummary(goalkeeperRows: GoalkeeperMatchRow[]) {
  return buildGoalkeeperPercentualActions(
    goalkeeperRows.reduce(
      (acc, row) => ({
        minutesPlayed: acc.minutesPlayed + row.minutesPlayed,
        saves: acc.saves + row.saves,
        incompleteSaves: acc.incompleteSaves + row.incompleteSaves,
        shotsConceded: acc.shotsConceded + row.shotsConceded,
        goalsConceded: acc.goalsConceded + row.goalsConceded,
      }),
      {
        minutesPlayed: 0,
        saves: 0,
        incompleteSaves: 0,
        shotsConceded: 0,
        goalsConceded: 0,
      },
    ),
  );
}

export function buildPlayerNumericRows(options: {
  totals: OutfieldTotals;
  goalkeeperRows?: GoalkeeperMatchRow[];
  matchesPlayed: number;
}): NumericRow[] {
  const goalkeeperTotals = options.goalkeeperRows
    ? options.goalkeeperRows.reduce(
        (acc, row) => ({
          minutesPlayed: acc.minutesPlayed + row.minutesPlayed,
          saves: acc.saves + row.saves,
          incompleteSaves: acc.incompleteSaves + row.incompleteSaves,
          shotsConceded: acc.shotsConceded + row.shotsConceded,
          goalsConceded: acc.goalsConceded + row.goalsConceded,
        }),
        {
          minutesPlayed: 0,
          saves: 0,
          incompleteSaves: 0,
          shotsConceded: 0,
          goalsConceded: 0,
        },
      )
    : {
        minutesPlayed: 0,
        saves: 0,
        incompleteSaves: 0,
        shotsConceded: 0,
        goalsConceded: 0,
      };

  const numericActions = buildNumericActions(
    options.totals,
    goalkeeperTotals,
    options.matchesPlayed,
  );

  return [
    {
      metric: "Faltas Sofridas",
      total: numericActions.foulsSufferedTotal,
      per90: numericActions.foulsSufferedPer90,
    },
    {
      metric: "Faltas Cometidas",
      total: numericActions.foulsCommittedTotal,
      per90: numericActions.foulsCommittedPer90,
    },
    {
      metric: "Recuperacoes",
      total: numericActions.recoveriesTotal,
      per90: numericActions.recoveriesPer90,
    },
    {
      metric: "Intercecoes",
      total: numericActions.interceptionsTotal,
      per90: numericActions.interceptionsPer90,
    },
    {
      metric: "Foras de Jogo",
      total: numericActions.offsidesTotal,
      per90: numericActions.offsidesPer90,
    },
    {
      metric: "Perdas de Posse",
      total: numericActions.possessionLossesTotal,
      per90: numericActions.possessionLossesPer90,
    },
    {
      metric: "Cartoes Amarelos",
      total: numericActions.yellowCardsTotal,
      per90: numericActions.yellowCardsPer90,
    },
    {
      metric: "Cartoes Vermelhos",
      total: numericActions.redCardsTotal,
      per90: numericActions.redCardsPer90,
    },
    {
      metric: "Responsabilidade em Golos",
      total: numericActions.responsibilityGoalTotal,
      per90: numericActions.responsibilityGoalPer90,
    },
    {
      metric: "Remates Concedidos",
      total: numericActions.shotsConcededTotal,
      per90: numericActions.shotsConcededPer90,
    },
    {
      metric: "Golos Sofridos",
      total: numericActions.goalsConcededTotal,
      per90: numericActions.goalsConcededPer90,
    },
    { metric: "Minutos de Utilizacao", total: numericActions.minutesTotal },
    {
      metric: "Media de Utilizacao por Jogo",
      total: formatMetric(numericActions.averageMinutesPerMatch),
    },
    { metric: "Totais de Acoes", total: numericActions.totalActions },
    {
      metric: "Media de Acoes por 90",
      total: formatMetric(numericActions.actionsPer90),
      per90: numericActions.actionsPer90,
    },
  ];
}

export function buildComparisonSummaryRows(
  rows: Array<{ label: string; totals: OutfieldTotals }>,
): ComparisonSummaryRow[] {
  return rows.map((row) => {
    const metrics = buildComparisonMetrics(row.totals);
    const percentualActions = buildPercentualActions(row.totals);

    return {
      label: row.label,
      shortPassAccuracy: percentualActions.shortPass.percentage,
      longPassAccuracy: percentualActions.longPass.percentage,
      crossAccuracy: metrics.crossAccuracy,
      individualActionAccuracy: metrics.dribbleSuccess,
      throwAccuracy: percentualActions.throw.percentage,
      shotAccuracy: percentualActions.shot.percentage,
      duelAccuracy: metrics.duelSuccess,
      recoveries: row.totals.recoveries,
      interceptions: row.totals.interceptions,
      minutesPlayed: row.totals.minutesPlayed,
      goals: row.totals.goals,
      assists: row.totals.assists,
    };
  });
}

export function buildActionProfileRadarData(totals: OutfieldTotals): ActionProfilePoint[] {
  return ACTION_PROFILE_DEFINITIONS.map((definition) => ({
    metric: definition.label,
    value: definition.value(totals),
  }));
}

export function buildActionProfileComparisonData(
  scopes: ActionProfileScope[],
): {
  data: ActionProfileComparisonPoint[];
  series: ActionProfileSeries[];
} {
  return {
    data: ACTION_PROFILE_DEFINITIONS.map((definition) => {
      const point: ActionProfileComparisonPoint = { metric: definition.label };

      for (const scope of scopes) {
        point[scope.key] = definition.value(scope.totals);
      }

      return point;
    }),
    series: scopes.map((scope, index) => ({
      dataKey: scope.key,
      label: scope.label,
      color: getSeriesColor(scope.label || scope.key || index),
    })),
  };
}

export function buildPlayerActionProfileScope(
  playerId: number,
  playerName: string,
  rowsByPlayer: Map<number, OutfieldMatchRow[]>,
): ActionProfileScope {
  return {
    key: `player_${playerId}`,
    label: playerName,
    totals: aggregateOutfieldTotals(rowsByPlayer.get(playerId) ?? []),
  };
}
