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
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  birthDate: string;
}

export interface RecommendedVideo {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  durationSeconds: number;
  myFeedback: "like" | "dislike" | null;
}

export interface RecommendationResponse {
  videos: RecommendedVideo[];
}

export const getProfile = () => api<UserProfile>("/users/me/profile");

export const getRecommendations = () =>
  api<RecommendationResponse>("/users/me/recommendations");

export const setFeedback = (videoId: string, rating: "like" | "dislike") =>
  api<{ rating: "like" | "dislike" }>(`/videos/${videoId}/feedback`, {
    method: "PUT",
    body: JSON.stringify({ rating }),
  });

export const clearFeedback = (videoId: string) =>
  api<void>(`/videos/${videoId}/feedback`, { method: "DELETE" });

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
      chestCm: values.chestCm.trim() === "" ? null : Number(values.chestCm.replace(",", ".")),
      waistCm: values.waistCm.trim() === "" ? null : Number(values.waistCm.replace(",", ".")),
      hipCm: values.hipCm.trim() === "" ? null : Number(values.hipCm.replace(",", ".")),
      birthDate: `${year}-${month}-${day}`,
    }),
  });
}
