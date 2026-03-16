import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMetric, type TeamPercentageRow } from "@/lib/teamDashboardMetrics";

type GoalkeeperSummary = {
  totalSaves: number;
  totalIncompleteSaves: number;
  savePercentage: number;
};

type TeamPercentageTableProps = {
  rows: TeamPercentageRow[];
  goalkeeper: GoalkeeperSummary;
};

export function TeamPercentageTable({ rows, goalkeeper }: TeamPercentageTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métrica</TableHead>
              <TableHead>Sucesso</TableHead>
              <TableHead>Insucesso</TableHead>
              <TableHead>Percentagem</TableHead>
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

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
          <p className="text-xs text-muted-foreground">Totais de Defesas</p>
          <p className="mt-1 text-lg font-semibold text-cyan-200">{goalkeeper.totalSaves}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
          <p className="text-xs text-muted-foreground">Totais de Defesas Incompletas</p>
          <p className="mt-1 text-lg font-semibold text-cyan-200">{goalkeeper.totalIncompleteSaves}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
          <p className="text-xs text-muted-foreground">Percentagem de Defesas</p>
          <p className="mt-1 text-lg font-semibold text-cyan-200">{formatMetric(goalkeeper.savePercentage)}%</p>
        </div>
      </div>
    </div>
  );
}
