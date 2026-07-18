import { Base } from "./Base";
import type { Client } from "../client/Client";
import { Attachment } from "./Attachment";
import type { User as RawUser, FieldsUser } from "stoat-api";
import { decodeTime } from "ulid";

export type UserRelationShip = "None" | "User" | "Friend" | "Outgoing" | "Incoming" | "Blocked" | "BlockedOther";

export interface BotInformation {
  owner: string;
}

export type UserStatus = NonNullable<RawUser["status"]>;
export type UserPresence = NonNullable<UserStatus["presence"]>;

export interface UserProfile {
  background?: string | null;
  content?: string | null;
}

export class User extends Base {
  public discriminator!: string;
  public online!: boolean;
  public relationship!: UserRelationShip;
  public username!: string;
  public avatar?: Attachment | null;
  public badges?: number;
  public bot!: false | BotInformation;
  public displayName?: string | null;
  public flags?: number;
  public privileged?: boolean;
  public status?: UserStatus | null;
  public createdAt!: Date;
  public createdTimestamp!: number;
  public pronouns?: string | null = null;

  constructor(client: Client, data: RawUser) {
    super(client, data);
    this.bot = false;
    this.privileged = false;
    this.flags = 0;

    const timestamp = decodeTime(data._id);
    this.createdAt = new Date(timestamp);
    this.createdTimestamp = timestamp;

    this._patch(data);
  }

  public _patch(data: RawUser, clear?: FieldsUser[]): void {
    if (data.username !== undefined) this.username = data.username;
    if (data.discriminator !== undefined) this.discriminator = data.discriminator;
    if (data.online !== undefined) this.online = data.online;
    if (data.relationship !== undefined) this.relationship = data.relationship;
    if (data.pronouns !== undefined) this.pronouns = data.pronouns;

    if (data.display_name !== undefined) this.displayName = data.display_name;

    if (data.badges !== undefined) this.badges = data.badges;
    if (data.flags !== undefined) this.flags = data.flags;
    if (data.privileged !== undefined) this.privileged = data.privileged ?? false;
    if (data.status !== undefined) this.status = data.status;

    if (data.bot !== undefined) {
      this.bot = data.bot ? { owner: data.bot.owner } : false;
    }

    if (data.avatar !== undefined) {
      this.avatar = data.avatar ? new Attachment(this.client, data.avatar) : null;
    }

    // Handle deletions gracefully
    if (clear && Array.isArray(clear)) {
      for (const field of clear) {
        if (field === "Avatar") this.avatar = null;
        if (field === "StatusText" && this.status) this.status.text = null;
        if (field === "DisplayName") this.displayName = null;
        if (field === "Pronouns") this.pronouns = null;
      }
    }
  }

  /**
   * Convenience getter to return the user's tag (username#discriminator)
   */
  public get tag(): string {
    return `${this.username}#${this.discriminator}`;
  }

  /**
   * Fetch a User to update their information
   * @param force Skip the cache check and force an API request
   * @returns The fetched User object
   * @throws Error if the user cannot be found or fetched
   * @example
   * // Fetch a user
   * await user.fetch();
   */
  public async fetch(force: boolean = false): Promise<this> {
    return (await this.client.users.fetch(this.id, force)) as this;
  }
}
