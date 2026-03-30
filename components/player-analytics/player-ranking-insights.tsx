import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMetric } from "@/lib/dashboardMetrics";
import {
  COMPARISON_RANKING_METRICS,
  type ComparisonSummaryRow,
} from "@/lib/playerAnalytics";

export function PlayerRankingInsights({ rows }: { rows: ComparisonSummaryRow[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {COMPARISON_RANKING_METRICS.map((metric) => {
        const orderedRows = [...rows].sort((left, right) => right[metric.key] - left[metric.key]);
        const topRows = orderedRows.slice(0, 5);
        const bottomRows = [...orderedRows].reverse().slice(0, 5);

        return (
          <Card key={metric.key}>
            <CardHeader>
              <CardTitle>{metric.label}</CardTitle>
              <CardDescription>Top 5 e Bottom 5 para leitura rapida.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
                  Top 5
                </p>
                <div className="space-y-2">
                  {topRows.map((row, index) => (
                    <div
                      key={`${metric.key}-top-${row.label}`}
                      className="flex items-center justify-between rounded-lg border border-cyan-400/20 bg-cyan-500/5 px-3 py-2"
                    >
                      <p className="text-sm">
                        {index + 1}. {row.label}
                      </p>
                      <p className="text-sm font-semibold text-cyan-200">
                        {formatMetric(row[metric.key])}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  Bottom 5
                </p>
                <div className="space-y-2">
                  {bottomRows.map((row, index) => (
                    <div
                      key={`${metric.key}-bottom-${row.label}`}
                      className="flex items-center justify-between rounded-lg border border-secondary/20 bg-secondary/5 px-3 py-2"
                    >
                      <p className="text-sm">
                        {index + 1}. {row.label}
                      </p>
                      <p className="text-sm font-semibold text-secondary">
                        {formatMetric(row[metric.key])}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
