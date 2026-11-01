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
  heightCm: number;
  birthDate: string;
}
