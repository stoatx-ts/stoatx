import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events"
import { type Message, ReactionCollector } from "../src";

vi.mock("../src/structures/MessageReaction", () => {
  return {
    MessageReaction: class MockMessageReaction {
      public message: any;
      public emoji: any;
      public users: Map<string, any>;

      constructor(_client: any, data: any) {
        this.message = data.message;
        this.emoji = data.emojiId;
        this.users = new Map();
        if (data.users) {
          data.users.forEach((u: string) => this.users.set(u, { id: u }));
        }
      }
    },
  };
});

class MockClient extends EventEmitter {
  public users = {
    cache: new Map<string, any>(),
  };
}

describe("ReactionCollector", () => {
  let mockClient: MockClient;
  let mockMessage: Message;

  beforeEach(() => {
    vi.useFakeTimers();
    mockClient = new MockClient();

    mockMessage = {
      id: "target-msg-123",
      client: mockClient,
    } as unknown as Message;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const createMockMessage = (id: string): Message => {
    return { id } as Message;
  };

  describe("Initialization and Event Binding", () => {
    it("should correctly initialize and bind event listeners to the client", () => {
      const collector = new ReactionCollector(mockMessage);

      expect(collector.messageId).toBe("target-msg-123");
      expect(collector.total).toBe(0);
      expect(collector.users).toBeInstanceOf(Set);
      expect(collector.users.size).toBe(0);

      expect(mockClient.listenerCount("messageReact")).toBe(1);
      expect(mockClient.listenerCount("messageUnreact")).toBe(1);
    });

    it("should remove client event listeners when stopped", () => {
      const collector = new ReactionCollector(mockMessage);

      collector.stop("user");

      expect(mockClient.listenerCount("messageReact")).toBe(0);
      expect(mockClient.listenerCount("messageUnreact")).toBe(0);
    });
  });

  describe("collect() and dispose() Resolution Logic", () => {
    it("should return null if the reaction is for a different message", () => {
      const collector = new ReactionCollector(mockMessage);
      const wrongReaction: any = {
        message: { id: "wrong-msg" },
        emoji: "👍",
      };

      expect(collector.collect(wrongReaction)).toBeNull();
      expect(collector.dispose(wrongReaction)).toBeNull();
    });

    it("should extract a string emoji correctly", () => {
      const collector = new ReactionCollector(mockMessage);
      const validReaction: any = {
        message: { id: "target-msg-123" },
        emoji: "👍",
      };

      expect(collector.collect(validReaction)).toBe("👍");
      expect(collector.dispose(validReaction)).toBe("👍");
    });

    it("should extract an object emoji ID correctly", () => {
      const collector = new ReactionCollector(mockMessage);
      const validObjectReaction: any = {
        message: { id: "target-msg-123" },
        emoji: { id: "custom-emoji-id" },
      };

      expect(collector.collect(validObjectReaction)).toBe("custom-emoji-id");
      expect(collector.dispose(validObjectReaction)).toBe("custom-emoji-id");
    });
  });

  describe("Adding Reactions (messageReact)", () => {
    it("should completely ignore reactions from other messages", () => {
      const collector = new ReactionCollector(mockMessage);

      mockClient.emit("messageReact", createMockMessage("wrong-msg"), "👍", "user-1");

      expect(collector.collected.size).toBe(0);
      expect(collector.total).toBe(0);
      expect(collector.users.size).toBe(0);
    });

    it("should collect a brand new reaction and resolve user from cache fallback", () => {
      const collector = new ReactionCollector(mockMessage);

      mockClient.emit("messageReact", mockMessage, "👍", "user-1");

      expect(collector.collected.size).toBe(1);
      expect(collector.total).toBe(1);
      expect(collector.users.has("user-1")).toBe(true);
    });

    it("should update an existing reaction when a new user reacts with the same emoji", () => {
      const collector = new ReactionCollector(mockMessage);

      mockClient.users.cache.set("user-2", { id: "user-2", bot: false });

      mockClient.emit("messageReact", mockMessage, "👍", "user-1");

      mockClient.emit("messageReact", mockMessage, "👍", "user-2");

      expect(collector.collected.size).toBe(1); // Still 1 emoji group
      expect(collector.total).toBe(2); // But 2 total reactions
      expect(collector.users.size).toBe(2);

      const reaction: any = collector.collected.get("👍");
      expect(reaction.users.size).toBe(2);
      expect(reaction.users.get("user-2")).toEqual({ id: "user-2", bot: false });
    });

    it("should safely abort handleMessageReact execution if stopped synchronously (line 62 check)", () => {
      const collector = new ReactionCollector(mockMessage);

      collector.on("collect", () => {
        collector.stop("manual_abort");
      });

      mockClient.emit("messageReact", mockMessage, "👍", "user-1");

      expect(collector.ended).toBe(true);

      expect(collector.total).toBe(0);
      expect(collector.users.size).toBe(0);
    });
  });

  describe("Removing Reactions (messageUnreact)", () => {
    it("should ignore unreacts for different messages", () => {
      const collector = new ReactionCollector(mockMessage);
      mockClient.emit("messageReact", mockMessage, "👍", "user-1");

      mockClient.emit("messageUnreact", createMockMessage("wrong-msg"), "👍", "user-1");

      expect(collector.collected.size).toBe(1);
      const reaction: any = collector.collected.get("👍");
      expect(reaction.users.size).toBe(1);
    });

    it("should ignore unreacts for emojis not currently collected", () => {
      const collector = new ReactionCollector(mockMessage);
      mockClient.emit("messageReact", mockMessage, "👍", "user-1");

      mockClient.emit("messageUnreact", mockMessage, "👎", "user-1");

      expect(collector.collected.size).toBe(1);
    });

    it("should remove the user from the reaction but keep the reaction if other users remain", () => {
      const collector = new ReactionCollector(mockMessage, { dispose: true });
      mockClient.emit("messageReact", mockMessage, "👍", "user-1");
      mockClient.emit("messageReact", mockMessage, "👍", "user-2");

      mockClient.emit("messageUnreact", mockMessage, "👍", "user-1");

      expect(collector.collected.has("👍")).toBe(true);
      const reaction: any = collector.collected.get("👍");
      expect(reaction.users.has("user-1")).toBe(false);
      expect(reaction.users.has("user-2")).toBe(true);
    });

    it("should trigger handleDispose and remove the reaction entirely if users size reaches 0", () => {
      const collector = new ReactionCollector(mockMessage, { dispose: true });
      mockClient.emit("messageReact", mockMessage, "👍", "user-1");

      const disposeSpy = vi.spyOn(collector, "dispose");

      mockClient.emit("messageUnreact", mockMessage, "👍", "user-1");

      expect(collector.collected.has("👍")).toBe(false);
      expect(disposeSpy).toHaveBeenCalled();
    });
  });

  describe("Limits and Stopping (endReason)", () => {
    it("should not return an end reason prematurely", () => {
      const collector = new ReactionCollector(mockMessage, { max: 5, maxUsers: 5 });
      expect(collector.endReason()).toBeNull();
    });

    it("should stop with reason 'limit' when max collected is reached", () => {
      const collector = new ReactionCollector(mockMessage, { max: 2 });

      mockClient.emit("messageReact", mockMessage, "👍", "user-1");
      expect(collector.ended).toBe(false);

      mockClient.emit("messageReact", mockMessage, "👎", "user-2");

      expect(collector.ended).toBe(true);
      expect(collector.endReason()).toBe("limit");
    });

    it("should stop with reason 'userLimit' when maxUsers is reached", () => {
      const collector = new ReactionCollector(mockMessage, { maxUsers: 2 });

      mockClient.emit("messageReact", mockMessage, "👍", "user-1");
      mockClient.emit("messageReact", mockMessage, "👎", "user-1");
      expect(collector.ended).toBe(false);
      expect(collector.users.size).toBe(1);

      mockClient.emit("messageReact", mockMessage, "👍", "user-2");

      expect(collector.ended).toBe(true);
      expect(collector.endReason()).toBe("userLimit");
      expect(collector.users.size).toBe(2);
    });
  });
});
