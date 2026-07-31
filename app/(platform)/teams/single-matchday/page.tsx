import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import {
  TeamActionEfficiencyChart,
  TeamActionVolumeChart,
} from "@/components/dashboard/team-action-charts";
import { TeamAnalyticsTable } from "@/components/dashboard/team-analytics-table";
import { TeamNumericTable } from "@/components/dashboard/team-numeric-table";
import { TeamOverviewStats } from "@/components/dashboard/team-overview-stats";
import { TeamPercentageTable } from "@/components/dashboard/team-percentage-table";
import { PdfExportButton } from "@/components/pdf/pdf-export-button";
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
        title="Team Actions by Match"
        showPageExport={false}
        showReportSummary={false}
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
        title="Team Actions by Match"
        description="A focused view of the team on a single matchday."
        showPageExport={false}
        showReportSummary={false}
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Team", value: baseData.teamName },
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
        title="Team Actions by Match"
        description="Focus on the team performance on a single matchday."
        showPageExport={false}
        showReportSummary={false}
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Team", value: baseData.teamName },
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
          description="There is no recorded team data for this match."
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateTeamDashboardTotals(matchAggregates);
  const overviewStats = buildTeamOverviewStats(matchAggregates, totals);
  const analyticsRows = buildTeamAnalyticsTableRows(totals, matchAggregates.length);
  const percentageRows = buildTeamPercentageRows(totals);
  const numericRows = buildTeamNumericRows(totals, matchAggregates.length);
  const goalkeeperSummary = buildGoalkeeperSummary(totals);
  const searchMatchesScope = matchesSearch(searchQuery, [
    selectedCompetition?.name,
    baseData.teamName,
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
      title="Team Actions by Match"
      description="Evaluates team action efficiency in the selected match."
      showPageExport={false}
      showReportSummary={false}
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        { label: "Team", value: baseData.teamName },
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

      <Card id="team-match-summary">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Match Summary</CardTitle>
              <CardDescription>
                {selectedMatch ? formatMatchLabel(selectedMatch) : "Match -"}
              </CardDescription>
            </div>
            <PdfExportButton
              targetId="team-match-summary"
              fileName={`${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-team-summary`}
              label="Generate summary PDF"
              orientation="landscape"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TeamOverviewStats stats={visibleOverviewStats} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card id="team-match-efficiency-chart">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <CardTitle>Action Efficiency Chart</CardTitle>
                <CardDescription>
                  Success percentage for every recorded action in this match.
                </CardDescription>
              </div>
              <PdfExportButton
                targetId="team-match-efficiency-chart"
                fileName={`${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-team-efficiency-chart`}
                label="Generate chart PDF"
                orientation="landscape"
              />
            </div>
          </CardHeader>
          <CardContent>
            <TeamActionEfficiencyChart rows={visiblePercentageRows} />
          </CardContent>
        </Card>

        <Card id="team-match-volume-chart">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <CardTitle>Action Volume Chart</CardTitle>
                <CardDescription>
                  Successful and unsuccessful team actions in this match.
                </CardDescription>
              </div>
              <PdfExportButton
                targetId="team-match-volume-chart"
                fileName={`${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-team-volume-chart`}
                label="Generate chart PDF"
                orientation="landscape"
              />
            </div>
          </CardHeader>
          <CardContent>
            <TeamActionVolumeChart rows={visiblePercentageRows} />
          </CardContent>
        </Card>
      </div>

      <Card id="team-match-totals">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CardTitle>Match Totals</CardTitle>
            <PdfExportButton
              targetId="team-match-totals"
              fileName={`${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-team-totals`}
              label="Generate totals PDF"
              orientation="landscape"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TeamAnalyticsTable rows={visibleAnalyticsRows} />
        </CardContent>
      </Card>

      <Card id="team-match-percentage-metrics">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CardTitle>Percentage Metrics</CardTitle>
            <PdfExportButton
              targetId="team-match-percentage-metrics"
              fileName={`${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-team-percentages`}
              label="Generate percentages PDF"
              orientation="landscape"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TeamPercentageTable rows={visiblePercentageRows} goalkeeper={goalkeeperSummary} />
        </CardContent>
      </Card>

      <Card id="team-match-volume-metrics">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <CardTitle>Volume Metrics</CardTitle>
            <PdfExportButton
              targetId="team-match-volume-metrics"
              fileName={`${selectedCompetition?.name ?? "competition"}-match-${selectedMatch?.matchdayNumber ?? selectedMatchId}-team-volume`}
              label="Generate volume PDF"
              orientation="landscape"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TeamNumericTable rows={visibleNumericRows} />
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
