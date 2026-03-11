import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickLinks = [
  {
    href: "/admin/stats",
    label: "Insert Match Stats",
    description: "Workflow for competition, match, team and player totals.",
  },
  {
    href: "/dashboard",
    label: "Open Dashboard",
    description: "Competition totals, evolution charts and player comparisons.",
  },
  {
    href: "/report/player/1",
    label: "Sample Public Report",
    description: "Shareable public page without admin navigation.",
  },
];

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Production-ready base
        </Badge>
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold sm:text-3xl">
          Football Tactical Analysis Statistics
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Manage seasons, competitions, players, and aggregated match totals, then analyze
          progression through dynamic percentages and per-90 metrics.
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
                  Open
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
