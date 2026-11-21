import type { MFAResponse as RawMFAResponse, MFATicket as RawMFATicket } from "stoat-api";
import type { MFAResponse } from "../managers/AuthManager";
import type { MFATicket, MFATicketResolvable } from "../managers/MFAManager";

/**
 * Converts an {@link MFAResponse} to the API's format.
 * @param response The second factor.
 * @returns The response with snake_case keys.
 * @internal
 */
export function toRawMFAResponse(response: MFAResponse): RawMFAResponse {
  if ("password" in response) return { password: response.password };
  if ("recoveryCode" in response) return { recovery_code: response.recoveryCode };
  return { totp_code: response.totpCode };
}

/**
 * The header that sends an MFA ticket with a request.
 * @param ticket The ticket or its token.
 * @internal
 */
export function mfaTicketHeader(ticket: MFATicketResolvable): { headers: Record<string, string> } {
  const token = typeof ticket === "string" ? ticket : ticket.token;
  if (!token) throw new TypeError("A valid MFA ticket must be provided.");
  return { headers: { "X-MFA-Ticket": token } };
}

/**
 * Maps an API MFA ticket.
 * @param data The raw ticket.
 * @internal
 */
export function toMFATicket(data: RawMFATicket): MFATicket {
  return {
    id: data._id,
    accountId: data.account_id,
    token: data.token,
    validated: data.validated,
    authorised: data.authorised,
  };
}
