import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CompetitionPlayerTotalsRow = {
  playerId: number;
  playerName: string;
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
            <TableHead>Jogador</TableHead>
            <TableHead>Equipa</TableHead>
            <TableHead>PC Certos</TableHead>
            <TableHead>PC Falhados</TableHead>
            <TableHead>PL Certos</TableHead>
            <TableHead>PL Falhados</TableHead>
            <TableHead>Cruz. Certos</TableHead>
            <TableHead>Cruz. Falhados</TableHead>
            <TableHead>Dribles Certos</TableHead>
            <TableHead>Dribles Falhados</TableHead>
            <TableHead>Remates Baliza</TableHead>
            <TableHead>Remates Fora</TableHead>
            <TableHead>Recuperacoes</TableHead>
            <TableHead>Intercecoes</TableHead>
            <TableHead>Cartoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
