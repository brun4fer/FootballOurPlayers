import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickLinks = [
  {
    href: "/admin/stats",
    label: "Inserir Estatísticas de Jogo",
    description: "Fluxo para competição, jogo, equipa e totais por jogador.",
  },
  {
    href: "/dashboard/jogadores",
    label: "Abrir Dashboard",
    description: "Totais por competição, evolução e comparações entre jogadores.",
  },
  {
    href: "/report/player/1",
    label: "Relatório Público",
    description: "Página partilhável sem navegação de administração.",
  },
];

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Base pronta para produção
        </Badge>
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold sm:text-3xl">
          Plataforma de Estatísticas para Análise Tática
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Gere épocas, competições, jogadores e totais agregados por jogo, e analise a evolução
          com percentagens dinâmicas e métricas por 90 minutos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((item) => (
          <Card key={item.href} className="border-border/60">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">{item.label}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href={item.href}>
                  Abrir
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
