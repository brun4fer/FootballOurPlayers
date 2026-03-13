"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type RadarPoint = {
  metric: string;
  value: number;
};

export function RadarProfileChart({
  data,
  color = "#ff2ea6",
  name = "Perfil",
}: {
  data: RadarPoint[];
  color?: string;
  name?: string;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(148,163,184,0.2)" />
          <PolarAngleAxis dataKey="metric" stroke="rgba(148,163,184,0.8)" />
          <Tooltip />
          <Radar name={name} dataKey="value" stroke={color} fill={color} fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
