import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PlayerMetricFocusChart } from "@/components/charts/player-metric-focus-chart";
import { PdfExportButton } from "@/components/pdf/pdf-export-button";
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
        title="Players Comparison – by Match"
        showPageExport={false}
        showReportSummary={false}
        filters={[{ label: "Competition", value: "No competitions available" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="No competitions available"
          description="Create a competition to compare players by matchday."
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
          `Player ${playerId}`,
        totals: aggregateOutfieldTotals(loadedData?.outfieldRowsByPlayer.get(playerId) ?? []),
      }))
    : [];
  const comparisonRows = buildComparisonSummaryRows(comparisonScopes);

  return (
    <AnalyticsPageShell
      title="Players Comparison – by Match"
      description="Automatically compares all outfield players used on the selected matchday. Goalkeepers are excluded."
      showPageExport={false}
      showReportSummary={false}
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        { label: "Match", value: selectedMatch ? formatMatchLabel(selectedMatch) : "Incomplete selection" },
        {
          label: "Players",
          value: describeList(visibleOutfieldPlayers.map((player) => player.name), "No players"),
        },
        {
          label: "Teams",
          value: describeList(visibleOutfieldPlayers.map((player) => player.teamName), "No teams"),
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
        matchLabel="Matchday"
        description="Choose a matchday; the outfield players used are loaded automatically."
        searchQuery={searchQuery}
      />

      {!hasValidSelection ? (
        <PlayerEmptyStateCard
          title={
            selectedMatchId
              ? searchQuery
                ? "No players match the current search"
                : "No outfield players used"
              : "Incomplete selection"
          }
          description={
            selectedMatchId
              ? searchQuery
                ? "The current search did not find any outfield players on this matchday."
                : "There are no outfield players with recorded minutes on this matchday."
              : "Choose a matchday to compare the players used."
          }
        />
      ) : (
        <>
          <Card id="match-player-comparison-ranking">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <CardTitle>Comparison Ranking</CardTitle>
                  <CardDescription>
                    {selectedMatch ? formatMatchLabel(selectedMatch) : "Match -"} - {comparisonRows.length} outfield players
                  </CardDescription>
                </div>
                <PdfExportButton
                  targetId="match-player-comparison-ranking"
                  fileName={`${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-player-ranking`}
                  label="Generate ranking PDF"
                  orientation="landscape"
                />
              </div>
            </CardHeader>
            <CardContent>
              <PlayerComparisonSummaryTable rows={comparisonRows} showHeading={false} />
            </CardContent>
          </Card>

          {comparisonRows.length > 1 ? (
            <>
              <Card id="match-player-comparison-chart">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                      <CardTitle>Action Efficiency Chart</CardTitle>
                      <CardDescription>
                        Select an action to compare every player used in the match.
                      </CardDescription>
                    </div>
                    <PdfExportButton
                      targetId="match-player-comparison-chart"
                      fileName={`${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-efficiency-chart`}
                      label="Generate chart PDF"
                      orientation="landscape"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <PlayerMetricFocusChart rows={comparisonRows} />
                </CardContent>
              </Card>

              <PlayerRankingInsights
                rows={comparisonRows}
                enablePdfExport
                pdfFileNamePrefix={`${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-percentage-ranking`}
              />
            </>
          ) : null}
        </>
      )}
    </AnalyticsPageShell>
  );
}
