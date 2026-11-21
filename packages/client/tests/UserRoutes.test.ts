import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { monotonicFactory } from "ulid";
import { Bot, Client, DMChannel, GroupChannel, Message, Server, User } from "../src";

const id = monotonicFactory();
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
const self = id();

const rawUser = (_id = id(), extra: Record<string, unknown> = {}) => ({
  _id,
  username: `user${_id.slice(-5)}`,
  discriminator: "0001",
  ...extra,
});
const rawBot = (_id = id(), extra: Record<string, unknown> = {}) => ({
  _id,
  owner: self,
  token: "bot-token",
  public: false,
  ...extra,
});

beforeEach(() => {
  client = new Client({ apiURL: API });
  client.rest.setToken("user-token", "user");
});

afterEach(() => {
  client.rest.destroy();
  vi.unstubAllGlobals();
});

describe("message search", () => {
  it("sends every option in the body and caches the results with their users", async () => {
    const channel = client.channels._add({
      _id: id(),
      channel_type: "Group",
      name: "G",
      owner: self,
      recipients: [self],
    } as any);
    const author = rawUser();
    const message = { _id: id(), channel: channel.id, author: author._id, content: "meeting notes" };
    const before = id();
    const calls = mockApi({
      [`POST /channels/${channel.id}/search`]: () => ({ messages: [message], users: [author] }),
    });

    const results = await channel.messages.search({
      query: "meeting",
      limit: 10,
      before,
      sort: "Latest",
      includeUsers: true,
    });

    expect(calls[0]!.search).toBe("");
    expect(calls[0]!.body).toEqual({ query: "meeting", limit: 10, before, sort: "Latest", include_users: true });
    expect(results.get(message._id)).toBeInstanceOf(Message);
    expect(client.users.cache.has(author._id)).toBe(true);
  });
});

describe("reports", () => {
  it("message, server and user reports send the right content", async () => {
    const calls = mockApi({ "POST /safety/report": () => undefined });
    const message = new Message(client, { _id: id(), channel: id(), author: id() } as any);
    const server = client.servers._add({
      _id: id(),
      owner: id(),
      name: "S",
      channels: [],
      default_permissions: 0,
    } as any);
    const user = client.users._add(rawUser() as any);

    await message.report("SpamAbuse", { context: "Same link everywhere" });
    await server.report("ScamsFraud");
    await user.report("Impersonation", { message });

    expect(calls.map((c) => c.body)).toEqual([
      {
        content: { type: "Message", id: message.id, report_reason: "SpamAbuse" },
        additional_context: "Same link everywhere",
      },
      { content: { type: "Server", id: server.id, report_reason: "ScamsFraud" }, additional_context: "" },
      {
        content: { type: "User", id: user.id, report_reason: "Impersonation", message_id: message.id },
        additional_context: "",
      },
    ]);
    expect(server).toBeInstanceOf(Server);
    expect(user).toBeInstanceOf(User);
  });
});

describe("stopRinging()", () => {
  it("works in DMs and groups", async () => {
    const target = id();
    const dm = client.channels._add({
      _id: id(),
      channel_type: "DirectMessage",
      active: true,
      recipients: [self, target],
    } as any) as DMChannel;
    const group = client.channels._add({
      _id: id(),
      channel_type: "Group",
      name: "G",
      owner: self,
      recipients: [self, target],
    } as any) as GroupChannel;
    const calls = mockApi({
      [`PUT /channels/${dm.id}/end_ring/${target}`]: () => undefined,
      [`PUT /channels/${group.id}/end_ring/${target}`]: () => undefined,
    });

    await dm.stopRinging(target);
    await group.stopRinging(target);

    expect(calls.map((c) => c.path)).toEqual([
      `/channels/${dm.id}/end_ring/${target}`,
      `/channels/${group.id}/end_ring/${target}`,
    ]);
  });
});

describe("push notifications", () => {
  it("subscribePush() accepts a browser PushSubscription", async () => {
    const calls = mockApi({ "POST /push/subscribe": () => undefined, "POST /push/unsubscribe": () => undefined });
    const subscription = {
      toJSON: () => ({ endpoint: "https://push.example/1", keys: { p256dh: "key", auth: "secret" } }),
    };

    await client.auth.subscribePush(subscription);
    await client.auth.subscribePush({ endpoint: "https://push.example/2", p256dh: "k2", auth: "s2" });
    await client.auth.unsubscribePush();

    expect(calls.map((c) => c.body)).toEqual([
      { endpoint: "https://push.example/1", p256dh: "key", auth: "secret" },
      { endpoint: "https://push.example/2", p256dh: "k2", auth: "s2" },
      {},
    ]);
  });

  it("subscribePush() rejects a subscription without keys", async () => {
    await expect(client.auth.subscribePush({ toJSON: () => ({ endpoint: "https://push.example" }) })).rejects.toThrow(
      TypeError,
    );
  });

  it("fetchVapidKey() reads the instance config", async () => {
    mockApi({ "GET /": () => ({ vapid: "vapid-key" }) });

    expect(await client.auth.fetchVapidKey()).toBe("vapid-key");
  });
});

