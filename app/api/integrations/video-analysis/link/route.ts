import { randomBytes } from "node:crypto";

import { and, eq, isNotNull, lt, or } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { videoAnalysisConnections, videoAnalysisLinkTokens } from "@/db/schema";
import { requireAdminAccess } from "@/lib/admin-auth";
import { integrationTokenHash } from "@/lib/video-analysis-connection";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireAdminAccess();
  const connection = await db.query.videoAnalysisConnections.findFirst({
    where: eq(videoAnalysisConnections.workspaceId, user.workspaceId),
  });
  return NextResponse.json({
    connected: Boolean(connection && !connection.revokedAt),
    connection: connection && !connection.revokedAt ? {
      sourceWorkspaceName: connection.externalWorkspaceName,
      connectedAt: connection.createdAt,
      lastUsedAt: connection.lastUsedAt,
    } : null,
  });
}

export async function POST(request: Request) {
  const user = await requireAdminAccess();
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const origin = new URL(request.url).origin;

  await db.delete(videoAnalysisLinkTokens).where(and(
    eq(videoAnalysisLinkTokens.workspaceId, user.workspaceId),
    or(lt(videoAnalysisLinkTokens.expiresAt, new Date().toISOString()), isNotNull(videoAnalysisLinkTokens.usedAt)),
  ));
  await db.insert(videoAnalysisLinkTokens).values({
    workspaceId: user.workspaceId,
    tokenHash: integrationTokenHash(token),
    expiresAt: expiresAt.toISOString(),
  });

  const code = Buffer.from(JSON.stringify({ version: 1, origin, token }), "utf8").toString("base64url");
  return NextResponse.json({ code, expiresAt: expiresAt.toISOString() }, { status: 201 });
}

export async function DELETE() {
  const user = await requireAdminAccess();
  await db.delete(videoAnalysisConnections).where(eq(videoAnalysisConnections.workspaceId, user.workspaceId));
  return NextResponse.json({ connected: false, connection: null });
}
