import { describe, it, expect, vi } from "vitest";
import { Client } from "../src";

function dispatch(client: Client, payload: unknown) {
  const raw = Buffer.from(typeof payload === "string" ? payload : JSON.stringify(payload));
  (client.gateway as any).handleMessage(raw);
}

describe("GatewayManager", () => {
  it("drops malformed frames without throwing", () => {
    const client = new Client();
    const debug = vi.fn();
    client.on("debug", debug);

    expect(() => dispatch(client, "{not json")).not.toThrow();
    expect(debug).toHaveBeenCalledWith(expect.stringContaining("malformed gateway frame"));
  });

  it("reports handler failures instead of throwing out of the socket listener", () => {
    const client = new Client();
    const onError = vi.fn();
    client.on("error", onError);

    // A Message without a valid _id makes the Message constructor throw.
    expect(() => dispatch(client, { type: "Message", channel: "unknown" })).not.toThrow();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0].message).toContain('"Message"');
  });

  it("does not throw when no error listener is attached", () => {
    const client = new Client();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => dispatch(client, { type: "Message", channel: "unknown" })).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("cancels a pending reconnect on disconnect", () => {
    vi.useFakeTimers();
    try {
      const client = new Client();
      const gateway = client.gateway as any;
      const connect = vi.spyOn(gateway, "connect").mockResolvedValue(undefined);

      gateway.token = "token";
      gateway.reconnect();
      gateway.disconnect();
      vi.advanceTimersByTime(120_000);

      expect(connect).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  describe("connection URL", () => {
    /** Connects with a stubbed WebSocket and returns the URL it was opened with. */
    async function connectURL(type: "bot" | "user") {
      const urls: string[] = [];
      vi.stubGlobal(
        "WebSocket",
        class {
          constructor(url: string) {
            urls.push(url);
          }
          close() {}
        },
      );
      try {
        const client = new Client();
        client.rest.setToken("a token", type);
        await client.gateway.connect("a token");
        client.gateway.disconnect();
        return new URL(urls[0]!);
      } finally {
        vi.unstubAllGlobals();
      }
    }

    it("asks for the read state, and every other Ready field, for user sessions", async () => {
      const url = await connectURL("user");
      expect(url.searchParams.get("token")).toBe("a token");
      // Listing any field turns off the rest, so all of them must be listed.
      expect(url.searchParams.getAll("ready")).toEqual([
        "users",
        "servers",
        "channels",
        "members",
        "emojis",
        "voice_states",
        "channel_unreads",
        "policy_changes",
      ]);
    });

    it("uses the server's default Ready fields for bots", async () => {
      const url = await connectURL("bot");
      expect(url.searchParams.get("version")).toBe("1");
      expect(url.searchParams.has("ready")).toBe(false);
    });
  });
});
