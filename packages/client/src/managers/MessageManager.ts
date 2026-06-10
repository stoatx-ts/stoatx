import { Collection } from "../utils/Collection";
import type { BaseChannel } from "../structures/BaseChannel";
import { Message, MessageOptions } from "../structures/Message";
import type { Client } from "../client/Client";
import * as util from "node:util";
import { BaseManager } from "./BaseManager";
import { UserResolvable } from "./UserManager";
import { resolveAttachment } from "../utils/resolveAttachment";
import { Message as RawMessage, DataMessageSend, DataEditMessage } from "stoat-api";
import { RouteParams } from "../utils/schema";

export type MessageResolvable = Message | string;

export interface MessageFetchOptions {
  limit?: number;
  before?: string;
  after?: string;
  sort?: "Relevance" | "Latest" | "Oldest";
  nearby?: string;
  includeUsers?: boolean;
}

export class MessageManager extends BaseManager<string, Message> {
  constructor(
    client: Client,
    public channel: BaseChannel,
    limit: number = Infinity,
  ) {
    super(client, limit);
  }

  /**
   * Tell BaseManager how to find the ID for Messages
   */
  protected extractId(data: RawMessage): string {
    return data._id;
  }

  /**
   * Tell BaseManager how to build a Message
   */
  protected construct(data: RawMessage): Message {
    return new Message(this.client, data);
  }

  public async fetch(id: string): Promise<Message> {
    const data = await this.client.rest.get(`/channels/${this.channel.id}/messages/${id}`);
    return this._add(data);
  }

  /**
   * Fetches multiple messages from the channel using specific filter parameters.
   * @param options The query parameters to filter the fetched messages.
   * @returns A promise that resolves to a Collection of fetched Messages.
   * @throws {Error} If the API request fails.
   * @example
   * // Fetch the last 50 messages in the channel
   * const messages = await channel.messages.fetchMany({ limit: 50, sort: "Latest" });
   *
   * // Fetch 20 messages before a specific message ID
   * const history = await channel.messages.fetchMany({ limit: 20, before: "01H..." });
   */
  public async fetchMany(options: MessageFetchOptions = {}): Promise<Collection<string, Message>> {
    const endpoint = `/channels/${this.channel.id}/messages` as const;

    const query: RouteParams<"get", typeof endpoint> = {};

    if (options.limit !== undefined) query.limit = options.limit;
    if (options.before !== undefined) query.before = options.before;
    if (options.after !== undefined) query.after = options.after;
    if (options.sort !== undefined) query.sort = options.sort;
    if (options.nearby !== undefined) query.nearby = options.nearby;
    if (options.includeUsers !== undefined) query.include_users = options.includeUsers;

    const data = await this.client.rest.get(endpoint, query);

    let rawMessages: RawMessage[];

    if (Array.isArray(data)) {
      rawMessages = data;
    } else {
      rawMessages = data.messages;

      if (data.users) {
        for (const userData of data.users) {
          this.client.users._add(userData);
        }
      }
      if (data.members && this.channel.isText()) {
        const serverId = this.channel.serverId;
        const server = await this.client.servers.fetch(serverId);
        for (const memberData of data.members) {
          server.members._add(memberData);
        }
      }
    }

    const fetched = new Collection<string, Message>();

    for (const rawMsg of rawMessages) {
      const msg = this._add(rawMsg);
      fetched.set(msg.id, msg);
    }

    return fetched;
  }

  public resolveId(message: MessageResolvable): string {
    if (typeof message === "string") return message;
    if (message instanceof Message) return message.id;
    throw new Error("Invalid MessageResolvable: must be a Message object or a string ID.");
  }

  /**
   * Sends a new message to this channel.
   * @param contentOrOptions The string content or message options payload.
   * @returns A promise that resolves to the sent Message.
   */
  public async send(contentOrOptions: MessageOptions | string): Promise<Message> {
    const opts = typeof contentOrOptions === "string" ? { content: contentOrOptions } : contentOrOptions;

    const payload: DataMessageSend = {};

    if (opts.content) {
      payload.content = opts.content;
    }

    if (opts.attachments && opts.attachments.length > 0) {
      const resolved = await Promise.all(
        opts.attachments.map((attachment) => resolveAttachment(this.client.rest, attachment, "attachments")),
      );

      const validAttachments = resolved.filter((id): id is string => id !== undefined);

      if (validAttachments.length > 0) {
        payload.attachments = validAttachments;
      }
    }
    if (opts.replies) {
      payload.replies = opts.replies;
    }

    if (opts.embeds && opts.embeds.length) {
      payload.embeds = opts.embeds.map((embed: any) => (typeof embed.toJSON === "function" ? embed.toJSON() : embed));
    }

    if (opts.masquerade) {
      payload.masquerade = opts.masquerade;
    }

    if (opts.interactions) {
      payload.interactions = opts.interactions;
    }

    if (opts.flags) {
      payload.flags = opts.flags;
    }

    const data = await this.client.rest.post(`/channels/${this.channel.id}/messages`, payload);

    return new Message(this.client, data);
  }

