"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TeamOffensiveChartDatum } from "@/lib/teamDashboardMetrics";

const BAR_COLORS = ["#00e7ff", "#ff2ea6", "#22d3ee", "#84cc16", "#f59e0b"];

type TeamOffensiveChartProps = {
  data: TeamOffensiveChartDatum[];
};

export function TeamOffensiveChart({ data }: TeamOffensiveChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="label" stroke="rgba(148,163,184,0.85)" interval={0} angle={-15} textAnchor="end" height={75} />
          <YAxis stroke="rgba(148,163,184,0.85)" />
          <Tooltip />
          <Bar dataKey="total" name="Total" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
