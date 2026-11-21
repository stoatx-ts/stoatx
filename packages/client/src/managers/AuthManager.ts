import type { Client, PolicyChange as RawPolicyChange } from "../client/Client";
import type { User } from "../structures/User";
import type { DataLogin, MFAMethod as RawMFAMethod, MFATicket as RawMFATicket } from "stoat-api";
import { assertUserSession } from "../utils/assertUserSession";
import { mfaTicketHeader, toMFATicket, toRawMFAResponse } from "../utils/mfa";
import { MFAManager } from "./MFAManager";
import type { MFATicket, MFATicketResolvable } from "./MFAManager";

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
      /**
       * The ticket from an `MFA` login result, or the ticket from {@link AuthManager.verifyEmail}.
       */
      mfaTicket: string;
      /** The second factor. Not needed for the ticket from {@link AuthManager.verifyEmail}. */
      mfaResponse?: MFAResponse;
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

/** The logged-in account, from {@link AuthManager.fetchAccount}. */
export interface AccountInfo {
  /** The account ID, the same as the user ID. */
  id: string;
  /** The account's email address. */
  email: string;
}

/** Options for {@link AuthManager.createAccount}. */
export interface CreateAccountOptions {
  email: string;
  password: string;
  /** An invite code, for instances that are invite-only. */
  invite?: string;
  /** A captcha response, for instances that require one. */
  captcha?: string;
}

/** A change to a platform policy, like the terms of service, that the user hasn't acknowledged yet. */
export interface PendingPolicyChange {
  /** What changed. */
  description: string;
  /** A link to the new policy or an announcement about it. */
  url: string;
  /** When the change was announced. */
  createdAt: Date;
  /** When the change takes effect. */
  effectiveAt: Date;
}

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
 * Accounts, sessions, logout and onboarding for user accounts. Bots don't need any of this.
 */
export class AuthManager {
  /** Two-factor authentication: TOTP, recovery codes and MFA tickets. */
  public readonly mfa: MFAManager;

  /**
   * Policy changes the user hasn't acknowledged yet, loaded when the client connects.
   * Show them to the user, then call {@link acknowledgePolicyChanges}. Always empty for bots.
   */
  public policyChanges: PendingPolicyChange[] = [];

