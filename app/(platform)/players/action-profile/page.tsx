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
        title="Action Profile"
        filters={[{ label: "Competition", value: "No competitions available" }]}
        searchQuery={searchQuery}
      >
        <PlayerEmptyStateCard
          title="No competitions available"
          description="Create a competition to view the action distribution by player."
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
        title="Action Profile"
        description="Aggregated distribution of passes, crosses, individual actions, shots and duels."
        filters={[
          { label: "Competition", value: selectedCompetition?.name },
          {
            label: "Players",
            value: selectedPlayerIds.length === 0 ? "No players available" : "No results",
          },
          {
            label: "Teams",
            value: describeList(visiblePlayerOptions.map((player) => player.teamName), "No teams"),
          },
          { label: "Matches", value: "All matchdays" },
        ]}
        searchQuery={searchQuery}
      >
        <PlayerAnalyticsFilters
          competitions={baseData.competitions}
          players={baseData.playerOptions}
          selectedCompetitionId={baseData.selectedCompetitionId}
          selectedPlayerIds={selectedPlayerIds}
          playerMode="multiple"
          playerLabel="Players (1 or mais)"
          description="Non-temporal view of aggregated action distribution."
          searchQuery={searchQuery}
        />
        <PlayerEmptyStateCard
          title={
            selectedPlayerIds.length === 0
              ? "No players available"
              : "No players match the current search"
          }
          description={
            selectedPlayerIds.length === 0
              ? "Assign players to this competition to view their action profiles."
              : "The current search did not find any players within the selection."
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
        `Player ${playerId}`,
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
      title="Action Profile"
      description="Aggregated distribution of passes, crosses, individual actions, shots and duels. This view does not use matchdays."
      filters={[
        { label: "Competition", value: selectedCompetition?.name },
        {
          label: "Players",
          value: describeList(visiblePlayerOptions.map((player) => player.name), "No players"),
        },
        {
          label: "Teams",
          value: describeList(visiblePlayerOptions.map((player) => player.teamName), "No teams"),
        },
        { label: "Matches", value: "All matchdays" },
      ]}
      searchQuery={searchQuery}
    >
      <PlayerAnalyticsFilters
        competitions={baseData.competitions}
        players={baseData.playerOptions}
        selectedCompetitionId={baseData.selectedCompetitionId}
        selectedPlayerIds={selectedPlayerIds}
        playerMode="multiple"
        playerLabel="Players (1 or mais)"
        description="Select one player for perfil individual or several to comparison direct."
        searchQuery={searchQuery}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {scopes.length === 1 ? "Profile Radar" : "Action Profile Comparison"}
          </CardTitle>
          <CardDescription>
            {scopes.length === 1
              ? singleScope?.label ?? "Player"
              : shouldShowComparisonChart
                ? "Grouped bars available only to comparactions small between 2 and 3 players."
                : "With more than three players, the chart is hidden to avoid visual clutter."}
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
              Select up to three players to view comparison charts.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totals by Action Type</CardTitle>
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
