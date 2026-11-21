import type { BaseChannel, Client, UserResolvable, VoiceMoveRequest } from "@stoatx/client";
import type { BaseVoiceConnection } from "./VoiceConnection";

/** A voice channel, DM or group, or its ID. */
export type VoiceChannelResolvable = BaseChannel | string;

/** Options for {@link BaseVoiceManager.join}. */
export interface VoiceJoinOptions {
  /**
   * Disconnect the user's other voice connections first, e.g. a call they're in on another device.
   */
  forceDisconnect?: boolean;
  /**
   * Who to notify when starting a call in a DM or group. Only used when nobody is in the call yet.
   */
  recipients?: UserResolvable[];
  /** The voice node to use, by name from {@link BaseVoiceManager.fetchNodes}. Defaults to the server's choice. */
  node?: string;
}

/** A voice server of the instance, from {@link BaseVoiceManager.fetchNodes}. */
export interface VoiceNode {
  /** The node's name, for {@link VoiceJoinOptions.node}. */
  name: string;
  /** The LiveKit URL clients connect to. */
  url: string;
  /** Where the node is, to pick the nearest one. */
  latitude: number;
  longitude: number;
}

/**
 * Creates a platform's connection for a channel.
 * @param channelId The voice channel's ID.
 * @param serverId The ID of the server the channel is in, or `null` for DMs and groups.
 */
export type VoiceConnectionFactory<C extends BaseVoiceConnection> = (channelId: string, serverId: string | null) => C;

/**
 * Joins and tracks voice calls, one connection per channel. Use the `VoiceManager` from
 * `@stoatx/voice-node` or `@stoatx/voice-browser`, which extend this with their connection type.
 */
export class BaseVoiceManager<C extends BaseVoiceConnection = BaseVoiceConnection> {
  /** The client the calls are joined with. */
  public readonly client: Client;

  private readonly connections = new Map<string, C>();
  private readonly pending = new Map<string, Promise<C>>();
  private readonly createConnection: VoiceConnectionFactory<C>;
  private nodes: Promise<VoiceNode[]> | null = null;

  /**
   * @param client The client to join calls with.
   * @param createConnection Creates the platform's connection for a channel.
   */
  constructor(client: Client, createConnection: VoiceConnectionFactory<C>) {
    this.client = client;
    this.createConnection = createConnection;
    // A logged-out client can't stay in calls: its token is gone.
    client.on("logout", () => void this.leaveAll());
    client.on("voiceMoveRequest", (move) => void this.handleMove(move));
  }

  /**
   * Fetches the instance's voice servers. Cached after the first call.
   * @returns The nodes, empty if the instance has voice turned off.
   */
  public async fetchNodes(): Promise<VoiceNode[]> {
    this.nodes ??= this.client.rest.get("/").then(
      (config) =>
        (config.features.livekit?.nodes ?? []).map((node) => ({
          name: node.name,
          url: node.public_url,
          latitude: node.lat,
          longitude: node.lon,
        })),
      (error: unknown) => {
        this.nodes = null;
        throw error;
      },
    );
    return this.nodes;
  }

  /**
   * Joins a voice channel's call. Joining a channel the client is already in returns the existing
   * connection, and joining while a join is in progress waits for it.
   * @param channel The voice channel, DM or group, or its ID.
   * @param options Whether to disconnect other devices, who to ring, and which voice node to use.
   * Ignored when the client is already in the call.
   * @returns The connection, once it's ready.
   * @throws {StoatAPIError} If the API refuses, e.g. `MissingPermission` without the Connect permission.
   * @example
   * const connection = await voice.join(channel);
   * connection.on("disconnect", () => console.log("Left the call"));
   */
  public async join(channel: VoiceChannelResolvable, options: VoiceJoinOptions = {}): Promise<C> {
    const channelId = this.resolveId(channel);

    const existing = this.connections.get(channelId);
    if (existing?.status === "ready") return existing;

    const inFlight = this.pending.get(channelId);
    if (inFlight) return inFlight;

    const attempt = this.connect(channelId, options).finally(() => this.pending.delete(channelId));
    this.pending.set(channelId, attempt);
    return attempt;
  }

