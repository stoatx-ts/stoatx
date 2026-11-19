import type { Client } from "../client/Client";
import type { ChannelResolvable } from "./ChannelManager";
import type { MessageResolvable } from "./MessageManager";
import type { Server } from "../structures/Server";
import { Collection } from "../utils/Collection";
import type { ChannelUnread } from "stoat-api";

/** What the logged-in user has read in one channel. */
export interface ChannelReadState {
  /** The channel this state belongs to. */
  channelId: string;
  /** The last message the user has read, or `null` if they've never opened the channel. */
  lastReadId: string | null;
  /** Unread messages that mention the user. */
  mentionIds: Set<string>;
}

/** Message fields the unread tracker reads from a gateway `Message` event. */
interface RawMessageLike {
  _id: string;
  channel: string;
  author: string;
  mentions?: string[] | null;
  flags?: number | null;
}

/** `MessageFlags.SuppressNotifications` is bit 1 in the backend's bitfield. */
const SUPPRESS_NOTIFICATIONS = 1 << 1;

/**
 * Tracks which channels the logged-in user has read, for user sessions.
 *
 * The state comes from the `ready` payload and is kept up to date from gateway events,
 * including acks from the user's other devices. For bots everything reads as "no unreads".
 *
 * Most code uses the getters on channels and servers instead:
 * `channel.unread`, `channel.mentionCount`, `channel.ack()`, `server.unread`, `server.ack()`.
 */
export class UnreadManager {
  /** Read state per channel ID. Channels the user has never opened have no entry. */
  public readonly cache = new Collection<string, ChannelReadState>();

  /**
   * @param client The client this manager belongs to.
   */
  constructor(private readonly client: Client) {}

  /**
   * Reloads the read state of every channel from the API, replacing the cache.
   * The client already loads it on connect, so this is only needed to resync.
   * @returns The refreshed cache.
   */
  public async fetch(): Promise<Collection<string, ChannelReadState>> {
    this.assertUserSession("fetch");
    this._setAll(await this.client.rest.get("/sync/unreads"));
    return this.cache;
  }

  /**
   * Whether a channel has messages the user hasn't read.
   * Always `false` for bots and for channels that aren't cached.
   * @param channel The channel or its ID.
   */
  public isUnread(channel: ChannelResolvable): boolean {
    if (this.client.rest.tokenType !== "user") return false;
    const id = this.client.channels.resolveId(channel);
    const cached = this.client.channels.cache.get(id) as { type?: string; lastMessageId?: string | null } | undefined;
    const lastMessageId = cached?.lastMessageId;
    if (!lastMessageId || cached.type === "SavedMessages") return false;

    const state = this.cache.get(id);
    if (state && state.mentionIds.size > 0) return true;
    // Message IDs are ULIDs, which sort by creation time as plain strings.
    return !state?.lastReadId || lastMessageId > state.lastReadId;
  }

  /**
   * How many unread messages in a channel mention the user. Always `0` for bots.
   * @param channel The channel or its ID.
   */
  public mentionCount(channel: ChannelResolvable): number {
    return this.cache.get(this.client.channels.resolveId(channel))?.mentionIds.size ?? 0;
  }

  /**
   * Marks a channel as read up to a message. Other devices on the account are notified.
   * @param channel The channel or its ID.
   * @param message The last message read. Defaults to the channel's latest message.
   */
  public async ack(channel: ChannelResolvable, message?: MessageResolvable): Promise<void> {
    this.assertUserSession("ack");
    const channelId = this.client.channels.resolveId(channel);
    const messageId =
      message === undefined
        ? (this.client.channels.cache.get(channelId) as { lastMessageId?: string | null } | undefined)?.lastMessageId
        : typeof message === "string"
          ? message
          : message.id;
    if (!messageId) return;

    await this.client.rest.put(`/channels/${channelId}/ack/${messageId}`);
    this._markRead(channelId, messageId);
  }

