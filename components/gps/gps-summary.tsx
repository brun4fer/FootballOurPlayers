import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGpsValue, type GpsMetricKey, type GpsValues } from "@/lib/gps-metrics";

const summaryMetrics: Array<{ key: GpsMetricKey; title: string }> = [
  { key: "totalDistance", title: "Total Distance" },
  { key: "hsrDistance", title: "HSR Distance" },
  { key: "sprintDistance", title: "Sprint Distance" },
  { key: "maximumSpeed", title: "Maximum Speed" },
  { key: "sprints", title: "Sprints" },
  { key: "highIntensityAccelerations", title: "High-Intensity ACC" },
];

export function GpsSummary({ values }: { values: GpsValues }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {summaryMetrics.map((metric) => (
        <Card key={metric.key}>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{metric.title}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold text-cyan-200">{formatGpsValue(values[metric.key], metric.key)}</p></CardContent>
        </Card>
      ))}
    </div>
  );
}
