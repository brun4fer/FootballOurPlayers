import { notFound } from "next/navigation";

import { PlayerMetricEvolutionChart } from "@/components/charts/player-metric-evolution-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  formatMatchLabel,
  getCompetitionOptions,
  getDashboardPlayersByCompetition,
  getGoalkeeperCompetitionMatchStats,
  getMatchOptionsByCompetition,
  getPlayerCompetitionMatchStats,
  getPublicReportById,
} from "@/lib/data";
import {
  aggregateGoalkeeperTotals,
  aggregateOutfieldTotals,
  buildGoalkeeperPercentualActions,
  buildNumericActions,
  buildPercentualActions,
  formatMetric,
  normalizeGoalkeeperRows,
  normalizeOutfieldRows,
  type GoalkeeperMatchRow,
  type OutfieldMatchRow,
} from "@/lib/dashboardMetrics";

type PublicReportPageProps = {
  params: Promise<{ id: string }>;
};

function mergeSelectedIds(...sources: Array<number[] | undefined>) {
  return [
    ...new Set(
      sources
        .flatMap((source) => source ?? [])
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
        .map((value) => Math.floor(value)),
    ),
  ];
}

type MetricChart = {
  title: string;
  color: string;
  data: Array<{
    matchLabel: string;
    matchdayNumber: number;
    opponentTeamName: string;
    total: number;
    total__minutes: number;
  }>;
};

type MatchAggregationRow = {
  matchLabel: string;
  matchdayNumber: number;
  opponentTeamName: string;
  minutesPlayed: number;
  shortPassSuccess: number;
  longPassSuccess: number;
  crossSuccess: number;
  dribbleSuccess: number;
  shotsTotal: number;
};

const CHART_LINES = [{ dataKey: "total", label: "Total", color: "#00e7ff" }];

function safePer90(total: number, minutes: number) {
  if (!minutes) {
    return 0;
  }
  return (total / minutes) * 90;
}

