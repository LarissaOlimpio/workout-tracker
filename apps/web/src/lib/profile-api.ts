import type {
  Equipment,
  Goal,
  Level,
} from "./profile-options";
import { api } from "./api";

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

export interface UserProfile {
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  equipment: Equipment[];
  weightKg: number;
  heightCm: number;
  birthDate: string;
}

export const getProfile = () => api<UserProfile>("/users/me/profile");

export async function saveProfile(values: ProfileFormValues): Promise<void> {
  const [day, month, year] = values.birthDate.split("/");
  await api<UserProfile>("/users/me/profile", {
    method: "PUT",
    body: JSON.stringify({
      goal: values.goal,
      level: values.level,
      daysPerWeek: values.days,
      equipment: values.equipment,
      weightKg: Number(values.weightKg.replace(",", ".")),
      heightCm: Number(values.heightCm.replace(",", ".")),
      birthDate: `${year}-${month}-${day}`,
    }),
  });
}
