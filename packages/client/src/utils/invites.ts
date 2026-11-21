import type { Client } from "../client/Client";
import type { InviteCreateOptions } from "../structures/ServerInvite";
import type { Invite as RawInvite } from "stoat-api";

/**
 * Creates an invite to a server channel or group.
 * @param client The client to send the request with.
 * @param channelId The channel's ID.
 * @param options A use limit and expiry time.
 * @internal
 */
export async function requestInvite(
  client: Client,
  channelId: string,
  options: InviteCreateOptions,
): Promise<RawInvite> {
  const body: { max_uses?: number; expires?: string } = {};
  if (options.maxUses !== undefined) body.max_uses = options.maxUses;
  if (options.expiresAt !== undefined) body.expires = options.expiresAt.toISOString();
  return client.rest.post(`/channels/${channelId}/invites`, body);
}
