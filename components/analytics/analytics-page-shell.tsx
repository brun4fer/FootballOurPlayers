"use client";

import * as React from "react";
import { FileDown, Loader2, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AnalyticsFilterItem = {
  label: string;
  value?: string | number | Array<string | number> | null;
};

type AnalyticsPageShellProps = {
  title: string;
  description?: string;
  filters?: AnalyticsFilterItem[];
  searchQuery?: string;
  searchPlaceholder?: string;
  exportFileName?: string;
  children: React.ReactNode;
};

function renderFilterValue(value: AnalyticsFilterItem["value"]) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Todos";
  }

  if (value === undefined || value === null || value === "") {
    return "Todos";
  }

  return String(value);
}

function buildPdfFilename(value: string) {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  const stamp = new Date().toISOString().slice(0, 10);

  return `${base || "estatisticas"}-${stamp}.pdf`;
}

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export function AnalyticsPageShell({
  title,
  description,
  filters = [],
  searchQuery = "",
  searchPlaceholder = "Pesquisar por jogador, equipa, jornada, jogo ou metrica",
  exportFileName,
  children,
}: AnalyticsPageShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearchQuery = searchParams.get("q") ?? searchQuery;
  const [searchValue, setSearchValue] = React.useState(currentSearchQuery);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState("");
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSearchValue(currentSearchQuery);
  }, [currentSearchQuery]);

  function updateSearch(nextValue: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    const trimmedValue = nextValue.trim();

    if (trimmedValue) {
      nextParams.set("q", trimmedValue);
    } else {
      nextParams.delete("q");
    }

    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  async function handleExport() {
    const element = contentRef.current;

    if (!element) {
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
      const canvas = await html2canvas(element, {
        backgroundColor: computedBackground,
        logging: false,
        scale: Math.min(window.devicePixelRatio || 1.5, 2),
        useCORS: true,
        windowWidth: Math.max(element.scrollWidth, document.documentElement.clientWidth),
        onclone: (clonedDocument) => {
          const style = clonedDocument.createElement("style");
          style.textContent = `
            [data-export-root] {
              background: ${computedBackground} !important;
              color: hsl(210 18% 94%) !important;
              padding: 4px !important;
            }
            [data-export-root] .overflow-x-auto {
              overflow: visible !important;
            }
            [data-export-root] svg {
              max-width: none !important;
            }
          `;
          clonedDocument.head.appendChild(style);
        },
      });
      const imageData = canvas.toDataURL("image/png", 1);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });
      const margin = 8;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const printableHeight = pageHeight - margin * 2;

      let remainingHeight = imageHeight;
      let position = margin;

      pdf.addImage(imageData, "PNG", margin, position, imageWidth, imageHeight);
      remainingHeight -= printableHeight;

      while (remainingHeight > 0) {
        position = margin - (imageHeight - remainingHeight);
        pdf.addPage();
        pdf.addImage(imageData, "PNG", margin, position, imageWidth, imageHeight);
        remainingHeight -= printableHeight;
      }

      pdf.save(buildPdfFilename(exportFileName ?? title));
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel gerar o PDF. Tente novamente.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  const visibleFilters = [
    ...filters,
    ...(currentSearchQuery ? [{ label: "Pesquisa", value: currentSearchQuery }] : []),
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-[var(--font-heading)] text-2xl font-semibold">{title}</h1>
          {description ? (
            <p className="max-w-4xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            {isExporting ? "A gerar PDF" : "Gerar PDF"}
          </Button>
          {exportError ? (
            <p className="max-w-xs text-right text-xs text-red-300">{exportError}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <form
          className="flex flex-col gap-2 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            updateSearch(searchValue);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="pl-9"
              placeholder={searchPlaceholder}
              aria-label="Pesquisar estatisticas"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Pesquisar
            </Button>
            {currentSearchQuery ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Limpar pesquisa"
                onClick={() => {
                  setSearchValue("");
                  updateSearch("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      <div ref={contentRef} data-export-root className="space-y-6">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Relatorio
              </p>
              <h2 className="font-[var(--font-heading)] text-xl font-semibold">{title}</h2>
              {description ? (
                <p className="max-w-4xl text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Gerado em {new Date().toLocaleDateString("pt-PT")}
            </p>
          </div>

          {visibleFilters.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {visibleFilters.map((filter) => (
                <div
                  key={`${filter.label}-${renderFilterValue(filter.value)}`}
                  className={cn(
                    "rounded-lg border border-border/50 bg-background/35 px-3 py-2",
                    "min-w-0",
                  )}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {filter.label}
                  </p>
                  <p className="mt-1 break-words text-sm font-medium text-foreground">
                    {renderFilterValue(filter.value)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {children}
      </div>
    </section>
  );
}
