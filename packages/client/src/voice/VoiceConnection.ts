import {
  Room,
  RoomEvent,
  TrackSource,
  LocalAudioTrack,
  TrackPublishOptions,
  AudioFrame,
  AudioSource,
} from "@livekit/rtc-node";
import { Readable } from "node:stream";
import { EventEmitter } from "node:events";
import { AudioPlayer } from "./AudioPlayer";

export interface VoiceConnectionEvents {
  ready: [];
  disconnect: [];
  error: [error: Error];
}

export type VoiceConnectionStatus = "connecting" | "ready" | "disconnecting" | "disconnected";

const SAMPLE_RATE = 48000;
const CHANNELS = 2;
const SAMPLES_PER_FRAME = 960;
const BYTES_PER_FRAME = SAMPLES_PER_FRAME * CHANNELS * 2;

export class VoiceConnection extends EventEmitter<VoiceConnectionEvents> {
  readonly channelId: string;
  readonly guildId: string | undefined;

  private readonly room: Room;
  private _status: VoiceConnectionStatus = "connecting";
  private _player: AudioPlayer | null = null;
  private _audioSource: AudioSource | null = null;
  private _audioTrack: LocalAudioTrack | null = null;

  constructor(channelId: string, guildId?: string) {
    super();
    this.channelId = channelId;
    this.guildId = guildId;
    this.room = new Room();
    this.room.on(RoomEvent.Disconnected, () => {
      this._status = "disconnected";
      this._player?.removeSubscriber(this);
      this.emit("disconnect");
    });
  }

  get status(): VoiceConnectionStatus {
    return this._status;
  }

  get player(): AudioPlayer | null {
    return this._player;
  }

  /** @internal */
  async connect(url: string, token: string): Promise<void> {
    await this.room.connect(url, token);
    this._status = "ready";
    this.emit("ready");
  }

  subscribe(player: AudioPlayer): void {
    if (this._player) this._player.removeSubscriber(this);
    this._player = player;
    player.addSubscriber(this);
  }

  unsubscribe(): void {
    this._player?.removeSubscriber(this);
    this._player = null;
  }

  async _feedStream(stream: Readable): Promise<void> {
    // publish track once if not already up
    if (!this._audioSource) {
      this._audioSource = new AudioSource(SAMPLE_RATE, CHANNELS, SAMPLES_PER_FRAME);
      this._audioTrack = LocalAudioTrack.createAudioTrack("audio", this._audioSource);

      const options = new TrackPublishOptions();
      options.source = TrackSource.SOURCE_MICROPHONE;
      if (!this.room.localParticipant) {
        throw new Error("Not connected to a room");
      }
      await this.room.localParticipant.publishTrack(this._audioTrack, options);
    }

    let leftover = Buffer.alloc(0);

    for await (const chunk of stream) {
      const buf = Buffer.concat([leftover, chunk as Buffer]);
      let offset = 0;

      while (offset + BYTES_PER_FRAME <= buf.length) {
        const slice = buf.subarray(offset, offset + BYTES_PER_FRAME);
        const tmp = slice.buffer.slice(slice.byteOffset, slice.byteOffset + slice.byteLength);
        const pcm = new Int16Array(tmp);
        await this._audioSource.captureFrame(new AudioFrame(pcm, SAMPLE_RATE, CHANNELS, SAMPLES_PER_FRAME));
        offset += BYTES_PER_FRAME;
      }

      leftover = buf.subarray(offset);
    }
  }

  async disconnect(): Promise<void> {
    this._status = "disconnecting";
    this.unsubscribe();
    if (this._audioTrack) {
      await this._audioTrack.close();
      this._audioTrack = null;
      this._audioSource = null;
    }
    await this.room.disconnect();
  }
}
