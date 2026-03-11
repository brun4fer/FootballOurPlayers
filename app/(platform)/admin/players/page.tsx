import Link from "next/link";

import { createPlayerAction, deletePlayerAction, updatePlayerAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPlayers, getTeams } from "@/lib/data";

export default async function AdminPlayersPage() {
  const [teamList, playerList] = await Promise.all([getTeams(), getPlayers()]);

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Players</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Player</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPlayerAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
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
              <Label htmlFor="position1">Position 1</Label>
              <Input id="position1" name="position1" placeholder="CM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position2">Position 2</Label>
              <Input id="position2" name="position2" placeholder="CAM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position3">Position 3</Label>
              <Input id="position3" name="position3" placeholder="RW" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Photo URL</Label>
              <Input id="photo" name="photo" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" name="nationality" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent">Agent</Label>
              <Input id="agent" name="agent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" name="height" type="number" min={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" name="weight" type="number" min={0} />
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm">
              <input type="checkbox" name="isGoalkeeper" className="h-4 w-4 accent-cyan-400" />
              Goalkeeper
            </label>
            <Button className="xl:col-span-1">Save Player</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Player List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Positions</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[290px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerList.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <form action={updatePlayerAction} className="space-y-2">
                      <input type="hidden" name="id" value={player.id} />
                      <Input name="name" defaultValue={player.name} minLength={2} required />
                      <NativeSelect name="teamId" defaultValue={String(player.teamId)} required>
                        {teamList.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </NativeSelect>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input name="position1" defaultValue={player.position1 ?? ""} placeholder="Position 1" />
                        <Input name="position2" defaultValue={player.position2 ?? ""} placeholder="Position 2" />
                        <Input name="position3" defaultValue={player.position3 ?? ""} placeholder="Position 3" />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input name="nationality" defaultValue={player.nationality ?? ""} placeholder="Nationality" />
                        <Input name="agent" defaultValue={player.agent ?? ""} placeholder="Agent" />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input name="height" type="number" min={0} defaultValue={player.height ?? undefined} placeholder="Height" />
                        <Input name="weight" type="number" min={0} defaultValue={player.weight ?? undefined} placeholder="Weight" />
                        <label className="flex items-center gap-2 rounded-lg border border-border/70 px-2 text-xs">
                          <input
                            type="checkbox"
                            name="isGoalkeeper"
                            defaultChecked={player.isGoalkeeper}
                            className="h-4 w-4 accent-cyan-400"
                          />
                          Goalkeeper
                        </label>
                      </div>
                      <Input name="photo" defaultValue={player.photo ?? ""} placeholder="Photo URL" />
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>{player.teamName}</TableCell>
                  <TableCell>{player.nationality ?? "-"}</TableCell>
                  <TableCell>{[player.position1, player.position2, player.position3].filter(Boolean).join(", ") || "-"}</TableCell>
                  <TableCell>
                    {player.isGoalkeeper ? (
                      <Badge className="w-fit">Goalkeeper</Badge>
                    ) : (
                      <Badge variant="secondary" className="w-fit">
                        Outfield
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-y-2">
                    <form action={deletePlayerAction}>
                      <input type="hidden" name="id" value={player.id} />
                      <Button variant="danger" size="sm">
                        Delete
                      </Button>
                    </form>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/report/player/${player.id}`}>Report</Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/dashboard?playerId=${player.id}`}>Dashboard</Link>
                    </Button>
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
