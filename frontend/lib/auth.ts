export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "OWNER" | string;
  teamId?: string | null;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

const KEY = "auction.session.v1";

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession) {
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
}

