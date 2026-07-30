import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PdfExportButton } from "@/components/pdf/pdf-export-button";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerNumericTable } from "@/components/player-analytics/player-numeric-table";
import { PlayerOverviewStats } from "@/components/player-analytics/player-overview-stats";
import { PlayerPercentageTable } from "@/components/player-analytics/player-percentage-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
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

type SingleMatchdayPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function SingleMatchdayPage({
  searchParams,
}: SingleMatchdayPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Player Actions by Match"
        showPageExport={false}
        showReportSummary={false}
        filters={[{ label: "Competition", value: "No competitions available" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="No competitions available"
          description="Create a competition to view player details by matchday."
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
  const selectedMatchId = resolveSingleId(
    params.matchId,
    baseData.matchIdSet,
    baseData.matchOptions[0]?.id,
  );
  const selectedPlayer = baseData.playerOptions.find((player) => player.id === selectedPlayerId);
  const selectedMatch = baseData.matchOptions.find((match) => match.id === selectedMatchId);

  if (!selectedPlayerId || !selectedMatchId) {
    return (
      <AnalyticsPageShell
        title="Player Actions by Match"
        description="Focused analysis of one player on a single matchday."
        showPageExport={false}
        showReportSummary={false}
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Player", value: selectedPlayer?.name ?? "Incomplete selection" },
          { label: "Match", value: selectedMatch ? formatMatchLabel(selectedMatch) : "Incomplete selection" },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerId={selectedPlayerId}
          selectedMatchId={selectedMatchId}
          playerMode="single"
          matchMode="single"
          description="Focused analysis of one player on a single matchday."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="Incomplete selection"
          description="Choose a player and matchday to view the match details."
        />
      </AnalyticsPageShell>
    );
  }

  const loadedData = await loadPlayerAnalyticsData({
    competitionId: baseData.selectedCompetitionId,
    playerOptions: baseData.playerOptions,
    playerIds: [selectedPlayerId],
    matchIds: [selectedMatchId],
  });

  const player = loadedData.playerMap.get(selectedPlayerId);
  const outfieldRows = loadedData.outfieldRowsByPlayer.get(selectedPlayerId) ?? [];
  const goalkeeperRows = loadedData.goalkeeperRowsByPlayer.get(selectedPlayerId) ?? [];

  if (outfieldRows.length === 0 && goalkeeperRows.length === 0) {
    return (
      <AnalyticsPageShell
        title="Player Actions by Match"
        description="Focus on the player performance on a specific matchday."
        showPageExport={false}
        showReportSummary={false}
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Player", value: player?.name },
          { label: "Team", value: player?.teamName },
          { label: "Match", value: selectedMatch ? formatMatchLabel(selectedMatch) : undefined },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerId={selectedPlayerId}
          selectedMatchId={selectedMatchId}
          playerMode="single"
          matchMode="single"
          description="Focused analysis of one player on a single matchday."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="No record for this matchday"
          description="There are no recorded statistics for the player on this matchday."
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateOutfieldTotals(outfieldRows);
  const overviewStats = buildPlayerOverviewStats(totals, 1, {
    actionMetric: "total",
    goalkeeperRows,
  });
  const percentageRows = buildPlayerPercentageRows(totals);
  const numericRows = buildPlayerNumericRows({
    totals,
    goalkeeperRows,
    matchesPlayed: 1,
    includeActionsPer90: false,
  });
  const goalkeeperSummary = player?.isGoalkeeper
    ? buildGoalkeeperSummary(goalkeeperRows)
    : undefined;
  const searchMatchesScope = matchesSearch(searchQuery, [
    selectedCompetition?.name,
    player?.name,
    player?.teamName,
    ...(selectedMatch ? getMatchSearchValues(selectedMatch) : []),
  ]);
  const visibleOverviewStats = searchMatchesScope
    ? overviewStats
    : filterBySearch(overviewStats, searchQuery, (row) => [
        row.title,
        row.value,
        row.description,
      ]);
  const visiblePercentageRows = searchMatchesScope
    ? percentageRows
    : filterBySearch(percentageRows, searchQuery, (row) => [row.metric]);
  const visibleNumericRows = searchMatchesScope
    ? numericRows
    : filterBySearch(numericRows, searchQuery, (row) => [row.metric, row.total]);

  return (
    <AnalyticsPageShell
      title="Player Actions by Match"
      description="Focus on the player performance on a specific matchday."
      showPageExport={false}
      showReportSummary={false}
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        { label: "Player", value: player?.name },
        { label: "Team", value: player?.teamName },
        { label: "Match", value: selectedMatch ? formatMatchLabel(selectedMatch) : undefined },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        matches={baseData.matchOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerId={selectedPlayerId}
        selectedMatchId={selectedMatchId}
        playerMode="single"
        matchMode="single"
        description="A matchday is required in this view."
        searchQuery={searchQuery}
      />

      <Card id="player-match-summary">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Match Summary</CardTitle>
              <CardDescription>
                {player?.name ?? "Player"} | {selectedMatch ? formatMatchLabel(selectedMatch) : "Match -"}
              </CardDescription>
            </div>
            <PdfExportButton
              targetId="player-match-summary"
              fileName={`${player?.name ?? "player"}-${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-summary`}
              label="Generate summary PDF"
              orientation="landscape"
            />
          </div>
        </CardHeader>
        <CardContent>
          <PlayerOverviewStats stats={visibleOverviewStats} />
        </CardContent>
      </Card>

      <Card id="player-match-percentage-metrics">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CardTitle>Percentage Metrics</CardTitle>
            <PdfExportButton
              targetId="player-match-percentage-metrics"
              fileName={`${player?.name ?? "player"}-${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-percentage-metrics`}
              label="Generate percentages PDF"
            />
          </div>
        </CardHeader>
        <CardContent>
          <PlayerPercentageTable
            rows={visiblePercentageRows}
            goalkeeperSummary={goalkeeperSummary}
          />
        </CardContent>
      </Card>

      <Card id="player-match-numeric-actions">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CardTitle>Numeric Actions</CardTitle>
            <PdfExportButton
              targetId="player-match-numeric-actions"
              fileName={`${player?.name ?? "player"}-${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-numeric-actions`}
              label="Generate actions PDF"
            />
          </div>
        </CardHeader>
        <CardContent>
          <PlayerNumericTable rows={visibleNumericRows} showTotalActionsNote />
        </CardContent>
      </Card>

    </AnalyticsPageShell>
  );
}
