export type AdminSession = {
  token: string;
  expiresAt: string;
  adminUser: { id: string; username: string };
};

const ADMIN_SESSION_KEY = "qc_admin_session";

const isBrowser = () => typeof window !== "undefined";

export const getAdminSession = (): AdminSession | null => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.token || !parsed?.expiresAt) return null;
    if (Date.parse(parsed.expiresAt) <= Date.now()) {
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const setAdminSession = (session: AdminSession) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
};

export const clearAdminSession = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
};
