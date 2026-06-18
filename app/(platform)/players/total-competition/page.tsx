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
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Totais por Competição
        </h1>
        <PlayerEmptyStateCard
          title="Sem competições disponíveis"
          description="Crie uma competição para consultar os totais agregados de jogadores."
        />
      </section>
    );
  }

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
  const comparisonScopes = competitionPlayerTotals.map((row) => ({
    label: String(row.playerName ?? "-"),
    totals: toOutfieldTotalsFromAggregate(row as Record<string, unknown>),
  }));
  const comparisonRows = buildComparisonSummaryRows(comparisonScopes);
  const resetFiltersHref =
    selectedTeamIds.length > 0
      ? `/players/total-competition?competitionId=${baseData.selectedCompetitionId}`
      : undefined;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Totais por Competição
        </h1>
        <p className="text-sm text-muted-foreground">
          Visão agregada de todos os jogadores na competição selecionada, sem filtro de
          jornada.
        </p>
      </div>

      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        teams={teamOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedTeamIds={selectedTeamIds}
        description="Análise global do rendimento dos jogadores dentro da competição."
        resetHref={resetFiltersHref}
      />

      <Card>
        <CardHeader>
          <CardTitle>Classificação Comparativa</CardTitle>
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
            {competitionPlayerTotals.length} de {allCompetitionPlayerTotals.length} jogadores visíveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerCompetitionTotalsTable rows={competitionPlayerTotals} />
        </CardContent>
      </Card>
    </section>
  );
}
