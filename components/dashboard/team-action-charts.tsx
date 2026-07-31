"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TeamPercentageRow } from "@/lib/teamDashboardMetrics";

function chartHeight(rowCount: number) {
  return Math.max(360, rowCount * 42);
}

export function TeamActionEfficiencyChart({ rows }: { rows: TeamPercentageRow[] }) {
  const data = [...rows]
    .map((row) => ({ label: row.metric, percentage: row.percentage }))
    .sort((left, right) => right.percentage - left.percentage);

  return (
    <div className="w-full" style={{ height: chartHeight(data.length) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke="rgba(148,163,184,0.85)"
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={150}
            stroke="rgba(148,163,184,0.85)"
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, "Efficiency"]} />
          <Bar dataKey="percentage" name="Efficiency" fill="#00e7ff" radius={[0, 5, 5, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TeamActionVolumeChart({ rows }: { rows: TeamPercentageRow[] }) {
  const data = rows.map((row) => ({
    label: row.metric,
    successful: row.success,
    unsuccessful: row.fail,
  }));

  return (
    <div className="w-full" style={{ height: chartHeight(data.length) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis type="number" stroke="rgba(148,163,184,0.85)" />
          <YAxis
            type="category"
            dataKey="label"
            width={150}
            stroke="rgba(148,163,184,0.85)"
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="successful"
            name="Successful"
            stackId="actions"
            fill="#00e7ff"
          />
          <Bar
            dataKey="unsuccessful"
            name="Unsuccessful"
            stackId="actions"
            fill="#ff2ea6"
            radius={[0, 5, 5, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
