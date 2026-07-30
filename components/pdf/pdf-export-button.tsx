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
      const margin = 8;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;
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
            margin,
            printableWidth,
            renderedHeight,
          );
          pageIndex += 1;
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
