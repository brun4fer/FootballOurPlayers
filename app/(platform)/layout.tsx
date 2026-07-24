import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { APP_NAME } from "@/lib/app-config";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export const dynamic = "force-dynamic";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser({ allowPasswordChange: true });
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-border/50 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/favicon.ico"
              alt=""
              aria-hidden="true"
              className="h-9 w-9 shrink-0 rounded-md border border-border/70 bg-background object-contain"
            />
            <div className="min-w-0">
              <p className="truncate font-[var(--font-heading)] text-lg tracking-wide">{APP_NAME}</p>
              <p className="text-xs text-muted-foreground">Football analytics platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/account" className="text-right text-xs hover:text-cyan-300">
              <span className="block font-medium">{user.username}</span>
              <span className="block text-muted-foreground">{user.workspaceName}</span>
            </a>
            <ThemeToggle />
            <form action={logoutAction}>
              <button className="rounded-md border px-3 py-2 text-xs hover:bg-accent">Sair</button>
            </form>
          </div>
        </header>
        <div className="animate-fade-in px-4 py-5 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
