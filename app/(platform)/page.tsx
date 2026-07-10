import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickLinks = [
  {
    href: "/admin/stats",
    label: "Enter Match Statistics",
    description: "Workflow for competitions, matches, teams and player totals.",
  },
  {
    href: "/players/total-competition",
    label: "Player Analysis",
    description: "Analysis area covering totals, matchdays, trends, comparisons and action profiles.",
  },
  {
    href: "/report/player/1",
    label: "Report Public",
    description: "Shareable page without administration navigation.",
  },
];

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Production-ready foundation
        </Badge>
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold sm:text-3xl">
          Football Statistics for Tactical Analysis
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Manage seasons, competitions, players and aggregated match totals, and analyse
          performance over time with dynamic percentages and per-90 metrics.
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
