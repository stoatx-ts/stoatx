import { describe, it, expect } from "vitest";
import { monotonicFactory } from "ulid";
import { Client } from "../src";

const id = monotonicFactory();

describe("system messages", () => {
  it("keeps what a system message is about", () => {
    const client = new Client();
    const channelId = id();
    client.channels._add({ _id: channelId, channel_type: "Group", name: "g", owner: id(), recipients: [] } as any);
    const channel = client.channels.cache.get(channelId)!;
    const joined = id();

    const system = channel.messages._add({
      _id: id(),
      channel: channelId,
      author: "00000000000000000000000000",
      system: { type: "user_joined", id: joined },
    } as any);
    const normal = channel.messages._add({ _id: id(), channel: channelId, author: joined, content: "hi" } as any);

    expect(system.system).toEqual({ type: "user_joined", id: joined });
    expect(normal.system).toBeNull();
  });
});
