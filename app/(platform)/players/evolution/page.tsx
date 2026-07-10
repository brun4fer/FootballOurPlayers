import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerEvolutionChartPanel } from "@/components/player-analytics/player-evolution-chart-panel";
import { PlayerOverviewStats } from "@/components/player-analytics/player-overview-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  describeList,
  filterBySearch,
  formatMatchLabel,
  getMatchSearchValues,
  getSearchQuery,
  matchesSearch,
} from "@/lib/analytics-search";
import { aggregateOutfieldTotals } from "@/lib/dashboardMetrics";
import {
  buildMetricEvolutionData,
  buildPlayerOverviewStats,
  EVOLUTION_METRICS,
  getSeriesColor,
  getPlayerAnalyticsBaseData,
  loadPlayerAnalyticsData,
  resolveSingleId,
  type EvolutionLine,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";

type EvolutionPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function EvolutionPage({ searchParams }: EvolutionPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Evolution"
        filters={[{ label: "Competition", value: "No competitions available" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="No competitions available"
          description="Create a competition to track player performance across matchdays."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const selectedPlayerId = resolveSingleId(
    params.playerId,
    baseData.playerIdSet,
    baseData.playerOptions[0]?.id,
  );

  if (!selectedPlayerId) {
    return (
      <AnalyticsPageShell
        title="Evolution"
        description="Line-chart view by matchday for a single player."
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Player", value: "No players available" },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          playerMode="single"
          description="Line-chart view by matchday for a single player."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="No players available"
          description="Assign players to this competition to view their evolution."
        />
      </AnalyticsPageShell>
    );
  }

  const loadedData = await loadPlayerAnalyticsData({
    competitionId: baseData.selectedCompetitionId,
    playerOptions: baseData.playerOptions,
    playerIds: [selectedPlayerId],
  });

  const player = loadedData.playerMap.get(selectedPlayerId);
  const outfieldRows = loadedData.outfieldRowsByPlayer.get(selectedPlayerId) ?? [];
  const searchMatchesScope = matchesSearch(searchQuery, [
    selectedCompetition?.name,
    player?.name,
    player?.teamName,
  ]);
  const visibleOutfieldRows = searchMatchesScope
    ? outfieldRows
    : filterBySearch(outfieldRows, searchQuery, getMatchSearchValues);

  if (visibleOutfieldRows.length === 0) {
    return (
      <AnalyticsPageShell
        title="Evolution"
        description="Line charts tracking performance changes by matchday."
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          { label: "Player", value: player?.name },
          { label: "Team", value: player?.teamName },
          { label: "Matches", value: searchQuery ? "No matches in the current filter" : "No data" },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerId={selectedPlayerId}
          playerMode="single"
          description="Line-chart view by matchday for a single player."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="No data for the selected player"
          description="There are not enough recorded matchdays to display an evolution."
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateOutfieldTotals(visibleOutfieldRows);
  const overviewStats = buildPlayerOverviewStats(
    totals,
    new Set(visibleOutfieldRows.map((row) => row.matchId)).size,
  );
  const evolutionLines: EvolutionLine[] = [
    {
      playerId: selectedPlayerId,
      dataKey: `player_${selectedPlayerId}`,
      label: player?.name ?? `Player ${selectedPlayerId}`,
      color: getSeriesColor(player?.name ?? selectedPlayerId),
    },
  ];
  const chartRowsByPlayer = new Map([[selectedPlayerId, visibleOutfieldRows]]);
  const evolutionCharts = EVOLUTION_METRICS.map((metric) => ({
    key: metric.key,
    title: metric.label,
    data: buildMetricEvolutionData(metric.key, chartRowsByPlayer, evolutionLines),
  }));

  return (
    <AnalyticsPageShell
      title="Evolution"
      description="Line charts tracking performance changes by matchday."
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        { label: "Player", value: player?.name },
        { label: "Team", value: player?.teamName },
        {
          label: "Matches",
          value: describeList(visibleOutfieldRows.map(formatMatchLabel), "All matchdays"),
        },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerId={selectedPlayerId}
        playerMode="single"
        description="This view supports one player and uses all competition matchdays."
        searchQuery={searchQuery}
      />

      <PlayerOverviewStats stats={overviewStats} />

      <Card>
        <CardHeader>
          <CardTitle>Evolution Charts</CardTitle>
          <CardDescription>
            {player?.name ?? "Player"} matchday by matchday, with averages, trends and consistency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerEvolutionChartPanel
            charts={evolutionCharts}
            lines={evolutionLines}
            displayMode="per90"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matchday Record</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matchday</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead>Minutos</TableHead>
                <TableHead>Goals</TableHead>
                <TableHead>Assistencias</TableHead>
                <TableHead>Recuperacoes</TableHead>
                <TableHead>Intercecoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleOutfieldRows.map((row) => (
                <TableRow key={row.matchId}>
                  <TableCell>{row.matchdayNumber}</TableCell>
                  <TableCell>{row.opponentTeamName}</TableCell>
                  <TableCell>{row.minutesPlayed}</TableCell>
                  <TableCell>{row.goals}</TableCell>
                  <TableCell>{row.assists}</TableCell>
                  <TableCell>{row.recoveries}</TableCell>
                  <TableCell>{row.interceptions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
