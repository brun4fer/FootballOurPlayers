import {
  assignTeamCompetitionAction,
  createCompetitionAction,
  deleteCompetitionAction,
  removeTeamCompetitionAction,
  updateCompetitionAction,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCompetitions, getSeasons, getTeamCompetitionLinks, getTeams } from "@/lib/data";

export default async function AdminCompetitionsPage() {
  const [seasons, competitionList, teamList, links] = await Promise.all([
    getSeasons(),
    getCompetitions(),
    getTeams(),
    getTeamCompetitionLinks(),
  ]);

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Competitions</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCompetitionAction} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Competition Name</Label>
                <Input id="name" name="name" required placeholder="Primeira Liga" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonId">Season</Label>
                <NativeSelect id="seasonId" name="seasonId" required defaultValue="">
                  <option value="" disabled>
                    Select season
                  </option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {season.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <Button className="w-full">Save Competition</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Team To Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={assignTeamCompetitionAction} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="teamId">Team</Label>
                <NativeSelect id="teamId" name="teamId" required defaultValue="">
                  <option value="" disabled>
                    Select team
                  </option>
                  {teamList.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </NativeSelect>
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
              <Button className="w-full">Assign</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competition List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Season</TableHead>
                <TableHead className="w-[220px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitionList.map((competition) => (
                <TableRow key={competition.id}>
                  <TableCell>{competition.id}</TableCell>
                  <TableCell>
                    <form action={updateCompetitionAction} className="space-y-2">
                      <input type="hidden" name="id" value={competition.id} />
                      <Input name="name" defaultValue={competition.name} minLength={2} required />
                      <NativeSelect name="seasonId" defaultValue={String(competition.seasonId)} required>
                        {seasons.map((season) => (
                          <option key={season.id} value={season.id}>
                            {season.name}
                          </option>
                        ))}
                      </NativeSelect>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>{competition.seasonName}</TableCell>
                  <TableCell>
                    <form action={deleteCompetitionAction}>
                      <input type="hidden" name="id" value={competition.id} />
                      <Button variant="danger" size="sm">
                        Delete
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Competition Links</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>Season</TableHead>
                <TableHead className="w-[110px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.teamName}</TableCell>
                  <TableCell>{link.competitionName}</TableCell>
                  <TableCell>{link.seasonName}</TableCell>
                  <TableCell>
                    <form action={removeTeamCompetitionAction}>
                      <input type="hidden" name="id" value={link.id} />
                      <Button variant="danger" size="sm">
                        Remove
                      </Button>
                    </form>
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
