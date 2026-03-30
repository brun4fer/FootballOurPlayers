import { ActionProfileComparisonChart } from "@/components/charts/action-profile-comparison-chart";
import { RadarProfileChart } from "@/components/charts/radar-profile-chart";
import { PlayerActionProfileTable } from "@/components/player-analytics/player-action-profile-table";
import { PlayerAnalyticsFilters } from "@/components/player-analytics/player-analytics-filters";
import { PlayerEmptyStateCard } from "@/components/player-analytics/player-empty-state-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const baseData = await getPlayerAnalyticsBaseData(params);

  if (!baseData.selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Perfil de Acoes
        </h1>
        <PlayerEmptyStateCard
          title="Sem competicoes disponiveis"
          description="Crie uma competicao para visualizar a distribuicao de acoes por jogador."
        />
      </section>
    );
  }

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

  if (selectedPlayerIds.length === 0) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Perfil de Acoes
        </h1>
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerIds={selectedPlayerIds}
          playerMode="multiple"
          playerLabel="Jogadores (1 ou mais)"
          description="Vista nao temporal para distribuicao agregada de acoes."
        />
        <PlayerEmptyStateCard
          title="Sem jogadores disponiveis"
          description="Associe jogadores a esta competicao para consultar o perfil de acoes."
        />
      </section>
    );
  }

  const loadedData = await loadPlayerAnalyticsData({
    competitionId: baseData.selectedCompetitionId,
    playerOptions: baseData.playerOptions,
    playerIds: selectedPlayerIds,
  });

  const scopes = selectedPlayerIds.map((playerId) =>
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
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">
          Perfil de Acoes
        </h1>
        <p className="text-sm text-muted-foreground">
          Distribuicao agregada de passes, cruzamentos, acoes individuais, remates e
          duelos. Esta vista nao usa jornada.
        </p>
      </div>

      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerIds={selectedPlayerIds}
        playerMode="multiple"
        playerLabel="Jogadores (1 ou mais)"
        description="Selecione um jogador para perfil individual ou varios para comparacao direta."
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
                ? "Grouped bars apenas para comparacoes curtas entre 2 e 3 jogadores."
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
    </section>
  );
}
