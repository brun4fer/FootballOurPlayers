import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerEvolutionChartPanel } from "@/components/player-analytics/player-evolution-chart-panel";
import { PlayerOverviewStats } from "@/components/player-analytics/player-overview-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  describeList,
  filterBySearch,
  formatMatchLabel,
  getMatchSearchValues,
  getSearchQuery,
  matchesSearch,
} from "@/lib/analytics-search";
import { aggregateOutfieldTotals } from "@/lib/dashboardMetrics";
import {
  buildMetricEvolutionData,
  buildPlayerOverviewStats,
  EVOLUTION_METRICS,
  getSeriesColor,
  getPlayerAnalyticsBaseData,
  loadPlayerAnalyticsData,
  resolveSingleId,
  type EvolutionLine,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";

type EvolutionPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function EvolutionPage({ searchParams }: EvolutionPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Evolucao"
        filters={[{ label: "Competicao", value: "Sem competicoes disponiveis" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para acompanhar a evolucao do jogador ao longo das jornadas."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const selectedPlayerId = resolveSingleId(
    params.playerId,
    baseData.playerIdSet,
    baseData.playerOptions[0]?.id,
  );

  if (!selectedPlayerId) {
    return (
      <AnalyticsPageShell
        title="Evolucao"
        description="Vista de linhas por jornada para um unico jogador."
        filters={[
          { label: "Competicao", value: selectedCompetition?.name },
          { label: "Jogador", value: "Sem jogadores disponiveis" },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          playerMode="single"
          description="Vista de linhas por jornada para um unico jogador."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="Sem jogadores disponiveis"
          description="Associe jogadores a esta competicao para consultar a evolucao."
        />
      </AnalyticsPageShell>
    );
  }

  const loadedData = await loadPlayerAnalyticsData({
    competitionId: baseData.selectedCompetitionId,
    playerOptions: baseData.playerOptions,
    playerIds: [selectedPlayerId],
  });

  const player = loadedData.playerMap.get(selectedPlayerId);
  const outfieldRows = loadedData.outfieldRowsByPlayer.get(selectedPlayerId) ?? [];
  const searchMatchesScope = matchesSearch(searchQuery, [
    selectedCompetition?.name,
    player?.name,
    player?.teamName,
  ]);
  const visibleOutfieldRows = searchMatchesScope
    ? outfieldRows
    : filterBySearch(outfieldRows, searchQuery, getMatchSearchValues);

  if (visibleOutfieldRows.length === 0) {
    return (
      <AnalyticsPageShell
        title="Evolucao"
        description="Graficos em linha para acompanhar a variacao da performance por jornada."
        filters={[
          { label: "Competicao", value: selectedCompetition?.name },
          { label: "Jogador", value: player?.name },
          { label: "Equipa", value: player?.teamName },
          { label: "Jogos", value: searchQuery ? "Sem jogos no filtro atual" : "Sem dados" },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerId={selectedPlayerId}
          playerMode="single"
          description="Vista de linhas por jornada para um unico jogador."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="Sem dados para o jogador selecionado"
          description="Nao existem jornadas suficientes com registo para apresentar a evolucao."
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateOutfieldTotals(visibleOutfieldRows);
  const overviewStats = buildPlayerOverviewStats(
    totals,
    new Set(visibleOutfieldRows.map((row) => row.matchId)).size,
  );
  const evolutionLines: EvolutionLine[] = [
    {
      playerId: selectedPlayerId,
      dataKey: `player_${selectedPlayerId}`,
      label: player?.name ?? `Jogador ${selectedPlayerId}`,
      color: getSeriesColor(player?.name ?? selectedPlayerId),
    },
  ];
  const chartRowsByPlayer = new Map([[selectedPlayerId, visibleOutfieldRows]]);
  const evolutionCharts = EVOLUTION_METRICS.map((metric) => ({
    key: metric.key,
    title: metric.label,
    data: buildMetricEvolutionData(metric.key, chartRowsByPlayer, evolutionLines),
  }));

  return (
    <AnalyticsPageShell
      title="Evolucao"
      description="Graficos em linha para acompanhar a variacao da performance por jornada."
      filters={[
        { label: "Competicao", value: selectedCompetition?.name },
        { label: "Jogador", value: player?.name },
        { label: "Equipa", value: player?.teamName },
        {
          label: "Jogos",
          value: describeList(visibleOutfieldRows.map(formatMatchLabel), "Todas as jornadas"),
        },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerId={selectedPlayerId}
        playerMode="single"
        description="Esta vista aceita apenas um jogador e utiliza todas as jornadas da competicao."
        searchQuery={searchQuery}
      />

      <PlayerOverviewStats stats={overviewStats} />

      <Card>
        <CardHeader>
          <CardTitle>Graficos de Evolucao</CardTitle>
          <CardDescription>
            {player?.name ?? "Jogador"} jornada a jornada, com media, tendencia e consistencia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerEvolutionChartPanel
            charts={evolutionCharts}
            lines={evolutionLines}
            displayMode="per90"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registo por Jornada</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jornada</TableHead>
                <TableHead>Adversario</TableHead>
                <TableHead>Minutos</TableHead>
                <TableHead>Golos</TableHead>
                <TableHead>Assistencias</TableHead>
                <TableHead>Recuperacoes</TableHead>
                <TableHead>Intercecoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleOutfieldRows.map((row) => (
                <TableRow key={row.matchId}>
                  <TableCell>{row.matchdayNumber}</TableCell>
                  <TableCell>{row.opponentTeamName}</TableCell>
                  <TableCell>{row.minutesPlayed}</TableCell>
                  <TableCell>{row.goals}</TableCell>
                  <TableCell>{row.assists}</TableCell>
                  <TableCell>{row.recoveries}</TableCell>
                  <TableCell>{row.interceptions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
