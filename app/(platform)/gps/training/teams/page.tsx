import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { BarDistributionChart } from "@/components/charts/bar-distribution-chart";
import { GpsEvolutionChart } from "@/components/gps/gps-evolution-chart";
import { GpsSummary } from "@/components/gps/gps-summary";
import { GpsTable } from "@/components/gps/gps-table";
import { TrainingGpsFilters } from "@/components/gps/training-gps-filters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyzedTeam, getSeasons } from "@/lib/data";
import { parseGpsMetricKeys, trainingGpsMetricDefinitions } from "@/lib/gps-metrics";
import { aggregateTrainingGpsBySession, aggregateTrainingTeamTotals } from "@/lib/training-gps-analytics";
import { getTrainingGpsStats, getTrainingSessions } from "@/lib/training-gps-data";
import { filterValidIds, parseIdList, parseOptionalId } from "@/lib/teamAnalytics";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function GpsTrainingTeamsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const [seasons, team] = await Promise.all([getSeasons(), getAnalyzedTeam()]);
  const seasonIdSet = new Set(seasons.map((season) => season.id));
  const requestedSeasonId = parseOptionalId(params.seasonId);
  const seasonId = requestedSeasonId && seasonIdSet.has(requestedSeasonId) ? requestedSeasonId : seasons[0]?.id;
  const trainings = await getTrainingSessions(seasonId);
  const trainingIds = filterValidIds(parseIdList(params.trainingIds), new Set(trainings.map((training) => training.id)));
  const microcycleNumbers = filterValidIds(parseIdList(params.microcycleNumbers), new Set(trainings.map((training) => training.microcycleNumber)));
  const trainingUnitNumbers = filterValidIds(parseIdList(params.trainingUnitNumbers), new Set(trainings.map((training) => training.trainingUnitNumber)));
  const metricKeys = parseGpsMetricKeys(params.metrics, params.metric);
  const selectedMetrics = metricKeys.map((key) => trainingGpsMetricDefinitions.find((metric) => metric.key === key)!);
  const query = String(Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "").trim().toLowerCase();
  const rawRows = await getTrainingGpsStats({ seasonId, trainingIds, microcycleNumbers, trainingUnitNumbers });
  const rows = query ? rawRows.filter((row) => `${row.trainingDate} ${row.microcycleNumber} ${row.trainingUnitNumber} ${row.playerName}`.toLowerCase().includes(query)) : rawRows;
  const trainingAggregates = aggregateTrainingGpsBySession(rows);
  const overall = aggregateTrainingTeamTotals(trainingAggregates);
  const season = seasons.find((item) => item.id === seasonId);

  return <AnalyticsPageShell title="Team GPS - Training" description="Collective training load calculated from the participating players, organized by date, microcycle and training unit." filters={[{ label: "Season", value: season?.name }, { label: "Microcycles", value: microcycleNumbers }, { label: "Training Units", value: trainingUnitNumbers }, { label: "Chart Metrics", value: selectedMetrics.map((metric) => metric.label) }]} searchQuery={query} exportFileName="team-gps-training">
    <TrainingGpsFilters seasons={seasons} trainings={trainings} seasonId={seasonId} trainingIds={trainingIds} microcycleNumbers={microcycleNumbers} trainingUnitNumbers={trainingUnitNumbers} metricKeys={metricKeys} showPlayers={false}/>
    {rows.length ? <>
      <GpsSummary values={overall}/>
      {selectedMetrics.map((metric) => <div key={metric.key} className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>{metric.label} by Training</CardTitle><CardDescription>Collective value for each training unit.</CardDescription></CardHeader><CardContent><BarDistributionChart data={trainingAggregates.map((training) => ({ name: training.label, value: training.values[metric.key] }))}/></CardContent></Card>
        <Card><CardHeader><CardTitle>{metric.label} Evolution</CardTitle><CardDescription>Evolution ordered by training date, microcycle and unit.</CardDescription></CardHeader><CardContent><GpsEvolutionChart data={trainingAggregates.map((training) => ({ matchLabel: training.label, team: training.values[metric.key] }))} series={[{ key: "team", label: team?.name ?? "Team", color: "#22d3ee" }]} unit={metric.unit}/></CardContent></Card>
      </div>)}
      <Card><CardHeader><CardTitle>Team GPS by Training</CardTitle><CardDescription>Duration is counted once per training. Maximum speed uses the highest player value; remaining physical metrics are summed.</CardDescription></CardHeader><CardContent><GpsTable rows={trainingAggregates} metrics={trainingGpsMetricDefinitions}/></CardContent></Card>
    </> : <Card><CardHeader><CardTitle>No GPS training data</CardTitle><CardDescription>Create a training and enter player GPS statistics in Administration.</CardDescription></CardHeader></Card>}
  </AnalyticsPageShell>;
}
