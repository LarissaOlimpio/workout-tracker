import { clearAccessToken, getAccessToken, setAccessToken } from "./token";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
let refreshPromise: Promise<string | null> | null = null;

export function refreshAccessToken() {
  refreshPromise ??= fetch(`${BASE_URL}/auth/refresh`, {
    method: "Post",
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) {
        clearAccessToken();
        return null;
      }
      const { accessToken } = await res.json();
      setAccessToken(accessToken);
      return accessToken as string;
    })
    .catch(() => {
      clearAccessToken();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}
function request(path: string, options: RequestInit, token: string | null) {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let res = await request(path, options, getAccessToken());
  if (res.status === 401 && !path.startsWith("/auth/")) {
    const newToken = await refreshAccessToken();
    if (newToken) res = await request(path, options, newToken);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Unexpected error");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
