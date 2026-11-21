import { BaseManager } from "./BaseManager";
import { Bot } from "../structures/Bot";
import type { Client } from "../client/Client";
import type { Server } from "../structures/Server";
import type { GroupChannel } from "../structures/GroupChannel";
import { Collection } from "../utils/Collection";
import { Permissions, type PermissionResolvable } from "../utils/permissions";
import { assertUserSession } from "../utils/assertUserSession";
import type { Bot as RawBot, DataEditBot, FetchBotResponse, FieldsBot, User as RawUser } from "stoat-api";

/** A bot or its ID. */
export type BotResolvable = Bot | string;

/** Options for {@link BotManager.edit}. */
export interface BotEditOptions {
  /** The bot's username, 2–32 characters: letters, numbers, `_`, `.` and `-`. */
  name?: string;
  /** Whether anyone can invite the bot, not just its owner. */
  public?: boolean;
  /** The permissions the bot asks for when it's invited to a server. */
  defaultPermissions?: PermissionResolvable;
  /** Whether to collect analytics for the bot. Required to be listed on Discover. */
  analytics?: boolean;
  /** Reserved by Stoat for interactions. `null` removes it. */
  interactionsUrl?: string | null;
  /** Generate a new token. The old one stops working. */
  resetToken?: boolean;
}

/** A bot as anyone can see it, from {@link BotManager.fetchPublic}. */
export interface PublicBot {
  id: string;
  username: string;
  /** The avatar's file ID, if it has one. */
  avatarId: string | null;
  description: string | null;
  termsOfServiceUrl: string | null;
  privacyPolicyUrl: string | null;
  /** The permissions the bot asks for when it's invited to a server. */
  defaultPermissions: bigint | null;
}

/**
 * Creates and manages the logged-in user's bots (user sessions only). Available as `client.bots`.
 *
 * @example
 * const bot = await client.bots.create("my-bot");
 * console.log(bot.token); // log the bot in with this
 * await bot.inviteToServer(server);
 */
export class BotManager extends BaseManager<string, Bot, RawBot> {
  /**
   * @param client The client this manager belongs to.
   */
  constructor(client: Client) {
    super(client);
  }

  protected extractId(data: RawBot): string {
    return data._id;
  }

  protected construct(data: RawBot): Bot {
    return new Bot(this.client, data);
  }

  /**
   * Resolves a bot to its ID.
   * @param bot The bot or its ID.
   */
  public resolveId(bot: BotResolvable): string {
    return typeof bot === "string" ? bot : bot.id;
  }

  /**
   * Creates a bot owned by the logged-in user.
   * @param name The bot's username, 2–32 characters: letters, numbers, `_`, `.` and `-`.
   * @returns The new bot, with its token.
   * @throws {StoatAPIError} `ReachedMaximumBots` if the user has too many bots, or `UsernameTaken`.
   */
  public async create(name: string): Promise<Bot> {
    assertUserSession(this.client, "bots.create");
    const { user, ...bot } = await this.client.rest.post("/bots/create", { name });
    return this.addWithUser(bot, user);
  }

  /**
   * Fetches a bot the logged-in user owns.
   * @param bot The bot or its ID.
   * @returns The bot, with its token.
   */
  public async fetch(bot: BotResolvable): Promise<Bot> {
    assertUserSession(this.client, "bots.fetch");
    // `/bots/${id}` also matches the other `/bots/...` routes' types, so name the response.
    const data = (await this.client.rest.get(`/bots/${this.resolveId(bot)}`)) as FetchBotResponse;
    return this.addWithUser(data.bot, data.user);
  }

  /**
   * Fetches every bot the logged-in user owns.
   * @returns The bots, keyed by ID.
   */
  public async fetchOwned(): Promise<Collection<string, Bot>> {
    assertUserSession(this.client, "bots.fetchOwned");
    const data = await this.client.rest.get("/bots/@me");
    for (const user of data.users) this.client.users._add(user);
    const bots = new Collection<string, Bot>();
    for (const raw of data.bots) {
      const bot = this._add(raw);
      bots.set(bot.id, bot);
    }
    return bots;
  }

