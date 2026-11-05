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

export type GpsEvolutionPoint = {
  matchLabel: string;
  [key: string]: string | number;
};

export type GpsEvolutionSeries = {
  key: string;
  label: string;
  color: string;
};

export function GpsEvolutionChart({
  data,
  series,
  unit,
}: {
  data: GpsEvolutionPoint[];
  series: GpsEvolutionSeries[];
  unit: string;
}) {
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 18, left: 4, bottom: 44 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
          <XAxis dataKey="matchLabel" stroke="rgba(148,163,184,0.8)" angle={-18} textAnchor="end" height={72} interval={0} />
          <YAxis stroke="rgba(148,163,184,0.8)" />
          <Tooltip formatter={(value) => `${Number(value).toLocaleString("en-GB", { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ""}`} />
          <Legend />
          {series.map((item) => (
            <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} activeDot={{ r: 6 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
