import { TextChannel } from "./TextChannel";

/**
 * A server voice channel. To join its call, use `VoiceManager` from `@stoatx/voice-node`
 * or `@stoatx/voice-browser`: `await voice.join(channel)`.
 */
export class VoiceChannel extends TextChannel {}
