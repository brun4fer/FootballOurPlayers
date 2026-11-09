import Link from "next/link";

import { deleteGpsMatchStatsAction } from "@/actions/admin";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { GpsStatRow } from "@/lib/gps-data";

export function GpsMatchRecordsTable({ records, competitionId }: { records: GpsStatRow[]; competitionId?: number }) {
  if (!records.length) {
    return <p className="text-sm text-muted-foreground">No GPS match records have been entered for this competition.</p>;
  }

  return (
    <Table>
      <TableHeader><TableRow>
        <TableHead>Player</TableHead><TableHead>Match</TableHead><TableHead>Minutes</TableHead>
        <TableHead>Total distance</TableHead><TableHead>Max speed</TableHead><TableHead className="text-right">Actions</TableHead>
      </TableRow></TableHeader>
      <TableBody>{records.map((record) => (
        <TableRow key={record.id}>
          <TableCell className="font-medium">{record.playerName}</TableCell>
          <TableCell>MD {record.matchdayNumber} · {record.opponentTeamName} · {record.matchDate}</TableCell>
          <TableCell>{record.minutesPlayed} min</TableCell>
          <TableCell>{record.totalDistance}</TableCell>
          <TableCell>{record.maximumSpeed}</TableCell>
          <TableCell><div className="flex justify-end gap-2">
            <Button asChild size="sm" variant="outline"><Link href={`/admin/gps/matches?competitionId=${competitionId ?? ""}&matchId=${record.matchId}&playerId=${record.playerId}`}>Edit</Link></Button>
            <form action={deleteGpsMatchStatsAction}>
              <input type="hidden" name="id" value={record.id}/>
              <ConfirmSubmitButton size="sm" variant="danger" confirmation={`Delete only the GPS match statistics for ${record.playerName}? The player and match will be kept.`}>Delete statistics</ConfirmSubmitButton>
            </form>
          </div></TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );
}
