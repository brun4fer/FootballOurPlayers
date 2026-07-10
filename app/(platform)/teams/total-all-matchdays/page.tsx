import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { TeamAnalyticsTable } from "@/components/dashboard/team-analytics-table";
import { TeamNumericTable } from "@/components/dashboard/team-numeric-table";
import { TeamOverviewStats } from "@/components/dashboard/team-overview-stats";
import { TeamPercentageTable } from "@/components/dashboard/team-percentage-table";
import { TeamAnalyticsFilters } from "@/components/team-analytics/team-analytics-filters";
import { TeamEmptyStateCard } from "@/components/team-analytics/team-empty-state-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  describeList,
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
  type TeamAnalyticsSearchParams,
} from "@/lib/teamAnalytics";

type TotalAllMatchdaysPageProps = {
  searchParams?: Promise<TeamAnalyticsSearchParams>;
};

export default async function TeamTotalAllMatchdaysPage({
  searchParams,
}: TotalAllMatchdaysPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getTeamAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Totals (All Matchdays)"
        filters={[{ label: "Competition", value: "No competitions available" }]}
        searchQuery={searchQuery}
      >
        <TeamEmptyStateCard
          title="No competitions available"
          description="Create a competition to view aggregated team totals."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const matchAggregates = await getAnalyzedTeamMatchAggregates(baseData.selectedCompetitionId);
  const visibleMatchAggregates = matchesSearch(searchQuery, [selectedCompetition?.name])
    ? matchAggregates
    : filterBySearch(matchAggregates, searchQuery, getMatchSearchValues);

  if (visibleMatchAggregates.length === 0) {
    return (
      <AnalyticsPageShell
        title="Totals (All Matchdays)"
        description="Consolidated team view across all competition matchdays."
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Team", value: "Feirense" },
          { label: "Matches", value: searchQuery ? "No matches in the current filter" : "No data" },
        ]}
        searchQuery={searchQuery}
      >
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          description="Consolidated team view across all competition matchdays."
          searchQuery={searchQuery}
        />
        <TeamEmptyStateCard
          title={searchQuery ? "No search results" : "No data for this competition"}
          description={
            searchQuery
              ? "The current search did not find matches for the team."
              : "There are not are matchdays with records to display totals aggregated."
          }
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateTeamDashboardTotals(visibleMatchAggregates);
  const overviewStats = buildTeamOverviewStats(visibleMatchAggregates, totals);
  const analyticsRows = buildTeamAnalyticsTableRows(totals);
  const percentageRows = buildTeamPercentageRows(totals);
  const numericRows = buildTeamNumericRows(totals);
  const goalkeeperSummary = buildGoalkeeperSummary(totals);

  return (
    <AnalyticsPageShell
      title="Totals (All Matchdays)"
      description="Leitura consolidada of the team throughout the entire competition, without filtering per matchday."
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        { label: "Team", value: "Feirense" },
        {
          label: "Matches",
          value: describeList(visibleMatchAggregates.map(formatMatchLabel), "All matchdays"),
        },
      ]}
      searchQuery={searchQuery}
    >
      <TeamAnalyticsFilters
        competitions={baseData.competitions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        description="No matchday filter. This view resume the entire competition."
        searchQuery={searchQuery}
      />

      <TeamOverviewStats stats={overviewStats} />

      <Card>
        <CardHeader>
          <CardTitle>Totals Estruturados</CardTitle>
          <CardDescription>
            Totals, percentages and per-90 volume across {visibleMatchAggregates.length} matchday(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamAnalyticsTable rows={analyticsRows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Percentage Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamPercentageTable rows={percentageRows} goalkeeper={goalkeeperSummary} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamNumericTable rows={numericRows} />
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
