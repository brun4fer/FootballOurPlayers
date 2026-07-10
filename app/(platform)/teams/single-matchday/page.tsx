import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { TeamAnalyticsTable } from "@/components/dashboard/team-analytics-table";
import { TeamNumericTable } from "@/components/dashboard/team-numeric-table";
import { TeamOverviewStats } from "@/components/dashboard/team-overview-stats";
import { TeamPercentageTable } from "@/components/dashboard/team-percentage-table";
import { TeamAnalyticsFilters } from "@/components/team-analytics/team-analytics-filters";
import { TeamEmptyStateCard } from "@/components/team-analytics/team-empty-state-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  filterBySearch,
  formatMatchLabel,
  getMatchSearchValues,
  getSearchQuery,
  matchesSearch,
} from "@/lib/analytics-search";
import { getAnalyzedTeamMatchAggregates } from "@/lib/data";
import {
  aggregateTeamDashboardTotals,
  buildGoalkeeperSummary,
  buildTeamAnalyticsTableRows,
  buildTeamNumericRows,
  buildTeamOverviewStats,
  buildTeamPercentageRows,
} from "@/lib/teamDashboardMetrics";
import {
  getTeamAnalyticsBaseData,
  resolveSingleId,
  type TeamAnalyticsSearchParams,
} from "@/lib/teamAnalytics";

type SingleMatchdayPageProps = {
  searchParams?: Promise<TeamAnalyticsSearchParams>;
};

export default async function TeamSingleMatchdayPage({
  searchParams,
}: SingleMatchdayPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getTeamAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="By Matchday"
        filters={[{ label: "Competition", value: "No competitions available" }]}
        searchQuery={searchQuery}
      >
        <TeamEmptyStateCard
          title="No competitions available"
          description="Create a competition to view team details by matchday."
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

  if (!selectedMatchId) {
    return (
      <AnalyticsPageShell
        title="By Matchday"
        description="A focused view of the team on a single matchday."
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Team", value: "Feirense" },
          { label: "Match", value: "Incomplete selection" },
        ]}
        searchQuery={searchQuery}
      >
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          matchMode="single"
          description="A focused view of the team on a single matchday."
          searchQuery={searchQuery}
        />
        <TeamEmptyStateCard
          title="Incomplete selection"
          description="Choose a matchday to view the team statistics for that match."
        />
      </AnalyticsPageShell>
    );
  }

  const matchAggregates = await getAnalyzedTeamMatchAggregates(baseData.selectedCompetitionId, [
    selectedMatchId,
  ]);

  if (matchAggregates.length === 0) {
    return (
      <AnalyticsPageShell
        title="By Matchday"
        description="Focus on the team performance on a single matchday."
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Team", value: "Feirense" },
          { label: "Match", value: selectedMatch ? formatMatchLabel(selectedMatch) : undefined },
        ]}
        searchQuery={searchQuery}
      >
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedMatchId={selectedMatchId}
          matchMode="single"
          description="A focused view of the team on a single matchday."
          searchQuery={searchQuery}
        />
        <TeamEmptyStateCard
          title="No record for this matchday"
          description="There are no recorded data for a team on this matchday."
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateTeamDashboardTotals(matchAggregates);
  const overviewStats = buildTeamOverviewStats(matchAggregates, totals);
  const analyticsRows = buildTeamAnalyticsTableRows(totals);
  const percentageRows = buildTeamPercentageRows(totals);
  const numericRows = buildTeamNumericRows(totals);
  const goalkeeperSummary = buildGoalkeeperSummary(totals);
  const searchMatchesScope = matchesSearch(searchQuery, [
    selectedCompetition?.name,
    "Feirense",
    ...(selectedMatch ? getMatchSearchValues(selectedMatch) : []),
  ]);
  const visibleOverviewStats = searchMatchesScope
    ? overviewStats
    : filterBySearch(overviewStats, searchQuery, (row) => [
        row.title,
        row.value,
        row.description,
      ]);
  const visibleAnalyticsRows = searchMatchesScope
    ? analyticsRows
    : filterBySearch(analyticsRows, searchQuery, (row) => [row.metric]);
  const visiblePercentageRows = searchMatchesScope
    ? percentageRows
    : filterBySearch(percentageRows, searchQuery, (row) => [row.metric]);
  const visibleNumericRows = searchMatchesScope
    ? numericRows
    : filterBySearch(numericRows, searchQuery, (row) => [row.metric, row.total]);

  return (
    <AnalyticsPageShell
      title="By Matchday"
      description="Focus on the team performance on a single matchday."
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        { label: "Team", value: "Feirense" },
        { label: "Match", value: selectedMatch ? formatMatchLabel(selectedMatch) : undefined },
      ]}
      searchQuery={searchQuery}
    >
      <TeamAnalyticsFilters
        competitions={baseData.competitions}
        matches={baseData.matchOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedMatchId={selectedMatchId}
        matchMode="single"
        description="A matchday is required in this view."
        searchQuery={searchQuery}
      />

      <Card>
        <CardHeader>
          <CardTitle>Matchday Summary</CardTitle>
          <CardDescription>
            {selectedMatch ? formatMatchLabel(selectedMatch) : "Matchday -"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamOverviewStats stats={visibleOverviewStats} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matchday Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamAnalyticsTable rows={visibleAnalyticsRows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Percentage Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamPercentageTable rows={visiblePercentageRows} goalkeeper={goalkeeperSummary} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamNumericTable rows={visibleNumericRows} />
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
