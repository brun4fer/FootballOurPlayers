type UnknownRow = Record<string, unknown>;

export type OutfieldMatchRow = {
  playerId: number;
  playerName: string;
  matchId: number;
  matchdayNumber: number;
  date: string;
  opponentTeamName: string;
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
};

export type GoalkeeperMatchRow = {
  playerId: number;
  matchId: number;
  matchdayNumber: number;
  date: string;
  opponentTeamName: string;
  minutesPlayed: number;
  saves: number;
  incompleteSaves: number;
  shotsConceded: number;
  goalsConceded: number;
};

export type OutfieldTotals = Omit<
  OutfieldMatchRow,
  "playerId" | "playerName" | "matchId" | "matchdayNumber" | "date" | "opponentTeamName"
>;

export type GoalkeeperTotals = Omit<
  GoalkeeperMatchRow,
  "playerId" | "matchId" | "matchdayNumber" | "date" | "opponentTeamName"
>;

const EMPTY_OUTFIELD_TOTALS: OutfieldTotals = {
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

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMetric(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.00";
}

export function percent(success: number, fail: number) {
  const denominator = success + fail;
  if (!denominator) {
    return 0;
  }
  return (success / denominator) * 100;
}

export function per90(value: number, minutesPlayed: number) {
  if (!minutesPlayed) {
    return 0;
  }
  return (value / minutesPlayed) * 90;
}

export function normalizeOutfieldRows(
  rows: UnknownRow[],
  playerMeta?: { id: number; name: string },
): OutfieldMatchRow[] {
  return rows
    .map((row) => ({
      playerId: toNumber(row.playerId) || playerMeta?.id || 0,
      playerName: String(row.playerName ?? playerMeta?.name ?? "-"),
      matchId: toNumber(row.matchId),
      matchdayNumber: toNumber(row.matchdayNumber),
      date: String(row.date ?? ""),
      opponentTeamName: String(row.opponentTeamName ?? "-"),
      minutesPlayed: toNumber(row.minutesPlayed),
      shortPassSuccess: toNumber(row.shortPassSuccess),
      shortPassFail: toNumber(row.shortPassFail),
      longPassSuccess: toNumber(row.longPassSuccess),
      longPassFail: toNumber(row.longPassFail),
      crossSuccess: toNumber(row.crossSuccess),
      crossFail: toNumber(row.crossFail),
      dribbleSuccess: toNumber(row.dribbleSuccess),
      dribbleFail: toNumber(row.dribbleFail),
      throwSuccess: toNumber(row.throwSuccess),
      throwFail: toNumber(row.throwFail),
      shotsOnTarget: toNumber(row.shotsOnTarget),
      shotsOffTarget: toNumber(row.shotsOffTarget),
      aerialDuelSuccess: toNumber(row.aerialDuelSuccess),
      aerialDuelFail: toNumber(row.aerialDuelFail),
      defensiveDuelSuccess: toNumber(row.defensiveDuelSuccess),
      defensiveDuelFail: toNumber(row.defensiveDuelFail),
      goals: toNumber(row.goals),
      assists: toNumber(row.assists),
      foulsSuffered: toNumber(row.foulsSuffered),
      foulsCommitted: toNumber(row.foulsCommitted),
      recoveries: toNumber(row.recoveries),
      interceptions: toNumber(row.interceptions),
      offsides: toNumber(row.offsides),
      possessionLosses: toNumber(row.possessionLosses),
      responsibilityGoal: toNumber(row.responsibilityGoal),
      yellowCards: toNumber(row.yellowCards),
      redCards: toNumber(row.redCards),
    }))
    .sort(
      (a, b) =>
        a.matchdayNumber - b.matchdayNumber ||
        a.date.localeCompare(b.date) ||
        a.playerName.localeCompare(b.playerName),
    );
}

export function normalizeGoalkeeperRows(
  rows: UnknownRow[],
  playerId = 0,
): GoalkeeperMatchRow[] {
  return rows
    .map((row) => ({
      playerId: toNumber(row.playerId) || playerId,
      matchId: toNumber(row.matchId),
      matchdayNumber: toNumber(row.matchdayNumber),
      date: String(row.date ?? ""),
      opponentTeamName: String(row.opponentTeamName ?? "-"),
      minutesPlayed: toNumber(row.minutesPlayed),
      saves: toNumber(row.saves),
      incompleteSaves: toNumber(row.incompleteSaves),
      shotsConceded: toNumber(row.shotsConceded),
      goalsConceded: toNumber(row.goalsConceded),
    }))
    .sort((a, b) => a.matchdayNumber - b.matchdayNumber || a.date.localeCompare(b.date));
}

export function aggregateOutfieldTotals(rows: OutfieldMatchRow[]): OutfieldTotals {
  return rows.reduce<OutfieldTotals>(
    (acc, row) => ({
      minutesPlayed: acc.minutesPlayed + row.minutesPlayed,
      shortPassSuccess: acc.shortPassSuccess + row.shortPassSuccess,
      shortPassFail: acc.shortPassFail + row.shortPassFail,
      longPassSuccess: acc.longPassSuccess + row.longPassSuccess,
      longPassFail: acc.longPassFail + row.longPassFail,
      crossSuccess: acc.crossSuccess + row.crossSuccess,
      crossFail: acc.crossFail + row.crossFail,
      dribbleSuccess: acc.dribbleSuccess + row.dribbleSuccess,
      dribbleFail: acc.dribbleFail + row.dribbleFail,
      throwSuccess: acc.throwSuccess + row.throwSuccess,
      throwFail: acc.throwFail + row.throwFail,
      shotsOnTarget: acc.shotsOnTarget + row.shotsOnTarget,
      shotsOffTarget: acc.shotsOffTarget + row.shotsOffTarget,
      aerialDuelSuccess: acc.aerialDuelSuccess + row.aerialDuelSuccess,
      aerialDuelFail: acc.aerialDuelFail + row.aerialDuelFail,
      defensiveDuelSuccess: acc.defensiveDuelSuccess + row.defensiveDuelSuccess,
      defensiveDuelFail: acc.defensiveDuelFail + row.defensiveDuelFail,
      goals: acc.goals + row.goals,
      assists: acc.assists + row.assists,
      foulsSuffered: acc.foulsSuffered + row.foulsSuffered,
      foulsCommitted: acc.foulsCommitted + row.foulsCommitted,
      recoveries: acc.recoveries + row.recoveries,
      interceptions: acc.interceptions + row.interceptions,
      offsides: acc.offsides + row.offsides,
      possessionLosses: acc.possessionLosses + row.possessionLosses,
      responsibilityGoal: acc.responsibilityGoal + row.responsibilityGoal,
      yellowCards: acc.yellowCards + row.yellowCards,
      redCards: acc.redCards + row.redCards,
    }),
    { ...EMPTY_OUTFIELD_TOTALS },
  );
}

export function aggregateGoalkeeperTotals(rows: GoalkeeperMatchRow[]): GoalkeeperTotals {
  return rows.reduce<GoalkeeperTotals>(
    (acc, row) => ({
      minutesPlayed: acc.minutesPlayed + row.minutesPlayed,
      saves: acc.saves + row.saves,
      incompleteSaves: acc.incompleteSaves + row.incompleteSaves,
      shotsConceded: acc.shotsConceded + row.shotsConceded,
      goalsConceded: acc.goalsConceded + row.goalsConceded,
    }),
    {
      minutesPlayed: 0,
      saves: 0,
      incompleteSaves: 0,
      shotsConceded: 0,
      goalsConceded: 0,
    },
  );
}

export function buildPercentualActions(totals: OutfieldTotals) {
  return {
    shortPass: {
      success: totals.shortPassSuccess,
      fail: totals.shortPassFail,
      percentage: percent(totals.shortPassSuccess, totals.shortPassFail),
    },
    longPass: {
      success: totals.longPassSuccess,
      fail: totals.longPassFail,
      percentage: percent(totals.longPassSuccess, totals.longPassFail),
    },
    cross: {
      success: totals.crossSuccess,
      fail: totals.crossFail,
      percentage: percent(totals.crossSuccess, totals.crossFail),
    },
    dribble: {
      success: totals.dribbleSuccess,
      fail: totals.dribbleFail,
      percentage: percent(totals.dribbleSuccess, totals.dribbleFail),
    },
    throw: {
      success: totals.throwSuccess,
      fail: totals.throwFail,
      percentage: percent(totals.throwSuccess, totals.throwFail),
    },
    shot: {
      success: totals.shotsOnTarget,
      fail: totals.shotsOffTarget,
      percentage: percent(totals.shotsOnTarget, totals.shotsOffTarget),
    },
    aerialDuel: {
      success: totals.aerialDuelSuccess,
      fail: totals.aerialDuelFail,
      percentage: percent(totals.aerialDuelSuccess, totals.aerialDuelFail),
    },
    defensiveDuel: {
      success: totals.defensiveDuelSuccess,
      fail: totals.defensiveDuelFail,
      percentage: percent(totals.defensiveDuelSuccess, totals.defensiveDuelFail),
    },
  };
}

export function buildGoalkeeperPercentualActions(totals: GoalkeeperTotals) {
  return {
    totalSaves: totals.saves,
    totalIncompleteSaves: totals.incompleteSaves,
    savePercentage: percent(totals.saves, totals.incompleteSaves),
  };
}

export function buildNumericActions(
  outfieldTotals: OutfieldTotals,
  goalkeeperTotals: GoalkeeperTotals,
  matchesPlayed: number,
) {
  const minutes = outfieldTotals.minutesPlayed;
  const totalActions =
    outfieldTotals.shortPassSuccess +
    outfieldTotals.shortPassFail +
    outfieldTotals.longPassSuccess +
    outfieldTotals.longPassFail +
    outfieldTotals.crossSuccess +
    outfieldTotals.crossFail +
    outfieldTotals.dribbleSuccess +
    outfieldTotals.dribbleFail +
    outfieldTotals.throwSuccess +
    outfieldTotals.throwFail +
    outfieldTotals.shotsOnTarget +
    outfieldTotals.shotsOffTarget +
    outfieldTotals.aerialDuelSuccess +
    outfieldTotals.aerialDuelFail +
    outfieldTotals.defensiveDuelSuccess +
    outfieldTotals.defensiveDuelFail +
    outfieldTotals.recoveries +
    outfieldTotals.interceptions +
    outfieldTotals.foulsCommitted +
    outfieldTotals.foulsSuffered;

  return {
    foulsSufferedTotal: outfieldTotals.foulsSuffered,
    foulsSufferedPer90: per90(outfieldTotals.foulsSuffered, minutes),
    foulsCommittedTotal: outfieldTotals.foulsCommitted,
    foulsCommittedPer90: per90(outfieldTotals.foulsCommitted, minutes),
    recoveriesTotal: outfieldTotals.recoveries,
    recoveriesPer90: per90(outfieldTotals.recoveries, minutes),
    interceptionsTotal: outfieldTotals.interceptions,
    interceptionsPer90: per90(outfieldTotals.interceptions, minutes),
    offsidesTotal: outfieldTotals.offsides,
    offsidesPer90: per90(outfieldTotals.offsides, minutes),
    possessionLossesTotal: outfieldTotals.possessionLosses,
    possessionLossesPer90: per90(outfieldTotals.possessionLosses, minutes),
    yellowCardsTotal: outfieldTotals.yellowCards,
    yellowCardsPer90: per90(outfieldTotals.yellowCards, minutes),
    redCardsTotal: outfieldTotals.redCards,
    redCardsPer90: per90(outfieldTotals.redCards, minutes),
    responsibilityGoalTotal: outfieldTotals.responsibilityGoal,
    responsibilityGoalPer90: per90(outfieldTotals.responsibilityGoal, minutes),
    shotsConcededTotal: goalkeeperTotals.shotsConceded,
    shotsConcededPer90: per90(goalkeeperTotals.shotsConceded, minutes),
    goalsConcededTotal: goalkeeperTotals.goalsConceded,
    goalsConcededPer90: per90(goalkeeperTotals.goalsConceded, minutes),
    minutesTotal: minutes,
    averageMinutesPerMatch: matchesPlayed ? minutes / matchesPlayed : 0,
    totalActions,
    actionsPer90: per90(totalActions, minutes),
  };
}

export function buildComparisonMetrics(totals: OutfieldTotals) {
  const percentual = buildPercentualActions(totals);
  return {
    passAccuracy: (percentual.shortPass.percentage + percentual.longPass.percentage) / 2,
    crossAccuracy: percentual.cross.percentage,
    dribbleSuccess: percentual.dribble.percentage,
    duelSuccess:
      (percentual.aerialDuel.percentage + percentual.defensiveDuel.percentage) / 2,
    recoveries: totals.recoveries,
    interceptions: totals.interceptions,
    minutesPlayed: totals.minutesPlayed,
    longPassAccuracy: percentual.longPass.percentage,
    crossingAccuracy: percentual.cross.percentage,
    dribbleAccuracy: percentual.dribble.percentage,
  };
}

export function toOutfieldTotalsFromAggregate(row: UnknownRow): OutfieldTotals {
  return {
    minutesPlayed: toNumber(row.minutesPlayed),
    shortPassSuccess: toNumber(row.shortPassSuccess),
    shortPassFail: toNumber(row.shortPassFail),
    longPassSuccess: toNumber(row.longPassSuccess),
    longPassFail: toNumber(row.longPassFail),
    crossSuccess: toNumber(row.crossSuccess),
    crossFail: toNumber(row.crossFail),
    dribbleSuccess: toNumber(row.dribbleSuccess),
    dribbleFail: toNumber(row.dribbleFail),
    throwSuccess: toNumber(row.throwSuccess),
    throwFail: toNumber(row.throwFail),
    shotsOnTarget: toNumber(row.shotsOnTarget),
    shotsOffTarget: toNumber(row.shotsOffTarget),
    aerialDuelSuccess: toNumber(row.aerialDuelSuccess),
    aerialDuelFail: toNumber(row.aerialDuelFail),
    defensiveDuelSuccess: toNumber(row.defensiveDuelSuccess),
    defensiveDuelFail: toNumber(row.defensiveDuelFail),
    goals: toNumber(row.goals),
    assists: toNumber(row.assists),
    foulsSuffered: toNumber(row.foulsSuffered),
    foulsCommitted: toNumber(row.foulsCommitted),
    recoveries: toNumber(row.recoveries),
    interceptions: toNumber(row.interceptions),
    offsides: toNumber(row.offsides),
    possessionLosses: toNumber(row.possessionLosses),
    responsibilityGoal: toNumber(row.responsibilityGoal),
    yellowCards: toNumber(row.yellowCards),
    redCards: toNumber(row.redCards),
  };
}

export function buildOffensiveDistributionData(totals: OutfieldTotals) {
  return [
    { name: "Passes Curtos Certos", value: totals.shortPassSuccess },
    { name: "Passes Longos Certos", value: totals.longPassSuccess },
    { name: "Cruzamentos Certos", value: totals.crossSuccess },
    { name: "Dribles Certos", value: totals.dribbleSuccess },
    { name: "Remates à Baliza", value: totals.shotsOnTarget },
  ];
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function buildRadarProfileData(totals: OutfieldTotals) {
  const metrics = buildComparisonMetrics(totals);
  const shotAccuracy = percent(totals.shotsOnTarget, totals.shotsOffTarget);
  const defenseImpact = per90(totals.recoveries + totals.interceptions, totals.minutesPlayed);
  const finishingVolume = per90(totals.goals + totals.shotsOnTarget, totals.minutesPlayed);

  return [
    { metric: "Passing", value: clamp(metrics.passAccuracy) },
    { metric: "Crossing", value: clamp(metrics.crossAccuracy) },
    { metric: "Dribbling", value: clamp(metrics.dribbleSuccess) },
    { metric: "Duels", value: clamp(metrics.duelSuccess) },
    { metric: "Defense", value: clamp((defenseImpact / 20) * 100) },
    { metric: "Finishing", value: clamp(shotAccuracy * 0.6 + ((finishingVolume / 6) * 100) * 0.4) },
  ];
}

export function buildRadarComparisonData(primary: OutfieldTotals, secondary: OutfieldTotals) {
  const primaryData = buildRadarProfileData(primary);
  const secondaryData = buildRadarProfileData(secondary);

  return primaryData.map((entry, index) => ({
    metric: entry.metric,
    primary: entry.value,
    secondary: secondaryData[index]?.value ?? 0,
  }));
}

export function buildEvolutionChartData(rows: OutfieldMatchRow[]) {
  return rows.map((row) => ({
    matchLabel: `Feirense vs ${row.opponentTeamName} (Jornada ${row.matchdayNumber})`,
    remates: row.shotsOnTarget + row.shotsOffTarget,
    assists: row.assists,
    goals: row.goals,
    dribbles: row.dribbleSuccess,
    passesCertos: row.shortPassSuccess + row.longPassSuccess,
  }));
}
