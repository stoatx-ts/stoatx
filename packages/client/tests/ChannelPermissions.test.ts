import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { monotonicFactory } from "ulid";
import {
  Client,
  PermissionFlags as P,
  ALLOW_IN_TIMEOUT,
  DEFAULT_PERMISSION_DIRECT_MESSAGE,
  DEFAULT_PERMISSION_VIEW_ONLY,
} from "../src";

const id = monotonicFactory();

let client: Client;
let ids: Record<
  "self" | "owner" | "friend" | "stranger" | "blocked" | "bot" | "server" | "low" | "high" | "general" | "secret",
  string
>;

function dispatch(payload: unknown) {
  (client.gateway as any).handleMessage(JSON.stringify(payload));
}

function user(_id: string, relationship: string, extra: Record<string, unknown> = {}) {
  return { _id, username: _id.slice(-4), discriminator: "0001", relationship, online: false, ...extra };
}

function member(userId: string, roles: string[], extra: Record<string, unknown> = {}) {
  return { _id: { server: ids.server, user: userId }, joined_at: new Date().toISOString(), roles, ...extra };
}

/** A server where everyone can view and send by default, a low and a high role, and two channels. */
function ready(members: unknown[], channelExtra: Record<string, unknown> = {}) {
  dispatch({
    type: "Ready",
    users: [
      user(ids.self, "User"),
      user(ids.owner, "None"),
      user(ids.friend, "Friend"),
      user(ids.stranger, "None"),
      user(ids.blocked, "Blocked"),
      user(ids.bot, "None", { bot: { owner: ids.owner } }),
    ],
    servers: [
      {
        _id: ids.server,
        name: "Server",
        owner: ids.owner,
        channels: [ids.general, ids.secret],
        default_permissions: Number(P.ViewChannel | P.ReadMessageHistory | P.SendMessage),
        roles: {
          // A lower rank is a higher role.
          [ids.low]: { _id: ids.low, name: "Low", rank: 5, permissions: { a: Number(P.React), d: 0 } },
          [ids.high]: { _id: ids.high, name: "High", rank: 1, permissions: { a: 0, d: Number(P.React) } },
        },
      },
    ],
    channels: [
      { _id: ids.general, channel_type: "TextChannel", server: ids.server, name: "general" },
      {
        _id: ids.secret,
        channel_type: "TextChannel",
        server: ids.server,
        name: "secret",
        default_permissions: { a: 0, d: Number(P.ViewChannel) },
        role_permissions: { [ids.low]: { a: Number(P.ViewChannel), d: Number(P.SendMessage) } },
        ...channelExtra,
      },
    ],
    members,
    channel_unreads: [],
  });
}

beforeEach(() => {
  ids = {
    self: id(),
    owner: id(),
    friend: id(),
    stranger: id(),
    blocked: id(),
    bot: id(),
    server: id(),
    low: id(),
    high: id(),
    general: id(),
    secret: id(),
  };
  client = new Client();
  client.rest.setToken("user-token", "user");
  client.on("error", (error) => {
    throw error;
  });
});

afterEach(() => {
  client.rest.destroy();
});

describe("server permissions", () => {
  it("applies role overrides from the lowest role to the highest", () => {
    ready([member(ids.self, [ids.low, ids.high]), member(ids.friend, [ids.low])]);
    const server = client.servers.cache.get(ids.server)!;

    // Low allows React, High (applied last) denies it.
    expect(server.members.cache.get(ids.self)!.permissions.has("React")).toBe(false);
    expect(server.members.cache.get(ids.friend)!.permissions.has("React")).toBe(true);
    expect(client.servers.cache.get(ids.server)!.roles.cache.get(ids.high)!.deniedPermissions.has("React")).toBe(true);
  });

  it("gives the owner everything and limits timed-out members", () => {
    const inAnHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const anHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    ready([
      member(ids.owner, []),
      member(ids.self, [], { timeout: inAnHour }),
      member(ids.friend, [], { timeout: anHourAgo }),
    ]);
    const members = client.servers.cache.get(ids.server)!.members.cache;

    expect(members.get(ids.owner)!.permissions.bitfield).toBe(P.GrantAllSafe);
    expect(members.get(ids.self)!.permissions.bitfield).toBe(ALLOW_IN_TIMEOUT);
    expect(members.get(ids.friend)!.permissions.has("SendMessage")).toBe(true);
  });
});

