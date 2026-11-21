import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { monotonicFactory } from "ulid";
import { Client, ClientUser, GroupChannel, Server } from "../src";

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

const rawUser = (_id = id()) => ({ _id, username: `user${_id.slice(-5)}`, discriminator: "0001" });

function rawGroup(recipients: string[] = [self]) {
  return { _id: id(), channel_type: "Group", name: "Group", owner: self, recipients };
}

beforeEach(() => {
  client = new Client({ apiURL: API });
  client.rest.setToken("user-token", "user");
});

afterEach(() => {
  client.rest.destroy();
  vi.unstubAllGlobals();
});

describe("servers.create()", () => {
  it("creates the server and caches it with its channels", async () => {
    const serverId = id();
    const channelId = id();
    const calls = mockApi({
      "POST /servers/create": () => ({
        server: { _id: serverId, owner: self, name: "My Server", channels: [channelId], default_permissions: 0 },
        channels: [{ _id: channelId, channel_type: "TextChannel", server: serverId, name: "General" }],
      }),
    });

    const server = await client.servers.create({ name: "My Server", nsfw: true });

    expect(calls[0]!.body).toEqual({ name: "My Server", description: null, nsfw: true });
    expect(server).toBeInstanceOf(Server);
    expect(client.servers.cache.get(serverId)).toBe(server);
    expect(client.channels.cache.has(channelId)).toBe(true);
  });
});

describe("channels.createGroup()", () => {
  it("sends user IDs and caches the group", async () => {
    const friend = client.users._add(rawUser() as any);
    const other = id();
    let group: ReturnType<typeof rawGroup>;
    const calls = mockApi({
      "POST /channels/create": () => (group = rawGroup([self, friend.id, other])),
    });

    const created = await client.channels.createGroup({ name: "Group", users: [friend, other], icon: "icon-id" });

    expect(calls[0]!.body).toEqual({
      name: "Group",
      description: null,
      icon: "icon-id",
      users: [friend.id, other],
      nsfw: null,
    });
    expect(created).toBeInstanceOf(GroupChannel);
    expect(created.recipients).toEqual([self, friend.id, other]);
    expect(client.channels.cache.get(group!._id)).toBe(created);
  });
});

describe("group members", () => {
  it("fetchMembers() returns and caches the members", async () => {
    const group = client.channels._add(rawGroup() as any) as GroupChannel;
    const users = [rawUser(self), rawUser()];
    mockApi({ [`GET /channels/${group.id}/members`]: () => users });

    const members = await group.fetchMembers();

    expect([...members.keys()]).toEqual(users.map((u) => u._id));
    expect(client.users.cache.has(users[1]!._id)).toBe(true);
  });

  it("addMember() and removeMember() update recipients", async () => {
    const group = client.channels._add(rawGroup() as any) as GroupChannel;
    const member = id();
    const calls = mockApi({
      [`PUT /channels/${group.id}/recipients/${member}`]: () => undefined,
      [`DELETE /channels/${group.id}/recipients/${member}`]: () => undefined,
    });

    await group.addMember(member);
    expect(group.recipients).toEqual([self, member]);

    // The gateway event for the same join doesn't add the member twice.
    (client.gateway as any).handleMessage(JSON.stringify({ type: "ChannelGroupJoin", id: group.id, user: member }));
    expect(group.recipients).toEqual([self, member]);

    await group.removeMember(member);
    expect(group.recipients).toEqual([self]);
    expect(calls.map((c) => c.method)).toEqual(["PUT", "DELETE"]);
  });

  it("leave() removes the group from the cache", async () => {
    const group = client.channels._add(rawGroup() as any) as GroupChannel;
    const calls = mockApi({ [`DELETE /channels/${group.id}`]: () => undefined });

    await group.leave({ silent: true });

    expect(calls[0]!.search).toBe("?leave_silently=true");
    expect(client.channels.cache.has(group.id)).toBe(false);
  });
});

describe("users.setUsername()", () => {
  it("updates the cached user and client.user", async () => {
    const raw = { ...rawUser(self), relationship: "User" };
    client.users._add(raw as any);
    client.user = new ClientUser(client, raw as any);
    const calls = mockApi({
      "PATCH /users/@me/username": () => ({ ...raw, username: "newname", discriminator: "4242" }),
    });

    const user = await client.users.setUsername("newname", "password");

    expect(calls[0]!.body).toEqual({ username: "newname", password: "password" });
    expect(user.username).toBe("newname");
    expect(client.users.cache.get(self)!.discriminator).toBe("4242");
    expect(client.user!.username).toBe("newname");
  });
});
