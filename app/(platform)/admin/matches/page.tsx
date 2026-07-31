import { createMatchAction, deleteMatchAction, updateMatchAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMatchLabel, getAnalyzedTeam, getAnalyzedTeamIds, getCompetitions, getMatches, getTeams } from "@/lib/data";

export default async function AdminMatchesPage() {
  const [competitionList, matchList, teamList, analyzedTeamIds, analyzedTeam] = await Promise.all([
    getCompetitions(),
    getMatches(),
    getTeams(),
    getAnalyzedTeamIds(),
    getAnalyzedTeam(),
  ]);
  const homeTeamName = analyzedTeam?.name ?? "Home Team";
  const analyzedTeamIdSet = new Set(analyzedTeamIds);
  const opponentOptions = teamList.filter((team) => !analyzedTeamIdSet.has(team.id));

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Matches</h1>

        <Card>
          <CardHeader>
          <CardTitle>Create Match</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createMatchAction} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label>Home Team</Label>
                <Input value={homeTeamName} disabled />
              </div>
              <div className="space-y-2">
              <Label htmlFor="matchdayNumber">Matchday Number</Label>
              <Input id="matchdayNumber" name="matchdayNumber" type="number" min={1} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitionId">Competition</Label>
              <NativeSelect id="competitionId" name="competitionId" required defaultValue="">
                <option value="" disabled>
                  Select competition
                </option>
                {competitionList.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name} - {competition.seasonName}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="opponentTeamId">Opponent</Label>
              <NativeSelect id="opponentTeamId" name="opponentTeamId" required defaultValue="">
                <option value="" disabled>
                  Select opponent
                </option>
                {opponentOptions.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <Button className="sm:col-span-2 xl:col-span-4">Save Match</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>Season</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[320px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchList.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>{match.id}</TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {formatMatchLabel({
                        opponentTeamName: match.opponentTeamName,
                        matchdayNumber: match.matchdayNumber,
                        homeAway: match.homeAway,
                      }, homeTeamName)}
                    </p>
                  </TableCell>
                  <TableCell>{match.competitionName}</TableCell>
                  <TableCell>{match.seasonName}</TableCell>
                  <TableCell>{match.date}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <form action={updateMatchAction} className="grid gap-2 sm:grid-cols-2">
                        <input type="hidden" name="id" value={match.id} />
                        <Input
                          name="matchdayNumber"
                          type="number"
                          min={1}
                          defaultValue={match.matchdayNumber}
                          required
                        />
                        <NativeSelect name="competitionId" defaultValue={String(match.competitionId)} required>
                          {competitionList.map((competition) => (
                            <option key={competition.id} value={competition.id}>
                              {competition.name}
                            </option>
                          ))}
                        </NativeSelect>
                        <NativeSelect name="opponentTeamId" defaultValue={String(match.opponentTeamId)} required>
                        {opponentOptions.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                          ))}
                        </NativeSelect>
                        <Input value={`${homeTeamName} (Home)`} disabled />
                        <Input name="date" type="date" defaultValue={match.date} required />
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </form>
                      <form action={deleteMatchAction}>
                        <input type="hidden" name="id" value={match.id} />
                        <Button variant="danger" size="sm">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
