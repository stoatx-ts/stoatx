import {
  User,
  UserProfile,
  UserRelationShip,
  UserStatus,
  type FetchedUserProfile,
  type MutualConnections,
} from "../structures/User";
import { Attachment } from "../structures/Attachment";
import type { Client } from "../client/Client";
import { BaseManager } from "./BaseManager";
import { DMChannel } from "../structures/DMChannel";
import { User as RawUser, DataEditUser, FieldsUser } from "stoat-api";
import { finalizeEdit, setOrRemove } from "../utils/editPayload";
import { Collection } from "../utils/Collection";
import type { BaseChannel } from "../structures/BaseChannel";

export type UserResolvable = User | string;

const USER_MENTION = /[<@>]/g;

export interface UserEditOptions {
  avatar?: string | null;
  displayName?: string | null;
  profile?: UserProfile;
  status?: UserStatus;
}

export class UserManager extends BaseManager<string, User, RawUser> {
  constructor(client: Client, limit: number = Infinity) {
    super(client, limit);
  }

  /**
   * Tell BaseManager how to find the ID for Users
   */
  protected extractId(data: RawUser): string {
    return data._id;
  }

  /**
   * Tell BaseManager how to build a User
   */
  protected construct(data: RawUser): User {
    return new User(this.client, data);
  }

  /**
   * Resolves a UserResolvable to a User object from the cache.
   */
  public resolve(user: UserResolvable): User | undefined {
    return this.resolveFromCache(user, User, USER_MENTION);
  }

  /**
   * Extracts ID from a UserResolvable.
   * @param user The UserResolvable to extract the ID from.
   * @returns The extracted user ID.
   * @throws TypeError if an invalid type is provided.
   */
  public resolveId(user: UserResolvable): string {
    return this.resolveIdFrom(user, User, USER_MENTION);
  }

  /**
   * Fetches a User.
   * @param user The ID or mention to fetch
   * @param force Skip the cache check and force an API request
   * @returns The fetched User object
   * @throws Error if the user cannot be found or fetched
   * @throws TypeError if invalid UserResolvable is provided
   * @example
   * // Fetch a user by ID
   * const user = await client.users.fetch("01JE2MM759J5D7CHJF084R7MJ2");
   * console.log(user.username);
   *
   * // Fetch a user by mention
   * const user = await client.users.fetch("<@01JE2MM759J5D7CHJF084R7MJ2>");
   * console.log(user.username);
   *
   * // Force fetch a user, bypassing the cache
   * const user = await client.users.fetch("01JE2MM759J5D7CHJF084R7MJ2", true);
   * console.log(user.username);
   */
  public async fetch(user: UserResolvable, force: boolean = false): Promise<User> {
    return this.fetchWithCache(user, force, (id) => this.client.rest.get(`/users/${id}`) as Promise<RawUser>);
  }

  /**
   * Fetch the logged-in user (the bot, or the user account for user sessions).
   * @returns The fetched User object representing the current user.
   * @throws Error if the user cannot be fetched.
   * @example
   * // Fetch the logged-in user
   * const me = await client.users.fetchMe();
   * console.log(`Logged in as ${me.tag}`);
   */
  public async fetchMe() {
    const data = await this.client.rest.get(`/users/@me`);

    return this._add(data);
  }

  /**
   * Fetches a user's profile text and background.
   * @param user The user or their ID.
   * @returns The profile.
   * @throws {StoatAPIError} `NotFound` if the logged-in user isn't allowed to see it.
   * @example
   * const { content, background } = await client.users.fetchProfile(userId);
   */
  public async fetchProfile(user: UserResolvable): Promise<FetchedUserProfile> {
    const data = await this.client.rest.get(`/users/${this.resolveId(user)}/profile`);
    return {
      content: data.content || null,
      background: data.background ? new Attachment(this.client, data.background) : null,
    };
  }

  /**
   * Fetches the friends, servers, groups and DMs the logged-in user has in common with a user.
   * @param user The user or their ID.
   * @returns The IDs of each. Look them up in `client.users`, `client.servers` and `client.channels`.
   * @example
   * const { serverIds } = await client.users.fetchMutual(userId);
   * const servers = serverIds.map((id) => client.servers.cache.get(id)).filter(Boolean);
   */
  public async fetchMutual(user: UserResolvable): Promise<MutualConnections> {
    const data = await this.client.rest.get(`/users/${this.resolveId(user)}/mutual`);
    return { userIds: data.users, serverIds: data.servers, channelIds: data.channels };
  }

