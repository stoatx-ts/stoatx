import type { Client } from "../client/Client";

/**
 * Throws if the client isn't using a user session token.
 * @param client The client to check.
 * @param method The method name shown in the error, e.g. `"auth.logout"`.
 */
export function assertUserSession(client: Client, method: string): void {
  if (client.rest.tokenType !== "user") {
    throw new Error(`USER_ONLY: ${method}() needs a user session. Log in with a user token first.`);
  }
}
