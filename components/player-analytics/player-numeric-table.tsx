import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMetric } from "@/lib/dashboardMetrics";
import type { NumericRow } from "@/lib/playerAnalytics";

export function PlayerNumericTable({
  rows,
  showTotalActionsNote = false,
  manualPossessionLosses = false,
}: {
  rows: NumericRow[];
  showTotalActionsNote?: boolean;
  manualPossessionLosses?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Per 90</TableHead>
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
      {showTotalActionsNote ? (
        <p className="text-xs leading-5 text-muted-foreground">
          {manualPossessionLosses
            ? "Possession Losses is entered manually. Total Actions only adds losses that are not already represented by unsuccessful actions."
            : "Total Possession Losses is a derived metric and is not added again to Total Actions. Failed passes, crosses, individual actions, throw-ins and shots are already counted in Percentage Metrics; only Other Possession Losses is added separately."}
        </p>
      ) : null}
    </div>
  );
}
