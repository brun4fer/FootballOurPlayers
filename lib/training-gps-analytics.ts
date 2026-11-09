import { aggregateGpsValues, type GpsValues } from "@/lib/gps-metrics";
import type { TrainingGpsStatRow } from "@/lib/training-gps-data";

export type TrainingGpsAggregate = {
  key: number;
  label: string;
  values: GpsValues;
};

function trainingLabel(row: TrainingGpsStatRow) {
  const date = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${row.trainingDate}T00:00:00Z`));
  return `${date} · MC ${row.microcycleNumber} · TU ${row.trainingUnitNumber}`;
}

export function aggregateTrainingGpsByPlayer(rows: TrainingGpsStatRow[]) {
  const grouped = new Map<number, { label: string; rows: TrainingGpsStatRow[] }>();
  for (const row of rows) {
    const current = grouped.get(row.playerId) ?? { label: row.playerName, rows: [] };
    current.rows.push(row);
    grouped.set(row.playerId, current);
  }
  return [...grouped.entries()]
    .map(([key, group]) => ({ key, label: group.label, values: aggregateGpsValues(group.rows) }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function aggregateTrainingGpsBySession(rows: TrainingGpsStatRow[]): TrainingGpsAggregate[] {
  const grouped = new Map<number, TrainingGpsStatRow[]>();
  for (const row of rows) grouped.set(row.trainingSessionId, [...(grouped.get(row.trainingSessionId) ?? []), row]);

  return [...grouped.entries()].map(([key, group]) => {
    const first = group[0]!;
    const values = aggregateGpsValues(group);
    values.minutesPlayed = first.minutesPlayed;
    return { key, label: trainingLabel(first), values };
  });
}

export function aggregateTrainingTeamTotals(sessionRows: TrainingGpsAggregate[]) {
  const values = aggregateGpsValues(sessionRows.map((session) => session.values));
  values.minutesPlayed = sessionRows.reduce((total, session) => total + session.values.minutesPlayed, 0);
  return values;
}
