import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { PlayerNumericTable } from "@/components/player-analytics/player-numeric-table";
import { PlayerOverviewStats } from "@/components/player-analytics/player-overview-stats";
import { PlayerPercentageTable } from "@/components/player-analytics/player-percentage-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  filterBySearch,
  formatMatchLabel,
  getMatchSearchValues,
  getSearchQuery,
  matchesSearch,
} from "@/lib/analytics-search";
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
  const searchQuery = getSearchQuery(params);
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Por Jornada"
        filters={[{ label: "Competicao", value: "Sem competicoes disponiveis" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para consultar o detalhe do jogador por jornada."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
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
  const selectedPlayer = baseData.playerOptions.find((player) => player.id === selectedPlayerId);
  const selectedMatch = baseData.matchOptions.find((match) => match.id === selectedMatchId);

  if (!selectedPlayerId || !selectedMatchId) {
    return (
      <AnalyticsPageShell
        title="Por Jornada"
        description="Analise isolada de uma unica jornada para um unico jogador."
        filters={[
          { label: "Competicao", value: selectedCompetition?.name },
          { label: "Jogador", value: selectedPlayer?.name ?? "Selecao incompleta" },
          { label: "Jogo", value: selectedMatch ? formatMatchLabel(selectedMatch) : "Selecao incompleta" },
        ]}
        searchQuery={searchQuery}
      >
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
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="Selecao incompleta"
          description="Escolha um jogador e uma jornada para visualizar o detalhe do jogo."
        />
      </AnalyticsPageShell>
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
      <AnalyticsPageShell
        title="Por Jornada"
        description="Foco na performance do jogador numa jornada especifica."
        filters={[
          { label: "Competicao", value: selectedCompetition?.name },
          { label: "Jogador", value: player?.name },
          { label: "Equipa", value: player?.teamName },
          { label: "Jogo", value: selectedMatch ? formatMatchLabel(selectedMatch) : undefined },
        ]}
        searchQuery={searchQuery}
      >
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
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title="Sem registo para esta jornada"
          description="Nao existem estatisticas registadas para o jogador nesta jornada."
        />
      </AnalyticsPageShell>
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
  const searchMatchesScope = matchesSearch(searchQuery, [
    selectedCompetition?.name,
    player?.name,
    player?.teamName,
    ...(selectedMatch ? getMatchSearchValues(selectedMatch) : []),
  ]);
  const visibleOverviewStats = searchMatchesScope
    ? overviewStats
    : filterBySearch(overviewStats, searchQuery, (row) => [
        row.title,
        row.value,
        row.description,
      ]);
  const visiblePercentageRows = searchMatchesScope
    ? percentageRows
    : filterBySearch(percentageRows, searchQuery, (row) => [row.metric]);
  const visibleNumericRows = searchMatchesScope
    ? numericRows
    : filterBySearch(numericRows, searchQuery, (row) => [row.metric, row.total]);
  const visibleOutfieldStatFields = searchMatchesScope
    ? outfieldStatFields
    : filterBySearch(outfieldStatFields, searchQuery, (field) => [field.label, field.key]);
  const visibleGoalkeeperStatFields = searchMatchesScope
    ? goalkeeperStatFields
    : filterBySearch(goalkeeperStatFields, searchQuery, (field) => [field.label, field.key]);

  return (
    <AnalyticsPageShell
      title="Por Jornada"
      description="Foco na performance do jogador numa jornada especifica."
      filters={[
        { label: "Competicao", value: selectedCompetition?.name },
        { label: "Jogador", value: player?.name },
        { label: "Equipa", value: player?.teamName },
        { label: "Jogo", value: selectedMatch ? formatMatchLabel(selectedMatch) : undefined },
      ]}
      searchQuery={searchQuery}
    >
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
        searchQuery={searchQuery}
      />

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Jornada</CardTitle>
          <CardDescription>
            {player?.name ?? "Jogador"} | {selectedMatch ? formatMatchLabel(selectedMatch) : "Jornada -"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerOverviewStats stats={visibleOverviewStats} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acoes Percentuais</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerPercentageTable
            rows={visiblePercentageRows}
            goalkeeperSummary={goalkeeperSummary}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acoes Numericas</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerNumericTable rows={visibleNumericRows} />
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
                {visibleOutfieldStatFields.length > 0 ? (
                  visibleOutfieldStatFields.map((field) => (
                    <TableRow key={field.key}>
                      <TableCell>{field.label}</TableCell>
                      <TableCell>{String(outfieldRow[field.key] ?? 0)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-sm text-muted-foreground">
                      Sem metricas para a pesquisa atual.
                    </TableCell>
                  </TableRow>
                )}
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
                {visibleGoalkeeperStatFields.length > 0 ? (
                  visibleGoalkeeperStatFields.map((field) => (
                    <TableRow key={field.key}>
                      <TableCell>{field.label}</TableCell>
                      <TableCell>{String(goalkeeperRow[field.key] ?? 0)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-sm text-muted-foreground">
                      Sem metricas para a pesquisa atual.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </AnalyticsPageShell>
  );
}
