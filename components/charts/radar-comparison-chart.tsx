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
  primaryColor = "#00e7ff",
  secondaryColor = "#ff2ea6",
}: {
  data: ComparisonPoint[];
  primaryLabel: string;
  secondaryLabel: string;
  primaryColor?: string;
  secondaryColor?: string;
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
            stroke={primaryColor}
            fill={primaryColor}
            fillOpacity={0.25}
          />
          <Radar
            name={secondaryLabel}
            dataKey="secondary"
            stroke={secondaryColor}
            fill={secondaryColor}
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
