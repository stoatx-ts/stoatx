import type { Client } from "@stoatx/client";
import { BaseVoiceManager } from "@stoatx/voice";
import { VoiceConnection } from "./VoiceConnection";

/**
 * Joins voice calls from Node.js, e.g. for a music bot. Play audio into a call with an
 * `AudioPlayer`.
 *
 * @example
 * import { VoiceManager, AudioPlayer, AudioResource } from "@stoatx/voice-node";
 *
 * const voice = new VoiceManager(client);
 * const connection = await voice.join(channel);
 *
 * const player = new AudioPlayer();
 * connection.subscribe(player);
 * player.play(AudioResource.from("./song.mp3"));
 */
export class VoiceManager extends BaseVoiceManager<VoiceConnection> {
  /**
   * @param client The client to join calls with.
   */
  constructor(client: Client) {
    super(client, (channelId, serverId) => new VoiceConnection(channelId, serverId));
  }
}
