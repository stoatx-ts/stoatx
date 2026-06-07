import type { Server } from "../structures/Server";
import type { Client } from "../client/Client";
import { Collection } from "../utils/Collection";
import { ServerInvite } from "../structures/ServerInvite";
import { BaseManager } from "./BaseManager";
import { Invite as RawInvite } from "stoat-api";

export interface Invite {
  code: string;
  creatorId: string;
  channelId: string;
}

export class ServerInviteManager extends BaseManager<string, ServerInvite> {
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
    return new ServerInvite(data);
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
}
