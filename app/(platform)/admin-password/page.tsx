import { changeAdminPasswordAction } from "@/actions/admin-access";
import { requireAdminAccess } from "@/lib/admin-auth";

export default async function AdminPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireAdminAccess({ allowPasswordChange: true });
  const { error } = await searchParams;

  return (
    <section className="mx-auto max-w-md py-8 sm:py-16">
      <form action={changeAdminPasswordAction} className="space-y-5 rounded-xl border bg-card p-6 shadow-xl">
        <div className="space-y-1">
          <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Alterar palavra-passe da Administração</h1>
          <p className="text-sm text-muted-foreground">
            {user.adminMustChangePassword
              ? "A palavra-passe atual é temporária. Escolha uma nova antes de continuar."
              : "Defina uma nova palavra-passe para proteger a área de Administração."}
          </p>
        </div>
        {error ? <p className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">A palavra-passe deve ter pelo menos 10 caracteres e as duas entradas devem coincidir.</p> : null}
        <label className="block space-y-1 text-sm">
          <span>Nova palavra-passe</span>
          <input name="password" type="password" minLength={10} autoComplete="new-password" required autoFocus className="w-full rounded-md border bg-background px-3 py-2" />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Confirmar nova palavra-passe</span>
          <input name="confirmation" type="password" minLength={10} autoComplete="new-password" required className="w-full rounded-md border bg-background px-3 py-2" />
        </label>
        <button className="w-full rounded-md bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-500">Guardar nova palavra-passe</button>
      </form>
    </section>
  );
}
