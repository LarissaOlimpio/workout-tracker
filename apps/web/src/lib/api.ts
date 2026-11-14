const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body: { message?: unknown } = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message)
      ? body.message.filter((item): item is string => typeof item === "string").join("; ")
      : typeof body.message === "string"
        ? body.message
        : "Unexpected error";
    throw Object.assign(new Error(message), {
      status: res.status,
    });
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
