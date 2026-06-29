import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerComparisonSummaryTable } from "@/components/player-analytics/player-comparison-summary-table";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerRankingInsights } from "@/components/player-analytics/player-ranking-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  describeList,
  filterBySearch,
  formatMatchLabel,
  getMatchSearchValues,
  getSearchQuery,
  matchesSearch,
} from "@/lib/analytics-search";
import { aggregateOutfieldTotals } from "@/lib/dashboardMetrics";
import { getUsedOutfieldPlayersByMatch } from "@/lib/data";
import {
  buildComparisonSummaryRows,
  getPlayerAnalyticsBaseData,
  loadPlayerAnalyticsData,
  resolveSingleId,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";

type ComparisonMatchdaysPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function ComparisonMatchdaysPage({
  searchParams,
}: ComparisonMatchdaysPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Comparacao por Jornada"
        filters={[{ label: "Competicao", value: "Sem competicoes disponiveis" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para comparar jogadores por jornada."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const selectedMatchId = resolveSingleId(
    params.matchId,
    baseData.matchIdSet,
    baseData.matchOptions[0]?.id,
  );
  const selectedMatch = baseData.matchOptions.find((match) => match.id === selectedMatchId);
  const usedOutfieldPlayers = selectedMatchId
    ? await getUsedOutfieldPlayersByMatch(baseData.selectedCompetitionId, selectedMatchId)
    : [];
  const searchMatchesScope = matchesSearch(searchQuery, [
    selectedCompetition?.name,
    ...(selectedMatch ? getMatchSearchValues(selectedMatch) : []),
  ]);
  const visibleOutfieldPlayers = searchMatchesScope
    ? usedOutfieldPlayers
    : filterBySearch(usedOutfieldPlayers, searchQuery, (player) => [
        player.name,
        player.teamName,
      ]);
  const usedOutfieldPlayerIds = visibleOutfieldPlayers.map((player) => player.id);
  const hasValidSelection = Boolean(selectedMatchId && usedOutfieldPlayerIds.length > 0);

  const loadedData = hasValidSelection
    ? await loadPlayerAnalyticsData({
        competitionId: baseData.selectedCompetitionId,
        playerOptions: visibleOutfieldPlayers,
        playerIds: usedOutfieldPlayerIds,
        matchIds: selectedMatchId ? [selectedMatchId] : undefined,
      })
    : undefined;

  const comparisonScopes = hasValidSelection
    ? usedOutfieldPlayerIds.map((playerId) => ({
        label:
          loadedData?.playerMap.get(playerId)?.name ??
          visibleOutfieldPlayers.find((player) => player.id === playerId)?.name ??
          `Jogador ${playerId}`,
        totals: aggregateOutfieldTotals(loadedData?.outfieldRowsByPlayer.get(playerId) ?? []),
      }))
    : [];
  const comparisonRows = buildComparisonSummaryRows(comparisonScopes);

  return (
    <AnalyticsPageShell
      title="Comparacao por Jornada"
      description="Compara automaticamente todos os jogadores de campo utilizados na jornada selecionada. Guarda-redes ficam excluidos."
      filters={[
        { label: "Competicao", value: selectedCompetition?.name },
        { label: "Jogo", value: selectedMatch ? formatMatchLabel(selectedMatch) : "Selecao incompleta" },
        {
          label: "Jogadores",
          value: describeList(visibleOutfieldPlayers.map((player) => player.name), "Sem jogadores"),
        },
        {
          label: "Equipas",
          value: describeList(visibleOutfieldPlayers.map((player) => player.teamName), "Sem equipas"),
        },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        matches={baseData.matchOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedMatchId={selectedMatchId}
        matchMode="single"
        matchLabel="Jornada"
        description="Escolha a jornada; os jogadores de campo utilizados sao carregados automaticamente."
        searchQuery={searchQuery}
      />

      {!hasValidSelection ? (
        <PlayerEmptyStateCard
          title={
            selectedMatchId
              ? searchQuery
                ? "Sem jogadores para a pesquisa atual"
                : "Sem jogadores de campo utilizados"
              : "Selecao incompleta"
          }
          description={
            selectedMatchId
              ? searchQuery
                ? "A pesquisa atual nao encontrou jogadores de campo nesta jornada."
                : "Nao existem jogadores de campo com minutos registados nesta jornada."
              : "Escolha uma jornada para comparar os jogadores utilizados."
          }
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Classificacao da Jornada</CardTitle>
              <CardDescription>
                {selectedMatch ? formatMatchLabel(selectedMatch) : "Jornada -"} - {comparisonRows.length} jogadores de campo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlayerComparisonSummaryTable rows={comparisonRows} />
            </CardContent>
          </Card>

          {comparisonRows.length > 1 ? <PlayerRankingInsights rows={comparisonRows} /> : null}
        </>
      )}
    </AnalyticsPageShell>
  );
}
