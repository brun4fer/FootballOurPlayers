import { randomBytes } from "node:crypto";

import { and, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { videoAnalysisConnections, videoAnalysisLinkTokens, workspaces } from "@/db/schema";
import { integrationTokenHash } from "@/lib/video-analysis-connection";

const claimSchema = z.object({
  token: z.string().trim().min(20).max(200),
  sourceWorkspaceId: z.string().trim().min(1).max(191),
  sourceWorkspaceName: z.string().trim().min(1).max(120),
});

export async function POST(request: Request) {
  try {
    const parsed = claimSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid linking request." }, { status: 400 });

    const now = new Date().toISOString();
    const [claimed] = await db
      .update(videoAnalysisLinkTokens)
      .set({ usedAt: now })
      .where(and(
        eq(videoAnalysisLinkTokens.tokenHash, integrationTokenHash(parsed.data.token)),
        isNull(videoAnalysisLinkTokens.usedAt),
        gt(videoAnalysisLinkTokens.expiresAt, now),
      ))
      .returning({ workspaceId: videoAnalysisLinkTokens.workspaceId });
    if (!claimed) {
      return NextResponse.json({ error: "This linking code is invalid, expired or has already been used." }, { status: 400 });
    }

    const destination = await db.query.workspaces.findFirst({ where: eq(workspaces.id, claimed.workspaceId) });
    if (!destination) return NextResponse.json({ error: "Destination workspace was not found." }, { status: 404 });

    const accessToken = randomBytes(32).toString("base64url");
    const [connection] = await db
      .insert(videoAnalysisConnections)
      .values({
        workspaceId: destination.id,
        externalWorkspaceId: parsed.data.sourceWorkspaceId,
        externalWorkspaceName: parsed.data.sourceWorkspaceName,
        tokenHash: integrationTokenHash(accessToken),
      })
      .onConflictDoUpdate({
        target: videoAnalysisConnections.workspaceId,
        set: {
          externalWorkspaceId: parsed.data.sourceWorkspaceId,
          externalWorkspaceName: parsed.data.sourceWorkspaceName,
          tokenHash: integrationTokenHash(accessToken),
          createdAt: now,
          lastUsedAt: null,
          revokedAt: null,
        },
      })
      .returning({ id: videoAnalysisConnections.id });

    return NextResponse.json({
      connectionId: connection.id,
      accessToken,
      destinationWorkspace: { id: String(destination.id), name: destination.name },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: error instanceof Error && error.message.includes("external_workspace_id")
        ? "This VideoAnaliseJogadores workspace is already linked to another account."
        : "The applications could not be linked.",
    }, { status: 409 });
  }
}
