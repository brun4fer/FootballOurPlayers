import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActionProfilePoint, ActionProfileScope } from "@/lib/playerAnalytics";

export function PlayerActionProfileTable({
  singleProfile,
  comparisonProfiles,
}: {
  singleProfile?: ActionProfilePoint[];
  comparisonProfiles?: ActionProfileScope[];
}) {
  if (singleProfile) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {singleProfile.map((row) => (
              <TableRow key={row.metric}>
                <TableCell>{row.metric}</TableCell>
                <TableCell>{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!comparisonProfiles || comparisonProfiles.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Short Passes</TableHead>
            <TableHead>Long Passes</TableHead>
            <TableHead>Cruzamentos</TableHead>
            <TableHead>Individual Actions</TableHead>
            <TableHead>Throw-ins</TableHead>
            <TableHead>Shots</TableHead>
            <TableHead>Aerial Duels</TableHead>
            <TableHead>Duels Defensivos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparisonProfiles.map((scope) => (
            <TableRow key={scope.key}>
              <TableCell>{scope.label}</TableCell>
              <TableCell>{scope.totals.shortPassSuccess + scope.totals.shortPassFail}</TableCell>
              <TableCell>{scope.totals.longPassSuccess + scope.totals.longPassFail}</TableCell>
              <TableCell>{scope.totals.crossSuccess + scope.totals.crossFail}</TableCell>
              <TableCell>{scope.totals.dribbleSuccess + scope.totals.dribbleFail}</TableCell>
              <TableCell>{scope.totals.throwSuccess + scope.totals.throwFail}</TableCell>
              <TableCell>{scope.totals.shotsOnTarget + scope.totals.shotsOffTarget}</TableCell>
              <TableCell>{scope.totals.aerialDuelSuccess + scope.totals.aerialDuelFail}</TableCell>
              <TableCell>
                {scope.totals.defensiveDuelSuccess + scope.totals.defensiveDuelFail}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
