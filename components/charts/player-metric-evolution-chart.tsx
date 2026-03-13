"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type EvolutionLine = {
  dataKey: string;
  label: string;
  color: string;
};

type EvolutionPoint = {
  matchLabel: string;
  [key: string]: string | number;
};

export function PlayerMetricEvolutionChart({
  data,
  lines,
}: {
  data: EvolutionPoint[];
  lines: EvolutionLine[];
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="matchLabel" stroke="rgba(148,163,184,0.8)" />
          <YAxis stroke="rgba(148,163,184,0.8)" />
          <Tooltip />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.label}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
