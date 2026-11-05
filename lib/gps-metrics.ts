export const gpsMetricDefinitions = [
  { key: "minutesPlayed", label: "Minutes Played", shortLabel: "Minutes", unit: "min", step: 0.1, aggregation: "sum" },
  { key: "totalDistance", label: "Total Distance", shortLabel: "Total Distance", unit: "m", step: 0.01, aggregation: "sum" },
  { key: "runningDistance", label: "Running Distance", shortLabel: "Running Distance", unit: "m", step: 0.01, aggregation: "sum" },
  { key: "sprintDistance", label: "Sprint Distance", shortLabel: "Sprint Distance", unit: "m", step: 0.01, aggregation: "sum" },
  { key: "hsrDistance", label: "HSR Distance", shortLabel: "HSR Distance", unit: "m", step: 0.01, aggregation: "sum" },
  { key: "maximumSpeed", label: "Maximum Speed", shortLabel: "Max Speed", unit: "km/h", step: 0.01, aggregation: "max" },
  { key: "sprints", label: "Number of Sprints", shortLabel: "Sprints", unit: "", step: 1, aggregation: "sum" },
  { key: "repeatedSprints", label: "Repeated Sprints", shortLabel: "Repeated Sprints", unit: "", step: 1, aggregation: "sum" },
  { key: "hsrRuns", label: "HSR Runs", shortLabel: "HSR Runs", unit: "", step: 1, aggregation: "sum" },
  { key: "totalAccelerations", label: "Total Accelerations", shortLabel: "Total ACC", unit: "", step: 1, aggregation: "sum" },
  { key: "highIntensityAccelerations", label: "High-Intensity Accelerations", shortLabel: "High-Intensity ACC", unit: "", step: 1, aggregation: "sum" },
  { key: "totalDecelerations", label: "Total Decelerations", shortLabel: "Total DCC", unit: "", step: 1, aggregation: "sum" },
  { key: "highIntensityDecelerations", label: "High-Intensity Decelerations", shortLabel: "High-Intensity DCC", unit: "", step: 1, aggregation: "sum" },
  { key: "changesOfDirection", label: "Changes of Direction", shortLabel: "Direction Changes", unit: "", step: 1, aggregation: "sum" },
] as const;

export type GpsMetricKey = (typeof gpsMetricDefinitions)[number]["key"];
export type GpsValues = Record<GpsMetricKey, number>;

export const gpsMetricKeys = gpsMetricDefinitions.map((metric) => metric.key);

export function isGpsMetricKey(value: unknown): value is GpsMetricKey {
  return typeof value === "string" && gpsMetricKeys.includes(value as GpsMetricKey);
}

export function emptyGpsValues(): GpsValues {
  return Object.fromEntries(gpsMetricKeys.map((key) => [key, 0])) as GpsValues;
}

export function aggregateGpsValues(rows: Array<Partial<GpsValues>>): GpsValues {
  const aggregate = emptyGpsValues();

  for (const metric of gpsMetricDefinitions) {
    const values = rows.map((row) => Number(row[metric.key] ?? 0));
    aggregate[metric.key] =
      metric.aggregation === "max"
        ? Math.max(0, ...values)
        : values.reduce((total, value) => total + value, 0);
  }

  return aggregate;
}

export function formatGpsValue(value: number, metricKey: GpsMetricKey) {
  const metric = gpsMetricDefinitions.find((item) => item.key === metricKey)!;
  const formatted = metric.step === 1
    ? Math.round(value).toLocaleString("en-GB")
    : value.toLocaleString("en-GB", { maximumFractionDigits: 2 });
  return metric.unit ? `${formatted} ${metric.unit}` : formatted;
}
