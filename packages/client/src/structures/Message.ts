import { Base } from "./Base";
import { Client } from "../client/Client";
import { Member } from "./Member";
import { User } from "./User";
import { BaseChannel } from "./BaseChannel";
import { inspectCustom, type InspectFn, type InspectOptions } from "../utils/inspect";
import { EmbedBuilder, TextEmbedData } from "../builders/EmbedBuilder";
import { Attachment } from "./Attachment";
import { Server } from "./Server";
import { decodeTime } from "ulid";
import { UserResolvable } from "../managers/UserManager";
import { ReactionCollector, ReactionCollectorOptions } from "../utils/ReactionCollector";
import { Collection } from "../utils/Collection";
import { MessageReaction } from "./MessageReaction";
import { AttachmentBuilder } from "../builders/AttachmentBuilder";
import { Message as RawMessage, Embed as RawEmbed, SystemMessage } from "stoat-api";
import { MessageMentions } from "./MessageMentions";
import { sendReport, type ContentReportReason, type ReportOptions } from "../utils/report";

/** What a system message is about. See {@link Message.system}. */
export type { SystemMessage };

export interface MessageOptions {
  content?: string;
  /** Embeds to send. When editing, `null` (or `[]`) removes the message's embeds. */
  embeds?: (TextEmbedData | EmbedBuilder)[] | null;
  attachments?: string[] | AttachmentBuilder[];
  interactions?: {
    reactions?: string[] | null;
    restrict_reactions?: boolean;
  };
  flags?: number;
  masquerade?: Masquerade;
  replies?: ReplyIntent[];
}
export interface Masquerade {
  avatar?: string | null;
  name?: string | null;
  colour?: string | null;
}
export interface ReplyIntent {
  id: string;
  mention: boolean;
  fail_if_not_exists?: boolean;
}

export interface Interaction {
  reactions: string[];
  restrictReactions: boolean;
}

export class Message extends Base {
  public content: string | null = null;
  public authorId: string;
  public channelId: string;
  public embeds: RawEmbed[] | null = [];
  public attachments: Attachment[] = [];
  public editedAt: Date | null = null;
  public createdAt!: Date;
  public createdTimestamp!: number;
  public flags: number = 0;
  public interactions: Interaction | null = null;
  public masquerade: Masquerade | null = null;
  public mentions: MessageMentions;
  public pinned: null | boolean = false;
  public reactions: Record<string, string[]> = {};
  public replies: string[] | null = [];
  /**
   * What a system message is about, e.g. `{ type: "user_joined", id }` or
   * `{ type: "message_pinned", id, by }`. `null` for messages written by a user or bot.
   * System messages have no content, and their author ID is all zeros.
   */
  public system: SystemMessage | null = null;

  constructor(client: Client, data: RawMessage) {
    super(client, data);

    this.authorId = data.author;
    this.channelId = data.channel;

    const timestamp = decodeTime(data._id);
    this.createdAt = new Date(timestamp);
    this.createdTimestamp = timestamp;

    this.mentions = new MessageMentions(client, this, data.mentions ?? null, data.role_mentions ?? null);

    this._patch(data);
  }

  /**
   * Whether this message is partial: it was created from an update event for an
   * uncached message and is missing data such as its author. Call {@link Message.fetch}
   * to fill it in.
   */
  public get partial(): boolean {
    return !this.authorId;
  }

  public async reply(contentOrOptions: string | MessageOptions): Promise<Message> {
    const channel = await this.resolveChannel();

    const options: MessageOptions =
      typeof contentOrOptions === "string" ? { content: contentOrOptions } : { ...contentOrOptions };

    const repliesArray: ReplyIntent[] = options.replies ? [...options.replies] : [];

    const alreadyReplying = repliesArray.some((reply) => reply.id === this.id);
    if (!alreadyReplying) {
      repliesArray.push({
        id: this.id,
        mention: true,
      });
    }

    options.replies = repliesArray;

    return channel.messages.send(options);
  }

