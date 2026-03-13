import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { href: "/admin/seasons", title: "Épocas", description: "Criar e organizar épocas." },
  {
    href: "/admin/competitions",
    title: "Competições",
    description: "Associar competições a cada época e atribuir equipas.",
  },
  { href: "/admin/teams", title: "Equipas", description: "Gerir equipas e ligações às competições." },
  { href: "/admin/players", title: "Jogadores", description: "Registar perfis e posições dos jogadores." },
  { href: "/admin/matches", title: "Jogos", description: "Criar jogos do Feirense contra adversários." },
  { href: "/admin/stats", title: "Inserir Estatísticas", description: "Inserir totais de jogador/GR/equipa." },
];

export default function AdminHomePage() {
  return (
    <section className="space-y-4">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Administração</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full border-border/60 transition-colors hover:border-cyan-400/60">
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-cyan-300">Abrir secção</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
