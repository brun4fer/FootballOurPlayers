import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { BarDistributionChart } from "@/components/charts/bar-distribution-chart";
import { GpsEvolutionChart } from "@/components/gps/gps-evolution-chart";
import { GpsSummary } from "@/components/gps/gps-summary";
import { GpsTable } from "@/components/gps/gps-table";
import { TrainingGpsFilters } from "@/components/gps/training-gps-filters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyzedTeam, getPlayerOptionsByTeam, getSeasons } from "@/lib/data";
import { aggregateGpsValues, parseGpsMetricKeys, trainingGpsMetricDefinitions } from "@/lib/gps-metrics";
import { aggregateTrainingGpsByPlayer } from "@/lib/training-gps-analytics";
import { formatTrainingLabel, getTrainingGpsStats, getTrainingSessions } from "@/lib/training-gps-data";
import { filterValidIds, parseIdList, parseOptionalId } from "@/lib/teamAnalytics";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
const colors = ["#22d3ee", "#a78bfa", "#34d399", "#fb7185", "#fbbf24", "#60a5fa"];

export default async function GpsTrainingPlayersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const [seasons, team] = await Promise.all([getSeasons(), getAnalyzedTeam()]);
  const requestedSeasonId = parseOptionalId(params.seasonId);
  const seasonId = requestedSeasonId && seasons.some((season) => season.id === requestedSeasonId) ? requestedSeasonId : seasons[0]?.id;
  const [trainings, players] = await Promise.all([getTrainingSessions(seasonId), team ? getPlayerOptionsByTeam(team.id) : []]);
  const requestedPlayers = filterValidIds(parseIdList(params.playerIds), new Set(players.map((player) => player.id)));
  const playerIds = requestedPlayers.length ? requestedPlayers : players[0] ? [players[0].id] : [];
  const trainingIds = filterValidIds(parseIdList(params.trainingIds), new Set(trainings.map((training) => training.id)));
  const microcycleNumbers = filterValidIds(parseIdList(params.microcycleNumbers), new Set(trainings.map((training) => training.microcycleNumber)));
  const trainingUnitNumbers = filterValidIds(parseIdList(params.trainingUnitNumbers), new Set(trainings.map((training) => training.trainingUnitNumber)));
  const metricKeys = parseGpsMetricKeys(params.metrics, params.metric);
  const selectedMetrics = metricKeys.map((key) => trainingGpsMetricDefinitions.find((metric) => metric.key === key)!);
  const query = String(Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "").trim().toLowerCase();
  const rawRows = await getTrainingGpsStats({ seasonId, playerIds, trainingIds, microcycleNumbers, trainingUnitNumbers });
  const rows = query ? rawRows.filter((row) => `${row.playerName} ${row.trainingDate} ${row.microcycleNumber} ${row.trainingUnitNumber}`.toLowerCase().includes(query)) : rawRows;
  const playerAggregates = aggregateTrainingGpsByPlayer(rows);
  const overall = aggregateGpsValues(rows);
  const trainingMap = new Map(trainings.map((training) => [training.id, training]));
  const rowTrainingIds = [...new Set(rows.map((row) => row.trainingSessionId))];
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const series = playerIds.map((playerId, index) => ({ key: `player-${playerId}`, label: playerMap.get(playerId)?.name ?? `Player ${playerId}`, color: colors[index % colors.length] }));
  const season = seasons.find((item) => item.id === seasonId);

  return <AnalyticsPageShell title="Player GPS - Training" description="Individual training load, comparisons and evolution across microcycles and training units." filters={[{ label: "Season", value: season?.name }, { label: "Players", value: series.map((item) => item.label) }, { label: "Microcycles", value: microcycleNumbers }, { label: "Training Units", value: trainingUnitNumbers }, { label: "Chart Metrics", value: selectedMetrics.map((metric) => metric.label) }]} searchQuery={query} exportFileName="player-gps-training">
    <TrainingGpsFilters seasons={seasons} players={players} trainings={trainings} seasonId={seasonId} playerIds={playerIds} trainingIds={trainingIds} microcycleNumbers={microcycleNumbers} trainingUnitNumbers={trainingUnitNumbers} metricKeys={metricKeys} showPlayers/>
    {rows.length ? <>
      <GpsSummary values={overall}/>
      {selectedMetrics.map((metric) => {
        const evolutionData = rowTrainingIds.map((trainingId) => {
          const training = trainingMap.get(trainingId);
          const point: Record<string, string | number> = { matchLabel: training ? formatTrainingLabel(training) : `Training ${trainingId}` };
          for (const playerId of playerIds) point[`player-${playerId}`] = Number(rows.find((row) => row.trainingSessionId === trainingId && row.playerId === playerId)?.[metric.key] ?? 0);
          return point as { matchLabel: string; [key: string]: string | number };
        });
        return <div key={metric.key} className="grid gap-4 xl:grid-cols-2">
          <Card><CardHeader><CardTitle>{metric.label} by Player</CardTitle><CardDescription>Aggregated value for the selected training units.</CardDescription></CardHeader><CardContent><BarDistributionChart data={playerAggregates.map((player) => ({ name: player.label, value: player.values[metric.key] }))}/></CardContent></Card>
          <Card><CardHeader><CardTitle>{metric.label} Evolution</CardTitle><CardDescription>Direct player comparison by date, microcycle and training unit.</CardDescription></CardHeader><CardContent><GpsEvolutionChart data={evolutionData} series={series} unit={metric.unit}/></CardContent></Card>
        </div>;
      })}
      <Card><CardHeader><CardTitle>Player GPS Training Totals</CardTitle><CardDescription>All GPS metrics for each selected player across the selected training units.</CardDescription></CardHeader><CardContent><GpsTable rows={playerAggregates} metrics={trainingGpsMetricDefinitions}/></CardContent></Card>
    </> : <Card><CardHeader><CardTitle>No GPS training data</CardTitle><CardDescription>Create a training and enter GPS statistics for its participating players in Administration.</CardDescription></CardHeader></Card>}
  </AnalyticsPageShell>;
}
