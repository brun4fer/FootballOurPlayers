import { TeamEvolutionCharts } from "@/components/dashboard/team-evolution-charts";
import { TeamOverviewStats } from "@/components/dashboard/team-overview-stats";
import { TeamAnalyticsFilters } from "@/components/team-analytics/team-analytics-filters";
import { TeamEmptyStateCard } from "@/components/team-analytics/team-empty-state-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyzedTeamMatchAggregates } from "@/lib/data";
import {
  aggregateTeamDashboardTotals,
  buildTeamEvolutionCharts,
  buildTeamOverviewStats,
} from "@/lib/teamDashboardMetrics";
import {
  filterValidIds,
  getTeamAnalyticsBaseData,
  parseIdList,
  type TeamAnalyticsSearchParams,
} from "@/lib/teamAnalytics";

type TeamEvolutionPageProps = {
  searchParams?: Promise<TeamAnalyticsSearchParams>;
};

export default async function TeamEvolutionPage({
  searchParams,
}: TeamEvolutionPageProps) {
  const params = (await searchParams) ?? {};
  const baseData = await getTeamAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Evolucao</h1>
        <TeamEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para acompanhar a evolucao da equipa ao longo das jornadas."
        />
      </section>
    );
  }

  const selectedMatchIds = filterValidIds(parseIdList(params.matchIds), baseData.matchIdSet);
  const hasSingleExplicitSelection = selectedMatchIds.length === 1;
  const scopedMatchIds = selectedMatchIds.length > 0 ? selectedMatchIds : undefined;

  const matchAggregates = await getAnalyzedTeamMatchAggregates(
    baseData.selectedCompetitionId,
    scopedMatchIds,
  );

  if (matchAggregates.length === 0) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Evolucao</h1>
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedMatchIds={selectedMatchIds}
          matchMode="multiple"
          description="Selecione varias jornadas para analisar a evolucao temporal da equipa."
        />
        <TeamEmptyStateCard
          title="Sem dados para o filtro atual"
          description="Ajuste a competicao ou a selecao de jornadas para gerar os graficos evolutivos."
        />
      </section>
    );
  }

  if (hasSingleExplicitSelection || matchAggregates.length < 2) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Evolucao</h1>
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedMatchIds={selectedMatchIds}
          matchMode="multiple"
          description="Selecione varias jornadas para analisar a evolucao temporal da equipa."
        />
        <TeamEmptyStateCard
          title="Jornadas insuficientes para evolucao"
          description="Selecione pelo menos duas jornadas, ou deixe a competicao completa para visualizar os graficos evolutivos."
        />
      </section>
    );
  }

  const totals = aggregateTeamDashboardTotals(matchAggregates);
  const overviewStats = buildTeamOverviewStats(matchAggregates, totals);
  const evolutionCharts = buildTeamEvolutionCharts(matchAggregates);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Evolucao</h1>
        <p className="text-sm text-muted-foreground">
          Graficos por jornada com media, tendencia e destaque para melhores e piores momentos da equipa.
        </p>
      </div>

      <TeamAnalyticsFilters
        competitions={baseData.competitions}
        matches={baseData.matchOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedMatchIds={selectedMatchIds}
        matchMode="multiple"
        description="Vista de evolucao por jornada. Se nao selecionar jornadas, a pagina usa toda a competicao."
      />

      <TeamOverviewStats stats={overviewStats} />

      <Card>
        <CardHeader>
          <CardTitle>Graficos de Evolucao</CardTitle>
          <CardDescription>
            Evolucao por jornada do Feirense nas metricas chave selecionadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamEvolutionCharts charts={evolutionCharts} />
        </CardContent>
      </Card>
    </section>
  );
}
