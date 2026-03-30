"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type EvolutionLine = {
  dataKey: string;
  label: string;
  color: string;
};

type EvolutionPoint = {
  matchLabel: string;
  matchdayNumber?: number;
  opponentTeamName?: string;
  [key: string]: string | number | undefined;
};

type DisplayMode = "raw" | "percentage" | "per90";

function formatValue(value: number, displayMode: DisplayMode) {
  if (!Number.isFinite(value)) {
    return displayMode === "percentage" ? "0.00%" : displayMode === "per90" ? "0.00 /90" : "0.00";
  }

  if (displayMode === "percentage") {
    return `${value.toFixed(2)}%`;
  }

  if (displayMode === "per90") {
    return `${value.toFixed(2)} /90`;
  }

  return value.toFixed(2);
}

function formatAxisValue(value: number, displayMode: DisplayMode) {
  if (!Number.isFinite(value)) {
    return displayMode === "percentage" ? "0%" : "0";
  }

  if (displayMode === "percentage") {
    return `${Math.round(value)}%`;
  }

  if (Math.abs(value) >= 10 || Number.isInteger(value)) {
    return value.toFixed(0);
  }

  return value.toFixed(1);
}

function parseMatchMeta(point: EvolutionPoint) {
  const matchdayFromPoint = Number(point.matchdayNumber ?? 0);
  const opponentFromPoint = String(point.opponentTeamName ?? "");

  if (matchdayFromPoint > 0 && opponentFromPoint) {
    return {
      matchday: matchdayFromPoint,
      opponent: opponentFromPoint,
    };
  }

  const label = String(point.matchLabel ?? "");
  const jornadaMatch = label.match(/Jornada\s+(\d+)/i);
  const opponentMatch =
    label.match(/vs\s+(.+?)\s+-\s+Jornada/i) ??
    label.match(/vs\s+(.+?)\s+\(Jornada/i);

  return {
    matchday: jornadaMatch ? Number(jornadaMatch[1]) : 0,
    opponent: opponentMatch?.[1] ?? label,
  };
}

function computeTrend(values: number[]) {
  const recentValues = values.filter((value) => Number.isFinite(value)).slice(-3);

  if (recentValues.length < 3) {
    return "➖ Estavel";
  }

  const first = recentValues[0];
  const last = recentValues[recentValues.length - 1];
  const baseline = Math.max(Math.abs(first), Math.abs(last), 1);
  const tolerance = baseline * 0.08;

  if (last - first > tolerance) {
    return "📈 Em subida";
  }

  if (first - last > tolerance) {
    return "📉 Em queda";
  }

  return "➖ Estavel";
}

function computeConsistency(values: number[]) {
  const validValues = values.filter((value) => Number.isFinite(value));

  if (validValues.length <= 1) {
    return "Consistente";
  }

  const average =
    validValues.reduce((sum, value) => sum + value, 0) / Math.max(validValues.length, 1);
  const variance =
    validValues.reduce((sum, value) => sum + (value - average) ** 2, 0) /
    Math.max(validValues.length, 1);
  const standardDeviation = Math.sqrt(variance);
  const ratio = standardDeviation / Math.max(Math.abs(average), 1);

  return ratio <= 0.35 ? "Consistente" : "Irregular";
}

function getPointDifferenceLabel(
  entries: Array<{ name: string; value: number }>,
  current: { name: string; value: number },
  displayMode: DisplayMode,
) {
  if (entries.length <= 1) {
    return null;
  }

  const ordered = [...entries].sort((left, right) => right.value - left.value);

  if (ordered.length === 2) {
    const other = ordered.find((entry) => entry.name !== current.name);

    if (!other) {
      return null;
    }

    const difference = current.value - other.value;
    const sign = difference > 0 ? "+" : "";
    return `${sign}${formatValue(difference, displayMode)} vs ${other.name}`;
  }

  const leader = ordered[0];

  if (leader.name === current.name) {
    const runnerUp = ordered[1];
    const difference = current.value - runnerUp.value;
    return `+${formatValue(difference, displayMode)} vs ${runnerUp.name}`;
  }

  const difference = current.value - leader.value;
  return `${formatValue(difference, displayMode)} vs ${leader.name}`;
}

export function PlayerMetricEvolutionChart({
  data,
  lines,
  displayMode = "raw",
}: {
  data: EvolutionPoint[];
  lines: EvolutionLine[];
  displayMode?: DisplayMode;
}) {
  const displayData = data.map((point) => {
    const nextPoint: EvolutionPoint = { ...point };

    for (const line of lines) {
      const rawValue = Number(point[line.dataKey] ?? 0);
      const minutes = Number(point[`${line.dataKey}__minutes`] ?? 0);
      const displayValue =
        displayMode === "per90" ? (minutes > 0 ? (rawValue / minutes) * 90 : 0) : rawValue;

      nextPoint[line.dataKey] = displayValue;
    }

    return nextPoint;
  });

  const lineSummaries = lines.map((line) => {
    const values = displayData.map((point) => Number(point[line.dataKey] ?? 0));
    const average =
      values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);

    return {
      ...line,
      values,
      average,
      maximum: values.length > 0 ? Math.max(...values) : 0,
      minimum: values.length > 0 ? Math.min(...values) : 0,
      trend: computeTrend(values),
      consistency: computeConsistency(values),
    };
  });

  const summaryByKey = new Map(lineSummaries.map((summary) => [summary.dataKey, summary]));

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {lineSummaries.map((summary) => {
          const orderedByAverage = [...lineSummaries].sort(
            (left, right) => right.average - left.average,
          );
          const leader = orderedByAverage[0];
          const runnerUp = orderedByAverage[1];
          const differenceLabel =
            lineSummaries.length <= 1
              ? null
              : leader.dataKey === summary.dataKey && runnerUp
                ? `+${formatValue(summary.average - runnerUp.average, displayMode)} vs ${runnerUp.label}`
                : leader.dataKey !== summary.dataKey
                  ? `${formatValue(summary.average - leader.average, displayMode)} vs ${leader.label}`
                  : null;

          return (
            <div
              key={summary.dataKey}
              className="rounded-xl border border-border/60 bg-card/40 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: summary.color }}
                    />
                    <p className="text-sm font-semibold text-foreground">{summary.label}</p>
                    <span
                      className={
                        summary.consistency === "Consistente"
                          ? "rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-cyan-200"
                          : "rounded-full border border-orange-400/30 bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-200"
                      }
                    >
                      {summary.consistency}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{summary.trend}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Media
                  </p>
                  <p className="text-sm font-semibold text-cyan-200">
                    {formatValue(summary.average, displayMode)}
                  </p>
                </div>
              </div>
              {differenceLabel ? (
                <p className="mt-2 text-xs text-muted-foreground">{differenceLabel}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 12, right: 12, left: 4, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
            <XAxis
              dataKey="matchLabel"
              stroke="rgba(148,163,184,0.8)"
              minTickGap={24}
              tick={{ fontSize: 12 }}
              tickFormatter={(_, index) => {
                const point = displayData[index];
                const meta = parseMatchMeta(point);
                return meta.matchday ? `J${meta.matchday}` : String(point?.matchLabel ?? "");
              }}
            />
            <YAxis
              stroke="rgba(148,163,184,0.8)"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatAxisValue(Number(value), displayMode)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) {
                  return null;
                }

                const point = payload[0]?.payload as EvolutionPoint | undefined;

                if (!point) {
                  return null;
                }

                const meta = parseMatchMeta(point);
                const currentEntries = payload
                  .map((entry) => ({
                    name: String(entry.name ?? entry.dataKey ?? "Serie"),
                    value: Number(entry.value ?? 0),
                    color: String(entry.color ?? "#00e7ff"),
                  }))
                  .sort((left, right) => right.value - left.value);

                return (
                  <div className="min-w-[220px] rounded-xl border border-border/70 bg-card/95 p-3 shadow-xl backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Jornada {meta.matchday || "-"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      Feirense vs {meta.opponent || "-"}
                    </p>
                    <div className="mt-3 space-y-2">
                      {currentEntries.map((entry) => (
                        <div
                          key={entry.name}
                          className="rounded-lg border border-border/50 bg-background/40 px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-foreground">{entry.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-cyan-200">
                              {formatValue(entry.value, displayMode)}
                            </span>
                          </div>
                          {getPointDifferenceLabel(currentEntries, entry, displayMode) ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {getPointDifferenceLabel(currentEntries, entry, displayMode)}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            />
            {lineSummaries.map((summary) => (
              <ReferenceLine
                key={`${summary.dataKey}-average`}
                y={summary.average}
                stroke={summary.color}
                strokeDasharray="6 6"
                strokeOpacity={0.45}
              />
            ))}
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.label}
                stroke={line.color}
                strokeWidth={2.75}
                activeDot={{ r: 6, stroke: line.color, strokeWidth: 2, fill: "#0f172a" }}
                dot={(dotProps) => {
                  const summary = summaryByKey.get(line.dataKey);

                  if (!summary) {
                    return null;
                  }

                  const value = Number(dotProps.value ?? 0);
                  const pointCount = summary.values.length;

                  if (pointCount === 1) {
                    return (
                      <circle
                        cx={dotProps.cx}
                        cy={dotProps.cy}
                        r={4.5}
                        fill={line.color}
                        stroke="#e2e8f0"
                        strokeWidth={1.5}
                      />
                    );
                  }

                  if (value === summary.maximum) {
                    return (
                      <circle
                        cx={dotProps.cx}
                        cy={dotProps.cy}
                        r={5}
                        fill="#22c55e"
                        stroke="#ecfdf5"
                        strokeWidth={1.8}
                      />
                    );
                  }

                  if (value === summary.minimum) {
                    return (
                      <circle
                        cx={dotProps.cx}
                        cy={dotProps.cy}
                        r={5}
                        fill="#ef4444"
                        stroke="#fef2f2"
                        strokeWidth={1.8}
                      />
                    );
                  }

                  return null;
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
