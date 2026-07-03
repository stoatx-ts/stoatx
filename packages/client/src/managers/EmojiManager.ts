import { BaseManager } from "./BaseManager";
import type { Client } from "../client/Client";
import { Emoji } from "../structures/Emoji";
import { Server } from "../structures/Server";
import * as util from "node:util";
import { DataCreateEmoji, DataEditEmoji, Emoji as RawEmoji } from "stoat-api";
import { AttachmentBuilder } from "../builders/AttachmentBuilder";
import { resolveAttachment } from "../utils/resolveAttachment";

export interface EmojiCreateOptions {
  // Autumn ID or Attachment
  emoji: string | AttachmentBuilder;
  name: string;
  nsfw?: boolean;
}

export interface EmojiEditOptions {
  name: string;
}

export type EmojiResolvable = string | Emoji;

export class EmojiManager extends BaseManager<string, Emoji, RawEmoji> {
  constructor(
    client: Client,
    public server?: Server,
    limit: number = Infinity,
  ) {
    super(client, limit);
  }

  /**
   * Tell BaseManager how to find the ID for Emojis
   */
  protected extractId(data: RawEmoji): string {
    return data._id;
  }

  /**
   * Tell BaseManager how to build an Emoji
   */
  protected construct(data: RawEmoji): Emoji {
    return new Emoji(this.client, data);
  }

  /**
   * Fetch an Emoji from the API or resolves it from the local cache.
   * @param emoji The ID, mention, or {@link Emoji} object to fetch
   * @param force Whether to skip the cache check and force a direct API request. Defaults to false.
   * @returns A promise that resolves to the fetched {@link Emoji} object.
   * @throws {TypeError} If an invalid {@link EmojiResolvable} is provided.
   * @throws {Error} If the API request fails.
   * @example
   * // Fetch a channel, bypassing cache
   * const channel = await client.channels.fetch("01H...", true);
   */
  public async fetch(emoji: EmojiResolvable, force: boolean = false): Promise<Emoji> {
    if (!force) {
      const cached = this.resolve(emoji);
      if (cached) return cached;
    }

    const id = this.resolveId(emoji);
    const data = await this.client.rest.get(`/custom/emoji/${id}`);
    return this._add(data);
  }

  /**
   * Resolves a {@link EmojiResolvable} to a {@link Emoji} object from the cache.
   * @param emoji The {@link EmojiResolvable} to resolve.
   * @returns The resolved {@link Emoji} object, or undefined if not found.
   */
  public resolve(emoji: EmojiResolvable): Emoji | undefined {
    if (emoji instanceof Emoji) return emoji;

    if (typeof emoji === "string") {
      const id = emoji.replace(/[<:>]/g, "");
      return this.cache.get(id);
    }

    return undefined;
  }

  /**
   * Extracts ID from a {@link EmojiResolvable}.
   * @param emoji The {@link EmojiResolvable} to extract the ID from.
   * @returns The extracted {@link Emoji} ID.
   * @throws {TypeError} If an invalid type is provided.
   */
  public resolveId(emoji: EmojiResolvable): string {
    if (emoji instanceof Emoji) return emoji.id;

    if (typeof emoji === "string") {
      return emoji.replace(/:/g, "");
    }

    throw new Error("Invalid EmojiResolvable");
  }

  /**
   * Create a new emoji
   * @param options The options for creating the emoji
   * @returns A promise that resolves to the created {@link Emoji} object.
   * @throws {Error} If no server is registered in the {@link EmojiManager} or if the emoji attachment cannot be resolved.
   * @example
   * const emoji = await client.emojis.create(server, { emoji: "path/to/emoji.png", name: "myEmoji" });
   */
  public async crate(options: EmojiCreateOptions): Promise<Emoji> {
    if (!this.server) throw new Error("No server registered in EmojiManager");

    const resolvedId = await resolveAttachment(this.client.rest, options.emoji, "emojis");

    if (!resolvedId) throw new Error("Failed to resolve emoji attachment");

    const payload: DataCreateEmoji = {
      name: options.name,
      parent: {
        type: "Server",
        id: this.server.id,
      },
    };

    if (options.nsfw) payload.nsfw = options.nsfw;

    const data = await this.client.rest.put(`/custom/emoji/${resolvedId}`, payload);

    return this._add(data);
  }

  /**
   * Delete an emoji
   * @param emoji The {@link EmojiResolvable} to delete
   * @throws {Error} If no server is registered in the {@link EmojiManager}.
   * @example
   * await client.emojis.delete(emoji);
   */
  public async delete(emoji: EmojiResolvable): Promise<void> {
    const id = this.resolveId(emoji);
    await this.client.rest.delete(`/custom/emoji/${id}`);
    this.cache.delete(id);
  }

  /**
   * Edit an emoji
   * @param emoji The {@link EmojiResolvable} to edit
   * @param options The options to edit the emoji with
   * @returns A promise that resolves to the edited {@link Emoji} object.
   * @throws {Error} If no server is registered in the {@link EmojiManager}.
   * @example
   * const editedEmoji = await client.emojis.edit(emoji, { name: "newName" });
   */
  public async edit(emoji: EmojiResolvable, options: EmojiEditOptions): Promise<Emoji> {
    const id = this.resolveId(emoji);

    const payload: DataEditEmoji = {
      name: options.name,
    };

    const data = await this.client.rest.patch(`/custom/emoji/${id}`, payload);

    return this._add(data);
  }

  [util.inspect.custom]() {
    return this.cache;
  }
}
