import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Client } from "../src";

const API = "https://api.example";

type Route = (init: RequestInit, url: URL) => unknown;
type Call = { method: string; path: string; search: string; body: any };

/** Stubs fetch with handlers keyed by "METHOD /path" and records every request. */
function mockApi(routes: Record<string, Route>) {
  const calls: Call[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init: RequestInit = {}) => {
      const url = new URL(input);
      const method = (init.method ?? "GET").toUpperCase();
      calls.push({
        method,
        path: url.pathname,
        search: url.search,
        body: typeof init.body === "string" ? JSON.parse(init.body) : undefined,
      });
      const handler = routes[`${method} ${url.pathname}`];
      if (!handler) return new Response(JSON.stringify({ type: "NotFound" }), { status: 404 });
      const result = handler(init, url);
      return result === undefined ? new Response(null, { status: 204 }) : new Response(JSON.stringify(result));
    }),
  );
  return calls;
}

let client: Client;

function dispatch(payload: unknown) {
  (client.gateway as any).handleMessage(JSON.stringify(payload));
}

beforeEach(() => {
  client = new Client({ apiURL: API });
  client.rest.setToken("user-token", "user");
  client.on("error", (error) => {
    throw error;
  });
});

afterEach(() => {
  client.rest.destroy();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("settings", () => {
  it("loads user_settings from Ready", () => {
    dispatch({ type: "Ready", user_settings: { appearance: [100, '{"theme":"dark"}'] } });

    expect(client.settings.cache.get("appearance")).toEqual({ value: '{"theme":"dark"}', updatedAt: 100 });
    expect(client.settings.getJSON("appearance")).toEqual({ theme: "dark" });
  });

  it("getJSON() returns undefined for missing or invalid JSON", () => {
    dispatch({ type: "Ready", user_settings: { broken: [1, "{not json"] } });

    expect(client.settings.get("broken")).toBe("{not json");
    expect(client.settings.getJSON("broken")).toBeUndefined();
    expect(client.settings.getJSON("missing")).toBeUndefined();
  });

  it("fetch() loads the requested keys", async () => {
    const calls = mockApi({ "POST /sync/settings/fetch": () => ({ locale: [5, '"en"'] }) });

    const result = await client.settings.fetch(["locale", "missing"]);

    expect(calls[0]!.body).toEqual({ keys: ["locale", "missing"] });
    expect([...result.keys()]).toEqual(["locale"]);
    expect(client.settings.getJSON("locale")).toBe("en");
  });

  it("set() stringifies values, sends the timestamp as a query and keeps every key in the body", async () => {
    vi.useFakeTimers({ now: 1_000 });
    const calls = mockApi({ "POST /sync/settings/set": () => undefined });

    await client.settings.set({ appearance: { theme: "light" }, raw: "text", limit: 5 });

    expect(calls[0]!.search).toBe("?timestamp=1000");
    expect(calls[0]!.body).toEqual({ appearance: '{"theme":"light"}', raw: "text", limit: "5" });
    expect(client.settings.cache.get("appearance")).toEqual({ value: '{"theme":"light"}', updatedAt: 1_000 });
  });

  it("emits settingsUpdate for changes from other devices, but not for its own echo", async () => {
    vi.useFakeTimers({ now: 1_000 });
    mockApi({ "POST /sync/settings/set": () => undefined });
    const onUpdate = vi.fn();
    client.on("settingsUpdate", onUpdate);

    await client.settings.set({ appearance: { theme: "light" } });
    dispatch({ type: "UserSettingsUpdate", id: "me", update: { appearance: [1_000, '{"theme":"light"}'] } });
    expect(onUpdate).not.toHaveBeenCalled();

    dispatch({ type: "UserSettingsUpdate", id: "me", update: { appearance: [2_000, '{"theme":"dark"}'] } });
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect([...onUpdate.mock.calls[0]![0].keys()]).toEqual(["appearance"]);
    expect(client.settings.getJSON("appearance")).toEqual({ theme: "dark" });
  });

  it("ignores updates older than the cached value", () => {
    dispatch({ type: "Ready", user_settings: { appearance: [500, "new"] } });

    dispatch({ type: "UserSettingsUpdate", id: "me", update: { appearance: [400, "old"] } });

    expect(client.settings.get("appearance")).toBe("new");
  });

  it("is cleared when the session ends", () => {
    dispatch({ type: "Ready", user_settings: { appearance: [1, "x"] } });

    client._endSession();

    expect(client.settings.cache.size).toBe(0);
  });

  it("fetch() and set() reject for bots", async () => {
    client.rest.setToken("bot-token", "bot");

    await expect(client.settings.fetch(["a"])).rejects.toThrow("USER_ONLY: settings.fetch()");
    await expect(client.settings.set({ a: 1 })).rejects.toThrow("USER_ONLY: settings.set()");
  });
});
