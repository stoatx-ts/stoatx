import type { BaseChannel, Client } from "@stoatx/client";
import type { BaseVoiceConnection } from "./VoiceConnection";

/** A voice channel, DM or group, or its ID. */
export type VoiceChannelResolvable = BaseChannel | string;

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

  /**
   * @param client The client to join calls with.
   * @param createConnection Creates the platform's connection for a channel.
   */
  constructor(client: Client, createConnection: VoiceConnectionFactory<C>) {
    this.client = client;
    this.createConnection = createConnection;
    // A logged-out client can't stay in calls: its token is gone.
    client.on("logout", () => void this.leaveAll());
  }

  /**
   * Joins a voice channel's call. Joining a channel the client is already in returns the existing
   * connection, and joining while a join is in progress waits for it.
   * @param channel The voice channel, DM or group, or its ID.
   * @returns The connection, once it's ready.
   * @throws {StoatAPIError} If the API refuses, e.g. `MissingPermission` without the Connect permission.
   * @example
   * const connection = await voice.join(channel);
   * connection.on("disconnect", () => console.log("Left the call"));
   */
  public async join(channel: VoiceChannelResolvable): Promise<C> {
    const channelId = this.resolveId(channel);

    const existing = this.connections.get(channelId);
    if (existing?.status === "ready") return existing;

    const inFlight = this.pending.get(channelId);
    if (inFlight) return inFlight;

    const attempt = this.connect(channelId).finally(() => this.pending.delete(channelId));
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

  private async connect(channelId: string): Promise<C> {
    const { token, url } = await this.client.rest.post(`/channels/${channelId}/join_call`);

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

    this.connections.set(channelId, connection);
    (connection as BaseVoiceConnection).once("disconnect", () => {
      // Only remove the entry if it still belongs to this connection.
      if (this.connections.get(channelId) === connection) this.connections.delete(channelId);
    });

    return connection;
  }

  private resolveId(channel: VoiceChannelResolvable): string {
    return typeof channel === "string" ? channel : channel.id;
  }
}
