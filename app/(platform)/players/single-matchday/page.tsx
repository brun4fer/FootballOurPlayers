import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerNumericTable } from "@/components/player-analytics/player-numeric-table";
import { PlayerOverviewStats } from "@/components/player-analytics/player-overview-stats";
import { PlayerPercentageTable } from "@/components/player-analytics/player-percentage-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { aggregateOutfieldTotals } from "@/lib/dashboardMetrics";
import { goalkeeperStatFields, outfieldStatFields } from "@/lib/stat-fields";
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

type SingleMatchdayPageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function SingleMatchdayPage({
  searchParams,
}: SingleMatchdayPageProps) {
  const params = (await searchParams) ?? {};
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Por Jornada</h1>
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para consultar o detalhe do jogador por jornada."
        />
      </section>
    );
  }

  const selectedPlayerId = resolveSingleId(
    params.playerId,
    baseData.playerIdSet,
    baseData.playerOptions[0]?.id,
  );
  const selectedMatchId = resolveSingleId(
    params.matchId,
    baseData.matchIdSet,
    baseData.matchOptions[0]?.id,
  );

  if (!selectedPlayerId || !selectedMatchId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Por Jornada</h1>
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerId={selectedPlayerId}
          selectedMatchId={selectedMatchId}
          playerMode="single"
          matchMode="single"
          description="Analise isolada de uma unica jornada para um unico jogador."
        />
        <PlayerEmptyStateCard
          title="Selecao incompleta"
          description="Escolha um jogador e uma jornada para visualizar o detalhe do jogo."
        />
      </section>
    );
  }

  const loadedData = await loadPlayerAnalyticsData({
    competitionId: baseData.selectedCompetitionId,
    playerOptions: baseData.playerOptions,
    playerIds: [selectedPlayerId],
    matchIds: [selectedMatchId],
  });

  const player = loadedData.playerMap.get(selectedPlayerId);
  const outfieldRows = loadedData.outfieldRowsByPlayer.get(selectedPlayerId) ?? [];
  const goalkeeperRows = loadedData.goalkeeperRowsByPlayer.get(selectedPlayerId) ?? [];

  if (outfieldRows.length === 0 && goalkeeperRows.length === 0) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Por Jornada</h1>
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          matches={baseData.matchOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerId={selectedPlayerId}
          selectedMatchId={selectedMatchId}
          playerMode="single"
          matchMode="single"
          description="Analise isolada de uma unica jornada para um unico jogador."
        />
        <PlayerEmptyStateCard
          title="Sem registo para esta jornada"
          description="Nao existem estatisticas registadas para o jogador nesta jornada."
        />
      </section>
    );
  }

  const outfieldRow = outfieldRows[0];
  const goalkeeperRow = goalkeeperRows[0];
  const totals = aggregateOutfieldTotals(outfieldRows);
  const overviewStats = buildPlayerOverviewStats(totals, 1);
  const percentageRows = buildPlayerPercentageRows(totals);
  const numericRows = buildPlayerNumericRows({
    totals,
    goalkeeperRows,
    matchesPlayed: 1,
  });
  const goalkeeperSummary = player?.isGoalkeeper
    ? buildGoalkeeperSummary(goalkeeperRows)
    : undefined;
  const selectedMatch = baseData.matchOptions.find((match) => match.id === selectedMatchId);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Por Jornada</h1>
        <p className="text-sm text-muted-foreground">
          Foco na performance do jogador numa jornada especifica.
        </p>
      </div>

      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        matches={baseData.matchOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerId={selectedPlayerId}
        selectedMatchId={selectedMatchId}
        playerMode="single"
        matchMode="single"
        description="A jornada e obrigatoria nesta vista."
      />

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Jornada</CardTitle>
          <CardDescription>
            {player?.name ?? "Jogador"} | Jornada {selectedMatch?.matchdayNumber ?? "-"} vs{" "}
            {selectedMatch?.opponentTeamName ?? "-"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerOverviewStats stats={overviewStats} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acoes Percentuais</CardTitle>
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

      {outfieldRow ? (
        <Card>
          <CardHeader>
            <CardTitle>Detalhe Bruto do Jogo</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metrica</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outfieldStatFields.map((field) => (
                  <TableRow key={field.key}>
                    <TableCell>{field.label}</TableCell>
                    <TableCell>{String(outfieldRow[field.key] ?? 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {goalkeeperRow ? (
        <Card>
          <CardHeader>
            <CardTitle>Detalhe Guarda-Redes</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metrica</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goalkeeperStatFields.map((field) => (
                  <TableRow key={field.key}>
                    <TableCell>{field.label}</TableCell>
                    <TableCell>{String(goalkeeperRow[field.key] ?? 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