  /**
   * Marks every channel in a server as read.
   * @param server The server or its ID.
   */
  public async ackServer(server: Server | string): Promise<void> {
    this.assertUserSession("ackServer");
    const serverId = typeof server === "string" ? server : server.id;
    await this.client.rest.put(`/servers/${serverId}/ack`);

    for (const channelId of this.client.servers.cache.get(serverId)?.channelIds ?? []) {
      const lastMessageId = (this.client.channels.cache.get(channelId) as { lastMessageId?: string | null } | undefined)
        ?.lastMessageId;
      if (lastMessageId) this._markRead(channelId, lastMessageId);
    }
  }

  /**
   * Replaces the cache with read state from the API or the `ready` payload.
   * @param unreads The raw read state of each channel.
   * @internal
   */
  public _setAll(unreads: ChannelUnread[]): void {
    this.cache.clear();
    for (const raw of unreads) {
      this.cache.set(raw._id.channel, {
        channelId: raw._id.channel,
        lastReadId: raw.last_id ?? null,
        mentionIds: new Set(raw.mentions ?? []),
      });
    }
  }

  /**
   * Records that the user has read a channel up to a message.
   * Never moves the read marker backwards.
   * @param channelId The channel ID.
   * @param messageId The last message read.
   * @internal
   */
  public _markRead(channelId: string, messageId: string): void {
    const state = this.getOrCreate(channelId);
    if (!state.lastReadId || messageId > state.lastReadId) state.lastReadId = messageId;
    for (const id of state.mentionIds) {
      if (id <= messageId) state.mentionIds.delete(id);
    }
  }

  /**
   * Updates read state for a new message, mirroring what the server stores so the counts
   * don't change on reconnect. Must run before the channel's `lastMessageId` is updated.
   *
   * - The user's own message is marked read, but only if the channel was already fully read
   *   (otherwise posting would hide other people's unread messages). Local only, like the official client.
   * - In DMs and groups, every message from someone else counts as a mention.
   * - In server channels, only messages whose `mentions` include the user count. The server doesn't
   *   store role, `@everyone` or `@online` mentions as unread mentions, so neither do we.
   * - Messages sent with notifications suppressed never count as mentions.
   * @param message The raw message from the gateway.
   * @internal
   */
  public _onMessage(message: RawMessageLike): void {
    if (this.client.rest.tokenType !== "user") return;
    const selfId = this.client.user?.id;
    if (!selfId) return;

    const channel = this.client.channels.cache.get(message.channel) as
      | { type?: string; lastMessageId?: string | null }
      | undefined;

    if (message.author === selfId) {
      const lastReadId = this.cache.get(message.channel)?.lastReadId;
      if (lastReadId && lastReadId === channel?.lastMessageId) this._markRead(message.channel, message._id);
      return;
    }

    if ((message.flags ?? 0) & SUPPRESS_NOTIFICATIONS) return;

    const isDirect = channel?.type === "DirectMessage" || channel?.type === "Group";
    if (isDirect || message.mentions?.includes(selfId)) {
      this.getOrCreate(message.channel).mentionIds.add(message._id);
    }
  }

  /**
   * Forgets a deleted message so it no longer counts as a mention.
   * @param channelId The channel the message was in.
   * @param messageId The deleted message.
   * @internal
   */
  public _onMessageDelete(channelId: string, messageId: string): void {
    this.cache.get(channelId)?.mentionIds.delete(messageId);
  }

  /**
   * Returns the read state for a channel, creating an empty one if needed.
   * @param channelId The channel ID.
   */
  private getOrCreate(channelId: string): ChannelReadState {
    let state = this.cache.get(channelId);
    if (!state) {
      state = { channelId, lastReadId: null, mentionIds: new Set() };
      this.cache.set(channelId, state);
    }
    return state;
  }

  /**
   * Throws if the client isn't using a user session token.
   * @param method The method name, for the error message.
   */
  private assertUserSession(method: string) {
    if (this.client.rest.tokenType !== "user") {
      throw new Error(`USER_ONLY: unreads.${method}() needs a user session. Log in with a user token first.`);
    }
  }
}
