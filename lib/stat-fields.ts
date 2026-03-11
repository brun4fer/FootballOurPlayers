export const outfieldStatFields = [
  { key: "minutesPlayed", label: "Minutes Played" },
  { key: "shortPassSuccess", label: "Short Pass Success" },
  { key: "shortPassFail", label: "Short Pass Fail" },
  { key: "longPassSuccess", label: "Long Pass Success" },
  { key: "longPassFail", label: "Long Pass Fail" },
  { key: "crossSuccess", label: "Cross Success" },
  { key: "crossFail", label: "Cross Fail" },
  { key: "dribbleSuccess", label: "Dribble Success" },
  { key: "dribbleFail", label: "Dribble Fail" },
  { key: "throwSuccess", label: "Throw Success" },
  { key: "throwFail", label: "Throw Fail" },
  { key: "shotsOnTarget", label: "Shots On Target" },
  { key: "shotsOffTarget", label: "Shots Off Target" },
  { key: "aerialDuelSuccess", label: "Aerial Duel Success" },
  { key: "aerialDuelFail", label: "Aerial Duel Fail" },
  { key: "defensiveDuelSuccess", label: "Defensive Duel Success" },
  { key: "defensiveDuelFail", label: "Defensive Duel Fail" },
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "foulsSuffered", label: "Fouls Suffered" },
  { key: "foulsCommitted", label: "Fouls Committed" },
  { key: "recoveries", label: "Recoveries" },
  { key: "interceptions", label: "Interceptions" },
  { key: "offsides", label: "Offsides" },
  { key: "possessionLosses", label: "Possession Losses" },
  { key: "responsibilityGoal", label: "Responsibility Goal" },
  { key: "yellowCards", label: "Yellow Cards" },
  { key: "redCards", label: "Red Cards" },
] as const;

export const goalkeeperStatFields = [
  { key: "minutesPlayed", label: "Minutes Played" },
  { key: "saves", label: "Saves" },
  { key: "incompleteSaves", label: "Incomplete Saves" },
  { key: "shotsConceded", label: "Shots Conceded" },
  { key: "goalsConceded", label: "Goals Conceded" },
] as const;

export type OutfieldStatKey = (typeof outfieldStatFields)[number]["key"];
export type GoalkeeperStatKey = (typeof goalkeeperStatFields)[number]["key"];

export const offensiveDistributionKeys: Array<{
  key: OutfieldStatKey;
  label: string;
}> = [
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "shotsOnTarget", label: "Shots On Target" },
  { key: "shotsOffTarget", label: "Shots Off Target" },
  { key: "dribbleSuccess", label: "Dribbles Won" },
  { key: "crossSuccess", label: "Crosses Accurate" },
];
