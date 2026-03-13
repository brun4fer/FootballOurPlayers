import {
  assignTeamCompetitionAction,
  createTeamAction,
  deleteTeamAction,
  removeTeamCompetitionAction,
  updateTeamAction,
} from "@/actions/admin";
import { ImageUploadPreview } from "@/components/forms/image-upload-preview";
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
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Equipas</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Criar Equipa</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createTeamAction} encType="multipart/form-data" className="grid gap-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Equipa</Label>
                <Input id="name" name="name" required placeholder="CD Feirense" />
              </div>
              <ImageUploadPreview
                id="emblemFile"
                name="emblemFile"
                label="Upload Emblema da Equipa"
              />
              <Button>Guardar</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Associar Equipa à Competição</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={assignTeamCompetitionAction} className="space-y-3">
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
                <Label htmlFor="competitionId">Competição</Label>
                <NativeSelect id="competitionId" name="competitionId" defaultValue="" required>
                  <option value="" disabled>
                    Selecionar competição
                  </option>
                  {competitionList.map((competition) => (
                    <option key={competition.id} value={competition.id}>
                      {competition.name} - {competition.seasonName}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <Button className="w-full">Guardar Associação</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Equipas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Emblema</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[260px]">Ações</TableHead>
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
                      <span className="text-xs text-muted-foreground">Sem emblema</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <form
                      action={updateTeamAction}
                      encType="multipart/form-data"
                      className="grid gap-2"
                    >
                      <input type="hidden" name="id" value={team.id} />
                      <input type="hidden" name="existingEmblemUrl" value={team.emblemUrl ?? ""} />
                      <Input name="name" defaultValue={team.name} minLength={2} required />
                      <ImageUploadPreview
                        id={`emblemFile-${team.id}`}
                        name="emblemFile"
                        label="Upload Emblema da Equipa"
                        defaultImageUrl={team.emblemUrl}
                      />
                      <Button variant="outline" size="sm">
                        Atualizar
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>
                    <form action={deleteTeamAction}>
                      <input type="hidden" name="id" value={team.id} />
                      <Button variant="danger" size="sm">
                        Eliminar
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
          <CardTitle>Associações de Competição</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipa</TableHead>
                <TableHead>Competição</TableHead>
                <TableHead>Época</TableHead>
                <TableHead className="w-[110px]">Ações</TableHead>
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
                        Eliminar
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
