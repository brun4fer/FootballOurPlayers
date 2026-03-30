import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMetric, type TeamAnalyticsTableRow } from "@/lib/teamDashboardMetrics";

export function TeamAnalyticsTable({ rows }: { rows: TeamAnalyticsTableRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metrica</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Percentagem</TableHead>
            <TableHead className="text-right">Por 90</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.metric}>
              <TableCell className="font-medium text-foreground">{row.metric}</TableCell>
              <TableCell className="text-right">{row.total}</TableCell>
              <TableCell className="text-right font-semibold text-cyan-200">
                {formatMetric(row.percentage)}%
              </TableCell>
              <TableCell className="text-right">{formatMetric(row.per90)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
