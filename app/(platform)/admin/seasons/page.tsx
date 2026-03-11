import { createSeasonAction, deleteSeasonAction, updateSeasonAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSeasons } from "@/lib/data";

export default async function AdminSeasonsPage() {
  const seasonList = await getSeasons();

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Seasons</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Season</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSeasonAction} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Season Name</Label>
              <Input id="name" name="name" required placeholder="2025/2026" />
            </div>
            <Button className="sm:mt-7">Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered Seasons</CardTitle>
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
              {seasonList.map((season) => (
                <TableRow key={season.id}>
                  <TableCell>{season.id}</TableCell>
                  <TableCell>
                    <form action={updateSeasonAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={season.id} />
                      <Input name="name" defaultValue={season.name} minLength={2} required />
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>
                    <form action={deleteSeasonAction}>
                      <input type="hidden" name="id" value={season.id} />
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
