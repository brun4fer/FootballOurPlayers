"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type ComparisonPoint = {
  metric: string;
  primary: number;
  secondary: number;
};

export function RadarComparisonChart({
  data,
  primaryLabel,
  secondaryLabel,
}: {
  data: ComparisonPoint[];
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(148,163,184,0.2)" />
          <PolarAngleAxis dataKey="metric" stroke="rgba(148,163,184,0.8)" />
          <Tooltip />
          <Legend />
          <Radar
            name={primaryLabel}
            dataKey="primary"
            stroke="#00e7ff"
            fill="#00e7ff"
            fillOpacity={0.25}
          />
          <Radar
            name={secondaryLabel}
            dataKey="secondary"
            stroke="#ff2ea6"
            fill="#ff2ea6"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
