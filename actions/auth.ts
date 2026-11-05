"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { getAnalyticsDestination } from "@/lib/analytics-navigation";
import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function accountDestination(error: string, destination: string) {
  const query = new URLSearchParams({ error });
  if (destination !== "/") query.set("next", destination);
  return `/account?${query.toString()}`;
}

export async function loginAction(formData: FormData) {
  const username = text(formData.get("username"));
  const password = text(formData.get("password"));
  const destination = getAnalyticsDestination(formData.get("next"));
  const rows = await db.select().from(users).where(sql`lower(${users.username}) = lower(${username})`).limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    const query = new URLSearchParams({ error: "invalid", next: destination });
    redirect(`/login?${query.toString()}`);
  }
  await createSession(user.id);
  if (user.mustChangePassword) {
    const query = new URLSearchParams();
    if (destination !== "/") query.set("next", destination);
    redirect(query.size ? `/account?${query.toString()}` : "/account");
  }
  redirect(destination);
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function updateCredentialsAction(formData: FormData) {
  const current = await requireUser({ allowPasswordChange: true });
  const destination = getAnalyticsDestination(formData.get("next"));
  const username = text(formData.get("username"));
  const currentPassword = text(formData.get("currentPassword"));
  const newPassword = text(formData.get("newPassword"));
  const confirmation = text(formData.get("confirmPassword"));
  if (!/^[\p{L}\p{N}_.-]{3,40}$/u.test(username)) {
    redirect(accountDestination("username", destination));
  }
  if (newPassword.length < 10 || newPassword !== confirmation) {
    redirect(accountDestination("password", destination));
  }
  const existing = await db.select().from(users).where(eq(users.id, current.id)).limit(1);
  if (!existing[0] || !(await verifyPassword(currentPassword, existing[0].passwordHash))) {
    redirect(accountDestination("current", destination));
  }
  const duplicate = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.username}) = lower(${username}) and ${users.id} <> ${current.id}`)
    .limit(1);
  if (duplicate.length) redirect(accountDestination("taken", destination));
  await db
    .update(users)
    .set({ username, passwordHash: await hashPassword(newPassword), mustChangePassword: false })
    .where(eq(users.id, current.id));
  await db.delete(sessions).where(sql`${sessions.userId} = ${current.id} and ${sessions.tokenHash} <> ''`);
  await createSession(current.id);
  redirect(destination === "/" ? "/account?saved=1" : destination);
}
