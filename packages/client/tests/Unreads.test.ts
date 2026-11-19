import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { monotonicFactory } from "ulid";
import { Client } from "../src";

// Monotonic so IDs created later always sort after earlier ones, like real message IDs.
const id = monotonicFactory();

let client: Client;
let ids: { self: string; other: string; server: string; role: string; text: string; dm: string; first: string };

function dispatch(payload: unknown) {
  (client.gateway as any).handleMessage(JSON.stringify(payload));
}

function message(channel: string, author: string, extra: Record<string, unknown> = {}) {
  const _id = id();
  dispatch({ type: "Message", _id, channel, author, content: "hi", ...extra });
  return _id;
}

/** Logs in as a user and sends a Ready with a server channel, a DM and the given read state. */
function ready(channelUnreads: unknown[] = []) {
  dispatch({
    type: "Ready",
    users: [
      { _id: ids.self, username: "me", discriminator: "0001", relationship: "User" },
      { _id: ids.other, username: "them", discriminator: "0002", relationship: "Friend" },
    ],
    servers: [
      {
        _id: ids.server,
        name: "Server",
        owner: ids.other,
        channels: [ids.text],
        roles: { [ids.role]: { _id: ids.role, name: "Mod", permissions: { a: 0, d: 0 }, rank: 0 } },
      },
    ],
    channels: [
      { _id: ids.text, channel_type: "TextChannel", server: ids.server, name: "general", last_message_id: ids.first },
      { _id: ids.dm, channel_type: "DirectMessage", active: true, recipients: [ids.self, ids.other] },
    ],
    members: [{ _id: { server: ids.server, user: ids.self }, joined_at: new Date().toISOString(), roles: [ids.role] }],
    channel_unreads: channelUnreads,
  });
}

beforeEach(() => {
  ids = { self: id(), other: id(), server: id(), role: id(), text: id(), dm: id(), first: id() };
  client = new Client({ apiURL: "https://api.example" });
  client.rest.setToken("user-token", "user");
  client.on("error", (error) => {
    throw error;
  });
});

afterEach(() => {
  client.rest.destroy();
  vi.unstubAllGlobals();
});

