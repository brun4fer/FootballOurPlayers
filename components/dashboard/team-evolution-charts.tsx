"use client";

import * as React from "react";

import { PlayerMetricEvolutionChart } from "@/components/charts/player-metric-evolution-chart";
import { NativeSelect } from "@/components/ui/native-select";
import type { TeamEvolutionChartSeries } from "@/lib/teamDashboardMetrics";

type TeamEvolutionChartsProps = {
  charts: TeamEvolutionChartSeries[];
};

export function TeamEvolutionCharts({ charts }: TeamEvolutionChartsProps) {
  const [selectedKey, setSelectedKey] = React.useState(charts[0]?.key ?? "");

  React.useEffect(() => {
    if (!charts.some((chart) => chart.key === selectedKey)) {
      setSelectedKey(charts[0]?.key ?? "");
    }
  }, [charts, selectedKey]);

  const selectedChart = charts.find((chart) => chart.key === selectedKey) ?? charts[0] ?? null;

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
          onChange={(event) => setSelectedKey(event.target.value)}
        >
          {charts.map((chart) => (
            <option key={chart.key} value={chart.key}>
              {chart.title}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/30 p-4 sm:p-5">
        <div className="mb-4 space-y-1">
          <p className="font-[var(--font-heading)] text-lg font-semibold">{selectedChart.title}</p>
          <p className="text-sm text-muted-foreground">{selectedChart.description}</p>
        </div>

        <PlayerMetricEvolutionChart
          data={selectedChart.data}
          lines={[
            {
              dataKey: "team",
              label: "Feirense",
              color: selectedChart.color,
            },
          ]}
          displayMode="percentage"
        />
      </div>
    </div>
  );
}
