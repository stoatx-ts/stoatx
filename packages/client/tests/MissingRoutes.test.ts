import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { monotonicFactory } from "ulid";
import { Bot, Client, Emoji, GroupChannel, Server, ServerInvite, TextChannel, Webhook } from "../src";

const id = monotonicFactory();
const API = "https://api.example";

type Route = (init: RequestInit, url: URL) => unknown;
type Call = { method: string; path: string; search: string; headers: Record<string, string>; body: any };

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
        path: decodeURIComponent(url.pathname),
        search: url.search,
        headers: (init.headers ?? {}) as Record<string, string>,
        body: typeof init.body === "string" ? JSON.parse(init.body) : undefined,
      });
      const handler = routes[`${method} ${decodeURIComponent(url.pathname)}`];
      if (!handler) return new Response(JSON.stringify({ type: "NotFound" }), { status: 404 });
      const result = handler(init, url);
      return result === undefined ? new Response(null, { status: 204 }) : new Response(JSON.stringify(result));
    }),
  );
  return calls;
}

let client: Client;
const self = id();

function dispatch(payload: unknown) {
  (client.gateway as any).handleMessage(JSON.stringify(payload));
}

const rawServer = (extra: Record<string, unknown> = {}) => ({
  _id: id(),
  owner: self,
  name: "Server",
  channels: [],
  default_permissions: 0,
  ...extra,
});
const rawTextChannel = (server: string) => ({ _id: id(), channel_type: "TextChannel", server, name: "general" });
const rawGroup = () => ({ _id: id(), channel_type: "Group", name: "Group", owner: self, recipients: [self] });
const rawState = (userId = id(), extra: Record<string, unknown> = {}) => ({
  id: userId,
  joined_at: "2026-11-21T10:00:00.000Z",
  is_receiving: true,
  is_publishing: true,
  screensharing: false,
  camera: false,
  ...extra,
});

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
});

describe("invites", () => {
  it("channel.createInvite() sends the limits and caches the invite on the server", async () => {
    const server = client.servers._add(rawServer() as any);
    const channel = client.channels._add(rawTextChannel(server.id) as any) as TextChannel;
    const expiresAt = new Date("2026-11-22T00:00:00.000Z");
    const calls = mockApi({
      [`POST /channels/${channel.id}/invites`]: () => ({
        type: "Server",
        _id: "abc123",
        server: server.id,
        creator: self,
        channel: channel.id,
        uses: 0,
        max_uses: 10,
        expires: expiresAt.toISOString(),
      }),
    });

    const invite = await channel.createInvite({ maxUses: 10, expiresAt });

    expect(calls[0]!.body).toEqual({ max_uses: 10, expires: "2026-11-22T00:00:00.000Z" });
    expect(invite).toBeInstanceOf(ServerInvite);
    expect(invite).toMatchObject({ code: "abc123", type: "Server", serverId: server.id, uses: 0, maxUses: 10 });
    expect(invite.expiresAt).toEqual(expiresAt);
    expect(server.invites.cache.get("abc123")).toBe(invite);
  });

  it("group.createInvite() returns a group invite", async () => {
    const group = client.channels._add(rawGroup() as any) as GroupChannel;
    const calls = mockApi({
      [`POST /channels/${group.id}/invites`]: () => ({
        type: "Group",
        _id: "grp1",
        creator: self,
        channel: group.id,
        uses: 0,
      }),
    });

    const invite = await group.createInvite();

    expect(calls[0]!.body).toEqual({});
    expect(invite).toMatchObject({ type: "Group", serverId: null, maxUses: null, expiresAt: null });
  });

  it("invite.delete() deletes it and removes it from the server's cache", async () => {
    const server = client.servers._add(rawServer() as any);
    const invite = server.invites._add({
      type: "Server",
      _id: "abc123",
      server: server.id,
      creator: self,
      channel: id(),
      uses: 3,
    } as any);
    const calls = mockApi({ "DELETE /invites/abc123": () => undefined });

    await invite.delete();

    expect(calls[0]!.method).toBe("DELETE");
    expect(server.invites.cache.has("abc123")).toBe(false);
  });
});

