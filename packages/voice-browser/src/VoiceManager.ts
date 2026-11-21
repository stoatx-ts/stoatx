import type { Client } from "@stoatx/client";
import { BaseVoiceManager } from "@stoatx/voice";
import { VoiceConnection, type BrowserVoiceOptions } from "./VoiceConnection";

/**
 * Joins voice calls in the browser, with the user's microphone and speakers.
 *
 * @example
 * import { VoiceManager } from "@stoatx/voice-browser";
 *
 * const voice = new VoiceManager(client);
 * const connection = await voice.join(channel);
 *
 * // From the mute button's click handler: asks for microphone permission the first time.
 * await connection.setMicrophoneEnabled(true);
 */
export class VoiceManager extends BaseVoiceManager<VoiceConnection> {
  /**
   * @param client The client to join calls with.
   * @param options Applied to every connection, e.g. where to put the audio elements.
   */
  constructor(client: Client, options: BrowserVoiceOptions = {}) {
    super(client, (channelId, serverId) => new VoiceConnection(channelId, serverId, options));
  }
}
