import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerComparisonSummaryTable } from "@/components/player-analytics/player-comparison-summary-table";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerRankingInsights } from "@/components/player-analytics/player-ranking-insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aggregateOutfieldTotals } from "@/lib/dashboardMetrics";
import { getUsedOutfieldPlayersByMatch } from "@/lib/data";
import {
  buildComparisonSummaryRows,
  getPlayerAnalyticsBaseData,
  loadPlayerAnalyticsData,
  resolveSingleId,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";

type ComparisonMatchdaysPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function ComparisonMatchdaysPage({
  searchParams,
}: ComparisonMatchdaysPageProps) {
  const params = (await searchParams) ?? {};
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Comparação por Jornada
        </h1>
        <PlayerEmptyStateCard
          title="Sem competições disponíveis"
          description="Crie uma competição para comparar jogadores por jornada."
        />
      </section>
    );
  }

  const selectedMatchId = resolveSingleId(
    params.matchId,
    baseData.matchIdSet,
    baseData.matchOptions[0]?.id,
  );
  const selectedMatch = baseData.matchOptions.find((match) => match.id === selectedMatchId);
  const usedOutfieldPlayers = selectedMatchId
    ? await getUsedOutfieldPlayersByMatch(baseData.selectedCompetitionId, selectedMatchId)
    : [];
  const usedOutfieldPlayerIds = usedOutfieldPlayers.map((player) => player.id);
  const hasValidSelection = Boolean(selectedMatchId && usedOutfieldPlayerIds.length > 0);

  const loadedData = hasValidSelection
    ? await loadPlayerAnalyticsData({
        competitionId: baseData.selectedCompetitionId,
        playerOptions: usedOutfieldPlayers,
        playerIds: usedOutfieldPlayerIds,
        matchIds: selectedMatchId ? [selectedMatchId] : undefined,
      })
    : undefined;

  const comparisonScopes = hasValidSelection
    ? usedOutfieldPlayerIds.map((playerId) => ({
        label:
          loadedData?.playerMap.get(playerId)?.name ??
          usedOutfieldPlayers.find((player) => player.id === playerId)?.name ??
          `Jogador ${playerId}`,
        totals: aggregateOutfieldTotals(loadedData?.outfieldRowsByPlayer.get(playerId) ?? []),
      }))
    : [];
  const comparisonRows = buildComparisonSummaryRows(comparisonScopes);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Comparação por Jornada
        </h1>
        <p className="text-sm text-muted-foreground">
          Compara automaticamente todos os jogadores de campo utilizados na jornada selecionada.
          Guarda-redes ficam excluídos.
        </p>
      </div>

      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        matches={baseData.matchOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedMatchId={selectedMatchId}
        matchMode="single"
        matchLabel="Jornada"
        description="Escolha a jornada; os jogadores de campo utilizados são carregados automaticamente."
      />

      {!hasValidSelection ? (
        <PlayerEmptyStateCard
          title={selectedMatchId ? "Sem jogadores de campo utilizados" : "Seleção incompleta"}
          description={
            selectedMatchId
              ? "Não existem jogadores de campo com minutos registados nesta jornada."
              : "Escolha uma jornada para comparar os jogadores utilizados."
          }
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Classificação da Jornada</CardTitle>
              <CardDescription>
                Jornada {selectedMatch?.matchdayNumber ?? "-"} x{" "}
                {selectedMatch?.opponentTeamName ?? "-"} · {comparisonRows.length} jogadores de
                campo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlayerComparisonSummaryTable rows={comparisonRows} />
            </CardContent>
          </Card>

          {comparisonRows.length > 1 ? <PlayerRankingInsights rows={comparisonRows} /> : null}
        </>
      )}
    </section>
  );
}
