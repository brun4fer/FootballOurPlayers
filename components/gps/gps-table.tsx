import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatGpsValue, gpsMetricDefinitions, type GpsValues } from "@/lib/gps-metrics";

export function GpsTable({ rows }: { rows: Array<{ key: string | number; label: string; values: GpsValues }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Scope</TableHead>
          {gpsMetricDefinitions.map((metric) => <TableHead key={metric.key}>{metric.shortLabel}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            <TableCell className="min-w-52 font-medium">{row.label}</TableCell>
            {gpsMetricDefinitions.map((metric) => (
              <TableCell key={metric.key} className="whitespace-nowrap">{formatGpsValue(row.values[metric.key], metric.key)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
