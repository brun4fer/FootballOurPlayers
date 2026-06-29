import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell";
import { ActionProfileComparisonChart } from "@/components/charts/action-profile-comparison-chart";
import { RadarProfileChart } from "@/components/charts/radar-profile-chart";
import { PlayerActionProfileTable } from "@/components/player-analytics/player-action-profile-table";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { describeList, filterBySearch, getSearchQuery, matchesSearch } from "@/lib/analytics-search";
import {
  buildActionProfileComparisonData,
  buildActionProfileRadarData,
  buildPlayerActionProfileScope,
  filterValidIds,
  getSeriesColor,
  getPlayerAnalyticsBaseData,
  loadPlayerAnalyticsData,
  mergeSelectedIds,
  parseIdList,
  parseOptionalId,
  type PlayerAnalyticsSearchParams,
} from "@/lib/playerAnalytics";

type ActionProfilePageProps = {
  searchParams?: Promise<PlayerAnalyticsSearchParams>;
};

export default async function ActionProfilePage({
  searchParams,
}: ActionProfilePageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = getSearchQuery(params);
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <AnalyticsPageShell
        title="Perfil de Acoes"
        filters={[{ label: "Competicao", value: "Sem competicoes disponiveis" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para visualizar a distribuicao de acoes por jogador."
        />
      </AnalyticsPageShell>
    );
  }

  const selectedCompetition = baseData.competitions.find(
    (competition) => competition.id === baseData.selectedCompetitionId,
  );
  const requestedPlayerIds = filterValidIds(
    mergeSelectedIds(parseOptionalId(params.playerId), parseIdList(params.playerIds)),
    baseData.playerIdSet,
  );
  const selectedPlayerIds =
    requestedPlayerIds.length > 0
      ? requestedPlayerIds
      : baseData.playerOptions[0]
        ? [baseData.playerOptions[0].id]
        : [];
  const selectedPlayerOptions = baseData.playerOptions.filter((player) =>
    selectedPlayerIds.includes(player.id),
  );
  const visiblePlayerOptions = matchesSearch(searchQuery, [selectedCompetition?.name])
    ? selectedPlayerOptions
    : filterBySearch(selectedPlayerOptions, searchQuery, (player) => [
        player.name,
        player.teamName,
      ]);
  const visiblePlayerIds = visiblePlayerOptions.map((player) => player.id);

  if (selectedPlayerIds.length === 0 || visiblePlayerIds.length === 0) {
    return (
      <AnalyticsPageShell
        title="Perfil de Acoes"
        description="Distribuicao agregada de passes, cruzamentos, acoes individuais, remates e duelos."
        filters={[
          { label: "Competicao", value: selectedCompetition?.name },
          {
            label: "Jogadores",
            value: selectedPlayerIds.length === 0 ? "Sem jogadores disponiveis" : "Sem resultados",
          },
          {
            label: "Equipas",
            value: describeList(visiblePlayerOptions.map((player) => player.teamName), "Sem equipas"),
          },
          { label: "Jogos", value: "Todas as jornadas" },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerIds={selectedPlayerIds}
          playerMode="multiple"
          playerLabel="Jogadores (1 ou mais)"
          description="Vista nao temporal para distribuicao agregada de acoes."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title={
            selectedPlayerIds.length === 0
              ? "Sem jogadores disponiveis"
              : "Sem jogadores para a pesquisa atual"
          }
          description={
            selectedPlayerIds.length === 0
              ? "Associe jogadores a esta competicao para consultar o perfil de acoes."
              : "A pesquisa atual nao encontrou jogadores dentro da selecao feita."
          }
        />
      </AnalyticsPageShell>
    );
  }

  const loadedData = await loadPlayerAnalyticsData({
    competitionId: baseData.selectedCompetitionId,
    playerOptions: baseData.playerOptions,
    playerIds: visiblePlayerIds,
  });

  const scopes = visiblePlayerIds.map((playerId) =>
    buildPlayerActionProfileScope(
      playerId,
      loadedData.playerMap.get(playerId)?.name ??
        baseData.playerOptions.find((player) => player.id === playerId)?.name ??
        `Jogador ${playerId}`,
      loadedData.outfieldRowsByPlayer,
    ),
  );
  const singleScope = scopes[0];
  const radarData =
    scopes.length === 1 && singleScope ? buildActionProfileRadarData(singleScope.totals) : [];
  const comparisonData =
    scopes.length > 1 ? buildActionProfileComparisonData(scopes) : undefined;
  const shouldShowComparisonChart = scopes.length >= 2 && scopes.length <= 3;

  return (
    <AnalyticsPageShell
      title="Perfil de Acoes"
      description="Distribuicao agregada de passes, cruzamentos, acoes individuais, remates e duelos. Esta vista nao usa jornada."
      filters={[
        { label: "Competicao", value: selectedCompetition?.name },
        {
          label: "Jogadores",
          value: describeList(visiblePlayerOptions.map((player) => player.name), "Sem jogadores"),
        },
        {
          label: "Equipas",
          value: describeList(visiblePlayerOptions.map((player) => player.teamName), "Sem equipas"),
        },
        { label: "Jogos", value: "Todas as jornadas" },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerIds={selectedPlayerIds}
        playerMode="multiple"
        playerLabel="Jogadores (1 ou mais)"
        description="Selecione um jogador para perfil individual ou varios para comparacao direta."
        searchQuery={searchQuery}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {scopes.length === 1 ? "Radar de Perfil" : "Comparacao de Perfil de Acoes"}
          </CardTitle>
          <CardDescription>
            {scopes.length === 1
              ? singleScope?.label ?? "Jogador"
              : shouldShowComparisonChart
                ? "Barras agrupadas disponiveis apenas para comparacoes curtas entre 2 e 3 jogadores."
                : "Com mais de 3 jogadores, o chart e ocultado para evitar poluicao visual."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scopes.length === 1 ? (
            <RadarProfileChart
              data={radarData}
              color={getSeriesColor(singleScope?.label ?? "Perfil")}
              name={singleScope?.label ?? "Perfil"}
            />
          ) : shouldShowComparisonChart && comparisonData ? (
            <ActionProfileComparisonChart
              data={comparisonData.data}
              series={comparisonData.series}
            />
          ) : (
            <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-6 text-sm text-muted-foreground">
              Selecione ate 3 jogadores para visualizar graficos comparativos.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totais por Tipo de Acao</CardTitle>
        </CardHeader>
        <CardContent>
          {scopes.length === 1 && singleScope ? (
            <PlayerActionProfileTable singleProfile={radarData} />
          ) : (
            <PlayerActionProfileTable comparisonProfiles={scopes} />
          )}
        </CardContent>
      </Card>
    </AnalyticsPageShell>
  );
}
