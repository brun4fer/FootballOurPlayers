import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { TeamAnalyticsTable } from "@/components/dashboard/team-analytics-table";
import {
  TeamActionEfficiencyChart,
  TeamActionVolumeChart,
} from "@/components/dashboard/team-action-charts";
import { TeamNumericTable } from "@/components/dashboard/team-numeric-table";
import { TeamOverviewStats } from "@/components/dashboard/team-overview-stats";
import { TeamPercentageTable } from "@/components/dashboard/team-percentage-table";
import { PdfExportButton } from "@/components/pdf/pdf-export-button";
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
        title="Team Evaluation Actions – All Matches"
        showPageExport={false}
        showReportSummary={false}
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
        title="Team Evaluation Actions – All Matches"
        description="Evaluates team action efficiency across all competition matches."
        showPageExport={false}
        showReportSummary={false}
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Team", value: baseData.teamName },
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
              : "There are no matchdays with recorded team data in this competition."
          }
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateTeamDashboardTotals(visibleMatchAggregates);
  const overviewStats = buildTeamOverviewStats(visibleMatchAggregates, totals);
  const analyticsRows = buildTeamAnalyticsTableRows(totals, visibleMatchAggregates.length);
  const percentageRows = buildTeamPercentageRows(totals);
  const numericRows = buildTeamNumericRows(totals, visibleMatchAggregates.length);
  const goalkeeperSummary = buildGoalkeeperSummary(totals);

  return (
    <AnalyticsPageShell
      title="Team Evaluation Actions – All Matches"
      description="Evaluates team action efficiency across all competition matches."
      showPageExport={false}
      showReportSummary={false}
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        { label: "Team", value: baseData.teamName },
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
        description="This view combines all recorded matchdays in the selected competition."
        searchQuery={searchQuery}
      />

      <Card id="team-all-matches-efficiency-summary">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Average Action Efficiency</CardTitle>
              <CardDescription>
                Weighted efficiency using every recorded action across {visibleMatchAggregates.length} matchday(s).
              </CardDescription>
            </div>
            <PdfExportButton
              targetId="team-all-matches-efficiency-summary"
              fileName={`${selectedCompetition?.name ?? "competition"}-team-action-efficiency-summary`}
              label="Generate summary PDF"
              orientation="landscape"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TeamOverviewStats stats={overviewStats} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card id="team-all-matches-efficiency-chart">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <CardTitle>Action Efficiency Chart</CardTitle>
                <CardDescription>
                  Success percentage for every recorded action type.
                </CardDescription>
              </div>
              <PdfExportButton
                targetId="team-all-matches-efficiency-chart"
                fileName={`${selectedCompetition?.name ?? "competition"}-team-action-efficiency-chart`}
                label="Generate chart PDF"
                orientation="landscape"
              />
            </div>
          </CardHeader>
          <CardContent>
            <TeamActionEfficiencyChart rows={percentageRows} />
          </CardContent>
        </Card>

        <Card id="team-all-matches-volume-chart">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <CardTitle>Action Volume Chart</CardTitle>
                <CardDescription>
                  Successful and unsuccessful actions across all matchdays.
                </CardDescription>
              </div>
              <PdfExportButton
                targetId="team-all-matches-volume-chart"
                fileName={`${selectedCompetition?.name ?? "competition"}-team-action-volume-chart`}
                label="Generate chart PDF"
                orientation="landscape"
              />
            </div>
          </CardHeader>
          <CardContent>
            <TeamActionVolumeChart rows={percentageRows} />
          </CardContent>
        </Card>
      </div>

      <Card id="team-all-matches-structured-totals">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Structured Totals</CardTitle>
              <CardDescription>
                Totals, percentages and correct team per-90 volume across {visibleMatchAggregates.length} matchday(s).
              </CardDescription>
            </div>
            <PdfExportButton
              targetId="team-all-matches-structured-totals"
              fileName={`${selectedCompetition?.name ?? "competition"}-team-structured-totals`}
              label="Generate totals PDF"
              orientation="landscape"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TeamAnalyticsTable rows={analyticsRows} />
        </CardContent>
      </Card>

      <Card id="team-all-matches-percentage-metrics">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CardTitle>Percentage Metrics</CardTitle>
            <PdfExportButton
              targetId="team-all-matches-percentage-metrics"
              fileName={`${selectedCompetition?.name ?? "competition"}-team-percentage-metrics`}
              label="Generate percentages PDF"
              orientation="landscape"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TeamPercentageTable rows={percentageRows} goalkeeper={goalkeeperSummary} />
        </CardContent>
      </Card>

      <Card id="team-all-matches-volume-metrics">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CardTitle>Volume Metrics</CardTitle>
            <PdfExportButton
              targetId="team-all-matches-volume-metrics"
              fileName={`${selectedCompetition?.name ?? "competition"}-team-volume-metrics`}
              label="Generate volume PDF"
              orientation="landscape"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TeamNumericTable rows={numericRows} />
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