describe("server channel permissions", () => {
  it("applies the channel's default override, then role overrides", () => {
    ready([member(ids.self, []), member(ids.friend, [ids.low])]);
    const general = client.channels.cache.get(ids.general)!;
    const secret = client.channels.cache.get(ids.secret)!;

    expect(general.permissions.has("SendMessage")).toBe(true);
    // Hidden from everyone: no permissions at all, not just no ViewChannel.
    expect(secret.permissions.bitfield).toBe(0n);
    // Shown to the Low role, read-only.
    expect(secret.permissionsFor(ids.friend).has("ViewChannel")).toBe(true);
    expect(secret.permissionsFor(ids.friend).has("SendMessage")).toBe(false);
  });

  it("gives the owner everything, and nothing to non-members", () => {
    ready([member(ids.self, [])]);
    const secret = client.channels.cache.get(ids.secret)!;

    expect(secret.permissionsFor(ids.owner).bitfield).toBe(P.GrantAllSafe);
    expect(secret.permissionsFor(ids.stranger).bitfield).toBe(0n);
  });

  it("limits timed-out members to viewing", () => {
    const inAnHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    ready([member(ids.self, [], { timeout: inAnHour })]);

    expect(client.channels.cache.get(ids.general)!.permissions.bitfield).toBe(ALLOW_IN_TIMEOUT);
  });

  it("picks up override changes from ChannelUpdate", () => {
    ready([member(ids.self, [ids.high])]);
    const secret = client.channels.cache.get(ids.secret)!;
    expect(secret.permissions.has("ViewChannel")).toBe(false);

    dispatch({
      type: "ChannelUpdate",
      id: ids.secret,
      data: { role_permissions: { [ids.high]: { a: Number(P.ViewChannel), d: 0 } } },
      clear: [],
    });
    expect(secret.permissions.has("ViewChannel")).toBe(true);

    dispatch({ type: "ChannelUpdate", id: ids.secret, data: {}, clear: ["DefaultPermissions"] });
    expect(client.channels.cache.get(ids.secret)!.permissionsFor(ids.self).has("SendMessage")).toBe(true);
  });
});

describe("DM, group and Saved Notes permissions", () => {
  function dm(other: string) {
    const channelId = id();
    dispatch({
      type: "ChannelCreate",
      _id: channelId,
      channel_type: "DirectMessage",
      active: true,
      recipients: [ids.self, other],
    });
    return client.channels.cache.get(channelId)!;
  }

  beforeEach(() => ready([member(ids.self, [])]));

  it("lets friends and bots message, and makes other DMs read-only", () => {
    expect(dm(ids.friend).permissions.bitfield).toBe(DEFAULT_PERMISSION_DIRECT_MESSAGE);
    expect(dm(ids.bot).permissions.has("SendMessage")).toBe(true);
    expect(dm(ids.stranger).permissions.bitfield).toBe(DEFAULT_PERMISSION_VIEW_ONLY);
    expect(dm(ids.blocked).permissions.bitfield).toBe(DEFAULT_PERMISSION_VIEW_ONLY);
    expect(dm(ids.friend).permissionsFor(ids.stranger).bitfield).toBe(0n);
  });

  it("gives a group's owner everything and its members the group's permissions", () => {
    const groupId = id();
    dispatch({
      type: "ChannelCreate",
      _id: groupId,
      channel_type: "Group",
      name: "Group",
      owner: ids.friend,
      recipients: [ids.self, ids.friend],
    });
    const group = client.channels.cache.get(groupId)!;

    expect(group.permissionsFor(ids.friend).bitfield).toBe(P.GrantAllSafe);
    expect(group.permissions.bitfield).toBe(DEFAULT_PERMISSION_DIRECT_MESSAGE);
    expect(group.permissionsFor(ids.stranger).bitfield).toBe(0n);

    // Members can always view, whatever the group allows.
    dispatch({ type: "ChannelUpdate", id: groupId, data: { permissions: Number(P.React) }, clear: [] });
    expect(group.permissions.bitfield).toBe(DEFAULT_PERMISSION_VIEW_ONLY | P.React);
  });

  it("gives Saved Notes' owner everything", () => {
    const savedId = id();
    dispatch({ type: "ChannelCreate", _id: savedId, channel_type: "SavedMessages", user: ids.self });
    const saved = client.channels.cache.get(savedId)!;

    expect(saved.permissions.bitfield).toBe(P.GrantAllSafe);
    expect(saved.permissionsFor(ids.friend).bitfield).toBe(0n);
  });
});
