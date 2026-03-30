import { aggregateOutfieldTotals } from "@/lib/dashboardMetrics";
import {
  buildGoalkeeperSummary,
  buildPlayerNumericRows,
  buildPlayerOverviewStats,
  buildPlayerPercentageRows,
  getPlayerAnalyticsBaseData,
  loadPlayerAnalyticsData,
  resolveSingleId,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerNumericTable } from "@/components/player-analytics/player-numeric-table";
import { PlayerOverviewStats } from "@/components/player-analytics/player-overview-stats";
import { PlayerPercentageTable } from "@/components/player-analytics/player-percentage-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TotalAllMatchdaysPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function TotalAllMatchdaysPage({
  searchParams,
}: TotalAllMatchdaysPageProps) {
  const params = (await searchParams) ?? {};
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Totais (Todas as Jornadas)
        </h1>
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para consultar os totais do jogador ao longo da epoca."
        />
      </section>
    );
  }

  const selectedPlayerId = resolveSingleId(
    params.playerId,
    baseData.playerIdSet,
    baseData.playerOptions[0]?.id,
  );

  if (!selectedPlayerId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Totais (Todas as Jornadas)
        </h1>
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          playerMode="single"
          description="Analise consolidada de um jogador em todas as jornadas da competicao."
        />
        <PlayerEmptyStateCard
          title="Sem jogadores disponiveis"
          description="Associe jogadores a esta competicao para visualizar os totais agregados."
        />
      </section>
    );
  }

  const loadedData = await loadPlayerAnalyticsData({
    competitionId: baseData.selectedCompetitionId,
    playerOptions: baseData.playerOptions,
    playerIds: [selectedPlayerId],
  });

  const player = loadedData.playerMap.get(selectedPlayerId);
  const outfieldRows = loadedData.outfieldRowsByPlayer.get(selectedPlayerId) ?? [];
  const goalkeeperRows = loadedData.goalkeeperRowsByPlayer.get(selectedPlayerId) ?? [];
  const totals = aggregateOutfieldTotals(outfieldRows);
  const matchesPlayed =
    new Set([
      ...outfieldRows.map((row) => row.matchId),
      ...goalkeeperRows.map((row) => row.matchId),
    ]).size;
  const overviewStats = buildPlayerOverviewStats(totals, matchesPlayed);
  const percentageRows = buildPlayerPercentageRows(totals);
  const numericRows = buildPlayerNumericRows({
    totals,
    goalkeeperRows,
    matchesPlayed,
  });
  const goalkeeperSummary = player?.isGoalkeeper
    ? buildGoalkeeperSummary(goalkeeperRows)
    : undefined;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Totais (Todas as Jornadas)
        </h1>
        <p className="text-sm text-muted-foreground">
          Totais e percentagens derivadas do jogador selecionado ao longo de toda a epoca.
        </p>
      </div>

      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerId={selectedPlayerId}
        playerMode="single"
        description="Sem filtro de jornada. O objetivo desta vista e a consistencia do jogador ao longo da competicao."
      />

      <PlayerOverviewStats stats={overviewStats} />

      <Card>
        <CardHeader>
          <CardTitle>Acoes Percentuais</CardTitle>
          <CardDescription>
            {player?.name ?? "Jogador"} em {matchesPlayed} jornada(s) com registo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerPercentageTable
            rows={percentageRows}
            goalkeeperSummary={goalkeeperSummary}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acoes Numericas</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerNumericTable rows={numericRows} />
        </CardContent>
      </Card>
    </section>
  );
}