describe("unread state", () => {
  it("loads read state from Ready", () => {
    const mention = id();
    ready([{ _id: { channel: ids.text, user: ids.self }, last_id: ids.first, mentions: [mention] }]);

    const channel = client.channels.cache.get(ids.text)!;
    // Read up to the latest message, but an unread mention still makes it unread (like the official client).
    expect(channel.unread).toBe(true);
    expect(channel.mentionCount).toBe(1);
    expect(client.servers.cache.get(ids.server)!.mentionCount).toBe(1);
  });

  it("never reports Saved Messages as unread", () => {
    ready([]);
    const saved = id();
    const channel = client.channels._add({ _id: saved, channel_type: "SavedMessages", user: ids.self } as any);
    // Saved Messages has no lastMessageId tracking today; set one so the check itself is exercised.
    (channel as any).lastMessageId = id();
    expect(channel.unread).toBe(false);
  });

  it("treats a channel with messages but no read state as unread", () => {
    ready([]);
    expect(client.channels.cache.get(ids.text)!.unread).toBe(true);
    // The DM has no messages at all.
    expect(client.channels.cache.get(ids.dm)!.unread).toBe(false);
  });

  it("marks a channel unread when someone else posts, and tracks lastMessageId", () => {
    ready([{ _id: { channel: ids.text, user: ids.self }, last_id: ids.first }]);
    const channel = client.channels.cache.get(ids.text)!;
    const server = client.servers.cache.get(ids.server)!;
    expect(channel.unread).toBe(false);

    const newId = message(ids.text, ids.other);

    expect((channel as any).lastMessageId).toBe(newId);
    expect(channel.unread).toBe(true);
    expect(server.unread).toBe(true);
  });

  it("marks the user's own message read when the channel was already fully read", () => {
    ready([{ _id: { channel: ids.text, user: ids.self }, last_id: ids.first }]);
    const own = message(ids.text, ids.self);

    expect(client.channels.cache.get(ids.text)!.unread).toBe(false);
    expect(client.unreads.cache.get(ids.text)!.lastReadId).toBe(own);
  });

  it("does not hide other people's unread messages when the user posts", () => {
    ready([{ _id: { channel: ids.text, user: ids.self }, last_id: ids.first }]);
    message(ids.text, ids.other);
    message(ids.text, ids.self);

    expect(client.channels.cache.get(ids.text)!.unread).toBe(true);
    expect(client.unreads.cache.get(ids.text)!.lastReadId).toBe(ids.first);
  });

  it("counts only direct user mentions in server channels, like the server does", () => {
    ready([]);
    const channel = client.channels.cache.get(ids.text)!;

    message(ids.text, ids.other);
    message(ids.text, ids.other, { mentions: [ids.other] });
    // The server doesn't store role or @everyone (flag bit 2) mentions as unread mentions.
    message(ids.text, ids.other, { role_mentions: [ids.role] });
    message(ids.text, ids.other, { flags: 1 << 2 });
    expect(channel.mentionCount).toBe(0);

    message(ids.text, ids.other, { mentions: [ids.self] });
    expect(channel.mentionCount).toBe(1);
  });

  it("counts every message from someone else in DMs as a mention", () => {
    ready([]);
    message(ids.dm, ids.other);
    message(ids.dm, ids.other);
    message(ids.dm, ids.self);
    expect(client.channels.cache.get(ids.dm)!.mentionCount).toBe(2);
  });

  it("ignores messages sent with notifications suppressed", () => {
    ready([]);
    message(ids.dm, ids.other, { flags: 1 << 1 });
    message(ids.text, ids.other, { mentions: [ids.self], flags: 1 << 1 });
    expect(client.channels.cache.get(ids.dm)!.mentionCount).toBe(0);
    expect(client.channels.cache.get(ids.text)!.mentionCount).toBe(0);
  });

  it("forgets mentions when the message is deleted", () => {
    ready([]);
    const mentionId = message(ids.dm, ids.other, { mentions: [ids.self] });
    expect(client.channels.cache.get(ids.dm)!.mentionCount).toBe(1);

    dispatch({ type: "MessageDelete", id: mentionId, channel: ids.dm });
    expect(client.channels.cache.get(ids.dm)!.mentionCount).toBe(0);
  });

  it("applies acks from the account's other devices, clearing mentions up to that message", () => {
    ready([]);
    const channel = client.channels.cache.get(ids.text)!;
    const firstMention = message(ids.text, ids.other, { mentions: [ids.self] });
    const secondMention = message(ids.text, ids.other, { mentions: [ids.self] });

    dispatch({ type: "ChannelAck", id: ids.text, user: ids.self, message_id: firstMention });
    expect(channel.mentionCount).toBe(1);
    expect(channel.unread).toBe(true);

    dispatch({ type: "ChannelAck", id: ids.text, user: ids.self, message_id: secondMention });
    expect(channel.mentionCount).toBe(0);
    expect(channel.unread).toBe(false);
  });

  it("ignores acks from other users and never moves the read marker backwards", () => {
    ready([]);
    const older = message(ids.text, ids.other);
    const newer = message(ids.text, ids.other);

    dispatch({ type: "ChannelAck", id: ids.text, user: ids.other, message_id: newer });
    expect(client.unreads.cache.get(ids.text)).toBeUndefined();

    client.unreads._markRead(ids.text, newer);
    client.unreads._markRead(ids.text, older);
    expect(client.unreads.cache.get(ids.text)!.lastReadId).toBe(newer);
  });

  it("reports nothing unread for bots", () => {
    client.rest.setToken("bot-token", "bot");
    ready([]);
    message(ids.text, ids.other, { mentions: [ids.self] });

    expect(client.channels.cache.get(ids.text)!.unread).toBe(false);
    expect(client.channels.cache.get(ids.text)!.mentionCount).toBe(0);
  });
});

describe("acking", () => {
  function mockFetch() {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("channel.ack() acks the latest message and updates local state", async () => {
    ready([]);
    const fetchMock = mockFetch();
    const latest = message(ids.text, ids.other, { mentions: [ids.self] });
    const channel = client.channels.cache.get(ids.text)!;

    await channel.ack();

    const [url, init] = fetchMock.mock.calls[0]! as unknown as [string, RequestInit];
    expect(init.method).toBe("PUT");
    expect(url).toBe(`https://api.example/channels/${ids.text}/ack/${latest}`);
    expect(channel.unread).toBe(false);
    expect(channel.mentionCount).toBe(0);
  });

  it("server.ack() marks every channel in the server read", async () => {
    ready([]);
    const fetchMock = mockFetch();
    message(ids.text, ids.other);
    const server = client.servers.cache.get(ids.server)!;
    expect(server.unread).toBe(true);

    await server.ack();

    expect((fetchMock.mock.calls[0]! as unknown as [string])[0]).toBe(`https://api.example/servers/${ids.server}/ack`);
    expect(server.unread).toBe(false);
  });

  it("fetch() replaces the cache from the API", async () => {
    ready([{ _id: { channel: ids.dm, user: ids.self }, last_id: null, mentions: [id()] }]);
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response(JSON.stringify([{ _id: { channel: ids.text, user: ids.self }, last_id: ids.first }])),
      ),
    );

    await client.unreads.fetch();

    expect([...client.unreads.cache.keys()]).toEqual([ids.text]);
  });

  it("rejects for bots", async () => {
    client.rest.setToken("bot-token", "bot");
    ready([]);
    await expect(client.channels.cache.get(ids.text)!.ack()).rejects.toThrow("USER_ONLY");
  });

  it("logging out clears the read state", () => {
    ready([{ _id: { channel: ids.text, user: ids.self }, last_id: ids.first }]);
    vi.spyOn(client.gateway, "disconnect");
    client._endSession();
    expect(client.unreads.cache.size).toBe(0);
  });
});

