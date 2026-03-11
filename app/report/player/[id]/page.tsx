import Image from "next/image";
import { notFound } from "next/navigation";

import { BarDistributionChart } from "@/components/charts/bar-distribution-chart";
import { LinePerformanceChart } from "@/components/charts/line-performance-chart";
import { RadarProfileChart } from "@/components/charts/radar-profile-chart";
import { StatCard } from "@/components/stats/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  formatMatchLabel,
  getPlayerCompetitionOptions,
  getPlayerForReport,
  getReportGoalkeeperStats,
  getReportOutfieldStats,
} from "@/lib/data";
import {
  buildOffensiveDistribution,
  buildRadarProfile,
  computeOutfieldPercentages,
  computePer90Values,
  formatFixed,
  mergeMatchRows,
  sumNumericRows,
} from "@/lib/stats";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseOptionalId(value: string | string[] | undefined) {
  if (!value || Array.isArray(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

export default async function PlayerReportPage({ params, searchParams }: PageProps) {
  const routeParams = await params;
  const playerId = Number(routeParams.id);

  if (!Number.isFinite(playerId) || playerId <= 0) {
    notFound();
  }

  const player = await getPlayerForReport(playerId);
  if (!player) {
    notFound();
  }

  const query = (await searchParams) ?? {};
  const competitionOptions = await getPlayerCompetitionOptions(playerId);
  const selectedCompetitionId =
    parseOptionalId(query.competitionId) ?? competitionOptions[0]?.id ?? undefined;

  const outfieldRows = await getReportOutfieldStats(playerId, selectedCompetitionId);
  const goalkeeperRows = player.isGoalkeeper
    ? await getReportGoalkeeperStats(playerId, selectedCompetitionId)
    : [];

  const sortedOutfieldRows = mergeMatchRows(outfieldRows as Array<Record<string, unknown>>);
  const outfieldTotals = sumNumericRows(
    sortedOutfieldRows.map((row) => ({
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
  const goalkeeperTotals = sumNumericRows(
    goalkeeperRows.map((row) => ({
      minutesPlayed: Number(row.minutesPlayed ?? 0),
      saves: Number(row.saves ?? 0),
      incompleteSaves: Number(row.incompleteSaves ?? 0),
      shotsConceded: Number(row.shotsConceded ?? 0),
      goalsConceded: Number(row.goalsConceded ?? 0),
    })),
  );

  const percentages = computeOutfieldPercentages(outfieldTotals);
  const per90 = computePer90Values(outfieldTotals);

  const lineData = sortedOutfieldRows.map((row) => {
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

  const distributionData = buildOffensiveDistribution(outfieldTotals);
  const radarData = buildRadarProfile(outfieldTotals);

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-border/70">
        <div className="grid gap-4 p-4 md:grid-cols-[160px_1fr] md:p-6">
          <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
            {player.photo ? (
              <Image src={player.photo} alt={player.name} fill sizes="160px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No photo
              </div>
            )}
          </div>
          <div className="space-y-3">
            <h1 className="font-[var(--font-heading)] text-3xl font-semibold">{player.name}</h1>
            <p className="text-sm text-muted-foreground">
              {player.teamName} | {player.nationality ?? "N/A"} | {player.position1 ?? "N/A"}
            </p>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <p>Height: {player.height ?? "-"} cm</p>
              <p>Weight: {player.weight ?? "-"} kg</p>
              <p>Agent: {player.agent ?? "-"}</p>
              <p>Role: {player.isGoalkeeper ? "Goalkeeper" : "Outfield"}</p>
            </div>
            <form className="grid max-w-xl gap-2 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="competitionId">Competition</Label>
                <NativeSelect
                  id="competitionId"
                  name="competitionId"
                  defaultValue={String(selectedCompetitionId ?? "")}
                >
                  {competitionOptions.map((competition) => (
                    <option key={competition.id} value={competition.id}>
                      {competition.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <button className="mt-7 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
                Apply
              </button>
            </form>
          </div>
        </div>
      </Card>

      <div className="card-grid">
        <StatCard title="Goals" value={outfieldTotals.goals ?? 0} />
        <StatCard title="Assists" value={outfieldTotals.assists ?? 0} />
        <StatCard title="Pass Accuracy" value={`${formatFixed(percentages.passAccuracy)}%`} />
        <StatCard title="Shot Accuracy" value={`${formatFixed(percentages.shotAccuracy)}%`} />
      </div>

      <div className="card-grid">
        <StatCard title="Goals / 90" value={formatFixed(per90.goals ?? 0)} />
        <StatCard title="Assists / 90" value={formatFixed(per90.assists ?? 0)} />
        <StatCard title="Interceptions / 90" value={formatFixed(per90.interceptions ?? 0)} />
        <StatCard title="Recoveries / 90" value={formatFixed(per90.recoveries ?? 0)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Evolution</CardTitle>
          </CardHeader>
          <CardContent>
            <LinePerformanceChart data={lineData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Offensive Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarDistributionChart data={distributionData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player Radar Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <RadarProfileChart data={radarData} color="#00e7ff" name={player.name} />
        </CardContent>
      </Card>

      {player.isGoalkeeper ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="GK Saves" value={goalkeeperTotals.saves ?? 0} />
          <StatCard title="GK Incomplete Saves" value={goalkeeperTotals.incompleteSaves ?? 0} />
          <StatCard title="GK Shots Conceded" value={goalkeeperTotals.shotsConceded ?? 0} />
          <StatCard title="GK Goals Conceded" value={goalkeeperTotals.goalsConceded ?? 0} />
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Match Totals Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Minutes</TableHead>
                <TableHead>Goals</TableHead>
                <TableHead>Assists</TableHead>
                <TableHead>Shots On</TableHead>
                <TableHead>Interceptions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOutfieldRows.map((row) => (
                <TableRow key={`${row.matchdayNumber}-${row.opponentTeamName}-${row.date}`}>
                  <TableCell>
                    {formatMatchLabel({
                      opponentTeamName: String(row.opponentTeamName ?? "-"),
                      matchdayNumber: Number(row.matchdayNumber ?? 0),
                      homeAway: (row.homeAway as "home" | "away") ?? "home",
                    })}
                  </TableCell>
                  <TableCell>{Number(row.minutesPlayed ?? 0)}</TableCell>
                  <TableCell>{Number(row.goals ?? 0)}</TableCell>
                  <TableCell>{Number(row.assists ?? 0)}</TableCell>
                  <TableCell>{Number(row.shotsOnTarget ?? 0)}</TableCell>
                  <TableCell>{Number(row.interceptions ?? 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
