import { TextChannel } from "./TextChannel";
import type { VoiceConnection } from "../voice";

export class VoiceChannel extends TextChannel {
  async join(): Promise<VoiceConnection> {
    return this.client.voice.join(this.id, this.serverId);
  }

  async leave(): Promise<void> {
    return this.client.voice.leave(this.id);
  }
}
