import {
  assignTeamCompetitionAction,
  createTeamAction,
  deleteTeamAction,
  removeTeamCompetitionAction,
  updateTeamAction,
} from "@/actions/admin";
import { ImageUrlInput } from "@/components/forms/image-url-input";
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
            <form action={createTeamAction} className="grid gap-3">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input id="name" name="name" required placeholder="CD Feirense" />
              </div>
              <ImageUrlInput
                id="emblemUrl"
                name="emblemUrl"
                label="Team Crest URL"
              />
              <Button>Save</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Link Team to Competition</CardTitle>
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
              <Button className="w-full">Save Association</Button>
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
                <TableHead>Crest</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[260px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamList.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>{team.id}</TableCell>
                  <TableCell>
                    {team.emblemUrl ? (
                      <img
                        src={team.emblemUrl}
                        alt={team.name}
                        className="h-10 w-10 rounded-md border border-border/60 object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">No crest</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {team.isFixedHomeTeam ? (
                      <p className="mb-2 text-xs font-medium text-cyan-300">Fixed home team</p>
                    ) : null}
                    <form action={updateTeamAction} className="grid gap-2">
                      <input type="hidden" name="id" value={team.id} />
                      <Input name="name" defaultValue={team.name} minLength={2} required disabled={team.isFixedHomeTeam} />
                      {team.isFixedHomeTeam ? <input type="hidden" name="name" value="CD Feirense" /> : null}
                      <ImageUrlInput
                        id={`emblemUrl-${team.id}`}
                        name="emblemUrl"
                        label="Team Crest URL"
                        defaultImageUrl={team.emblemUrl}
                      />
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>
                    {team.isFixedHomeTeam ? (
                      <span className="text-xs text-muted-foreground">Protected — cannot be deleted</span>
                    ) : <form action={deleteTeamAction}>
                      <input type="hidden" name="id" value={team.id} />
                      <Button variant="danger" size="sm">
                        Delete
                      </Button>
                    </form>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competition Links</CardTitle>
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
    </section>
  );
}
