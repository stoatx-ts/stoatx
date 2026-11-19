import { describe, it, expect, vi, afterEach } from "vitest";
import { Client, OnboardingRequiredError } from "../src";

const API = "https://api.example";
const USER_ID = "01HZY8J0Q5M3G7X2V9K4T6N8RB";

type Route = (init: RequestInit, url: URL) => unknown;

/** Stubs fetch with handlers keyed by "METHOD /path" and records every request. */
function mockApi(routes: Record<string, Route>) {
  const calls: { method: string; path: string; search: string; headers: Record<string, string>; body: any }[] = [];
  const fetchMock = vi.fn(async (input: string, init: RequestInit = {}) => {
    const url = new URL(input);
    const method = (init.method ?? "GET").toUpperCase();
    const key = `${method} ${url.pathname}`;
    calls.push({
      method,
      path: url.pathname,
      search: url.search,
      headers: (init.headers ?? {}) as Record<string, string>,
      body: typeof init.body === "string" ? JSON.parse(init.body) : undefined,
    });
    const handler = routes[key];
    if (!handler) return new Response(JSON.stringify({ type: "NotFound" }), { status: 404 });
    const result = handler(init, url);
    return result === undefined ? new Response(null, { status: 204 }) : new Response(JSON.stringify(result));
  });
  vi.stubGlobal("fetch", fetchMock);
  return calls;
}

const config = () => ({ ws: "wss://events.example", features: { autumn: { url: "https://cdn.example" } } });
const session = {
  result: "Success",
  _id: "sess1",
  user_id: USER_ID,
  token: "user-token",
  name: "Tests",
  last_seen: "",
};

