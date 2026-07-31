"use client";

import * as React from "react";
import { FileDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type PdfExportButtonProps = {
  targetId: string;
  fileName: string;
  label?: string;
  orientation?: "portrait" | "landscape";
  expandDetails?: boolean;
  topFiveOnly?: boolean;
  polishedLayout?: boolean;
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

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export function PdfExportButton({
  targetId,
  fileName,
  label = "Generate PDF",
  orientation = "portrait",
  expandDetails = false,
  topFiveOnly = false,
  polishedLayout,
}: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState("");

  async function handleExport() {
    const element = document.getElementById(targetId);

    if (!element) {
      setExportError("The section to export could not be found.");
      return;
    }

    setIsExporting(true);
    setExportError("");
    const usePolishedLayout =
      polishedLayout ??
      document.querySelector('[data-polished-pdf="true"]') !== null;

    try {
      await waitForPaint();

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const computedBackground = getComputedStyle(document.body).backgroundColor || "#0f172a";
      const exportWidth = Math.max(
        element.scrollWidth,
        element.clientWidth,
        ...Array.from(element.querySelectorAll<HTMLElement>(".overflow-x-auto")).map(
          (item) => item.scrollWidth,
        ),
      );
      const canvas = await html2canvas(element, {
        backgroundColor: computedBackground,
        logging: false,
        scale: Math.min(window.devicePixelRatio || 1.5, 2),
        useCORS: true,
        width: exportWidth,
        windowWidth: Math.max(exportWidth, document.documentElement.clientWidth),
        onclone: (clonedDocument) => {
          const clonedTarget = clonedDocument.getElementById(targetId);

          clonedTarget?.querySelectorAll<HTMLElement>("[data-pdf-ignore]").forEach((item) => {
            item.style.display = "none";
          });

          if (expandDetails) {
            clonedTarget?.querySelectorAll<HTMLDetailsElement>("details").forEach((details) => {
              details.open = true;
            });
          }

          if (topFiveOnly) {
            clonedTarget
              ?.querySelectorAll<HTMLElement>("[data-combined-pdf-omit]")
              .forEach((item) => {
                item.style.display = "none";
              });
          }

          const style = clonedDocument.createElement("style");
          style.textContent = `
            #${targetId} {
              background: ${computedBackground} !important;
              color: hsl(210 18% 94%) !important;
            }
            #${targetId} .overflow-x-auto {
              overflow: visible !important;
            }
            ${usePolishedLayout ? `
              #${targetId} {
                background: #ffffff !important;
                color: #0f172a !important;
                padding: 24px !important;
                border-radius: 0 !important;
              }
              #${targetId},
              #${targetId} [class*="bg-card"],
              #${targetId} [class*="bg-background"],
              #${targetId} [class*="bg-muted"] {
                background-color: #ffffff !important;
              }
              #${targetId} [class*="text-muted-foreground"] {
                color: #475569 !important;
              }
              #${targetId} [class*="text-foreground"],
              #${targetId} h1,
              #${targetId} h2,
              #${targetId} h3,
              #${targetId} h4,
              #${targetId} p,
              #${targetId} td {
                color: #0f172a !important;
              }
              #${targetId} th {
                background-color: #e2e8f0 !important;
                color: #0f172a !important;
              }
              #${targetId} table,
              #${targetId} tr,
              #${targetId} th,
              #${targetId} td,
              #${targetId} [class*="border"] {
                border-color: #cbd5e1 !important;
              }
              #${targetId} [class*="shadow"] {
                box-shadow: none !important;
              }
              #${targetId} .recharts-cartesian-grid line {
                stroke: #cbd5e1 !important;
              }
              #${targetId} .recharts-cartesian-axis-tick text,
              #${targetId} .recharts-legend-item-text {
                fill: #334155 !important;
                color: #334155 !important;
              }
            ` : ""}
          `;
          clonedDocument.head.appendChild(style);
        },
      });
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
        compress: true,
      });
      const margin = usePolishedLayout ? 10 : 8;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const printableWidth = pageWidth - margin * 2;
      const contentTop = usePolishedLayout ? 19 : margin;
      const contentBottom = usePolishedLayout ? 11 : margin;
      const printableHeight = pageHeight - contentTop - contentBottom;
      const captureScale = canvas.width / exportWidth;
      const sliceWidth = Math.min(
        canvas.width,
        Math.max(element.clientWidth, 1200) * captureScale,
      );
      const sliceHeight = sliceWidth * (printableHeight / printableWidth);
      let pageIndex = 0;

      for (let offsetX = 0; offsetX < canvas.width; offsetX += sliceWidth) {
        const currentWidth = Math.min(sliceWidth, canvas.width - offsetX);

        for (let offsetY = 0; offsetY < canvas.height; offsetY += sliceHeight) {
          const currentHeight = Math.min(sliceHeight, canvas.height - offsetY);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = Math.ceil(currentWidth);
          pageCanvas.height = Math.ceil(currentHeight);
          const context = pageCanvas.getContext("2d");

          if (!context) {
            throw new Error("The PDF canvas could not be created.");
          }

          context.drawImage(
            canvas,
            offsetX,
            offsetY,
            currentWidth,
            currentHeight,
            0,
            0,
            currentWidth,
            currentHeight,
          );

          if (pageIndex > 0) {
            pdf.addPage();
          }

          const renderedHeight = (currentHeight * printableWidth) / currentWidth;
          pdf.addImage(
            pageCanvas.toDataURL("image/png", 1),
            "PNG",
            margin,
            contentTop,
            printableWidth,
            renderedHeight,
          );
          pageIndex += 1;
        }
      }

      if (usePolishedLayout) {
        const totalPages = pdf.getNumberOfPages();
        const generatedDate = new Date().toLocaleDateString("en-GB");

        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
          pdf.setPage(pageNumber);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(15, 23, 42);
          pdf.text("AP - Action Map", margin, 9);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7.5);
          pdf.setTextColor(71, 85, 105);
          pdf.text(fileName, margin, 14);
          pdf.text(`Generated on ${generatedDate}`, pageWidth - margin, 9, { align: "right" });
          pdf.setDrawColor(203, 213, 225);
          pdf.line(margin, 16, pageWidth - margin, 16);
          pdf.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);
          pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 4, {
            align: "right",
          });
        }
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
        disabled={isExporting}
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
