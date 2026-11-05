import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { gpsMetricDefinitions, type GpsMetricKey } from "@/lib/gps-metrics";

type Option = { id: number; name: string };
type MatchOption = { id: number; matchdayNumber: number; opponentTeamName: string };

export function GpsFilters({
  competitions,
  players = [],
  matches,
  competitionId,
  playerIds = [],
  matchIds = [],
  metricKey,
  showPlayers,
}: {
  competitions: Option[];
  players?: Option[];
  matches: MatchOption[];
  competitionId?: number;
  playerIds?: number[];
  matchIds?: number[];
  metricKey: GpsMetricKey;
  showPlayers: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GPS Filters</CardTitle>
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
            <div className="space-y-2">
              <Label htmlFor="playerIds">Players</Label>
              <select id="playerIds" name="playerIds" multiple defaultValue={playerIds.map(String)} className="h-36 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {players.map((player) => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="matchIds">Matches (optional)</Label>
            <select id="matchIds" name="matchIds" multiple defaultValue={matchIds.map(String)} className="h-36 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {matches.map((match) => (
                <option key={match.id} value={match.id}>Matchday {match.matchdayNumber} x {match.opponentTeamName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric">Chart Metric</Label>
            <NativeSelect id="metric" name="metric" defaultValue={metricKey}>
              {gpsMetricDefinitions.map((metric) => (
                <option key={metric.key} value={metric.key}>{metric.label}</option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex items-end gap-2 lg:col-span-4">
            <Button>Apply Filters</Button>
            <Button asChild variant="outline"><Link href={showPlayers ? "/gps/players" : "/gps/teams"}>Clear Filters</Link></Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
