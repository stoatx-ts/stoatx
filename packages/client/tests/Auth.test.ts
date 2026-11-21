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

describe("account routes without a session", () => {
  it("createAccount, resendVerification and password reset work before logging in", async () => {
    const calls = mockApi({
      "POST /auth/account/create": () => undefined,
      "POST /auth/account/reverify": () => undefined,
      "POST /auth/account/reset_password": () => undefined,
      "PATCH /auth/account/reset_password": () => undefined,
    });
    const { client } = makeClient();

    await client.auth.createAccount({ email: "a@b.c", password: "pw", invite: "inv" });
    await client.auth.resendVerification("a@b.c");
    await client.auth.sendPasswordReset("a@b.c", { captcha: "cap" });
    await client.auth.resetPassword("reset-token", "new-pw", { logoutAllSessions: true });

    expect(calls.map((c) => c.body)).toEqual([
      { email: "a@b.c", password: "pw", invite: "inv", captcha: null },
      { email: "a@b.c", captcha: null },
      { email: "a@b.c", captcha: "cap" },
      { token: "reset-token", password: "new-pw", remove_sessions: true },
    ]);
    for (const call of calls) expect(call.headers["X-Session-Token"]).toBeUndefined();
    client.rest.destroy();
  });

  it("verifyEmail returns the login ticket, which logs in without a password", async () => {
    const ticket = { _id: "t1", account_id: USER_ID, token: "login-ticket", validated: true, authorised: true };
    const calls = mockApi({
      "POST /auth/account/verify/abc%2F123": () => ({ ticket }),
      "POST /auth/session/login": () => session,
    });
    const { client } = makeClient();

    const result = await client.auth.verifyEmail("abc/123");
    expect(result).toEqual({ id: "t1", accountId: USER_ID, token: "login-ticket", validated: true, authorised: true });

    await client.auth.createSession({ mfaTicket: result!.token });
    expect(calls[1]!.body).toEqual({ mfa_ticket: "login-ticket" });
    client.rest.destroy();
  });

  it("verifyEmail returns null when there's no ticket", async () => {
    mockApi({ "POST /auth/account/verify/code": () => null });
    const { client } = makeClient();

    expect(await client.auth.verifyEmail("code")).toBeNull();
    client.rest.destroy();
  });

  it("confirmAccountDeletion works before logging in", async () => {
    const calls = mockApi({ "PUT /auth/account/delete": () => undefined });
    const { client } = makeClient();

    await client.auth.confirmAccountDeletion("del-token");

    expect(calls[0]!.body).toEqual({ token: "del-token" });
    client.rest.destroy();
  });
});

describe("account management", () => {
  async function loggedIn(routes: Record<string, Route>) {
    const calls = mockApi({ "GET /": config, "GET /onboard/hello": () => ({ onboarding: false }), ...routes });
    const { client } = makeClient();
    await client.login({ token: "user-token", type: "user" });
    return { client, calls };
  }

  it("fetchAccount maps the account", async () => {
    const { client } = await loggedIn({ "GET /auth/account/": () => ({ _id: USER_ID, email: "a@b.c" }) });

    expect(await client.auth.fetchAccount()).toEqual({ id: USER_ID, email: "a@b.c" });
    client.rest.destroy();
  });

  it("changePassword and changeEmail send the current password", async () => {
    const { client, calls } = await loggedIn({
      "PATCH /auth/account/change/password": () => undefined,
      "PATCH /auth/account/change/email": () => undefined,
    });

    await client.auth.changePassword("old", "new");
    await client.auth.changeEmail("old", "new@b.c");

    expect(calls.at(-2)!.body).toEqual({ current_password: "old", password: "new" });
    expect(calls.at(-1)!.body).toEqual({ current_password: "old", email: "new@b.c" });
    client.rest.destroy();
  });

  it("deleteAccount sends the MFA ticket and keeps the session", async () => {
    const { client, calls } = await loggedIn({ "POST /auth/account/delete": () => undefined });
    const onLogout = vi.fn();
    client.on("logout", onLogout);

    await client.auth.deleteAccount("mfa-ticket");

    expect(calls.at(-1)!.headers["X-MFA-Ticket"]).toBe("mfa-ticket");
    expect(calls.at(-1)!.headers["X-Session-Token"]).toBe("user-token");
    expect(onLogout).not.toHaveBeenCalled();
    client.rest.destroy();
  });

  it("disableAccount sends the MFA ticket and ends the session", async () => {
    const { client, calls } = await loggedIn({ "POST /auth/account/disable": () => undefined });
    const disconnect = vi.spyOn(client.gateway, "disconnect");
    const onLogout = vi.fn();
    client.on("logout", onLogout);

    await client.auth.disableAccount({
      id: "t1",
      accountId: USER_ID,
      token: "mfa-ticket",
      validated: true,
      authorised: false,
    });

    expect(calls.at(-1)!.headers["X-MFA-Ticket"]).toBe("mfa-ticket");
    expect(disconnect).toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalledTimes(1);
    client.rest.destroy();
  });
});

