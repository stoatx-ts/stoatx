import { Base } from "./Base";
import type { Client } from "../client/Client";
import type { TextChannel } from "./TextChannel";
import { MessageFetchOptions, MessageManager, MessageResolvable } from "../managers/MessageManager";
import { Message, MessageOptions } from "./Message";
import { DMChannel } from "./DMChannel";
import { GroupChannel } from "./GroupChannel";
import { ChannelEditOptions } from "../managers/ChannelManager";
import { Collection } from "../utils/Collection";
import type { VoiceState } from "./VoiceState";
import { MessageCollector, MessageCollectorOptions } from "../utils/MessageCollector";
import { Channel as RawChannel } from "stoat-api";
import type { VoiceChannel } from "./VoiceChannel";
import { WebhookManager } from "../managers/WebhookManager";
import type { Member } from "./Member";
import type { UserResolvable } from "../managers/UserManager";
import { Permissions } from "../utils/permissions";
import { calculateChannelPermissions } from "../utils/permissionCalculator";

export type ChannelType = "SavedMessages" | "DirectMessage" | "Group" | "TextChannel";

export interface ChannelCreateOptions {
  name: string;
  type: "Text" | "Voice";
  description?: string;
  nsfw?: boolean;
  voice?: {
    max_users?: number;
  };
}

export abstract class BaseChannel extends Base {
  public type: ChannelType;
  public messages: MessageManager;
  public webhooks: WebhookManager;
  /**
   * IDs of the users currently typing in this channel, kept up to date from gateway events.
   * Cleared when a user sends a message or stops typing, and on reconnect.
   */
  public readonly typingUserIds = new Set<string>();

  /** When {@link startTyping} may next send, so calling it on every keystroke doesn't flood the gateway. */
  private _typingThrottleUntil = 0;

  protected constructor(client: Client, data: RawChannel) {
    super(client, data);
    this.type = data.channel_type;

    this.messages = new MessageManager(this.client, this);
    this.webhooks = new WebhookManager(this.client, this);
  }

  /**
   * Sends a message to this channel.
   * @param contentOrOptions The string content or message options payload.
   * @returns A promise that resolves to the sent Message.
   * @example
   * await channel.send("Hello world!");
   * await channel.send({ content: "Here is an embed", embeds: [myEmbed] });
   */
  public async send(contentOrOptions: string | MessageOptions): Promise<Message> {
    return this.messages.send(contentOrOptions);
  }

  /**
   * Shows the logged-in user as typing in this channel. Safe to call on every keystroke:
   * it sends at most once every 2.5 seconds, and other clients drop the indicator after
   * 4 seconds without a refresh. Call {@link stopTyping} when the user stops, or just send
   * the message: sending ends the indicator.
   * @returns `false` if the gateway isn't connected.
   */
  public startTyping(): boolean {
    if (Date.now() < this._typingThrottleUntil) return true;
    const sent = this.client.gateway.send({ type: "BeginTyping", channel: this.id });
    if (sent) this._typingThrottleUntil = Date.now() + 2500;
    return sent;
  }

  /**
   * Stops showing the logged-in user as typing in this channel.
   * @returns `false` if the gateway isn't connected.
   */
  public stopTyping(): boolean {
    this._typingThrottleUntil = 0;
    return this.client.gateway.send({ type: "EndTyping", channel: this.id });
  }

  /**
   * Whether this channel has messages the logged-in user hasn't read. Always `false` for bots.
   */
  /** Everyone in this channel's voice call, by user ID. Empty if nobody is in it. */
  public get voiceStates(): Collection<string, VoiceState> {
    return this.client.voiceStates.get(this.id);
  }

  /**
   * What the logged-in user can do in this channel, with the channel's overrides applied.
   * @example
   * if (channel.permissions.has("SendMessage")) showComposer();
   */
  public get permissions(): Permissions {
    return this.client.user ? this.permissionsFor(this.client.user.id) : new Permissions(0n);
  }

  /**
   * What a user can do in this channel, with the channel's overrides applied, following the same
   * rules as Stoat: role and channel overrides in servers, friends-only DMs, group permissions,
   * and timeouts. Users that aren't in the channel, or aren't cached, have no permissions.
   * @param user The user, their ID, or their server member.
   * @example
   * const canSee = channel.permissionsFor(member).has("ViewChannel");
   */
  public permissionsFor(user: UserResolvable | Member): Permissions {
    const id = typeof user === "string" ? user : user.id;
    return new Permissions(calculateChannelPermissions(this.client, this, id));
  }

  public get unread(): boolean {
    return this.client.unreads.isUnread(this.id);
  }

  /**
   * How many unread messages in this channel mention the logged-in user. Always `0` for bots.
   */
  public get mentionCount(): number {
    return this.client.unreads.mentionCount(this.id);
  }

