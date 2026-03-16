"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeamEvolutionChartSeries } from "@/lib/teamDashboardMetrics";

type TeamEvolutionChartsProps = {
  charts: TeamEvolutionChartSeries[];
};

export function TeamEvolutionCharts({ charts }: TeamEvolutionChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {charts.map((chart) => (
        <Card key={chart.title}>
          <CardHeader>
            <CardTitle>{chart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis
                    dataKey="matchLabel"
                    stroke="rgba(148,163,184,0.85)"
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={72}
                  />
                  <YAxis stroke="rgba(148,163,184,0.85)" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={chart.title}
                    stroke={chart.color}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
