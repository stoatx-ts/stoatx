import type { Client } from "../client/Client";
import { VoiceConnection } from "./VoiceConnection";

export class VoiceManager {
  private readonly connections: Map<string, VoiceConnection> = new Map();
  private readonly pending: Map<string, Promise<VoiceConnection>> = new Map();
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async join(channelId: string, guildId?: string): Promise<VoiceConnection> {
    const existing = this.connections.get(channelId);
    if (existing?.status === "ready") return existing;

    const inFlight = this.pending.get(channelId);
    if (inFlight) return inFlight;

    const attempt = this.connect(channelId, guildId).finally(() => this.pending.delete(channelId));
    this.pending.set(channelId, attempt);
    return attempt;
  }

  private async connect(channelId: string, guildId?: string): Promise<VoiceConnection> {
    const { token, url } = await this.client.rest.post(`/channels/${channelId}/join_call`);

    const connection = new VoiceConnection(channelId, guildId);

    try {
      await connection.connect(url, token);
    } catch (error) {
      // Release the native room so a failed join does not leak it.
      await connection.disconnect().catch(() => {});
      throw error;
    }

    const previous = this.connections.get(channelId);
    if (previous && previous !== connection) await previous.disconnect().catch(() => {});

    this.connections.set(channelId, connection);
    connection.once("disconnect", () => {
      // Only remove the entry if it still belongs to this connection.
      if (this.connections.get(channelId) === connection) this.connections.delete(channelId);
    });

    return connection;
  }

  get(channelId: string): VoiceConnection | undefined {
    return this.connections.get(channelId);
  }

  async leave(channelId: string): Promise<void> {
    await this.connections.get(channelId)?.disconnect();
  }

  async leaveAll(): Promise<void> {
    await Promise.all([...this.connections.keys()].map((id) => this.leave(id)));
  }
}
