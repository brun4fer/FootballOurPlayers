import Link from "next/link";

import { createPlayerAction, deletePlayerAction, updatePlayerAction } from "@/actions/admin";
import { ImageUrlInput } from "@/components/forms/image-url-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPlayers, getTeams } from "@/lib/data";
import { formatPlayerPosition, playerPositionOptions } from "@/lib/player-positions";

type AdminPlayersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseSelectedTeamIds(
  value: string | string[] | undefined,
  availableTeamIds: Set<number>,
) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return [
    ...new Set(
      values
        .flatMap((item) => item.split(","))
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item) && availableTeamIds.has(item))
        .map((item) => Math.floor(item)),
    ),
  ];
}

export default async function AdminPlayersPage({
  searchParams,
}: AdminPlayersPageProps) {
  const params = (await searchParams) ?? {};
  const [allTeams, playerList] = await Promise.all([getTeams(), getPlayers()]);
  const teamList = allTeams.filter((team) => team.isFixedHomeTeam);
  const selectedTeamIds = parseSelectedTeamIds(
    params.teamIds,
    new Set(teamList.map((team) => team.id)),
  );
  const selectedTeamIdSet = new Set(selectedTeamIds);
  const visiblePlayerList =
    selectedTeamIds.length > 0
      ? playerList.filter((player) => selectedTeamIdSet.has(player.teamId))
      : playerList;

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
              <NativeSelect id="teamId" name="teamId" defaultValue={String(teamList[0]?.id ?? "")} required disabled>
                {teamList.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </NativeSelect>
              <input type="hidden" name="teamId" value={teamList[0]?.id ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position1">Position 1</Label>
              <NativeSelect id="position1" name="position1" defaultValue="">
                <option value="">Select position</option>
                {playerPositionOptions.map((position) => (
                  <option key={position} value={position}>
                    {formatPlayerPosition(position)}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position2">Position 2</Label>
              <NativeSelect id="position2" name="position2" defaultValue="">
                <option value="">Select position</option>
                {playerPositionOptions.map((position) => (
                  <option key={position} value={position}>
                    {formatPlayerPosition(position)}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position3">Position 3</Label>
              <NativeSelect id="position3" name="position3" defaultValue="">
                <option value="">Select position</option>
                {playerPositionOptions.map((position) => (
                  <option key={position} value={position}>
                    {formatPlayerPosition(position)}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <ImageUrlInput
              id="photo"
              name="photo"
              label="Player Photo URL"
            />
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
            <Button className="xl:col-span-1">Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Player List</CardTitle>
          <CardDescription>
            {visiblePlayerList.length} of {playerList.length} players visible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-2">
              <Label htmlFor="teamIds">Teams</Label>
              <select
                id="teamIds"
                name="teamIds"
                multiple
                defaultValue={selectedTeamIds.map(String)}
                className="h-32 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {teamList.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button>Apply Filters</Button>
              {selectedTeamIds.length > 0 ? (
                <Button asChild variant="outline">
                  <Link href="/admin/players">Clear Filters</Link>
                </Button>
              ) : null}
            </div>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Positions</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[290px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visiblePlayerList.length > 0 ? (
                visiblePlayerList.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      {player.photo ? (
                        <img
                          src={player.photo}
                          alt={player.name}
                          className="h-12 w-12 rounded-md border border-border/60 object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No photo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <details className="min-w-52">
                        <summary className="cursor-pointer font-medium text-foreground">
                          {player.name}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">Edit</span>
                        </summary>
                      <form action={updatePlayerAction} className="mt-3 space-y-2 rounded-lg border border-border/70 p-3">
                        <input type="hidden" name="id" value={player.id} />
                        <Input name="name" defaultValue={player.name} minLength={2} required />
                        <NativeSelect name="teamId" defaultValue={String(player.teamId)} required disabled>
                          {teamList.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </NativeSelect>
                        <input type="hidden" name="teamId" value={teamList[0]?.id ?? player.teamId} />
                        <div className="grid gap-2 sm:grid-cols-3">
                          <NativeSelect name="position1" defaultValue={player.position1 ?? ""}>
                            <option value="">Select position</option>
                            {playerPositionOptions.map((position) => (
                              <option key={position} value={position}>
                                {formatPlayerPosition(position)}
                              </option>
                            ))}
                          </NativeSelect>
                          <NativeSelect name="position2" defaultValue={player.position2 ?? ""}>
                            <option value="">Select position</option>
                            {playerPositionOptions.map((position) => (
                              <option key={position} value={position}>
                                {formatPlayerPosition(position)}
                              </option>
                            ))}
                          </NativeSelect>
                          <NativeSelect name="position3" defaultValue={player.position3 ?? ""}>
                            <option value="">Select position</option>
                            {playerPositionOptions.map((position) => (
                              <option key={position} value={position}>
                                {formatPlayerPosition(position)}
                              </option>
                            ))}
                          </NativeSelect>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input name="nationality" defaultValue={player.nationality ?? ""} placeholder="Nationality" />
                          <Input name="agent" defaultValue={player.agent ?? ""} placeholder="Agent" />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-3">
                          <Input
                            name="height"
                            type="number"
                            min={0}
                            defaultValue={player.height ?? undefined}
                            placeholder="Height"
                          />
                          <Input
                            name="weight"
                            type="number"
                            min={0}
                            defaultValue={player.weight ?? undefined}
                            placeholder="Weight"
                          />
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
                        <ImageUrlInput
                          id={`photo-${player.id}`}
                          name="photo"
                          label="Player Photo URL"
                          defaultImageUrl={player.photo}
                        />
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </form>
                      </details>
                    </TableCell>
                    <TableCell>{player.teamName}</TableCell>
                    <TableCell>{player.nationality ?? "-"}</TableCell>
                    <TableCell>
                      {[player.position1, player.position2, player.position3]
                        .filter(Boolean)
                        .map((position) => formatPlayerPosition(position))
                        .join(", ") || "-"}
                    </TableCell>
                    <TableCell>
                      {player.isGoalkeeper ? (
                        <Badge className="w-fit">Goalkeeper</Badge>
                      ) : (
                        <Badge variant="secondary" className="w-fit">
                          Outfield Player
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
                        <Link href={`/dashboard/jogadores?playerId=${player.id}`}>Dashboard</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No players match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
