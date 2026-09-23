"use server";

import { redirect } from "next/navigation";

import { changeAdminPassword, unlockAdminAccess } from "@/lib/admin-auth";

export async function unlockAdminAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const result = await unlockAdminAccess(password);
  if (!result.unlocked) {
    redirect("/admin-access?error=invalid");
  }
  if (result.mustChangePassword) redirect("/admin-password");
  redirect("/admin");
}

export async function changeAdminPasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (password.length < 10 || password !== confirmation) redirect("/admin-password?error=password");
  await changeAdminPassword(password);
  redirect("/admin?adminPasswordChanged=1");
}
