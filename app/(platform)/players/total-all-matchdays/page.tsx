import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerNumericTable } from "@/components/player-analytics/player-numeric-table";
import { PlayerOverviewStats } from "@/components/player-analytics/player-overview-stats";
import { PlayerPercentageTable } from "@/components/player-analytics/player-percentage-table";
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
import {
  buildGoalkeeperSummary,
  buildPlayerNumericRows,
  buildPlayerOverviewStats,
  buildPlayerPercentageRows,
  getPlayerAnalyticsBaseData,
  loadPlayerAnalyticsData,
  resolveSingleId,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";

type TotalAllMatchdaysPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function TotalAllMatchdaysPage({
  searchParams,
}: TotalAllMatchdaysPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Totais (Todas as Jornadas)"
        filters={[{ label: "Competicao", value: "Sem competicoes disponiveis" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para consultar os totais do jogador ao longo da epoca."
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
        title="Totais (Todas as Jornadas)"
        description="Analise consolidada de um jogador em todas as jornadas da competicao."
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
          description="Analise consolidada de um jogador em todas as jornadas da competicao."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="Sem jogadores disponiveis"
          description="Associe jogadores a esta competicao para visualizar os totais agregados."
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
  const goalkeeperRows = loadedData.goalkeeperRowsByPlayer.get(selectedPlayerId) ?? [];
  const searchMatchesScope = matchesSearch(searchQuery, [
    selectedCompetition?.name,
    player?.name,
    player?.teamName,
  ]);
  const visibleOutfieldRows = searchMatchesScope
    ? outfieldRows
    : filterBySearch(outfieldRows, searchQuery, getMatchSearchValues);
  const visibleGoalkeeperRows = searchMatchesScope
    ? goalkeeperRows
    : filterBySearch(goalkeeperRows, searchQuery, getMatchSearchValues);
  const matchesPlayed =
    new Set([
      ...visibleOutfieldRows.map((row) => row.matchId),
      ...visibleGoalkeeperRows.map((row) => row.matchId),
    ]).size;
  const matchSummary = describeList(
    [
      ...visibleOutfieldRows.map(formatMatchLabel),
      ...visibleGoalkeeperRows.map(formatMatchLabel),
    ],
    "Todas as jornadas",
  );

  if (searchQuery && matchesPlayed === 0) {
    return (
      <AnalyticsPageShell
        title="Totais (Todas as Jornadas)"
        description="Totais e percentagens derivadas do jogador selecionado ao longo da epoca."
        filters={[
          { label: "Competicao", value: selectedCompetition?.name },
          { label: "Jogador", value: player?.name },
          { label: "Equipa", value: player?.teamName },
          { label: "Jogos", value: "Sem jogos no filtro atual" },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerId={selectedPlayerId}
          playerMode="single"
          description="Sem filtro de jornada. O objetivo desta vista e a consistencia do jogador ao longo da competicao."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="Sem resultados para a pesquisa"
          description="A pesquisa atual nao encontrou jogos para o jogador selecionado."
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateOutfieldTotals(visibleOutfieldRows);
  const overviewStats = buildPlayerOverviewStats(totals, matchesPlayed);
  const percentageRows = buildPlayerPercentageRows(totals);
  const numericRows = buildPlayerNumericRows({
    totals,
    goalkeeperRows: visibleGoalkeeperRows,
    matchesPlayed,
  });
  const goalkeeperSummary = player?.isGoalkeeper
    ? buildGoalkeeperSummary(visibleGoalkeeperRows)
    : undefined;

  return (
    <AnalyticsPageShell
      title="Totais (Todas as Jornadas)"
      description="Totais e percentagens derivadas do jogador selecionado ao longo de toda a epoca."
      filters={[
        { label: "Competicao", value: selectedCompetition?.name },
        { label: "Jogador", value: player?.name },
        { label: "Equipa", value: player?.teamName },
        { label: "Jogos", value: matchSummary },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerId={selectedPlayerId}
        playerMode="single"
        description="Sem filtro de jornada. O objetivo desta vista e a consistencia do jogador ao longo da competicao."
        searchQuery={searchQuery}
      />

      <PlayerOverviewStats stats={overviewStats} />

      <Card>
        <CardHeader>
          <CardTitle>Acoes Percentuais</CardTitle>
          <CardDescription>
            {player?.name ?? "Jogador"} em {matchesPlayed} jornada(s) com registo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerPercentageTable
            rows={percentageRows}
            goalkeeperSummary={goalkeeperSummary}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acoes Numericas</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerNumericTable rows={numericRows} />
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
