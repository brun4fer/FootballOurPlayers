"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function loginAction(formData: FormData) {
  const username = text(formData.get("username"));
  const password = text(formData.get("password"));
  const rows = await db.select().from(users).where(sql`lower(${users.username}) = lower(${username})`).limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }
  await createSession(user.id);
  redirect(user.mustChangePassword ? "/account" : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function updateCredentialsAction(formData: FormData) {
  const current = await requireUser({ allowPasswordChange: true });
  const username = text(formData.get("username"));
  const currentPassword = text(formData.get("currentPassword"));
  const newPassword = text(formData.get("newPassword"));
  const confirmation = text(formData.get("confirmPassword"));
  if (!/^[\p{L}\p{N}_.-]{3,40}$/u.test(username)) redirect("/account?error=username");
  if (newPassword.length < 10 || newPassword !== confirmation) redirect("/account?error=password");
  const existing = await db.select().from(users).where(eq(users.id, current.id)).limit(1);
  if (!existing[0] || !(await verifyPassword(currentPassword, existing[0].passwordHash))) {
    redirect("/account?error=current");
  }
  const duplicate = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.username}) = lower(${username}) and ${users.id} <> ${current.id}`)
    .limit(1);
  if (duplicate.length) redirect("/account?error=taken");
  await db
    .update(users)
    .set({ username, passwordHash: await hashPassword(newPassword), mustChangePassword: false })
    .where(eq(users.id, current.id));
  await db.delete(sessions).where(sql`${sessions.userId} = ${current.id} and ${sessions.tokenHash} <> ''`);
  await createSession(current.id);
  redirect("/account?saved=1");
}
