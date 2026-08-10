export const outfieldStatFields = [
  { key: "minutesPlayed", label: "Minutes Played" },
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
] as const;

export const goalkeeperStatFields = [
  { key: "minutesPlayed", label: "Minutes Played" },
  { key: "saves", label: "Saves" },
  { key: "incompleteSaves", label: "Incomplete Saves" },
  { key: "shotsConceded", label: "Shots Faced" },
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
  { key: "shotsOnTarget", label: "Shots on Target" },
  { key: "shotsOffTarget", label: "Shots off Target" },
  { key: "dribbleSuccess", label: "Successful Individual Actions" },
  { key: "crossSuccess", label: "Successful Crosses" },
];
