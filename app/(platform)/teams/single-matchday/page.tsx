import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { TeamAnalyticsTable } from "@/components/dashboard/team-analytics-table";
import { TeamNumericTable } from "@/components/dashboard/team-numeric-table";
import { TeamOverviewStats } from "@/components/dashboard/team-overview-stats";
import { TeamPercentageTable } from "@/components/dashboard/team-percentage-table";
import { TeamAnalyticsFilters } from "@/components/team-analytics/team-analytics-filters";
import { TeamEmptyStateCard } from "@/components/team-analytics/team-empty-state-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
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
  const searchQuery = getSearchQuery(params);
  const baseData = await getTeamAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Por Jornada"
        filters={[{ label: "Competicao", value: "Sem competicoes disponiveis" }]}
        searchQuery={searchQuery}
      >
        <TeamEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para consultar o detalhe da equipa por jornada."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const selectedMatchId = resolveSingleId(
    params.matchId,
    baseData.matchIdSet,
    baseData.matchOptions[0]?.id,
  );
  const selectedMatch = baseData.matchOptions.find((match) => match.id === selectedMatchId);

  if (!selectedMatchId) {
    return (
      <AnalyticsPageShell
        title="Por Jornada"
        description="Vista isolada de uma unica jornada da equipa."
        filters={[
          { label: "Competicao", value: selectedCompetition?.name },
          { label: "Equipa", value: "Feirense" },
          { label: "Jogo", value: "Selecao incompleta" },
        ]}
        searchQuery={searchQuery}
      >
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          matchMode="single"
          description="Vista isolada de uma unica jornada da equipa."
          searchQuery={searchQuery}
        />
        <TeamEmptyStateCard
          title="Selecao incompleta"
          description="Escolha uma jornada para visualizar as estatisticas da equipa nesse jogo."
        />
      </AnalyticsPageShell>
    );
  }

  const matchAggregates = await getAnalyzedTeamMatchAggregates(baseData.selectedCompetitionId, [
    selectedMatchId,
  ]);

  if (matchAggregates.length === 0) {
    return (
      <AnalyticsPageShell
        title="Por Jornada"
        description="Foco na performance da equipa numa unica jornada."
        filters={[
          { label: "Competicao", value: selectedCompetition?.name },
          { label: "Equipa", value: "Feirense" },
          { label: "Jogo", value: selectedMatch ? formatMatchLabel(selectedMatch) : undefined },
        ]}
        searchQuery={searchQuery}
      >
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedMatchId={selectedMatchId}
          matchMode="single"
          description="Vista isolada de uma unica jornada da equipa."
          searchQuery={searchQuery}
        />
        <TeamEmptyStateCard
          title="Sem registo para esta jornada"
          description="Nao existem dados registados para a equipa nesta jornada."
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateTeamDashboardTotals(matchAggregates);
  const overviewStats = buildTeamOverviewStats(matchAggregates, totals);
  const analyticsRows = buildTeamAnalyticsTableRows(totals);
  const percentageRows = buildTeamPercentageRows(totals);
  const numericRows = buildTeamNumericRows(totals);
  const goalkeeperSummary = buildGoalkeeperSummary(totals);
  const searchMatchesScope = matchesSearch(searchQuery, [
    selectedCompetition?.name,
    "Feirense",
    ...(selectedMatch ? getMatchSearchValues(selectedMatch) : []),
  ]);
  const visibleOverviewStats = searchMatchesScope
    ? overviewStats
    : filterBySearch(overviewStats, searchQuery, (row) => [
        row.title,
        row.value,
        row.description,
      ]);
  const visibleAnalyticsRows = searchMatchesScope
    ? analyticsRows
    : filterBySearch(analyticsRows, searchQuery, (row) => [row.metric]);
  const visiblePercentageRows = searchMatchesScope
    ? percentageRows
    : filterBySearch(percentageRows, searchQuery, (row) => [row.metric]);
  const visibleNumericRows = searchMatchesScope
    ? numericRows
    : filterBySearch(numericRows, searchQuery, (row) => [row.metric, row.total]);

  return (
    <AnalyticsPageShell
      title="Por Jornada"
      description="Foco na performance da equipa numa unica jornada."
      filters={[
        { label: "Competicao", value: selectedCompetition?.name },
        { label: "Equipa", value: "Feirense" },
        { label: "Jogo", value: selectedMatch ? formatMatchLabel(selectedMatch) : undefined },
      ]}
      searchQuery={searchQuery}
    >
      <TeamAnalyticsFilters
        competitions={baseData.competitions}
        matches={baseData.matchOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedMatchId={selectedMatchId}
        matchMode="single"
        description="A jornada e obrigatoria nesta vista."
        searchQuery={searchQuery}
      />

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Jornada</CardTitle>
          <CardDescription>
            {selectedMatch ? formatMatchLabel(selectedMatch) : "Jornada -"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamOverviewStats stats={visibleOverviewStats} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totais da Jornada</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamAnalyticsTable rows={visibleAnalyticsRows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acoes Percentuais</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamPercentageTable rows={visiblePercentageRows} goalkeeper={goalkeeperSummary} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acoes Numericas</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamNumericTable rows={visibleNumericRows} />
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
