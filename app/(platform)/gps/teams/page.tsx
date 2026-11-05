import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { BarDistributionChart } from "@/components/charts/bar-distribution-chart";
import { GpsEvolutionChart } from "@/components/gps/gps-evolution-chart";
import { GpsFilters } from "@/components/gps/gps-filters";
import { GpsSummary } from "@/components/gps/gps-summary";
import { GpsTable } from "@/components/gps/gps-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aggregateGpsByMatch } from "@/lib/gps-analytics";
import { getGpsStats } from "@/lib/gps-data";
import { aggregateGpsValues, gpsMetricDefinitions, isGpsMetricKey } from "@/lib/gps-metrics";
import { filterValidIds, getTeamAnalyticsBaseData, parseIdList } from "@/lib/teamAnalytics";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function GpsTeamsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const base = await getTeamAnalyticsBaseData(params);
  const matchIds = filterValidIds(parseIdList(params.matchIds), base.matchIdSet);
  const requestedMetric = Array.isArray(params.metric) ? params.metric[0] : params.metric;
  const metricKey = isGpsMetricKey(requestedMetric) ? requestedMetric : "totalDistance";
  const metric = gpsMetricDefinitions.find((item) => item.key === metricKey)!;
  const query = String(Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "").trim().toLowerCase();
  const rawRows = await getGpsStats({ competitionId: base.selectedCompetitionId, matchIds });
  const rows = query
    ? rawRows.filter((row) => `${row.opponentTeamName} ${metric.label}`.toLowerCase().includes(query))
    : rawRows;
  const matchAggregates = aggregateGpsByMatch(rows);
  const overall = aggregateGpsValues(matchAggregates.map((item) => item.values));
  const competition = base.competitions.find((item) => item.id === base.selectedCompetitionId);
  const evolutionData = matchAggregates.map((item) => ({ matchLabel: item.label, team: item.values[metricKey] }));

  return (
    <AnalyticsPageShell
      title="Team GPS"
      description="Collective GPS workload calculated automatically from the players in this account."
      filters={[{ label: "Competition", value: competition?.name }, { label: "Team", value: base.teamName }]}
      searchQuery={query}
      exportFileName="team-gps"
    >
      <GpsFilters competitions={base.competitions} matches={base.matchOptions} competitionId={base.selectedCompetitionId} matchIds={matchIds} metricKey={metricKey} showPlayers={false} />

      {rows.length ? (
        <>
          <GpsSummary values={overall} />
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>{metric.label} by Match</CardTitle><CardDescription>Collective value calculated from every player with GPS data.</CardDescription></CardHeader>
              <CardContent><BarDistributionChart data={matchAggregates.map((item) => ({ name: item.label, value: item.values[metricKey] }))} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{metric.label} Evolution</CardTitle><CardDescription>Collective evolution from match to match.</CardDescription></CardHeader>
              <CardContent><GpsEvolutionChart data={evolutionData} series={[{ key: "team", label: base.teamName, color: "#22d3ee" }]} unit={metric.unit} /></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Team GPS by Match</CardTitle><CardDescription>All collective GPS values. Maximum speed uses the highest player value; the remaining metrics are summed.</CardDescription></CardHeader>
            <CardContent><GpsTable rows={matchAggregates} /></CardContent>
          </Card>
        </>
      ) : (
        <Card><CardHeader><CardTitle>No GPS data</CardTitle><CardDescription>Enter player GPS statistics in Administration to generate the collective analysis.</CardDescription></CardHeader></Card>
      )}
    </AnalyticsPageShell>
  );
}
