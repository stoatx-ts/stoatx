/// <reference lib="dom" />
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";
import { BaseVoiceConnection, type VoiceConnectionEvents } from "@stoatx/voice";

/** Events a browser voice connection emits. */
export interface BrowserVoiceConnectionEvents extends VoiceConnectionEvents {
  /**
   * The people currently speaking changed. Includes the logged-in user while they talk.
   * Each ID is the participant's LiveKit identity, which is their Stoat user ID.
   */
  activeSpeakersChange: [userIds: string[]];
  /** Someone joined the call. */
  participantJoin: [userId: string];
  /** Someone left the call. */
  participantLeave: [userId: string];
  /**
   * Whether the browser lets the call's audio play changed. When it's `false`, call
   * {@link VoiceConnection.startAudio} from a click or key press.
   */
  audioPlaybackChange: [canPlay: boolean];
}

/** Options for a browser voice connection. */
export interface BrowserVoiceOptions {
  /**
   * Where to put the `<audio>` elements that play other people's voices.
   * Defaults to `document.body`. The elements have no controls, so they're invisible.
   */
  audioContainer?: HTMLElement;
}

/**
 * A connection to a voice channel's call in the browser. Sends the user's microphone and plays
 * everyone else. Get one from `VoiceManager.join()`.
 *
 * The microphone starts off, so joining never triggers a permission prompt by itself:
 * call {@link setMicrophoneEnabled} when the user unmutes.
 */
export class VoiceConnection extends BaseVoiceConnection<BrowserVoiceConnectionEvents> {
  private readonly room: Room;
  private readonly audioContainer: HTMLElement | undefined;
  private readonly audioElements = new Set<HTMLMediaElement>();
  private _deafened = false;

  /**
   * @param channelId The voice channel's ID.
   * @param serverId The ID of the server the channel is in, or `null` for DMs and groups.
   * @param options Where to put the audio elements.
   */
  constructor(channelId: string, serverId: string | null, options: BrowserVoiceOptions = {}) {
    super(channelId, serverId);
    this.audioContainer = options.audioContainer;
    this.room = new Room();

    this.room
      .on(RoomEvent.TrackSubscribed, (track) => this.attach(track))
      .on(RoomEvent.TrackUnsubscribed, (track) => this.detach(track))
      .on(RoomEvent.ActiveSpeakersChanged, (speakers) =>
        this.emit(
          "activeSpeakersChange",
          speakers.map((speaker) => speaker.identity),
        ),
      )
      .on(RoomEvent.ParticipantConnected, (participant) => this.emit("participantJoin", participant.identity))
      .on(RoomEvent.ParticipantDisconnected, (participant) => this.emit("participantLeave", participant.identity))
      .on(RoomEvent.AudioPlaybackStatusChanged, () => this.emit("audioPlaybackChange", this.room.canPlaybackAudio))
      .on(RoomEvent.Disconnected, () => {
        this._status = "disconnected";
        this.removeAudioElements();
        this.emitBase("disconnect");
      });
  }

  /** The user IDs of everyone else in the call. */
  public get participantIds(): string[] {
    return [...this.room.remoteParticipants.values()].map((participant) => participant.identity);
  }

  /** Whether the user's microphone is being sent to the call. */
  public get microphoneEnabled(): boolean {
    return this.room.localParticipant.isMicrophoneEnabled;
  }

  /** Whether other people's audio is muted locally. */
  public get deafened(): boolean {
    return this._deafened;
  }

  /**
   * Whether the browser lets the call's audio play. Browsers block audio until the user interacts
   * with the page; if this is `false`, call {@link startAudio} from a click or key press.
   */
  public get canPlayAudio(): boolean {
    return this.room.canPlaybackAudio;
  }

  /** @internal */
  public async connect(url: string, token: string): Promise<void> {
    await this.room.connect(url, token);
    this._status = "ready";
    this.emitBase("ready");
  }

  /**
   * Turns the microphone on or off. Turning it on the first time asks the user for permission.
   * @param enabled Whether to send the microphone.
   * @param deviceId The microphone to use, from `navigator.mediaDevices.enumerateDevices()`.
   * Defaults to the browser's default microphone.
   * @throws If the user denies microphone access.
   * @example
   * muteButton.onclick = () => connection.setMicrophoneEnabled(!connection.microphoneEnabled);
   */
  public async setMicrophoneEnabled(enabled: boolean, deviceId?: string): Promise<void> {
    await this.room.localParticipant.setMicrophoneEnabled(enabled, deviceId === undefined ? undefined : { deviceId });
  }

  /**
   * Mutes or unmutes everyone else locally. The microphone isn't affected; turn it off too to
   * fully deafen, like the official client does.
   * @param deafened Whether to mute other people.
   */
  public setDeafened(deafened: boolean): void {
    this._deafened = deafened;
    for (const element of this.audioElements) element.muted = deafened;
  }

  /**
   * Starts the call's audio after the browser blocked it. Must be called from a user interaction,
   * like a click handler.
   */
  public async startAudio(): Promise<void> {
    await this.room.startAudio();
  }

  /**
   * Keeps the microphone and deafen state after the server moves the user to another call.
   * @param previous The connection being replaced.
   * @internal
   */
  public override async _takeOver(previous: VoiceConnection): Promise<void> {
    this.setDeafened(previous.deafened);
    if (previous.microphoneEnabled) await this.setMicrophoneEnabled(true);
  }

  /** Leaves the call, turns the microphone off and removes the audio elements. */
  public async disconnect(): Promise<void> {
    this._status = "disconnecting";
    this.removeAudioElements();
    await this.room.disconnect();
  }

  private attach(track: RemoteTrack): void {
    if (track.kind !== Track.Kind.Audio) return;
    const element = track.attach();
    element.muted = this._deafened;
    (this.audioContainer ?? document.body).appendChild(element);
    this.audioElements.add(element);
  }

  private detach(track: RemoteTrack): void {
    for (const element of track.detach()) {
      element.remove();
      this.audioElements.delete(element);
    }
  }

  private removeAudioElements(): void {
    for (const element of this.audioElements) element.remove();
    this.audioElements.clear();
  }
}
