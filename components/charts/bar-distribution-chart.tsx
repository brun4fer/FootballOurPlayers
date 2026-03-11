"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DistributionPoint = {
  name: string;
  value: number;
};

export function BarDistributionChart({ data }: { data: DistributionPoint[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="name" stroke="rgba(148,163,184,0.8)" interval={0} angle={-20} textAnchor="end" height={70} />
          <YAxis stroke="rgba(148,163,184,0.8)" />
          <Tooltip />
          <Bar dataKey="value" fill="#00e7ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
