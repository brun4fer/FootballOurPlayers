import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardEquipasPage() {
  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Dashboard de Equipas</h1>
      <Card>
        <CardHeader>
          <CardTitle>Em preparação</CardTitle>
          <CardDescription>
            A estrutura da página foi criada. A implementação funcional será adicionada no próximo passo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página está reservada para métricas e comparações ao nível de equipas.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
