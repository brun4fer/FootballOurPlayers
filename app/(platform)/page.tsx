import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickLinks = [
  {
    href: "/admin/stats",
    label: "Inserir Estatisticas de Jogo",
    description: "Fluxo para competicao, jogo, equipa e totais por jogador.",
  },
  {
    href: "/players/total-competition",
    label: "Consulta de Jogadores",
    description: "Area dividida por totais, jornada, evolucao, comparacao e perfil de acoes.",
  },
  {
    href: "/report/player/1",
    label: "Relatorio Publico",
    description: "Pagina partilhavel sem navegacao de administracao.",
  },
];

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Base pronta para producao
        </Badge>
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold sm:text-3xl">
          Plataforma de Estatisticas para Analise Tatica
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Gere epocas, competicoes, jogadores e totais agregados por jogo, e analise a
          evolucao com percentagens dinamicas e metricas por 90 minutos.
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
