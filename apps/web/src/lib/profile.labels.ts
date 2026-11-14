import type { Equipment, Goal, Level } from "./profile-options";

export const profileLabels = {
  goal: {
    lose_weight: "Emagrecimento / perda de peso",
    gain_muscle: "Ganho de massa muscular",
    conditioning: "Condicionamento físico",
    maintain_health: "Manter a saúde",
  } satisfies Record<Goal, string>,
  level: {
    beginner: "Iniciante",
    intermediate: "Intermediário",
    advanced: "Avançado",
  } satisfies Record<Level, string>,
  levelDescription: {
    beginner: "Estou começando agora",
    intermediate: "Treino com alguma regularidade",
    advanced: "Treino há bastante tempo",
  } satisfies Record<Level, string>,
  equipment: {
    none: "Nenhum (apenas peso do corpo)",
    dumbbells: "Halteres",
    resistance_bands: "Faixas elásticas",
    pull_up_bar: "Barra fixa",
    kettlebell: "Kettlebell",
    bench: "Banco",
    treadmill: "Esteira",
  } satisfies Record<Equipment, string>,
} as const;
