import { BitField } from "./BitField";

export const PermissionFlags = {
  // Server permissions
  ManageChannel: 1n << 0n,
  ManageServer: 1n << 1n,
  ManagePermissions: 1n << 2n,
  ManageRole: 1n << 3n,
  ManageCustomisation: 1n << 4n,

  // Member permissions
  KickMembers: 1n << 6n,
  BanMembers: 1n << 7n,
  TimeoutMembers: 1n << 8n,
  AssignRoles: 1n << 9n,
  ChangeNickname: 1n << 10n,
  ManageNicknames: 1n << 11n,
  ChangeAvatar: 1n << 12n,
  RemoveAvatars: 1n << 13n,

  // Channel permissions
  ViewChannel: 1n << 20n,
  ReadMessageHistory: 1n << 21n,
  SendMessage: 1n << 22n,
  ManageMessages: 1n << 23n,
  ManageWebhooks: 1n << 24n,
  InviteOthers: 1n << 25n,
  SendEmbeds: 1n << 26n,
  UploadFiles: 1n << 27n,
  Masquerade: 1n << 28n,
  React: 1n << 29n,
  BypassSlowmode: 1n << 39n,

  // Voice permissions
  Connect: 1n << 30n,
  Speak: 1n << 31n,
  Video: 1n << 32n,
  MuteMembers: 1n << 33n,
  DeafenMembers: 1n << 34n,
  MoveMembers: 1n << 35n,
  Listen: 1n << 36n,

  // Channel permissions (Part 2)
  MentionEveryone: 1n << 37n,
  MentionRoles: 1n << 38n,

  // Grant all
  GrantAllSafe: 0x000fffffffffffffn,
} as const;

export type PermissionString = keyof typeof PermissionFlags;
export type PermissionResolvable = PermissionString | bigint | number | Permissions | PermissionResolvable[];

export class Permissions extends BitField {
  public static override Flags = PermissionFlags as unknown as Record<string, number | bigint>;
  public static override DefaultBit = 0n;

  public static override resolve(bit?: PermissionResolvable): bigint {
    return super.resolve(bit) as bigint;
  }

  public override has(bit: PermissionResolvable): boolean {
    return super.has(bit);
  }

  public override any(bit: PermissionResolvable): boolean {
    return super.any(bit);
  }

  public override missing(bits: PermissionResolvable): PermissionString[] {
    return super.missing(bits) as PermissionString[];
  }

  public override add(...bits: PermissionResolvable[]): this {
    return super.add(...bits);
  }

  public override remove(...bits: PermissionResolvable[]): this {
    return super.remove(...bits);
  }
}
