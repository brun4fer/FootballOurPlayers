import Link from "next/link";

import { upsertGoalkeeperStatsAction, upsertPlayerStatsAction } from "@/actions/admin";
import { NumericStatFields } from "@/components/admin/numeric-stat-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  formatMatchLabel,
  getAnalyzedTeamPlayerOptionsByCompetition,
  getCalculatedTeamTotalsByMatch,
  getCompetitionOptions,
  getExistingGoalkeeperStats,
  getExistingPlayerMatchStats,
  getMatchOptionsByCompetition,
} from "@/lib/data";
import { goalkeeperStatFields, outfieldStatFields } from "@/lib/stat-fields";

type StatsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseOptionalId(value: string | string[] | undefined) {
  if (!value || Array.isArray(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

const emptyTeamTotals: Record<string, number> = {
  minutesPlayed: 0,
  shortPassSuccess: 0,
  shortPassFail: 0,
  longPassSuccess: 0,
  longPassFail: 0,
  crossSuccess: 0,
  crossFail: 0,
  dribbleSuccess: 0,
  dribbleFail: 0,
  throwSuccess: 0,
  throwFail: 0,
  shotsOnTarget: 0,
  shotsOffTarget: 0,
  aerialDuelSuccess: 0,
  aerialDuelFail: 0,
  defensiveDuelSuccess: 0,
  defensiveDuelFail: 0,
  goals: 0,
  assists: 0,
  foulsSuffered: 0,
  foulsCommitted: 0,
  recoveries: 0,
  interceptions: 0,
  offsides: 0,
  possessionLosses: 0,
  responsibilityGoal: 0,
  yellowCards: 0,
  redCards: 0,
};

export default async function AdminStatsPage({ searchParams }: StatsPageProps) {
  const params = (await searchParams) ?? {};
  const competitionOptions = await getCompetitionOptions();
  const selectedCompetitionId =
    parseOptionalId(params.competitionId) ?? competitionOptions[0]?.id;
  const selectedMatchId = parseOptionalId(params.matchId);
  const selectedPlayerId = parseOptionalId(params.playerId);

  const [matchOptions, playerOptions] = await Promise.all([
    getMatchOptionsByCompetition(selectedCompetitionId),
    getAnalyzedTeamPlayerOptionsByCompetition(selectedCompetitionId),
  ]);

  const selectedPlayer = playerOptions.find((player) => player.id === selectedPlayerId);

  const [existingPlayerStats, existingGoalkeeperStats, calculatedTeamTotals] = await Promise.all([
    getExistingPlayerMatchStats(selectedPlayerId, selectedMatchId),
    getExistingGoalkeeperStats(selectedPlayerId, selectedMatchId),
    getCalculatedTeamTotalsByMatch(selectedMatchId),
  ]);

  const totalsByKey: Record<string, number> = {
    ...emptyTeamTotals,
    ...(calculatedTeamTotals ?? {}),
  };

  return (
    <section className="space-y-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold">Inserir Estatísticas</h1>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Administração</CardTitle>
          <CardDescription>
            1. Selecionar competição 2. Selecionar jogo 3. Selecionar jogador 4. Inserir totais
          </CardDescription>
          <p className="text-xs text-muted-foreground">
            A equipa analisada é sempre o <strong>Feirense</strong>.
          </p>
          <p className="text-xs text-muted-foreground">
            Se alterar a competição, clique em <strong>Carregar Seleção</strong> para atualizar
            jogos e jogadores.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="competitionId">Competição</Label>
              <NativeSelect
                id="competitionId"
                name="competitionId"
                defaultValue={String(selectedCompetitionId ?? "")}
              >
                <option value="">Selecionar competição</option>
                {competitionOptions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="matchId">Jogo</Label>
              <NativeSelect id="matchId" name="matchId" defaultValue={String(selectedMatchId ?? "")}>
                <option value="">Selecionar jogo</option>
                {matchOptions.length === 0 ? (
                  <option value="" disabled>
                    Sem jogos disponíveis
                  </option>
                ) : null}
                {matchOptions.map((match) => (
                  <option key={match.id} value={match.id}>
                    {formatMatchLabel({
                      opponentTeamName: match.opponentTeamName,
                      matchdayNumber: match.matchdayNumber,
                      homeAway: match.homeAway,
                    })}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="playerId">Jogador</Label>
              <NativeSelect id="playerId" name="playerId" defaultValue={String(selectedPlayerId ?? "")}>
                <option value="">Selecionar jogador</option>
                {playerOptions.length === 0 ? (
                  <option value="" disabled>
                    Sem jogadores do Feirense disponíveis
                  </option>
                ) : null}
                {playerOptions.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <Button className="sm:col-span-2 xl:col-span-3">Carregar Seleção</Button>
          </form>
        </CardContent>
      </Card>

      {selectedMatchId ? (
        <Card>
          <CardHeader>
            <CardTitle>Totais da Equipa por Jogo</CardTitle>
            <CardDescription>
              Totais agregados do Feirense calculados automaticamente a partir das estatísticas dos
              jogadores do jogo selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {outfieldStatFields.map((field) => (
                <div key={field.key} className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-200">{totalsByKey[field.key] ?? 0}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {selectedMatchId && selectedPlayerId ? (
        <Card>
          <CardHeader>
            <CardTitle>Totais do Jogador por Jogo</CardTitle>
            <CardDescription>
              Guardar os totais do jogador de campo para o jogo selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/report/player/${selectedPlayerId}`}>Abrir Relatório Público</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/dashboard/jogadores?competitionId=${selectedCompetitionId ?? ""}&playerId=${selectedPlayerId}`}>
                  Abrir Dashboard do Jogador
                </Link>
              </Button>
            </div>
            <form action={upsertPlayerStatsAction} className="space-y-4">
              <input type="hidden" name="matchId" value={selectedMatchId} />
              <input type="hidden" name="playerId" value={selectedPlayerId} />
              <NumericStatFields fields={outfieldStatFields} values={existingPlayerStats ?? undefined} />
              <Button>Guardar Estatísticas do Jogador</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {selectedMatchId && selectedPlayerId && selectedPlayer?.isGoalkeeper ? (
        <Card>
          <CardHeader>
            <CardTitle>Totais do Guarda-Redes por Jogo</CardTitle>
            <CardDescription>
              As métricas de guarda-redes são visíveis apenas para jogadores marcados como
              guarda-redes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={upsertGoalkeeperStatsAction} className="space-y-4">
              <input type="hidden" name="matchId" value={selectedMatchId} />
              <input type="hidden" name="playerId" value={selectedPlayerId} />
              <NumericStatFields
                fields={goalkeeperStatFields}
                values={existingGoalkeeperStats ?? undefined}
              />
              <Button>Guardar Estatísticas de Guarda-Redes</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
