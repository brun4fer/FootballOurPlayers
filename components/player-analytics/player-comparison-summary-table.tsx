"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMetric } from "@/lib/dashboardMetrics";
import { cn } from "@/lib/utils";
import type {
  ComparisonRankingMetricKey,
  ComparisonSummaryRow,
} from "@/lib/playerAnalytics";

type SortKey =
  | "label"
  | ComparisonRankingMetricKey
  | "recoveries"
  | "interceptions"
  | "goals"
  | "assists"
  | "minutesPlayed";

const columns: Array<{
  key: SortKey;
  label: string;
  align?: "left" | "right";
  render: (row: ComparisonSummaryRow) => string | number;
}> = [
  { key: "label", label: "Player Name", render: (row) => row.label },
  { key: "shortPassAccuracy", label: "Short Pass %", render: (row) => `${formatMetric(row.shortPassAccuracy)}%` },
  { key: "longPassAccuracy", label: "Long Pass %", render: (row) => `${formatMetric(row.longPassAccuracy)}%` },
  { key: "crossAccuracy", label: "Crossing %", render: (row) => `${formatMetric(row.crossAccuracy)}%` },
  {
    key: "individualActionAccuracy",
    label: "Individual Actions %",
    render: (row) => `${formatMetric(row.individualActionAccuracy)}%`,
  },
  { key: "throwAccuracy", label: "Throws %", render: (row) => `${formatMetric(row.throwAccuracy)}%` },
  { key: "shotAccuracy", label: "Shots %", render: (row) => `${formatMetric(row.shotAccuracy)}%` },
  { key: "duelAccuracy", label: "Duels %", render: (row) => `${formatMetric(row.duelAccuracy)}%` },
  { key: "goals", label: "Goals", render: (row) => row.goals },
  { key: "assists", label: "Assists", render: (row) => row.assists },
  { key: "recoveries", label: "Recoveries", render: (row) => row.recoveries },
  { key: "interceptions", label: "Interceptions", render: (row) => row.interceptions },
  { key: "minutesPlayed", label: "Minutes", render: (row) => row.minutesPlayed },
];

function getSortValue(row: ComparisonSummaryRow, key: SortKey) {
  if (key === "label") {
    return row.label.toLowerCase();
  }

  return row[key];
}

function isNumericSortKey(key: SortKey): key is Exclude<SortKey, "label"> {
  return key !== "label";
}

export function PlayerComparisonSummaryTable({
  rows,
  title = "Ranking de Comparacao",
  description = "Tabela ordenavel para comparar percentagens e volume com melhor leitura em listas grandes.",
}: {
  rows: ComparisonSummaryRow[];
  title?: string;
  description?: string;
}) {
  const [sortKey, setSortKey] = React.useState<SortKey>("shortPassAccuracy");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  const sortedRows = [...rows].sort((left, right) => {
    const leftValue = getSortValue(left, sortKey);
    const rightValue = getSortValue(right, sortKey);

    if (typeof leftValue === "string" && typeof rightValue === "string") {
      const result = leftValue.localeCompare(rightValue);
      return sortDirection === "asc" ? result : -result;
    }

    const result = Number(leftValue) - Number(rightValue);
    return sortDirection === "asc" ? result : -result;
  });

  const maxValues = {
    shortPassAccuracy: Math.max(...rows.map((row) => row.shortPassAccuracy), 0),
    longPassAccuracy: Math.max(...rows.map((row) => row.longPassAccuracy), 0),
    crossAccuracy: Math.max(...rows.map((row) => row.crossAccuracy), 0),
    individualActionAccuracy: Math.max(...rows.map((row) => row.individualActionAccuracy), 0),
    throwAccuracy: Math.max(...rows.map((row) => row.throwAccuracy), 0),
    shotAccuracy: Math.max(...rows.map((row) => row.shotAccuracy), 0),
    duelAccuracy: Math.max(...rows.map((row) => row.duelAccuracy), 0),
    goals: Math.max(...rows.map((row) => row.goals), 0),
    assists: Math.max(...rows.map((row) => row.assists), 0),
    recoveries: Math.max(...rows.map((row) => row.recoveries), 0),
    interceptions: Math.max(...rows.map((row) => row.interceptions), 0),
    minutesPlayed: Math.max(...rows.map((row) => row.minutesPlayed), 0),
  };

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "label" ? "asc" : "desc");
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="font-[var(--font-heading)] text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                const active = sortKey === column.key;

                return (
                  <TableHead key={column.key} className="whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className={cn(
                        "flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground",
                        active && "text-cyan-200",
                      )}
                    >
                      <span>{column.label}</span>
                      {active ? (
                        sortDirection === "desc" ? (
                          <ArrowDown className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUp className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                      )}
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, index) => (
              <TableRow key={row.label} className={index < 3 ? "bg-card/30" : undefined}>
                {columns.map((column) => {
                  const bestValue =
                    isNumericSortKey(column.key) && rows.length > 1
                      ? row[column.key] === maxValues[column.key]
                      : false;

                  return (
                    <TableCell
                      key={column.key}
                      className={cn(
                        "whitespace-nowrap",
                        column.key === "label" && "font-medium text-foreground",
                        bestValue &&
                          "font-semibold text-cyan-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]",
                      )}
                    >
                      {column.render(row)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