describe("bots", () => {
  it("create() caches the bot and its user", async () => {
    const botId = id();
    const calls = mockApi({
      "POST /bots/create": () => ({ ...rawBot(botId), user: rawUser(botId, { bot: { owner: self } }) }),
    });

    const bot = await client.bots.create("my-bot");

    expect(calls[0]!.body).toEqual({ name: "my-bot" });
    expect(bot).toBeInstanceOf(Bot);
    expect(bot.token).toBe("bot-token");
    expect(bot.user?.id).toBe(botId);
    expect(client.bots.cache.get(botId)).toBe(bot);
  });

  it("fetch() and fetchOwned()", async () => {
    const a = rawBot();
    const b = rawBot();
    mockApi({
      [`GET /bots/${a._id}`]: () => ({ bot: a, user: rawUser(a._id) }),
      "GET /bots/@me": () => ({ bots: [a, b], users: [rawUser(a._id), rawUser(b._id)] }),
    });

    expect((await client.bots.fetch(a._id)).id).toBe(a._id);
    const owned = await client.bots.fetchOwned();
    expect([...owned.keys()]).toEqual([a._id, b._id]);
    expect(client.users.cache.has(b._id)).toBe(true);
  });

  it("edit() maps options, and resetToken() returns the new token", async () => {
    const raw = rawBot(id(), { interactions_url: "https://example.com" });
    const bot = client.bots._add(raw as any);
    const calls = mockApi({
      [`PATCH /bots/${raw._id}`]: (init) => {
        const body = JSON.parse(init.body as string);
        return {
          ...raw,
          interactions_url: undefined,
          token: body.remove?.includes("Token") ? "new-token" : raw.token,
          public: body.public ?? raw.public,
          user: rawUser(raw._id),
        };
      },
    });

    await bot.edit({ public: true, defaultPermissions: ["SendMessage"], interactionsUrl: null });
    expect(calls[0]!.body).toEqual({
      public: true,
      default_permissions: expect.any(Number),
      remove: ["InteractionsURL"],
    });
    expect(bot.public).toBe(true);
    expect(bot.interactionsUrl).toBeNull();

    expect(await bot.resetToken()).toBe("new-token");
    expect(calls[1]!.body).toEqual({ remove: ["Token"] });
    expect(bot.token).toBe("new-token");
  });

  it("delete() removes it from the cache", async () => {
    const bot = client.bots._add(rawBot() as any);
    mockApi({ [`DELETE /bots/${bot.id}`]: () => undefined });

    await bot.delete();

    expect(client.bots.cache.has(bot.id)).toBe(false);
  });

  it("inviteToServer() sends permissions as a query, inviteToGroup() sends the group", async () => {
    const bot = client.bots._add(rawBot() as any);
    const calls = mockApi({ [`POST /bots/${bot.id}/invite`]: () => undefined });

    await bot.inviteToServer("server-id", ["SendMessage"]);
    await bot.inviteToGroup("group-id");

    expect(calls[0]!.body).toEqual({ server: "server-id" });
    expect(calls[0]!.search).toMatch(/^\?permissions=\d+$/);
    expect(calls[1]!.body).toEqual({ group: "group-id" });
    expect(calls[1]!.search).toBe("");
  });

  it("fetchPublic() maps the public details", async () => {
    mockApi({
      "GET /bots/b1/invite": () => ({ _id: "b1", username: "helper", description: "Helps", default_permissions: 4 }),
    });

    expect(await client.bots.fetchPublic("b1")).toEqual({
      id: "b1",
      username: "helper",
      avatarId: null,
      description: "Helps",
      termsOfServiceUrl: null,
      privacyPolicyUrl: null,
      defaultPermissions: 4n,
    });
  });

  it("rejects for bots", async () => {
    client.rest.setToken("bot-token", "bot");

    await expect(client.bots.create("x")).rejects.toThrow("USER_ONLY: bots.create()");
    await expect(client.auth.subscribePush({ endpoint: "e", p256dh: "p", auth: "a" })).rejects.toThrow("USER_ONLY");
  });
});
