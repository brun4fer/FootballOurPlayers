import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatGpsValue, gpsMetricDefinitions, type GpsMetricKey, type GpsValues } from "@/lib/gps-metrics";

type MetricDefinition = { key: GpsMetricKey; shortLabel: string };

export function GpsTable({ rows, metrics = gpsMetricDefinitions }: { rows: Array<{ key: string | number; label: string; values: GpsValues }>; metrics?: readonly MetricDefinition[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Scope</TableHead>
          {metrics.map((metric) => <TableHead key={metric.key}>{metric.shortLabel}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            <TableCell className="min-w-52 font-medium">{row.label}</TableCell>
            {metrics.map((metric) => (
              <TableCell key={metric.key} className="whitespace-nowrap">{formatGpsValue(row.values[metric.key], metric.key)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
