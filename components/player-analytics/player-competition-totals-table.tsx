import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CompetitionPlayerTotalsRow = {
  playerId: number;
  playerName: string;
  teamId?: number;
  teamName: string;
  minutesPlayed: number;
  shortPassSuccess: number;
  shortPassFail: number;
  longPassSuccess: number;
  longPassFail: number;
  crossSuccess: number;
  crossFail: number;
  dribbleSuccess: number;
  dribbleFail: number;
  throwSuccess: number;
  throwFail: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  aerialDuelSuccess: number;
  aerialDuelFail: number;
  defensiveDuelSuccess: number;
  defensiveDuelFail: number;
  defensivePositioningToCorrect: number;
  throughPasses: number;
  runsInBehind: number;
  setPieceCrossSuccess: number;
  setPieceCrossFail: number;
  interceptedCrosses: number;
  goals: number;
  assists: number;
  foulsSuffered: number;
  foulsCommitted: number;
  recoveries: number;
  interceptions: number;
  offsides: number;
  possessionLosses: number;
  responsibilityGoal: number;
  yellowCards: number;
  redCards: number;
  manualPossessionLosses?: boolean;
};

export const competitionPlayerTotalsColumns: Array<{
  key: Exclude<keyof CompetitionPlayerTotalsRow, "playerId" | "teamId" | "manualPossessionLosses">;
  label: string;
}> = [
  { key: "playerName", label: "Player" },
  { key: "teamName", label: "Team" },
  { key: "shortPassSuccess", label: "Successful Short Passes" },
  { key: "shortPassFail", label: "Unsuccessful Short Passes" },
  { key: "longPassSuccess", label: "Successful Long Passes" },
  { key: "longPassFail", label: "Unsuccessful Long Passes" },
  { key: "crossSuccess", label: "Successful Crosses" },
  { key: "crossFail", label: "Unsuccessful Crosses" },
  { key: "dribbleSuccess", label: "Successful Individual Actions" },
  { key: "dribbleFail", label: "Unsuccessful Individual Actions" },
  { key: "throwSuccess", label: "Successful Throw-ins" },
  { key: "throwFail", label: "Unsuccessful Throw-ins" },
  { key: "shotsOnTarget", label: "Shots on Target" },
  { key: "shotsOffTarget", label: "Shots off Target" },
  { key: "aerialDuelSuccess", label: "Aerial Duels Won" },
  { key: "aerialDuelFail", label: "Aerial Duels Lost" },
  { key: "defensiveDuelSuccess", label: "Defensive Duels Won" },
  { key: "defensiveDuelFail", label: "Defensive Duels Lost" },
  { key: "defensivePositioningToCorrect", label: "Defensive Positioning to Correct" },
  { key: "throughPasses", label: "Through Passes" },
  { key: "runsInBehind", label: "Runs in Behind" },
  { key: "setPieceCrossSuccess", label: "Successful Set-Piece Crosses" },
  { key: "setPieceCrossFail", label: "Unsuccessful Set-Piece Crosses" },
  { key: "interceptedCrosses", label: "Intercepted Crosses" },
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "foulsSuffered", label: "Fouls Won" },
  { key: "foulsCommitted", label: "Fouls Committed" },
  { key: "recoveries", label: "Recoveries" },
  { key: "interceptions", label: "Interceptions" },
  { key: "offsides", label: "Offsides" },
  { key: "possessionLosses", label: "Other Possession Losses" },
  { key: "responsibilityGoal", label: "Errors Leading to Goals" },
  { key: "yellowCards", label: "Yellow Cards" },
  { key: "redCards", label: "Red Cards" },
  { key: "minutesPlayed", label: "Minutes Played" },
];

export function getCompetitionPlayerTotalsColumns(manualPossessionLosses: boolean) {
  if (!manualPossessionLosses) {
    return competitionPlayerTotalsColumns;
  }

  return competitionPlayerTotalsColumns.map((column) =>
    column.key === "possessionLosses"
      ? { ...column, label: "Possession Losses" }
      : column,
  );
}

export function PlayerCompetitionTotalsTable({
  rows,
  columns = competitionPlayerTotalsColumns,
}: {
  rows: CompetitionPlayerTotalsRow[];
  columns?: typeof competitionPlayerTotalsColumns;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className="whitespace-nowrap">
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.playerId}>
                {columns.map((column) => (
                  <TableCell key={column.key} className="whitespace-nowrap">
                    {row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                No players match the selected filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
