import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { workspaces } from "@/db/schema";
import {
  getAdminCookieName,
  getSessionCookieName,
  hashPassword,
  requireUser,
  verifyPassword,
} from "@/lib/auth";

const ADMIN_ACCESS_HOURS = 8;

function accessSignature(passwordHash: string, sessionToken: string, expiresAt: number) {
  return createHmac("sha256", passwordHash)
    .update(`${sessionToken}:${expiresAt}`)
    .digest("hex");
}

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

async function getAdminConfig(workspaceId: number) {
  const [config] = await db
    .select({
      passwordHash: workspaces.adminPasswordHash,
      mustChangePassword: workspaces.adminMustChangePassword,
    })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  return config ?? { passwordHash: null, mustChangePassword: false };
}

async function hasValidAdminCookie(passwordHash: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;
  const value = cookieStore.get(getAdminCookieName())?.value;
  if (!sessionToken || !value) return false;

  const [expiresAtText, signature] = value.split(":");
  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() || !signature) return false;

  return safeEqual(signature, accessSignature(passwordHash, sessionToken, expiresAt));
}

async function setAdminCookie(passwordHash: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;
  if (!sessionToken) return false;
  const expiresAt = Date.now() + ADMIN_ACCESS_HOURS * 60 * 60 * 1000;
  cookieStore.set(
    getAdminCookieName(),
    `${expiresAt}:${accessSignature(passwordHash, sessionToken, expiresAt)}`,
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

export async function hasAdminAccess() {
  const user = await requireUser();
  const config = await getAdminConfig(user.workspaceId);
  if (!config.passwordHash) return true;
  return hasValidAdminCookie(config.passwordHash);
}

export async function requireAdminAccess(options: { allowPasswordChange?: boolean } = {}) {
  const user = await requireUser();
  const config = await getAdminConfig(user.workspaceId);
  if (config.passwordHash) {
    if (!(await hasValidAdminCookie(config.passwordHash))) redirect("/admin-access");
    if (config.mustChangePassword && !options.allowPasswordChange) redirect("/admin-password");
  }
  return { ...user, adminPasswordConfigured: Boolean(config.passwordHash), adminMustChangePassword: config.mustChangePassword };
}

export async function getAdminWorkspaceId() {
  return (await requireAdminAccess()).workspaceId;
}

export async function unlockAdminAccess(password: string) {
  const user = await requireUser();
  const config = await getAdminConfig(user.workspaceId);
  if (!config.passwordHash) return { unlocked: true, mustChangePassword: false };
  if (!(await verifyPassword(password, config.passwordHash))) return { unlocked: false, mustChangePassword: false };
  if (!(await setAdminCookie(config.passwordHash))) return { unlocked: false, mustChangePassword: false };
  return { unlocked: true, mustChangePassword: config.mustChangePassword };
}

export async function changeAdminPassword(newPassword: string) {
  const user = await requireAdminAccess({ allowPasswordChange: true });
  const passwordHash = await hashPassword(newPassword);
  await db
    .update(workspaces)
    .set({ adminPasswordHash: passwordHash, adminMustChangePassword: false })
    .where(eq(workspaces.id, user.workspaceId));
  await setAdminCookie(passwordHash);
}
