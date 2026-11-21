import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Client } from "@stoatx/client";
import { ulid } from "ulid";
import { BaseVoiceConnection, BaseVoiceManager } from "../src";

const API = "https://api.example";

class FakeConnection extends BaseVoiceConnection {
  public readonly connect = vi.fn(async (_url: string, _token: string) => {
    if (this.failNext) throw new Error("connect failed");
    this._status = "ready";
    this.emitBase("ready");
  });

  public readonly disconnect = vi.fn(async () => {
    this._status = "disconnected";
    this.emitBase("disconnect");
  });

  public failNext = false;
}

let client: Client;
let joinCalls: string[];

beforeEach(() => {
  client = new Client({ apiURL: API });
  client.rest.setToken("user-token", "user");
  joinCalls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      const path = new URL(input).pathname;
      joinCalls.push(path);
      return new Response(JSON.stringify({ token: "lk-token", url: "wss://livekit.example" }));
    }),
  );
});

afterEach(() => {
  client.rest.destroy();
  vi.unstubAllGlobals();
});

function manager(setup: (connection: FakeConnection) => void = () => {}) {
  const created: FakeConnection[] = [];
  const voice = new BaseVoiceManager(client, (channelId, serverId) => {
    const connection = new FakeConnection(channelId, serverId);
    setup(connection);
    created.push(connection);
    return connection;
  });
  return { voice, created };
}

describe("BaseVoiceManager", () => {
  it("joins with the token from join_call and caches the connection", async () => {
    const { voice } = manager();

    const connection = await voice.join("channel1");

    expect(joinCalls).toEqual(["/channels/channel1/join_call"]);
    expect(connection.connect).toHaveBeenCalledWith("wss://livekit.example", "lk-token");
    expect(connection.status).toBe("ready");
    expect(voice.get("channel1")).toBe(connection);
  });

  it("takes the server ID from the cached channel", async () => {
    const channelId = ulid();
    client.channels._add({ _id: channelId, channel_type: "TextChannel", server: "server1", name: "Voice" } as any);
    const { voice } = manager();

    expect((await voice.join(channelId)).serverId).toBe("server1");
    expect((await voice.join("uncached")).serverId).toBeNull();
  });

  it("reuses a ready connection and shares a join in progress", async () => {
    const { voice, created } = manager();

    const [a, b] = await Promise.all([voice.join("channel1"), voice.join("channel1")]);
    const c = await voice.join("channel1");

    expect(a).toBe(b);
    expect(a).toBe(c);
    expect(created).toHaveLength(1);
    expect(joinCalls).toHaveLength(1);
  });

  it("disconnects a connection that failed to connect and doesn't cache it", async () => {
    const { voice, created } = manager((connection) => (connection.failNext = true));

    await expect(voice.join("channel1")).rejects.toThrow("connect failed");

    expect(created[0]!.disconnect).toHaveBeenCalled();
    expect(voice.get("channel1")).toBeUndefined();
  });

  it("removes a connection from the cache when it disconnects", async () => {
    const { voice } = manager();
    await voice.join("channel1");

    await voice.leave("channel1");

    expect(voice.get("channel1")).toBeUndefined();
    expect(voice.cache.size).toBe(0);
  });

  it("leaves every call when the client logs out", async () => {
    const { voice, created } = manager();
    await voice.join("channel1");
    await voice.join("channel2");

    client._endSession();
    await vi.waitFor(() => expect(voice.cache.size).toBe(0));

    expect(created.every((connection) => connection.disconnect.mock.calls.length === 1)).toBe(true);
  });

  it("reports errors only when someone listens", () => {
    const connection = new FakeConnection("channel1", null);
    expect(() => (connection as any).reportError(new Error("boom"))).not.toThrow();

    const onError = vi.fn();
    connection.on("error", onError);
    (connection as any).reportError("text");
    expect(onError.mock.calls[0]![0]).toBeInstanceOf(Error);
  });
});
