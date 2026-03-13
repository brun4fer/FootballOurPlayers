export const outfieldStatFields = [
  { key: "minutesPlayed", label: "Minutos Jogados" },
  { key: "shortPassSuccess", label: "Passes Curtos Certos" },
  { key: "shortPassFail", label: "Passes Curtos Falhados" },
  { key: "longPassSuccess", label: "Passes Longos Certos" },
  { key: "longPassFail", label: "Passes Longos Falhados" },
  { key: "crossSuccess", label: "Cruzamentos Certos" },
  { key: "crossFail", label: "Cruzamentos Falhados" },
  { key: "dribbleSuccess", label: "Dribles Certos" },
  { key: "dribbleFail", label: "Dribles Falhados" },
  { key: "throwSuccess", label: "Lançamentos Certos" },
  { key: "throwFail", label: "Lançamentos Falhados" },
  { key: "shotsOnTarget", label: "Remates à Baliza" },
  { key: "shotsOffTarget", label: "Remates Fora" },
  { key: "aerialDuelSuccess", label: "Duelos Aéreos Ganhos" },
  { key: "aerialDuelFail", label: "Duelos Aéreos Perdidos" },
  { key: "defensiveDuelSuccess", label: "Duelos Defensivos Ganhos" },
  { key: "defensiveDuelFail", label: "Duelos Defensivos Perdidos" },
  { key: "goals", label: "Golos" },
  { key: "assists", label: "Assistências" },
  { key: "foulsSuffered", label: "Faltas Sofridas" },
  { key: "foulsCommitted", label: "Faltas Cometidas" },
  { key: "recoveries", label: "Recuperações" },
  { key: "interceptions", label: "Interceções" },
  { key: "offsides", label: "Foras de Jogo" },
  { key: "possessionLosses", label: "Perdas de Posse" },
  { key: "responsibilityGoal", label: "Responsabilidade em Golo" },
  { key: "yellowCards", label: "Cartões Amarelos" },
  { key: "redCards", label: "Cartões Vermelhos" },
] as const;

export const goalkeeperStatFields = [
  { key: "minutesPlayed", label: "Minutos Jogados" },
  { key: "saves", label: "Defesas" },
  { key: "incompleteSaves", label: "Defesas Incompletas" },
  { key: "shotsConceded", label: "Remates Sofridos" },
  { key: "goalsConceded", label: "Golos Sofridos" },
] as const;

export type OutfieldStatKey = (typeof outfieldStatFields)[number]["key"];
export type GoalkeeperStatKey = (typeof goalkeeperStatFields)[number]["key"];

export const offensiveDistributionKeys: Array<{
  key: OutfieldStatKey;
  label: string;
}> = [
  { key: "goals", label: "Golos" },
  { key: "assists", label: "Assistências" },
  { key: "shotsOnTarget", label: "Remates à Baliza" },
  { key: "shotsOffTarget", label: "Remates Fora" },
  { key: "dribbleSuccess", label: "Dribles Ganhos" },
  { key: "crossSuccess", label: "Cruzamentos Certos" },
];