  /**
   * @param client The client this manager belongs to.
   */
  constructor(private readonly client: Client) {
    this.mfa = new MFAManager(client);
  }

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
      body = { mfa_ticket: options.mfaTicket };
      if (options.mfaResponse) body.mfa_response = toRawMFAResponse(options.mfaResponse);
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
    assertUserSession(this.client, "auth.logout");
    await this.client.rest.post("/auth/session/logout");
    this.client._endSession();
  }

  /**
   * Lists every session logged in to this account.
   * @returns Each session's ID and friendly name.
   */
  public async fetchSessions(): Promise<SessionInfo[]> {
    assertUserSession(this.client, "auth.fetchSessions");
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
    assertUserSession(this.client, "auth.renameSession");
    const s = await this.client.rest.patch(`/auth/session/${id}`, { friendly_name: name });
    return { id: s._id, name: s.name };
  }

  /**
   * Logs out a session, e.g. another device. Use {@link logout} for the current session.
   * @param id The session ID.
   */
  public async revokeSession(id: string): Promise<void> {
    assertUserSession(this.client, "auth.revokeSession");
    await this.client.rest.delete(`/auth/session/${id}`);
  }

  /**
   * Logs out every other session on this account.
   * @param options Set `includeCurrent` to also end this session; the client then disconnects and emits `logout`.
   */
  public async revokeAllSessions(options: { includeCurrent?: boolean } = {}): Promise<void> {
    assertUserSession(this.client, "auth.revokeAllSessions");
    await this.client.rest.delete("/auth/session/all", { revoke_self: options.includeCurrent ?? false });
    if (options.includeCurrent) this.client._endSession();
  }

  /**
   * Checks whether this account still has to pick a username.
   * @returns `true` if {@link completeOnboarding} must be called before the account can connect.
   */
  public async needsOnboarding(): Promise<boolean> {
    assertUserSession(this.client, "auth.needsOnboarding");
    const { onboarding } = await this.client.rest.get("/onboard/hello");
    return onboarding;
  }

  /**
   * Picks the username for a new account. Afterwards, call `client.login()` again to connect.
   * @param username 2–32 characters: letters, numbers, `_`, `.` and `-`.
   * @returns The account's user.
   */
  public async completeOnboarding(username: string): Promise<User> {
    assertUserSession(this.client, "auth.completeOnboarding");
    const data = await this.client.rest.post("/onboard/complete", { username });
    return this.client.users._add(data);
  }

  /**
   * Acknowledges every pending policy change and empties {@link policyChanges}.
   * @example
   * client.on("ready", () => {
   *   if (client.auth.policyChanges.length > 0) showPolicyNotice(client.auth.policyChanges);
   * });
   * // When the user clicks "OK":
   * await client.auth.acknowledgePolicyChanges();
   */
  public async acknowledgePolicyChanges(): Promise<void> {
    assertUserSession(this.client, "auth.acknowledgePolicyChanges");
    await this.client.rest.post("/policy/acknowledge");
    this.policyChanges = [];
  }

  /**
   * Replaces the pending policy changes with the ones from the `Ready` payload.
   * @param data The `policy_changes` field.
   * @internal
   */
  public _setPolicyChanges(data: RawPolicyChange[]): void {
    this.policyChanges = data.map((change) => ({
      description: change.description,
      url: change.url,
      createdAt: new Date(change.created_time),
      effectiveAt: new Date(change.effective_time),
    }));
  }

  /**
   * Creates an account. Stoat then emails a verification link; the account can log in once
   * it's verified with {@link verifyEmail}. Works without logging in.
   * @param options The email, password and, if the instance needs them, an invite code and captcha.
   * @example
   * await client.auth.createAccount({ email, password });
   * showMessage("Check your inbox to verify your email.");
   */
  public async createAccount(options: CreateAccountOptions): Promise<void> {
    await this.client.rest.post("/auth/account/create", {
      email: options.email,
      password: options.password,
      invite: options.invite ?? null,
      captcha: options.captcha ?? null,
    });
  }

  /**
   * Sends the verification email again. Works without logging in.
   * @param email The account's email address.
   * @param options Optional extra parameters for the request.
   * @param options.captcha A captcha response, for instances that require one.
   */
  public async resendVerification(email: string, options: { captcha?: string } = {}): Promise<void> {
    await this.client.rest.post("/auth/account/reverify", { email, captcha: options.captcha ?? null });
  }

  /**
   * Verifies an email address with the code from the verification link. Works without logging in.
   * @param code The code from the link.
   * @returns For a new account, a ticket that logs it in without the password:
   * `client.loginWithCredentials({ mfaTicket: ticket.token })`. `null` after an email change.
   */
  public async verifyEmail(code: string): Promise<MFATicket | null> {
    // The generated type loses the `{ ticket }` variant of the response.
    const data = (await this.client.rest.post(`/auth/account/verify/${encodeURIComponent(code)}`)) as {
      ticket?: RawMFATicket;
    } | null;
    return data?.ticket ? toMFATicket(data.ticket) : null;
  }

  /**
   * Emails a password reset link. Works without logging in.
   * @param email The account's email address.
   * @param options Optional extra parameters for the request.
   * @param options.captcha A captcha response, for instances that require one.
   */
  public async sendPasswordReset(email: string, options: { captcha?: string } = {}): Promise<void> {
    await this.client.rest.post("/auth/account/reset_password", { email, captcha: options.captcha ?? null });
  }

  /**
   * Sets a new password with the token from the reset link. Works without logging in.
   * @param token The token from the link.
   * @param password The new password.
   * @param options Optional extra parameters for the request.
   * @param options.logoutAllSessions Also log out every session on the account.
   */
  public async resetPassword(
    token: string,
    password: string,
    options: { logoutAllSessions?: boolean } = {},
  ): Promise<void> {
    await this.client.rest.patch("/auth/account/reset_password", {
      token,
      password,
      remove_sessions: options.logoutAllSessions ?? false,
    });
  }

  /**
   * Fetches the logged-in account's ID and email address.
   * @returns The account.
   */
  public async fetchAccount(): Promise<AccountInfo> {
    assertUserSession(this.client, "auth.fetchAccount");
    const data = await this.client.rest.get("/auth/account/");
    return { id: data._id, email: data.email };
  }

  /**
   * Changes the account's password.
   * @param currentPassword The current password.
   * @param newPassword The new password.
   */
  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    assertUserSession(this.client, "auth.changePassword");
    await this.client.rest.patch("/auth/account/change/password", {
      current_password: currentPassword,
      password: newPassword,
    });
  }

  /**
   * Changes the account's email address. Stoat emails a verification link to the new address,
   * and the change applies once it's verified with {@link verifyEmail}.
   * @param currentPassword The current password.
   * @param newEmail The new email address.
   */
  public async changeEmail(currentPassword: string, newEmail: string): Promise<void> {
    assertUserSession(this.client, "auth.changeEmail");
    await this.client.rest.patch("/auth/account/change/email", {
      current_password: currentPassword,
      email: newEmail,
    });
  }

  /**
   * Disables the account. Every session is logged out, including this one, so the client
   * disconnects and emits `logout`. Only Stoat's staff can enable it again.
   * @param ticket A ticket from {@link MFAManager.createTicket}.
   */
  public async disableAccount(ticket: MFATicketResolvable): Promise<void> {
    assertUserSession(this.client, "auth.disableAccount");
    await this.client.rest.post("/auth/account/disable", undefined, mfaTicketHeader(ticket));
    this.client._endSession();
  }

  /**
   * Requests the account's deletion. Stoat emails a confirmation link; nothing is deleted until
   * it's confirmed with {@link confirmAccountDeletion}.
   * @param ticket A ticket from {@link MFAManager.createTicket}.
   */
  public async deleteAccount(ticket: MFATicketResolvable): Promise<void> {
    assertUserSession(this.client, "auth.deleteAccount");
    await this.client.rest.post("/auth/account/delete", undefined, mfaTicketHeader(ticket));
  }

  /**
   * Confirms an account deletion with the token from the confirmation email. Works without logging in.
   * @param token The token from the link.
   */
  public async confirmAccountDeletion(token: string): Promise<void> {
    await this.client.rest.put("/auth/account/delete", { token });
  }
}
