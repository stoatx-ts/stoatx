import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "node:events";

/** A stand-in for livekit-client's Room that tests can drive by emitting its events. */
class FakeRoom extends EventEmitter {
  static last: FakeRoom;
  remoteParticipants = new Map<string, { identity: string }>();
  canPlaybackAudio = true;
  localParticipant = {
    isMicrophoneEnabled: false,
    setMicrophoneEnabled: vi.fn(async (enabled: boolean) => {
      this.localParticipant.isMicrophoneEnabled = enabled;
    }),
  };
  connect = vi.fn(async () => {});
  disconnect = vi.fn(async () => {
    this.emit("disconnected");
  });
  startAudio = vi.fn(async () => {});

  constructor() {
    super();
    FakeRoom.last = this;
  }
}

vi.mock("livekit-client", () => ({
  Room: FakeRoom,
  RoomEvent: {
    TrackSubscribed: "trackSubscribed",
    TrackUnsubscribed: "trackUnsubscribed",
    ActiveSpeakersChanged: "activeSpeakersChanged",
    ParticipantConnected: "participantConnected",
    ParticipantDisconnected: "participantDisconnected",
    AudioPlaybackStatusChanged: "audioPlaybackChanged",
    Disconnected: "disconnected",
  },
  Track: { Kind: { Audio: "audio", Video: "video" } },
}));

const { VoiceConnection } = await import("../src/VoiceConnection");

/** A fake remote track whose attach() creates a fake audio element. */
function fakeTrack(kind = "audio") {
  const elements: { muted: boolean; remove: ReturnType<typeof vi.fn> }[] = [];
  return {
    kind,
    elements,
    attach: vi.fn(() => {
      const element = { muted: false, remove: vi.fn() };
      elements.push(element);
      return element;
    }),
    detach: vi.fn(() => elements.splice(0)),
  };
}

let container: { appendChild: ReturnType<typeof vi.fn> };

beforeEach(() => {
  container = { appendChild: vi.fn() };
});

function connect() {
  const connection = new VoiceConnection("channel1", "server1", { audioContainer: container as any });
  return { connection, room: FakeRoom.last };
}

describe("browser VoiceConnection", () => {
  it("becomes ready after connecting", async () => {
    const { connection, room } = connect();
    const onReady = vi.fn();
    connection.on("ready", onReady);

    await connection.connect("wss://livekit.example", "token");

    expect(room.connect).toHaveBeenCalledWith("wss://livekit.example", "token");
    expect(connection.status).toBe("ready");
    expect(onReady).toHaveBeenCalled();
  });

  it("plays remote audio tracks in the container and ignores video", () => {
    const { room } = connect();
    const audio = fakeTrack("audio");
    const video = fakeTrack("video");

    room.emit("trackSubscribed", audio);
    room.emit("trackSubscribed", video);

    expect(container.appendChild).toHaveBeenCalledTimes(1);
    expect(video.attach).not.toHaveBeenCalled();
  });

  it("removes a track's element when it's unsubscribed", () => {
    const { room } = connect();
    const track = fakeTrack();
    room.emit("trackSubscribed", track);
    const [element] = track.elements;

    room.emit("trackUnsubscribed", track);

    expect(element!.remove).toHaveBeenCalled();
  });

  it("deafening mutes current and future audio", () => {
    const { connection, room } = connect();
    const first = fakeTrack();
    room.emit("trackSubscribed", first);

    connection.setDeafened(true);
    const second = fakeTrack();
    room.emit("trackSubscribed", second);

    expect(connection.deafened).toBe(true);
    expect(first.elements[0]!.muted).toBe(true);
    expect(second.elements[0]!.muted).toBe(true);

    connection.setDeafened(false);
    expect(first.elements[0]!.muted).toBe(false);
  });

  it("turns the microphone on with an optional device", async () => {
    const { connection, room } = connect();

    await connection.setMicrophoneEnabled(true, "mic-2");

    expect(room.localParticipant.setMicrophoneEnabled).toHaveBeenCalledWith(true, { deviceId: "mic-2" });
    expect(connection.microphoneEnabled).toBe(true);
  });

  it("emits speaker, participant and playback events with user IDs", () => {
    const { connection, room } = connect();
    const speakers = vi.fn();
    const joined = vi.fn();
    const left = vi.fn();
    const playback = vi.fn();
    connection
      .on("activeSpeakersChange", speakers)
      .on("participantJoin", joined)
      .on("participantLeave", left)
      .on("audioPlaybackChange", playback);

    room.emit("activeSpeakersChanged", [{ identity: "user1" }, { identity: "user2" }]);
    room.emit("participantConnected", { identity: "user3" });
    room.emit("participantDisconnected", { identity: "user3" });
    room.canPlaybackAudio = false;
    room.emit("audioPlaybackChanged");

    expect(speakers).toHaveBeenCalledWith(["user1", "user2"]);
    expect(joined).toHaveBeenCalledWith("user3");
    expect(left).toHaveBeenCalledWith("user3");
    expect(playback).toHaveBeenCalledWith(false);
    expect(connection.canPlayAudio).toBe(false);
  });

  it("lists the other participants", () => {
    const { connection, room } = connect();
    room.remoteParticipants.set("a", { identity: "user1" });

    expect(connection.participantIds).toEqual(["user1"]);
  });

  it("disconnect() removes the audio elements and emits disconnect", async () => {
    const { connection, room } = connect();
    const track = fakeTrack();
    room.emit("trackSubscribed", track);
    const onDisconnect = vi.fn();
    connection.on("disconnect", onDisconnect);

    await connection.disconnect();

    expect(track.elements[0]!.remove).toHaveBeenCalled();
    expect(connection.status).toBe("disconnected");
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it("_takeOver() keeps the microphone and deafen state", async () => {
    const previous = connect().connection;
    previous.setDeafened(true);
    await previous.setMicrophoneEnabled(true);
    const { connection, room } = connect();

    await connection._takeOver(previous);

    expect(connection.deafened).toBe(true);
    expect(room.localParticipant.setMicrophoneEnabled).toHaveBeenCalledWith(true, undefined);
  });
});
