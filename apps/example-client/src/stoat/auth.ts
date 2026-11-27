import { useSyncExternalStore } from "react";
import { OnboardingRequiredError, type MFAMethod, type MFAResponse, type UserSession } from "@stoatx/client";
import { client } from "./client";
import { describeError, isSessionInvalid } from "./errors";
import { loadSyncedSettings } from "./settings";
import { clearSession, loadSession, saveSession } from "./session";

/**
 * Where the app is in logging in. The routes in `features/auth` render a screen for each status.
 *
 * See https://stoatx-ts.github.io/stoatx/guide/user-accounts
 */
export type AuthState =
  /** Logging in with the saved session at startup. */
  | { status: "restoring" }
  /** No session. `notice` explains why, e.g. when the session was revoked from another device. */
  | { status: "loggedOut"; notice?: string }
  /** Logged in, waiting for the first `ready`: until then the caches are empty. */
  | { status: "connecting" }
  /** A new account that has to pick a username before it can connect. */
  | { status: "onboarding"; session: UserSession }
  /** Connected; the caches are filled. */
  | { status: "ready" }
  /** The saved session couldn't connect for another reason, e.g. the instance is unreachable. */
  | { status: "failed"; message: string };

/** The next step after submitting credentials. */
export type SignInStep = { step: "done" } | { step: "mfa"; ticket: string; methods: MFAMethod[] };

/** Shown in the account's list of logged-in devices. */
const FRIENDLY_NAME = "stoatx example client";

// --- A tiny external store, read with useSyncExternalStore ---------------------------------------

const listeners = new Set<() => void>();

// Hot reloading re-runs this file but keeps the client (and its connection), so keep the state too.
let state: AuthState = import.meta.hot?.data.authState ?? { status: loadSession() ? "restoring" : "loggedOut" };

function setState(next: AuthState): void {
  state = next;
  if (import.meta.hot) import.meta.hot.data.authState = state;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuthState(): AuthState {
  return state;
}

export function useAuthState(): AuthState {
  return useSyncExternalStore(subscribe, getAuthState);
}

// --- Client events ------------------------------------------------------------------------------

/** Set while the user logs out themselves, so it isn't reported as "logged out elsewhere". */
let loggingOut = false;

// `ready` also fires after every reconnect, with fresh caches. Staying on "ready" is correct then.
// Synced settings the layout needs (the server order) are loaded first, so nothing jumps around.
const onReady = () => {
  void loadSyncedSettings().finally(() => {
    // Logged out while loading: `logout` has already moved on to the login page.
    if (client.user) setState({ status: "ready" });
  });
};

// `logout` fires whenever the session ends: our own logOut(), or a revoke from another device.
// The client has already disconnected and emptied its caches.
const onLogout = () => {
  clearSession();
  setState(
    loggingOut ? { status: "loggedOut" } : { status: "loggedOut", notice: "You were logged out from another device." },
  );
};

client.on("ready", onReady);
client.on("logout", onLogout);
import.meta.hot?.dispose(() => {
  client.off("ready", onReady);
  client.off("logout", onLogout);
});

// --- Actions ------------------------------------------------------------------------------------

/** Connects with a session. Resolves once the socket is opening; `ready` follows later. */
async function connect(session: UserSession): Promise<void> {
  setState({ status: "connecting" });
  try {
    await client.login(session);
  } catch (error) {
    // The token is still set after this error, so completeOnboarding() works straight away.
    if (error instanceof OnboardingRequiredError) {
      setState({ status: "onboarding", session });
      return;
    }
    throw error;
  }
}

/**
 * Logs in with the saved session, if there is one. Called once from startup code (main.tsx), not
 * from a component effect: React's Strict Mode runs effects twice in development.
 */
export async function restoreSession(): Promise<void> {
  if (state.status !== "restoring" && state.status !== "failed") return;
  const session = loadSession();
  if (!session) {
    setState({ status: "loggedOut" });
    return;
  }

  try {
    await connect(session);
  } catch (error) {
    if (isSessionInvalid(error)) {
      // Expired or revoked while the app was closed.
      clearSession();
      setState({ status: "loggedOut", notice: "Your session has ended. Log in again." });
    } else {
      // Keep the session: the instance may just be unreachable right now.
      setState({ status: "failed", message: describeError(error) });
    }
  }
}

/** Forgets a saved session that couldn't connect and goes back to the login screen. */
export function forgetSession(): void {
  clearSession();
  setState({ status: "loggedOut" });
}

/** Handles a credential login result: save the session, and move to the next step. */
function afterLogin(result: Awaited<ReturnType<typeof client.loginWithCredentials>>): SignInStep {
  switch (result.result) {
    case "Success":
      saveSession(result.session);
      // loginWithCredentials() has already started connecting. Wait for `ready`.
      if (state.status !== "ready") setState({ status: "connecting" });
      return { step: "done" };
    case "MFA":
      return { step: "mfa", ticket: result.ticket, methods: result.allowedMethods };
    case "Onboarding":
      // Save it now, so a reload continues onboarding instead of asking for the password again.
      saveSession(result.session);
      setState({ status: "onboarding", session: result.session });
      return { step: "done" };
    case "Disabled":
      throw new Error("This account is disabled.");
  }
}

/** First step: email and password. Errors are thrown; show them with describeError(). */
export async function signIn(email: string, password: string): Promise<SignInStep> {
  return afterLogin(await client.loginWithCredentials({ email, password, friendlyName: FRIENDLY_NAME }));
}

/** Second step, for accounts with two-factor authentication. */
export async function signInWithMfa(ticket: string, mfaResponse: MFAResponse): Promise<SignInStep> {
  return afterLogin(await client.loginWithCredentials({ mfaTicket: ticket, mfaResponse, friendlyName: FRIENDLY_NAME }));
}

/** Picks the username for a new account, then connects. */
export async function completeOnboarding(username: string): Promise<void> {
  if (state.status !== "onboarding") throw new Error("Not onboarding.");
  const { session } = state;
  await client.auth.completeOnboarding(username);
  try {
    await connect(session);
  } catch (error) {
    // The username is set, so don't go back to onboarding; the "failed" screen can retry.
    setState({ status: "failed", message: describeError(error) });
  }
}

/**
 * Ends the session on the server. The client then emits `logout`, which clears the saved session
 * and shows the login screen. Also works during onboarding, to switch accounts.
 */
export async function logOut(): Promise<void> {
  loggingOut = true;
  try {
    await client.auth.logout();
  } catch (error) {
    // Already ended on the server (e.g. revoked while onboarding): nothing left to log out of.
    if (!isSessionInvalid(error)) throw error;
    forgetSession();
  } finally {
    loggingOut = false;
  }
}
