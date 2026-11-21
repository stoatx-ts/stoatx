import type { Client } from "../client/Client";
import type { MFAMethod, MFAResponse } from "./AuthManager";
import { assertUserSession } from "../utils/assertUserSession";
import { mfaTicketHeader, toMFATicket, toRawMFAResponse } from "../utils/mfa";

/**
 * A ticket proving the user just confirmed their identity. Sensitive account actions,
 * like disabling TOTP or deleting the account, need one. Get it from {@link MFAManager.createTicket}.
 *
 * A ticket can only be used once and expires after a few minutes, so create a new one for each action.
 */
export interface MFATicket {
  /** The ticket ID. */
  id: string;
  /** The ID of the account the ticket belongs to. */
  accountId: string;
  /** The ticket token, sent with the request it authorises. */
  token: string;
  /** Whether the ticket can be used for account actions. */
  validated: boolean;
  /** Whether the ticket can be used to log in. */
  authorised: boolean;
}

/** An MFA ticket, or just its token. */
export type MFATicketResolvable = MFATicket | string;

/** Which second factors an account has set up, from {@link MFAManager.fetchStatus}. */
export interface MFAStatus {
  /** Whether an authenticator app (TOTP) is set up. */
  totp: boolean;
  /** Whether the account has recovery codes. */
  recoveryCodes: boolean;
}

/** A new TOTP secret from {@link MFAManager.generateTotpSecret}. */
export interface TotpSecret {
  /** The base32 secret. Show it to the user, or put it in a QR code. */
  secret: string;
  /**
   * An `otpauth://` URI with the secret, ready to be turned into a QR code
   * that authenticator apps can scan.
   */
  uri: string;
}

/**
 * Two-factor authentication for user accounts: authenticator apps (TOTP), recovery codes
 * and the tickets sensitive account actions need. Available as `client.auth.mfa`.
 *
 * @example
 * // Set up an authenticator app
 * const ticket = await client.auth.mfa.createTicket({ password });
 * const { uri } = await client.auth.mfa.generateTotpSecret(ticket);
 * showQrCode(uri);
 * await client.auth.mfa.enableTotp(await askForCode());
 */
export class MFAManager {
  /**
   * @param client The client this manager belongs to.
   */
  constructor(private readonly client: Client) {}

  /**
   * Fetches which second factors the account has set up.
   * @returns Whether TOTP and recovery codes are active.
   */
  public async fetchStatus(): Promise<MFAStatus> {
    assertUserSession(this.client, "auth.mfa.fetchStatus");
    const data = await this.client.rest.get("/auth/mfa/");
    return { totp: data.totp_mfa ?? false, recoveryCodes: data.recovery_active ?? false };
  }

  /**
   * Fetches which second factors {@link createTicket} accepts for this account.
   * Accounts without MFA only accept `"Password"`.
   * @returns The accepted methods.
   */
  public async fetchMethods(): Promise<MFAMethod[]> {
    assertUserSession(this.client, "auth.mfa.fetchMethods");
    return this.client.rest.get("/auth/mfa/methods");
  }

  /**
   * Creates a ticket for a sensitive account action by confirming the user's identity.
   * Use a TOTP or recovery code if the account has MFA, otherwise the password.
   * @param response The password, TOTP code or recovery code.
   * @returns The ticket. It can be used once.
   * @example
   * const ticket = await client.auth.mfa.createTicket({ totpCode: "123456" });
   * await client.auth.mfa.disableTotp(ticket);
   */
  public async createTicket(response: MFAResponse): Promise<MFATicket> {
    assertUserSession(this.client, "auth.mfa.createTicket");
    const data = await this.client.rest.put("/auth/mfa/ticket", toRawMFAResponse(response));
    return toMFATicket(data);
  }

  /**
   * Fetches the account's existing recovery codes.
   * @param ticket A ticket from {@link createTicket}.
   * @returns The recovery codes.
   */
  public async fetchRecoveryCodes(ticket: MFATicketResolvable): Promise<string[]> {
    assertUserSession(this.client, "auth.mfa.fetchRecoveryCodes");
    return this.client.rest.post("/auth/mfa/recovery", undefined, mfaTicketHeader(ticket));
  }

  /**
   * Generates new recovery codes. The old ones stop working.
   * Have the user save the new codes: they're the only way back in if they lose their authenticator app.
   * @param ticket A ticket from {@link createTicket}.
   * @returns The new recovery codes.
   */
  public async generateRecoveryCodes(ticket: MFATicketResolvable): Promise<string[]> {
    assertUserSession(this.client, "auth.mfa.generateRecoveryCodes");
    return this.client.rest.patch("/auth/mfa/recovery", undefined, mfaTicketHeader(ticket));
  }

  /**
   * Generates a secret for a new authenticator app. TOTP isn't on until {@link enableTotp}
   * is called with a code from the app.
   * @param ticket A ticket from {@link createTicket}.
   * @param options The names shown in the authenticator app.
   * @param options.issuer The service name. Defaults to `"Stoat"`.
   * @param options.accountName The account label, e.g. the user's email. Defaults to the username.
   * @returns The secret and an `otpauth://` URI for a QR code.
   */
  public async generateTotpSecret(
    ticket: MFATicketResolvable,
    options: { issuer?: string; accountName?: string } = {},
  ): Promise<TotpSecret> {
    assertUserSession(this.client, "auth.mfa.generateTotpSecret");
    const { secret } = await this.client.rest.post("/auth/mfa/totp", undefined, mfaTicketHeader(ticket));
    const issuer = options.issuer ?? "Stoat";
    const accountName = options.accountName ?? this.client.user?.username ?? "";
    const label = encodeURIComponent(accountName ? `${issuer}:${accountName}` : issuer);
    const uri = `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    return { secret, uri };
  }

  /**
   * Turns TOTP on, after {@link generateTotpSecret}, using a code from the authenticator app.
   * @param totpCode The current 6-digit code.
   */
  public async enableTotp(totpCode: string): Promise<void> {
    assertUserSession(this.client, "auth.mfa.enableTotp");
    await this.client.rest.put("/auth/mfa/totp", { totp_code: totpCode });
  }

  /**
   * Turns TOTP off.
   * @param ticket A ticket from {@link createTicket}.
   */
  public async disableTotp(ticket: MFATicketResolvable): Promise<void> {
    assertUserSession(this.client, "auth.mfa.disableTotp");
    await this.client.rest.delete("/auth/mfa/totp", undefined, mfaTicketHeader(ticket));
  }
}