  /**
   * Marks this channel as read (user sessions only).
   * @param message The last message read. Defaults to the latest message in the channel.
   */
  public async ack(message?: MessageResolvable): Promise<void> {
    return this.client.unreads.ack(this.id, message);
  }

  /**
   * Fetch this channel
   * @param force Whether to skip the cache check and force a direct API request. Defaults to false
   * @throws {Error} If the API request fails
   * @returns {BaseChannel}
   * @example
   * // Force fetch channel to update its data
   * await channel.fetch(true);
   */
  public async fetch(force: boolean = false): Promise<BaseChannel> {
    return await this.client.channels.fetch(this.id, force);
  }

  /**
   * Fetches multiple messages from this channel.
   * @param options The query parameters to filter the messages.
   * @throws {Error} If the API request fails
   * @returns A Collection of Messages, keyed by their ID.
   * @example
   * // Fetch the last 50 messages in the channel
   * const messages = await channel.fetchMessages({ limit: 50 });
   * console.log(`Fetched ${messages.size} messages`);
   * // Fetch messages before a specific message ID
   * const messages = await channel.fetchMessages({ before: "MESSAGE_ID" });
   * console.log(`Fetched ${messages.size} messages sent before the specified message`);
   * // Fetch messages after a specific message ID
   * const messages = await channel.fetchMessages({ after: "MESSAGE_ID" });
   * console.log(`Fetched ${messages.size} messages sent after the specified message`);
   * // Fetch messages around a specific message ID
   * const messages = await channel.fetchMessages({ nearby: "MESSAGE_ID", limit: 10 });
   * console.log(`Fetched ${messages.size} messages sent around the specified message`);
   */
  public async fetchMessages(options?: MessageFetchOptions): Promise<Collection<string, Message>> {
    return this.messages.fetchMany(options);
  }

  /**
   * Edits this channel.
   * @param options The fields to update
   * @throws {Error} If the API request fails
   * @returns BaseChannel
   * @example
   * // Edit the channel's name
   * await channel.edit({name: "New Cool Name"});
   */
  public async edit(options: ChannelEditOptions): Promise<BaseChannel> {
    return await this.client.channels.edit(this.id, options);
  }

  /**
   * Deletes this channel.
   * @throws {Error} If the API request fails
   * @example
   * // Delete the channel
   * await channel.delete();
   */
  public async delete(): Promise<void> {
    await this.client.channels.delete(this.id);
  }

  /**
   * Bulk delete messages from this channel
   * @param messages MessageResolvable to delete
   * @throws {Error} If the API request fails
   * @example
   * // Delete messages by their ID's
   * await channel.bulkDelete(["MESSAGE_ID_1", "MESSAGE_ID_2", "MESSAGE_ID_3"]);
   * // Delete messages by their Message objects
   * await channel.bulkDelete([message1, message2, message3]);
   */
  public async bulkDelete(messages: MessageResolvable[]): Promise<void> {
    await this.client.channels.bulkDelete(this.id, messages);
  }

  /**
   * Creates a MessageCollector to collect messages in this channel.
   * @param options The options for the collector.
   * @returns The instantiated MessageCollector
   * @example
   * const collector = channel.createMessageCollector({ filter: m => m.authorId === '123', time: 15000 });
   * collector.on('collect', m => console.log(`Collected ${m.content}`));
   * collector.on('end', collected => console.log(`Collected ${collected.size} items`));
   */
  public createMessageCollector(options?: MessageCollectorOptions): MessageCollector {
    return new MessageCollector(this, options);
  }

  /**
   * Awaits messages in this channel that meet certain criteria.
   * @param options The options for the collector.
   * @returns A promise that resolves to a collection of messages.
   * @example
   * // Await !vote messages
   * const filter = m => m.content.startsWith('!vote');
   * channel.awaitMessages({ filter, max: 4, time: 60000 })
   *   .then(collected => console.log(collected.size))
   *   .catch(console.error);
   */
  public awaitMessages(options: MessageCollectorOptions = {}): Promise<Collection<string, Message>> {
    return new Promise((resolve, reject) => {
      const collector = this.createMessageCollector(options);

      collector.once("end", (collected, reason) => {
        if (options.max && reason !== "limit" && reason !== "time") {
          return reject(new Error(`Collector ended with reason: ${reason}`));
        }

        resolve(collected);
      });
    });
  }

  public isText(): this is TextChannel {
    return this.type === "TextChannel";
  }

  public isDM(): this is DMChannel {
    return this.type === "DirectMessage";
  }

  public isGroup(): this is GroupChannel {
    return this.type === "Group";
  }

  public isVoice(): this is VoiceChannel {
    return this.isText() && !!(this as TextChannel).voice;
  }
}
