import Link from "next/link";

import {
  upsertGoalkeeperStatsAction,
  upsertPlayerStatsAction,
  upsertTeamStatsAction,
} from "@/actions/admin";
import { NumericStatFields } from "@/components/admin/numeric-stat-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  formatMatchLabel,
  getCompetitionOptions,
  getExistingGoalkeeperStats,
  getExistingPlayerMatchStats,
  getExistingTeamMatchStats,
  getMatchOptionsByCompetition,
  getPlayerOptionsByTeam,
  getTeamOptionsByCompetition,
} from "@/lib/data";
import { goalkeeperStatFields, outfieldStatFields } from "@/lib/stat-fields";

type StatsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseOptionalId(value: string | string[] | undefined) {
  if (!value || Array.isArray(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

export default async function AdminStatsPage({ searchParams }: StatsPageProps) {
  const params = (await searchParams) ?? {};
  const competitionOptions = await getCompetitionOptions();
  const selectedCompetitionId =
    parseOptionalId(params.competitionId) ?? competitionOptions[0]?.id;
  const selectedMatchId = parseOptionalId(params.matchId);
  const selectedTeamId = parseOptionalId(params.teamId);
  const selectedPlayerId = parseOptionalId(params.playerId);

  const [matchOptions, teamOptions] = await Promise.all([
    getMatchOptionsByCompetition(selectedCompetitionId),
    getTeamOptionsByCompetition(selectedCompetitionId),
  ]);

  const playerOptions = await getPlayerOptionsByTeam(selectedTeamId);
  const selectedPlayer = playerOptions.find((player) => player.id === selectedPlayerId);

  const [existingPlayerStats, existingGoalkeeperStats, existingTeamStats] = await Promise.all([
    getExistingPlayerMatchStats(selectedPlayerId, selectedMatchId),
    getExistingGoalkeeperStats(selectedPlayerId, selectedMatchId),
    getExistingTeamMatchStats(selectedTeamId, selectedMatchId),
  ]);

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Statistics Entry</h1>

      <Card>
        <CardHeader>
          <CardTitle>Admin Workflow</CardTitle>
          <CardDescription>
            1. Select competition 2. Select match 3. Select team 4. Select player 5. Insert
            totals
          </CardDescription>
          <p className="text-xs text-muted-foreground">
            If you change competition, click <strong>Load Selection</strong> to refresh matches.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="competitionId">Competition</Label>
              <NativeSelect id="competitionId" name="competitionId" defaultValue={String(selectedCompetitionId ?? "")}>
                <option value="">Select competition</option>
                {competitionOptions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="matchId">Match</Label>
              <NativeSelect id="matchId" name="matchId" defaultValue={String(selectedMatchId ?? "")}>
                <option value="">Select match</option>
                {matchOptions.map((match) => (
                  <option key={match.id} value={match.id}>
                    {formatMatchLabel({
                      opponentTeamName: match.opponentTeamName,
                      matchdayNumber: match.matchdayNumber,
                      homeAway: match.homeAway,
                    })}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamId">Team</Label>
              <NativeSelect id="teamId" name="teamId" defaultValue={String(selectedTeamId ?? "")}>
                <option value="">Select team</option>
                {teamOptions.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="playerId">Player</Label>
              <NativeSelect id="playerId" name="playerId" defaultValue={String(selectedPlayerId ?? "")}>
                <option value="">Select player</option>
                {playerOptions.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <Button className="sm:col-span-2 xl:col-span-4">Load Selection</Button>
          </form>
        </CardContent>
      </Card>

      {selectedMatchId && selectedTeamId ? (
        <Card>
          <CardHeader>
            <CardTitle>Team Match Totals</CardTitle>
            <CardDescription>
              Save aggregated team totals for Feirense in the selected match.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={upsertTeamStatsAction} className="space-y-4">
              <input type="hidden" name="matchId" value={selectedMatchId} />
              <input type="hidden" name="teamId" value={selectedTeamId} />
              <NumericStatFields fields={outfieldStatFields} values={existingTeamStats ?? undefined} />
              <Button>Save Team Stats</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {selectedMatchId && selectedPlayerId ? (
        <Card>
          <CardHeader>
            <CardTitle>Player Match Totals</CardTitle>
            <CardDescription>
              Save outfield totals for the selected player and match.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/report/player/${selectedPlayerId}`}>Open Public Report</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/dashboard?competitionId=${selectedCompetitionId ?? ""}&playerId=${selectedPlayerId}`}>
                  Open Dashboard For Player
                </Link>
              </Button>
            </div>
            <form action={upsertPlayerStatsAction} className="space-y-4">
              <input type="hidden" name="matchId" value={selectedMatchId} />
              <input type="hidden" name="playerId" value={selectedPlayerId} />
              <NumericStatFields fields={outfieldStatFields} values={existingPlayerStats ?? undefined} />
              <Button>Save Player Stats</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {selectedMatchId && selectedPlayerId && selectedPlayer?.isGoalkeeper ? (
        <Card>
          <CardHeader>
            <CardTitle>Goalkeeper Match Totals</CardTitle>
            <CardDescription>
              Goalkeeper metrics are visible only for players marked as goalkeeper.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={upsertGoalkeeperStatsAction} className="space-y-4">
              <input type="hidden" name="matchId" value={selectedMatchId} />
              <input type="hidden" name="playerId" value={selectedPlayerId} />
              <NumericStatFields
                fields={goalkeeperStatFields}
                values={existingGoalkeeperStats ?? undefined}
              />
              <Button>Save Goalkeeper Stats</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
