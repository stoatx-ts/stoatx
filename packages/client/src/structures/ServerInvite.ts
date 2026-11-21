import type { Client } from "../client/Client";
import type { Invite as RawInvite } from "stoat-api";

/** Options for creating an invite with `channel.createInvite()`. */
export interface InviteCreateOptions {
  /** How many times the invite can be used, 1–100. Unlimited by default. */
  maxUses?: number;
  /**
   * When the invite stops working. Must be in the future, and within the instance's limit
   * (`InvalidOperation` otherwise). Never expires by default.
   */
  expiresAt?: Date;
}

/**
 * An invite to a server channel or a group. Server invites are listed in `server.invites`.
 */
export class ServerInvite {
  /** The invite code, e.g. the `abc123` in `https://stt.gg/abc123` on stoat.chat. */
  public code: string;
  /** Whether it invites to a server or a group. */
  public type: "Server" | "Group";
  /** The ID of the user who created it. */
  public creatorId: string;
  /** The ID of the channel (or group) it leads to. */
  public channelId: string;
  /** The ID of the server it leads to, or `null` for group invites. */
  public serverId: string | null;
  /** How many times it has been used. */
  public uses: number;
  /** How many times it can be used, or `null` for no limit. */
  public maxUses: number | null;
  /** When it stops working, or `null` if it never expires. */
  public expiresAt: Date | null;

  /**
   * @param client The client the invite belongs to.
   * @param data The raw invite.
   */
  constructor(
    private readonly client: Client,
    data: RawInvite,
  ) {
    this.code = data._id;
    this.type = data.type;
    this.creatorId = data.creator;
    this.channelId = data.channel;
    this.serverId = data.type === "Server" ? data.server : null;
    this.uses = data.uses;
    this.maxUses = data.max_uses ?? null;
    this.expiresAt = data.expires ? new Date(data.expires) : null;
  }

  public _patch(data: RawInvite) {
    this.creatorId = data.creator ?? this.creatorId;
    this.channelId = data.channel ?? this.channelId;
    if (data.uses !== undefined) this.uses = data.uses;
    if (data.max_uses !== undefined) this.maxUses = data.max_uses ?? null;
    if (data.expires !== undefined) this.expiresAt = data.expires ? new Date(data.expires) : null;
  }

  /** Deletes the invite, so it stops working. */
  public async delete(): Promise<void> {
    await this.client.invites.delete(this.code);
  }
}