  /**
   * Fetches this message. A cached message, including a partial one, is updated in place
   * and the same instance is returned.
   * @param force Whether to skip the cache and request the message from the API. Defaults to true.
   */
  public async fetch(force: boolean = true): Promise<Message> {
    const channel = await this.resolveChannel();
    if (!force) {
      const cached = channel.messages.cache.get(this.id);
      if (cached) return cached;
    }
    return channel.messages.fetch(this.id);
  }

  /**
   * Edits this message.
   * @param contentOrOptions The new content or options for the message.
   */
  public async edit(contentOrOptions: string | MessageOptions): Promise<this> {
    const channel = await this.resolveChannel();

    return (await channel.messages.edit(this.id, contentOrOptions)) as this;
  }

  /**
   * Deletes this message.
   */
  public async delete(): Promise<void> {
    const channel = await this.resolveChannel();

    await channel.messages.delete(this.id);
  }

  /**
   * Reports this message to Stoat's moderation team.
   * @param reason Why it's being reported.
   * @param options More details for the moderators.
   * @example
   * await message.report("SpamAbuse", { context: "Posted the same link in every channel" });
   */
  public async report(reason: ContentReportReason, options?: ReportOptions): Promise<void> {
    await sendReport(this.client, { type: "Message", id: this.id, report_reason: reason }, options);
  }

  /**
   * Pins this message.
   */
  public async pin(): Promise<void> {
    const channel = await this.resolveChannel();

    await channel.messages.pin(this.id);
  }

  /**
   * Unpins this message.
   */
  public async unpin(): Promise<void> {
    const channel = await this.resolveChannel();

    await channel.messages.unpin(this.id);
  }

  /**
   * React to this message
   * @param reaction The emoji to react with. Can be a Unicode emoji or a custom emoji ID.
   * @throws {Error} If the API request fails.
   * @example
   * await message.react("👍");
   * await message.react("customEmojiId");
   */
  public async react(reaction: string): Promise<void> {
    const channel = await this.resolveChannel();

    await channel.messages.react(this.id, reaction);
  }

  /**
   * Remove a reaction from this message
   * @param reaction The emoji to remove. Can be a Unicode emoji or a custom emoji ID.
   * @param userId The ID of the user whose reaction to remove. If not provided, removes the current user's reaction.
   * @param removeAll Remove all reactions of this type.
   * @throws {Error} If the API request fails. If both userId and removeAll are provided, userId takes precedence.
   * @example
   * // Remove the current user's reaction
   * await message.removeReaction("👍");
   * // Remove a specific user's reaction
   * await message.removeReaction("👍", userId);
   * // Remove all reactions of this type
   * await message.removeReaction("👍", undefined, true);
   */
  public async removeReaction(reaction: string, userId?: UserResolvable, removeAll?: boolean): Promise<void> {
    const channel = await this.resolveChannel();

    await channel.messages.removeReaction(this.id, reaction, userId, removeAll);
  }

  /**
   * Remove all reactions from this message
   * @throws {Error} If the API request fails.
   * @example
   * await message.clearReactions();
   */
  public async clearReactions(): Promise<void> {
    const channel = await this.resolveChannel();

    await channel.messages.clearReactions(this.id);
  }

  /**
   * Creates a ReactionCollector to collect reactions on this message.
   * @param options The options for the collector.
   * @returns A new ReactionCollector instance.
   * @example
   * const collector = message.createReactionCollector({ time: 15000 });
   * collector.on('collect', (reaction) => console.log(`Collected ${reaction.emojiId} from ${reaction.userId}`));
   * collector.on('end', (collected) => console.log(`Collected ${collected.size} items`));
   */
  public createReactionCollector(options?: ReactionCollectorOptions): ReactionCollector {
    return new ReactionCollector(this, options);
  }

