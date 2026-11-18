import { Member } from "../structures/Member";
import { Collection } from "../utils/Collection";
import type { Client } from "../client/Client";
import type { Server } from "../structures/Server";
import { User } from "../structures/User";
import { BaseManager } from "./BaseManager";
import { DataMemberEdit, FieldsMember, Member as RawMember, DataBanCreate } from "stoat-api";
import { RouteParams } from "../utils/schema";
import { finalizeEdit, setOrRemove } from "../utils/editPayload";

export type MemberResolvable = Member | User | string;

const MEMBER_MENTION = /[<@>]/g;

export interface MemberEditOptions {
  nickname?: string | null;
  avatar?: string | null;
  roles?: string[];
  timeout?: string | null;
}

export interface MemberBanOptions {
  reason?: string | null;
  deleteMessageSeconds?: number;
}

export interface FetchMembersOptions {
  /** Whether to exclude offline users from the fetch */
  excludeOffline?: boolean;
}

export class MemberManager extends BaseManager<string, Member, RawMember> {
  constructor(
    client: Client,
    public server: Server,
    limit: number = Infinity,
  ) {
    super(client, limit);
  }

  /**
   * Tell BaseManager how to handle Revolt's Member IDs
   * @internal
   */
  protected extractId(data: RawMember): string {
    return data._id?.user;
  }

  /**
   * Tell BaseManager how to build a Member
   * @internal
   */
  protected construct(data: RawMember): Member {
    return new Member(this.client, data, this.server.id);
  }

  /**
   * Resolve a string or mention to Member
   * @param member The MemberResolvable to resolve
   * @returns The resolved Member or undefined if not found
   */
  public resolve(member: MemberResolvable): Member | undefined {
    if (member instanceof User) return this.cache.get(member.id);
    return this.resolveFromCache(member, Member, MEMBER_MENTION);
  }

  /**
   * Resolve a Member to their ID string.
   * @param member The MemberResolvable to resolve
   * @returns The resolved ID string
   * @throws {TypeError} If the provided resolvable is invalid
   */
  public resolveId(member: MemberResolvable): string {
    if (member instanceof User) return member.id;
    return this.resolveIdFrom(member, Member, MEMBER_MENTION);
  }

  /**
   * Fetches a member from the server, or returns the cached version if available and not forced.
   * @param member The MemberResolvable to fetch
   * @param force Whether to bypass the cache and fetch fresh data from the API
   * @returns A promise that resolves to the fetched Member
   * @throws {Error} If the API request fails or the member is not found
   * @example
   * // Fetch a member by ID, using cache if available
   * const member = await server.members.fetch("1234567890");
   *
   * // Fetch a member by mention, bypassing cache
   * const member = await server.members.fetch("<@1234567890>", true);
   */
  public async fetch(member: MemberResolvable, force: boolean = false): Promise<Member> {
    return this.fetchWithCache(
      member,
      force,
      (id) => this.client.rest.get(`/servers/${this.server.id}/members/${id}`) as Promise<RawMember>,
    );
  }

  /**
   * Fetches multiple members from the server.
   * @param options Filter options for the fetch request.
   * @returns A promise that resolves to a Collection of fetched Members.
   * @throws {Error} If the API request fails.
   * @example
   * // Fetch all members in the server
   * const allMembers = await server.members.fetchMany();
   *
   * // Fetch only online members to save bandwidth
   * const onlineMembers = await server.members.fetchMany({ exclude_offline: true });
   */
  public async fetchMany(options: FetchMembersOptions = {}): Promise<Collection<string, Member>> {
    const query: RouteParams<"get", `/servers/${string}/members`> = {};

    if (options.excludeOffline !== undefined) {
      query.exclude_offline = options.excludeOffline;
    }

    const data = await this.client.rest.get(`/servers/${this.server.id}/members`, query);

    if (data.users) {
      for (const userData of data.users) {
        this.client.users._add(userData);
      }
    }

    const fetched = new Collection<string, Member>();

    if (data.members) {
      for (const rawMember of data.members) {
        const member = this._add(rawMember);
        fetched.set(member.id, member);
      }
    }

    return fetched;
  }

  /**
   * Edits a member in the server.
   * @param member The MemberResolvable to edit.
   * @param options The fields to update (nickname, roles, timeout, etc.).
   * @returns A promise that resolves to the updated Member.
   * @throws {Error} If the API request fails or the member is not found.
   * @example
   * // Change a member's nickname and add a role
   * const updatedMember = await server.members.edit("1234567890", {
   *   nickname: "New Nickname",
   *   roles: ["roleId1", "roleId2"],
   * });
   */
  public async edit(member: MemberResolvable, options: MemberEditOptions): Promise<Member> {
    const id = this.resolveId(member);
    const payload: DataMemberEdit = {};
    const remove: FieldsMember[] = [];

    setOrRemove(payload, remove, "nickname", options.nickname, "Nickname");
    setOrRemove(payload, remove, "avatar", options.avatar, "Avatar");
    setOrRemove(payload, remove, "timeout", options.timeout, "Timeout");
    if (options.roles !== undefined) payload.roles = options.roles;

    if (!finalizeEdit(payload, remove)) return this.fetch(id);

    const data = await this.client.rest.patch(`/servers/${this.server.id}/members/${id}`, payload);
    return this._add(data);
  }

  /**
   * Kicks a member from the server.
   * @param member The MemberResolvable to kick.
   * @example
   * // Kick a member by ID
   * await server.members.kick("1234567890");
   */
  public async kick(member: MemberResolvable): Promise<void> {
    const id = this.resolveId(member);
    await this.client.rest.delete(`/servers/${this.server.id}/members/${id}`);
    this.cache.delete(id);
  }

  /**
   * Bans a member from the server.
   * @param member The MemberResolvable to ban.
   * @param options The ban options
   * @example
   * // Ban a member by ID
   * await server.members.ban("1234567890", { reason: "Spamming", deleteMessageSeconds: 3600 });
   */
  public async ban(member: MemberResolvable, options?: MemberBanOptions): Promise<void> {
    const id = this.resolveId(member);
    const payload: DataBanCreate = {};

    if (options?.reason !== undefined) payload.reason = options.reason;
    if (options?.deleteMessageSeconds !== undefined) payload.delete_message_seconds = options.deleteMessageSeconds;

    await this.client.rest.put(`/servers/${this.server.id}/bans/${id}`, payload);
    this.cache.delete(id);
  }

  /**
   * Unbans a user from the server
   * @param member The MemberResolvable to unban
   * @example
   * // Unban a member by ID
   * await server.members.unban("1234567890");
   */
  public async unban(member: MemberResolvable): Promise<void> {
    const id = this.resolveId(member);
    await this.client.rest.delete(`/servers/${this.server.id}/bans/${id}`);
  }
}
