import { TeamAnalyticsTable } from "@/components/dashboard/team-analytics-table";
import { TeamNumericTable } from "@/components/dashboard/team-numeric-table";
import { TeamOverviewStats } from "@/components/dashboard/team-overview-stats";
import { TeamPercentageTable } from "@/components/dashboard/team-percentage-table";
import { TeamAnalyticsFilters } from "@/components/team-analytics/team-analytics-filters";
import { TeamEmptyStateCard } from "@/components/team-analytics/team-empty-state-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyzedTeamMatchAggregates } from "@/lib/data";
import {
  aggregateTeamDashboardTotals,
  buildGoalkeeperSummary,
  buildTeamAnalyticsTableRows,
  buildTeamNumericRows,
  buildTeamOverviewStats,
  buildTeamPercentageRows,
} from "@/lib/teamDashboardMetrics";
import {
  getTeamAnalyticsBaseData,
  type TeamAnalyticsSearchParams,
} from "@/lib/teamAnalytics";

type TotalAllMatchdaysPageProps = {
  searchParams?: Promise<TeamAnalyticsSearchParams>;
};

export default async function TeamTotalAllMatchdaysPage({
  searchParams,
}: TotalAllMatchdaysPageProps) {
  const params = (await searchParams) ?? {};
  const baseData = await getTeamAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Totais (Todas as Jornadas)
        </h1>
        <TeamEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para consultar os totais agregados da equipa."
        />
      </section>
    );
  }

  const matchAggregates = await getAnalyzedTeamMatchAggregates(baseData.selectedCompetitionId);

  if (matchAggregates.length === 0) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Totais (Todas as Jornadas)
        </h1>
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          description="Vista consolidada da equipa em todas as jornadas da competicao."
        />
        <TeamEmptyStateCard
          title="Sem dados para esta competicao"
          description="Ainda nao existem jornadas com registo para apresentar totais agregados."
        />
      </section>
    );
  }

  const totals = aggregateTeamDashboardTotals(matchAggregates);
  const overviewStats = buildTeamOverviewStats(matchAggregates, totals);
  const analyticsRows = buildTeamAnalyticsTableRows(totals);
  const percentageRows = buildTeamPercentageRows(totals);
  const numericRows = buildTeamNumericRows(totals);
  const goalkeeperSummary = buildGoalkeeperSummary(totals);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Totais (Todas as Jornadas)
        </h1>
        <p className="text-sm text-muted-foreground">
          Leitura consolidada da equipa ao longo de toda a competicao, sem filtro por jornada.
        </p>
      </div>

      <TeamAnalyticsFilters
        competitions={baseData.competitions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        description="Sem filtro de jornada. Esta vista resume toda a competicao."
      />

      <TeamOverviewStats stats={overviewStats} />

      <Card>
        <CardHeader>
          <CardTitle>Totais Estruturados</CardTitle>
          <CardDescription>
            Totais, percentagens e volume por 90 em {matchAggregates.length} jornada(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamAnalyticsTable rows={analyticsRows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acoes Percentuais</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamPercentageTable rows={percentageRows} goalkeeper={goalkeeperSummary} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acoes Numericas</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamNumericTable rows={numericRows} />
        </CardContent>
      </Card>
    </section>
  );
}
