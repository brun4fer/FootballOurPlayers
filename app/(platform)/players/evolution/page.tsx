import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerEvolutionChartPanel } from "@/components/player-analytics/player-evolution-chart-panel";
import { PlayerOverviewStats } from "@/components/player-analytics/player-overview-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Evolucao</h1>
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para acompanhar a evolucao do jogador ao longo das jornadas."
        />
      </section>
    );
  }

  const selectedPlayerId = resolveSingleId(
    params.playerId,
    baseData.playerIdSet,
    baseData.playerOptions[0]?.id,
  );

  if (!selectedPlayerId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Evolucao</h1>
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          playerMode="single"
          description="Vista de linhas por jornada para um unico jogador."
        />
        <PlayerEmptyStateCard
          title="Sem jogadores disponiveis"
          description="Associe jogadores a esta competicao para consultar a evolucao."
        />
      </section>
    );
  }

  const loadedData = await loadPlayerAnalyticsData({
    competitionId: baseData.selectedCompetitionId,
    playerOptions: baseData.playerOptions,
    playerIds: [selectedPlayerId],
  });

  const player = loadedData.playerMap.get(selectedPlayerId);
  const outfieldRows = loadedData.outfieldRowsByPlayer.get(selectedPlayerId) ?? [];

  if (outfieldRows.length === 0) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Evolucao</h1>
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerId={selectedPlayerId}
          playerMode="single"
          description="Vista de linhas por jornada para um unico jogador."
        />
        <PlayerEmptyStateCard
          title="Sem dados para o jogador selecionado"
          description="Nao existem jornadas suficientes com registo para apresentar a evolucao."
        />
      </section>
    );
  }

  const totals = aggregateOutfieldTotals(outfieldRows);
  const overviewStats = buildPlayerOverviewStats(
    totals,
    new Set(outfieldRows.map((row) => row.matchId)).size,
  );
  const evolutionLines: EvolutionLine[] = [
    {
      playerId: selectedPlayerId,
      dataKey: `player_${selectedPlayerId}`,
      label: player?.name ?? `Jogador ${selectedPlayerId}`,
      color: getSeriesColor(player?.name ?? selectedPlayerId),
    },
  ];
  const chartRowsByPlayer = new Map([[selectedPlayerId, outfieldRows]]);
  const evolutionCharts = EVOLUTION_METRICS.map((metric) => ({
    key: metric.key,
    title: metric.label,
    data: buildMetricEvolutionData(metric.key, chartRowsByPlayer, evolutionLines),
  }));

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Evolucao</h1>
        <p className="text-sm text-muted-foreground">
          Graficos em linha para acompanhar a variacao da performance por jornada.
        </p>
      </div>

      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerId={selectedPlayerId}
        playerMode="single"
        description="Esta vista aceita apenas um jogador e utiliza todas as jornadas da competicao."
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
              {outfieldRows.map((row) => (
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
    </section>
  );
}
