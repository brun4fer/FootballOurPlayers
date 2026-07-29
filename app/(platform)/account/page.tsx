import { updateCredentialsAction } from "@/actions/auth";
import { requireUser } from "@/lib/auth";

const errors: Record<string, string> = {
  username: "O username deve ter entre 3 e 40 caracteres.",
  password: "A nova palavra-passe deve ter pelo menos 10 caracteres e coincidir.",
  current: "The current password is incorrect.",
  taken: "That username is already in use.",
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const user = await requireUser({ allowPasswordChange: true });
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Credenciais</h1>
        <p className="text-sm text-muted-foreground">Workspace: {user.workspaceName}</p>
      </div>
      {user.mustChangePassword && <p className="rounded-md bg-amber-500/15 p-3 text-sm text-amber-200">You must change your temporary password before continuing.</p>}
      {params.error && <p className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errors[params.error] ?? "Unable to save changes."}</p>}
      {params.saved && <p className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-200">Credenciais atualizadas.</p>}
      <form action={updateCredentialsAction} className="space-y-4 rounded-xl border bg-card p-6">
        <label className="block space-y-1 text-sm"><span>Username</span><input name="username" defaultValue={user.username} required className="w-full rounded-md border bg-background px-3 py-2" /></label>
        <label className="block space-y-1 text-sm"><span>Palavra-passe atual</span><input name="currentPassword" type="password" required className="w-full rounded-md border bg-background px-3 py-2" /></label>
        <label className="block space-y-1 text-sm"><span>Nova palavra-passe</span><input name="newPassword" type="password" minLength={10} required className="w-full rounded-md border bg-background px-3 py-2" /></label>
        <label className="block space-y-1 text-sm"><span>Confirmar nova palavra-passe</span><input name="confirmPassword" type="password" minLength={10} required className="w-full rounded-md border bg-background px-3 py-2" /></label>
        <button className="rounded-md bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-500">Guardar credenciais</button>
      </form>
    </div>
  );
}
