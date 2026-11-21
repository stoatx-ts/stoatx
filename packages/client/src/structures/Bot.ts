import { Base } from "./Base";
import type { Client } from "../client/Client";
import type { User } from "./User";
import type { Server } from "./Server";
import type { GroupChannel } from "./GroupChannel";
import type { BotEditOptions } from "../managers/BotManager";
import type { PermissionResolvable } from "../utils/permissions";
import type { Bot as RawBot, FieldsBot } from "stoat-api";

/**
 * A bot owned by the logged-in user. Get one from `client.bots`.
 */
export class Bot extends Base {
  /** The ID of the user who owns the bot. */
  public ownerId!: string;
  /** The bot's token. Treat it like a password. */
  public token!: string;
  /** Whether anyone can invite the bot, not just its owner. */
  public public!: boolean;
  /** The permissions the bot asks for when it's invited to a server. */
  public defaultPermissions: bigint | null = null;
  /** Whether analytics are collected for the bot. Required to be listed on Discover. */
  public analytics: boolean = false;
  /** Whether the bot is listed on Discover. */
  public discoverable: boolean = false;
  /** Reserved by Stoat for interactions. */
  public interactionsUrl: string | null = null;
  /** A link to the bot's terms of service. */
  public termsOfServiceUrl: string | null = null;
  /** A link to the bot's privacy policy. */
  public privacyPolicyUrl: string | null = null;
  /** The bot's flags. */
  public flags: number = 0;

  constructor(client: Client, data: RawBot) {
    super(client, data);
    this._patch(data);
  }

  public _patch(data: Partial<RawBot>, clear?: FieldsBot[]): void {
    if (data.owner !== undefined) this.ownerId = data.owner;
    if (data.token !== undefined) this.token = data.token;
    if (data.public !== undefined) this.public = data.public;
    if (data.default_permissions !== undefined) {
      this.defaultPermissions = data.default_permissions === null ? null : BigInt(data.default_permissions);
    }
    if (data.analytics !== undefined) this.analytics = data.analytics;
    if (data.discoverable !== undefined) this.discoverable = data.discoverable;
    if (data.interactions_url !== undefined) this.interactionsUrl = data.interactions_url || null;
    if (data.terms_of_service_url !== undefined) this.termsOfServiceUrl = data.terms_of_service_url || null;
    if (data.privacy_policy_url !== undefined) this.privacyPolicyUrl = data.privacy_policy_url || null;
    if (data.flags !== undefined) this.flags = data.flags;

    for (const field of clear ?? []) {
      if (field === "InteractionsURL") this.interactionsUrl = null;
    }
  }

  /** The bot's user account, if cached. Bots fetched through `client.bots` always have it cached. */
  public get user(): User | undefined {
    return this.client.users.cache.get(this.id);
  }

  /**
   * Edits the bot.
   * @param options The fields to change.
   * @returns This bot, updated.
   */
  public async edit(options: BotEditOptions): Promise<this> {
    return (await this.client.bots.edit(this.id, options)) as this;
  }

  /**
   * Generates a new token for the bot. The old token stops working.
   * @returns The new token, also set on {@link token}.
   */
  public async resetToken(): Promise<string> {
    const { token } = await this.client.bots.edit(this.id, { resetToken: true });
    this.token = token;
    return token;
  }

  /** Deletes the bot. */
  public async delete(): Promise<void> {
    await this.client.bots.delete(this.id);
  }

  /**
   * Adds the bot to a server the logged-in user can manage.
   * @param server The server or its ID.
   * @param permissions The permissions to give the bot. Defaults to {@link defaultPermissions}.
   */
  public async inviteToServer(server: Server | string, permissions?: PermissionResolvable): Promise<void> {
    await this.client.bots.inviteToServer(this.id, server, permissions);
  }

  /**
   * Adds the bot to a group the logged-in user is in.
   * @param group The group or its ID.
   */
  public async inviteToGroup(group: GroupChannel | string): Promise<void> {
    await this.client.bots.inviteToGroup(this.id, group);
  }
}
