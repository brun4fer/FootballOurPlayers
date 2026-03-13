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

type ComparisonRow = {
  label: string;
  crossingAccuracy: number;
  longPassAccuracy: number;
  dribbleAccuracy: number;
  duelSuccess: number;
};

export function ComparisonBarChart({ data }: { data: ComparisonRow[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="label" stroke="rgba(148,163,184,0.8)" interval={0} angle={-20} textAnchor="end" height={70} />
          <YAxis stroke="rgba(148,163,184,0.8)" domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="crossingAccuracy" name="Cruzamento %" fill="#00e7ff" />
          <Bar dataKey="longPassAccuracy" name="Passe Longo %" fill="#ff2ea6" />
          <Bar dataKey="dribbleAccuracy" name="Drible %" fill="#84cc16" />
          <Bar dataKey="duelSuccess" name="Duelo %" fill="#f97316" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
