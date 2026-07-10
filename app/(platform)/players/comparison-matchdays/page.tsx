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
        title="Matchday Comparison"
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
      title="Matchday Comparison"
      description="Automatically compares all outfield players used on the selected matchday. Goalkeepers are excluded."
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
                : "No players outfield used"
              : "Incomplete selection"
          }
          description={
            selectedMatchId
              ? searchQuery
                ? "The current search did not find any outfield players on this matchday."
                : "There are no players outfield with recorded minutes on this matchday."
              : "Choose a matchday to compare the players used."
          }
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Matchday Ranking</CardTitle>
              <CardDescription>
                {selectedMatch ? formatMatchLabel(selectedMatch) : "Matchday -"} - {comparisonRows.length} outfield players
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
