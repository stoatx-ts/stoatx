import {
  Room,
  RoomEvent,
  TrackSource,
  LocalAudioTrack,
  TrackPublishOptions,
  AudioFrame,
  AudioSource,
} from "@livekit/rtc-node";
import { BaseVoiceConnection } from "@stoatx/voice";
import type { AudioPlayer } from "./AudioPlayer";

const SAMPLE_RATE = 48000;
const CHANNELS = 2;
const SAMPLES_PER_FRAME = 960;
const BYTES_PER_FRAME = SAMPLES_PER_FRAME * CHANNELS * 2;

/**
 * A connection to a voice channel's call in Node.js. Plays audio from an {@link AudioPlayer}.
 * Get one from `VoiceManager.join()`.
 */
export class VoiceConnection extends BaseVoiceConnection {
  private readonly room: Room;
  private _player: AudioPlayer | null = null;
  private _audioTrack: LocalAudioTrack | null = null;
  private _audioSource: AudioSource | null = null;
  private _publishing: Promise<AudioSource> | null = null;
  private _leftover: Buffer = Buffer.alloc(0);

  /**
   * @param channelId The voice channel's ID.
   * @param serverId The ID of the server the channel is in, or `null` for DMs and groups.
   */
  constructor(channelId: string, serverId: string | null) {
    super(channelId, serverId);
    this.room = new Room();
    this.room.on(RoomEvent.Disconnected, () => {
      this._status = "disconnected";
      this._player?.removeSubscriber(this);
      this.emitBase("disconnect");
    });
  }

  /** The player this connection plays audio from, if it's subscribed to one. */
  get player(): AudioPlayer | null {
    return this._player;
  }

  /** @internal */
  async connect(url: string, token: string): Promise<void> {
    await this.room.connect(url, token);
    this._status = "ready";
    this.emitBase("ready");
  }

  /**
   * Plays audio from a player in this call. A connection plays from one player at a time;
   * a player can play into several connections.
   * @param player The player.
   */
  subscribe(player: AudioPlayer): void {
    if (this._player) this._player.removeSubscriber(this);
    this._player = player;
    player.addSubscriber(this);
  }

  /**
   * Keeps playing the old connection's player after the server moves the user to another call.
   * @param previous The connection being replaced.
   * @internal
   */
  override async _takeOver(previous: VoiceConnection): Promise<void> {
    if (previous.player) this.subscribe(previous.player);
  }

  /** Stops playing audio from the current player. */
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
      this.reportError(error);
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
        this._audioSource = source;
        return source;
      })();
      this._publishing.catch(() => {
        this._publishing = null;
      });
    }
    return this._publishing;
  }

  /** Leaves the call and stops sending audio. */
  async disconnect(): Promise<void> {
    this._status = "disconnecting";
    this.unsubscribe();
    if (this._audioTrack) {
      await this._audioTrack.close();
      this._audioTrack = null;
    }
    // The source holds a native handle; close it so a disconnect doesn't leak it.
    if (this._audioSource) {
      await this._audioSource.close();
      this._audioSource = null;
    }
    this._publishing = null;
    this._leftover = Buffer.alloc(0);
    await this.room.disconnect();
  }
}
