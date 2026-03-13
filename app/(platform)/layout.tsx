import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const dynamic = "force-dynamic";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-border/50 px-4 py-3 sm:px-6">
          <div>
            <p className="font-[var(--font-heading)] text-lg tracking-wide">Análise Tática</p>
            <p className="text-xs text-muted-foreground">
              Insights de futebol com foco em ciano e magenta
            </p>
          </div>
          <ThemeToggle />
        </header>
        <div className="animate-fade-in px-4 py-5 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
