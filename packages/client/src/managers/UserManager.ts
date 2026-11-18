import { User, UserProfile, UserStatus } from "../structures/User";
import type { Client } from "../client/Client";
import { BaseManager } from "./BaseManager";
import { DMChannel } from "../structures/DMChannel";
import { User as RawUser, DataEditUser, FieldsUser } from "stoat-api";
import { finalizeEdit, setOrRemove } from "../utils/editPayload";

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
   * Fetch the current user (the bot itself).
   * @returns The fetched User object representing the current user.
   * @throws Error if the user cannot be fetched.
   * @example
   * // Fetch the current user (the bot itself)
   * const me = await client.users.fetchMe();
   * console.log(`Logged in as ${me.tag}`);
   */
  public async fetchMe() {
    const data = await this.client.rest.get(`/users/@me`);

    return this._add(data);
  }

  /**
   * Edits the currently authenticated user (the bot itself).
   * @param options The fields to update (avatar, status, profile, etc.).
   * @returns A promise that resolves to the updated User object.
   * @throws {TypeError} If invalid options are provided.
   * @throws {Error} If the API request fails.
   * @example
   * // Update the bot's status and presence
   * await client.users.editMe({
   *   status: { text: "Watching the server", presence: "Online" }
   * });
   *
   * // Clear the bot's avatar and display name
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
}
