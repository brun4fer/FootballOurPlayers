import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getAdminCookieName,
  getSessionCookieName,
  requireUser,
  verifyPassword,
} from "@/lib/auth";

const PROTECTED_WORKSPACE_SLUG = "paulo";
const ADMIN_ACCESS_HOURS = 8;

// Scrypt verifier for the administration password. The password itself is never
// sent to the browser or stored in the source code as plain text.
const PAULO_ADMIN_PASSWORD_HASH =
  "scrypt:08c302e09979e2a9aaec20186056c5af:24d884e5e56357a345324c97249afd73ca1c3dd8188c7743849f6aaa178516f10c399f049976c7e7ec23f1b510582aba2bf90f2c948143f4233d8a38ddbdbd30";

function accessSignature(sessionToken: string, expiresAt: number) {
  return createHmac("sha256", PAULO_ADMIN_PASSWORD_HASH)
    .update(`${sessionToken}:${expiresAt}`)
    .digest("hex");
}

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

async function hasValidAdminCookie() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;
  const value = cookieStore.get(getAdminCookieName())?.value;
  if (!sessionToken || !value) return false;

  const [expiresAtText, signature] = value.split(":");
  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() || !signature) return false;

  return safeEqual(signature, accessSignature(sessionToken, expiresAt));
}

export async function hasAdminAccess() {
  const user = await requireUser();
  if (user.workspaceSlug !== PROTECTED_WORKSPACE_SLUG) return true;
  return hasValidAdminCookie();
}

export async function requireAdminAccess() {
  const user = await requireUser();
  if (user.workspaceSlug === PROTECTED_WORKSPACE_SLUG && !(await hasValidAdminCookie())) {
    redirect("/admin-access");
  }
  return user;
}

export async function getAdminWorkspaceId() {
  return (await requireAdminAccess()).workspaceId;
}

export async function unlockAdminAccess(password: string) {
  const user = await requireUser();
  if (user.workspaceSlug !== PROTECTED_WORKSPACE_SLUG) return true;
  if (!(await verifyPassword(password, PAULO_ADMIN_PASSWORD_HASH))) return false;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;
  if (!sessionToken) return false;

  const expiresAt = Date.now() + ADMIN_ACCESS_HOURS * 60 * 60 * 1000;
  cookieStore.set(
    getAdminCookieName(),
    `${expiresAt}:${accessSignature(sessionToken, expiresAt)}`,
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(expiresAt),
    },
  );
  return true;
}
