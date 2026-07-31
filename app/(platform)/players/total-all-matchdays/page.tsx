import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PdfExportButton } from "@/components/pdf/pdf-export-button";
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
        title="Player Total Actions"
        showPageExport={false}
        showReportSummary={false}
        filters={[{ label: "Competition", value: "No competitions available" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="No competitions available"
          description="Create a competition to view player totals throughout the season."
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
        title="Player Total Actions"
        description="Consolidated analysis of one player across all competition matchdays."
        showPageExport={false}
        showReportSummary={false}
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
          description="Consolidated analysis of one player across all competition matchdays."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="No players available"
          description="Assign players to this competition to view aggregated totals."
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
    "All matchdays",
  );

  if (searchQuery && matchesPlayed === 0) {
    return (
      <AnalyticsPageShell
        title="Player Total Actions"
        description="Totals and derived percentages for the selected player throughout the season."
        showPageExport={false}
        showReportSummary={false}
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Player", value: player?.name },
          { label: "Team", value: player?.teamName },
          { label: "Matches", value: "No matches in the current filter" },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerId={selectedPlayerId}
          playerMode="single"
          description="No matchday filter. This view focuses on player consistency throughout the competition."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="No search results"
          description="The current search did not find any matches for the selected player."
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateOutfieldTotals(visibleOutfieldRows);
  const overviewStats = buildPlayerOverviewStats(totals, matchesPlayed, {
    actionMetric: "total",
    goalkeeperRows: visibleGoalkeeperRows,
  });
  const percentageRows = buildPlayerPercentageRows(totals);
  const numericRows = buildPlayerNumericRows({
    totals,
    goalkeeperRows: visibleGoalkeeperRows,
    matchesPlayed,
    includeActionsPer90: false,
    manualPossessionLosses: baseData.manualPossessionLosses,
  });
  const goalkeeperSummary = player?.isGoalkeeper
    ? buildGoalkeeperSummary(visibleGoalkeeperRows)
    : undefined;

  return (
    <AnalyticsPageShell
      title="Player Total Actions"
      description="Totals and derived percentages for the selected player throughout the entire season."
      showPageExport={false}
      showReportSummary={false}
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        { label: "Player", value: player?.name },
        { label: "Team", value: player?.teamName },
        { label: "Matches", value: matchSummary },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerId={selectedPlayerId}
        playerMode="single"
        description="No matchday filter. This view focuses on player consistency throughout the competition."
        searchQuery={searchQuery}
      />

      <section id="player-total-actions-summary" className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-[var(--font-heading)] text-xl font-semibold">Player Summary</h2>
          <PdfExportButton
            targetId="player-total-actions-summary"
            fileName={`${player?.name ?? "player"}-${selectedCompetition?.name ?? "competition"}-summary`}
            label="Generate summary PDF"
            orientation="landscape"
          />
        </div>
        <PlayerOverviewStats stats={overviewStats} />
      </section>

      <Card id="player-percentage-metrics">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Percentage Metrics</CardTitle>
              <CardDescription>
                {player?.name ?? "Player"} across {matchesPlayed} recorded matchday(s).
              </CardDescription>
            </div>
            <PdfExportButton
              targetId="player-percentage-metrics"
              fileName={`${player?.name ?? "player"}-${selectedCompetition?.name ?? "competition"}-percentage-metrics`}
              label="Generate percentages PDF"
            />
          </div>
        </CardHeader>
        <CardContent>
          <PlayerPercentageTable
            rows={percentageRows}
            goalkeeperSummary={goalkeeperSummary}
          />
        </CardContent>
      </Card>

      <Card id="player-numeric-actions">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CardTitle>Numeric Actions</CardTitle>
            <PdfExportButton
              targetId="player-numeric-actions"
              fileName={`${player?.name ?? "player"}-${selectedCompetition?.name ?? "competition"}-numeric-actions`}
              label="Generate actions PDF"
            />
          </div>
        </CardHeader>
        <CardContent>
          <PlayerNumericTable
            rows={numericRows}
            showTotalActionsNote
            manualPossessionLosses={baseData.manualPossessionLosses}
          />
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
