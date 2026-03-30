"use client";

import * as React from "react";

import { PlayerMetricEvolutionChart } from "@/components/charts/player-metric-evolution-chart";
import { NativeSelect } from "@/components/ui/native-select";

type EvolutionLine = {
  dataKey: string;
  label: string;
  color: string;
};

type EvolutionPoint = {
  matchLabel: string;
  [key: string]: string | number | undefined;
};

type ChartOption = {
  key: string;
  title: string;
  data: EvolutionPoint[];
};

export function PlayerEvolutionChartPanel({
  charts,
  lines,
  displayMode = "per90",
}: {
  charts: ChartOption[];
  lines: EvolutionLine[];
  displayMode?: "raw" | "percentage" | "per90";
}) {
  const [selectedChartKey, setSelectedChartKey] = React.useState(charts[0]?.key ?? "");
  const selectedChart =
    charts.find((chart) => chart.key === selectedChartKey) ?? charts[0] ?? null;

  if (!selectedChart) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="max-w-xs space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Metrica
        </p>
        <NativeSelect
          value={selectedChart.key}
          onChange={(event) => setSelectedChartKey(event.target.value)}
        >
          {charts.map((chart) => (
            <option key={chart.key} value={chart.key}>
              {chart.title}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/30 p-4">
        <p className="mb-4 font-[var(--font-heading)] text-lg font-semibold">
          {selectedChart.title}
        </p>
        <PlayerMetricEvolutionChart
          data={selectedChart.data}
          lines={lines}
          displayMode={displayMode}
        />
      </div>
    </div>
  );
}
