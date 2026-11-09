export const goalOptions = [
  "lose_weight",
  "gain_muscle",
  "conditioning",
  "maintain_health",
] as const;

export const levelOptions = ["beginner", "intermediate", "advanced"] as const;

export const equipmentOptions = [
  "none",
  "dumbbells",
  "resistance_bands",
  "pull_up_bar",
  "kettlebell",
  "bench",
  "treadmill",
] as const;

export const daysOptions = [1, 2, 3, 4, 5, 6, 7] as const;

export type Goal = (typeof goalOptions)[number];
export type Level = (typeof levelOptions)[number];
export type Equipment = (typeof equipmentOptions)[number];
export type TrainingDays = (typeof daysOptions)[number];

export const labels = {
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
  days: {
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
  } satisfies Record<TrainingDays, string>,
};
