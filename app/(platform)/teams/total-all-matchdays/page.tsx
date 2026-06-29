import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { TeamAnalyticsTable } from "@/components/dashboard/team-analytics-table";
import { TeamNumericTable } from "@/components/dashboard/team-numeric-table";
import { TeamOverviewStats } from "@/components/dashboard/team-overview-stats";
import { TeamPercentageTable } from "@/components/dashboard/team-percentage-table";
import { TeamAnalyticsFilters } from "@/components/team-analytics/team-analytics-filters";
import { TeamEmptyStateCard } from "@/components/team-analytics/team-empty-state-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  describeList,
  filterBySearch,
  formatMatchLabel,
  getMatchSearchValues,
  getSearchQuery,
  matchesSearch,
} from "@/lib/analytics-search";
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
  const searchQuery = getSearchQuery(params);
  const baseData = await getTeamAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Totais (Todas as Jornadas)"
        filters={[{ label: "Competicao", value: "Sem competicoes disponiveis" }]}
        searchQuery={searchQuery}
      >
        <TeamEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para consultar os totais agregados da equipa."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const matchAggregates = await getAnalyzedTeamMatchAggregates(baseData.selectedCompetitionId);
  const visibleMatchAggregates = matchesSearch(searchQuery, [selectedCompetition?.name])
    ? matchAggregates
    : filterBySearch(matchAggregates, searchQuery, getMatchSearchValues);

  if (visibleMatchAggregates.length === 0) {
    return (
      <AnalyticsPageShell
        title="Totais (Todas as Jornadas)"
        description="Vista consolidada da equipa em todas as jornadas da competicao."
        filters={[
          { label: "Competicao", value: selectedCompetition?.name },
          { label: "Equipa", value: "Feirense" },
          { label: "Jogos", value: searchQuery ? "Sem jogos no filtro atual" : "Sem dados" },
        ]}
        searchQuery={searchQuery}
      >
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          description="Vista consolidada da equipa em todas as jornadas da competicao."
          searchQuery={searchQuery}
        />
        <TeamEmptyStateCard
          title={searchQuery ? "Sem resultados para a pesquisa" : "Sem dados para esta competicao"}
          description={
            searchQuery
              ? "A pesquisa atual nao encontrou jogos para a equipa."
              : "Ainda nao existem jornadas com registo para apresentar totais agregados."
          }
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateTeamDashboardTotals(visibleMatchAggregates);
  const overviewStats = buildTeamOverviewStats(visibleMatchAggregates, totals);
  const analyticsRows = buildTeamAnalyticsTableRows(totals);
  const percentageRows = buildTeamPercentageRows(totals);
  const numericRows = buildTeamNumericRows(totals);
  const goalkeeperSummary = buildGoalkeeperSummary(totals);

  return (
    <AnalyticsPageShell
      title="Totais (Todas as Jornadas)"
      description="Leitura consolidada da equipa ao longo de toda a competicao, sem filtro por jornada."
      filters={[
        { label: "Competicao", value: selectedCompetition?.name },
        { label: "Equipa", value: "Feirense" },
        {
          label: "Jogos",
          value: describeList(visibleMatchAggregates.map(formatMatchLabel), "Todas as jornadas"),
        },
      ]}
      searchQuery={searchQuery}
    >
      <TeamAnalyticsFilters
        competitions={baseData.competitions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        description="Sem filtro de jornada. Esta vista resume toda a competicao."
        searchQuery={searchQuery}
      />

      <TeamOverviewStats stats={overviewStats} />

      <Card>
        <CardHeader>
          <CardTitle>Totais Estruturados</CardTitle>
          <CardDescription>
            Totais, percentagens e volume por 90 em {visibleMatchAggregates.length} jornada(s).
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
    </AnalyticsPageShell>
  );
}
