import type { Server } from "../structures/Server";
import type { Client } from "../client/Client";
import { Collection } from "../utils/Collection";
import { ServerInvite, type InviteCreateOptions } from "../structures/ServerInvite";
import { requestInvite } from "../utils/invites";
import type { BaseChannel } from "../structures/BaseChannel";
import { BaseManager } from "./BaseManager";
import { Invite as RawInvite } from "stoat-api";

export class ServerInviteManager extends BaseManager<string, ServerInvite, RawInvite> {
  constructor(
    client: Client,
    public server: Server,
    limit: number = Infinity,
  ) {
    super(client, limit);
  }

  protected extractId(data: RawInvite): string {
    return data._id;
  }

  protected construct(data: RawInvite): ServerInvite {
    return new ServerInvite(this.client, data);
  }

  /**
   * Fetches all active invites for this server.
   */
  public async fetch(): Promise<Collection<string, ServerInvite>> {
    const data = await this.client.rest.get(`/servers/${this.server.id}/invites`);

    const fetched = new Collection<string, ServerInvite>();

    for (const raw of data) {
      const invite = this._add(raw);
      fetched.set(invite.code, invite);
    }

    return fetched;
  }

  /**
   * Creates an invite to one of this server's channels, and caches it.
   * @param channel The channel or its ID.
   * @param options A use limit and expiry time.
   * @returns The new invite.
   */
  public async create(channel: BaseChannel | string, options: InviteCreateOptions = {}): Promise<ServerInvite> {
    return this._add(await requestInvite(this.client, typeof channel === "string" ? channel : channel.id, options));
  }

  /**
   * Deletes one of this server's invites and removes it from the cache.
   * @param invite The invite or its code.
   */
  public async delete(invite: ServerInvite | string): Promise<void> {
    const code = typeof invite === "string" ? invite : invite.code;
    await this.client.invites.delete(code);
  }
}
