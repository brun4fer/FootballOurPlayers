import { VideoAnalysisLinkPanel } from "@/components/integrations/video-analysis-link-panel";

export default function IntegrationsPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Control which external analysis workspace can send data to this account.</p>
      </div>
      <VideoAnalysisLinkPanel />
    </section>
  );
}
