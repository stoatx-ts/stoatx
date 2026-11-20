import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { monotonicFactory } from "ulid";
import { Client, Server, GroupChannel, Attachment } from "../src";

const id = monotonicFactory();
const API = "https://api.example";

type Route = (init: RequestInit, url: URL) => unknown;
type Call = { method: string; path: string; headers: Record<string, string>; body: any };

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
        headers: (init.headers ?? {}) as Record<string, string>,
        body: typeof init.body === "string" ? JSON.parse(init.body) : undefined,
      });
      const handler = routes[`${method} ${url.pathname}`];
      if (!handler) return new Response(JSON.stringify({ type: "NotFound" }), { status: 404 });
      return new Response(JSON.stringify(handler(init, url)));
    }),
  );
  return calls;
}

let client: Client;
const self = id();

function rawUser(relationship: string, extra: Record<string, unknown> = {}) {
  return {
    _id: id(),
    username: `user${Math.random().toString(36).slice(2, 7)}`,
    discriminator: "0001",
    relationship,
    ...extra,
  };
}

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
});

describe("relationship actions", () => {
  const cases = [
    ["addFriend", "PUT", "friend", "Outgoing"],
    ["removeFriend", "DELETE", "friend", "None"],
    ["block", "PUT", "block", "Blocked"],
    ["unblock", "DELETE", "block", "None"],
  ] as const;

  for (const [method, http, route, result] of cases) {
    it(`user.${method}() calls ${http} /users/:id/${route} and updates the cached user`, async () => {
      const user = client.users._add(rawUser("None") as any);
      const calls = mockApi({ [`${http} /users/${user.id}/${route}`]: () => ({ ...rawUser(result), _id: user.id }) });

      const returned = await user[method]();

      expect(calls).toHaveLength(1);
      expect(calls[0]!.headers["X-Session-Token"]).toBe("user-token");
      expect(returned).toBe(user);
      expect(client.users.cache.get(user.id)!.relationship).toBe(result);
    });
  }

  it("sendFriendRequest() posts the full username and caches the user", async () => {
    const target = rawUser("Outgoing");
    const calls = mockApi({ "POST /users/friend": () => target });

    const user = await client.users.sendFriendRequest("alice#1234");

    expect(calls[0]!.body).toEqual({ username: "alice#1234" });
    expect(user.relationship).toBe("Outgoing");
    expect(client.users.cache.get(target._id)).toBe(user);
  });

  it("sendFriendRequest() rejects usernames without a discriminator before calling the API", async () => {
    const calls = mockApi({});
    await expect(client.users.sendFriendRequest("alice")).rejects.toBeInstanceOf(TypeError);
    expect(calls).toHaveLength(0);
  });
});

describe("relationship lists", () => {
  it("are built from the users sent in Ready and kept up to date by UserRelationship events", () => {
    const friend = rawUser("Friend");
    const incoming = rawUser("Incoming");
    const outgoing = rawUser("Outgoing");
    const blocked = rawUser("Blocked");
    const stranger = rawUser("None");
    dispatch({
      type: "Ready",
      users: [
        { _id: self, username: "me", discriminator: "0001", relationship: "User" },
        friend,
        incoming,
        outgoing,
        blocked,
        stranger,
      ],
    });

    expect([...client.users.friends.keys()]).toEqual([friend._id]);
    expect([...client.users.incomingFriendRequests.keys()]).toEqual([incoming._id]);
    expect([...client.users.outgoingFriendRequests.keys()]).toEqual([outgoing._id]);
    expect([...client.users.blocked.keys()]).toEqual([blocked._id]);

    // They accepted our request on another device / from their side.
    dispatch({ type: "UserRelationship", id: self, user: { ...outgoing, relationship: "Friend" } });

    expect([...client.users.friends.keys()]).toEqual([friend._id, outgoing._id]);
    expect(client.users.outgoingFriendRequests.size).toBe(0);
  });
});

describe("fetchDMs", () => {
  it("fetches DM, group and Saved Messages channels into the cache", async () => {
    const dm = { _id: id(), channel_type: "DirectMessage", active: true, recipients: [self, id()] };
    const group = { _id: id(), channel_type: "Group", name: "Group", owner: self, recipients: [self] };
    mockApi({ "GET /users/dms": () => [dm, group] });

    const channels = await client.users.fetchDMs();

    expect([...channels.keys()]).toEqual([dm._id, group._id]);
    expect(client.channels.cache.get(dm._id)!.isDM()).toBe(true);
    expect(client.channels.cache.get(group._id)).toBeInstanceOf(GroupChannel);
  });
});

