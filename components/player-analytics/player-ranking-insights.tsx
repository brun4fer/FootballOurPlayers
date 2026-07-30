import { PdfExportButton } from "@/components/pdf/pdf-export-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMetric } from "@/lib/dashboardMetrics";
import {
  COMPARISON_RANKING_METRICS,
  type ComparisonSummaryRow,
} from "@/lib/playerAnalytics";

export function PlayerRankingInsights({
  rows,
  enablePdfExport = false,
  pdfFileNamePrefix = "player-action-ranking",
}: {
  rows: ComparisonSummaryRow[];
  enablePdfExport?: boolean;
  pdfFileNamePrefix?: string;
}) {
  const combinedTargetId = "competition-percentage-top-five";
  const topCount = Math.min(5, rows.length);

  return (
    <div className="space-y-3">
      {enablePdfExport ? (
        <div className="flex justify-end">
          <PdfExportButton
            targetId={combinedTargetId}
            fileName={`${pdfFileNamePrefix}-all-actions-top-${topCount}`}
            label={`Generate all Top ${topCount} PDF`}
            orientation="landscape"
            topFiveOnly
          />
        </div>
      ) : null}

      <div
        id={enablePdfExport ? combinedTargetId : undefined}
        className="grid gap-4 xl:grid-cols-2"
      >
        {COMPARISON_RANKING_METRICS.map((metric) => {
          const orderedRows = [...rows].sort((left, right) => right[metric.key] - left[metric.key]);
          const topRows = orderedRows.slice(0, 5);
          const remainingRows = orderedRows.slice(5);
          const cardId = `competition-action-${metric.key}`;

          return (
            <Card key={metric.key} id={enablePdfExport ? cardId : undefined}>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <CardTitle>{metric.label}</CardTitle>
                    <CardDescription>
                      Top {topCount} at a glance. Expand to see the full ranking.
                    </CardDescription>
                  </div>
                  {enablePdfExport ? (
                    <PdfExportButton
                      targetId={cardId}
                      fileName={`${pdfFileNamePrefix}-${metric.label}`}
                      label="Generate action PDF"
                      expandDetails
                    />
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
                    Top {topCount}
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

                {remainingRows.length > 0 ? (
                  <details
                    data-combined-pdf-omit
                    className="group rounded-lg border border-border/70 p-3"
                  >
                    <summary className="cursor-pointer text-sm font-semibold text-secondary">
                      Show all {orderedRows.length} players
                    </summary>
                    <div className="mt-3 space-y-2">
                      {remainingRows.map((row, index) => (
                        <div
                          key={`${metric.key}-remaining-${row.label}`}
                          className="flex items-center justify-between rounded-lg border border-secondary/20 bg-secondary/5 px-3 py-2"
                        >
                          <p className="text-sm">
                            {index + 6}. {row.label}
                          </p>
                          <p className="text-sm font-semibold text-secondary">
                            {formatMetric(row[metric.key])}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
