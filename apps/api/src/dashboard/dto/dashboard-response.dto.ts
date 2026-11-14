import { ProfileGoal } from '../../user/profile/types/user-profile.enums.js';

export class DashboardResponseDto {
  goal!: ProfileGoal;
  weight!: {
    currentKg: number;
    startKg: number;
    deltaKg: number;
    targetKg: number | null;
    progressPct: number | null;
  };
  bmi!: {
    value: number;
    category: 'underweight' | 'normal' | 'overweight' | 'obese';
  };
  training!: {
    goalPerWeek: number;
    currentPerWeek: null;
  };
  weightSeries!: { date: string; weightKg: number }[];
  measurementSeries!: {
    date: string;
    chestCm: number | null;
    waistCm: number | null;
    hipCm: number | null;
  }[];
  history!: {
    date: string;
    weightKg: number;
    chestCm: number | null;
    waistCm: number | null;
    hipCm: number | null;
  }[];
}
