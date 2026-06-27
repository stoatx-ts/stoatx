import type { Client } from "../client/Client";
import { VoiceConnection } from "./VoiceConnection";

export class VoiceManager {
  private readonly connections: Map<string, VoiceConnection> = new Map();
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async join(channelId: string, guildId?: string): Promise<VoiceConnection> {
    const existing = this.connections.get(channelId);
    if (existing?.status === "ready") return existing;

    const { token, url } = await this.client.rest.post(
      `/channels/${channelId}/join_call`,
    );

    const connection = new VoiceConnection(channelId, guildId);
    this.connections.set(channelId, connection);
    connection.once("disconnect", () => this.connections.delete(channelId));

    await connection.connect(url, token);
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
