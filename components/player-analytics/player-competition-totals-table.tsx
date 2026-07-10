import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CompetitionPlayerTotalsRow = {
  playerId: number;
  playerName: string;
  teamId?: number;
  teamName: string;
  shortPassSuccess: number;
  shortPassFail: number;
  longPassSuccess: number;
  longPassFail: number;
  crossSuccess: number;
  crossFail: number;
  dribbleSuccess: number;
  dribbleFail: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  recoveries: number;
  interceptions: number;
  yellowCards: number;
  redCards: number;
};

export function PlayerCompetitionTotalsTable({
  rows,
}: {
  rows: CompetitionPlayerTotalsRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>PC Certos</TableHead>
            <TableHead>PC Falhados</TableHead>
            <TableHead>PL Certos</TableHead>
            <TableHead>PL Falhados</TableHead>
            <TableHead>Cruz. Certos</TableHead>
            <TableHead>Cruz. Falhados</TableHead>
            <TableHead>Individual Actions Certas</TableHead>
            <TableHead>Individual Actions Falhadas</TableHead>
            <TableHead>Shots Baliza</TableHead>
            <TableHead>Shots Fora</TableHead>
            <TableHead>Recoveries</TableHead>
            <TableHead>Interceptions</TableHead>
            <TableHead>Cards</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.playerId}>
                <TableCell>{row.playerName}</TableCell>
                <TableCell>{row.teamName}</TableCell>
                <TableCell>{row.shortPassSuccess}</TableCell>
                <TableCell>{row.shortPassFail}</TableCell>
                <TableCell>{row.longPassSuccess}</TableCell>
                <TableCell>{row.longPassFail}</TableCell>
                <TableCell>{row.crossSuccess}</TableCell>
                <TableCell>{row.crossFail}</TableCell>
                <TableCell>{row.dribbleSuccess}</TableCell>
                <TableCell>{row.dribbleFail}</TableCell>
                <TableCell>{row.shotsOnTarget}</TableCell>
                <TableCell>{row.shotsOffTarget}</TableCell>
                <TableCell>{row.recoveries}</TableCell>
                <TableCell>{row.interceptions}</TableCell>
                <TableCell>
                  {row.yellowCards}/{row.redCards}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={15} className="py-8 text-center text-sm text-muted-foreground">
                No players match the selected filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