  /**
   * Gets the connection to a channel's call.
   * @param channel The channel or its ID.
   * @returns The connection, or `undefined` if the client isn't in that call.
   */
  public get(channel: VoiceChannelResolvable): C | undefined {
    return this.connections.get(this.resolveId(channel));
  }

  /** Every call the client is in, by channel ID. */
  public get cache(): ReadonlyMap<string, C> {
    return this.connections;
  }

  /**
   * Leaves a channel's call. Does nothing if the client isn't in it.
   * @param channel The channel or its ID.
   */
  public async leave(channel: VoiceChannelResolvable): Promise<void> {
    await this.connections.get(this.resolveId(channel))?.disconnect();
  }

  /** Leaves every call. */
  public async leaveAll(): Promise<void> {
    await Promise.all([...this.connections.values()].map((connection) => connection.disconnect()));
  }

  private async connect(channelId: string, options: VoiceJoinOptions): Promise<C> {
    const body: { force_disconnect?: boolean; recipients?: string[]; node?: string } = {};
    if (options.forceDisconnect !== undefined) body.force_disconnect = options.forceDisconnect;
    if (options.recipients !== undefined) {
      body.recipients = options.recipients.map((user) => this.client.users.resolveId(user));
    }
    if (options.node !== undefined) body.node = options.node;

    const { token, url } = await this.client.rest.post(`/channels/${channelId}/join_call`, body);

    const cached = this.client.channels.cache.get(channelId) as { serverId?: string } | undefined;
    const connection = this.createConnection(channelId, cached?.serverId ?? null);

    try {
      await connection.connect(url, token);
    } catch (error) {
      // Release the room so a failed join doesn't leak it.
      await connection.disconnect().catch(() => {});
      throw error;
    }

    const previous = this.connections.get(channelId);
    if (previous && previous !== connection) await previous.disconnect().catch(() => {});

    this.track(channelId, connection);
    return connection;
  }

  /**
   * Caches a connection until it disconnects.
   * @param channelId The call's channel ID.
   * @param connection The connection.
   */
  private track(channelId: string, connection: C): void {
    this.connections.set(channelId, connection);
    (connection as BaseVoiceConnection).once("disconnect", () => {
      // Only remove the entry if it still belongs to this connection.
      if (this.connections.get(channelId) === connection) this.connections.delete(channelId);
    });
  }

  /**
   * Follows the server moving the user to another call: connects there, carries the state over,
   * then leaves the old call. Errors are emitted on the old connection.
   * @param move The move request from the gateway.
   */
  private async handleMove(move: VoiceMoveRequest): Promise<void> {
    const previous = this.connections.get(move.fromChannelId);
    if (!previous) return;

    try {
      const node = (await this.fetchNodes()).find((candidate) => candidate.name === move.node);
      if (!node) throw new Error(`VOICE_NODE_UNKNOWN: The server moved the call to unknown voice node "${move.node}".`);

      const cached = this.client.channels.cache.get(move.toChannelId) as { serverId?: string } | undefined;
      const connection = this.createConnection(move.toChannelId, cached?.serverId ?? null);
      try {
        await connection.connect(node.url, move.token);
        await connection._takeOver(previous);
      } catch (error) {
        await connection.disconnect().catch(() => {});
        throw error;
      }

      this.track(move.toChannelId, connection);
      (previous as BaseVoiceConnection).emit("move", connection);
      await previous.disconnect();
    } catch (error) {
      previous._reportError(error);
    }
  }

  private resolveId(channel: VoiceChannelResolvable): string {
    return typeof channel === "string" ? channel : channel.id;
  }
}
