import type { Client } from "../client/Client";
import type { BaseChannel } from "../structures/BaseChannel";
import type { Member } from "../structures/Member";
import type { Role } from "../structures/Role";
import { PermissionFlags } from "./permissions";

/**
 * Permission calculation, following the Stoat backend. Most code uses `member.permissions`,
 * `channel.permissions` and `channel.permissionsFor(user)` instead of calling these directly.
 */

/** Permissions that are added (`allow`) and then removed (`deny`) by a role or channel override. */
export interface PermissionOverride {
  allow: bigint;
  deny: bigint;
}

const { ViewChannel, ReadMessageHistory } = PermissionFlags;

/** What a timed-out member keeps. */
export const ALLOW_IN_TIMEOUT = ViewChannel | ReadMessageHistory;

/** Read-only access, e.g. to a DM with someone the user can't message. */
export const DEFAULT_PERMISSION_VIEW_ONLY = ViewChannel | ReadMessageHistory;

/** The base set of permissions for a conversation. */
export const DEFAULT_PERMISSION =
  DEFAULT_PERMISSION_VIEW_ONLY |
  PermissionFlags.SendMessage |
  PermissionFlags.InviteOthers |
  PermissionFlags.SendEmbeds |
  PermissionFlags.UploadFiles |
  PermissionFlags.Connect |
  PermissionFlags.Speak |
  PermissionFlags.Listen |
  PermissionFlags.Video;

/** What participants can do in a DM, and in a group without its own permissions. */
export const DEFAULT_PERMISSION_DIRECT_MESSAGE =
  DEFAULT_PERMISSION | PermissionFlags.ManageChannel | PermissionFlags.React | PermissionFlags.Masquerade;

/** Turns the API's `{ a, d }` override into a {@link PermissionOverride}. Missing means no change. */
export function toPermissionOverride(raw: { a: number; d: number } | null | undefined): PermissionOverride {
  return { allow: BigInt(raw?.a ?? 0), deny: BigInt(raw?.d ?? 0) };
}

/** Applies an override: its allowed permissions are added, then its denied ones removed. */
export function applyOverride(value: bigint, override: PermissionOverride): bigint {
  return (value | override.allow) & ~override.deny;
}

function isTimedOut(member: Member): boolean {
  return member.timeout !== null && member.timeout.getTime() > Date.now();
}

/**
 * A member's roles from lowest to highest. Roles with a lower rank are higher, and are applied
 * last, so their overrides win.
 */
function rolesLowestFirst(member: Member): Role[] {
  const roles = member.server?.roles.cache;
  if (!roles) return [];
  return member.roleIds
    .map((id) => roles.get(id))
    .filter((role): role is Role => role !== undefined)
    .sort((a, b) => b.rank - a.rank);
}

/**
 * A member's permissions in their server, before any channel overrides: the server's default
 * permissions, then each role's override, lowest role first. The owner has every permission;
 * a timed-out member keeps only {@link ALLOW_IN_TIMEOUT}.
 */
export function calculateServerPermissions(member: Member): bigint {
  const server = member.server;
  if (!server) return 0n;
  if (member.user?.privileged || server.ownerId === member.id) return PermissionFlags.GrantAllSafe;

  let value = server.defaultPermissions ?? 0n;
  for (const role of rolesLowestFirst(member)) value = applyOverride(value, role.permissionOverride);

  if (isTimedOut(member)) value &= ALLOW_IN_TIMEOUT;
  return value;
}

/**
 * A user's permissions in a channel.
 *
 * - **Saved Notes**: everything for its owner.
 * - **DMs**: friends (and bots) can message each other; otherwise, including when either has
 *   blocked the other, the DM is read-only.
 * - **Groups**: everything for the owner; members get the group's permissions, which can't take
 *   away viewing it.
 * - **Server channels**: the server's default permissions, the channel's default override, each
 *   role's override, then each role's channel override (lowest role first). A timed-out member
 *   keeps only {@link ALLOW_IN_TIMEOUT}, and without `ViewChannel` there are no permissions at all.
 *
 * Users that aren't cached, or aren't in the channel, have no permissions.
 */
export function calculateChannelPermissions(client: Client, channel: BaseChannel, userId: string): bigint {
  if (client.users.cache.get(userId)?.privileged) return PermissionFlags.GrantAllSafe;

  const data = channel as BaseChannel & {
    recipients?: string[];
    ownerId?: string;
    serverId?: string;
    defaultPermissions?: unknown;
    rolePermissions?: Record<string, { a: number; d: number }>;
  };

  switch (channel.type) {
    case "SavedMessages":
      // Only the owner can see their Saved Notes, and only to their own client.
      return userId === client.user?.id ? PermissionFlags.GrantAllSafe : 0n;

    case "DirectMessage": {
      const recipients = data.recipients ?? [];
      if (!recipients.includes(userId)) return 0n;
      // The relationship between the two recipients, as seen from the logged-in user.
      const otherId = recipients.find((id) => id !== client.user?.id);
      const other = otherId ? client.users.cache.get(otherId) : undefined;
      const eitherIsBot = !!other?.bot || !!client.user?.bot;
      const canMessage = other?.relationship === "Friend" || (other?.relationship === "None" && eitherIsBot);
      return canMessage ? DEFAULT_PERMISSION_DIRECT_MESSAGE : DEFAULT_PERMISSION_VIEW_ONLY;
    }

    case "Group": {
      if (data.ownerId === userId) return PermissionFlags.GrantAllSafe;
      if (!(data.recipients ?? []).includes(userId)) return 0n;
      const permissions = data.defaultPermissions as bigint | null | undefined;
      return DEFAULT_PERMISSION_VIEW_ONLY | (permissions ?? DEFAULT_PERMISSION_DIRECT_MESSAGE);
    }

    case "TextChannel": {
      const server = data.serverId ? client.servers.cache.get(data.serverId) : undefined;
      if (!server) return 0n;
      if (server.ownerId === userId) return PermissionFlags.GrantAllSafe;
      const member = server.members.cache.get(userId);
      if (!member) return 0n;

      const roles = rolesLowestFirst(member);
      let value = server.defaultPermissions ?? 0n;
      value = applyOverride(value, toPermissionOverride(data.defaultPermissions as { a: number; d: number } | null));
      for (const role of roles) value = applyOverride(value, role.permissionOverride);
      for (const role of roles) value = applyOverride(value, toPermissionOverride(data.rolePermissions?.[role.id]));

      if (isTimedOut(member)) value &= ALLOW_IN_TIMEOUT;
      if ((value & ViewChannel) !== ViewChannel) return 0n;
      return value;
    }

    default:
      return 0n;
  }
}
