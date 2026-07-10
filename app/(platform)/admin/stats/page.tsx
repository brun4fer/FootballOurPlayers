import Link from "next/link";

import { upsertGoalkeeperStatsAction, upsertPlayerStatsAction } from "@/actions/admin";
import { NumericStatFields } from "@/components/admin/numeric-stat-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  formatMatchLabel,
  getAnalyzedTeamPlayerOptionsByCompetition,
  getCalculatedTeamTotalsByMatch,
  getCompetitionOptions,
  getExistingGoalkeeperStats,
  getExistingPlayerMatchStats,
  getMatchOptionsByCompetition,
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

const emptyTeamTotals: Record<string, number> = {
  minutesPlayed: 0,
  shortPassSuccess: 0,
  shortPassFail: 0,
  longPassSuccess: 0,
  longPassFail: 0,
  crossSuccess: 0,
  crossFail: 0,
  dribbleSuccess: 0,
  dribbleFail: 0,
  throwSuccess: 0,
  throwFail: 0,
  shotsOnTarget: 0,
  shotsOffTarget: 0,
  aerialDuelSuccess: 0,
  aerialDuelFail: 0,
  defensiveDuelSuccess: 0,
  defensiveDuelFail: 0,
  goals: 0,
  assists: 0,
  foulsSuffered: 0,
  foulsCommitted: 0,
  recoveries: 0,
  interceptions: 0,
  offsides: 0,
  possessionLosses: 0,
  responsibilityGoal: 0,
  yellowCards: 0,
  redCards: 0,
};

export default async function AdminStatsPage({ searchParams }: StatsPageProps) {
  const params = (await searchParams) ?? {};
  const competitionOptions = await getCompetitionOptions();
  const selectedCompetitionId =
    parseOptionalId(params.competitionId) ?? competitionOptions[0]?.id;
  const requestedMatchId = parseOptionalId(params.matchId);
  const requestedPlayerId = parseOptionalId(params.playerId);

  const [matchOptions, playerOptions] = await Promise.all([
    getMatchOptionsByCompetition(selectedCompetitionId),
    getAnalyzedTeamPlayerOptionsByCompetition(selectedCompetitionId),
  ]);

  const selectedMatchId = matchOptions.some((match) => match.id === requestedMatchId)
    ? requestedMatchId
    : undefined;
  const selectedPlayerId = playerOptions.some((player) => player.id === requestedPlayerId)
    ? requestedPlayerId
    : undefined;
  const selectedPlayer = playerOptions.find((player) => player.id === selectedPlayerId);

  const [existingPlayerStats, existingGoalkeeperStats, calculatedTeamTotals] = await Promise.all([
    getExistingPlayerMatchStats(selectedPlayerId, selectedMatchId),
    getExistingGoalkeeperStats(selectedPlayerId, selectedMatchId),
    getCalculatedTeamTotalsByMatch(selectedMatchId),
  ]);

  const totalsByKey: Record<string, number> = {
    ...emptyTeamTotals,
    ...(calculatedTeamTotals ?? {}),
  };

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Enter Statistics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Administration Workflow</CardTitle>
          <CardDescription>
            1. Select competition 2. Select jogo 3. Select player 4. Enter totais
          </CardDescription>
          <p className="text-xs text-muted-foreground">
            The analysed team is always <strong>Feirense</strong>.
          </p>
          <p className="text-xs text-muted-foreground">
            After changing the competition, click <strong>Load Selection</strong> to update
            matches and players.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="competitionId">Competition</Label>
              <NativeSelect
                id="competitionId"
                name="competitionId"
                defaultValue={String(selectedCompetitionId ?? "")}
              >
                <option value="">Select competition</option>
                {competitionOptions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="matchId">Jogo</Label>
              <NativeSelect id="matchId" name="matchId" defaultValue={String(selectedMatchId ?? "")}>
                <option value="">Select jogo</option>
                {matchOptions.length === 0 ? (
                  <option value="" disabled>
                    No matches available
                  </option>
                ) : null}
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
              <Label htmlFor="playerId">Player</Label>
              <NativeSelect id="playerId" name="playerId" defaultValue={String(selectedPlayerId ?? "")}>
                <option value="">Select player</option>
                {playerOptions.length === 0 ? (
                  <option value="" disabled>
                    No Feirense players available
                  </option>
                ) : null}
                {playerOptions.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <Button className="sm:col-span-2 xl:col-span-3">Load Selection</Button>
          </form>
        </CardContent>
      </Card>

      {selectedMatchId ? (
        <Card>
          <CardHeader>
            <CardTitle>Team Totals per Match</CardTitle>
            <CardDescription>
              Feirense totals calculated automatically from the selected match statistics for
              players.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {outfieldStatFields.map((field) => (
                <div key={field.key} className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-200">{totalsByKey[field.key] ?? 0}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {selectedMatchId && selectedPlayerId ? (
        <Card>
          <CardHeader>
            <CardTitle>Player Totals per Match</CardTitle>
            <CardDescription>
              Save the outfield player totals for the selected match.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/report/player/${selectedPlayerId}`}>Open Public Report</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/dashboard/jogadores?competitionId=${selectedCompetitionId ?? ""}&playerId=${selectedPlayerId}`}>
                  Open Player Dashboard
                </Link>
              </Button>
            </div>
            <form action={upsertPlayerStatsAction} className="space-y-4">
              <input type="hidden" name="matchId" value={selectedMatchId} />
              <input type="hidden" name="playerId" value={selectedPlayerId} />
              <NumericStatFields fields={outfieldStatFields} values={existingPlayerStats ?? undefined} />
              <Button>Save Player Statistics</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {selectedMatchId && selectedPlayerId && selectedPlayer?.isGoalkeeper ? (
        <Card>
          <CardHeader>
            <CardTitle>Goalkeeper Totals per Match</CardTitle>
            <CardDescription>
              Goalkeeper metrics are only visible for players marked as
              guarda-redes.
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
              <Button>Save Goalkeeper Statistics</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