export default async function PublicReportPage({ params }: PublicReportPageProps) {
  const { id } = await params;
  const report = await getPublicReportById(id);

  if (!report) {
    notFound();
  }

  const competitions = await getCompetitionOptions();
  const selectedCompetitionId = Number(report.filters.competitionId) || competitions[0]?.id || undefined;

  if (!selectedCompetitionId) {
    notFound();
  }

  const [playerOptions, matchOptions] = await Promise.all([
    getDashboardPlayersByCompetition(selectedCompetitionId),
    getMatchOptionsByCompetition(selectedCompetitionId),
  ]);

  const selectedPlayerIds = mergeSelectedIds(
    report.filters.playerId ? [report.filters.playerId] : [],
    report.filters.playerIds,
    report.filters.selectedPlayers,
  );
  const selectedMatchIds = mergeSelectedIds(
    report.filters.matchId ? [report.filters.matchId] : [],
    report.filters.matchIds,
    report.filters.selectedMatchIds,
  );

  const selectedPlayerIdsInScope =
    selectedPlayerIds.length > 0 ? selectedPlayerIds : playerOptions.map((player) => player.id);
  const selectedMatchIdsInScope =
    selectedMatchIds.length > 0 ? selectedMatchIds : matchOptions.map((match) => match.id);

  const playerMap = new Map(playerOptions.map((player) => [player.id, player]));

  const outfieldRowsAll: OutfieldMatchRow[] = [];
  const goalkeeperRowsAll: GoalkeeperMatchRow[] = [];

  await Promise.all(
    selectedPlayerIdsInScope.map(async (playerId) => {
      const player = playerMap.get(playerId);
      const rawOutfieldRows = await getPlayerCompetitionMatchStats(
        playerId,
        selectedCompetitionId,
        selectedMatchIdsInScope.length ? selectedMatchIdsInScope : undefined,
      );

      outfieldRowsAll.push(
        ...normalizeOutfieldRows(rawOutfieldRows as Array<Record<string, unknown>>, {
          id: playerId,
          name: player?.name ?? `Jogador ${playerId}`,
        }),
      );

      if (player?.isGoalkeeper) {
        const rawGoalkeeperRows = await getGoalkeeperCompetitionMatchStats(
          playerId,
          selectedCompetitionId,
          selectedMatchIdsInScope.length ? selectedMatchIdsInScope : undefined,
        );
        goalkeeperRowsAll.push(
          ...normalizeGoalkeeperRows(rawGoalkeeperRows as Array<Record<string, unknown>>, playerId),
        );
      }
    }),
  );

  const totals = aggregateOutfieldTotals(outfieldRowsAll);
  const goalkeeperTotals = aggregateGoalkeeperTotals(goalkeeperRowsAll);
  const matchesPlayed = new Set(outfieldRowsAll.map((row) => row.matchId)).size;

  const percentualActions = buildPercentualActions(totals);
  const goalkeeperPercentual = buildGoalkeeperPercentualActions(goalkeeperTotals);
  const numericActions = buildNumericActions(totals, goalkeeperTotals, matchesPlayed);

  const competitionName =
    competitions.find((competition) => competition.id === selectedCompetitionId)?.name ??
    `Competicao ${selectedCompetitionId}`;
  const selectedPlayerNames = selectedPlayerIdsInScope
    .map((playerId) => playerMap.get(playerId)?.name)
    .filter((name): name is string => Boolean(name));
  const playerLabel = selectedPlayerNames.length > 0 ? selectedPlayerNames.join(", ") : "Todos os jogadores";

  const matchScope = matchOptions.filter((match) => selectedMatchIdsInScope.includes(match.id));
  const matchdaysLabel =
    matchScope.length > 0
      ? [...new Set(matchScope.map((match) => match.matchdayNumber))]
          .sort((a, b) => a - b)
          .map((matchday) => `J${matchday}`)
          .join(", ")
      : "Sem jornadas";

  const metricCharts: MetricChart[] = [
    { title: "Passes Curtos", color: "#00e7ff", data: [] },
    { title: "Passes Longos", color: "#ff2ea6", data: [] },
    { title: "Cruzamentos", color: "#22d3ee", data: [] },
    { title: "Acoes Individuais", color: "#84cc16", data: [] },
    { title: "Remates", color: "#f59e0b", data: [] },
  ];

  const rowsByMatch = new Map<number, MatchAggregationRow>(
    matchScope.map((match) => [
      match.id,
      {
        matchLabel: formatMatchLabel({
          opponentTeamName: match.opponentTeamName,
          matchdayNumber: match.matchdayNumber,
          homeAway: match.homeAway,
        }),
        matchdayNumber: match.matchdayNumber,
        opponentTeamName: match.opponentTeamName,
        minutesPlayed: 0,
        shortPassSuccess: 0,
        longPassSuccess: 0,
        crossSuccess: 0,
        dribbleSuccess: 0,
        shotsTotal: 0,
      },
    ]),
  );

  for (const row of outfieldRowsAll) {
    const current = rowsByMatch.get(row.matchId);
    if (!current) {
      continue;
    }
    current.minutesPlayed += Number(row.minutesPlayed ?? 0);
    current.shortPassSuccess += Number(row.shortPassSuccess ?? 0);
    current.longPassSuccess += Number(row.longPassSuccess ?? 0);
    current.crossSuccess += Number(row.crossSuccess ?? 0);
    current.dribbleSuccess += Number(row.dribbleSuccess ?? 0);
    current.shotsTotal += Number(row.shotsOnTarget ?? 0) + Number(row.shotsOffTarget ?? 0);
  }

  const orderedMatchRows = matchScope
    .map((match) => rowsByMatch.get(match.id))
    .filter((row): row is MatchAggregationRow => Boolean(row));

  metricCharts[0].data = orderedMatchRows.map((row) => ({
    matchLabel: row.matchLabel,
    matchdayNumber: row.matchdayNumber,
    opponentTeamName: row.opponentTeamName,
    total: row.shortPassSuccess,
    total__minutes: row.minutesPlayed,
  }));
  metricCharts[1].data = orderedMatchRows.map((row) => ({
    matchLabel: row.matchLabel,
    matchdayNumber: row.matchdayNumber,
    opponentTeamName: row.opponentTeamName,
    total: row.longPassSuccess,
    total__minutes: row.minutesPlayed,
  }));
  metricCharts[2].data = orderedMatchRows.map((row) => ({
    matchLabel: row.matchLabel,
    matchdayNumber: row.matchdayNumber,
    opponentTeamName: row.opponentTeamName,
    total: row.crossSuccess,
    total__minutes: row.minutesPlayed,
  }));
  metricCharts[3].data = orderedMatchRows.map((row) => ({
    matchLabel: row.matchLabel,
    matchdayNumber: row.matchdayNumber,
    opponentTeamName: row.opponentTeamName,
    total: row.dribbleSuccess,
    total__minutes: row.minutesPlayed,
  }));
  metricCharts[4].data = orderedMatchRows.map((row) => ({
    matchLabel: row.matchLabel,
    matchdayNumber: row.matchdayNumber,
    opponentTeamName: row.opponentTeamName,
    total: row.shotsTotal,
    total__minutes: row.minutesPlayed,
  }));

  const percentualRows = [
    { label: "Passe Curto", success: percentualActions.shortPass.success, fail: percentualActions.shortPass.fail, percentage: percentualActions.shortPass.percentage },
    { label: "Passe Longo", success: percentualActions.longPass.success, fail: percentualActions.longPass.fail, percentage: percentualActions.longPass.percentage },
    { label: "Cruzamentos", success: percentualActions.cross.success, fail: percentualActions.cross.fail, percentage: percentualActions.cross.percentage },
    { label: "Acoes Individuais", success: percentualActions.dribble.success, fail: percentualActions.dribble.fail, percentage: percentualActions.dribble.percentage },
    { label: "Lancamentos", success: percentualActions.throw.success, fail: percentualActions.throw.fail, percentage: percentualActions.throw.percentage },
    { label: "Remates", success: percentualActions.shot.success, fail: percentualActions.shot.fail, percentage: percentualActions.shot.percentage },
    { label: "Duelos Aereos", success: percentualActions.aerialDuel.success, fail: percentualActions.aerialDuel.fail, percentage: percentualActions.aerialDuel.percentage },
    { label: "Duelos Defensivos", success: percentualActions.defensiveDuel.success, fail: percentualActions.defensiveDuel.fail, percentage: percentualActions.defensiveDuel.percentage },
  ];

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">{"Relat\u00f3rio P\u00fablico"}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{"Resumo do Relat\u00f3rio"}</CardTitle>
          <CardDescription>Relatorio em modo read-only baseado nos filtros do dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Player name</p>
            <p className="mt-1 text-sm font-semibold text-cyan-200">{playerLabel}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Competition</p>
            <p className="mt-1 text-sm font-semibold text-cyan-200">{competitionName}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Matchdays</p>
            <p className="mt-1 text-sm font-semibold text-cyan-200">{matchdaysLabel}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{"A\u00e7\u00f5es Percentuais"}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metrica</TableHead>
                <TableHead>Sucesso</TableHead>
                <TableHead>Insucesso</TableHead>
                <TableHead>Percentagem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {percentualRows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{row.success}</TableCell>
                  <TableCell>{row.fail}</TableCell>
                  <TableCell>{formatMetric(row.percentage)}%</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>Defesas (GR)</TableCell>
                <TableCell>{goalkeeperPercentual.totalSaves}</TableCell>
                <TableCell>{goalkeeperPercentual.totalIncompleteSaves}</TableCell>
                <TableCell>{formatMetric(goalkeeperPercentual.savePercentage)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{"A\u00e7\u00f5es Num\u00e9ricas"}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metrica</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Por 90</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell>Faltas Sofridas</TableCell><TableCell>{numericActions.foulsSufferedTotal}</TableCell><TableCell>{formatMetric(numericActions.foulsSufferedPer90)}</TableCell></TableRow>
              <TableRow><TableCell>Faltas Cometidas</TableCell><TableCell>{numericActions.foulsCommittedTotal}</TableCell><TableCell>{formatMetric(numericActions.foulsCommittedPer90)}</TableCell></TableRow>
              <TableRow><TableCell>Recuperacoes</TableCell><TableCell>{numericActions.recoveriesTotal}</TableCell><TableCell>{formatMetric(numericActions.recoveriesPer90)}</TableCell></TableRow>
              <TableRow><TableCell>Intercecoes</TableCell><TableCell>{numericActions.interceptionsTotal}</TableCell><TableCell>{formatMetric(numericActions.interceptionsPer90)}</TableCell></TableRow>
              <TableRow><TableCell>Foras de Jogo</TableCell><TableCell>{numericActions.offsidesTotal}</TableCell><TableCell>{formatMetric(numericActions.offsidesPer90)}</TableCell></TableRow>
              <TableRow><TableCell>Perdas de Posse</TableCell><TableCell>{numericActions.possessionLossesTotal}</TableCell><TableCell>{formatMetric(numericActions.possessionLossesPer90)}</TableCell></TableRow>
              <TableRow><TableCell>Cartoes Amarelos</TableCell><TableCell>{numericActions.yellowCardsTotal}</TableCell><TableCell>{formatMetric(numericActions.yellowCardsPer90)}</TableCell></TableRow>
              <TableRow><TableCell>Cartoes Vermelhos</TableCell><TableCell>{numericActions.redCardsTotal}</TableCell><TableCell>{formatMetric(numericActions.redCardsPer90)}</TableCell></TableRow>
              <TableRow><TableCell>Responsabilidade em Golos</TableCell><TableCell>{numericActions.responsibilityGoalTotal}</TableCell><TableCell>{formatMetric(numericActions.responsibilityGoalPer90)}</TableCell></TableRow>
              <TableRow><TableCell>Remates Concedidos</TableCell><TableCell>{numericActions.shotsConcededTotal}</TableCell><TableCell>{formatMetric(numericActions.shotsConcededPer90)}</TableCell></TableRow>
              <TableRow><TableCell>Remates</TableCell><TableCell>{totals.shotsOnTarget + totals.shotsOffTarget}</TableCell><TableCell>{formatMetric(safePer90(totals.shotsOnTarget + totals.shotsOffTarget, totals.minutesPlayed))}</TableCell></TableRow>
              <TableRow><TableCell>Golos Sofridos</TableCell><TableCell>{numericActions.goalsConcededTotal}</TableCell><TableCell>{formatMetric(numericActions.goalsConcededPer90)}</TableCell></TableRow>
              <TableRow><TableCell>Golos Marcados</TableCell><TableCell>{totals.goals}</TableCell><TableCell>{formatMetric(safePer90(totals.goals, totals.minutesPlayed))}</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{"Gr\u00e1ficos"}</CardTitle>
          <CardDescription>Passes Curtos, Passes Longos, Cruzamentos, {"A\u00e7\u00f5es Individuais"} e Remates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {metricCharts.map((chart) => (
              <Card key={chart.title}>
                <CardHeader>
                  <CardTitle>{chart.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {chart.data.length > 0 ? (
                    <PlayerMetricEvolutionChart
                      data={chart.data}
                      lines={CHART_LINES.map((line) => ({ ...line, color: chart.color }))}
                      displayMode="per90"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem dados para este grafico.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
