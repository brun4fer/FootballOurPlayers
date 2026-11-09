import Link from "next/link";

import { deleteTrainingGpsStatsAction } from "@/actions/admin";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTrainingLabel, type TrainingGpsStatRow } from "@/lib/training-gps-data";

export function GpsTrainingRecordsTable({ records, seasonId }: { records: TrainingGpsStatRow[]; seasonId?: number }) {
  if (!records.length) {
    return <p className="text-sm text-muted-foreground">No GPS training records have been entered for this season.</p>;
  }

  return (
    <Table>
      <TableHeader><TableRow>
        <TableHead>Player</TableHead><TableHead>Training</TableHead><TableHead>Duration</TableHead>
        <TableHead>Total distance</TableHead><TableHead>Max speed</TableHead><TableHead className="text-right">Actions</TableHead>
      </TableRow></TableHeader>
      <TableBody>{records.map((record) => (
        <TableRow key={record.id}>
          <TableCell className="font-medium">{record.playerName}</TableCell>
          <TableCell>{formatTrainingLabel(record)}</TableCell>
          <TableCell>{record.minutesPlayed} min</TableCell>
          <TableCell>{record.totalDistance}</TableCell>
          <TableCell>{record.maximumSpeed}</TableCell>
          <TableCell><div className="flex justify-end gap-2">
            <Button asChild size="sm" variant="outline"><Link href={`/admin/gps/training?seasonId=${seasonId ?? ""}&trainingSessionId=${record.trainingSessionId}&playerId=${record.playerId}`}>Edit</Link></Button>
            <form action={deleteTrainingGpsStatsAction}>
              <input type="hidden" name="id" value={record.id}/>
              <ConfirmSubmitButton size="sm" variant="danger" confirmation={`Delete only the GPS training statistics for ${record.playerName}? The player and training will be kept.`}>Delete statistics</ConfirmSubmitButton>
            </form>
          </div></TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );
}