describe("invites", () => {
  const icon = {
    _id: id(),
    tag: "icons",
    filename: "icon.png",
    metadata: { type: "Image", width: 1, height: 1 },
    content_type: "image/png",
    size: 1,
  };

  it("previews a server invite without a token", async () => {
    client.rest.clearToken();
    const serverId = id();
    const channelId = id();
    const calls = mockApi({
      "GET /invites/abc123": () => ({
        type: "Server",
        code: "abc123",
        server_id: serverId,
        server_name: "Stoat",
        server_icon: icon,
        channel_id: channelId,
        channel_name: "general",
        user_name: "alice",
        member_count: 42,
      }),
    });

    const preview = await client.invites.fetch("abc123");

    expect(calls[0]!.headers["X-Session-Token"]).toBeUndefined();
    expect(calls[0]!.headers["X-Bot-Token"]).toBeUndefined();
    expect(preview).toMatchObject({
      type: "Server",
      code: "abc123",
      serverId,
      serverName: "Stoat",
      serverBanner: null,
      serverFlags: null,
      memberCount: 42,
      channelId,
      channelName: "general",
      channelDescription: null,
      inviterName: "alice",
      inviterAvatar: null,
    });
    expect(preview.type === "Server" && preview.serverIcon).toBeInstanceOf(Attachment);
  });

  it("previews a group invite", async () => {
    const channelId = id();
    mockApi({
      "GET /invites/grp": () => ({
        type: "Group",
        code: "grp",
        channel_id: channelId,
        channel_name: "Friends",
        user_name: "bob",
      }),
    });

    expect(await client.invites.fetch("grp")).toEqual({
      type: "Group",
      code: "grp",
      channelId,
      channelName: "Friends",
      channelDescription: null,
      inviterName: "bob",
      inviterAvatar: null,
    });
  });

  it("accepting a server invite caches the server and its channels", async () => {
    const serverId = id();
    const channelId = id();
    mockApi({
      "POST /invites/abc123": () => ({
        type: "Server",
        server: { _id: serverId, name: "Stoat", owner: id(), channels: [channelId] },
        channels: [{ _id: channelId, channel_type: "TextChannel", server: serverId, name: "general" }],
      }),
    });

    const joined = await client.invites.accept("abc123");

    expect(joined).toBeInstanceOf(Server);
    expect(client.servers.cache.get(serverId)).toBe(joined);
    expect(client.channels.cache.get(channelId)!.isText()).toBe(true);
  });

  it("accepting a group invite caches the group and its members", async () => {
    const channelId = id();
    const member = rawUser("None");
    mockApi({
      "POST /invites/grp": () => ({
        type: "Group",
        channel: {
          _id: channelId,
          channel_type: "Group",
          name: "Friends",
          owner: member._id,
          recipients: [self, member._id],
        },
        users: [member],
      }),
    });

    const joined = await client.invites.accept("grp");

    expect(joined).toBeInstanceOf(GroupChannel);
    expect(client.users.cache.get(member._id)).toBeDefined();
  });

  it("the ServerCreate event that follows a join updates the same cached server", async () => {
    const serverId = id();
    mockApi({
      "POST /invites/abc123": () => ({
        type: "Server",
        server: { _id: serverId, name: "Old name", owner: id(), channels: [] },
        channels: [],
      }),
    });
    const joined = await client.invites.accept("abc123");

    dispatch({
      type: "ServerCreate",
      id: serverId,
      server: { _id: serverId, name: "New name", owner: id(), channels: [] },
      channels: [],
      emojis: [],
    });

    expect(client.servers.cache.get(serverId)).toBe(joined);
    expect((joined as Server).name).toBe("New name");
  });

  it("accepting needs a session, unlike previewing", async () => {
    client.rest.clearToken();
    const calls = mockApi({});
    await expect(client.invites.accept("abc123")).rejects.toThrow("REST_NOT_READY");
    expect(calls).toHaveLength(0);
  });

  it("encodes the invite code in the URL", async () => {
    const calls = mockApi({});
    await client.invites.fetch("a/b").catch(() => {});
    expect(calls[0]!.path).toBe("/invites/a%2Fb");
  });
});
