import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Collector, type CollectorOptions, Client } from "../src";

vi.mock("../client/Client", () => ({
  Client: vi.fn(),
}));

vi.mock("./Collection", () => ({
  Collection: class MockCollection extends Map {},
}));

interface DummyItem {
  id: string;
  value: number;
}

class BaseBehaviorCollector extends Collector<string, DummyItem> {
  public constructor(client: Client, options?: CollectorOptions<DummyItem>) {
    super(client, options);
  }
  public collect(item: DummyItem) {
    return item.id;
  }
  public dispose(item: DummyItem) {
    return item.id;
  }
}

class TestCollector extends Collector<string, DummyItem> {
  constructor(client: Client, options?: CollectorOptions<DummyItem>) {
    super(client, options);
  }

  public override collect(item: DummyItem): string | null {
    return item.id === "ignore" ? null : item.id;
  }

  public override dispose(item: DummyItem): string | null {
    return item.id === "ignore" ? null : item.id;
  }

  public customEndCondition = false;
  public override endReason(): string | null {
    return this.customEndCondition ? "custom_reason" : null;
  }
}

describe("Collector", () => {
  let dummyClient: Client;

  beforeEach(() => {
    vi.useFakeTimers();
    dummyClient = new Client();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Initialization and Filtering", () => {
    it("should initialize with default options", () => {
      const collector = new TestCollector(dummyClient);

      expect(collector.client).toBe(dummyClient);
      expect(collector.ended).toBe(false);
      expect(collector.collected).toBeInstanceOf(Map);
      expect(collector.options).toEqual({});
    });

    it("should collect items that pass the filter", () => {
      const collector = new TestCollector(dummyClient, {
        filter: (item) => item.value > 10,
      });

      const onCollect = vi.fn();
      collector.on("collect", onCollect);

      const passItem = { id: "1", value: 15 };
      const failItem = { id: "2", value: 5 };

      collector.handleCollect(passItem);
      collector.handleCollect(failItem);

      expect(collector.collected.size).toBe(1);
      expect(collector.collected.get("1")).toBe(passItem);

      expect(onCollect).toHaveBeenCalledTimes(1);
      expect(onCollect).toHaveBeenCalledWith(passItem);
    });
  });

  describe("Disposal", () => {
    it("should remove items when disposed if dispose option is true", () => {
      const collector = new TestCollector(dummyClient, { dispose: true });
      const item = { id: "1", value: 20 };

      const onDispose = vi.fn();
      collector.on("dispose", onDispose);

      collector.handleCollect(item);
      expect(collector.collected.has("1")).toBe(true);

      collector.handleDispose(item);
      expect(collector.collected.has("1")).toBe(false);
      expect(onDispose).toHaveBeenCalledWith(item);
    });

    it("should ignore disposal if dispose option is false or undefined", () => {
      const collector = new TestCollector(dummyClient);
      const item = { id: "1", value: 20 };

      collector.handleCollect(item);
      collector.handleDispose(item);

      expect(collector.collected.has("1")).toBe(true);
    });
  });

  describe("Timeouts and Stopping", () => {
    it("should stop automatically after the configured time", () => {
      const collector = new TestCollector(dummyClient, { time: 5000 });
      const onEnd = vi.fn();
      collector.on("end", onEnd);

      vi.advanceTimersByTime(4999);
      expect(collector.ended).toBe(false);

      vi.advanceTimersByTime(1);
      expect(collector.ended).toBe(true);
      expect(onEnd).toHaveBeenCalledWith(collector.collected, "time");
    });

    it("should stop automatically after idle time", () => {
      const collector = new TestCollector(dummyClient, { idle: 2000 });
      const onEnd = vi.fn();
      collector.on("end", onEnd);

      vi.advanceTimersByTime(1000);
      collector.handleCollect({ id: "1", value: 100 });
      expect(collector.ended).toBe(false);

      vi.advanceTimersByTime(1500);
      expect(collector.ended).toBe(false);

      vi.advanceTimersByTime(500);
      expect(collector.ended).toBe(true);
      expect(onEnd).toHaveBeenCalledWith(collector.collected, "idle");
    });

    it("should stop when checkEnd triggers an end reason", () => {
      const collector = new TestCollector(dummyClient);
      const onEnd = vi.fn();
      collector.on("end", onEnd);

      collector.customEndCondition = true;

      collector.handleCollect({ id: "1", value: 100 });

      expect(collector.ended).toBe(true);
      expect(onEnd).toHaveBeenCalledWith(collector.collected, "custom_reason");
    });

    it("should clean up listeners when stopped", () => {
      const collector = new TestCollector(dummyClient);
      const onCollect = vi.fn();
      collector.on("collect", onCollect);

      collector.stop("user");

      collector.handleCollect({ id: "1", value: 100 });

      expect(collector.collected.size).toBe(0);
      expect(onCollect).not.toHaveBeenCalled();
      expect(collector.listenerCount("collect")).toBe(0);
    });

    it("should return null by default for endReason()", () => {
      const collector = new BaseBehaviorCollector(dummyClient);

      expect(collector.endReason()).toBeNull();
    });
  });

  describe("Async Iterator", () => {
    it("should yield collected items asynchronously", async () => {
      vi.useRealTimers();
      const collector = new TestCollector(dummyClient);

      const items: DummyItem[] = [];

      const consumePromise = (async () => {
        for await (const [_key, value] of collector) {
          items.push(value);
        }
      })();

      const item1 = { id: "1", value: 10 };
      const item2 = { id: "2", value: 20 };

      collector.handleCollect(item1);

      await Promise.resolve();
      collector.handleCollect(item2);

      collector.stop();

      await consumePromise;

      expect(items).toHaveLength(2);
      expect(items[0]).toEqual(item1);
      expect(items[1]).toEqual(item2);
    });

    it("should gracefully resolve pending promises when stopped while waiting", async () => {
      vi.useRealTimers();
      const collector = new TestCollector(dummyClient);

      const iterator = collector[Symbol.asyncIterator]();

      const nextPromise = iterator.next();

      await Promise.resolve();

      collector.stop("forced");

      const result = await nextPromise;

      expect(result.done).toBe(true);
      expect(result.value).toBeUndefined();
    });
  });

  describe("Edge Cases and Early Returns", () => {
    it("should ignore handleCollect and handleDispose if already ended", () => {
      const collector = new TestCollector(dummyClient, { dispose: true });
      collector.stop();

      collector.handleCollect({ id: "1", value: 10 });
      expect(collector.collected.size).toBe(0);

      collector.handleDispose({ id: "1", value: 10 });
    });

    it("should ignore stop() if already ended", () => {
      const collector = new TestCollector(dummyClient);

      collector.stop();

      const emitSpy = vi.spyOn(collector, "emit");

      collector.stop();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it("should do nothing if collect() or dispose() returns null", () => {
      const collector = new TestCollector(dummyClient, { dispose: true });

      const nullItem = { id: "ignore", value: 0 };

      collector.handleCollect(nullItem);
      expect(collector.collected.size).toBe(0);

      collector.handleCollect({ id: "valid", value: 10 });

      collector.handleDispose(nullItem);
      expect(collector.collected.has("valid")).toBe(true);
    });

    it("should ignore items in async iterator if collect() returns null", async () => {
      vi.useRealTimers();
      const collector = new TestCollector(dummyClient);
      const iterator = collector[Symbol.asyncIterator]();

      const nextPromise = iterator.next();

      await Promise.resolve();

      collector.emit("collect", { id: "ignore", value: 0 });

      collector.emit("collect", { id: "valid", value: 10 });

      const result = await nextPromise;

      expect(result.value).toEqual(["valid", { id: "valid", value: 10 }]);

      collector.stop();
    });
  });
});
