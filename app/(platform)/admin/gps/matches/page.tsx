import { upsertGpsStatsAction } from "@/actions/admin";
import { NumericStatFields } from "@/components/admin/numeric-stat-fields";
import { GpsAdminTabs } from "@/components/gps/gps-admin-tabs";
import { GpsMatchRecordsTable } from "@/components/gps/gps-match-records-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { formatMatchLabel, getAnalyzedTeam, getAnalyzedTeamPlayerOptionsByCompetition, getCompetitionOptions, getMatchOptionsByCompetition } from "@/lib/data";
import { getExistingGpsStats, getGpsStats } from "@/lib/gps-data";
import { gpsMetricDefinitions } from "@/lib/gps-metrics";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
function optionalId(value: string | string[] | undefined) { const parsed = !value || Array.isArray(value) ? NaN : Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined; }

export default async function AdminGpsMatchesPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const competitions = await getCompetitionOptions();
  const competitionId = optionalId(params.competitionId) ?? competitions[0]?.id;
  const [matches, players, analyzedTeam] = await Promise.all([getMatchOptionsByCompetition(competitionId), getAnalyzedTeamPlayerOptionsByCompetition(competitionId), getAnalyzedTeam()]);
  const requestedMatchId = optionalId(params.matchId);
  const requestedPlayerId = optionalId(params.playerId);
  const matchId = matches.some((match) => match.id === requestedMatchId) ? requestedMatchId : undefined;
  const playerId = players.some((player) => player.id === requestedPlayerId) ? requestedPlayerId : undefined;
  const [existingStats, records] = await Promise.all([
    getExistingGpsStats(playerId, matchId),
    getGpsStats({ competitionId }),
  ]);

  return <section className="space-y-6">
    <div><h1 className="font-[var(--font-heading)] text-2xl font-semibold">Enter GPS Statistics</h1><p className="mt-2 text-sm text-muted-foreground">Match and training GPS share the same players and metrics while keeping their records separate.</p></div>
    <GpsAdminTabs active="matches" />
    <Card><CardHeader><CardTitle>Select Match and Player</CardTitle><CardDescription>Choose a competition first, then load the match and player.</CardDescription></CardHeader><CardContent>
      <form className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-2"><Label htmlFor="competitionId">Competition</Label><NativeSelect id="competitionId" name="competitionId" defaultValue={String(competitionId ?? "")}><option value="">Select competition</option>{competitions.map((competition) => <option key={competition.id} value={competition.id}>{competition.name}</option>)}</NativeSelect></div>
        <div className="space-y-2"><Label htmlFor="matchId">Match</Label><NativeSelect id="matchId" name="matchId" defaultValue={String(matchId ?? "")}><option value="">Select match</option>{matches.map((match) => <option key={match.id} value={match.id}>{formatMatchLabel(match, analyzedTeam?.name ?? "Home Team")}</option>)}</NativeSelect></div>
        <div className="space-y-2"><Label htmlFor="playerId">Player</Label><NativeSelect id="playerId" name="playerId" defaultValue={String(playerId ?? "")}><option value="">Select player</option>{players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</NativeSelect></div>
        <Button className="lg:col-span-3">Load Selection</Button>
      </form>
    </CardContent></Card>
    {matchId && playerId ? <Card><CardHeader><CardTitle>Player GPS Match Values</CardTitle><CardDescription>Distances and speed accept decimals. Counts and minutes use whole numbers.</CardDescription></CardHeader><CardContent><form action={upsertGpsStatsAction} className="space-y-4"><input type="hidden" name="matchId" value={matchId}/><input type="hidden" name="playerId" value={playerId}/><NumericStatFields fields={gpsMetricDefinitions} values={existingStats ?? undefined}/><Button>Save GPS Match Statistics</Button></form></CardContent></Card> : null}
    <Card><CardHeader><CardTitle>Manage GPS Match Records</CardTitle><CardDescription>Edit a record or delete only its GPS statistics. Players and matches are never deleted here.</CardDescription></CardHeader><CardContent><GpsMatchRecordsTable records={records} competitionId={competitionId}/></CardContent></Card>
  </section>;
}
