export const playerPositionOptions = [
  "Guarda-Redes",
  "Defesa Direito",
  "Defesa Esquerdo",
  "Defesa Central",
  "Lateral Direito",
  "Lateral Esquerdo",
  "Médio Defensivo",
  "Médio Centro",
  "Médio Ofensivo",
  "Extremo Direito",
  "Extremo Esquerdo",
  "Avançado",
  "Ponta de Lança",
] as const;

const playerPositionLabels: Record<(typeof playerPositionOptions)[number], string> = {
  "Guarda-Redes": "Goalkeeper",
  "Defesa Direito": "Right-Back",
  "Defesa Esquerdo": "Left-Back",
  "Defesa Central": "Centre-Back",
  "Lateral Direito": "Right Wing-Back",
  "Lateral Esquerdo": "Left Wing-Back",
  "Médio Defensivo": "Defensive Midfielder",
  "Médio Centro": "Central Midfielder",
  "Médio Ofensivo": "Attacking Midfielder",
  "Extremo Direito": "Right Winger",
  "Extremo Esquerdo": "Left Winger",
  "Avançado": "Forward",
  "Ponta de Lança": "Striker",
};

export function formatPlayerPosition(position: string | null | undefined) {
  return position ? playerPositionLabels[position as keyof typeof playerPositionLabels] ?? position : "—";
}
