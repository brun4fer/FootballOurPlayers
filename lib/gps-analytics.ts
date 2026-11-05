import type { GpsStatRow } from "@/lib/gps-data";
import { aggregateGpsValues, type GpsValues } from "@/lib/gps-metrics";

export type GpsAggregate = {
  key: number;
  label: string;
  values: GpsValues;
};

function groupedGpsValues(
  rows: GpsStatRow[],
  keyForRow: (row: GpsStatRow) => number,
  labelForRow: (row: GpsStatRow) => string,
) {
  const grouped = new Map<number, { label: string; rows: GpsStatRow[] }>();
  for (const row of rows) {
    const key = keyForRow(row);
    const current = grouped.get(key) ?? { label: labelForRow(row), rows: [] };
    current.rows.push(row);
    grouped.set(key, current);
  }

  return [...grouped.entries()].map(([key, group]) => ({
    key,
    label: group.label,
    values: aggregateGpsValues(group.rows),
  }));
}

export function aggregateGpsByPlayer(rows: GpsStatRow[]) {
  return groupedGpsValues(rows, (row) => row.playerId, (row) => row.playerName)
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function aggregateGpsByMatch(rows: GpsStatRow[]) {
  return groupedGpsValues(
    rows,
    (row) => row.matchId,
    (row) => `Matchday ${row.matchdayNumber} x ${row.opponentTeamName}`,
  );
}
