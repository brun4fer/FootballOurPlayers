import { generatePublicReportAction } from "@/actions/reports";
import { ComparisonBarChart } from "@/components/charts/comparison-bar-chart";
import { PlayerMetricEvolutionChart } from "@/components/charts/player-metric-evolution-chart";
import { RadarComparisonChart } from "@/components/charts/radar-comparison-chart";
import { RadarProfileChart } from "@/components/charts/radar-profile-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getCompetitionOptions,
  getCompetitionPlayerTotals,
  getCompetitionTeamTotals,
  getDashboardPlayersByCompetition,
  getGoalkeeperCompetitionMatchStats,
  getMatchOptionsByCompetition,
  getPlayerCompetitionMatchStats,
} from "@/lib/data";
import {
  aggregateGoalkeeperTotals,
  aggregateOutfieldTotals,
  buildComparisonMetrics,
  buildDynamicComparisonRows,
  buildGoalkeeperPercentualActions,
  buildNumericActions,
  buildPercentualActions,
  buildRadarComparisonData,
  buildRadarProfileData,
  formatMetric,
  normalizeGoalkeeperRows,
  normalizeOutfieldRows,
  toOutfieldTotalsFromAggregate,
  type OutfieldMatchRow,
  type OutfieldTotals,
} from "@/lib/dashboardMetrics";

type DashboardJogadoresPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type EvolutionMetricKey =
  | "shortPassSuccess"
  | "longPassSuccess"
  | "crossSuccess"
  | "dribbleSuccess"
  | "throwSuccess"
  | "shotsOnTarget"
  | "aerialDuelSuccess"
  | "defensiveDuelSuccess";

type EvolutionLine = {
  playerId: number;
  dataKey: string;
  label: string;
  color: string;
};

type EvolutionPoint = {
  matchLabel: string;
  [key: string]: string | number;
};

const EVOLUTION_COLORS = ["#3b82f6", "#ff2ea6", "#00e7ff", "#84cc16", "#f97316", "#22d3ee"];

const EVOLUTION_METRICS: Array<{ key: EvolutionMetricKey; label: string }> = [
  { key: "shortPassSuccess", label: "Passes Curtos Sucesso" },
  { key: "longPassSuccess", label: "Passes Longos Sucesso" },
  { key: "crossSuccess", label: "Cruzamentos Sucesso" },
  { key: "dribbleSuccess", label: "Ações Individuais Sucesso" },
  { key: "throwSuccess", label: "Lançamentos Sucesso" },
  { key: "shotsOnTarget", label: "Remates Enquadrados" },
  { key: "aerialDuelSuccess", label: "Duelos Aéreos Sucesso" },
  { key: "defensiveDuelSuccess", label: "Duelos Defensivos Sucesso" },
];

function buildMetricEvolutionData(
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
      byMatch.set(row.matchId, current);
    }
  }

  return [...byMatch.values()]
    .sort((a, b) => a.matchdayNumber - b.matchdayNumber || a.date.localeCompare(b.date))
    .map((entry) => {
      const point: EvolutionPoint = {
        matchLabel: `Feirense vs ${entry.opponentTeamName} - Jornada ${entry.matchdayNumber}`,
      };

      for (const line of lines) {
        point[line.dataKey] = entry.values[line.dataKey] ?? 0;
      }

      return point;
    });
}

