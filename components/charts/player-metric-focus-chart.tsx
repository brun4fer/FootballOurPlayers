"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { NativeSelect } from "@/components/ui/native-select";
import type { ComparisonSummaryRow } from "@/lib/playerAnalytics";
import {
  COMPARISON_RANKING_METRICS,
  getSeriesColor,
} from "@/lib/playerAnalyticsShared";

export function PlayerMetricFocusChart({ rows }: { rows: ComparisonSummaryRow[] }) {
  const [selectedMetricKey, setSelectedMetricKey] = React.useState(
    COMPARISON_RANKING_METRICS[0]?.key ?? "shortPassAccuracy",
  );
  const selectedMetric =
    COMPARISON_RANKING_METRICS.find((metric) => metric.key === selectedMetricKey) ??
    COMPARISON_RANKING_METRICS[0];
  const chartData = rows.map((row) => ({
    label: row.label,
    value: row[selectedMetricKey],
    color: getSeriesColor(row.label),
  }));

  return (
    <div className="space-y-4">
      <div className="max-w-xs space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Metric Selector
        </p>
        <NativeSelect
          value={selectedMetricKey}
          onChange={(event) => setSelectedMetricKey(event.target.value as typeof selectedMetricKey)}
        >
          {COMPARISON_RANKING_METRICS.map((metric) => (
            <option key={metric.key} value={metric.key}>
              {metric.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
            <XAxis dataKey="label" stroke="rgba(148,163,184,0.8)" tick={{ fontSize: 12 }} />
            <YAxis stroke="rgba(148,163,184,0.8)" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) {
                  return null;
                }

                const current = payload[0]?.payload as
                  | { label: string; value: number; color: string }
                  | undefined;

                if (!current) {
                  return null;
                }

                const ordered = [...chartData].sort((left, right) => right.value - left.value);
                const leader = ordered[0];
                const comparisonTarget =
                  ordered.length === 2
                    ? ordered.find((entry) => entry.label !== current.label)
                    : leader.label === current.label
                      ? ordered[1]
                      : leader;
                const difference =
                  comparisonTarget && current.label !== comparisonTarget.label
                    ? current.value - comparisonTarget.value
                    : comparisonTarget
                      ? current.value - comparisonTarget.value
                      : 0;
                const sign = difference > 0 ? "+" : "";

                return (
                  <div className="min-w-[220px] rounded-xl border border-border/70 bg-card/95 p-3 shadow-xl backdrop-blur">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: current.color }}
                      />
                      <p className="text-sm font-semibold text-foreground">{current.label}</p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-cyan-200">
                      {current.value.toFixed(2)}%
                    </p>
                    {comparisonTarget ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {sign}
                        {difference.toFixed(2)}% vs {comparisonTarget.label}
                      </p>
                    ) : null}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="value"
              name={selectedMetric?.label ?? "Metric"}
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
