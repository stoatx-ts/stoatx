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

/** A user's profile, from {@link User.fetchProfile}. */
export interface FetchedUserProfile {
  /** The profile's text ("about me"), or `null` if empty. */
  content: string | null;
  /** The profile's background image, or `null` if there isn't one. */
  background: Attachment | null;
}

/** What the logged-in user has in common with another user, from {@link User.fetchMutual}. */
export interface MutualConnections {
  /** Friends both users have. */
  userIds: string[];
  /** Servers both users are in. */
  serverIds: string[];
  /** Groups and DMs both users are in. */
  channelIds: string[];
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
        switch (field) {
          case "Avatar":
            this.avatar = null;
            break;
          case "DisplayName":
            this.displayName = null;
            break;
          case "Pronouns":
            this.pronouns = null;
            break;
          case "StatusText":
            this.status!.text = null;
            break;
          case "StatusPresence":
            this.status!.presence = null;
            break;
        }
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

  /**
   * Fetches this user's profile text and background.
   * @returns The profile.
   * @throws {StoatAPIError} `NotFound` if the logged-in user isn't allowed to see it.
   */
  public async fetchProfile(): Promise<FetchedUserProfile> {
    return this.client.users.fetchProfile(this.id);
  }

  /**
   * Fetches the friends, servers, groups and DMs the logged-in user has in common with this user.
   * @returns The IDs of each.
   */
  public async fetchMutual(): Promise<MutualConnections> {
    return this.client.users.fetchMutual(this.id);
  }

  /**
   * Sends this user a friend request, or accepts theirs if they sent one (user sessions only).
   * @returns This user, with `relationship` now `"Outgoing"` (request sent) or `"Friend"` (accepted).
   * @throws {StoatAPIError} `AlreadyFriends`, `AlreadySentRequest`, `Blocked`, `BlockedByOther`,
   * `TooManyPendingFriendRequests`, or `IsBot` if either side is a bot.
   */
  public async addFriend(): Promise<this> {
    return this._patchFrom(await this.client.rest.put(`/users/${this.id}/friend`));
  }

  /**
   * Removes this user as a friend, cancels a friend request you sent them,
   * or declines one they sent you (user sessions only).
   * @returns This user, with `relationship` now `"None"`.
   * @throws {StoatAPIError} `NoEffect` if there was no friendship or request.
   */
  public async removeFriend(): Promise<this> {
    return this._patchFrom(await this.client.rest.delete(`/users/${this.id}/friend`));
  }

  /**
   * Blocks this user. Any friendship or pending request is removed (user sessions only).
   * @returns This user, with `relationship` now `"Blocked"`.
   * @throws {StoatAPIError} `NoEffect` if they're already blocked.
   */
  public async block(): Promise<this> {
    return this._patchFrom(await this.client.rest.put(`/users/${this.id}/block`));
  }

  /**
   * Unblocks this user (user sessions only).
   * @returns This user, with `relationship` now `"None"`, or `"BlockedOther"` if they still block you.
   * @throws {StoatAPIError} `NoEffect` if they weren't blocked.
   */
  public async unblock(): Promise<this> {
    return this._patchFrom(await this.client.rest.delete(`/users/${this.id}/block`));
  }

  /**
   * Updates this user from an API response, keeping the cached copy in sync.
   * @param data The user as returned by the API.
   */
  private _patchFrom(data: RawUser): this {
    this._patch(data);
    if (this.client.users.cache.get(this.id) !== this) this.client.users._add(data);
    return this;
  }
}
