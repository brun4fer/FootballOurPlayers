import { BarDistributionChart } from "@/components/charts/bar-distribution-chart";
import { LinePerformanceChart } from "@/components/charts/line-performance-chart";
import { RadarComparisonChart } from "@/components/charts/radar-comparison-chart";
import { RadarProfileChart } from "@/components/charts/radar-profile-chart";
import { StatCard } from "@/components/stats/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  formatMatchLabel,
  getCompetitionOptions,
  getCompetitionPlayerTotals,
  getCompetitionTeamTotals,
  getDashboardPlayersByCompetition,
  getPlayerCompetitionMatchStats,
} from "@/lib/data";
import {
  buildOffensiveDistribution,
  buildRadarProfile,
  computeOutfieldPercentages,
  formatFixed,
  mergeMatchRows,
  sumNumericRows,
} from "@/lib/stats";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseOptionalId(value: string | string[] | undefined) {
  if (!value || Array.isArray(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  const competitions = await getCompetitionOptions();
  const selectedCompetitionId =
    parseOptionalId(params.competitionId) ?? competitions[0]?.id ?? undefined;
  const playerOptions = await getDashboardPlayersByCompetition(selectedCompetitionId);
  const selectedPlayerId = parseOptionalId(params.playerId) ?? playerOptions[0]?.id ?? undefined;
  const selectedComparePlayerId = parseOptionalId(params.comparePlayerId);

  const [selectedPlayerRows, compareRows, competitionPlayerTotals, competitionTeamTotals] =
    await Promise.all([
      getPlayerCompetitionMatchStats(selectedPlayerId, selectedCompetitionId),
      getPlayerCompetitionMatchStats(selectedComparePlayerId, selectedCompetitionId),
      getCompetitionPlayerTotals(selectedCompetitionId),
      getCompetitionTeamTotals(selectedCompetitionId),
    ]);

  const selectedPlayer = playerOptions.find((player) => player.id === selectedPlayerId);
  const selectedComparePlayer = playerOptions.find((player) => player.id === selectedComparePlayerId);

  const sortedRows = mergeMatchRows(selectedPlayerRows as Array<Record<string, unknown>>);
  const totals = sumNumericRows(
    sortedRows.map((row) => ({
      minutesPlayed: Number(row.minutesPlayed ?? 0),
      shortPassSuccess: Number(row.shortPassSuccess ?? 0),
      shortPassFail: Number(row.shortPassFail ?? 0),
      longPassSuccess: Number(row.longPassSuccess ?? 0),
      longPassFail: Number(row.longPassFail ?? 0),
      crossSuccess: Number(row.crossSuccess ?? 0),
      crossFail: Number(row.crossFail ?? 0),
      dribbleSuccess: Number(row.dribbleSuccess ?? 0),
      dribbleFail: Number(row.dribbleFail ?? 0),
      throwSuccess: Number(row.throwSuccess ?? 0),
      throwFail: Number(row.throwFail ?? 0),
      shotsOnTarget: Number(row.shotsOnTarget ?? 0),
      shotsOffTarget: Number(row.shotsOffTarget ?? 0),
      aerialDuelSuccess: Number(row.aerialDuelSuccess ?? 0),
      aerialDuelFail: Number(row.aerialDuelFail ?? 0),
      defensiveDuelSuccess: Number(row.defensiveDuelSuccess ?? 0),
      defensiveDuelFail: Number(row.defensiveDuelFail ?? 0),
      goals: Number(row.goals ?? 0),
      assists: Number(row.assists ?? 0),
      foulsSuffered: Number(row.foulsSuffered ?? 0),
      foulsCommitted: Number(row.foulsCommitted ?? 0),
      recoveries: Number(row.recoveries ?? 0),
      interceptions: Number(row.interceptions ?? 0),
      offsides: Number(row.offsides ?? 0),
      possessionLosses: Number(row.possessionLosses ?? 0),
      responsibilityGoal: Number(row.responsibilityGoal ?? 0),
      yellowCards: Number(row.yellowCards ?? 0),
      redCards: Number(row.redCards ?? 0),
    })),
  );

  const compareTotals = sumNumericRows(
    (compareRows as Array<Record<string, unknown>>).map((row) => ({
      minutesPlayed: Number(row.minutesPlayed ?? 0),
      shortPassSuccess: Number(row.shortPassSuccess ?? 0),
      longPassSuccess: Number(row.longPassSuccess ?? 0),
      shotsOnTarget: Number(row.shotsOnTarget ?? 0),
      goals: Number(row.goals ?? 0),
      assists: Number(row.assists ?? 0),
      dribbleSuccess: Number(row.dribbleSuccess ?? 0),
      crossSuccess: Number(row.crossSuccess ?? 0),
      interceptions: Number(row.interceptions ?? 0),
      recoveries: Number(row.recoveries ?? 0),
      aerialDuelSuccess: Number(row.aerialDuelSuccess ?? 0),
      defensiveDuelSuccess: Number(row.defensiveDuelSuccess ?? 0),
    })),
  );

  const percentages = computeOutfieldPercentages(totals);
  const performanceData = sortedRows.map((row) => {
    const shotsOn = Number(row.shotsOnTarget ?? 0);
    const shotsOff = Number(row.shotsOffTarget ?? 0);
    return {
      matchLabel: formatMatchLabel({
        opponentTeamName: String(row.opponentTeamName ?? "-"),
        matchdayNumber: Number(row.matchdayNumber ?? 0),
        homeAway: (row.homeAway as "home" | "away") ?? "home",
      }),
      goals: Number(row.goals ?? 0),
      assists: Number(row.assists ?? 0),
      shotAccuracy: shotsOn + shotsOff ? (shotsOn / (shotsOn + shotsOff)) * 100 : 0,
    };
  });

  const distributionData = buildOffensiveDistribution(totals);
  const radarData = buildRadarProfile(totals);
  const compareRadarData = selectedComparePlayer
    ? buildRadarProfile(totals).map((entry, index) => ({
        metric: entry.metric,
        primary: entry.value,
        secondary: buildRadarProfile(compareTotals)[index]?.value ?? 0,
      }))
    : [];

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Player Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="competitionId">Competition</Label>
              <NativeSelect id="competitionId" name="competitionId" defaultValue={String(selectedCompetitionId ?? "")}>
                {competitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="playerId">Player</Label>
              <NativeSelect id="playerId" name="playerId" defaultValue={String(selectedPlayerId ?? "")}>
                {playerOptions.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({player.teamName})
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparePlayerId">Compare With</Label>
              <NativeSelect
                id="comparePlayerId"
                name="comparePlayerId"
                defaultValue={String(selectedComparePlayerId ?? "")}
              >
                <option value="">None</option>
                {playerOptions.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({player.teamName})
                  </option>
                ))}
              </NativeSelect>
            </div>
            <Button className="md:col-span-3">Apply</Button>
          </form>
        </CardContent>
      </Card>

      <div className="card-grid">
        <StatCard title="Selected Player" value={selectedPlayer?.name ?? "-"} />
        <StatCard title="Pass Accuracy" value={`${formatFixed(percentages.passAccuracy)}%`} />
        <StatCard title="Cross Accuracy" value={`${formatFixed(percentages.crossAccuracy)}%`} />
        <StatCard title="Duel Success Rate" value={`${formatFixed(percentages.duelSuccessRate)}%`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Match Evolution</CardTitle>
          </CardHeader>
          <CardContent>
            <LinePerformanceChart data={performanceData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Offensive Action Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarDistributionChart data={distributionData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Player Profile Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarProfileChart data={radarData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Player Comparison Radar</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedComparePlayer ? (
              <RadarComparisonChart
                data={compareRadarData}
                primaryLabel={selectedPlayer?.name ?? "Player A"}
                secondaryLabel={selectedComparePlayer.name}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Select another player in filters to render comparison radar.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Statistics Per Competition (Players)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Goals</TableHead>
                  <TableHead>Assists</TableHead>
                  <TableHead>Shots On</TableHead>
                  <TableHead>Recoveries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitionPlayerTotals.map((row) => (
                  <TableRow key={row.playerId}>
                    <TableCell>{row.playerName}</TableCell>
                    <TableCell>{row.teamName}</TableCell>
                    <TableCell>{row.goals}</TableCell>
                    <TableCell>{row.assists}</TableCell>
                    <TableCell>{row.shotsOnTarget}</TableCell>
                    <TableCell>{row.recoveries}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Statistics Per Competition (Teams)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Goals</TableHead>
                  <TableHead>Assists</TableHead>
                  <TableHead>Shots On</TableHead>
                  <TableHead>Recoveries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitionTeamTotals.map((row) => (
                  <TableRow key={row.teamId}>
                    <TableCell>{row.teamName}</TableCell>
                    <TableCell>{row.goals}</TableCell>
                    <TableCell>{row.assists}</TableCell>
                    <TableCell>{row.shotsOnTarget}</TableCell>
                    <TableCell>{row.recoveries}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
