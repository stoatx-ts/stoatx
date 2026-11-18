import {
  Room,
  RoomEvent,
  TrackSource,
  LocalAudioTrack,
  TrackPublishOptions,
  AudioFrame,
  AudioSource,
} from "@livekit/rtc-node";
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
  private _audioTrack: LocalAudioTrack | null = null;
  private _publishing: Promise<AudioSource> | null = null;
  private _leftover: Buffer = Buffer.alloc(0);

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

  /**
   * Drops any partial frame left over from a previous stream.
   * @internal
   */
  _resetStream(): void {
    this._leftover = Buffer.alloc(0);
  }

  /**
   * Converts a chunk of s16le PCM into frames and sends them to the room.
   * Never rejects: failures are emitted as `error` events.
   * @internal
   */
  async _writeChunk(chunk: Buffer): Promise<void> {
    try {
      if (this._status !== "ready") return;
      const source = await this.ensureTrack();

      const buf = Buffer.concat([this._leftover, chunk]);
      let offset = 0;

      while (offset + BYTES_PER_FRAME <= buf.length) {
        // Stop sending as soon as we are detached or disconnected.
        if (this._status !== "ready" || !this._player) return;

        const slice = buf.subarray(offset, offset + BYTES_PER_FRAME);
        const tmp = slice.buffer.slice(slice.byteOffset, slice.byteOffset + slice.byteLength);
        const pcm = new Int16Array(tmp);
        await source.captureFrame(new AudioFrame(pcm, SAMPLE_RATE, CHANNELS, SAMPLES_PER_FRAME));
        offset += BYTES_PER_FRAME;
      }

      this._leftover = buf.subarray(offset);
    } catch (error) {
      if (this.listenerCount("error") > 0) {
        this.emit("error", error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  private ensureTrack(): Promise<AudioSource> {
    if (!this._publishing) {
      this._publishing = (async () => {
        if (!this.room.localParticipant) {
          throw new Error("Not connected to a room");
        }
        const source = new AudioSource(SAMPLE_RATE, CHANNELS, SAMPLES_PER_FRAME);
        const track = LocalAudioTrack.createAudioTrack("audio", source);

        const options = new TrackPublishOptions();
        options.source = TrackSource.SOURCE_MICROPHONE;
        await this.room.localParticipant.publishTrack(track, options);

        this._audioTrack = track;
        return source;
      })();
      this._publishing.catch(() => {
        this._publishing = null;
      });
    }
    return this._publishing;
  }

  async disconnect(): Promise<void> {
    this._status = "disconnecting";
    this.unsubscribe();
    if (this._audioTrack) {
      await this._audioTrack.close();
      this._audioTrack = null;
    }
    this._publishing = null;
    this._leftover = Buffer.alloc(0);
    await this.room.disconnect();
  }
}
