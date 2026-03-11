import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { href: "/admin/seasons", title: "Seasons", description: "Create and organize season labels." },
  {
    href: "/admin/competitions",
    title: "Competitions",
    description: "Map competitions to each season and assign teams.",
  },
  { href: "/admin/teams", title: "Teams", description: "Manage team records and competition links." },
  { href: "/admin/players", title: "Players", description: "Register player profiles and positions." },
  { href: "/admin/matches", title: "Matches", description: "Create Feirense matches against opponents." },
  { href: "/admin/stats", title: "Stats Entry", description: "Insert player/goalkeeper/team totals." },
];

export default function AdminHomePage() {
  return (
    <section className="space-y-4">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Admin Management</h1>
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
