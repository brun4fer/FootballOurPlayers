"use client";

import * as React from "react";
import { FileDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export type PdfTableColumn = {
  key: string;
  label: string;
};

type TablePdfExportButtonProps = {
  title: string;
  fileName: string;
  columns: PdfTableColumn[];
  rows: unknown[];
  frozenColumnCount?: number;
  metricsPerPage?: number;
  label?: string;
};

function buildPdfFilename(value: string) {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  const stamp = new Date().toISOString().slice(0, 10);

  return `${base || "statistics"}-${stamp}.pdf`;
}

function cellValue(row: unknown, key: string) {
  if (!row || typeof row !== "object") {
    return "-";
  }

  const value = (row as Record<string, unknown>)[key];
  return value === undefined || value === null || value === "" ? "-" : String(value);
}

export function TablePdfExportButton({
  title,
  fileName,
  columns,
  rows,
  frozenColumnCount = 2,
  metricsPerPage = 4,
  label = "Generate table PDF",
}: TablePdfExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState("");

  async function handleExport() {
    setIsExporting(true);
    setExportError("");

    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const margin = 8;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const fixedColumns = columns.slice(0, frozenColumnCount);
      const metricColumns = columns.slice(frozenColumnCount);
      const metricGroups = Array.from(
        { length: Math.max(1, Math.ceil(metricColumns.length / metricsPerPage)) },
        (_, index) => metricColumns.slice(index * metricsPerPage, (index + 1) * metricsPerPage),
      );
      const generatedDate = new Date().toLocaleDateString("en-GB");
      const cellPadding = 1.5;
      const lineHeight = 3.4;
      let pageCreated = false;

      function drawTableHeader(group: PdfTableColumn[], groupIndex: number) {
        const activeColumns = [...fixedColumns, ...group];
        const fixedWidths = fixedColumns.map((_, index) => (index === 0 ? 42 : 32));
        const metricsWidth =
          (pageWidth - margin * 2 - fixedWidths.reduce((sum, width) => sum + width, 0)) /
          Math.max(group.length, 1);
        const widths = [...fixedWidths, ...group.map(() => metricsWidth)];

        pdf.setTextColor(15, 23, 42);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text(title, margin, 10);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(71, 85, 105);
        pdf.text(
          `Metrics ${groupIndex * metricsPerPage + 1}-${groupIndex * metricsPerPage + group.length} of ${metricColumns.length}`,
          margin,
          15,
        );
        pdf.text(`Generated on ${generatedDate}`, pageWidth - margin, 15, { align: "right" });

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        const headerLines = activeColumns.map((column, index) =>
          pdf.splitTextToSize(column.label, widths[index] - cellPadding * 2) as string[],
        );
        const headerHeight = Math.max(
          10,
          ...headerLines.map((lines) => lines.length * lineHeight + cellPadding * 2),
        );
        let x = margin;
        const y = 19;

        activeColumns.forEach((column, index) => {
          pdf.setFillColor(index < fixedColumns.length ? 8 : 15, index < fixedColumns.length ? 47 : 23, index < fixedColumns.length ? 73 : 42);
          pdf.setDrawColor(148, 163, 184);
          pdf.rect(x, y, widths[index], headerHeight, "FD");
          pdf.setTextColor(255, 255, 255);
          pdf.text(headerLines[index], x + cellPadding, y + cellPadding + lineHeight - 0.7);
          x += widths[index];
        });

        return { activeColumns, widths, y: y + headerHeight };
      }

      for (let groupIndex = 0; groupIndex < metricGroups.length; groupIndex += 1) {
        const group = metricGroups[groupIndex];

        if (pageCreated) {
          pdf.addPage();
        }
        pageCreated = true;

        let table = drawTableHeader(group, groupIndex);
        let y = table.y;

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
          const row = rows[rowIndex];
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7.5);
          const textLines = table.activeColumns.map((column, index) =>
            pdf.splitTextToSize(
              cellValue(row, column.key),
              table.widths[index] - cellPadding * 2,
            ) as string[],
          );
          const rowHeight = Math.max(
            7,
            ...textLines.map((lines) => lines.length * lineHeight + cellPadding * 2),
          );

          if (y + rowHeight > pageHeight - margin) {
            pdf.addPage();
            table = drawTableHeader(group, groupIndex);
            y = table.y;
          }

          let x = margin;
          table.activeColumns.forEach((column, index) => {
            const isFixed = index < fixedColumns.length;
            const fill = rowIndex % 2 === 0 ? 248 : 241;
            pdf.setFillColor(isFixed ? fill - 3 : fill, isFixed ? fill - 1 : fill + 3, 255);
            pdf.setDrawColor(203, 213, 225);
            pdf.rect(x, y, table.widths[index], rowHeight, "FD");
            pdf.setTextColor(15, 23, 42);
            pdf.setFont("helvetica", isFixed ? "bold" : "normal");
            pdf.text(textLines[index], x + cellPadding, y + cellPadding + lineHeight - 0.7);
            x += table.widths[index];
          });
          y += rowHeight;
        }
      }

      const totalPages = pdf.getNumberOfPages();
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        pdf.setPage(pageNumber);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 3, {
          align: "right",
        });
      }

      pdf.save(buildPdfFilename(fileName));
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "The PDF could not be generated. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div data-pdf-ignore className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting || rows.length === 0 || columns.length === 0}
        className="gap-2"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        {isExporting ? "Generating PDF" : label}
      </Button>
      {exportError ? <p className="max-w-xs text-right text-xs text-red-300">{exportError}</p> : null}
    </div>
  );
}