describe("servers", () => {
  it("setDefaultPermissions() sends the bitfield and updates the server", async () => {
    const server = client.servers._add(rawServer() as any);
    const calls = mockApi({
      [`PUT /servers/${server.id}/permissions/default`]: (init) => ({
        ...rawServer({ _id: server.id }),
        default_permissions: JSON.parse(init.body as string).permissions,
      }),
    });

    const returned = await server.setDefaultPermissions(["ViewChannel", "SendMessage"]);

    expect(typeof calls[0]!.body.permissions).toBe("number");
    expect(returned).toBe(server);
    expect(server.defaultPermissions).toBe(BigInt(calls[0]!.body.permissions));
  });

  it("emojis.fetchAll() caches the server's emojis", async () => {
    const server = client.servers._add(rawServer() as any);
    const emojiId = id();
    mockApi({
      [`GET /servers/${server.id}/emojis`]: () => [
        { _id: emojiId, parent: { type: "Server", id: server.id }, creator_id: self, name: "wave" },
      ],
    });

    const emojis = await server.emojis.fetchAll();

    expect(emojis.get(emojiId)).toBeInstanceOf(Emoji);
    expect(server.emojis.cache.has(emojiId)).toBe(true);
  });

  it("emojis.fetchAll() throws outside a server", async () => {
    await expect(client.emojis.fetchAll()).rejects.toThrow("SERVER_ONLY");
  });
});

describe("Discover", () => {
  it("maps pending and decided requests for servers and bots", async () => {
    const server = client.servers._add(rawServer() as any);
    const bot = client.bots._add({ _id: id(), owner: self, token: "t", public: true } as any) as Bot;
    const calls = mockApi({
      [`PUT /servers/${server.id}/discover`]: () => undefined,
      [`GET /servers/${server.id}/discover`]: () => ({ type: "Server", id: server.id, status: "Pending" }),
      [`DELETE /servers/${server.id}/discover`]: () => undefined,
      [`GET /bots/${bot.id}/discover`]: () => ({ type: "Bot", id: bot.id, status: { Denied: "Not enough info" } }),
      [`PUT /bots/${bot.id}/discover`]: () => undefined,
    });

    await server.requestDiscover();
    expect(await server.fetchDiscoverRequest()).toEqual({
      type: "Server",
      id: server.id,
      status: "Pending",
      reason: null,
    });
    await server.cancelDiscoverRequest();
    await bot.requestDiscover();
    expect(await bot.fetchDiscoverRequest()).toEqual({
      type: "Bot",
      id: bot.id,
      status: "Denied",
      reason: "Not enough info",
    });
    expect(calls.map((c) => c.method)).toEqual(["PUT", "GET", "DELETE", "PUT", "GET"]);
    expect(server).toBeInstanceOf(Server);
  });
});

describe("users", () => {
  it("fetchFlags() updates the user", async () => {
    const user = client.users._add({ _id: id(), username: "a", discriminator: "0001" } as any);
    mockApi({ [`GET /users/${user.id}/flags`]: () => ({ flags: 4 }) });

    expect(await user.fetchFlags()).toBe(4);
    expect(user.flags).toBe(4);
  });

  it("defaultAvatarURL and displayAvatarURL", () => {
    const user = client.users._add({ _id: id(), username: "a", discriminator: "0001" } as any);

    expect(user.defaultAvatarURL).toBe(`${API}/users/${user.id}/default_avatar`);
    expect(user.displayAvatarURL).toBe(user.defaultAvatarURL);
  });
});

describe("webhook messages", () => {
  function webhook(token: string | null = "hook-token") {
    return new Webhook(client, {
      id: "w1",
      name: "Hook",
      channel_id: id(),
      creator_id: self,
      permissions: 0,
      token,
    } as any);
  }

  it("editMessage() and deleteMessage() use the token route", async () => {
    const messageId = id();
    const calls = mockApi({
      [`PATCH /webhooks/w1/hook-token/${messageId}`]: () => ({
        _id: messageId,
        channel: id(),
        author: "w1",
        content: "edited",
      }),
      [`DELETE /webhooks/w1/hook-token/${messageId}`]: () => undefined,
    });
    const hook = webhook();

    const edited = await hook.editMessage(messageId, { content: "edited", embeds: [] });
    await hook.deleteMessage(messageId);

    expect(calls[0]!.body).toEqual({ content: "edited", embeds: [] });
    expect(edited.content).toBe("edited");
    expect(calls[1]!.method).toBe("DELETE");
  });

  it("sendGitHubEvent() sends the event header and keeps the payload in the body", async () => {
    const calls = mockApi({ "POST /webhooks/w1/hook-token/github": () => undefined });

    await webhook().sendGitHubEvent("push", { type: "x", limit: 1, ref: "refs/heads/main" });

    expect(calls[0]!.headers["X-GitHub-Event"]).toBe("push");
    expect(calls[0]!.search).toBe("");
    expect(calls[0]!.body).toEqual({ type: "x", limit: 1, ref: "refs/heads/main" });
  });

  it("needs a token", async () => {
    await expect(webhook(null).deleteMessage("m")).rejects.toThrow("WEBHOOK_TOKEN_MISSING");
  });
});

