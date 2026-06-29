import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerComparisonSummaryTable } from "@/components/player-analytics/player-comparison-summary-table";
import { PlayerCompetitionTotalsTable } from "@/components/player-analytics/player-competition-totals-table";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerRankingInsights } from "@/components/player-analytics/player-ranking-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { describeList, filterBySearch, getSearchQuery, matchesSearch } from "@/lib/analytics-search";
import { getCompetitionPlayerTotals } from "@/lib/data";
import { toOutfieldTotalsFromAggregate } from "@/lib/dashboardMetrics";
import {
  buildComparisonSummaryRows,
  filterValidIds,
  getPlayerAnalyticsBaseData,
  parseIdList,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";

type TotalCompetitionPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function TotalCompetitionPage({
  searchParams,
}: TotalCompetitionPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Totais por Competicao"
        filters={[{ label: "Competicao", value: "Sem competicoes disponiveis" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para consultar os totais agregados de jogadores."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const allCompetitionPlayerTotals = await getCompetitionPlayerTotals(baseData.selectedCompetitionId);
  const teamOptions = [
    ...new Map(
      allCompetitionPlayerTotals.map((row) => [
        row.teamId,
        { id: row.teamId, name: String(row.teamName ?? "-") },
      ]),
    ).values(),
  ].sort((left, right) => left.name.localeCompare(right.name));
  const selectedTeamIds = filterValidIds(
    parseIdList(params.teamIds),
    new Set(teamOptions.map((team) => team.id)),
  );
  const selectedTeamIdSet = new Set(selectedTeamIds);
  const competitionPlayerTotals =
    selectedTeamIds.length > 0
      ? allCompetitionPlayerTotals.filter((row) => selectedTeamIdSet.has(row.teamId))
      : allCompetitionPlayerTotals;
  const visibleCompetitionPlayerTotals = matchesSearch(searchQuery, [selectedCompetition?.name])
    ? competitionPlayerTotals
    : filterBySearch(competitionPlayerTotals, searchQuery, (row) => [
        row.playerName,
        row.teamName,
      ]);
  const comparisonScopes = visibleCompetitionPlayerTotals.map((row) => ({
    label: String(row.playerName ?? "-"),
    totals: toOutfieldTotalsFromAggregate(row as Record<string, unknown>),
  }));
  const comparisonRows = buildComparisonSummaryRows(comparisonScopes);
  const resetFiltersHref =
    selectedTeamIds.length > 0
      ? `/players/total-competition?competitionId=${baseData.selectedCompetitionId}${
          searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""
        }`
      : undefined;

  return (
    <AnalyticsPageShell
      title="Totais por Competicao"
      description="Visao agregada de todos os jogadores na competicao selecionada, sem filtro de jornada."
      filters={[
        { label: "Competicao", value: selectedCompetition?.name },
        {
          label: "Equipas",
          value: describeList(
            teamOptions
              .filter((team) => selectedTeamIdSet.has(team.id))
              .map((team) => team.name),
          ),
        },
        {
          label: "Jogadores",
          value: `${visibleCompetitionPlayerTotals.length} de ${allCompetitionPlayerTotals.length}`,
        },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        teams={teamOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedTeamIds={selectedTeamIds}
        description="Analise global do rendimento dos jogadores dentro da competicao."
        resetHref={resetFiltersHref}
        searchQuery={searchQuery}
      />

      <Card>
        <CardHeader>
          <CardTitle>Classificacao Comparativa</CardTitle>
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
          <CardDescription>
            {visibleCompetitionPlayerTotals.length} de {allCompetitionPlayerTotals.length} jogadores visiveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerCompetitionTotalsTable rows={visibleCompetitionPlayerTotals} />
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
