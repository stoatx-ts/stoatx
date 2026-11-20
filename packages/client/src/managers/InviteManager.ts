import type { Client } from "../client/Client";
import { Attachment } from "../structures/Attachment";
import type { Server } from "../structures/Server";
import type { GroupChannel } from "../structures/GroupChannel";
import type { File as RawFile } from "stoat-api";

/** What an invite leads to, shown before joining. Fetched with {@link InviteManager.fetch}. */
export type InvitePreview =
  | {
      type: "Server";
      code: string;
      serverId: string;
      serverName: string;
      serverIcon: Attachment | null;
      serverBanner: Attachment | null;
      serverFlags: number | null;
      memberCount: number;
      /** The channel the invite opens on. */
      channelId: string;
      channelName: string;
      channelDescription: string | null;
      /** Name of the user who created the invite. */
      inviterName: string;
      inviterAvatar: Attachment | null;
    }
  | {
      type: "Group";
      code: string;
      channelId: string;
      channelName: string;
      channelDescription: string | null;
      /** Name of the user who created the invite. */
      inviterName: string;
      inviterAvatar: Attachment | null;
    };

/**
 * Previews and accepts invites by code. To list or create a server's invites, use `server.invites`.
 */
export class InviteManager {
  /**
   * @param client The client this manager belongs to.
   */
  constructor(private readonly client: Client) {}

  /**
   * Shows what an invite leads to without joining. Works without logging in.
   * @param code The invite code, e.g. from `https://stt.gg/abc123`.
   * @returns The server or group the invite is for.
   * @throws {StoatAPIError} `NotFound` if the invite doesn't exist or has expired.
   */
  public async fetch(code: string): Promise<InvitePreview> {
    const data = await this.client.rest.get(`/invites/${encodeURIComponent(code)}`);
    const file = (f: RawFile | null | undefined) => (f ? new Attachment(this.client, f) : null);

    if (data.type === "Server") {
      return {
        type: "Server",
        code: data.code,
        serverId: data.server_id,
        serverName: data.server_name,
        serverIcon: file(data.server_icon),
        serverBanner: file(data.server_banner),
        serverFlags: data.server_flags ?? null,
        memberCount: data.member_count,
        channelId: data.channel_id,
        channelName: data.channel_name,
        channelDescription: data.channel_description ?? null,
        inviterName: data.user_name,
        inviterAvatar: file(data.user_avatar),
      };
    }

    return {
      type: "Group",
      code: data.code,
      channelId: data.channel_id,
      channelName: data.channel_name,
      channelDescription: data.channel_description ?? null,
      inviterName: data.user_name,
      inviterAvatar: file(data.user_avatar),
    };
  }

  /**
   * Joins the server or group an invite is for (user sessions only; bots can't accept invites).
   * The server or group is cached straight away, so it's usable as soon as this resolves.
   * A discoverable server can also be joined by passing its ID as the code.
   * @param code The invite code.
   * @returns The joined server, or the joined group channel.
   * @throws {StoatAPIError} `NotFound` if the invite doesn't exist, `IsBot` for bots, `Banned` if you're
   * banned from the server, or `TooManyServers` if you're at the server limit.
   */
  public async accept(code: string): Promise<Server | GroupChannel> {
    const data = await this.client.rest.post(`/invites/${encodeURIComponent(code)}`);

    if (data.type === "Server") {
      const server = this.client.servers._add(data.server);
      for (const channel of data.channels) this.client.channels._add(channel);
      return server;
    }

    for (const user of data.users) this.client.users._add(user);
    return this.client.channels._add(data.channel) as GroupChannel;
  }
}
