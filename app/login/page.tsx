import { redirect } from "next/navigation";

import { loginAction } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect("/");
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form action={loginAction} className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">Introduza as suas credenciais.</p>
        </div>
        {error && <p className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">Username ou palavra-passe incorretos.</p>}
        <label className="block space-y-1 text-sm">
          <span>Username</span>
          <input name="username" autoComplete="username" required className="w-full rounded-md border bg-background px-3 py-2" />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Palavra-passe</span>
          <input name="password" type="password" autoComplete="current-password" required className="w-full rounded-md border bg-background px-3 py-2" />
        </label>
        <button className="w-full rounded-md bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-500">Entrar</button>
      </form>
    </main>
  );
}
