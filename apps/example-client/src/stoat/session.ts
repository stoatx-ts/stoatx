import type { UserSession } from "@stoatx/client";

/**
 * The saved session, so a reload logs straight back in instead of asking for the password.
 *
 * The token gives full access to the account. It stays in this browser's localStorage and is only
 * ever sent to the Stoat instance. Never send it to your own server or log it.
 *
 * See https://stoatx-ts.github.io/stoatx/guide/user-accounts#staying-logged-in
 */
const STORAGE_KEY = "stoatx-example:session";

export function loadSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Partial<UserSession>;
    // Ignore anything that isn't a session we saved, e.g. from an older version of the app.
    if (session.type !== "user" || typeof session.token !== "string") return null;
    return session as UserSession;
  } catch {
    // Private windows and blocked storage can throw; behave as if nothing was saved.
    return null;
  }
}

export function saveSession(session: UserSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Not fatal: the user just has to log in again next time.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
