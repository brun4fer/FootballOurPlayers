import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerComparisonSummaryTable } from "@/components/player-analytics/player-comparison-summary-table";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerEvolutionChartPanel } from "@/components/player-analytics/player-evolution-chart-panel";
import { PlayerRankingInsights } from "@/components/player-analytics/player-ranking-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aggregateOutfieldTotals } from "@/lib/dashboardMetrics";
import {
  buildComparisonSummaryRows,
  buildMetricEvolutionData,
  EVOLUTION_METRICS,
  filterValidIds,
  getSeriesColor,
  getPlayerAnalyticsBaseData,
  loadPlayerAnalyticsData,
  parseIdList,
  type EvolutionLine,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";

type ComparisonMatchdaysPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function ComparisonMatchdaysPage({
  searchParams,
}: ComparisonMatchdaysPageProps) {
  const params = (await searchParams) ?? {};
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Comparacao por Jornada
        </h1>
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para comparar jogadores em multiplas jornadas."
        />
      </section>
    );
  }

  const selectedPlayerIds = filterValidIds(parseIdList(params.playerIds), baseData.playerIdSet);
  const selectedMatchIds = filterValidIds(parseIdList(params.matchIds), baseData.matchIdSet);
  const hasValidSelection = selectedPlayerIds.length >= 1 && selectedMatchIds.length >= 2;
  const shouldShowCharts = selectedPlayerIds.length >= 1 && selectedPlayerIds.length <= 3;

  const loadedData = hasValidSelection
    ? await loadPlayerAnalyticsData({
        competitionId: baseData.selectedCompetitionId,
        playerOptions: baseData.playerOptions,
        playerIds: selectedPlayerIds,
        matchIds: selectedMatchIds,
      })
    : undefined;

  const evolutionLines: EvolutionLine[] = hasValidSelection
    ? selectedPlayerIds.map((playerId, index) => ({
        playerId,
        dataKey: `player_${playerId}`,
        label:
          loadedData?.playerMap.get(playerId)?.name ??
          baseData.playerOptions.find((player) => player.id === playerId)?.name ??
          `Jogador ${playerId}`,
        color: getSeriesColor(
          loadedData?.playerMap.get(playerId)?.name ??
            baseData.playerOptions.find((player) => player.id === playerId)?.name ??
            playerId,
        ),
      }))
    : [];

  const chartRowsByPlayer = hasValidSelection
    ? new Map(
        selectedPlayerIds.map((playerId) => [
          playerId,
          loadedData?.outfieldRowsByPlayer.get(playerId) ?? [],
        ]),
      )
    : new Map();
  const comparisonScopes = hasValidSelection
    ? selectedPlayerIds.map((playerId) => ({
        label:
          loadedData?.playerMap.get(playerId)?.name ??
          baseData.playerOptions.find((player) => player.id === playerId)?.name ??
          `Jogador ${playerId}`,
        totals: aggregateOutfieldTotals(loadedData?.outfieldRowsByPlayer.get(playerId) ?? []),
      }))
    : [];
  const comparisonRows = buildComparisonSummaryRows(comparisonScopes);

  const evolutionCharts = hasValidSelection
    ? EVOLUTION_METRICS.map((metric) => ({
        key: metric.key,
        title: metric.label,
        data: buildMetricEvolutionData(metric.key, chartRowsByPlayer, evolutionLines),
      }))
    : [];

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Comparacao por Jornada
        </h1>
        <p className="text-sm text-muted-foreground">
          Comparacao temporal com multiplos jogadores e multiplas jornadas.
        </p>
      </div>

      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        matches={baseData.matchOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerIds={selectedPlayerIds}
        selectedMatchIds={selectedMatchIds}
        playerMode="multiple"
        matchMode="multiple"
        playerLabel="Jogadores"
        matchLabel="Jornadas"
        description="Selecione ate 3 jogadores para visualizar graficos comparativos. Acima disso, a vista troca para ranking."
      />

      {!hasValidSelection ? (
        <PlayerEmptyStateCard
          title="Selecao insuficiente"
          description="Escolha pelo menos um jogador e duas jornadas para comparar o desempenho ao longo do tempo."
        />
      ) : (
        <>
          {shouldShowCharts ? (
            <Card>
              <CardHeader>
                <CardTitle>Graficos Comparativos</CardTitle>
                <CardDescription>
                  Cada linha representa um jogador ao longo das jornadas selecionadas, com media, tendencia e consistencia.
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
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Charts Ocultos</CardTitle>
                <CardDescription>
                  Selecione ate 3 jogadores para visualizar graficos comparativos.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ranking no Intervalo Selecionado</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerComparisonSummaryTable rows={comparisonRows} />
            </CardContent>
          </Card>

          {comparisonRows.length > 1 ? <PlayerRankingInsights rows={comparisonRows} /> : null}
        </>
      )}
    </section>
  );
}