  /**
   * Edits an existing message.
   * @param message The MessageResolvable (object or ID) to edit.
   * @param contentOrOptions The new content or options.
   * @returns A promise that resolves to the updated Message.
   */
  public async edit(message: MessageResolvable, contentOrOptions: string | MessageOptions): Promise<Message> {
    const id = this.resolveId(message);

    const opts = typeof contentOrOptions === "string" ? { content: contentOrOptions } : contentOrOptions;

    const payload: DataEditMessage = {};

    if (opts.content !== undefined) {
      payload.content = opts.content;
    }

    if (opts.embeds !== undefined) {
      if (opts.embeds === null) {
        payload.embeds = [];
      } else {
        payload.embeds = opts.embeds.map((embed) => ("toJSON" in embed ? embed.toJSON() : embed));
      }
    }

    const data = await this.client.rest.patch(`/channels/${this.channel.id}/messages/${id}`, payload);

    return this._add(data);
  }

  /**
   * Deletes a message from the channel.
   * @param message The MessageResolvable to delete.
   */
  public async delete(message: MessageResolvable): Promise<void> {
    const id = this.resolveId(message);
    await this.client.rest.delete(`/channels/${this.channel.id}/messages/${id}`);
    this.cache.delete(id);
  }

  /**
   * Pins a message in the channel.
   * @param message The MessageResolvable to pin.
   */
  public async pin(message: MessageResolvable): Promise<void> {
    const id = this.resolveId(message);
    await this.client.rest.post(`/channels/${this.channel.id}/messages/${id}/pin`);

    const existing = this.cache.get(id);
    if (existing) existing.pinned = true;
  }

  /**
   * Unpins a message in the channel.
   * @param message The MessageResolvable to unpin.
   */
  public async unpin(message: MessageResolvable): Promise<void> {
    const id = this.resolveId(message);
    await this.client.rest.delete(`/channels/${this.channel.id}/messages/${id}/pin`);

    const existing = this.cache.get(id);
    if (existing) existing.pinned = false;
  }

  /**
   * React to a message
   * @param message The MessageResolvable to react to.
   * @param reaction The emoji to react with. Can be a Unicode emoji or a custom emoji ID.
   * @throws {Error} If the API request fails.
   * @example
   * await channel.messages.react(messageId, "👍");
   * await channel.messages.react(messageId, "customEmojiId");
   */
  public async react(message: MessageResolvable, reaction: string): Promise<void> {
    const id = this.resolveId(message);
    await this.client.rest.put(`/channels/${this.channel.id}/messages/${id}/reactions/${encodeURIComponent(reaction)}`);
  }

  /**
   * Remove a reaction(s) from a message
   * Requires ManageMessages if changing others' reactions.
   * @param reaction The emoji to remove. Can be a unicode emoji or a custom emoji ID.
   * @param message The MessageResolvable to remove the reaction from.
   * @param userId The ID of the user whose reaction to remove. If not provided, removes the current user's reaction.
   * @param removeAll Remove all reactions of this type.
   * @throws {Error} If both userId and removeAll are provided, or if the API request fails.
   * @example
   * // Remove the current user's reaction
   * await channel.messages.removeReaction(messageId, "👍");
   * // Remove a specific user's reaction
   * await channel.messages.removeReaction(messageId, "👍", userId);
   * // Remove all reactions of this type
   * await channel.messages.removeReaction(messageId, "👍", undefined, true);
   */
  public async removeReaction(
    message: MessageResolvable,
    reaction: string,
    userId?: UserResolvable,
    removeAll?: boolean,
  ): Promise<void> {
    const id = this.resolveId(message);
    const targetUser = userId ? this.client.users.resolveId(userId) : undefined;

    const endpoint = `/channels/${this.channel.id}/messages/${id}/reactions/${reaction}` as const;

    const query: RouteParams<"delete", typeof endpoint> = {};

    if (targetUser) {
      query.user_id = targetUser;
    } else if (removeAll) {
      query.remove_all = true;
    }

    await this.client.rest.delete(endpoint, query);
  }

  /**
   * Remove all reactions from a message
   * Requires ManageMessages permission.
   * @param message The MessageResolvable to clear reactions from.
   * @throws {Error} If the API request fails.
   * @example
   * await channel.messages.clearReactions(messageId);
   */
  public async clearReactions(message: MessageResolvable): Promise<void> {
    const id = this.resolveId(message);
    await this.client.rest.delete(`/channels/${this.channel.id}/messages/${id}/reactions`);
  }

  [util.inspect.custom]() {
    return this.cache;
  }
}
