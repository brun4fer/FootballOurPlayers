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
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Competições</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Criar Competição</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCompetitionAction} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Competição</Label>
                <Input id="name" name="name" required placeholder="Primeira Liga" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonId">Época</Label>
                <NativeSelect id="seasonId" name="seasonId" required defaultValue="">
                  <option value="" disabled>
                    Selecionar época
                  </option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {season.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <Button className="w-full">Guardar Competição</Button>
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
                <NativeSelect id="teamId" name="teamId" required defaultValue="">
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
                <NativeSelect id="competitionId" name="competitionId" required defaultValue="">
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
          <CardTitle>Lista de Competições</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Época</TableHead>
                <TableHead className="w-[220px]">Ações</TableHead>
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
                        Atualizar
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>{competition.seasonName}</TableCell>
                  <TableCell>
                    <form action={deleteCompetitionAction}>
                      <input type="hidden" name="id" value={competition.id} />
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
          <CardTitle>Associações Equipa-Competição</CardTitle>
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
