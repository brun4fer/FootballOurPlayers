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
        title="Comparison Geral"
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
      title="Comparison Geral"
      description="Aggregated totals for several players across all competition matchdays."
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        {
          label: "Players",
          value: describeList(
            visibleSelectedPlayerOptions.map((player) => player.name),
            hasPlayerSelection ? "No results" : "Selecao insuficiente",
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
        description="Select up to three players to view comparison charts. With more players, the analysis focuses on the ranking."
        searchQuery={searchQuery}
      />

      {!hasPlayerSelection || !hasValidSelection ? (
        <PlayerEmptyStateCard
          title={
            hasPlayerSelection
              ? "No players match the current search"
              : "Selecao insuficiente"
          }
          description={
            hasPlayerSelection
              ? "The current search did not find any players within the selection."
              : "Choose at least one player to enable the ranking and overall comparison."
          }
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Classificacao Comparativa</CardTitle>
              <CardDescription>
                Scalable comparison table with sorting by any column and automatic highlighting of the best values.
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
                  <CardTitle>Chart by Metric</CardTitle>
                  <CardDescription>
                    Simplified comparison for one to three players, showing one metric at a time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PlayerMetricFocusChart rows={comparisonRows} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {comparisonScopes.length === 1 ? "Player Radar" : "Comparison Radar"}
                  </CardTitle>
                  <CardDescription>
                    {comparisonScopes.length === 1
                      ? "Complete profile of the selected player."
                      : comparisonScopes.length === 2
                        ? "Available when exactly two players are selected."
                        : "With three players, the radar is omitted to avoid visual clutter."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {comparisonScopes.length === 1 ? (
                    <RadarProfileChart
                      data={singlePlayerRadarData}
                      color={getSeriesColor(comparisonScopes[0]?.label ?? "Player")}
                      name={comparisonScopes[0]?.label ?? "Player"}
                    />
                  ) : radarComparisonData.length > 0 ? (
                    <RadarComparisonChart
                      data={radarComparisonData}
                      primaryLabel={comparisonScopes[0]?.label ?? "Player A"}
                      secondaryLabel={comparisonScopes[1]?.label ?? "Player B"}
                      primaryColor={getSeriesColor(comparisonScopes[0]?.label ?? "Player A")}
                      secondaryColor={getSeriesColor(comparisonScopes[1]?.label ?? "Player B")}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      The radar is available for one player or a direct comparison between two players.
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
                  Select up to three players to view comparison charts.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </>
      )}
    </AnalyticsPageShell>
  );
}
