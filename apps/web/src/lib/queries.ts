import { api } from "./api";

export const meQueryOptions = {
  queryKey: ["me"],
  queryFn: () => api<{ name: string }>("/users/me"),
  retry: false,
};
