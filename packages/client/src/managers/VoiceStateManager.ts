import type { Client } from "../client/Client";
import type { ChannelResolvable } from "./ChannelManager";
import type { UserResolvable } from "./UserManager";
import { Collection } from "../utils/Collection";
import { VoiceState, type RawVoiceState } from "../structures/VoiceState";

/** The voice states of one call, as the gateway sends them on connect. */
export interface RawChannelVoiceState {
  id: string;
  participants: RawVoiceState[];
}

/**
 * Who's in which voice call. Loaded when the client connects and kept up to date from gateway
 * events, so it works without joining any call. Available as `client.voiceStates`.
 */
export class VoiceStateManager {
  /** Voice states by channel ID, then user ID. Channels with nobody in a call have no entry. */
  public readonly cache = new Collection<string, Collection<string, VoiceState>>();

  /**
   * @param client The client this manager belongs to.
   */
  constructor(private readonly client: Client) {}

  /**
   * Gets everyone in a channel's call.
   * @param channel The channel or its ID.
   * @returns Their voice states by user ID. Empty if nobody is in the call.
   */
  public get(channel: ChannelResolvable): Collection<string, VoiceState> {
    return this.cache.get(this.client.channels.resolveId(channel)) ?? new Collection();
  }

  /**
   * Finds the call a user is in.
   * @param user The user or their ID.
   * @returns Their voice state, or `undefined` if they aren't in a call the client can see.
   */
  public getUser(user: UserResolvable): VoiceState | undefined {
    const id = this.client.users.resolveId(user);
    for (const states of this.cache.values()) {
      const state = states.get(id);
      if (state) return state;
    }
    return undefined;
  }

  /**
   * Replaces the cache with the states from `Ready`.
   * @param data The `voice_states` field.
   * @internal
   */
  public _setAll(data: RawChannelVoiceState[]): void {
    this.cache.clear();
    this._addChannels(data);
  }

  /**
   * Adds the calls of a server, e.g. from `ServerCreate`.
   * @param data The calls.
   * @internal
   */
  public _addChannels(data: RawChannelVoiceState[]): void {
    for (const channel of data) {
      for (const participant of channel.participants) this._add(channel.id, participant);
    }
  }

  /**
   * Adds or replaces a user's state in a call.
   * @param channelId The call's channel ID.
   * @param data The raw state.
   * @internal
   */
  public _add(channelId: string, data: RawVoiceState): VoiceState {
    let states = this.cache.get(channelId);
    if (!states) this.cache.set(channelId, (states = new Collection()));
    const state = new VoiceState(this.client, channelId, data);
    states.set(state.userId, state);
    return state;
  }

  /**
   * Removes a user from a call.
   * @param channelId The call's channel ID.
   * @param userId The user's ID.
   * @returns Their state, if it was cached.
   * @internal
   */
  public _remove(channelId: string, userId: string): VoiceState | undefined {
    const states = this.cache.get(channelId);
    const state = states?.get(userId);
    states?.delete(userId);
    if (states?.size === 0) this.cache.delete(channelId);
    return state;
  }

  /**
   * Removes every state in a channel, e.g. when it's deleted.
   * @param channelId The channel's ID.
   * @internal
   */
  public _removeChannel(channelId: string): void {
    this.cache.delete(channelId);
  }
}
