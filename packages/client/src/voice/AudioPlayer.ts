import { EventEmitter } from "node:events";
import { AudioResource } from "./AudioResource";

export type AudioPlayerStatus = "idle" | "buffering" | "playing" | "paused" | "stopped";

export interface AudioPlayerEvents {
  stateChange: [oldStatus: AudioPlayerStatus, newStatus: AudioPlayerStatus];
  idle: [];
  error: [error: Error];
}

export class AudioPlayer extends EventEmitter<AudioPlayerEvents> {
  private _status: AudioPlayerStatus = "idle";
  private _resource: AudioResource | null = null;

  /** Registered VoiceConnections subscribed to this player */
  private readonly subscribers: Set<import("./VoiceConnection").VoiceConnection> = new Set();

  get status(): AudioPlayerStatus {
    return this._status;
  }

  get resource(): AudioResource | null {
    return this._resource;
  }

  play(resource: AudioResource): void {
    this.transition("buffering");
    this._resource = resource;

    resource.stream.once("readable", () => {
      this.transition("playing");
      this.feed();
    });

    resource.stream.once("end", () => {
      this._resource = null;
      this.transition("idle");
      this.emit("idle");
    });

    resource.stream.once("error", (err) => {
      this._resource = null;
      this.transition("idle");
      this.emit("error", err);
    });
  }

  pause(): void {
    if (this._status !== "playing") return;
    this._resource?.stream.pause();
    this.transition("paused");
  }

  resume(): void {
    if (this._status !== "paused") return;
    this._resource?.stream.resume();
    this.transition("playing");
  }

  stop(): void {
    this._resource?.stream.destroy();
    this._resource = null;
    this.transition("stopped");
    this.transition("idle");
    this.emit("idle");
  }

  /** @internal */
  addSubscriber(conn: import("./VoiceConnection").VoiceConnection): void {
    this.subscribers.add(conn);
  }

  /** @internal */
  removeSubscriber(conn: import("./VoiceConnection").VoiceConnection): void {
    this.subscribers.delete(conn);
  }

  private feed(): void {
    if (!this._resource) return;
    for (const conn of this.subscribers) {
      conn._feedStream(this._resource.stream);
    }
  }

  private transition(next: AudioPlayerStatus): void {
    const prev = this._status;
    this._status = next;
    this.emit("stateChange", prev, next);
  }
}
