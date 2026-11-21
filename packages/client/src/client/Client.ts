import { EventEmitter } from "events";
import { GatewayManager } from "../gateway/GatewayManager";
import { RESTManager, type TokenType } from "../rest/RESTManager";
import { Message } from "../structures/Message";
import { ChannelManager } from "../managers/ChannelManager";
import { BaseChannel } from "../structures/BaseChannel";
import { ServerManager } from "../managers/ServerManager";
import { Server } from "../structures/Server";
import { UserManager } from "../managers/UserManager";
import { User } from "../structures/User";
import { ClientUser } from "../structures/ClientUser";
import { Member } from "../structures/Member";
import { Role } from "../structures/Role";
import { Emoji } from "../structures/Emoji";
import { Webhook } from "../structures/Webhook";
import { Collection } from "../utils/Collection";
import { SweeperManager, SweeperOptions } from "../managers/SweepManager";
import { EmojiManager } from "../managers/EmojiManager";
import {
  AuthManager,
  OnboardingRequiredError,
  type CredentialLoginOptions,
  type LoginResult,
} from "../managers/AuthManager";
import { UnreadManager } from "../managers/UnreadManager";
import { SettingsManager, type SyncedSetting } from "../managers/SettingsManager";
import { BotManager } from "../managers/BotManager";
import { InviteManager } from "../managers/InviteManager";
import type {
  RevoltConfig,
  User as RawUser,
  Server as RawServer,
  Channel as RawChannel,
  Member as RawMember,
  Emoji as RawEmoji,
  ChannelUnread,
} from "stoat-api";
// Import the manager directly: "../voice" also loads VoiceConnection (@livekit/rtc-node), which breaks the browser build.
import { VoiceManager } from "../voice/VoiceManager";
import { StoatAPI } from "../utils/Constants";

/** A change to a platform policy (terms of service, privacy policy) the user has to acknowledge. */
export interface PolicyChange {
  created_time: string;
  effective_time: string;
  description: string;
  url: string;
}

/**
 * The raw `Ready` payload: the initial state the gateway sends after connecting.
 * Fields marked "user sessions" are only sent to user accounts, not bots.
 */
export interface ReadyData {
  users?: RawUser[];
  servers?: RawServer[];
  channels?: RawChannel[];
  members?: RawMember[];
  emojis?: RawEmoji[];
  /** User sessions: synced settings, keyed by name, as `[updatedAt, value]`. Loaded into `client.settings`. */
  user_settings?: Record<string, [number, string]>;
  /** User sessions: unread state for each channel. */
  channel_unreads?: ChannelUnread[];
  /** User sessions: policy changes the user hasn't acknowledged yet. Loaded into `client.auth.policyChanges`. */
  policy_changes?: PolicyChange[];
  /** Voice channel participants. Not processed by the client yet. */
  voice_states?: unknown[];
}

/** How to log in with {@link Client.login}. A {@link UserSession} works as-is. */
export interface LoginOptions {
  /** The bot token or user session token. */
  token: string;
  /** Whether `token` is a bot token or a user session token. Defaults to `"bot"`. */
  type?: TokenType;
}

export interface ClientEvents {
  ready: [data: ReadyData];
  messageCreate: [message: Message];
  /** For uncached messages (only with `partials.messages`), both messages are partial. */
  messageUpdate: [oldMessage: Message, newMessage: Message];
  messageDelete: [message: Message | { id: string; channelId: string }];
  messageReact: [message: Message | { id: string; channelId: string }, emojiId: string, userId: string];
  messageUnreact: [message: Message | { id: string; channelId: string }, emojiId: string, userId: string];
  messageRemoveReaction: [message: Message | { id: string; channelId: string }, emojiId: string];
  error: [error: Error];
  debug: [message: string];
  raw: [data: any];
  channelCreate: [channel: BaseChannel];
  channelUpdate: [oldChannel: BaseChannel, newChannel: BaseChannel];
  channelDelete: [channel: BaseChannel | string];
  serverCreate: [server: Server];
  serverUpdate: [oldServer: Server, newServer: Server];
  serverDelete: [server: Server | string];
  userUpdate: [oldUser: User, newUser: User];
  serverMemberJoin: [member: Member];
  serverMemberLeave: [member: Member | { serverId: string; userId: string }];
  serverBanAdd: [member: Member | { serverId: string; userId: string }];
  serverMemberKick: [member: Member | { serverId: string; userId: string }];
  serverMemberUpdate: [oldMember: Member, newMember: Member];
  serverRoleCreate: [role: Role];
  serverRoleUpdate: [oldRole: Role, newRole: Role];
  serverRoleDelete: [role: Role | { id: string; serverId: string }];
  serverRoleRanksUpdate: [server: Server];
  messageDeleteBulk: [messages: Collection<string, Message | { id: string; channelId: string }>, channelId: string];
  emojiCreate: [emoji: Emoji];
  emojiUpdate: [oldEmoji: Emoji, newEmoji: Emoji];
  emojiDelete: [emoji: Emoji | string];
  channelGroupJoin: [channel: BaseChannel | { id: string }, userId: string];
  channelGroupLeave: [channel: BaseChannel | { id: string }, userId: string];
  typingStart: [channelId: string, userId: string];
  typingStop: [channelId: string, userId: string];
  channelAck: [channelId: string, userId: string, messageId: string];
  webhookCreate: [webhook: Webhook];
  webhookUpdate: [oldWebhook: Webhook, newWebhook: Webhook];
  webhookDelete: [webhook: Webhook | { id: string; channelId: string }];
  userRelationship: [user: User];
  userPlatformWipe: [userId: string, flags: number];
  /** Synced settings changed on another device (user sessions only). Only the changed keys are included. */
  settingsUpdate: [settings: Collection<string, SyncedSetting>];
  /** The session ended: logged out, revoked from another device, or the token was invalidated. The client has disconnected. */
  logout: [];
}

