import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMetric } from "@/lib/dashboardMetrics";
import type { NumericRow } from "@/lib/playerAnalytics";

export function PlayerNumericTable({ rows }: { rows: NumericRow[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metrica</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Por 90</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.metric}>
              <TableCell>{row.metric}</TableCell>
              <TableCell>{row.total}</TableCell>
              <TableCell>{row.per90 === undefined ? "-" : formatMetric(row.per90)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