describe("voice states", () => {
  it("loads voice_states from Ready and exposes them on channels", () => {
    const group = client.channels._add(rawGroup() as any) as GroupChannel;
    const userId = id();

    dispatch({ type: "Ready", voice_states: [{ id: group.id, participants: [rawState(userId)] }] });

    const state = group.voiceStates.get(userId)!;
    expect(state.channelId).toBe(group.id);
    expect(state.joinedAt).toEqual(new Date("2026-11-21T10:00:00.000Z"));
    expect(client.voiceStates.getUser(userId)).toBe(state);
  });

  it("tracks joins, updates, moves and leaves", () => {
    const join = vi.fn();
    const update = vi.fn();
    const move = vi.fn();
    const leave = vi.fn();
    client.on("voiceChannelJoin", join).on("voiceStateUpdate", update).on("voiceChannelMove", move);
    client.on("voiceChannelLeave", leave);
    const userId = id();

    dispatch({ type: "VoiceChannelJoin", id: "c1", state: rawState(userId) });
    expect(join.mock.calls[0]![0].userId).toBe(userId);

    dispatch({ type: "UserVoiceStateUpdate", id: userId, channel_id: "c1", data: { is_publishing: false } });
    const [oldState, newState] = update.mock.calls[0]!;
    expect(oldState.isPublishing).toBe(true);
    expect(newState.isPublishing).toBe(false);
    expect(client.voiceStates.get("c1").get(userId)).toBe(newState);

    dispatch({ type: "VoiceChannelMove", user: userId, from: "c1", to: "c2", state: rawState(userId) });
    expect(move).toHaveBeenCalledWith(expect.objectContaining({ channelId: "c2" }), "c1");
    expect(client.voiceStates.cache.has("c1")).toBe(false);

    dispatch({ type: "VoiceChannelLeave", id: "c2", user: userId });
    expect(leave.mock.calls[0]![0].userId).toBe(userId);
    expect(client.voiceStates.getUser(userId)).toBeUndefined();

    dispatch({ type: "VoiceChannelLeave", id: "c3", user: "unknown" });
    expect(leave.mock.calls[1]![0]).toEqual({ channelId: "c3", userId: "unknown" });
  });

  it("adds a new server's calls and drops calls of deleted channels and servers", () => {
    const server = rawServer();
    const channel = rawTextChannel(server._id);
    const other = rawTextChannel(server._id);

    dispatch({
      type: "ServerCreate",
      id: server._id,
      server,
      channels: [channel, other],
      emojis: [],
      voice_states: [
        { id: channel._id, participants: [rawState()] },
        { id: other._id, participants: [rawState()] },
      ],
    });
    expect(client.voiceStates.cache.size).toBe(2);

    dispatch({ type: "ChannelDelete", id: channel._id });
    expect(client.voiceStates.cache.has(channel._id)).toBe(false);

    dispatch({ type: "ServerDelete", id: server._id });
    expect(client.voiceStates.cache.size).toBe(0);
  });

  it("emits call updates and move requests", () => {
    const call = vi.fn();
    const moveRequest = vi.fn();
    client.on("voiceCallUpdate", call).on("voiceMoveRequest", moveRequest);

    dispatch({
      type: "VoiceCallUpdate",
      initiator_id: "u1",
      channel_id: "c1",
      started_at: "2026-11-21T10:00:00.000Z",
      ended: false,
    });
    dispatch({ type: "UserMoveVoiceChannel", node: "eu", from: "c1", to: "c2", token: "tok" });

    expect(call).toHaveBeenCalledWith({
      channelId: "c1",
      initiatorId: "u1",
      startedAt: new Date("2026-11-21T10:00:00.000Z"),
      ended: false,
    });
    expect(moveRequest).toHaveBeenCalledWith({ fromChannelId: "c1", toChannelId: "c2", node: "eu", token: "tok" });
  });

  it("is cleared when the session ends", () => {
    dispatch({ type: "VoiceChannelJoin", id: "c1", state: rawState() });

    client._endSession();

    expect(client.voiceStates.cache.size).toBe(0);
  });
});
