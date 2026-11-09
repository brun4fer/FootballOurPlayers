import Link from "next/link";

import { MultiSelectFilter } from "@/components/gps/multi-select-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { trainingGpsMetricDefinitions, type GpsMetricKey } from "@/lib/gps-metrics";
import { formatTrainingLabel, type TrainingSessionOption } from "@/lib/training-gps-data";

type Option = { id: number; name: string };

export function TrainingGpsFilters({
  seasons,
  players = [],
  trainings,
  seasonId,
  playerIds = [],
  trainingIds = [],
  microcycleNumbers = [],
  trainingUnitNumbers = [],
  metricKeys,
  showPlayers,
}: {
  seasons: Option[];
  players?: Option[];
  trainings: TrainingSessionOption[];
  seasonId?: number;
  playerIds?: number[];
  trainingIds?: number[];
  microcycleNumbers?: number[];
  trainingUnitNumbers?: number[];
  metricKeys: GpsMetricKey[];
  showPlayers: boolean;
}) {
  const microcycles = [...new Set(trainings.map((training) => training.microcycleNumber))].sort((a, b) => a - b);
  const units = [...new Set(trainings.map((training) => training.trainingUnitNumber))].sort((a, b) => a - b);
  const clearHref = showPlayers ? "/gps/training/players" : "/gps/training/teams";

  return <Card>
    <CardHeader><CardTitle>GPS Training Filters</CardTitle><CardDescription>Select the season, microcycles, training units and chart metrics{showPlayers ? ", with one or more players" : ""}.</CardDescription></CardHeader>
    <CardContent><form className="grid gap-3 xl:grid-cols-3">
      <div className="space-y-2"><Label htmlFor="seasonId">Season</Label><NativeSelect id="seasonId" name="seasonId" defaultValue={String(seasonId ?? "")}>{seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</NativeSelect></div>
      {showPlayers ? <MultiSelectFilter id="playerIds" name="playerIds" label="Players" options={players.map((player) => ({ value: String(player.id), label: player.name }))} defaultValues={playerIds.map(String)}/> : null}
      <MultiSelectFilter id="microcycleNumbers" name="microcycleNumbers" label="Microcycles (optional)" options={microcycles.map((number) => ({ value: String(number), label: `Microcycle ${number}` }))} defaultValues={microcycleNumbers.map(String)}/>
      <MultiSelectFilter id="trainingUnitNumbers" name="trainingUnitNumbers" label="Training Units (optional)" options={units.map((number) => ({ value: String(number), label: `Training Unit ${number}` }))} defaultValues={trainingUnitNumbers.map(String)}/>
      <MultiSelectFilter id="trainingIds" name="trainingIds" label="Trainings (optional)" options={trainings.map((training) => ({ value: String(training.id), label: `${formatTrainingLabel(training)} · ${training.durationMinutes} min` }))} defaultValues={trainingIds.map(String)}/>
      <MultiSelectFilter id="metrics" name="metrics" label="Chart Metrics" options={trainingGpsMetricDefinitions.map((metric) => ({ value: metric.key, label: metric.label }))} defaultValues={metricKeys}/>
      <div className="flex items-end gap-2 xl:col-span-3"><Button>Apply Filters</Button><Button asChild variant="outline"><Link href={clearHref}>Clear Filters</Link></Button></div>
    </form></CardContent>
  </Card>;
}
