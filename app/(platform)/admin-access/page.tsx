import { redirect } from "next/navigation";

import { unlockAdminAction } from "@/actions/admin-access";
import { hasAdminAccess } from "@/lib/admin-auth";

export default async function AdminAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await hasAdminAccess()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <section className="mx-auto max-w-md py-8 sm:py-16">
      <form action={unlockAdminAction} className="space-y-5 rounded-xl border bg-card p-6 shadow-xl">
        <div className="space-y-1">
          <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Acesso à administração</h1>
          <p className="text-sm text-muted-foreground">
            Introduza a palavra-passe de administração para aceder a esta área.
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            Palavra-passe de administração incorreta.
          </p>
        )}

        <label className="block space-y-1 text-sm">
          <span>Palavra-passe de administração</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </label>

        <button className="w-full rounded-md bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-500">
          Aceder à administração
        </button>
      </form>
    </section>
  );
}
