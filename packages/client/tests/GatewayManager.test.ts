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
});
