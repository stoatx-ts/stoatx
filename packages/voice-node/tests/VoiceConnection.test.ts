import { describe, it, expect, vi } from "vitest";

/** What the fake LiveKit classes closed, in order. Hoisted so the mock factory can use it. */
const { closed } = vi.hoisted(() => ({ closed: [] as string[] }));

/** Stand-ins for the native LiveKit classes, so the tests don't load the FFI bindings. */
vi.mock("@livekit/rtc-node", async () => {
  const { EventEmitter } = await import("node:events");
  class Room extends EventEmitter {
    localParticipant = { publishTrack: vi.fn(async () => {}) };
    connect = vi.fn(async () => {});
    disconnect = vi.fn(async () => {
      this.emit("disconnected");
    });
  }
  class AudioSource {
    captureFrame = vi.fn(async () => {});
    close = vi.fn(async () => {
      closed.push("source");
    });
  }
  class LocalAudioTrack {
    static createAudioTrack = () => new LocalAudioTrack();
    close = vi.fn(async () => {
      closed.push("track");
    });
  }
  class TrackPublishOptions {
    source?: number;
  }
  class AudioFrame {}
  return {
    Room,
    RoomEvent: { Disconnected: "disconnected" },
    TrackSource: { SOURCE_MICROPHONE: 2 },
    LocalAudioTrack,
    TrackPublishOptions,
    AudioFrame,
    AudioSource,
  };
});

const { VoiceConnection } = await import("../src/VoiceConnection");
const { AudioPlayer } = await import("../src/AudioPlayer");

describe("Node VoiceConnection", () => {
  it("_takeOver() keeps playing the previous connection's player", async () => {
    const previous = new VoiceConnection("channel1", null);
    const player = new AudioPlayer();
    previous.subscribe(player);
    const next = new VoiceConnection("channel2", null);

    await next._takeOver(previous);

    expect(next.player).toBe(player);
  });

  it("disconnect() closes the published track and its audio source", async () => {
    const connection = new VoiceConnection("channel1", null);
    await connection.connect("wss://livekit.example", "token");
    connection.subscribe(new AudioPlayer());
    await connection._writeChunk(Buffer.alloc(3840));

    await connection.disconnect();

    expect(closed).toEqual(["track", "source"]);
    expect(connection.status).toBe("disconnected");
  });
});