describe("MFA", () => {
  async function loggedIn(routes: Record<string, Route>) {
    const calls = mockApi({ "GET /": config, "GET /onboard/hello": () => ({ onboarding: false }), ...routes });
    const { client } = makeClient();
    await client.login({ token: "user-token", type: "user" });
    return { client, calls };
  }

  it("fetchStatus and fetchMethods", async () => {
    const { client } = await loggedIn({
      "GET /auth/mfa/": () => ({ totp_mfa: true, recovery_active: false, email_otp: false }),
      "GET /auth/mfa/methods": () => ["Totp", "Recovery"],
    });

    expect(await client.auth.mfa.fetchStatus()).toEqual({ totp: true, recoveryCodes: false });
    expect(await client.auth.mfa.fetchMethods()).toEqual(["Totp", "Recovery"]);
    client.rest.destroy();
  });

  it("createTicket sends the response in API format", async () => {
    const { client, calls } = await loggedIn({
      "PUT /auth/mfa/ticket": () => ({
        _id: "t1",
        account_id: USER_ID,
        token: "mfa-ticket",
        validated: true,
        authorised: false,
        last_totp_code: null,
      }),
    });

    const ticket = await client.auth.mfa.createTicket({ password: "pw" });

    expect(calls.at(-1)!.body).toEqual({ password: "pw" });
    expect(ticket).toEqual({ id: "t1", accountId: USER_ID, token: "mfa-ticket", validated: true, authorised: false });
    client.rest.destroy();
  });

  it("recovery codes and TOTP routes send the ticket", async () => {
    const { client, calls } = await loggedIn({
      "POST /auth/mfa/recovery": () => ["aaaa-bbbb"],
      "PATCH /auth/mfa/recovery": () => ["cccc-dddd"],
      "DELETE /auth/mfa/totp": () => undefined,
    });

    expect(await client.auth.mfa.fetchRecoveryCodes("t1")).toEqual(["aaaa-bbbb"]);
    expect(await client.auth.mfa.generateRecoveryCodes("t2")).toEqual(["cccc-dddd"]);
    await client.auth.mfa.disableTotp("t3");

    expect(calls.slice(-3).map((c) => c.headers["X-MFA-Ticket"])).toEqual(["t1", "t2", "t3"]);
    client.rest.destroy();
  });

  it("generateTotpSecret builds an otpauth URI, and enableTotp sends the code", async () => {
    const { client, calls } = await loggedIn({
      "POST /auth/mfa/totp": () => ({ secret: "JBSWY3DPEHPK3PXP" }),
      "PUT /auth/mfa/totp": () => undefined,
    });

    const { secret, uri } = await client.auth.mfa.generateTotpSecret("t1", { accountName: "a@b.c" });
    expect(secret).toBe("JBSWY3DPEHPK3PXP");
    expect(uri).toBe("otpauth://totp/Stoat%3Aa%40b.c?secret=JBSWY3DPEHPK3PXP&issuer=Stoat");

    await client.auth.mfa.enableTotp("123456");
    expect(calls.at(-1)!.body).toEqual({ totp_code: "123456" });
    client.rest.destroy();
  });

  it("rejects when logged in as a bot", async () => {
    mockApi({ "GET /": config });
    const { client } = makeClient();
    await client.login("bot-token");

    await expect(client.auth.mfa.fetchStatus()).rejects.toThrow("USER_ONLY: auth.mfa.fetchStatus()");
    await expect(client.auth.mfa.createTicket({ password: "pw" })).rejects.toThrow("USER_ONLY");
    await expect(client.auth.changePassword("a", "b")).rejects.toThrow("USER_ONLY");
    await expect(client.auth.deleteAccount("t")).rejects.toThrow("USER_ONLY");
    client.rest.destroy();
  });
});
