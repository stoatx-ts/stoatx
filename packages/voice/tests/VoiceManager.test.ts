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
let joinBodies: unknown[];
let configCalls: number;
let configFails: boolean;

const config = {
  features: {
    livekit: { enabled: true, nodes: [{ name: "eu", lat: 50, lon: 8, public_url: "wss://eu.livekit.example" }] },
  },
};

beforeEach(() => {
  client = new Client({ apiURL: API });
  client.rest.setToken("user-token", "user");
  joinCalls = [];
  joinBodies = [];
  configCalls = 0;
  configFails = false;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init: RequestInit = {}) => {
      const path = new URL(input).pathname;
      if (path === "/") {
        configCalls++;
        if (configFails) return new Response(JSON.stringify({ type: "InternalError" }), { status: 500 });
        return new Response(JSON.stringify(config));
      }
      joinCalls.push(path);
      joinBodies.push(typeof init.body === "string" ? JSON.parse(init.body) : undefined);
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

  it("sends join options in API format", async () => {
    const { voice } = manager();

    await voice.join("channel1", { forceDisconnect: true, recipients: ["u1", "u2"], node: "eu" });
    await voice.join("channel2");

    expect(joinBodies).toEqual([{ force_disconnect: true, recipients: ["u1", "u2"], node: "eu" }, {}]);
  });

  it("fetchNodes() maps and caches the instance's voice nodes, retrying after a failure", async () => {
    const { voice } = manager();
    configFails = true;
    await expect(voice.fetchNodes()).rejects.toThrow();

    configFails = false;
    const nodes = await voice.fetchNodes();
    await voice.fetchNodes();

    expect(nodes).toEqual([{ name: "eu", url: "wss://eu.livekit.example", latitude: 50, longitude: 8 }]);
    expect(configCalls).toBe(2);
  });

  describe("server moves", () => {
    function move(extra: Partial<{ fromChannelId: string; node: string }> = {}) {
      client.emit("voiceMoveRequest", {
        fromChannelId: "channel1",
        toChannelId: "channel2",
        node: "eu",
        token: "move-token",
        ...extra,
      });
    }

    it("connects to the new call, carries state over and leaves the old one", async () => {
      const { voice, created } = manager();
      const previous = await voice.join("channel1");
      const takeOver = vi.spyOn(FakeConnection.prototype, "_takeOver");
      const onMove = vi.fn();
      previous.on("move", onMove);

      move();
      await vi.waitFor(() => expect(previous.disconnect).toHaveBeenCalled());

      const next = created[1]!;
      expect(next.connect).toHaveBeenCalledWith("wss://eu.livekit.example", "move-token");
      expect(takeOver).toHaveBeenCalledWith(previous);
      expect(onMove).toHaveBeenCalledWith(next);
      expect(voice.get("channel2")).toBe(next);
      expect(voice.get("channel1")).toBeUndefined();
    });

    it("reports an unknown node on the old connection and stays connected", async () => {
      const { voice } = manager();
      const previous = await voice.join("channel1");
      const onError = vi.fn();
      previous.on("error", onError);

      move({ node: "mars" });
      await vi.waitFor(() => expect(onError).toHaveBeenCalled());

      expect(onError.mock.calls[0]![0].message).toContain("VOICE_NODE_UNKNOWN");
      expect(previous.disconnect).not.toHaveBeenCalled();
      expect(voice.get("channel1")).toBe(previous);
    });

    it("ignores moves from calls the client isn't in", async () => {
      const { voice, created } = manager();

      move();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(created).toHaveLength(0);
      expect(voice.cache.size).toBe(0);
    });
  });
});
