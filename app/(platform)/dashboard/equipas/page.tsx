import { TeamDashboardFilters } from "@/components/dashboard/team-dashboard-filters";
import { TeamEvolutionCharts } from "@/components/dashboard/team-evolution-charts";
import { TeamNumericTable } from "@/components/dashboard/team-numeric-table";
import { TeamOffensiveChart } from "@/components/dashboard/team-offensive-chart";
import { TeamPercentageTable } from "@/components/dashboard/team-percentage-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAnalyzedTeamMatchAggregates,
  getCompetitionOptions,
  getMatchOptionsByCompetition,
} from "@/lib/data";
import {
  aggregateTeamDashboardTotals,
  buildGoalkeeperSummary,
  buildTeamEvolutionCharts,
  buildTeamNumericRows,
  buildTeamOffensiveChartData,
  buildTeamPercentageRows,
} from "@/lib/teamDashboardMetrics";

type DashboardEquipasPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseOptionalId(value: string | string[] | undefined) {
  if (!value || Array.isArray(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

function parseIdList(value: string | string[] | undefined) {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const splitValues = rawValues.flatMap((item) => item.split(","));
  const parsedValues = splitValues
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0)
    .map((item) => Math.floor(item));
  return [...new Set(parsedValues)];
}

function mergeSelectedIds(single?: number, multiple: number[] = []) {
  return [...new Set([...(single ? [single] : []), ...multiple])];
}

function buildModeLabel(selectedMatchCount: number) {
  if (selectedMatchCount === 0) {
    return "Modo: Competição apenas (totais de todas as jornadas).";
  }
  if (selectedMatchCount === 1) {
    return "Modo: Competição + 1 jornada (estatísticas desse jogo).";
  }
  return "Modo: Competição + múltiplas jornadas (com evolução entre jogos).";
}

export default async function DashboardEquipasPage({
  searchParams,
}: DashboardEquipasPageProps) {
  const params = (await searchParams) ?? {};

  const competitions = await getCompetitionOptions();
  const selectedCompetitionId = parseOptionalId(params.competitionId) ?? competitions[0]?.id;

  if (!selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Dashboard de Equipas</h1>
        <Card>
          <CardHeader>
            <CardTitle>Sem competições disponíveis</CardTitle>
            <CardDescription>
              Crie uma competição para visualizar o dashboard de equipas.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  const matchOptionsRaw = await getMatchOptionsByCompetition(selectedCompetitionId);
  const matchOptions = matchOptionsRaw.map((match) => ({
    id: match.id,
    matchdayNumber: match.matchdayNumber,
    opponentTeamName: match.opponentTeamName,
  }));
  const availableMatchIds = new Set(matchOptions.map((match) => match.id));

  const requestedSingleMatchId = parseOptionalId(params.matchId);
  const selectedSingleMatchId =
    requestedSingleMatchId && availableMatchIds.has(requestedSingleMatchId)
      ? requestedSingleMatchId
      : undefined;
  const selectedMultipleMatchIds = parseIdList(params.matchIds).filter((id) =>
    availableMatchIds.has(id),
  );
  const selectedMatchIds = mergeSelectedIds(selectedSingleMatchId, selectedMultipleMatchIds);
  const selectedMatchCount = selectedMatchIds.length;
  const shouldShowEvolutionCharts = selectedMatchCount > 1;

  const matchAggregates = await getAnalyzedTeamMatchAggregates(
    selectedCompetitionId,
    selectedMatchIds.length ? selectedMatchIds : undefined,
  );
  const totals = aggregateTeamDashboardTotals(matchAggregates);

  const offensiveData = buildTeamOffensiveChartData(totals);
  const percentageRows = buildTeamPercentageRows(totals);
  const goalkeeperSummary = buildGoalkeeperSummary(totals);
  const numericRows = buildTeamNumericRows(totals);
  const evolutionCharts = buildTeamEvolutionCharts(matchAggregates);
  const modeLabel = buildModeLabel(selectedMatchCount);

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Dashboard de Equipas</h1>

      <TeamDashboardFilters
        competitions={competitions}
        matches={matchOptions}
        selectedCompetitionId={selectedCompetitionId}
        selectedMatchId={selectedSingleMatchId}
        selectedMatchIds={selectedMultipleMatchIds}
        modeLabel={modeLabel}
      />

      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Ações Ofensivas</CardTitle>
          <CardDescription>Totais agregados da equipa no filtro atual.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamOffensiveChart data={offensiveData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações Percentuais</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamPercentageTable rows={percentageRows} goalkeeper={goalkeeperSummary} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações Numéricas</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamNumericTable rows={numericRows} />
        </CardContent>
      </Card>

      {shouldShowEvolutionCharts ? (
        <Card>
          <CardHeader>
            <CardTitle>Gráficos Evolutivos</CardTitle>
            <CardDescription>
              Evolução por jornada do Feirense para as métricas selecionadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamEvolutionCharts charts={evolutionCharts} />
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
