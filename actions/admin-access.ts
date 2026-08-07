"use server";

import { redirect } from "next/navigation";

import { unlockAdminAccess } from "@/lib/admin-auth";

export async function unlockAdminAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!(await unlockAdminAccess(password))) {
    redirect("/admin-access?error=invalid");
  }
  redirect("/admin");
}
