import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type {
  CompetitionOption,
  MatchOption,
  PlayerOption,
} from "@/lib/playerAnalytics";

type SelectionMode = "none" | "single" | "multiple";

type PlayerAnalyticsFiltersProps = {
  competitions: CompetitionOption[];
  players?: PlayerOption[];
  matches?: MatchOption[];
  selectedCompetitionId?: number;
  selectedPlayerId?: number;
  selectedPlayerIds?: number[];
  selectedMatchId?: number;
  selectedMatchIds?: number[];
  playerMode?: SelectionMode;
  matchMode?: SelectionMode;
  title?: string;
  description?: string;
  playerLabel?: string;
  matchLabel?: string;
  submitLabel?: string;
};

export function PlayerAnalyticsFilters({
  competitions,
  players = [],
  matches = [],
  selectedCompetitionId,
  selectedPlayerId,
  selectedPlayerIds = [],
  selectedMatchId,
  selectedMatchIds = [],
  playerMode = "none",
  matchMode = "none",
  title = "Filtros",
  description,
  playerLabel = "Jogador",
  matchLabel = "Jornada",
  submitLabel = "Aplicar Filtros",
}: PlayerAnalyticsFiltersProps) {
  const visibleFields = 1 + (playerMode === "none" ? 0 : 1) + (matchMode === "none" ? 0 : 1);
  const formColumns =
    visibleFields >= 3 ? "lg:grid-cols-4" : visibleFields === 2 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  const buttonSpanClass =
    visibleFields >= 3 ? "lg:col-span-4" : visibleFields === 2 ? "lg:col-span-3" : "lg:col-span-2";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <form className={`grid gap-3 ${formColumns}`}>
          <div className="space-y-2">
            <Label htmlFor="competitionId">Competicao</Label>
            <NativeSelect
              id="competitionId"
              name="competitionId"
              defaultValue={String(selectedCompetitionId ?? "")}
            >
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          {playerMode === "single" ? (
            <div className="space-y-2">
              <Label htmlFor="playerId">{playerLabel}</Label>
              <NativeSelect
                id="playerId"
                name="playerId"
                defaultValue={String(selectedPlayerId ?? "")}
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
          ) : null}

          {playerMode === "multiple" ? (
            <div className="space-y-2">
              <Label htmlFor="playerIds">{playerLabel}</Label>
              <select
                id="playerIds"
                name="playerIds"
                multiple
                defaultValue={selectedPlayerIds.map(String)}
                className="h-32 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {matchMode === "single" ? (
            <div className="space-y-2">
              <Label htmlFor="matchId">{matchLabel}</Label>
              <NativeSelect
                id="matchId"
                name="matchId"
                defaultValue={String(selectedMatchId ?? "")}
              >
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    Jornada {match.matchdayNumber} vs {match.opponentTeamName}
                  </option>
                ))}
              </NativeSelect>
            </div>
          ) : null}

          {matchMode === "multiple" ? (
            <div className="space-y-2">
              <Label htmlFor="matchIds">{matchLabel}</Label>
              <select
                id="matchIds"
                name="matchIds"
                multiple
                defaultValue={selectedMatchIds.map(String)}
                className="h-32 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    Jornada {match.matchdayNumber} vs {match.opponentTeamName}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <Button className={buttonSpanClass}>{submitLabel}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
