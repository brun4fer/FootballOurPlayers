import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { CompetitionOption, TeamMatchOption } from "@/lib/teamAnalytics";

type SelectionMode = "none" | "single" | "multiple";

type TeamAnalyticsFiltersProps = {
  competitions: CompetitionOption[];
  matches?: TeamMatchOption[];
  selectedCompetitionId?: number;
  selectedMatchId?: number;
  selectedMatchIds?: number[];
  matchMode?: SelectionMode;
  title?: string;
  description?: string;
  matchLabel?: string;
  submitLabel?: string;
};

export function TeamAnalyticsFilters({
  competitions,
  matches = [],
  selectedCompetitionId,
  selectedMatchId,
  selectedMatchIds = [],
  matchMode = "none",
  title = "Filtros",
  description,
  matchLabel = "Jornada",
  submitLabel = "Aplicar Filtros",
}: TeamAnalyticsFiltersProps) {
  const visibleFields = 1 + (matchMode === "none" ? 0 : 1);
  const formColumns = visibleFields === 2 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  const buttonSpanClass = visibleFields === 2 ? "lg:col-span-3" : "lg:col-span-2";

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
