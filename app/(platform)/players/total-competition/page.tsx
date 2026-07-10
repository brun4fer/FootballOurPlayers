import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerComparisonSummaryTable } from "@/components/player-analytics/player-comparison-summary-table";
import { PlayerCompetitionTotalsTable } from "@/components/player-analytics/player-competition-totals-table";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerRankingInsights } from "@/components/player-analytics/player-ranking-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { describeList, filterBySearch, getSearchQuery, matchesSearch } from "@/lib/analytics-search";
import { getCompetitionPlayerTotals } from "@/lib/data";
import { toOutfieldTotalsFromAggregate } from "@/lib/dashboardMetrics";
import {
  buildComparisonSummaryRows,
  filterValidIds,
  getPlayerAnalyticsBaseData,
  parseIdList,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";

type TotalCompetitionPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function TotalCompetitionPage({
  searchParams,
}: TotalCompetitionPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Competition Totals"
        filters={[{ label: "Competition", value: "No competitions available" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="No competitions available"
          description="Create a competition to view aggregated player totals."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const allCompetitionPlayerTotals = await getCompetitionPlayerTotals(baseData.selectedCompetitionId);
  const teamOptions = [
    ...new Map(
      allCompetitionPlayerTotals.map((row) => [
        row.teamId,
        { id: row.teamId, name: String(row.teamName ?? "-") },
      ]),
    ).values(),
  ].sort((left, right) => left.name.localeCompare(right.name));
  const selectedTeamIds = filterValidIds(
    parseIdList(params.teamIds),
    new Set(teamOptions.map((team) => team.id)),
  );
  const selectedTeamIdSet = new Set(selectedTeamIds);
  const competitionPlayerTotals =
    selectedTeamIds.length > 0
      ? allCompetitionPlayerTotals.filter((row) => selectedTeamIdSet.has(row.teamId))
      : allCompetitionPlayerTotals;
  const visibleCompetitionPlayerTotals = matchesSearch(searchQuery, [selectedCompetition?.name])
    ? competitionPlayerTotals
    : filterBySearch(competitionPlayerTotals, searchQuery, (row) => [
        row.playerName,
        row.teamName,
      ]);
  const comparisonScopes = visibleCompetitionPlayerTotals.map((row) => ({
    label: String(row.playerName ?? "-"),
    totals: toOutfieldTotalsFromAggregate(row as Record<string, unknown>),
  }));
  const comparisonRows = buildComparisonSummaryRows(comparisonScopes);
  const resetFiltersHref =
    selectedTeamIds.length > 0
      ? `/players/total-competition?competitionId=${baseData.selectedCompetitionId}${
          searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""
        }`
      : undefined;

  return (
    <AnalyticsPageShell
      title="Competition Totals"
      description="Aggregated view of all players in the selected competition, without matchday filtering."
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        {
          label: "Teams",
          value: describeList(
            teamOptions
              .filter((team) => selectedTeamIdSet.has(team.id))
              .map((team) => team.name),
          ),
        },
        {
          label: "Players",
          value: `${visibleCompetitionPlayerTotals.length} of ${allCompetitionPlayerTotals.length}`,
        },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        teams={teamOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedTeamIds={selectedTeamIds}
        description="Overall analysis of player performance within the competition."
        resetHref={resetFiltersHref}
        searchQuery={searchQuery}
      />

      <Card>
        <CardHeader>
          <CardTitle>Classificacao Comparativa</CardTitle>
          <CardDescription>
            Aggregated charts are hidden in this view to preserve readability with many players.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerComparisonSummaryTable rows={comparisonRows} />
        </CardContent>
      </Card>

      <PlayerRankingInsights rows={comparisonRows} />

      <Card>
        <CardHeader>
          <CardTitle>Aggregated Player Totals</CardTitle>
          <CardDescription>
            {visibleCompetitionPlayerTotals.length} of {allCompetitionPlayerTotals.length} players visible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerCompetitionTotalsTable rows={visibleCompetitionPlayerTotals} />
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
