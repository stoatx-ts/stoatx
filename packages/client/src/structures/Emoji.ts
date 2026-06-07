import { Base } from "./Base";
import type { Client } from "../client/Client";
import type { Emoji as RawEmoji } from "stoat-api";

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
}
