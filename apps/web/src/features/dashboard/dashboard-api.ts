import { api } from "../../lib/api";

export interface DashboardData {
  goal: "lose_weight" | "gain_muscle" | "conditioning" | "maintain_health";
  weight: {
    currentKg: number;
    startKg: number;
    deltaKg: number;
    targetKg: number | null;
    progressPct: number | null;
  };
  bmi: {
    value: number;
    category: "underweight" | "normal" | "overweight" | "obese";
  };
  training: { goalPerWeek: number; currentPerWeek: number | null };
  weightSeries: { date: string; weightKg: number }[];
  measurementSeries: {
    date: string;
    chestCm: number | null;
    waistCm: number | null;
    hipCm: number | null;
  }[];
  history: {
    date: string;
    weightKg: number;
    chestCm: number | null;
    waistCm: number | null;
    hipCm: number | null;
  }[];
}

export interface MeasurementInput {
  measuredAt?: string;
  weightKg: number;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
}

export const dashboardQueryOptions = {
  queryKey: ["dashboard"],
  queryFn: () => api<DashboardData>("/users/me/dashboard"),
  retry: false,
};

export const createMeasurement = (input: MeasurementInput) =>
  api("/users/me/measurements", {
    method: "POST",
    body: JSON.stringify(input),
  });
