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

type ActionProfileSeries = {
  dataKey: string;
  label: string;
  color: string;
};

type ActionProfileComparisonPoint = {
  metric: string;
  [key: string]: string | number;
};

export function ActionProfileComparisonChart({
  data,
  series,
}: {
  data: ActionProfileComparisonPoint[];
  series: ActionProfileSeries[];
}) {
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis
            dataKey="metric"
            stroke="rgba(148,163,184,0.8)"
            interval={0}
            angle={-20}
            textAnchor="end"
            height={84}
          />
          <YAxis stroke="rgba(148,163,184,0.8)" />
          <Tooltip />
          <Legend />
          {series.map((entry) => (
            <Bar
              key={entry.dataKey}
              dataKey={entry.dataKey}
              name={entry.label}
              fill={entry.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
