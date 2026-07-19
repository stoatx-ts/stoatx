import { Base } from "./Base";
import type { Client } from "../client/Client";
import type { Server } from "./Server";
import type { User } from "./User";
import type { Member } from "./Member";
import * as util from "node:util";
import type { AuditLogEntry as RawAuditLogEntry, AuditLogEntryAction } from "stoat-api";

/**
 * The backend only populates the top-level `target` field for some action
 * types (confirmed: null on RoleEdit, populated on MemberEdit) — for
 * everything else, pull the id out of the action payload itself.
 */
function resolveTargetId(data: RawAuditLogEntry): string | null {
  if (data.target) return data.target;

  const action = data.action;
  switch (action.type) {
    case "ChannelCreate":
    case "ChannelEdit":
    case "ChannelDelete":
    case "ChannelRolePermissionsEdit":
      return action.channel;
    case "RoleCreate":
    case "RoleEdit":
    case "RoleDelete":
      return action.role;
    case "InviteCreate":
    case "InviteDelete":
      return action.invite;
    case "WebhookCreate":
    case "WebhookDelete":
      return action.webhook;
    case "EmojiCreate":
    case "EmojiUpdate":
    case "EmojiDelete":
      return action.emoji;
    case "MessageDelete":
      return action.channel;
    case "MessagePin":
    case "MessageUnpin":
      return action.message;
    case "MessageBulkDelete":
      return action.channel;
    default:
      return null;
  }
}

export class AuditLogEntry extends Base {
  public serverId: string;
  public userId: string;
  public targetId: string | null;
  public reason: string | null;
  public action: AuditLogEntryAction;

  constructor(client: Client, data: RawAuditLogEntry) {
    super(client, data);
    this.serverId = data.server;
    this.userId = data.user;
    this.targetId = resolveTargetId(data);
    this.reason = data.reason ?? null;
    this.action = data.action;
  }

  /** The action tag, e.g. "ChannelEdit" — narrow `entry.action` on this. */
  public get type(): AuditLogEntryAction["type"] {
    return this.action.type;
  }

  public get server(): Server | undefined {
    return this.client.servers.cache.get(this.serverId);
  }

  /** The user who performed this action, if cached. */
  public get executor(): User | undefined {
    return this.client.users.cache.get(this.userId);
  }

  /**
   * Best-effort resolve of `targetId` into the actual entity, picked by
   * `action.type` since a bare id alone doesn't say whether it's a member,
   * a role, a channel, etc.
   */
  public get target(): User | Member | unknown | undefined {
    if (!this.targetId) return undefined;
    const server = this.server;

    switch (this.action.type) {
      case "MemberEdit":
      case "MemberKick":
        return server?.members.cache.get(this.targetId);
      case "BanCreate":
      case "BanDelete":
        return this.client.users.cache.get(this.targetId);
      case "ChannelCreate":
      case "ChannelEdit":
      case "ChannelDelete":
      case "ChannelRolePermissionsEdit":
        return server?.channels.cache.get(this.targetId);
      case "RoleCreate":
      case "RoleEdit":
      case "RoleDelete":
        return server?.roles.cache.get(this.targetId);
      default:
        return this.targetId;
    }
  }

  /**
   * Customizer for Node.js `console.log` and `util.inspect`.
   * Hides the cyclic client reference for a cleaner output.
   * @internal
   */
  [util.inspect.custom]() {
    const { client, ...props } = this;
    return `${this.constructor.name} ${util.inspect({
      ...props,
      type: this.type,
      executor: this.executor,
      target: this.target,
    })}`;
  }
}
