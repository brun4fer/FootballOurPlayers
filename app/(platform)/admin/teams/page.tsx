import {
  assignTeamCompetitionAction,
  createTeamAction,
  deleteTeamAction,
  removeTeamCompetitionAction,
  updateTeamAction,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCompetitions, getTeamCompetitionLinks, getTeams } from "@/lib/data";

export default async function AdminTeamsPage() {
  const [teamList, competitionList, links] = await Promise.all([
    getTeams(),
    getCompetitions(),
    getTeamCompetitionLinks(),
  ]);

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Teams</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createTeamAction} className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input id="name" name="name" required placeholder="SL Benfica" />
              </div>
              <Button className="sm:mt-7">Save</Button>
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
                <NativeSelect id="teamId" name="teamId" defaultValue="" required>
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
                <NativeSelect id="competitionId" name="competitionId" defaultValue="" required>
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
          <CardTitle>Team List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[220px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamList.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>{team.id}</TableCell>
                  <TableCell>
                    <form action={updateTeamAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={team.id} />
                      <Input name="name" defaultValue={team.name} minLength={2} required />
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>
                    <form action={deleteTeamAction}>
                      <input type="hidden" name="id" value={team.id} />
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
          <CardTitle>Competition Assignments</CardTitle>
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
