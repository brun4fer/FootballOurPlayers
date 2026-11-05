import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { BarDistributionChart } from "@/components/charts/bar-distribution-chart";
import { GpsEvolutionChart } from "@/components/gps/gps-evolution-chart";
import { GpsFilters } from "@/components/gps/gps-filters";
import { GpsSummary } from "@/components/gps/gps-summary";
import { GpsTable } from "@/components/gps/gps-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aggregateGpsByPlayer } from "@/lib/gps-analytics";
import { getGpsStats } from "@/lib/gps-data";
import { aggregateGpsValues, gpsMetricDefinitions, isGpsMetricKey } from "@/lib/gps-metrics";
import { filterValidIds, getPlayerAnalyticsBaseData, parseIdList } from "@/lib/playerAnalytics";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
const colors = ["#22d3ee", "#a78bfa", "#34d399", "#fb7185", "#fbbf24", "#60a5fa"];

export default async function GpsPlayersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const base = await getPlayerAnalyticsBaseData(params);
  const requestedPlayers = filterValidIds(parseIdList(params.playerIds), base.playerIdSet);
  const playerIds = requestedPlayers.length ? requestedPlayers : base.playerOptions[0] ? [base.playerOptions[0].id] : [];
  const matchIds = filterValidIds(parseIdList(params.matchIds), base.matchIdSet);
  const requestedMetric = Array.isArray(params.metric) ? params.metric[0] : params.metric;
  const metricKey = isGpsMetricKey(requestedMetric) ? requestedMetric : "totalDistance";
  const metric = gpsMetricDefinitions.find((item) => item.key === metricKey)!;
  const query = String(Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "").trim().toLowerCase();
  const rawRows = await getGpsStats({ competitionId: base.selectedCompetitionId, playerIds, matchIds });
  const rows = query
    ? rawRows.filter((row) => `${row.playerName} ${row.opponentTeamName} ${metric.label}`.toLowerCase().includes(query))
    : rawRows;
  const playerAggregates = aggregateGpsByPlayer(rows);
  const overall = aggregateGpsValues(rows);
  const matchMap = new Map(base.matchOptions.map((match) => [match.id, match]));
  const rowMatchIds = [...new Set(rows.map((row) => row.matchId))];
  const evolutionData = rowMatchIds.map((matchId) => {
    const match = matchMap.get(matchId);
    const point: Record<string, string | number> = {
      matchLabel: match ? `J${match.matchdayNumber} x ${match.opponentTeamName}` : `Match ${matchId}`,
    };
    for (const playerId of playerIds) {
      point[`player-${playerId}`] = Number(rows.find((row) => row.matchId === matchId && row.playerId === playerId)?.[metricKey] ?? 0);
    }
    return point as { matchLabel: string; [key: string]: string | number };
  });
  const playerMap = new Map(base.playerOptions.map((player) => [player.id, player]));
  const series = playerIds.map((playerId, index) => ({
    key: `player-${playerId}`,
    label: playerMap.get(playerId)?.name ?? `Player ${playerId}`,
    color: colors[index % colors.length],
  }));
  const competition = base.competitions.find((item) => item.id === base.selectedCompetitionId);

  return (
    <AnalyticsPageShell
      title="Player GPS"
      description="Individual GPS totals, comparisons and match-to-match evolution."
      filters={[{ label: "Competition", value: competition?.name }, { label: "Players", value: series.map((item) => item.label) }]}
      searchQuery={query}
      exportFileName="player-gps"
    >
      <GpsFilters competitions={base.competitions} players={base.playerOptions} matches={base.matchOptions} competitionId={base.selectedCompetitionId} playerIds={playerIds} matchIds={matchIds} metricKey={metricKey} showPlayers />

      {rows.length ? (
        <>
          <GpsSummary values={overall} />
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>{metric.label} by Player</CardTitle><CardDescription>Aggregated value for the selected matches.</CardDescription></CardHeader>
              <CardContent><BarDistributionChart data={playerAggregates.map((item) => ({ name: item.label, value: item.values[metricKey] }))} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{metric.label} Evolution</CardTitle><CardDescription>Direct comparison between the selected players.</CardDescription></CardHeader>
              <CardContent><GpsEvolutionChart data={evolutionData} series={series} unit={metric.unit} /></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Player GPS Totals</CardTitle><CardDescription>All GPS metrics for each selected player.</CardDescription></CardHeader>
            <CardContent><GpsTable rows={playerAggregates} /></CardContent>
          </Card>
        </>
      ) : (
        <Card><CardHeader><CardTitle>No GPS data</CardTitle><CardDescription>Enter GPS statistics for the selected players and matches in Administration.</CardDescription></CardHeader></Card>
      )}
    </AnalyticsPageShell>
  );
}
