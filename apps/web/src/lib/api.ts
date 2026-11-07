const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.message ?? "Unexpected error"), {
      status: res.status,
    });
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