  /**
   * Fetches a public bot's details, or one the logged-in user owns, e.g. for an invite page.
   * @param id The bot's ID.
   * @returns What anyone can see about the bot.
   * @throws {StoatAPIError} `NotFound` if the bot doesn't exist or isn't public.
   */
  public async fetchPublic(id: string): Promise<PublicBot> {
    const data = await this.client.rest.get(`/bots/${id}/invite`);
    return {
      id: data._id,
      username: data.username,
      avatarId: data.avatar || null,
      description: data.description || null,
      termsOfServiceUrl: data.terms_of_service_url || null,
      privacyPolicyUrl: data.privacy_policy_url || null,
      defaultPermissions:
        data.default_permissions === undefined || data.default_permissions === null
          ? null
          : BigInt(data.default_permissions),
    };
  }

  /**
   * Edits a bot the logged-in user owns.
   * @param bot The bot or its ID.
   * @param options The fields to change.
   * @returns The updated bot.
   */
  public async edit(bot: BotResolvable, options: BotEditOptions): Promise<Bot> {
    assertUserSession(this.client, "bots.edit");
    const payload: DataEditBot = {};
    const remove: FieldsBot[] = [];

    if (options.name !== undefined) payload.name = options.name;
    if (options.public !== undefined) payload.public = options.public;
    if (options.defaultPermissions !== undefined) {
      payload.default_permissions = Number(Permissions.resolve(options.defaultPermissions));
    }
    if (options.analytics !== undefined) payload.analytics = options.analytics;
    if (options.interactionsUrl === null) remove.push("InteractionsURL");
    else if (options.interactionsUrl !== undefined) payload.interactions_url = options.interactionsUrl;
    // Removing the token makes the server generate a new one.
    if (options.resetToken) remove.push("Token");
    if (remove.length > 0) payload.remove = remove;

    const { user, ...data } = await this.client.rest.patch(`/bots/${this.resolveId(bot)}`, payload);
    const updated = this.addWithUser(data, user);
    for (const field of remove) if (field === "InteractionsURL") updated._patch({}, ["InteractionsURL"]);
    return updated;
  }

  /**
   * Deletes a bot the logged-in user owns.
   * @param bot The bot or its ID.
   */
  public async delete(bot: BotResolvable): Promise<void> {
    assertUserSession(this.client, "bots.delete");
    const id = this.resolveId(bot);
    await this.client.rest.delete(`/bots/${id}`);
    this.cache.delete(id);
  }

  /**
   * Adds a bot to a server the logged-in user can manage. Works for public bots and the user's own.
   * @param bot The bot or its ID.
   * @param server The server or its ID.
   * @param permissions The permissions to give the bot. Defaults to the bot's default permissions.
   */
  public async inviteToServer(
    bot: BotResolvable,
    server: Server | string,
    permissions?: PermissionResolvable,
  ): Promise<void> {
    assertUserSession(this.client, "bots.inviteToServer");
    const serverId = typeof server === "string" ? server : server.id;
    await this.client.rest.post(
      `/bots/${this.resolveId(bot)}/invite`,
      { server: serverId },
      permissions === undefined ? undefined : { query: { permissions: String(Permissions.resolve(permissions)) } },
    );
  }

  /**
   * Adds a bot to a group the logged-in user is in. Works for public bots and the user's own.
   * @param bot The bot or its ID.
   * @param group The group or its ID.
   */
  public async inviteToGroup(bot: BotResolvable, group: GroupChannel | string): Promise<void> {
    assertUserSession(this.client, "bots.inviteToGroup");
    const groupId = typeof group === "string" ? group : group.id;
    await this.client.rest.post(`/bots/${this.resolveId(bot)}/invite`, { group: groupId });
  }

  /**
   * Caches a bot and its user account.
   * @param bot The raw bot.
   * @param user The bot's raw user.
   */
  private addWithUser(bot: RawBot, user: RawUser): Bot {
    this.client.users._add(user);
    return this._add(bot);
  }
}
