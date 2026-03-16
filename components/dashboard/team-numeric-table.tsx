import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMetric, type TeamNumericRow } from "@/lib/teamDashboardMetrics";

type TeamNumericTableProps = {
  rows: TeamNumericRow[];
};

export function TeamNumericTable({ rows }: TeamNumericTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Métrica</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Por 90</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.metric}>
              <TableCell>{row.metric}</TableCell>
              <TableCell>{row.total}</TableCell>
              <TableCell>{formatMetric(row.per90)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