  /**
   * Awaits reactions on this message.
   * @param options The options for the collector.
   * @returns A promise that resolves to a collection of reactions collected.
   * @example
   * // Await reactions
   * const filter = (reaction) => reaction.emoji.id === '123' && reaction.users.has(author.id);
   * message.awaitReactions({ filter, max: 1, time: 60000 })
   *   .then(collected => console.log(collected.size))
   *   .catch(console.error);
   */
  public awaitReactions(options?: ReactionCollectorOptions): Promise<Collection<string, MessageReaction>> {
    return new Promise((resolve) => {
      const collector = this.createReactionCollector(options);
      collector.once("end", (collected) => resolve(collected));
    });
  }

  /**
   * Returns the cached channel, fetching it if it is not cached.
   */
  private async resolveChannel(): Promise<BaseChannel> {
    return this.channel ?? (await this.client.channels.fetch(this.channelId));
  }

  /** Gets the Channel object from cache */
  public get channel(): BaseChannel | undefined {
    return this.client.channels.cache.get(this.channelId);
  }

  /** Gets the Global User object from cache */
  public get author(): User | undefined {
    return this.client.users.cache.get(this.authorId);
  }

  /** Gets the Server Member object (if sent in a server) */
  public get member(): Member | undefined {
    const channel = this.channel;
    if (channel && "serverId" in channel) {
      const server = this.client.servers.cache.get((channel as any).serverId);
      return server?.members.cache.get(this.authorId);
    }
    return undefined;
  }

  /** Gets the Server ID if this message was sent in a server channel */
  public get serverId(): string | undefined {
    const channel = this.channel;
    if (channel && "serverId" in channel) {
      return (channel as any).serverId as string;
    }
    return undefined;
  }

  /** Gets the Server object from cache */
  public get server(): Server | undefined {
    const serverId = this.serverId;
    if (!serverId) return undefined;
    return this.client.servers.cache.get(serverId);
  }

  public _patch(data: Partial<RawMessage>) {
    if (data.author !== undefined) this.authorId = data.author;
    if (data.channel !== undefined) this.channelId = data.channel;
    if (data.attachments !== undefined) {
      this.attachments = (data.attachments ?? []).map((fileData: any) => new Attachment(this.client, fileData));
    }
    if (data.masquerade !== undefined) this.masquerade = data.masquerade;
    if (data.replies !== undefined) this.replies = data.replies;
    if (data.mentions !== undefined || data.role_mentions !== undefined) {
      this.mentions = new MessageMentions(this.client, this, data.mentions ?? null, data.role_mentions ?? null);
    }
    if (data.content !== undefined) this.content = data.content;
    if (data.edited !== undefined) this.editedAt = new Date(data.edited ?? 0);
    if (data.pinned !== undefined) this.pinned = data.pinned;
    if (data.embeds !== undefined) this.embeds = data.embeds;
    if (data.flags !== undefined) this.flags = data.flags;
    if (data.system !== undefined) this.system = data.system ?? null;
    if (data.reactions !== undefined) {
      this.reactions = Array.isArray(data.reactions) ? {} : data.reactions;
    }

    if (data.interactions !== undefined) {
      if (data.interactions) {
        this.interactions = {
          reactions: data.interactions.reactions ?? [],
          restrictReactions: data.interactions.restrict_reactions ?? false,
        };
      } else {
        this.interactions = null;
      }
    }
  }

  /**
   * Customizes how Node.js prints this object with `console.log` and `util.inspect`,
   * hiding the circular client reference. Ignored in browsers.
   * @param depth How many levels deep Node.js is still allowed to print.
   * @param options The inspect options Node.js is printing with.
   * @param inspect Node's `util.inspect`, passed in so this file does not import `node:util`.
   * @internal
   */
  [inspectCustom](depth: number, options: InspectOptions, inspect: InspectFn) {
    const { client, authorId, channelId, ...props } = this;

    const data = {
      ...props,
      author: this.author,
      channel: this.channel,
      server: this.server,
      member: this.member,
    };

    return `${this.constructor.name} ${inspect(data, { ...options, depth: depth ?? options.depth })}`;
  }
}
