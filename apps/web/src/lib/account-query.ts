import { getMe } from "./account-api";

export const accountQueryOptions = {
  queryKey: ["account"] as const,
  queryFn: getMe,
};
