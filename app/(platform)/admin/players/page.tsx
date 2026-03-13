import Link from "next/link";

import { createPlayerAction, deletePlayerAction, updatePlayerAction } from "@/actions/admin";
import { ImageUploadPreview } from "@/components/forms/image-upload-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPlayers, getTeams } from "@/lib/data";
import { playerPositionOptions } from "@/lib/player-positions";

export default async function AdminPlayersPage() {
  const [teamList, playerList] = await Promise.all([getTeams(), getPlayers()]);

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Jogadores</h1>

      <Card>
        <CardHeader>
          <CardTitle>Criar Jogador</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createPlayerAction}
            encType="multipart/form-data"
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamId">Equipa</Label>
              <NativeSelect id="teamId" name="teamId" defaultValue="" required>
                <option value="" disabled>
                  Selecionar equipa
                </option>
                {teamList.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position1">Posição 1</Label>
              <NativeSelect id="position1" name="position1" defaultValue="">
                <option value="">Selecionar posição</option>
                {playerPositionOptions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position2">Posição 2</Label>
              <NativeSelect id="position2" name="position2" defaultValue="">
                <option value="">Selecionar posição</option>
                {playerPositionOptions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position3">Posição 3</Label>
              <NativeSelect id="position3" name="position3" defaultValue="">
                <option value="">Selecionar posição</option>
                {playerPositionOptions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <ImageUploadPreview
              id="photoFile"
              name="photoFile"
              label="Upload Foto do Jogador"
            />
            <div className="space-y-2">
              <Label htmlFor="nationality">Nacionalidade</Label>
              <Input id="nationality" name="nationality" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent">Agente</Label>
              <Input id="agent" name="agent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input id="height" name="height" type="number" min={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input id="weight" name="weight" type="number" min={0} />
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm">
              <input type="checkbox" name="isGoalkeeper" className="h-4 w-4 accent-cyan-400" />
              Guarda-redes
            </label>
            <Button className="xl:col-span-1">Guardar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Jogadores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Equipa</TableHead>
                <TableHead>Nacionalidade</TableHead>
                <TableHead>Posições</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="w-[290px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerList.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="h-12 w-12 rounded-md border border-border/60 object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem foto</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <form
                      action={updatePlayerAction}
                      encType="multipart/form-data"
                      className="space-y-2"
                    >
                      <input type="hidden" name="id" value={player.id} />
                      <input type="hidden" name="existingPhoto" value={player.photo ?? ""} />
                      <Input name="name" defaultValue={player.name} minLength={2} required />
                      <NativeSelect name="teamId" defaultValue={String(player.teamId)} required>
                        {teamList.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </NativeSelect>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <NativeSelect name="position1" defaultValue={player.position1 ?? ""}>
                          <option value="">Selecionar posição</option>
                          {playerPositionOptions.map((position) => (
                            <option key={position} value={position}>
                              {position}
                            </option>
                          ))}
                        </NativeSelect>
                        <NativeSelect name="position2" defaultValue={player.position2 ?? ""}>
                          <option value="">Selecionar posição</option>
                          {playerPositionOptions.map((position) => (
                            <option key={position} value={position}>
                              {position}
                            </option>
                          ))}
                        </NativeSelect>
                        <NativeSelect name="position3" defaultValue={player.position3 ?? ""}>
                          <option value="">Selecionar posição</option>
                          {playerPositionOptions.map((position) => (
                            <option key={position} value={position}>
                              {position}
                            </option>
                          ))}
                        </NativeSelect>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input name="nationality" defaultValue={player.nationality ?? ""} placeholder="Nacionalidade" />
                        <Input name="agent" defaultValue={player.agent ?? ""} placeholder="Agente" />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          name="height"
                          type="number"
                          min={0}
                          defaultValue={player.height ?? undefined}
                          placeholder="Altura"
                        />
                        <Input
                          name="weight"
                          type="number"
                          min={0}
                          defaultValue={player.weight ?? undefined}
                          placeholder="Peso"
                        />
                        <label className="flex items-center gap-2 rounded-lg border border-border/70 px-2 text-xs">
                          <input
                            type="checkbox"
                            name="isGoalkeeper"
                            defaultChecked={player.isGoalkeeper}
                            className="h-4 w-4 accent-cyan-400"
                          />
                          Guarda-redes
                        </label>
                      </div>
                      <ImageUploadPreview
                        id={`photoFile-${player.id}`}
                        name="photoFile"
                        label="Upload Foto do Jogador"
                        defaultImageUrl={player.photo}
                      />
                      <Button variant="outline" size="sm">
                        Atualizar
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>{player.teamName}</TableCell>
                  <TableCell>{player.nationality ?? "-"}</TableCell>
                  <TableCell>
                    {[player.position1, player.position2, player.position3].filter(Boolean).join(", ") || "-"}
                  </TableCell>
                  <TableCell>
                    {player.isGoalkeeper ? (
                      <Badge className="w-fit">Guarda-redes</Badge>
                    ) : (
                      <Badge variant="secondary" className="w-fit">
                        Jogador de campo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-y-2">
                    <form action={deletePlayerAction}>
                      <input type="hidden" name="id" value={player.id} />
                      <Button variant="danger" size="sm">
                        Eliminar
                      </Button>
                    </form>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/report/player/${player.id}`}>Relatório</Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/dashboard/jogadores?playerId=${player.id}`}>Dashboard</Link>
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
