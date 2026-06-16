import { EventEmitter } from "events";
import { GatewayManager } from "../gateway/GatewayManager";
import { RESTManager } from "../rest/RESTManager";
import { Message } from "../structures/Message";
import { ChannelManager } from "../managers/ChannelManager";
import { BaseChannel } from "../structures/BaseChannel";
import { ServerManager } from "../managers/ServerManager";
import { Server } from "../structures/Server";
import { UserManager } from "../managers/UserManager";
import { User } from "../structures/User";
import { ClientUser } from "../structures/ClientUser";
import { Member } from "../structures/Member";
import { SweeperManager, SweeperOptions } from "../managers/SweepManager";
import { EmojiManager } from "../managers/EmojiManager";
import type { RevoltConfig } from "stoat-api";

export interface ClientEvents {
  ready: [data: any];
  messageCreate: [message: Message];
  messageUpdate: [oldMessage: null | Message, newMessage: Message];
  messageDelete: [message: Message | { id: string; channelId: string }];
  messageReact: [message: Message | { id: string; channelId: string }, emojiId: string, userId: string];
  messageUnreact: [message: Message | { id: string; channelId: string }, emojiId: string, userId: string];
  messageRemoveReaction: [message: Message | { id: string; channelId: string }, emojiId: string];
  error: [error: Error];
  debug: [message: string];
  raw: [data: any];
  channelCreate: [channel: BaseChannel];
  channelUpdate: [oldChannel: BaseChannel | null, newChannel: BaseChannel];
  channelDelete: [channel: BaseChannel | string];
  serverCreate: [server: Server];
  serverUpdate: [oldServer: Server | null, newServer: Server];
  serverDelete: [server: Server | string];
  userUpdate: [oldUser: User, newUser: User];
  serverMemberJoin: [member: Member];
  serverMemberLeave: [member: Member | { serverId: string; userId: string }];
  serverBanAdd: [member: Member | { serverId: string; userId: string }];
  serverMemberKick: [member: Member | { serverId: string; userId: string }];
}

export interface ClientOptions {
  sweepers?: SweeperOptions;
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
  public user: ClientUser | null = null;

  constructor(public options: ClientOptions = {}) {
    super({ captureRejections: true });
    this.rest = new RESTManager(this);
    this.gateway = new GatewayManager(this);
    this.channels = new ChannelManager(this, options.cacheLimits?.channels);
    this.servers = new ServerManager(this, options.cacheLimits?.servers);
    this.users = new UserManager(this, options.cacheLimits?.users);
    this.emojis = new EmojiManager(this, undefined, options.cacheLimits?.emojis);

    this.sweepers = new SweeperManager(this, options.sweepers ?? {});
  }

  /**
   * Connects the bot to the Stoat Gateway
   */
  public async login(token: string): Promise<any> {
    if (!token) throw new Error("A valid token must be provided.");

    const rootApiUrl = this.options.apiURL ?? "https://api.stoat.chat";

    this.rest.setBaseURL(rootApiUrl);
    this.rest.setToken(token);

    const configData = await this.fetchConfig(rootApiUrl);

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

  private async fetchConfig(baseURL: string): Promise<RevoltConfig> {
    try {
      const response = await fetch(baseURL)

      return await response.json() as RevoltConfig;
    } catch (error) {
      throw new Error(`Failed to fetch ${baseURL}, make sure the instance is running.`);
    }
  }

  [Symbol.for("nodejs.rejection")](error: Error) {
    this.emit("error", error);
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
