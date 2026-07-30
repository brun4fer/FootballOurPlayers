import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMetric } from "@/lib/dashboardMetrics";
import type { PercentageRow } from "@/lib/playerAnalytics";

type GoalkeeperSummary = {
  totalSaves: number;
  totalIncompleteSaves: number;
  savePercentage: number;
};

type PlayerPercentageTableProps = {
  rows: PercentageRow[];
  goalkeeperSummary?: GoalkeeperSummary;
};

export function PlayerPercentageTable({
  rows,
  goalkeeperSummary,
}: PlayerPercentageTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Success</TableHead>
              <TableHead>Unsuccessful</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.metric}>
                <TableCell>{row.metric}</TableCell>
                <TableCell>{row.success}</TableCell>
                <TableCell>{row.fail}</TableCell>
                <TableCell>{formatMetric(row.percentage)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {goalkeeperSummary ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Total Saves</p>
            <p className="mt-1 text-lg font-semibold text-cyan-200">
              {goalkeeperSummary.totalSaves}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Total Incomplete Saves</p>
            <p className="mt-1 text-lg font-semibold text-cyan-200">
              {goalkeeperSummary.totalIncompleteSaves}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Save Percentage</p>
            <p className="mt-1 text-lg font-semibold text-cyan-200">
              {formatMetric(goalkeeperSummary.savePercentage)}%
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