  /**
   * Edits the logged-in user (the bot, or the user account for user sessions).
   * @param options The fields to update (avatar, status, profile, etc.).
   * @returns A promise that resolves to the updated User object.
   * @throws {TypeError} If invalid options are provided.
   * @throws {Error} If the API request fails.
   * @example
   * // Update your status and presence
   * await client.users.editMe({
   *   status: { text: "Watching the server", presence: "Online" }
   * });
   *
   * // Clear your avatar and display name
   * await client.users.editMe({ avatar: null, displayName: null });
   */
  public async editMe(options: UserEditOptions): Promise<User> {
    if (!options || typeof options !== "object") {
      throw new TypeError("UserEditOptions must be a valid object.");
    }

    const selfId = this.client.user?.id;
    if (!selfId) {
      throw new Error("CLIENT_USER_NOT_READY: editMe() requires the client to be logged in and ready.");
    }

    const payload: DataEditUser = {};
    const remove: FieldsUser[] = [];

    setOrRemove(payload, remove, "display_name", options.displayName, "DisplayName");
    setOrRemove(payload, remove, "avatar", options.avatar, "Avatar");

    if (options.profile !== undefined) {
      const profile: NonNullable<DataEditUser["profile"]> = {};
      setOrRemove(profile, remove, "content", options.profile.content, "ProfileContent");
      setOrRemove(profile, remove, "background", options.profile.background, "ProfileBackground");
      if (Object.keys(profile).length > 0) payload.profile = profile;
    }

    if (options.status !== undefined) {
      const status: NonNullable<DataEditUser["status"]> = {};
      setOrRemove(status, remove, "text", options.status.text, "StatusText");
      setOrRemove(status, remove, "presence", options.status.presence, "StatusPresence");
      if (Object.keys(status).length > 0) payload.status = status;
    }

    if (!finalizeEdit(payload, remove)) {
      return this.fetch("@me");
    }

    const data = await this.client.rest.patch(`/users/${selfId}`, payload);

    return this._add(data);
  }

  /**
   * Changes the logged-in user's username (user sessions only). The discriminator may change too,
   * if the new username is already taken with the current one.
   * @param username The new username: 2–32 characters, letters, numbers, `_`, `.` and `-`.
   * @param password The account's current password.
   * @returns The updated user.
   * @throws {StoatAPIError} `InvalidCredentials` for a wrong password, or `UsernameTaken`.
   * @example
   * const me = await client.users.setUsername("newname", password);
   * console.log(`${me.username}#${me.discriminator}`);
   */
  public async setUsername(username: string, password: string): Promise<User> {
    const data = await this.client.rest.patch("/users/@me/username", { username, password });
    // client.user is its own instance, so keep it in sync with the cached user.
    if (this.client.user?.id === data._id) this.client.user._patch(data);
    return this._add(data);
  }

  /**
   * The DM between the client's user and a user
   *
   * @param {string} userId The user id
   * @returns {?DMChannel}
   * @private
   */
  dmChannel(userId: string): DMChannel | null {
    return (this.client.channels.cache.find((channel) => channel.isDM() && channel.recipients.includes(userId)) ??
      null) as DMChannel | null;
  }

  /**
   * Creates a DM channel between the client's user and another user.
   * @param user The UserResolvable to create a DM with.
   * @param options Additional options for DM creation.
   * @param options.force If true, forces the creation of a new DM channel even if one already exists.
   * @returns A promise that resolves to the created DMChannel object.
   * @throws {TypeError} If an invalid UserResolvable is provided.
   * @throws {Error} If the API request fails.
   * @example
   * // Create a DM with a user by ID
   * const dm = await client.users.createDM("1234567890");
   * console.log(`DM channel ID: ${dm.id}`);
   */
  public async createDM(user: UserResolvable, { force = false } = {}): Promise<DMChannel> {
    const id = this.resolveId(user);

    if (!force) {
      const dmChannel = this.dmChannel(id);
      if (dmChannel) return dmChannel;
    }

    const data = await this.client.rest.get(`/users/${id}/dm`);
    return this.client.channels._add(data) as DMChannel;
  }

  /**
   * Sends a friend request by username (user sessions only).
   * @param username The full username with discriminator, e.g. `"alice#1234"`.
   * @returns The user the request was sent to, with `relationship` `"Outgoing"`,
   * or `"Friend"` if they had already sent you a request.
   * @throws {TypeError} If `username` has no `#discriminator`.
   * @throws {StoatAPIError} `NotFound` if no such user exists, plus the errors from {@link User.addFriend}.
   */
  public async sendFriendRequest(username: string): Promise<User> {
    if (!username.includes("#")) {
      throw new TypeError(`Friend requests need the full username with discriminator, e.g. "alice#1234".`);
    }
    return this._add(await this.client.rest.post("/users/friend", { username }));
  }

  /** Users you're friends with (user sessions only). */
  public get friends(): Collection<string, User> {
    return this.withRelationship("Friend");
  }

  /** Users who sent you a friend request you haven't answered. Accept with `addFriend()`, decline with `removeFriend()`. */
  public get incomingFriendRequests(): Collection<string, User> {
    return this.withRelationship("Incoming");
  }

  /** Users you sent a friend request to that they haven't answered. Cancel with `removeFriend()`. */
  public get outgoingFriendRequests(): Collection<string, User> {
    return this.withRelationship("Outgoing");
  }

  /** Users you've blocked. */
  public get blocked(): Collection<string, User> {
    return this.withRelationship("Blocked");
  }

  /**
   * Fetches every DM, group and Saved Messages channel you're in (user sessions only).
   * These already arrive when the client connects, so this is only needed to resync.
   * @returns The channels, keyed by ID.
   */
  public async fetchDMs(): Promise<Collection<string, BaseChannel>> {
    const data = await this.client.rest.get("/users/dms");
    const channels = new Collection<string, BaseChannel>();
    for (const raw of data) {
      const channel = this.client.channels._add(raw);
      channels.set(channel.id, channel);
    }
    return channels;
  }

  /**
   * Cached users with the given relationship to you. Everyone you have a relationship with
   * is sent when the client connects, so this is complete unless `cacheLimits.users` evicted some.
   * @param relationship The relationship to filter by.
   */
  private withRelationship(relationship: UserRelationShip): Collection<string, User> {
    return this.cache.filter((user) => user.relationship === relationship);
  }
}
