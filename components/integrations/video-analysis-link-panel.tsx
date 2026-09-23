"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Link2, Loader2, Unlink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Status = {
  connected: boolean;
  connection: null | { sourceWorkspaceName: string; connectedAt: string; lastUsedAt: string | null };
};

type GeneratedCode = { code: string; expiresAt: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "The request could not be completed.");
  return body as T;
}

export function VideoAnalysisLinkPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [generated, setGenerated] = useState<GeneratedCode | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    request<Status>("/api/integrations/video-analysis/link").then(setStatus).catch((error: Error) => setMessage(error.message));
  }, []);

  async function createCode() {
    setBusy(true);
    setMessage(null);
    try {
      setGenerated(await request<GeneratedCode>("/api/integrations/video-analysis/link", { method: "POST" }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create a linking code.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    if (!generated) return;
    await navigator.clipboard.writeText(generated.code);
    setMessage("Linking code copied. Paste it in VideoAnaliseJogadores.");
  }

  async function revoke() {
    if (!confirm("Disconnect VideoAnaliseJogadores? Previously imported data will be kept.")) return;
    setBusy(true);
    setMessage(null);
    try {
      const next = await request<Status>("/api/integrations/video-analysis/link", { method: "DELETE" });
      setStatus(next);
      setGenerated(null);
      setMessage("Connection revoked. Previously imported data was kept.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not revoke the connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-cyan-300" />VideoAnaliseJogadores</CardTitle>
            <CardDescription className="mt-2 max-w-2xl">
              Create a temporary, single-use code here and paste it into VideoAnaliseJogadores. No shared usernames or global synchronization tokens are used.
            </CardDescription>
          </div>
          {status?.connected ? <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />Connected</span> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.connected && status.connection ? (
          <div className="rounded-lg border border-border bg-background/50 p-4 text-sm">
            <p><span className="text-muted-foreground">Video workspace:</span> <strong>{status.connection.sourceWorkspaceName}</strong></p>
            <p className="mt-1 text-xs text-muted-foreground">Connected {new Date(status.connection.connectedAt).toLocaleString()}{status.connection.lastUsedAt ? ` · Last synchronization ${new Date(status.connection.lastUsedAt).toLocaleString()}` : ""}</p>
            <Button className="mt-4" variant="danger" disabled={busy} onClick={() => void revoke()}><Unlink className="mr-2 h-4 w-4" />Disconnect</Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-background/50 p-4">
            <p className="text-sm font-medium">1. Generate a code · 2. Open Structure in VideoAnaliseJogadores · 3. Paste and confirm</p>
            <p className="mt-1 text-xs text-muted-foreground">The code expires after 30 minutes and can only be used once.</p>
            {generated ? (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Input readOnly value={generated.code} className="font-mono text-xs" />
                <Button onClick={() => void copyCode()}><Copy className="mr-2 h-4 w-4" />Copy code</Button>
              </div>
            ) : (
              <Button className="mt-4" disabled={busy} onClick={() => void createCode()}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}Create linking code</Button>
            )}
          </div>
        )}
        {message ? <p className="text-sm text-cyan-200">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
