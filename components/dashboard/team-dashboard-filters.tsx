import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

type CompetitionOption = {
  id: number;
  name: string;
};

type MatchOption = {
  id: number;
  matchdayNumber: number;
  opponentTeamName: string;
};

type TeamDashboardFiltersProps = {
  competitions: CompetitionOption[];
  matches: MatchOption[];
  selectedCompetitionId?: number;
  selectedMatchId?: number;
  selectedMatchIds: number[];
  modeLabel: string;
};

export function TeamDashboardFilters({
  competitions,
  matches,
  selectedCompetitionId,
  selectedMatchId,
  selectedMatchIds,
  modeLabel,
}: TeamDashboardFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>{modeLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="competitionId">Competition</Label>
            <NativeSelect id="competitionId" name="competitionId" defaultValue={String(selectedCompetitionId ?? "")}>
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="matchId">Matchday (opcional)</Label>
            <NativeSelect id="matchId" name="matchId" defaultValue={String(selectedMatchId ?? "")}>
              <option value="">All matchdays</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  Matchday {match.matchdayNumber} x {match.opponentTeamName}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="matchIds">Select multiple matchdays</Label>
            <select
              id="matchIds"
              name="matchIds"
              multiple
              defaultValue={selectedMatchIds.map(String)}
              className="h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  Feirense x {match.opponentTeamName} (Matchday {match.matchdayNumber})
                </option>
              ))}
            </select>
          </div>

          <Button className="lg:col-span-4">Apply Filters</Button>
        </form>
      </CardContent>
    </Card>
  );
}
