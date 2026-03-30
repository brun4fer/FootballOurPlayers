import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerComparisonSummaryTable } from "@/components/player-analytics/player-comparison-summary-table";
import { PlayerCompetitionTotalsTable } from "@/components/player-analytics/player-competition-totals-table";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerRankingInsights } from "@/components/player-analytics/player-ranking-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompetitionPlayerTotals } from "@/lib/data";
import { toOutfieldTotalsFromAggregate } from "@/lib/dashboardMetrics";
import {
  buildComparisonSummaryRows,
  getPlayerAnalyticsBaseData,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";

type TotalCompetitionPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function TotalCompetitionPage({
  searchParams,
}: TotalCompetitionPageProps) {
  const params = (await searchParams) ?? {};
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Totais por Competicao
        </h1>
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para consultar os totais agregados de jogadores."
        />
      </section>
    );
  }

  const competitionPlayerTotals = await getCompetitionPlayerTotals(baseData.selectedCompetitionId);
  const comparisonScopes = competitionPlayerTotals.map((row) => ({
    label: String(row.playerName ?? "-"),
    totals: toOutfieldTotalsFromAggregate(row as Record<string, unknown>),
  }));
  const comparisonRows = buildComparisonSummaryRows(comparisonScopes);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Totais por Competicao
        </h1>
        <p className="text-sm text-muted-foreground">
          Visao agregada de todos os jogadores na competicao selecionada, sem filtro de
          jornada.
        </p>
      </div>

      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        description="Analise global do rendimento dos jogadores dentro da competicao."
      />

      <Card>
        <CardHeader>
          <CardTitle>Ranking Comparativo</CardTitle>
          <CardDescription>
            Charts agregados foram removidos nesta vista para manter legibilidade com muitos jogadores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerComparisonSummaryTable rows={comparisonRows} />
        </CardContent>
      </Card>

      <PlayerRankingInsights rows={comparisonRows} />

      <Card>
        <CardHeader>
          <CardTitle>Totais Agregados de Jogadores</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerCompetitionTotalsTable rows={competitionPlayerTotals} />
        </CardContent>
      </Card>
    </section>
  );
}
