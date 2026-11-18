import { describe, it, expect } from "vitest";
import { ulid } from "ulid";
import { createMockClient } from "./utils/mockClient";

describe("Base._clone", () => {
  it("keeps the snapshot independent of later nested mutations", () => {
    const client = createMockClient();
    const channel = client.channels._add({
      _id: ulid(),
      channel_type: "TextChannel",
      server: ulid(),
      name: "general",
    } as any) as any;
    const message = channel.messages._add({ _id: ulid(), channel: channel.id, author: ulid(), content: "hi" });
    message.reactions = { "👍": ["a"] };

    const snapshot = message._clone();
    message.reactions["👍"].push("b");

    expect(snapshot.reactions["👍"]).toEqual(["a"]);
    expect(Object.getPrototypeOf(snapshot)).toBe(Object.getPrototypeOf(message));
    expect((snapshot as any).client).toBe(client);
  });
});
