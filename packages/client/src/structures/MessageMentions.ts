import { Collection } from "../utils/Collection";
import { User } from "./User";
import { Member } from "./Member";
import { BaseChannel } from "./BaseChannel";
import { Role } from "./Role";
import { Client } from "../client/Client";
import { Message } from "./Message";
import util from "node:util";

export class MessageMentions {
  /** Raw user IDs from the API */
  public readonly userIds: string[];
  /** Raw role IDs from the API */
  public readonly roleIds: string[];
  /** Raw channel IDs parsed from message content */
  public readonly channelIds: string[];

  constructor(
    private readonly client: Client,
    private readonly message: Message,
    userIds: string[] | null,
    roleIds: string[] | null,
  ) {
    this.userIds = userIds ?? [];
    this.roleIds = roleIds ?? [];
    this.channelIds = message.content ? MessageMentions.parseChannelIds(message.content) : [];
  }

  /** Mentioned users resolved from cache */
  get users(): Collection<string, User> {
    const col = new Collection<string, User>();
    for (const id of this.userIds) {
      const user = this.client.users.cache.get(id);
      if (user) col.set(id, user);
    }
    return col;
  }

  /** Mentioned members resolved from cache (only in server channels) */
  get members(): Collection<string, Member> {
    const col = new Collection<string, Member>();
    const server = this.message.server;
    if (!server) return col;
    for (const id of this.userIds) {
      const member = server.members.cache.get(id);
      if (member) col.set(id, member);
    }
    return col;
  }

  /** Mentioned roles resolved from cache */
  get roles(): Collection<string, Role> {
    const col = new Collection<string, Role>();
    const server = this.message.server;
    if (!server) return col;
    for (const id of this.roleIds) {
      const role = server.roles.cache.get(id);
      if (role) col.set(id, role);
    }
    return col;
  }

  /** Mentioned channels resolved from cache */
  get channels(): Collection<string, BaseChannel> {
    const col = new Collection<string, BaseChannel>();
    for (const id of this.channelIds) {
      const channel = this.client.channels.cache.get(id);
      if (channel) col.set(id, channel);
    }
    return col;
  }

  /** Whether the given user ID is mentioned */
  has(userId: string): boolean {
    return this.userIds.includes(userId);
  }

  private static parseChannelIds(content: string): string[] {
    return [...content.matchAll(/<#([A-Z0-9]+)>/g)].flatMap((m) => (m[1] ? [m[1]] : []));
  }

  [util.inspect.custom](depth: number, options: util.InspectOptions, inspect: typeof util.inspect) {
    const { client, message, ...props } = this;

    const data = {
      ...props,
      members: this.members,
      channels: this.channels,
      users: this.users,
      roles: this.roles,
    };

    return `${this.constructor.name} ${inspect(data, { ...options, depth: depth ?? options.depth })}`;
  }
}
