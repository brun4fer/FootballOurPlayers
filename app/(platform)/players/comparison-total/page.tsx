import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PlayerMetricFocusChart } from "@/components/charts/player-metric-focus-chart";
import { RadarComparisonChart } from "@/components/charts/radar-comparison-chart";
import { RadarProfileChart } from "@/components/charts/radar-profile-chart";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerComparisonSummaryTable } from "@/components/player-analytics/player-comparison-summary-table";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerRankingInsights } from "@/components/player-analytics/player-ranking-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { describeList, filterBySearch, getSearchQuery, matchesSearch } from "@/lib/analytics-search";
import {
  aggregateOutfieldTotals,
  buildRadarProfileData,
  buildRadarComparisonData,
} from "@/lib/dashboardMetrics";
import {
  buildComparisonSummaryRows,
  filterValidIds,
  getSeriesColor,
  getPlayerAnalyticsBaseData,
  loadPlayerAnalyticsData,
  parseIdList,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";

type ComparisonTotalPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function ComparisonTotalPage({
  searchParams,
}: ComparisonTotalPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Comparacao Geral"
        filters={[{ label: "Competicao", value: "Sem competicoes disponiveis" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para comparar totais agregados entre jogadores."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const selectedPlayerIds = filterValidIds(parseIdList(params.playerIds), baseData.playerIdSet);
  const selectedPlayerOptions = baseData.playerOptions.filter((player) =>
    selectedPlayerIds.includes(player.id),
  );
  const visibleSelectedPlayerOptions = matchesSearch(searchQuery, [selectedCompetition?.name])
    ? selectedPlayerOptions
    : filterBySearch(selectedPlayerOptions, searchQuery, (player) => [
        player.name,
        player.teamName,
      ]);
  const visibleSelectedPlayerIds = visibleSelectedPlayerOptions.map((player) => player.id);
  const hasPlayerSelection = selectedPlayerIds.length >= 1;
  const hasValidSelection = visibleSelectedPlayerIds.length >= 1;
  const shouldShowCharts =
    visibleSelectedPlayerIds.length >= 1 && visibleSelectedPlayerIds.length <= 3;

  const loadedData = hasValidSelection
    ? await loadPlayerAnalyticsData({
        competitionId: baseData.selectedCompetitionId,
        playerOptions: baseData.playerOptions,
        playerIds: visibleSelectedPlayerIds,
      })
    : undefined;

  const comparisonScopes = hasValidSelection
    ? visibleSelectedPlayerIds.map((playerId) => ({
        label:
          loadedData?.playerMap.get(playerId)?.name ??
          baseData.playerOptions.find((player) => player.id === playerId)?.name ??
          `Jogador ${playerId}`,
        totals: aggregateOutfieldTotals(loadedData?.outfieldRowsByPlayer.get(playerId) ?? []),
      }))
    : [];

  const comparisonRows = buildComparisonSummaryRows(comparisonScopes);
  const radarComparisonData =
    comparisonScopes.length === 2
      ? buildRadarComparisonData(comparisonScopes[0].totals, comparisonScopes[1].totals)
      : [];
  const singlePlayerRadarData =
    comparisonScopes.length === 1
      ? buildRadarProfileData(comparisonScopes[0].totals)
      : [];

  return (
    <AnalyticsPageShell
      title="Comparacao Geral"
      description="Totais agregados de varios jogadores em todas as jornadas da competicao."
      filters={[
        { label: "Competicao", value: selectedCompetition?.name },
        {
          label: "Jogadores",
          value: describeList(
            visibleSelectedPlayerOptions.map((player) => player.name),
            hasPlayerSelection ? "Sem resultados" : "Selecao insuficiente",
          ),
        },
        {
          label: "Equipas",
          value: describeList(visibleSelectedPlayerOptions.map((player) => player.teamName), "Sem equipas"),
        },
        { label: "Jogos", value: "Todas as jornadas" },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerIds={selectedPlayerIds}
        playerMode="multiple"
        playerLabel="Jogadores"
        description="Selecione ate 3 jogadores para visualizar graficos comparativos. Acima disso, a analise fica centrada no ranking."
        searchQuery={searchQuery}
      />

      {!hasPlayerSelection || !hasValidSelection ? (
        <PlayerEmptyStateCard
          title={
            hasPlayerSelection
              ? "Sem jogadores para a pesquisa atual"
              : "Selecao insuficiente"
          }
          description={
            hasPlayerSelection
              ? "A pesquisa atual nao encontrou jogadores dentro da selecao feita."
              : "Escolha pelo menos um jogador para ativar o ranking e a comparacao geral."
          }
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Classificacao Comparativa</CardTitle>
              <CardDescription>
                Vista principal para comparacao escalavel, com ordenacao por qualquer coluna e destaque automatico dos melhores valores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlayerComparisonSummaryTable rows={comparisonRows} />
            </CardContent>
          </Card>

          {comparisonRows.length > 1 ? <PlayerRankingInsights rows={comparisonRows} /> : null}

          {shouldShowCharts ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Chart por Metrica</CardTitle>
                  <CardDescription>
                    Comparacao simplificada para 1 a 3 jogadores, mostrando apenas uma metrica de cada vez.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PlayerMetricFocusChart rows={comparisonRows} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {comparisonScopes.length === 1 ? "Radar do Jogador" : "Radar Comparativo"}
                  </CardTitle>
                  <CardDescription>
                    {comparisonScopes.length === 1
                      ? "Perfil completo do jogador selecionado."
                      : comparisonScopes.length === 2
                        ? "Disponivel quando existem exatamente dois jogadores selecionados."
                        : "Com tres jogadores, o radar e omitido para evitar ruido visual."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {comparisonScopes.length === 1 ? (
                    <RadarProfileChart
                      data={singlePlayerRadarData}
                      color={getSeriesColor(comparisonScopes[0]?.label ?? "Jogador")}
                      name={comparisonScopes[0]?.label ?? "Jogador"}
                    />
                  ) : radarComparisonData.length > 0 ? (
                    <RadarComparisonChart
                      data={radarComparisonData}
                      primaryLabel={comparisonScopes[0]?.label ?? "Jogador A"}
                      secondaryLabel={comparisonScopes[1]?.label ?? "Jogador B"}
                      primaryColor={getSeriesColor(comparisonScopes[0]?.label ?? "Jogador A")}
                      secondaryColor={getSeriesColor(comparisonScopes[1]?.label ?? "Jogador B")}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      O radar fica disponivel apenas para um jogador isolado ou para comparacao direta entre dois jogadores.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
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
        </>
      )}
    </AnalyticsPageShell>
  );
}