export interface ClientOptions {
  sweepers?: SweeperOptions;
  /**
   * Emit events for data that is not in the cache, using partial structures.
   * Partial structures have `partial` set to true and only contain the fields the event carried;
   * call `fetch()` on them to fill in the rest.
   */
  partials?: {
    /** Emit `messageUpdate` for uncached messages in cached channels, using partial messages. */
    messages?: boolean;
  };
  cacheLimits?: {
    users?: number;
    servers?: number;
    channels?: number;
    emojis?: number;
  };
  // API URL for self-hosts
  apiURL?: string;

  // Explicit overrides (Optional)
  overrides?: {
    // Websocket URL
    wsURL?: string;
    // CDN URL
    cdnURL?: string;
  };
}

export class Client extends EventEmitter {
  public rest: RESTManager;
  public gateway: GatewayManager;
  public channels: ChannelManager;
  public servers: ServerManager;
  public users: UserManager;
  public sweepers: SweeperManager;
  public emojis: EmojiManager;
  /** Sessions, logout and onboarding for user accounts. */
  public auth: AuthManager;
  /** Which channels the logged-in user has read (user sessions only). Most code uses `channel.unread` and `channel.ack()` instead. */
  public unreads: UnreadManager;
  /** Settings synced between the user's devices (user sessions only). */
  public settings: SettingsManager;
  /** The logged-in user's bots (user sessions only). */
  public bots: BotManager;
  /** Preview and accept invites by code. */
  public invites: InviteManager;
  public user: ClientUser | null = null;
  public options: ClientOptions;
  readonly voice: VoiceManager;

  constructor(options: ClientOptions = {}) {
    super({ captureRejections: true });
    this.options = options;
    this.rest = new RESTManager(this);
    this.gateway = new GatewayManager(this);
    this.channels = new ChannelManager(this, options.cacheLimits?.channels);
    this.servers = new ServerManager(this, options.cacheLimits?.servers);
    this.users = new UserManager(this, options.cacheLimits?.users);
    this.emojis = new EmojiManager(this, undefined, options.cacheLimits?.emojis);
    this.voice = new VoiceManager(this);
    this.auth = new AuthManager(this);
    this.unreads = new UnreadManager(this);
    this.settings = new SettingsManager(this);
    this.bots = new BotManager(this);
    this.invites = new InviteManager(this);
    // Set up front so requests that need no token (credential login) work before login().
    this.rest.setBaseURL(options.apiURL ?? StoatAPI);

    this.sweepers = new SweeperManager(this, options.sweepers ?? {});
  }

