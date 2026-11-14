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
