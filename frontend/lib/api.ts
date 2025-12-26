import { API_URL } from "./env";
import { getSession } from "./auth";

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const wantsAuth = init.auth ?? false;
  if (wantsAuth) {
    const session = getSession();
    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }
  }

  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data: unknown = await res.json();
      if (data && typeof data === "object" && "message" in data) {
        const m = (data as { message?: unknown }).message;
        if (typeof m === "string") message = m;
        if (Array.isArray(m) && typeof m[0] === "string") message = m[0];
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

