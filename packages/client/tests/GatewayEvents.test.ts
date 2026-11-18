import { describe, it, expect, vi, beforeEach } from "vitest";
import { ulid } from "ulid";
import { Client } from "../src";

let client: Client;

function dispatch(payload: unknown) {
  (client.gateway as any).handleMessage(Buffer.from(JSON.stringify(payload)));
}

function listen(event: string) {
  const fn = vi.fn();
  client.on(event as any, fn);
  return fn;
}

function setupServer() {
  const serverId = ulid();
  const roleId = ulid();
  const userId = ulid();
  const server = client.servers._add({
    _id: serverId,
    name: "Test",
    owner: userId,
    channels: [],
    roles: { [roleId]: { _id: roleId, name: "Mod", permissions: { a: 0, d: 0 }, rank: 0 } },
  } as any);
  const member = server.members._add({
    _id: { server: serverId, user: userId },
    joined_at: new Date().toISOString(),
    roles: [roleId],
  } as any);
  return { server, member, serverId, roleId, userId };
}

beforeEach(() => {
  client = new Client();
  client.on("error", (error) => {
    throw error;
  });
});

describe("Gateway events", () => {
  it("dispatches every event inside a Bulk frame", () => {
    const start = listen("typingStart");
    dispatch({
      type: "Bulk",
      v: [
        { type: "ChannelStartTyping", id: "c1", user: "u1" },
        { type: "ChannelStartTyping", id: "c2", user: "u2" },
      ],
    });
    expect(start.mock.calls).toEqual([
      ["c1", "u1"],
      ["c2", "u2"],
    ]);
  });

  it("caches the nested server, channels and emojis on ServerCreate", () => {
    const serverId = ulid();
    const channelId = ulid();
    const emojiId = ulid();
    const onCreate = listen("serverCreate");

    dispatch({
      type: "ServerCreate",
      id: serverId,
      server: { _id: serverId, name: "New", owner: ulid(), channels: [channelId] },
      channels: [{ _id: channelId, channel_type: "TextChannel", server: serverId, name: "general" }],
      emojis: [{ _id: emojiId, name: "wave", creator_id: ulid(), parent: { type: "Server", id: serverId } }],
      voice_states: [],
    });

    const server = client.servers.cache.get(serverId)!;
    expect(onCreate).toHaveBeenCalledWith(server);
    expect(client.channels.cache.has(channelId)).toBe(true);
    expect(server.emojis.cache.has(emojiId)).toBe(true);
  });

  it("patches members on ServerMemberUpdate", () => {
    const { member, serverId, userId } = setupServer();
    const onUpdate = listen("serverMemberUpdate");

    dispatch({
      type: "ServerMemberUpdate",
      id: { server: serverId, user: userId },
      data: { nickname: "New" },
      clear: [],
    });

    expect(member.nickname).toBe("New");
    expect(onUpdate.mock.calls[0]![0].nickname).not.toBe("New");
    expect(onUpdate.mock.calls[0]![1]).toBe(member);
  });

  it("creates, updates, reranks and deletes roles", () => {
    const { server, member, serverId, roleId } = setupServer();
    const onCreate = listen("serverRoleCreate");
    const onUpdate = listen("serverRoleUpdate");
    const onDelete = listen("serverRoleDelete");

    const newRoleId = ulid();
    dispatch({ type: "ServerRoleUpdate", id: serverId, role_id: newRoleId, data: { name: "Fresh", rank: 1 } });
    expect(onCreate).toHaveBeenCalledWith(server.roles.cache.get(newRoleId));

    dispatch({ type: "ServerRoleUpdate", id: serverId, role_id: roleId, data: { name: "Admin" }, clear: [] });
    expect(server.roles.cache.get(roleId)!.name).toBe("Admin");
    expect(onUpdate.mock.calls[0]![0].name).toBe("Mod");

    dispatch({ type: "ServerRoleRanksUpdate", id: serverId, ranks: [newRoleId, roleId] });
    expect(server.roles.cache.get(newRoleId)!.rank).toBe(0);
    expect(server.roles.cache.get(roleId)!.rank).toBe(1);

    dispatch({ type: "ServerRoleDelete", id: serverId, role_id: roleId });
    expect(server.roles.cache.has(roleId)).toBe(false);
    expect(member.roleIds).not.toContain(roleId);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("removes messages on BulkMessageDelete", () => {
    const channelId = ulid();
    const channel = client.channels._add({
      _id: channelId,
      channel_type: "TextChannel",
      server: ulid(),
      name: "general",
    } as any);
    const message = channel.messages._add({ _id: ulid(), channel: channelId, author: ulid(), content: "hi" } as any);
    const missingId = ulid();
    const onBulk = listen("messageDeleteBulk");

    dispatch({ type: "BulkMessageDelete", channel: channelId, ids: [message.id, missingId] });

    expect(channel.messages.cache.size).toBe(0);
    const [deleted, emittedChannel] = onBulk.mock.calls[0]!;
    expect(emittedChannel).toBe(channelId);
    expect(deleted.get(message.id)).toBe(message);
    expect(deleted.get(missingId)).toEqual({ id: missingId, channelId });
  });

  it("builds a partial message for uncached MessageUpdate instead of throwing", () => {
    const onUpdate = listen("messageUpdate");
    const id = ulid();

    dispatch({ type: "MessageUpdate", id, channel: ulid(), data: { content: "edited" } });

    expect(onUpdate.mock.calls[0]![0]).toBeNull();
    expect(onUpdate.mock.calls[0]![1].id).toBe(id);
    expect(onUpdate.mock.calls[0]![1].content).toBe("edited");
  });

  it("updates group recipients", () => {
    const channelId = ulid();
    const channel = client.channels._add({
      _id: channelId,
      channel_type: "Group",
      name: "group",
      owner: ulid(),
      recipients: ["a"],
    } as any) as any;
    const onJoin = listen("channelGroupJoin");

    dispatch({ type: "ChannelGroupJoin", id: channelId, user: "b" });
    expect(channel.recipients).toEqual(["a", "b"]);
    expect(onJoin).toHaveBeenCalledWith(channel, "b");

    dispatch({ type: "ChannelGroupLeave", id: channelId, user: "a" });
    expect(channel.recipients).toEqual(["b"]);
  });

  it("tracks webhooks on their channel", () => {
    const channelId = ulid();
    const channel = client.channels._add({
      _id: channelId,
      channel_type: "TextChannel",
      server: ulid(),
      name: "general",
    } as any);
    const id = ulid();

    dispatch({
      type: "WebhookCreate",
      id,
      channel_id: channelId,
      creator_id: ulid(),
      name: "Deploy",
      permissions: 0,
      avatar: { _id: ulid(), tag: "avatars", filename: "a.png" },
    });
    expect(channel.webhooks.cache.get(id)!.name).toBe("Deploy");

    dispatch({ type: "WebhookUpdate", id, channel_id: channelId, data: { name: "Ship" }, remove: ["Avatar"] });
    expect(channel.webhooks.cache.get(id)!.name).toBe("Ship");
    expect(channel.webhooks.cache.get(id)!.avatar).toBeNull();

    dispatch({ type: "WebhookDelete", id, channel_id: channelId });
    expect(channel.webhooks.cache.has(id)).toBe(false);
  });

  it("updates and deletes server emojis", () => {
    const { server, serverId } = setupServer();
    const emojiId = ulid();
    server.emojis._add({
      _id: emojiId,
      name: "old",
      creator_id: ulid(),
      parent: { type: "Server", id: serverId },
    } as any);
    const onDelete = listen("emojiDelete");

    dispatch({ type: "EmojiUpdate", id: emojiId, data: { name: "new" } });
    expect(server.emojis.cache.get(emojiId)!.name).toBe("new");

    dispatch({ type: "EmojiDelete", id: emojiId });
    expect(server.emojis.cache.has(emojiId)).toBe(false);
    expect(onDelete.mock.calls[0]![0].name).toBe("new");
  });

  it("removes a wiped user's messages and memberships", () => {
    const { server, userId } = setupServer();
    const channelId = ulid();
    const channel = client.channels._add({
      _id: channelId,
      channel_type: "TextChannel",
      server: server.id,
      name: "general",
    } as any);
    channel.messages._add({ _id: ulid(), channel: channelId, author: userId, content: "bye" } as any);
    const keep = channel.messages._add({ _id: ulid(), channel: channelId, author: ulid(), content: "hi" } as any);

    dispatch({ type: "UserPlatformWipe", user_id: userId, flags: 4 });

    expect([...channel.messages.cache.values()]).toEqual([keep]);
    expect(server.members.cache.has(userId)).toBe(false);
  });
});
