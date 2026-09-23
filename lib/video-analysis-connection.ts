import "server-only";

import { createHash } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { videoAnalysisConnections } from "@/db/schema";

export function integrationTokenHash(token: string) {
  return createHash("sha256").update(token.trim()).digest("hex");
}

export async function authenticateVideoAnalysisConnection(request: Request, sourceWorkspaceId?: string) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const connectionId = request.headers.get("x-integration-connection")?.trim() || "";
  if (!token || !connectionId) throw new Response("Invalid integration credential.", { status: 401 });

  const connection = await db.query.videoAnalysisConnections.findFirst({
    where: and(
      eq(videoAnalysisConnections.id, connectionId),
      eq(videoAnalysisConnections.tokenHash, integrationTokenHash(token)),
      isNull(videoAnalysisConnections.revokedAt),
    ),
  });
  if (!connection) throw new Response("This connection is invalid or has been revoked.", { status: 401 });
  if (sourceWorkspaceId && connection.externalWorkspaceId !== sourceWorkspaceId) {
    throw new Response("The source workspace does not match this connection.", { status: 403 });
  }

  await db
    .update(videoAnalysisConnections)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(videoAnalysisConnections.id, connection.id));
  return connection;
}
