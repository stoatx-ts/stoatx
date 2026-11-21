import { EventEmitter } from "events";

/** Where a voice connection is in its lifecycle. */
export type VoiceConnectionStatus = "connecting" | "ready" | "disconnecting" | "disconnected";

/** Events every voice connection emits. Platform packages add their own. */
export interface VoiceConnectionEvents {
  /** Connected to the call. */
  ready: [];
  /** Left the call, or the connection was lost. */
  disconnect: [];
  /** Something went wrong while connected, e.g. sending audio failed. */
  error: [error: Error];
  /**
   * The server moved the user to another call, e.g. a moderator dragged them. This connection
   * disconnects right after; use the new one from now on. It already plays the same audio
   * (Node.js) or keeps the microphone and deafen state (browser).
   */
  move: [connection: BaseVoiceConnection];
}

/**
 * A connection to one voice channel. `@stoatx/voice-node` and `@stoatx/voice-browser` provide the
 * implementations; get one from their `VoiceManager.join()`.
 */
export abstract class BaseVoiceConnection<
  Events extends VoiceConnectionEvents & Record<keyof Events, any[]> = VoiceConnectionEvents,
> extends EventEmitter<Events> {
  /** The voice channel's ID. */
  public readonly channelId: string;
  /** The ID of the server the channel is in, or `null` for DMs and groups. */
  public readonly serverId: string | null;

  protected _status: VoiceConnectionStatus = "connecting";

  /**
   * @param channelId The voice channel's ID.
   * @param serverId The ID of the server the channel is in, or `null` for DMs and groups.
   */
  constructor(channelId: string, serverId: string | null) {
    super();
    this.channelId = channelId;
    this.serverId = serverId;
  }

  /** Where the connection is in its lifecycle. */
  public get status(): VoiceConnectionStatus {
    return this._status;
  }

  /**
   * Connects to the call's LiveKit room. Called by `VoiceManager.join()`.
   * @param url The LiveKit server URL.
   * @param token The token from `join_call`.
   * @internal
   */
  public abstract connect(url: string, token: string): Promise<void>;

  /** Leaves the call. */
  public abstract disconnect(): Promise<void>;

  /**
   * Carries over state from the connection this one replaces when the server moves the user,
   * e.g. the audio player or microphone. Does nothing by default.
   * @param _previous The connection being replaced.
   * @internal
   */
  public async _takeOver(_previous: this): Promise<void> {}

  /**
   * Emits a base connection event. Subclasses call this instead of `emit()`, whose types can't
   * be checked against the generic `Events`.
   * @param event The event name.
   * @param args The event's arguments.
   */
  protected emitBase<E extends keyof VoiceConnectionEvents>(event: E, ...args: VoiceConnectionEvents[E]): void {
    EventEmitter.prototype.emit.call(this, event, ...args);
  }

  /**
   * Emits `error` if anyone listens, so a failure inside the connection can't crash the process.
   * @param error The error.
   */
  /** @internal */
  public _reportError(error: unknown): void {
    this.reportError(error);
  }

  protected reportError(error: unknown): void {
    if (this.listenerCount("error") === 0) return;
    this.emitBase("error", error instanceof Error ? error : new Error(String(error)));
  }
}
