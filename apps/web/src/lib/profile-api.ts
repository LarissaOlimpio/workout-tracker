import type {
  Equipment,
  Goal,
  Level,
} from "./profile-options";

export interface ProfileFormValues {
  birthDate: string;
  heightCm: string;
  weightKg: string;
  chestCm: string;
  waistCm: string;
  hipCm: string;
  goal: Goal;
  level: Level;
  days: number;
  equipment: Equipment[];
}

export async function saveProfile(values: ProfileFormValues): Promise<void> {
  void values;
  // TODO: PUT /users/me/profile
}
