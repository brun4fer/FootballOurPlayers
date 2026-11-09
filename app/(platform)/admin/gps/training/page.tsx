import { createTrainingSessionAction, deleteTrainingSessionAction, updateTrainingSessionAction, upsertTrainingGpsStatsAction } from "@/actions/admin";
import Link from "next/link";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { NumericStatFields } from "@/components/admin/numeric-stat-fields";
import { GpsAdminTabs } from "@/components/gps/gps-admin-tabs";
import { GpsTrainingRecordsTable } from "@/components/gps/gps-training-records-table";
import { TrainingParticipantsField } from "@/components/gps/training-participants-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { getAnalyzedTeam, getPlayerOptionsByTeam, getSeasons } from "@/lib/data";
import { editableTrainingGpsMetricDefinitions } from "@/lib/gps-metrics";
import { formatTrainingLabel, getExistingTrainingGpsStats, getTrainingGpsStats, getTrainingParticipantIds, getTrainingParticipantOptions, getTrainingSessions } from "@/lib/training-gps-data";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
function optionalId(value: string | string[] | undefined) { const parsed = !value || Array.isArray(value) ? NaN : Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined; }

export default async function AdminGpsTrainingPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const seasons = await getSeasons();
  const requestedSeasonId = optionalId(params.seasonId);
  const seasonId = seasons.some((season) => season.id === requestedSeasonId) ? requestedSeasonId : seasons[0]?.id;
  const [team, sessions] = await Promise.all([getAnalyzedTeam(), getTrainingSessions(seasonId)]);
  const players = team ? await getPlayerOptionsByTeam(team.id) : [];
  const requestedTrainingId = optionalId(params.trainingSessionId);
  const trainingSessionId = sessions.some((session) => session.id === requestedTrainingId) ? requestedTrainingId : undefined;
  const selectedTraining = sessions.find((session) => session.id === trainingSessionId);
  const participants = await getTrainingParticipantOptions(trainingSessionId);
  const requestedPlayerId = optionalId(params.playerId);
  const playerId = participants.some((player) => player.id === requestedPlayerId) ? requestedPlayerId : undefined;
  const [existingStats, selectedParticipantIds, records] = await Promise.all([
    getExistingTrainingGpsStats(playerId, trainingSessionId),
    getTrainingParticipantIds(trainingSessionId),
    getTrainingGpsStats({ seasonId }),
  ]);

  return <section className="space-y-6">
    <div><h1 className="font-[var(--font-heading)] text-2xl font-semibold">Enter GPS Statistics</h1><p className="mt-2 text-sm text-muted-foreground">Create training units with the registered squad and enter GPS data only for the participating players.</p></div>
    <GpsAdminTabs active="training" />

    <Card><CardHeader><CardTitle>Create Training</CardTitle><CardDescription>All players are selected by default. Remove anyone who did not participate.</CardDescription></CardHeader><CardContent>
      <form action={createTrainingSessionAction} className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2"><Label htmlFor="seasonId-create">Season</Label><NativeSelect id="seasonId-create" name="seasonId" defaultValue={String(seasonId ?? "")} required><option value="">Select season</option>{seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</NativeSelect></div>
          <div className="space-y-2"><Label htmlFor="trainingDate">Date</Label><Input id="trainingDate" name="trainingDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required/></div>
          <div className="space-y-2"><Label htmlFor="microcycleNumber">Microcycle</Label><Input id="microcycleNumber" name="microcycleNumber" type="number" min={1} step={1} required/></div>
          <div className="space-y-2"><Label htmlFor="trainingUnitNumber">Training Unit</Label><Input id="trainingUnitNumber" name="trainingUnitNumber" type="number" min={1} step={1} required/></div>
          <div className="space-y-2"><Label htmlFor="durationMinutes">Training Duration (min)</Label><Input id="durationMinutes" name="durationMinutes" type="number" min={1} step={1} required/></div>
        </div>
        <TrainingParticipantsField players={players}/>
        <Button disabled={!seasonId || !team || !players.length}>Create Training</Button>
      </form>
    </CardContent></Card>

    {selectedTraining ? <Card><CardHeader><CardTitle>Edit Training</CardTitle><CardDescription>Update the training details and participants. A player with GPS data cannot be removed until that individual GPS record is deleted.</CardDescription></CardHeader><CardContent className="space-y-5">
      <form action={updateTrainingSessionAction} className="space-y-5">
        <input type="hidden" name="id" value={selectedTraining.id}/>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2"><Label htmlFor="seasonId-edit">Season</Label><NativeSelect id="seasonId-edit" name="seasonId" defaultValue={String(selectedTraining.seasonId)} required>{seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</NativeSelect></div>
          <div className="space-y-2"><Label htmlFor="trainingDate-edit">Date</Label><Input id="trainingDate-edit" name="trainingDate" type="date" defaultValue={selectedTraining.trainingDate} required/></div>
          <div className="space-y-2"><Label htmlFor="microcycleNumber-edit">Microcycle</Label><Input id="microcycleNumber-edit" name="microcycleNumber" type="number" min={1} step={1} defaultValue={selectedTraining.microcycleNumber} required/></div>
          <div className="space-y-2"><Label htmlFor="trainingUnitNumber-edit">Training Unit</Label><Input id="trainingUnitNumber-edit" name="trainingUnitNumber" type="number" min={1} step={1} defaultValue={selectedTraining.trainingUnitNumber} required/></div>
          <div className="space-y-2"><Label htmlFor="durationMinutes-edit">Training Duration (min)</Label><Input id="durationMinutes-edit" name="durationMinutes" type="number" min={1} step={1} defaultValue={selectedTraining.durationMinutes} required/></div>
        </div>
        <TrainingParticipantsField key={selectedTraining.id} players={players} defaultSelectedIds={selectedParticipantIds}/>
        <Button>Save Training Changes</Button>
      </form>
      <div className="border-t border-border pt-4">
        <form action={deleteTrainingSessionAction}>
          <input type="hidden" name="id" value={selectedTraining.id}/>
          <ConfirmSubmitButton variant="danger" confirmation={`Delete the complete training ${formatTrainingLabel(selectedTraining)}? This will also delete all GPS records associated with it. Players will be kept.`}>Delete complete training</ConfirmSubmitButton>
        </form>
      </div>
    </CardContent></Card> : null}

    <Card><CardHeader><CardTitle>Select Training and Player</CardTitle><CardDescription>Training units are always shown with their date, microcycle and unit number.</CardDescription></CardHeader><CardContent>
      <form className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-2"><Label htmlFor="seasonId">Season</Label><NativeSelect id="seasonId" name="seasonId" defaultValue={String(seasonId ?? "")}><option value="">Select season</option>{seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</NativeSelect></div>
        <div className="space-y-2"><Label htmlFor="trainingSessionId">Training</Label><NativeSelect id="trainingSessionId" name="trainingSessionId" defaultValue={String(trainingSessionId ?? "")}><option value="">Select training</option>{sessions.map((session) => <option key={session.id} value={session.id}>{formatTrainingLabel(session)} · {session.durationMinutes} min</option>)}</NativeSelect></div>
        <div className="space-y-2"><Label htmlFor="playerId">Player</Label><NativeSelect id="playerId" name="playerId" defaultValue={String(playerId ?? "")} disabled={!trainingSessionId}><option value="">Select player</option>{participants.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</NativeSelect></div>
        <Button className="lg:col-span-3">Load Selection</Button>
      </form>
    </CardContent></Card>

    {trainingSessionId && playerId ? <Card><CardHeader><CardTitle>Player GPS Training Values</CardTitle><CardDescription>The training duration is stored once in the session. Enter the remaining GPS metrics for this player.</CardDescription></CardHeader><CardContent><form action={upsertTrainingGpsStatsAction} className="space-y-4"><input type="hidden" name="trainingSessionId" value={trainingSessionId}/><input type="hidden" name="playerId" value={playerId}/><NumericStatFields fields={editableTrainingGpsMetricDefinitions} values={existingStats ?? undefined}/><Button>Save GPS Training Statistics</Button></form></CardContent></Card> : null}

    <Card><CardHeader><CardTitle>Manage GPS Training Records</CardTitle><CardDescription>Edit a record or delete only its GPS statistics. Players and training sessions are kept.</CardDescription></CardHeader><CardContent><GpsTrainingRecordsTable records={records} seasonId={seasonId}/></CardContent></Card>

    {sessions.length ? <Card><CardHeader><CardTitle>Training Units</CardTitle><CardDescription>{sessions.length} training unit{sessions.length === 1 ? "" : "s"} registered for the selected season.</CardDescription></CardHeader><CardContent><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{sessions.map((session) => <Link key={session.id} href={`/admin/gps/training?seasonId=${session.seasonId}&trainingSessionId=${session.id}`} className="rounded-lg border border-border bg-background/30 p-3 transition hover:border-cyan-400/50 hover:bg-cyan-400/5"><p className="font-medium">{formatTrainingLabel(session)}</p><p className="mt-1 text-xs text-muted-foreground">{session.durationMinutes} min · {session.teamName}</p></Link>)}</div></CardContent></Card> : null}
  </section>;
}
