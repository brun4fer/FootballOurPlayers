import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { TeamEvolutionCharts } from "@/components/dashboard/team-evolution-charts";
import { TeamOverviewStats } from "@/components/dashboard/team-overview-stats";
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
  buildTeamEvolutionCharts,
  buildTeamOverviewStats,
} from "@/lib/teamDashboardMetrics";
import {
  filterValidIds,
  getTeamAnalyticsBaseData,
  parseIdList,
  type TeamAnalyticsSearchParams,
} from "@/lib/teamAnalytics";

type TeamEvolutionPageProps = {
  searchParams?: Promise<TeamAnalyticsSearchParams>;
};

export default async function TeamEvolutionPage({
  searchParams,
}: TeamEvolutionPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getTeamAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Evolution"
        filters={[{ label: "Competition", value: "No competitions available" }]}
        searchQuery={searchQuery}
      >
        <TeamEmptyStateCard
          title="No competitions available"
          description="Create a competition to track the team across matchdays."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const selectedMatchIds = filterValidIds(parseIdList(params.matchIds), baseData.matchIdSet);
  const scopedMatchIds = selectedMatchIds.length > 0 ? selectedMatchIds : undefined;

  const matchAggregates = await getAnalyzedTeamMatchAggregates(
    baseData.selectedCompetitionId,
    scopedMatchIds,
  );
  const visibleMatchAggregates = matchesSearch(searchQuery, [selectedCompetition?.name, "Feirense"])
    ? matchAggregates
    : filterBySearch(matchAggregates, searchQuery, getMatchSearchValues);

  if (visibleMatchAggregates.length === 0) {
    return (
      <AnalyticsPageShell
        title="Evolution"
        description="Charts by matchday with averages, trends, and best and worst periods highlighted."
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Team", value: "Feirense" },
          { label: "Matches", value: searchQuery ? "No matches in the current filter" : "No data" },
        ]}
        searchQuery={searchQuery}
      >
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedMatchIds={selectedMatchIds}
          matchMode="multiple"
          description="Select several matchdays to analyse the team over time."
          searchQuery={searchQuery}
        />
        <TeamEmptyStateCard
          title="No data for the current filter"
          description="Adjust the competition, matchday selection or search to generate evolution charts."
        />
      </AnalyticsPageShell>
    );
  }

  if (visibleMatchAggregates.length < 2) {
    return (
      <AnalyticsPageShell
        title="Evolution"
        description="Charts by matchday with averages, trends, and best and worst periods highlighted."
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Team", value: "Feirense" },
          {
            label: "Matches",
            value: describeList(visibleMatchAggregates.map(formatMatchLabel), "No matches"),
          },
        ]}
        searchQuery={searchQuery}
      >
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedMatchIds={selectedMatchIds}
          matchMode="multiple"
          description="Select several matchdays to analyse the team over time."
          searchQuery={searchQuery}
        />
        <TeamEmptyStateCard
          title="Not enough matchdays for an evolution view"
          description="Select at least two matchdays, or use the entire competition, to view evolution charts."
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateTeamDashboardTotals(visibleMatchAggregates);
  const overviewStats = buildTeamOverviewStats(visibleMatchAggregates, totals);
  const evolutionCharts = buildTeamEvolutionCharts(visibleMatchAggregates);

  return (
    <AnalyticsPageShell
      title="Evolution"
      description="Charts by matchday with averages, trends, and best and worst periods highlighted."
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
        matches={baseData.matchOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedMatchIds={selectedMatchIds}
        matchMode="multiple"
        description="Matchday evolution view. If no matchdays are selected, the entire competition is used."
        searchQuery={searchQuery}
      />

      <TeamOverviewStats stats={overviewStats} />

      <Card>
        <CardHeader>
          <CardTitle>Evolution Charts</CardTitle>
          <CardDescription>
            Feirense matchday evolution across percentage and volume metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamEvolutionCharts charts={evolutionCharts} />
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
