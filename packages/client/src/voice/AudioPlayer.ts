import { EventEmitter } from "node:events";
import { AudioResource } from "./AudioResource";
import type { VoiceConnection } from "./VoiceConnection";

export type AudioPlayerStatus = "idle" | "buffering" | "playing" | "paused" | "stopped";

export interface AudioPlayerEvents {
  stateChange: [oldStatus: AudioPlayerStatus, newStatus: AudioPlayerStatus];
  idle: [];
  error: [error: Error];
}

export class AudioPlayer extends EventEmitter<AudioPlayerEvents> {
  private _status: AudioPlayerStatus = "idle";
  private _resource: AudioResource | null = null;
  private _detach: (() => void) | null = null;

  /** Registered VoiceConnections subscribed to this player */
  private readonly subscribers: Set<VoiceConnection> = new Set();

  get status(): AudioPlayerStatus {
    return this._status;
  }

  get resource(): AudioResource | null {
    return this._resource;
  }

  play(resource: AudioResource): void {
    // Tear down whatever was playing before so its ffmpeg process does not leak.
    this.releaseResource();

    this._resource = resource;
    this.transition("buffering");

    for (const conn of this.subscribers) conn._resetStream();

    const stream = resource.stream;

    // The player reads the stream once and fans each chunk out to every
    // subscriber. The stream stays paused until all subscribers have consumed
    // the chunk, which keeps decoding at playback speed.
    const onData = (chunk: Buffer) => {
      if (this._status === "buffering") this.transition("playing");
      stream.pause();

      const writes = [...this.subscribers].map((conn) => conn._writeChunk(chunk));
      void Promise.allSettled(writes).then(() => {
        if (this._resource === resource && this._status === "playing") stream.resume();
      });
    };

    const onEnd = () => {
      this.releaseResource();
      this.transition("idle");
      this.emit("idle");
    };

    const onError = (err: Error) => {
      this.releaseResource();
      this.transition("idle");
      if (this.listenerCount("error") > 0) this.emit("error", err);
    };

    stream.on("data", onData);
    stream.once("end", onEnd);
    stream.once("error", onError);

    this._detach = () => {
      stream.off("data", onData);
      stream.off("end", onEnd);
      stream.off("error", onError);
      // Keep a no-op error handler so destroying the stream cannot throw.
      stream.on("error", () => {});
    };
  }

  pause(): void {
    if (this._status !== "playing") return;
    this._resource?.stream.pause();
    this.transition("paused");
  }

  resume(): void {
    if (this._status !== "paused") return;
    this.transition("playing");
    this._resource?.stream.resume();
  }

  stop(): void {
    this.releaseResource();
    this.transition("stopped");
    this.transition("idle");
    this.emit("idle");
  }

  /** @internal */
  addSubscriber(conn: VoiceConnection): void {
    this.subscribers.add(conn);
  }

  /** @internal */
  removeSubscriber(conn: VoiceConnection): void {
    this.subscribers.delete(conn);
  }

  private releaseResource(): void {
    this._detach?.();
    this._detach = null;
    this._resource?.destroy();
    this._resource = null;
  }

  private transition(next: AudioPlayerStatus): void {
    const prev = this._status;
    this._status = next;
    this.emit("stateChange", prev, next);
  }
}