  /**
   * Logs in and connects to the Stoat gateway.
   * @param tokenOrOptions A bot token, or `{ token, type: "user" }` for a user session.
   * A {@link UserSession} from {@link loginWithCredentials} can be passed directly.
   * @throws {OnboardingRequiredError} For a user account that hasn't picked a username yet.
   * @example
   * // Bot
   * await client.login(process.env.BOT_TOKEN);
   * // User session saved from an earlier loginWithCredentials()
   * await client.login({ token: savedToken, type: "user" });
   */
  public async login(tokenOrOptions: string | LoginOptions): Promise<any> {
    const { token, type = "bot" } = typeof tokenOrOptions === "string" ? { token: tokenOrOptions } : tokenOrOptions;
    if (!token) throw new Error("A valid token must be provided.");

    const rootApiUrl = this.options.apiURL ?? StoatAPI;

    this.rest.setBaseURL(rootApiUrl);
    this.rest.setToken(token, type);

    const configData = await this.fetchConfig(rootApiUrl);

    // New user accounts can't connect until they pick a username.
    if (type === "user" && (await this.auth.needsOnboarding())) {
      throw new OnboardingRequiredError();
    }

    const finalWsUrl = this.options.overrides?.wsURL ?? configData.ws;

    if (!finalWsUrl) {
      throw new Error(
        `[Stoat Misconfiguration] The server at '${rootApiUrl}' is running, but it has no WebSocket URL configured. ` +
          `The server administrator needs to set their gateway config, or you must bypass it using 'options.overrides.wsURL'.`,
      );
    }

    this.gateway.setGatewayUrl(finalWsUrl);

    const finalCdnUrl = this.options.overrides?.cdnURL ?? configData.features.autumn.url;

    if (!finalCdnUrl) {
      throw new Error(
        `[Stoat Misconfiguration] The server at '${rootApiUrl}' is running, but it has no CDN URL configured. ` +
          `The server administrator needs to set their cdn config, or you must bypass it using 'options.overrides.cdnURL'.`,
      );
    }

    this.rest.setCDNURL(finalCdnUrl);

    this.sweepers.start();
    return this.gateway.connect(token);
  }

  /**
   * Logs in to a user account with an email and password, then connects.
   * Save `result.session` to log in again later with `client.login(session)`.
   * @param options The email and password, or the MFA ticket and response for the second step.
   * @returns `Success` once connected, `MFA` if a second factor is needed, `Onboarding` if the
   * account must pick a username first, or `Disabled`.
   * @example
   * let result = await client.loginWithCredentials({ email, password, friendlyName: "My App" });
   *
   * if (result.result === "MFA") {
   *   const totpCode = await promptForCode();
   *   result = await client.loginWithCredentials({ mfaTicket: result.ticket, mfaResponse: { totpCode } });
   * }
   *
   * if (result.result === "Onboarding") {
   *   await client.auth.completeOnboarding(await promptForUsername());
   *   await client.login(result.session);
   * }
   *
   * if (result.result === "Success" || result.result === "Onboarding") {
   *   localStorage.setItem("session", JSON.stringify(result.session));
   * }
   */
  public async loginWithCredentials(options: CredentialLoginOptions): Promise<LoginResult> {
    const result = await this.auth.createSession(options);
    if (result.result !== "Success") return result;

    try {
      await this.login(result.session);
    } catch (error) {
      if (error instanceof OnboardingRequiredError) return { result: "Onboarding", session: result.session };
      throw error;
    }
    return result;
  }

  /**
   * Disconnects, forgets the token, empties the caches and emits `logout`. Called when the session ends.
   * The caches are emptied so the next account logged in on the same client (or page) can't see this one's data.
   * @internal
   */
  public _endSession(): void {
    this.gateway.disconnect();
    this.rest.clearToken();
    this.user = null;
    this.channels.cache.clear();
    this.servers.cache.clear();
    this.users.cache.clear();
    this.emojis.cache.clear();
    this.unreads.cache.clear();
    this.settings.cache.clear();
    this.bots.cache.clear();
    this.auth.policyChanges = [];
    this.emit("logout");
  }

  private async fetchConfig(baseURL: string): Promise<RevoltConfig> {
    try {
      const response = await fetch(baseURL);

      return (await response.json()) as RevoltConfig;
    } catch (error) {
      throw new Error(`Failed to fetch ${baseURL}, make sure the instance is running.`);
    }
  }

  [Symbol.for("nodejs.rejection")](error: unknown, event: string | symbol) {
    this._reportError(new Error(`Unhandled rejection in a "${String(event)}" listener`, { cause: error }));
  }

  /**
   * Emits `error` if a listener is attached, otherwise logs to stderr instead of
   * letting the EventEmitter throw and crash the process.
   * @internal
   */
  public _reportError(error: Error): void {
    if (this.listenerCount("error") > 0) {
      this.emit("error", error);
    } else {
      console.error("[Stoatx Client]", error);
    }
  }

  public override on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this {
    return super.on(event, listener as any);
  }

  public override once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this {
    return super.once(event, listener as any);
  }

  public override emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean {
    return super.emit(event, ...args);
  }
}
