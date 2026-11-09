import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { gpsMetricDefinitions, type GpsMetricKey } from "@/lib/gps-metrics";
import { MultiSelectFilter } from "@/components/gps/multi-select-filter";

type Option = { id: number; name: string };
type MatchOption = { id: number; matchdayNumber: number; opponentTeamName: string };

export function GpsFilters({
  competitions,
  players = [],
  matches,
  competitionId,
  playerIds = [],
  matchIds = [],
  metricKeys,
  showPlayers,
}: {
  competitions: Option[];
  players?: Option[];
  matches: MatchOption[];
  competitionId?: number;
  playerIds?: number[];
  matchIds?: number[];
  metricKeys: GpsMetricKey[];
  showPlayers: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GPS Match Filters</CardTitle>
        <CardDescription>
          Select a competition, optional matches{showPlayers ? " and one or more players" : ""}, and the metric shown in the charts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="competitionId">Competition</Label>
            <NativeSelect id="competitionId" name="competitionId" defaultValue={String(competitionId ?? "")}>
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>{competition.name}</option>
              ))}
            </NativeSelect>
          </div>

          {showPlayers ? (
            <MultiSelectFilter id="playerIds" name="playerIds" label="Players" options={players.map((player) => ({ value: String(player.id), label: player.name }))} defaultValues={playerIds.map(String)} />
          ) : null}

          <MultiSelectFilter id="matchIds" name="matchIds" label="Matches (optional)" options={matches.map((match) => ({ value: String(match.id), label: `Matchday ${match.matchdayNumber} x ${match.opponentTeamName}` }))} defaultValues={matchIds.map(String)} />

          <MultiSelectFilter id="metrics" name="metrics" label="Chart Metrics" options={gpsMetricDefinitions.map((metric) => ({ value: metric.key, label: metric.label }))} defaultValues={metricKeys} hint="Use Ctrl/Cmd to select several metrics." />

          <div className="flex items-end gap-2 lg:col-span-4">
            <Button>Apply Filters</Button>
            <Button asChild variant="outline"><Link href={showPlayers ? "/gps/players" : "/gps/teams"}>Clear Filters</Link></Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
