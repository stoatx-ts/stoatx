import type { Client } from "../client/Client";
import type { User } from "../structures/User";
import type { DataLogin, MFAMethod as RawMFAMethod } from "stoat-api";

/** A second-factor method an account can use to finish logging in. */
export type MFAMethod = RawMFAMethod;

/** The second factor sent to finish an MFA login. Provide exactly one. */
export type MFAResponse = { password: string } | { recoveryCode: string } | { totpCode: string };

/** Credentials for {@link Client.loginWithCredentials} and {@link AuthManager.createSession}. */
export type CredentialLoginOptions =
  | {
      email: string;
      password: string;
      /** Name shown in the account's session list, e.g. "Firefox on Linux". */
      friendlyName?: string;
    }
  | {
      /** The ticket from an `MFA` login result. */
      mfaTicket: string;
      mfaResponse: MFAResponse;
      /** Name shown in the account's session list, e.g. "Firefox on Linux". */
      friendlyName?: string;
    };

/**
 * A logged-in user session. Store it to log in again later without a password:
 * `client.login(session)`.
 */
export interface UserSession {
  /** Always `"user"`, so the session can be passed straight to `client.login()`. */
  readonly type: "user";
  /** The session ID. */
  id: string;
  /** The ID of the user the session belongs to. */
  userId: string;
  /** The session token. Treat it like a password. */
  token: string;
  /** The session's friendly name. */
  name: string;
}

/** A session listed by {@link AuthManager.fetchSessions}. */
export interface SessionInfo {
  id: string;
  name: string;
}

/** Result of creating a session with {@link AuthManager.createSession}. */
export type CreateSessionResult =
  | { result: "Success"; session: UserSession }
  /** The account has MFA on: log in again with `{ mfaTicket: ticket, mfaResponse }`. */
  | { result: "MFA"; ticket: string; allowedMethods: MFAMethod[] }
  /** The account is disabled. */
  | { result: "Disabled"; userId: string };

/** Result of {@link Client.loginWithCredentials}. */
export type LoginResult =
  | CreateSessionResult
  /**
   * The session was created but the account has to pick a username before it can connect.
   * Call `client.auth.completeOnboarding(username)`, then `client.login(session)`.
   */
  | { result: "Onboarding"; session: UserSession };

/**
 * Thrown by `client.login()` when a user account has not picked a username yet.
 * The token stays set, so `client.auth.completeOnboarding(username)` works straight away.
 */
export class OnboardingRequiredError extends Error {
  constructor() {
    super("ONBOARDING_REQUIRED: This account must pick a username with client.auth.completeOnboarding() first.");
    this.name = "OnboardingRequiredError";
    Object.setPrototypeOf(this, OnboardingRequiredError.prototype);
  }
}

/**
 * Account sessions, logout and onboarding for user accounts. Bots don't need any of this.
 */
export class AuthManager {
  /**
   * @param client The client this manager belongs to.
   */
  constructor(private readonly client: Client) {}

  /**
   * Creates a user session from an email and password, or finishes an MFA login.
   * This does not connect the client: use {@link Client.loginWithCredentials} for that,
   * or pass the returned session to `client.login()`.
   * @param options The email and password, or the MFA ticket and response.
   * @returns The session, an MFA challenge, or a notice that the account is disabled.
   * @example
   * let result = await client.auth.createSession({ email, password });
   * if (result.result === "MFA") {
   *   result = await client.auth.createSession({ mfaTicket: result.ticket, mfaResponse: { totpCode: "123456" } });
   * }
   */
  public async createSession(options: CredentialLoginOptions): Promise<CreateSessionResult> {
    let body: DataLogin;
    if ("mfaTicket" in options) {
      const r = options.mfaResponse;
      body = {
        mfa_ticket: options.mfaTicket,
        mfa_response:
          "password" in r
            ? { password: r.password }
            : "recoveryCode" in r
              ? { recovery_code: r.recoveryCode }
              : { totp_code: r.totpCode },
      };
    } else {
      body = { email: options.email, password: options.password };
    }
    if (options.friendlyName !== undefined) body.friendly_name = options.friendlyName;

    const data = await this.client.rest.post("/auth/session/login", body);

    switch (data.result) {
      case "Success":
        return {
          result: "Success",
          session: { type: "user", id: data._id, userId: data.user_id, token: data.token, name: data.name },
        };
      case "MFA":
        return { result: "MFA", ticket: data.ticket, allowedMethods: data.allowed_methods };
      case "Disabled":
        return { result: "Disabled", userId: data.user_id };
    }
  }

  /**
   * Ends the current user session on the server, disconnects and clears the token.
   * Emits `logout`.
   */
  public async logout(): Promise<void> {
    this.assertUserSession("logout");
    await this.client.rest.post("/auth/session/logout");
    this.client._endSession();
  }

  /**
   * Lists every session logged in to this account.
   * @returns Each session's ID and friendly name.
   */
  public async fetchSessions(): Promise<SessionInfo[]> {
    this.assertUserSession("fetchSessions");
    const sessions = await this.client.rest.get("/auth/session/all");
    return sessions.map((s) => ({ id: s._id, name: s.name }));
  }

  /**
   * Renames a session.
   * @param id The session ID.
   * @param name The new friendly name.
   * @returns The updated session.
   */
  public async renameSession(id: string, name: string): Promise<SessionInfo> {
    this.assertUserSession("renameSession");
    const s = await this.client.rest.patch(`/auth/session/${id}`, { friendly_name: name });
    return { id: s._id, name: s.name };
  }

  /**
   * Logs out a session, e.g. another device. Use {@link logout} for the current session.
   * @param id The session ID.
   */
  public async revokeSession(id: string): Promise<void> {
    this.assertUserSession("revokeSession");
    await this.client.rest.delete(`/auth/session/${id}`);
  }

  /**
   * Logs out every other session on this account.
   * @param options Set `includeCurrent` to also end this session; the client then disconnects and emits `logout`.
   */
  public async revokeAllSessions(options: { includeCurrent?: boolean } = {}): Promise<void> {
    this.assertUserSession("revokeAllSessions");
    await this.client.rest.delete("/auth/session/all", { revoke_self: options.includeCurrent ?? false });
    if (options.includeCurrent) this.client._endSession();
  }

  /**
   * Checks whether this account still has to pick a username.
   * @returns `true` if {@link completeOnboarding} must be called before the account can connect.
   */
  public async needsOnboarding(): Promise<boolean> {
    this.assertUserSession("needsOnboarding");
    const { onboarding } = await this.client.rest.get("/onboard/hello");
    return onboarding;
  }

  /**
   * Picks the username for a new account. Afterwards, call `client.login()` again to connect.
   * @param username 2–32 characters: letters, numbers, `_`, `.` and `-`.
   * @returns The account's user.
   */
  public async completeOnboarding(username: string): Promise<User> {
    this.assertUserSession("completeOnboarding");
    const data = await this.client.rest.post("/onboard/complete", { username });
    return this.client.users._add(data);
  }

  /**
   * Throws if the client isn't using a user session token.
   * @param method The method name, for the error message.
   */
  private assertUserSession(method: string) {
    if (this.client.rest.tokenType !== "user") {
      throw new Error(`USER_ONLY: auth.${method}() needs a user session. Log in with a user token first.`);
    }
  }
}
