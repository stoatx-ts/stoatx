import { Client } from "../client/Client";
import { Attachment } from "./Attachment";
import { BaseChannel } from "./BaseChannel";
import type { User } from "./User";
import type { UserResolvable } from "../managers/UserManager";
import { Collection } from "../utils/Collection";
import { inspectCustom, type InspectFn, type InspectOptions } from "../utils/inspect";
import { PermissionResolvable } from "../utils/permissions";
import type { Channel as RawChannel, FieldsChannel } from "stoat-api";
import { decodeTime } from "ulid";

export type RawGroupChannel = Extract<RawChannel, { channel_type: "Group" }>;

export class GroupChannel extends BaseChannel {
  public name!: string;
  public ownerId!: string;
  public recipients: string[] = [];
  public description?: string | null = null;
  public icon: Attachment | null = null;
  public lastMessageId?: string | null = null;
  public nsfw: boolean = false;
  public createdAt!: Date;
  public createdTimestamp!: number;

  constructor(client: Client, data: RawGroupChannel) {
    super(client, data);

    const timestamp = decodeTime(data._id);
    this.createdAt = new Date(timestamp);
    this.createdTimestamp = timestamp;

    this._patch(data);
  }

  public _patch(data: RawGroupChannel, clear?: FieldsChannel[]) {
    if (data.name !== undefined) this.name = data.name;
    if (data.owner !== undefined) this.ownerId = data.owner;
    if (data.recipients !== undefined) this.recipients = data.recipients;
    if (data.description !== undefined) this.description = data.description;
    if (data.last_message_id !== undefined) this.lastMessageId = data.last_message_id;
    if (data.nsfw !== undefined) this.nsfw = data.nsfw;

    if (data.icon !== undefined) {
      this.icon = data.icon ? new Attachment(this.client, data.icon) : null;
    }

    if (clear && Array.isArray(clear)) {
      for (const field of clear) {
        switch (field) {
          case "Description":
            this.description = null;
            break;
          case "Icon":
            this.icon = null;
            break;
        }
      }
    }
  }

  /** Gets the User object of the person who owns this group */
  public get owner(): User | undefined {
    return this.client.users.cache.get(this.ownerId);
  }

  /** Resolves the recipient IDs into an array of cached User objects */
  public get recipientUsers(): User[] {
    return this.recipients
      .map((id) => this.client.users.cache.get(id))
      .filter((user): user is User => user !== undefined);
  }

  /**
   * Fetches the group's members and caches them.
   * @returns The members, keyed by user ID.
   */
  public async fetchMembers(): Promise<Collection<string, User>> {
    const data = await this.client.rest.get(`/channels/${this.id}/members`);
    const members = new Collection<string, User>();
    for (const raw of data) {
      const user = this.client.users._add(raw);
      members.set(user.id, user);
    }
    return members;
  }

  /**
   * Adds a user to the group. They must be a friend of the logged-in user.
   * @param user The user to add.
   * @throws {StoatAPIError} `NotFriends`, `AlreadyInGroup`, `GroupTooLarge`, or `MissingPermission`.
   */
  public async addMember(user: UserResolvable): Promise<void> {
    const id = this.client.users.resolveId(user);
    await this.client.rest.put(`/channels/${this.id}/recipients/${id}`);
    if (!this.recipients.includes(id)) this.recipients = [...this.recipients, id];
  }

  /**
   * Removes a user from the group. Only the owner can do this.
   * @param user The user to remove. To leave the group yourself, use {@link leave}.
   * @throws {StoatAPIError} `NotOwner`, `NotInGroup`, or `CannotRemoveYourself`.
   */
  public async removeMember(user: UserResolvable): Promise<void> {
    const id = this.client.users.resolveId(user);
    await this.client.rest.delete(`/channels/${this.id}/recipients/${id}`);
    this.recipients = this.recipients.filter((recipient) => recipient !== id);
  }

  /**
   * Leaves the group and removes it from the cache.
   * @param options Set `silent` to leave without a "user left" message in the group.
   */
  public async leave(options: { silent?: boolean } = {}): Promise<void> {
    await this.client.rest.delete(`/channels/${this.id}`, { leave_silently: options.silent ?? false });
    this.client.channels.cache.delete(this.id);
  }

  /**
   * Updates the default (everyone) permissions for this channel.
   * @param permissions The default permissions to grant globally in this channel.
   * @returns A promise that resolves to the updated BaseChannel.
   * @throws {TypeError} If invalid permissions are provided.
   * @throws {Error} If the API request fails.
   * @example
   * // Set the default permission to allow everyone to view the channel
   * await channel.setDefaultPermissions(["ViewChannel", "ReadMessageHistory"]);
   */
  public async setDefaultPermissions(permissions: PermissionResolvable): Promise<this> {
    return (await this.client.channels.setDefaultPermissions(this.id, permissions)) as this;
  }

  /**
   * Customizes how Node.js prints this object with `console.log` and `util.inspect`,
   * hiding the circular client reference. Ignored in browsers.
   * @param _depth How many levels deep Node.js is still allowed to print (unused).
   * @param options The inspect options Node.js is printing with.
   * @param inspect Node's `util.inspect`, passed in so this file does not import `node:util`.
   * @internal
   */
  [inspectCustom](_depth: number, options: InspectOptions, inspect: InspectFn) {
    const { client, ...props } = this;
    return `${this.constructor.name} ${inspect(
      {
        ...props,
        owner: this.owner,
        recipientUsers: this.recipientUsers,
      },
      options,
    )}`;
  }
}
