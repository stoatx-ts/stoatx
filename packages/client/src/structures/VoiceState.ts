import type { Client } from "../client/Client";
import type { BaseChannel } from "./BaseChannel";
import type { User } from "./User";

/** A user's voice state as the gateway sends it. */
export interface RawVoiceState {
  id: string;
  joined_at: string;
  is_receiving: boolean;
  is_publishing: boolean;
  screensharing: boolean;
  camera: boolean;
}

/**
 * Someone in a voice call: who, where, since when, and what they're sending.
 * Read them from `channel.voiceStates` or `client.voiceStates`.
 */
export class VoiceState {
  /** The user's ID. */
  public readonly userId: string;
  /** The ID of the voice channel, DM or group they're in. */
  public channelId: string;
  /** When they joined the call. */
  public joinedAt: Date;
  /** Whether they're hearing the call. `false` when they've deafened. */
  public isReceiving: boolean;
  /** Whether they're sending audio. `false` when their microphone is off. */
  public isPublishing: boolean;
  /** Whether they're sharing their screen. */
  public screensharing: boolean;
  /** Whether their camera is on. */
  public camera: boolean;

  /**
   * @param client The client the state belongs to.
   * @param channelId The call's channel ID.
   * @param data The raw state.
   */
  constructor(
    private readonly client: Client,
    channelId: string,
    data: RawVoiceState,
  ) {
    this.userId = data.id;
    this.channelId = channelId;
    this.joinedAt = new Date(data.joined_at);
    this.isReceiving = data.is_receiving;
    this.isPublishing = data.is_publishing;
    this.screensharing = data.screensharing;
    this.camera = data.camera;
  }

  /** The user, if cached. */
  public get user(): User | undefined {
    return this.client.users.cache.get(this.userId);
  }

  /** The call's channel, if cached. */
  public get channel(): BaseChannel | undefined {
    return this.client.channels.cache.get(this.channelId);
  }

  /**
   * Applies a partial update from the gateway.
   * @param data The changed fields.
   * @internal
   */
  public _patch(data: Partial<RawVoiceState>): void {
    if (data.joined_at !== undefined) this.joinedAt = new Date(data.joined_at);
    if (data.is_receiving !== undefined) this.isReceiving = data.is_receiving;
    if (data.is_publishing !== undefined) this.isPublishing = data.is_publishing;
    if (data.screensharing !== undefined) this.screensharing = data.screensharing;
    if (data.camera !== undefined) this.camera = data.camera;
  }

  /**
   * Copies this state, so events can pass the state from before an update.
   * @internal
   */
  public _clone(): VoiceState {
    return Object.assign(Object.create(VoiceState.prototype) as VoiceState, this);
  }
}