function parseOptionalId(value: string | string[] | undefined) {
  if (!value || Array.isArray(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

function parseIdList(value: string | string[] | undefined) {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const splitValues = rawValues.flatMap((item) => item.split(","));
  const parsedValues = splitValues
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0)
    .map((item) => Math.floor(item));
  return [...new Set(parsedValues)];
}

function mergeSelectedIds(single?: number, multiple: number[] = []) {
  return [...new Set([...(single ? [single] : []), ...multiple])];
}

function buildModeLabel(playerIds: number[], matchIds: number[]) {
  if (playerIds.length === 0) {
    return "Modo: Apenas competição (comparação entre todos os jogadores).";
  }
  if (playerIds.length >= 2 && matchIds.length >= 2) {
    return "Modo: Dois ou mais jogadores em múltiplas jornadas.";
  }
  if (playerIds.length >= 2) {
    return "Modo: Comparação entre jogadores.";
  }
  if (matchIds.length >= 2) {
    return "Modo: Jogador em múltiplas jornadas (comparação entre jogos).";
  }
  if (matchIds.length === 1) {
    return "Modo: Jogador + jornada selecionada.";
  }
  return "Modo: Jogador + competição.";
}

export default async function DashboardJogadoresPage({ searchParams }: DashboardJogadoresPageProps) {
  const params = (await searchParams) ?? {};

  const competitions = await getCompetitionOptions();
  const selectedCompetitionId = parseOptionalId(params.competitionId) ?? competitions[0]?.id ?? undefined;

  const [playerOptions, matchOptions] = await Promise.all([
    getDashboardPlayersByCompetition(selectedCompetitionId),
    getMatchOptionsByCompetition(selectedCompetitionId),
  ]);

  const selectedPlayerIds = mergeSelectedIds(
    parseOptionalId(params.playerId),
    parseIdList(params.playerIds),
  );
  const selectedMatchIds = mergeSelectedIds(
    parseOptionalId(params.matchId),
    parseIdList(params.matchIds),
  );
  const isSinglePlayerSelection = selectedPlayerIds.length === 1;
  const isMultiplePlayersSelection = selectedPlayerIds.length > 1;
  const hasMultipleSelectedMatchdays = selectedMatchIds.length > 1;
  const shouldShowActionSections = isSinglePlayerSelection;
  const shouldShowEvolutionCharts = hasMultipleSelectedMatchdays && selectedPlayerIds.length > 0;

  const [competitionPlayerTotals, competitionTeamTotals] = await Promise.all([
    getCompetitionPlayerTotals(selectedCompetitionId, selectedMatchIds.length ? selectedMatchIds : undefined),
    getCompetitionTeamTotals(selectedCompetitionId, selectedMatchIds.length ? selectedMatchIds : undefined),
  ]);

  const playerMap = new Map(playerOptions.map((player) => [player.id, player]));
  const outfieldRowsByPlayer = new Map<number, ReturnType<typeof normalizeOutfieldRows>>();
  const goalkeeperRowsByPlayer = new Map<number, ReturnType<typeof normalizeGoalkeeperRows>>();

  await Promise.all(
    selectedPlayerIds.map(async (playerId) => {
      const player = playerMap.get(playerId);
      const outfieldRowsRaw = await getPlayerCompetitionMatchStats(
        playerId,
        selectedCompetitionId,
        selectedMatchIds.length ? selectedMatchIds : undefined,
      );
      const outfieldRows = normalizeOutfieldRows(
        outfieldRowsRaw as Array<Record<string, unknown>>,
        { id: playerId, name: player?.name ?? "-" },
      );
      outfieldRowsByPlayer.set(playerId, outfieldRows);

      if (player?.isGoalkeeper) {
        const goalkeeperRowsRaw = await getGoalkeeperCompetitionMatchStats(
          playerId,
          selectedCompetitionId,
          selectedMatchIds.length ? selectedMatchIds : undefined,
        );
        const goalkeeperRows = normalizeGoalkeeperRows(
          goalkeeperRowsRaw as Array<Record<string, unknown>>,
          playerId,
        );
        goalkeeperRowsByPlayer.set(playerId, goalkeeperRows);
      }
    }),
  );

  const primaryPlayerId = selectedPlayerIds[0];
  const primaryPlayer = primaryPlayerId ? playerMap.get(primaryPlayerId) : undefined;
  const primaryOutfieldRows = primaryPlayerId ? outfieldRowsByPlayer.get(primaryPlayerId) ?? [] : [];
  const primaryGoalkeeperRows = primaryPlayerId ? goalkeeperRowsByPlayer.get(primaryPlayerId) ?? [] : [];
  const primaryOutfieldTotals = aggregateOutfieldTotals(primaryOutfieldRows);
  const primaryGoalkeeperTotals = aggregateGoalkeeperTotals(primaryGoalkeeperRows);
  const primaryMatchCount = new Set(primaryOutfieldRows.map((row) => row.matchId)).size;

  const percentualActions = buildPercentualActions(primaryOutfieldTotals);
  const goalkeeperPercentual = buildGoalkeeperPercentualActions(primaryGoalkeeperTotals);
  const numericActions = buildNumericActions(primaryOutfieldTotals, primaryGoalkeeperTotals, primaryMatchCount);

  const chartPlayerIds =
    selectedPlayerIds.length > 0 ? selectedPlayerIds : primaryPlayerId ? [primaryPlayerId] : [];
  const evolutionLines: EvolutionLine[] = chartPlayerIds.map((playerId, index) => ({
    playerId,
    dataKey: `player_${playerId}`,
    label: playerMap.get(playerId)?.name ?? `Jogador ${playerId}`,
    color: EVOLUTION_COLORS[index % EVOLUTION_COLORS.length],
  }));
  const chartRowsByPlayer = new Map<number, OutfieldMatchRow[]>(
    chartPlayerIds.map((playerId) => [playerId, outfieldRowsByPlayer.get(playerId) ?? []]),
  );
  const evolutionCharts = EVOLUTION_METRICS.map((metric) => ({
    label: metric.label,
    data: buildMetricEvolutionData(metric.key, chartRowsByPlayer, evolutionLines),
  }));

  const primaryRadarData = buildRadarProfileData(primaryOutfieldTotals);

  let comparisonScopes: Array<{ label: string; totals: OutfieldTotals }> = [];

  if (selectedPlayerIds.length === 0) {
    comparisonScopes = competitionPlayerTotals.map((row) => ({
      label: String(row.playerName ?? "-"),
      totals: toOutfieldTotalsFromAggregate(row as Record<string, unknown>),
    }));
  } else if (selectedPlayerIds.length === 1 && selectedMatchIds.length > 1) {
    comparisonScopes = primaryOutfieldRows.map((row) => ({
      label: `Jornada ${row.matchdayNumber}`,
      totals: aggregateOutfieldTotals([row]),
    }));
  } else if (selectedPlayerIds.length >= 2 && selectedMatchIds.length > 0) {
    comparisonScopes = selectedPlayerIds.flatMap((playerId) => {
      const rows = outfieldRowsByPlayer.get(playerId) ?? [];
      const player = playerMap.get(playerId);
      return rows.map((row) => ({
        label: `${player?.name ?? "-"} - J${row.matchdayNumber}`,
        totals: aggregateOutfieldTotals([row]),
      }));
    });
  } else if (selectedPlayerIds.length >= 2) {
    comparisonScopes = selectedPlayerIds.map((playerId) => ({
      label: playerMap.get(playerId)?.name ?? "-",
      totals: aggregateOutfieldTotals(outfieldRowsByPlayer.get(playerId) ?? []),
    }));
  } else if (selectedPlayerIds.length === 1) {
    comparisonScopes = [
      {
        label: playerMap.get(selectedPlayerIds[0])?.name ?? "-",
        totals: primaryOutfieldTotals,
      },
    ];
  }

  const dynamicComparisonData = buildDynamicComparisonRows(comparisonScopes);

  const radarComparisonData =
    selectedPlayerIds.length >= 2
      ? buildRadarComparisonData(
          aggregateOutfieldTotals(outfieldRowsByPlayer.get(selectedPlayerIds[0]) ?? []),
          aggregateOutfieldTotals(outfieldRowsByPlayer.get(selectedPlayerIds[1]) ?? []),
        )
      : [];

  const competitionComparisonRows = competitionPlayerTotals.map((row) => {
    const totals = toOutfieldTotalsFromAggregate(row as Record<string, unknown>);
    const metrics = buildComparisonMetrics(totals);

    return {
      playerName: String(row.playerName ?? "-"),
      passAccuracy: formatMetric(metrics.passAccuracy),
      crossAccuracy: formatMetric(metrics.crossAccuracy),
      dribbleSuccess: formatMetric(metrics.dribbleSuccess),
      duelSuccess: formatMetric(metrics.duelSuccess),
      recoveries: totals.recoveries,
      interceptions: totals.interceptions,
      minutesPlayed: totals.minutesPlayed,
    };
  });

  const percentualRows = [
    { label: "Passe Curto", success: percentualActions.shortPass.success, fail: percentualActions.shortPass.fail, percentage: percentualActions.shortPass.percentage },
    { label: "Passe Longo", success: percentualActions.longPass.success, fail: percentualActions.longPass.fail, percentage: percentualActions.longPass.percentage },
    { label: "Cruzamentos", success: percentualActions.cross.success, fail: percentualActions.cross.fail, percentage: percentualActions.cross.percentage },
    { label: "Ações Individuais", success: percentualActions.dribble.success, fail: percentualActions.dribble.fail, percentage: percentualActions.dribble.percentage },
    { label: "Lançamentos", success: percentualActions.throw.success, fail: percentualActions.throw.fail, percentage: percentualActions.throw.percentage },
    { label: "Remates", success: percentualActions.shot.success, fail: percentualActions.shot.fail, percentage: percentualActions.shot.percentage },
    { label: "Duelos Aéreos", success: percentualActions.aerialDuel.success, fail: percentualActions.aerialDuel.fail, percentage: percentualActions.aerialDuel.percentage },
    { label: "Duelos Defensivos", success: percentualActions.defensiveDuel.success, fail: percentualActions.defensiveDuel.fail, percentage: percentualActions.defensiveDuel.percentage },
  ];

  const modeLabel = buildModeLabel(selectedPlayerIds, selectedMatchIds);
  const selectedPlayerNames = selectedPlayerIds
    .map((playerId) => playerMap.get(playerId)?.name)
    .filter((name): name is string => Boolean(name));
  const selectedMatchdayNumbers = selectedMatchIds
    .map((matchId) => matchOptions.find((match) => match.id === matchId)?.matchdayNumber)
    .filter((matchday): matchday is number => Number.isFinite(matchday));
  const publicReportFilters = JSON.stringify({
    competitionId: selectedCompetitionId,
    playerId: parseOptionalId(params.playerId),
    matchId: parseOptionalId(params.matchId),
    playerIds: parseIdList(params.playerIds),
    matchIds: parseIdList(params.matchIds),
    selectedPlayers: selectedPlayerIds,
    selectedPlayerNames,
    selectedMatchIds,
    selectedMatchdays: selectedMatchdayNumbers,
  });

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Dashboard de Jogadores</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>{modeLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="competitionId">Competição</Label>
              <NativeSelect id="competitionId" name="competitionId" defaultValue={String(selectedCompetitionId ?? "")}> 
                {competitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="playerId">Jogador</Label>
              <NativeSelect id="playerId" name="playerId" defaultValue={String(parseOptionalId(params.playerId) ?? "")}> 
                <option value="">Todos os jogadores</option>
                {playerOptions.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="matchId">Jornada</Label>
              <NativeSelect id="matchId" name="matchId" defaultValue={String(parseOptionalId(params.matchId) ?? "")}> 
                <option value="">Todas as jornadas</option>
                {matchOptions.map((match) => (
                  <option key={match.id} value={match.id}>
                    Feirense vs {match.opponentTeamName} (Jornada {match.matchdayNumber})
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="playerIds">Selecionar múltiplos jogadores</Label>
              <select
                id="playerIds"
                name="playerIds"
                multiple
                defaultValue={parseIdList(params.playerIds).map(String)}
                className="h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {playerOptions.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="matchIds">Selecionar múltiplas jornadas</Label>
              <select
                id="matchIds"
                name="matchIds"
                multiple
                defaultValue={parseIdList(params.matchIds).map(String)}
                className="h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {matchOptions.map((match) => (
                  <option key={match.id} value={match.id}>
                    Jornada {match.matchdayNumber} vs {match.opponentTeamName}
                  </option>
                ))}
              </select>
            </div>
            <Button className="lg:col-span-5">Aplicar Filtros</Button>
          </form>
        </CardContent>
      </Card>

      {primaryPlayer && shouldShowActionSections ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>AÇÕES PERCENTUAIS</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Métrica</TableHead>
                    <TableHead>Sucesso</TableHead>
                    <TableHead>Insucesso</TableHead>
                    <TableHead>Percentagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {percentualRows.map((metric) => (
                    <TableRow key={metric.label}>
                      <TableCell>{metric.label}</TableCell>
                      <TableCell>{metric.success}</TableCell>
                      <TableCell>{metric.fail}</TableCell>
                      <TableCell>{formatMetric(metric.percentage)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {primaryPlayer.isGoalkeeper ? (
            <Card>
              <CardHeader>
                <CardTitle>Guarda-Redes</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Totais de Defesas</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-200">{goalkeeperPercentual.totalSaves}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Totais de Defesas Incompletas</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-200">{goalkeeperPercentual.totalIncompleteSaves}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Percentagem de Defesas</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-200">{formatMetric(goalkeeperPercentual.savePercentage)}%</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>AÇÕES NUMÉRICAS</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Métrica</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Por 90</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Faltas Sofridas</TableCell><TableCell>{numericActions.foulsSufferedTotal}</TableCell><TableCell>{formatMetric(numericActions.foulsSufferedPer90)}</TableCell></TableRow>
                  <TableRow><TableCell>Faltas Cometidas</TableCell><TableCell>{numericActions.foulsCommittedTotal}</TableCell><TableCell>{formatMetric(numericActions.foulsCommittedPer90)}</TableCell></TableRow>
                  <TableRow><TableCell>Recuperações</TableCell><TableCell>{numericActions.recoveriesTotal}</TableCell><TableCell>{formatMetric(numericActions.recoveriesPer90)}</TableCell></TableRow>
                  <TableRow><TableCell>Interceções</TableCell><TableCell>{numericActions.interceptionsTotal}</TableCell><TableCell>{formatMetric(numericActions.interceptionsPer90)}</TableCell></TableRow>
                  <TableRow><TableCell>Foras de Jogo</TableCell><TableCell>{numericActions.offsidesTotal}</TableCell><TableCell>{formatMetric(numericActions.offsidesPer90)}</TableCell></TableRow>
                  <TableRow><TableCell>Perdas de Posse</TableCell><TableCell>{numericActions.possessionLossesTotal}</TableCell><TableCell>{formatMetric(numericActions.possessionLossesPer90)}</TableCell></TableRow>
                  <TableRow><TableCell>Cartões Amarelos</TableCell><TableCell>{numericActions.yellowCardsTotal}</TableCell><TableCell>{formatMetric(numericActions.yellowCardsPer90)}</TableCell></TableRow>
                  <TableRow><TableCell>Cartões Vermelhos</TableCell><TableCell>{numericActions.redCardsTotal}</TableCell><TableCell>{formatMetric(numericActions.redCardsPer90)}</TableCell></TableRow>
                  <TableRow><TableCell>Responsabilidade em Golos</TableCell><TableCell>{numericActions.responsibilityGoalTotal}</TableCell><TableCell>{formatMetric(numericActions.responsibilityGoalPer90)}</TableCell></TableRow>
                  <TableRow><TableCell>Remates Concedidos</TableCell><TableCell>{numericActions.shotsConcededTotal}</TableCell><TableCell>{formatMetric(numericActions.shotsConcededPer90)}</TableCell></TableRow>
                  <TableRow><TableCell>Golos Sofridos</TableCell><TableCell>{numericActions.goalsConcededTotal}</TableCell><TableCell>{formatMetric(numericActions.goalsConcededPer90)}</TableCell></TableRow>
                  <TableRow><TableCell>Minutos de Utilização</TableCell><TableCell>{numericActions.minutesTotal}</TableCell><TableCell>-</TableCell></TableRow>
                  <TableRow><TableCell>Média de Utilização por Jogo</TableCell><TableCell>{formatMetric(numericActions.averageMinutesPerMatch)}</TableCell><TableCell>-</TableCell></TableRow>
                  <TableRow><TableCell>Totais de Ações</TableCell><TableCell>{numericActions.totalActions}</TableCell><TableCell>-</TableCell></TableRow>
                  <TableRow><TableCell>Média de Ações por 90</TableCell><TableCell>{formatMetric(numericActions.actionsPer90)}</TableCell><TableCell>{formatMetric(numericActions.actionsPer90)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gráficos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shouldShowEvolutionCharts ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {evolutionCharts.map((chart) => (
                  <Card key={chart.label}>
                    <CardHeader>
                      <CardTitle>{chart.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {chart.data.length > 0 ? (
                        <PlayerMetricEvolutionChart data={chart.data} lines={evolutionLines} />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Sem dados para este gráfico com os filtros atuais.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              ) : null}
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Radar do Jogador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadarProfileChart data={primaryRadarData} />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </>
      ) : !isMultiplePlayersSelection ? (
        <Card>
          <CardHeader>
            <CardTitle>AÇÕES PERCENTUAIS / AÇÕES NUMÉRICAS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Selecione um jogador para ver as secções individuais de métricas.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {isMultiplePlayersSelection && shouldShowEvolutionCharts ? (
        <Card>
          <CardHeader>
            <CardTitle>Gr??ficos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              {evolutionCharts.map((chart) => (
                <Card key={chart.label}>
                  <CardHeader>
                    <CardTitle>{chart.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chart.data.length > 0 ? (
                      <PlayerMetricEvolutionChart data={chart.data} lines={evolutionLines} />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Sem dados para este gr??fico com os filtros atuais.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Comparações</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Comparação Dinâmica de Precisões</CardTitle>
            </CardHeader>
            <CardContent>
              {dynamicComparisonData.length ? (
                <ComparisonBarChart data={dynamicComparisonData} />
              ) : (
                <p className="text-sm text-muted-foreground">Não há dados suficientes para gerar comparação.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Radar de Comparação</CardTitle>
            </CardHeader>
            <CardContent>
              {radarComparisonData.length ? (
                <RadarComparisonChart
                  data={radarComparisonData}
                  primaryLabel={playerMap.get(selectedPlayerIds[0])?.name ?? "Jogador A"}
                  secondaryLabel={playerMap.get(selectedPlayerIds[1])?.name ?? "Jogador B"}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Selecione pelo menos dois jogadores para comparação no radar.</p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {selectedPlayerIds.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Comparação de Jogadores (Apenas Competição)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Precisão de Passe</TableHead>
                  <TableHead>Precisão de Cruzamento</TableHead>
                  <TableHead>Sucesso no Drible</TableHead>
                  <TableHead>Sucesso em Duelos</TableHead>
                  <TableHead>Recuperações</TableHead>
                  <TableHead>Interceções</TableHead>
                  <TableHead>Minutos Jogados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitionComparisonRows.map((row) => (
                  <TableRow key={row.playerName}>
                    <TableCell>{row.playerName}</TableCell>
                    <TableCell>{row.passAccuracy}%</TableCell>
                    <TableCell>{row.crossAccuracy}%</TableCell>
                    <TableCell>{row.dribbleSuccess}%</TableCell>
                    <TableCell>{row.duelSuccess}%</TableCell>
                    <TableCell>{row.recoveries}</TableCell>
                    <TableCell>{row.interceptions}</TableCell>
                    <TableCell>{row.minutesPlayed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Totais por Competição (Jogadores)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Equipa</TableHead>
                  <TableHead>PC Certos</TableHead>
                  <TableHead>PC Falhados</TableHead>
                  <TableHead>PL Certos</TableHead>
                  <TableHead>PL Falhados</TableHead>
                  <TableHead>Cruz. Certos</TableHead>
                  <TableHead>Cruz. Falhados</TableHead>
                  <TableHead>Dribles Certos</TableHead>
                  <TableHead>Dribles Falhados</TableHead>
                  <TableHead>Remates Baliza</TableHead>
                  <TableHead>Remates Fora</TableHead>
                  <TableHead>Recuperações</TableHead>
                  <TableHead>Interceções</TableHead>
                  <TableHead>Cartões</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitionPlayerTotals.map((row) => (
                  <TableRow key={row.playerId}>
                    <TableCell>{row.playerName}</TableCell>
                    <TableCell>{row.teamName}</TableCell>
                    <TableCell>{row.shortPassSuccess}</TableCell>
                    <TableCell>{row.shortPassFail}</TableCell>
                    <TableCell>{row.longPassSuccess}</TableCell>
                    <TableCell>{row.longPassFail}</TableCell>
                    <TableCell>{row.crossSuccess}</TableCell>
                    <TableCell>{row.crossFail}</TableCell>
                    <TableCell>{row.dribbleSuccess}</TableCell>
                    <TableCell>{row.dribbleFail}</TableCell>
                    <TableCell>{row.shotsOnTarget}</TableCell>
                    <TableCell>{row.shotsOffTarget}</TableCell>
                    <TableCell>{row.recoveries}</TableCell>
                    <TableCell>{row.interceptions}</TableCell>
                    <TableCell>{row.yellowCards}/{row.redCards}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totais por Competição (Equipas)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipa</TableHead>
                  <TableHead>Golos</TableHead>
                  <TableHead>Assistências</TableHead>
                  <TableHead>Remates</TableHead>
                  <TableHead>Recuperações</TableHead>
                  <TableHead>Interceções</TableHead>
                  <TableHead>Perdas de Posse</TableHead>
                  <TableHead>Cartões</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitionTeamTotals.map((row) => (
                  <TableRow key={row.teamId}>
                    <TableCell>{row.teamName}</TableCell>
                    <TableCell>{row.goals}</TableCell>
                    <TableCell>{row.assists}</TableCell>
                    <TableCell>{row.shotsTotal}</TableCell>
                    <TableCell>{row.recoveries}</TableCell>
                    <TableCell>{row.interceptions}</TableCell>
                    <TableCell>{row.possessionLosses}</TableCell>
                    <TableCell>{row.yellowCards}/{row.redCards}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{"Relat\u00f3rio P\u00fablico"}</CardTitle>
          <CardDescription>
            {"Gera um link partilh\u00e1vel com os filtros atualmente aplicados no dashboard."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={generatePublicReportAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="filters" value={publicReportFilters} />
            <Button type="submit">{"Gerar Relat\u00f3rio P\u00fablico"}</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

