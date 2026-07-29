import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerEvolutionChartPanel } from "@/components/player-analytics/player-evolution-chart-panel";
import { PlayerOverviewStats } from "@/components/player-analytics/player-overview-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  describeList,
  filterBySearch,
  formatMatchLabel,
  getMatchSearchValues,
  getSearchQuery,
  matchesSearch,
} from "@/lib/analytics-search";
import { aggregateOutfieldTotals, percent, type OutfieldMatchRow } from "@/lib/dashboardMetrics";
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
        title="Evolution by Player"
        filters={[{ label: "Competition", value: "No competitions available" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="No competitions available"
          description="Create a competition to track player performance across matchdays."
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
        title="Evolution by Player"
        description="Line-chart view by matchday for a single player."
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Player", value: "No players available" },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          playerMode="single"
          description="Line-chart view by matchday for a single player."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="No players available"
          description="Assign players to this competition to view their evolution."
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
        title="Evolution by Player"
        description="Line charts tracking performance changes by matchday."
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Player", value: player?.name },
          { label: "Team", value: player?.teamName },
          { label: "Matches", value: searchQuery ? "No matches in the current filter" : "No data" },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerId={selectedPlayerId}
          playerMode="single"
          description="Line-chart view by matchday for a single player."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="No data for the selected player"
          description="There are not enough recorded matchdays to display an evolution."
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
      label: player?.name ?? `Player ${selectedPlayerId}`,
      color: getSeriesColor(player?.name ?? selectedPlayerId),
    },
  ];
  const chartRowsByPlayer = new Map([[selectedPlayerId, visibleOutfieldRows]]);
  const evolutionCharts = EVOLUTION_METRICS.map((metric) => ({
    key: metric.key,
    title: metric.label,
    data: buildMetricEvolutionData(metric.key, chartRowsByPlayer, evolutionLines),
  }));
  const percentageDefinitions: Array<{
    key: string;
    label: string;
    value: (row: OutfieldMatchRow) => number;
  }> = [
    { key: "short-pass", label: "Short Pass Accuracy", value: (row) => percent(row.shortPassSuccess, row.shortPassFail) },
    { key: "long-pass", label: "Long Pass Accuracy", value: (row) => percent(row.longPassSuccess, row.longPassFail) },
    { key: "crosses", label: "Cross Accuracy", value: (row) => percent(row.crossSuccess, row.crossFail) },
    { key: "individual-actions", label: "Individual Actions Success", value: (row) => percent(row.dribbleSuccess, row.dribbleFail) },
    { key: "throw-ins", label: "Throw-in Accuracy", value: (row) => percent(row.throwSuccess, row.throwFail) },
    { key: "shots", label: "Shot Accuracy", value: (row) => percent(row.shotsOnTarget, row.shotsOffTarget) },
    { key: "aerial-duels", label: "Aerial Duel Success", value: (row) => percent(row.aerialDuelSuccess, row.aerialDuelFail) },
    { key: "set-piece-crosses", label: "Set-Piece Cross Accuracy", value: (row) => percent(row.setPieceCrossSuccess, row.setPieceCrossFail) },
  ];
  const percentageCharts = percentageDefinitions.map((metric) => ({
    key: metric.key,
    title: metric.label,
    data: visibleOutfieldRows.map((row) => ({
      matchLabel: `CD Feirense vs ${row.opponentTeamName} - Matchday ${row.matchdayNumber}`,
      matchdayNumber: row.matchdayNumber,
      opponentTeamName: row.opponentTeamName,
      [`player_${selectedPlayerId}`]: metric.value(row),
    })),
  }));

  return (
    <AnalyticsPageShell
      title="Evolution by Player"
      description="Line charts tracking performance changes by matchday."
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        { label: "Player", value: player?.name },
        { label: "Team", value: player?.teamName },
        {
          label: "Matches",
          value: describeList(visibleOutfieldRows.map(formatMatchLabel), "All matchdays"),
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
        description="This view supports one player and uses all competition matchdays."
        searchQuery={searchQuery}
      />

      <PlayerOverviewStats stats={overviewStats} />

      <Card>
        <CardHeader>
          <CardTitle>Percentage Evolution</CardTitle>
          <CardDescription>
            Success rates for {player?.name ?? "the player"}, match by match.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerEvolutionChartPanel
            charts={percentageCharts}
            lines={evolutionLines}
            displayMode="percentage"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Numeric Actions Evolution</CardTitle>
          <CardDescription>
            Absolute action volumes for {player?.name ?? "the player"} in each match.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerEvolutionChartPanel
            charts={evolutionCharts}
            lines={evolutionLines}
            displayMode="raw"
          />
        </CardContent>
      </Card>

    </AnalyticsPageShell>
  );
}
