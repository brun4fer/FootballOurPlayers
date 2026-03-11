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

type PerformancePoint = {
  matchLabel: string;
  goals: number;
  assists: number;
  shotAccuracy: number;
};

export function LinePerformanceChart({ data }: { data: PerformancePoint[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="matchLabel" stroke="rgba(148,163,184,0.8)" />
          <YAxis stroke="rgba(148,163,184,0.8)" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="goals" stroke="#00e7ff" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="assists" stroke="#ff2ea6" strokeWidth={2} dot={false} />
          <Line
            type="monotone"
            dataKey="shotAccuracy"
            name="Shot Accuracy %"
            stroke="#84cc16"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
