import { describe, it, expect, vi, afterEach } from "vitest";
import { Client, StoatAPIError } from "../src";

function setup() {
  const client = new Client();
  client.rest.setBaseURL("https://api.example");
  client.rest.setToken("token");
  return client;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RESTManager", () => {
  it("passes an abort signal to every request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const client = setup();
    await client.rest.get("/users/@me" as any);

    expect(fetchMock.mock.calls[0]![1].signal).toBeInstanceOf(AbortSignal);
    client.rest.destroy();
  });

  it("gives up after repeated 429 responses", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => new Response(JSON.stringify({ retry_after: 1 }), { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);

    const client = setup();
    await expect(client.rest.get("/users/@me" as any)).rejects.toBeInstanceOf(StoatAPIError);

    expect(fetchMock.mock.calls.length).toBeGreaterThan(1);
    expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(10);
    client.rest.destroy();
  });
});
