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
  resolveSingleId,
  type TeamAnalyticsSearchParams,
} from "@/lib/teamAnalytics";

type SingleMatchdayPageProps = {
  searchParams?: Promise<TeamAnalyticsSearchParams>;
};

export default async function TeamSingleMatchdayPage({
  searchParams,
}: SingleMatchdayPageProps) {
  const params = (await searchParams) ?? {};
  const baseData = await getTeamAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Por Jornada</h1>
        <TeamEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para consultar o detalhe da equipa por jornada."
        />
      </section>
    );
  }

  const selectedMatchId = resolveSingleId(
    params.matchId,
    baseData.matchIdSet,
    baseData.matchOptions[0]?.id,
  );

  if (!selectedMatchId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Por Jornada</h1>
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          matchMode="single"
          description="Vista isolada de uma unica jornada da equipa."
        />
        <TeamEmptyStateCard
          title="Selecao incompleta"
          description="Escolha uma jornada para visualizar as estatisticas da equipa nesse jogo."
        />
      </section>
    );
  }

  const matchAggregates = await getAnalyzedTeamMatchAggregates(baseData.selectedCompetitionId, [
    selectedMatchId,
  ]);

  if (matchAggregates.length === 0) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Por Jornada</h1>
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedMatchId={selectedMatchId}
          matchMode="single"
          description="Vista isolada de uma unica jornada da equipa."
        />
        <TeamEmptyStateCard
          title="Sem registo para esta jornada"
          description="Nao existem dados registados para a equipa nesta jornada."
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
  const selectedMatch = baseData.matchOptions.find((match) => match.id === selectedMatchId);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Por Jornada</h1>
        <p className="text-sm text-muted-foreground">
          Foco na performance da equipa numa unica jornada.
        </p>
      </div>

      <TeamAnalyticsFilters
        competitions={baseData.competitions}
        matches={baseData.matchOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedMatchId={selectedMatchId}
        matchMode="single"
        description="A jornada e obrigatoria nesta vista."
      />

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Jornada</CardTitle>
          <CardDescription>
            Jornada {selectedMatch?.matchdayNumber ?? "-"} vs {selectedMatch?.opponentTeamName ?? "-"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamOverviewStats stats={overviewStats} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totais da Jornada</CardTitle>
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
