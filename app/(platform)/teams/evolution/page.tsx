import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { TeamEvolutionCharts } from "@/components/dashboard/team-evolution-charts";
import { TeamOverviewStats } from "@/components/dashboard/team-overview-stats";
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
  const searchQuery = getSearchQuery(params);
  const baseData = await getTeamAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Evolucao"
        filters={[{ label: "Competicao", value: "Sem competicoes disponiveis" }]}
        searchQuery={searchQuery}
      >
        <TeamEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para acompanhar a evolucao da equipa ao longo das jornadas."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const selectedMatchIds = filterValidIds(parseIdList(params.matchIds), baseData.matchIdSet);
  const scopedMatchIds = selectedMatchIds.length > 0 ? selectedMatchIds : undefined;

  const matchAggregates = await getAnalyzedTeamMatchAggregates(
    baseData.selectedCompetitionId,
    scopedMatchIds,
  );
  const visibleMatchAggregates = matchesSearch(searchQuery, [selectedCompetition?.name, "Feirense"])
    ? matchAggregates
    : filterBySearch(matchAggregates, searchQuery, getMatchSearchValues);

  if (visibleMatchAggregates.length === 0) {
    return (
      <AnalyticsPageShell
        title="Evolucao"
        description="Graficos por jornada com media, tendencia e destaque para melhores e piores momentos da equipa."
        filters={[
          { label: "Competicao", value: selectedCompetition?.name },
          { label: "Equipa", value: "Feirense" },
          { label: "Jogos", value: searchQuery ? "Sem jogos no filtro atual" : "Sem dados" },
        ]}
        searchQuery={searchQuery}
      >
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedMatchIds={selectedMatchIds}
          matchMode="multiple"
          description="Selecione varias jornadas para analisar a evolucao temporal da equipa."
          searchQuery={searchQuery}
        />
        <TeamEmptyStateCard
          title="Sem dados para o filtro atual"
          description="Ajuste a competicao, a selecao de jornadas ou a pesquisa para gerar os graficos evolutivos."
        />
      </AnalyticsPageShell>
    );
  }

  if (visibleMatchAggregates.length < 2) {
    return (
      <AnalyticsPageShell
        title="Evolucao"
        description="Graficos por jornada com media, tendencia e destaque para melhores e piores momentos da equipa."
        filters={[
          { label: "Competicao", value: selectedCompetition?.name },
          { label: "Equipa", value: "Feirense" },
          {
            label: "Jogos",
            value: describeList(visibleMatchAggregates.map(formatMatchLabel), "Sem jogos"),
          },
        ]}
        searchQuery={searchQuery}
      >
        <TeamAnalyticsFilters
          competitions={baseData.competitions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedMatchIds={selectedMatchIds}
          matchMode="multiple"
          description="Selecione varias jornadas para analisar a evolucao temporal da equipa."
          searchQuery={searchQuery}
        />
        <TeamEmptyStateCard
          title="Jornadas insuficientes para evolucao"
          description="Selecione pelo menos duas jornadas, ou deixe a competicao completa para visualizar os graficos evolutivos."
        />
      </AnalyticsPageShell>
    );
  }

  const totals = aggregateTeamDashboardTotals(visibleMatchAggregates);
  const overviewStats = buildTeamOverviewStats(visibleMatchAggregates, totals);
  const evolutionCharts = buildTeamEvolutionCharts(visibleMatchAggregates);

  return (
    <AnalyticsPageShell
      title="Evolucao"
      description="Graficos por jornada com media, tendencia e destaque para melhores e piores momentos da equipa."
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
        matches={baseData.matchOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedMatchIds={selectedMatchIds}
        matchMode="multiple"
        description="Vista de evolucao por jornada. Se nao selecionar jornadas, a pagina usa toda a competicao."
        searchQuery={searchQuery}
      />

      <TeamOverviewStats stats={overviewStats} />

      <Card>
        <CardHeader>
          <CardTitle>Graficos de Evolucao</CardTitle>
          <CardDescription>
            Evolucao por jornada do Feirense nas metricas percentuais e acoes nao percentuais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamEvolutionCharts charts={evolutionCharts} />
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