describe("typing", () => {
  it("tracks who is typing from gateway events", () => {
    ready([]);
    const channel = client.channels.cache.get(ids.text)!;

    dispatch({ type: "ChannelStartTyping", id: ids.text, user: ids.other });
    expect([...channel.typingUserIds]).toEqual([ids.other]);

    dispatch({ type: "ChannelStopTyping", id: ids.text, user: ids.other });
    expect(channel.typingUserIds.size).toBe(0);
  });

  it("clears a user's typing indicator when they send a message, emitting typingStop", () => {
    ready([]);
    const onStop = vi.fn();
    client.on("typingStop", onStop);
    dispatch({ type: "ChannelStartTyping", id: ids.text, user: ids.other });
    message(ids.text, ids.other);
    expect(client.channels.cache.get(ids.text)!.typingUserIds.size).toBe(0);
    expect(onStop).toHaveBeenCalledWith(ids.text, ids.other);
  });

  it("expires typing after 4 seconds without a refresh, emitting typingStop once", () => {
    vi.useFakeTimers();
    try {
      ready([]);
      const channel = client.channels.cache.get(ids.text)!;
      const onStop = vi.fn();
      client.on("typingStop", onStop);

      dispatch({ type: "ChannelStartTyping", id: ids.text, user: ids.other });
      vi.advanceTimersByTime(3000);
      // A refresh restarts the timer.
      dispatch({ type: "ChannelStartTyping", id: ids.text, user: ids.other });
      vi.advanceTimersByTime(3000);
      expect(channel.typingUserIds.has(ids.other)).toBe(true);

      vi.advanceTimersByTime(1000);
      expect(channel.typingUserIds.size).toBe(0);
      expect(onStop).toHaveBeenCalledTimes(1);

      // A late stop event for an expired indicator doesn't fire typingStop again.
      dispatch({ type: "ChannelStopTyping", id: ids.text, user: ids.other });
      expect(onStop).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("clears stale typing state on reconnect", () => {
    ready([]);
    dispatch({ type: "ChannelStartTyping", id: ids.text, user: ids.other });
    ready([]);
    expect(client.channels.cache.get(ids.text)!.typingUserIds.size).toBe(0);
  });

  it("sends BeginTyping, EndTyping and Subscribe over the socket", () => {
    ready([]);
    const sent: unknown[] = [];
    (client.gateway as any).ws = { readyState: WebSocket.OPEN, send: (data: string) => sent.push(JSON.parse(data)) };

    const channel = client.channels.cache.get(ids.text)!;
    expect(channel.startTyping()).toBe(true);
    expect(channel.stopTyping()).toBe(true);
    expect(client.servers.cache.get(ids.server)!.subscribe()).toBe(true);

    expect(sent).toEqual([
      { type: "BeginTyping", channel: ids.text },
      { type: "EndTyping", channel: ids.text },
      { type: "Subscribe", server_id: ids.server },
    ]);
    (client.gateway as any).ws = null;
  });

  it("throttles startTyping to one BeginTyping every 2.5 seconds", () => {
    vi.useFakeTimers();
    try {
      ready([]);
      const sent: any[] = [];
      (client.gateway as any).ws = { readyState: WebSocket.OPEN, send: (data: string) => sent.push(JSON.parse(data)) };
      const channel = client.channels.cache.get(ids.text)!;

      channel.startTyping();
      channel.startTyping();
      vi.advanceTimersByTime(2000);
      channel.startTyping();
      expect(sent.filter((m) => m.type === "BeginTyping")).toHaveLength(1);

      vi.advanceTimersByTime(600);
      channel.startTyping();
      expect(sent.filter((m) => m.type === "BeginTyping")).toHaveLength(2);

      // stopTyping resets the throttle so the next keystroke shows typing again straight away.
      channel.stopTyping();
      channel.startTyping();
      expect(sent.filter((m) => m.type === "BeginTyping")).toHaveLength(3);
      (client.gateway as any).ws = null;
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns false instead of sending when disconnected", () => {
    ready([]);
    expect(client.channels.cache.get(ids.text)!.startTyping()).toBe(false);
  });
});
