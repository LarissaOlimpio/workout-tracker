import {
  ProfileEquipment,
  ProfileGoal,
  ProfileLevel,
} from '../types/user-profile.enums.js';

export class UserProfileResponseDto {
  goal: ProfileGoal;
  level: ProfileLevel;
  daysPerWeek: number;
  equipment: ProfileEquipment[];
  weightKg: number;
  targetWeightKg: number | null;
  heightCm: number;
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  birthDate: string;
}