function makeClient() {
  const client = new Client({ apiURL: API });
  const connect = vi.spyOn(client.gateway, "connect").mockResolvedValue(undefined);
  return { client, connect };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("auth headers", () => {
  it("sends X-Bot-Token for bot logins", async () => {
    const calls = mockApi({ "GET /": config, "GET /users/@me": () => ({}) });
    const { client } = makeClient();

    await client.login("bot-token");
    await client.rest.get("/users/@me");

    const req = calls.find((c) => c.path === "/users/@me")!;
    expect(req.headers["X-Bot-Token"]).toBe("bot-token");
    expect(req.headers["X-Session-Token"]).toBeUndefined();
    client.rest.destroy();
  });

  it("sends X-Session-Token for user logins", async () => {
    const calls = mockApi({
      "GET /": config,
      "GET /onboard/hello": () => ({ onboarding: false }),
      "GET /users/@me": () => ({}),
    });
    const { client, connect } = makeClient();

    await client.login({ token: "user-token", type: "user" });
    await client.rest.get("/users/@me");

    const req = calls.find((c) => c.path === "/users/@me")!;
    expect(req.headers["X-Session-Token"]).toBe("user-token");
    expect(req.headers["X-Bot-Token"]).toBeUndefined();
    expect(connect).toHaveBeenCalledWith("user-token");
    client.rest.destroy();
  });

  it("does not check onboarding for bots", async () => {
    const calls = mockApi({ "GET /": config });
    const { client } = makeClient();

    await client.login("bot-token");

    expect(calls.some((c) => c.path === "/onboard/hello")).toBe(false);
    client.rest.destroy();
  });
});

describe("createSession", () => {
  it("logs in without a token and maps a successful session", async () => {
    const calls = mockApi({ "POST /auth/session/login": () => session });
    const { client } = makeClient();

    const result = await client.auth.createSession({ email: "a@b.c", password: "pw", friendlyName: "Tests" });

    expect(result).toEqual({
      result: "Success",
      session: { type: "user", id: "sess1", userId: USER_ID, token: "user-token", name: "Tests" },
    });
    expect(calls[0]!.body).toEqual({ email: "a@b.c", password: "pw", friendly_name: "Tests" });
    expect(calls[0]!.headers["X-Bot-Token"]).toBeUndefined();
    expect(calls[0]!.headers["X-Session-Token"]).toBeUndefined();
    client.rest.destroy();
  });

  it("returns the MFA challenge and sends the MFA response in API format", async () => {
    const calls = mockApi({
      "POST /auth/session/login": (init) =>
        JSON.parse(init.body as string).mfa_ticket
          ? session
          : { result: "MFA", ticket: "tkt", allowed_methods: ["Totp", "Recovery"] },
    });
    const { client } = makeClient();

    const first = await client.auth.createSession({ email: "a@b.c", password: "pw" });
    expect(first).toEqual({ result: "MFA", ticket: "tkt", allowedMethods: ["Totp", "Recovery"] });

    const second = await client.auth.createSession({ mfaTicket: "tkt", mfaResponse: { totpCode: "123456" } });
    expect(second.result).toBe("Success");
    expect(calls[1]!.body).toEqual({ mfa_ticket: "tkt", mfa_response: { totp_code: "123456" } });

    await client.auth.createSession({ mfaTicket: "tkt", mfaResponse: { recoveryCode: "abcd-efgh" } });
    expect(calls[2]!.body.mfa_response).toEqual({ recovery_code: "abcd-efgh" });
    client.rest.destroy();
  });

  it("reports disabled accounts", async () => {
    mockApi({ "POST /auth/session/login": () => ({ result: "Disabled", user_id: USER_ID }) });
    const { client } = makeClient();

    expect(await client.auth.createSession({ email: "a@b.c", password: "pw" })).toEqual({
      result: "Disabled",
      userId: USER_ID,
    });
    client.rest.destroy();
  });
});

describe("loginWithCredentials", () => {
  it("connects with the new session", async () => {
    mockApi({
      "POST /auth/session/login": () => session,
      "GET /": config,
      "GET /onboard/hello": () => ({ onboarding: false }),
    });
    const { client, connect } = makeClient();

    const result = await client.loginWithCredentials({ email: "a@b.c", password: "pw" });

    expect(result.result).toBe("Success");
    expect(client.rest.tokenType).toBe("user");
    expect(connect).toHaveBeenCalledWith("user-token");
    client.rest.destroy();
  });

  it("does not connect when MFA is required", async () => {
    mockApi({ "POST /auth/session/login": () => ({ result: "MFA", ticket: "tkt", allowed_methods: ["Totp"] }) });
    const { client, connect } = makeClient();

    const result = await client.loginWithCredentials({ email: "a@b.c", password: "pw" });

    expect(result.result).toBe("MFA");
    expect(connect).not.toHaveBeenCalled();
    client.rest.destroy();
  });

  it("returns the session for onboarding instead of connecting", async () => {
    const calls = mockApi({
      "POST /auth/session/login": () => session,
      "GET /": config,
      "GET /onboard/hello": () => ({ onboarding: true }),
      "POST /onboard/complete": () => ({ _id: USER_ID, username: "newname", discriminator: "0001" }),
    });
    const { client, connect } = makeClient();

    const result = await client.loginWithCredentials({ email: "a@b.c", password: "pw" });

    expect(result.result).toBe("Onboarding");
    expect(connect).not.toHaveBeenCalled();

    // The token is kept, so onboarding can be completed straight away.
    const user = await client.auth.completeOnboarding("newname");
    expect(user.username).toBe("newname");
    expect(calls.at(-1)!.headers["X-Session-Token"]).toBe("user-token");
    client.rest.destroy();
  });
});

describe("login with a user token", () => {
  it("throws OnboardingRequiredError for accounts without a username", async () => {
    mockApi({ "GET /": config, "GET /onboard/hello": () => ({ onboarding: true }) });
    const { client, connect } = makeClient();

    await expect(client.login({ token: "user-token", type: "user" })).rejects.toBeInstanceOf(OnboardingRequiredError);
    expect(connect).not.toHaveBeenCalled();
    expect(client.rest.tokenType).toBe("user");
    client.rest.destroy();
  });
});

describe("ending a session", () => {
  async function loggedIn(routes: Record<string, Route> = {}) {
    const calls = mockApi({ "GET /": config, "GET /onboard/hello": () => ({ onboarding: false }), ...routes });
    const { client } = makeClient();
    await client.login({ token: "user-token", type: "user" });
    client.users._add({ _id: USER_ID, username: "someone", discriminator: "0001" } as any);
    const disconnect = vi.spyOn(client.gateway, "disconnect");
    const onLogout = vi.fn();
    client.on("logout", onLogout);
    return { client, calls, disconnect, onLogout };
  }

  async function expectEnded(client: Client, disconnect: ReturnType<typeof vi.fn>, onLogout: ReturnType<typeof vi.fn>) {
    expect(disconnect).toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(client.users.cache.size).toBe(0);
    expect(client.user).toBeNull();
    await expect(client.auth.fetchSessions()).rejects.toThrow("USER_ONLY");
  }

  it("logout() ends the session on the server and locally", async () => {
    const { client, calls, disconnect, onLogout } = await loggedIn({ "POST /auth/session/logout": () => undefined });

    await client.auth.logout();

    expect(calls.at(-1)!.path).toBe("/auth/session/logout");
    await expectEnded(client, disconnect, onLogout);
    client.rest.destroy();
  });

  it("revokeAllSessions({ includeCurrent: true }) also ends this session", async () => {
    const { client, calls, disconnect, onLogout } = await loggedIn({ "DELETE /auth/session/all": () => undefined });

    await client.auth.revokeAllSessions({ includeCurrent: true });

    expect(calls.at(-1)!.search).toBe("?revoke_self=true");
    await expectEnded(client, disconnect, onLogout);
    client.rest.destroy();
  });

  it("revokeAllSessions() keeps this session", async () => {
    const { client, calls, disconnect, onLogout } = await loggedIn({ "DELETE /auth/session/all": () => undefined });

    await client.auth.revokeAllSessions();

    expect(calls.at(-1)!.search).toBe("?revoke_self=false");
    expect(disconnect).not.toHaveBeenCalled();
    expect(onLogout).not.toHaveBeenCalled();
    client.rest.destroy();
  });

  it("a gateway Logout event ends the session instead of reconnecting", async () => {
    const { client, disconnect, onLogout } = await loggedIn();

    (client.gateway as any).handleMessage(JSON.stringify({ type: "Logout" }));

    await expectEnded(client, disconnect, onLogout);
    client.rest.destroy();
  });
});

describe("user-only methods", () => {
  it("reject when logged in as a bot", async () => {
    mockApi({ "GET /": config });
    const { client } = makeClient();
    await client.login("bot-token");

    await expect(client.auth.logout()).rejects.toThrow("USER_ONLY");
    await expect(client.auth.fetchSessions()).rejects.toThrow("USER_ONLY");
    await expect(client.auth.completeOnboarding("name")).rejects.toThrow("USER_ONLY");
    client.rest.destroy();
  });
});
