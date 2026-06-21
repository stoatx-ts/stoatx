import { Base } from "./Base";
import type { Client } from "../client/Client";
import type { Emoji as RawEmoji } from "stoat-api";
import { EmojiEditOptions } from "../managers/EmojiManager";

export type EmojiParent = { type: "Server"; id: string } | { type: "Detached" };

export class Emoji extends Base {
  public creatorId!: string;
  public name!: string;
  public parent!: EmojiParent;
  public animated: boolean = false;
  public nsfw: boolean = false;

  constructor(client: Client, data: RawEmoji) {
    super(client, data);
    this._patch(data);
  }

  public _patch(data: RawEmoji) {
    if (data.creator_id !== undefined) this.creatorId = data.creator_id;
    if (data.name !== undefined) this.name = data.name;
    if (data.parent !== undefined) this.parent = data.parent;
    if (data.animated !== undefined) this.animated = data.animated;
    if (data.nsfw !== undefined) this.nsfw = data.nsfw;
  }

  /**
   * Fetch this emoji from the API or resolves it from the local cache.
   * @param force Whether to skip the cache check and force a direct API request. Defaults to false.
   * @returns A promise that resolves to the fetched {@link Emoji} object.
   * @throws {Error} If the API request fails or if the emoji is detached.
   * @example
   * // Force fetch emoji to update its data
   * await emoji.fetch(true);
   */
  public async fetch(force?: boolean): Promise<Emoji> {
    const server = this.client.servers.cache.get(this.parent.type === "Server" ? this.parent.id : "");
    if (!server) throw new Error("No server registered in EmojiManager");

    if (this.parent.type === "Detached") throw new Error("Cannot fetch a detached emoji");
    return await server.emojis.fetch(this, force);
  }

  /**
   * Deletes this emoji from the server.
   * @returns A promise that resolves when the emoji has been deleted.
   * @throws {Error} If the API request fails or if the emoji is detached.
   * @example
   * // Delete an emoji from the server
   * await emoji.delete();
   */
  public async delete(): Promise<void> {
    const server = this.client.servers.cache.get(this.parent.type === "Server" ? this.parent.id : "");
    if (!server) throw new Error("No server registered in EmojiManager");

    if (this.parent.type === "Detached") throw new Error("Emoji is already detached");
    await server.emojis.delete(this);
  }

  /**
   * Edits this emoji's properties.
   * @param options The options to edit the emoji with.
   * @returns A promise that resolves to the edited {@link Emoji} object.
   * @throws {Error} If the API request fails or if the emoji is detached.
   * @example
   * // Edit an emoji's name
   * await emoji.edit({ name: "new_name" });
   */
  public async edit(options: EmojiEditOptions): Promise<Emoji> {
    const server = this.client.servers.cache.get(this.parent.type === "Server" ? this.parent.id : "");
    if (!server) throw new Error("No server registered in EmojiManager");

    if (this.parent.type === "Detached") throw new Error("Cannot edit a detached emoji");

    return await server.emojis.edit(this, options);
  }
}
