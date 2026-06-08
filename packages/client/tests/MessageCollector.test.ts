import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";
import { type Message, BaseChannel, MessageCollector } from "../src";

// Create a lightweight mock Client using EventEmitter to test real event binding
class MockClient extends EventEmitter {}

describe("MessageCollector", () => {
  let mockClient: MockClient;
  let mockChannel: BaseChannel;

  beforeEach(() => {
    vi.useFakeTimers();
    mockClient = new MockClient();

    // Cast to BaseChannel to satisfy TypeScript
    mockChannel = {
      id: "target-channel-123",
      client: mockClient,
    } as unknown as BaseChannel;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // Helper function to generate mock messages
  const createMockMessage = (id: string, channelId: string = "target-channel-123"): Message => {
    return { id, channelId } as Message;
  };

  describe("Initialization and Event Binding", () => {
    it("should correctly initialize and bind event listeners to the client", () => {
      const collector = new MessageCollector(mockChannel);

      expect(collector.channelId).toBe("target-channel-123");
      expect(collector.total).toBe(0);
      expect(collector.processed).toBe(0);

      // The client should now have listeners for messageCreate and messageDelete
      expect(mockClient.listenerCount("messageCreate")).toBe(1);
      expect(mockClient.listenerCount("messageDelete")).toBe(1);
    });

    it("should remove client event listeners when stopped", () => {
      const collector = new MessageCollector(mockChannel);

      collector.stop("user");

      // The listener cleanup happens synchronously on the "end" event
      expect(mockClient.listenerCount("messageCreate")).toBe(0);
      expect(mockClient.listenerCount("messageDelete")).toBe(0);
    });
  });

  describe("Collection Logic and Counters", () => {
    it("should collect a message from the target channel", () => {
      const collector = new MessageCollector(mockChannel);
      const message = createMockMessage("msg-1");

      mockClient.emit("messageCreate", message);

      expect(collector.processed).toBe(1);
      expect(collector.total).toBe(1);
      expect(collector.collected.size).toBe(1);
      expect(collector.collected.get("msg-1")).toBe(message);
    });

    it("should completely ignore messages from other channels", () => {
      const collector = new MessageCollector(mockChannel);
      const wrongMessage = createMockMessage("msg-2", "wrong-channel");

      // Hits the falsy branch in collect() and handleCollect()
      mockClient.emit("messageCreate", wrongMessage);

      expect(collector.processed).toBe(0); // Should not even process it
      expect(collector.total).toBe(0);
      expect(collector.collected.size).toBe(0);

      // Explicitly check the collect() method override's falsy branch
      expect(collector.collect(wrongMessage)).toBeNull();
    });

    it("should increment processed but NOT total if a message fails the filter", () => {
      const collector = new MessageCollector(mockChannel, {
        filter: () => false, // Reject all messages
      });
      const message = createMockMessage("msg-3");

      mockClient.emit("messageCreate", message);

      // It was processed, but not successfully collected
      expect(collector.processed).toBe(1);
      expect(collector.total).toBe(0);
      expect(collector.collected.size).toBe(0);
    });
  });

  describe("Disposal Logic", () => {
    it("should dispose of a collected message when messageDelete is emitted", () => {
      const collector = new MessageCollector(mockChannel, { dispose: true });
      const message = createMockMessage("msg-4");

      // 1. Collect it
      mockClient.emit("messageCreate", message);
      expect(collector.collected.has("msg-4")).toBe(true);

      // 2. Dispose it
      mockClient.emit("messageDelete", message);
      expect(collector.collected.has("msg-4")).toBe(false);
    });

    it("should return null in dispose() if the deleted message is from another channel", () => {
      const collector = new MessageCollector(mockChannel, { dispose: true });
      const wrongMessage = createMockMessage("msg-5", "wrong-channel");

      // Hits the falsy branch in dispose()
      expect(collector.dispose(wrongMessage)).toBeNull();
    });
  });

  describe("Limits and Stopping (endReason)", () => {
    it("should not return an end reason prematurely", () => {
      const collector = new MessageCollector(mockChannel, { max: 5 });
      expect(collector.endReason()).toBeNull();
    });

    it("should stop with reason 'limit' when max collected is reached", () => {
      const collector = new MessageCollector(mockChannel, { max: 2 });
      const onEnd = vi.fn();
      collector.on("end", onEnd);

      mockClient.emit("messageCreate", createMockMessage("msg-1"));
      expect(collector.ended).toBe(false);

      mockClient.emit("messageCreate", createMockMessage("msg-2"));

      expect(collector.ended).toBe(true);
      expect(collector.total).toBe(2);
      expect(onEnd).toHaveBeenCalledWith(collector.collected, "limit");
    });

    it("should stop with reason 'processedLimit' when maxProcessed is reached", () => {
      const collector = new MessageCollector(mockChannel, {
        maxProcessed: 2,
        filter: () => false, // None of them pass, so total stays 0
      });
      const onEnd = vi.fn();
      collector.on("end", onEnd);

      mockClient.emit("messageCreate", createMockMessage("msg-1"));
      expect(collector.ended).toBe(false);

      mockClient.emit("messageCreate", createMockMessage("msg-2"));

      expect(collector.ended).toBe(true);
      expect(collector.processed).toBe(2);
      expect(collector.total).toBe(0);
      expect(onEnd).toHaveBeenCalledWith(collector.collected, "processedLimit");
    });

    it("should safely abort handleCollect execution if stopped synchronously during the collect event (line 62 check)", () => {
      const collector = new MessageCollector(mockChannel);

      collector.on("collect", () => {
        collector.stop("manual_abort");
      });

      mockClient.emit("messageCreate", createMockMessage("msg-abort"));

      expect(collector.ended).toBe(true);
      expect(collector.processed).toBe(1);

      expect(collector.total).toBe(0);
    });
  });
});
