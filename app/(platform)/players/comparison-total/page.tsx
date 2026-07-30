import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PlayerMetricFocusChart } from "@/components/charts/player-metric-focus-chart";
import { RadarComparisonChart } from "@/components/charts/radar-comparison-chart";
import { RadarProfileChart } from "@/components/charts/radar-profile-chart";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerComparisonSummaryTable } from "@/components/player-analytics/player-comparison-summary-table";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerRankingInsights } from "@/components/player-analytics/player-ranking-insights";
import { PdfExportButton } from "@/components/pdf/pdf-export-button";
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
        title="Filter Comparison"
        showPageExport={false}
        showReportSummary={false}
        filters={[{ label: "Competition", value: "No competitions available" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="No competitions available"
          description="Create a competition to compare aggregated player totals."
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
  const shouldShowRadar =
    visibleSelectedPlayerIds.length >= 1 && visibleSelectedPlayerIds.length <= 2;

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
          `Player ${playerId}`,
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
      title="Filter Comparison"
      description="Compares the selected players action by action across all competition matches."
      showPageExport={false}
      showReportSummary={false}
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        {
          label: "Players",
          value: describeList(
            visibleSelectedPlayerOptions.map((player) => player.name),
            hasPlayerSelection ? "No results" : "Insufficient selection",
          ),
        },
        {
          label: "Teams",
          value: describeList(visibleSelectedPlayerOptions.map((player) => player.teamName), "No teams"),
        },
        { label: "Matches", value: "All matchdays" },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerIds={selectedPlayerIds}
        playerMode="multiple"
        playerLabel="Players"
        description="Select the players you want to compare action by action."
        searchQuery={searchQuery}
      />

      {!hasPlayerSelection || !hasValidSelection ? (
        <PlayerEmptyStateCard
          title={
            hasPlayerSelection
              ? "No players match the current search"
              : "Insufficient selection"
          }
          description={
            hasPlayerSelection
              ? "The current search did not find any players within the selection."
              : "Choose at least one player to enable the ranking and overall comparison."
          }
        />
      ) : (
        <>
          <Card id="overall-player-comparison-ranking">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <CardTitle>Comparison Ranking</CardTitle>
                  <CardDescription>
                    Comparison across all competition matches, sortable by any column.
                  </CardDescription>
                </div>
                <PdfExportButton
                  targetId="overall-player-comparison-ranking"
                  fileName={`${selectedCompetition?.name ?? "competition"}-overall-player-ranking`}
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
            <PlayerRankingInsights
              rows={comparisonRows}
              enablePdfExport
              pdfFileNamePrefix={`${selectedCompetition?.name ?? "competition"}-overall-percentage-ranking`}
            />
          ) : null}

          <div className={shouldShowRadar ? "grid gap-4 xl:grid-cols-2" : undefined}>
            <Card id="overall-player-comparison-chart">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <CardTitle>Action Efficiency Chart</CardTitle>
                    <CardDescription>
                      Select an action to compare every selected player.
                    </CardDescription>
                  </div>
                  <PdfExportButton
                    targetId="overall-player-comparison-chart"
                    fileName={`${selectedCompetition?.name ?? "competition"}-overall-efficiency-chart`}
                    label="Generate chart PDF"
                    orientation="landscape"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <PlayerMetricFocusChart rows={comparisonRows} />
              </CardContent>
            </Card>

            {shouldShowRadar ? (
              <Card id="overall-player-comparison-radar">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                      <CardTitle>
                        {comparisonScopes.length === 1 ? "Player Radar" : "Comparison Radar"}
                      </CardTitle>
                      <CardDescription>
                        {comparisonScopes.length === 1
                          ? "Complete profile of the selected player."
                          : "Direct comparison between the two selected players."}
                      </CardDescription>
                    </div>
                    <PdfExportButton
                      targetId="overall-player-comparison-radar"
                      fileName={`${selectedCompetition?.name ?? "competition"}-overall-comparison-radar`}
                      label="Generate radar PDF"
                      orientation="landscape"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {comparisonScopes.length === 1 ? (
                    <RadarProfileChart
                      data={singlePlayerRadarData}
                      color={getSeriesColor(comparisonScopes[0]?.label ?? "Player")}
                      name={comparisonScopes[0]?.label ?? "Player"}
                    />
                  ) : (
                    <RadarComparisonChart
                      data={radarComparisonData}
                      primaryLabel={comparisonScopes[0]?.label ?? "Player A"}
                      secondaryLabel={comparisonScopes[1]?.label ?? "Player B"}
                      primaryColor={getSeriesColor(comparisonScopes[0]?.label ?? "Player A")}
                      secondaryColor={getSeriesColor(comparisonScopes[1]?.label ?? "Player B")}
                    />
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </>
      )}
    </AnalyticsPageShell>
  );
}
