import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { href: "/admin/seasons", title: "Seasons", description: "Create and organizar seasons." },
  {
    href: "/admin/competitions",
    title: "Competitions",
    description: "Link competitions to seasons and assign teams.",
  },
  { href: "/admin/teams", title: "Teams", description: "Manage teams and their competition links." },
  { href: "/admin/players", title: "Players", description: "Registar perfis and positions of the players." },
  { href: "/admin/matches", title: "Matches", description: "Create home-team matches against opponents." },
  { href: "/admin/stats", title: "Enter Statistics", description: "Enter player, goalkeeper and team totals." },
  { href: "/admin/integrations", title: "Integrations", description: "Link this account to VideoAnaliseJogadores." },
  { href: "/admin-password", title: "Administration Password", description: "Change the password that protects this area." },
];

export default function AdminHomePage() {
  return (
    <section className="space-y-4">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Administraction</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full border-border/60 transition-colors hover:border-cyan-400/60">
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-cyan-300">Open section</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
