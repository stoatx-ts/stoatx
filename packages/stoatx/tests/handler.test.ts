import "reflect-metadata";
import { describe, it, expect, vi } from "vitest";
import { Client } from "../src/client";
import { DefaultCooldownManager } from "../src/handler";

function createClient() {
  return new Client({ prefix: "!" });
}

function stubEvents(client: Client, handler: () => void) {
  const registry = (client.handler as any).registry;
  vi.spyOn(registry, "autoDiscover").mockResolvedValue(undefined);
  vi.spyOn(registry, "getEvents").mockReturnValue([
    { instance: { onReady: handler }, methodName: "onReady", event: "ready", type: "on" },
  ]);
}

describe("StoatxHandler event listeners", () => {
  it("does not attach listeners twice when init runs again", async () => {
    const client = createClient();
    const onReady = vi.fn();
    stubEvents(client, onReady);

    await client.handler.init();
    await client.handler.init();
    client.emit("ready", {});
    await Promise.resolve();

    expect(client.listenerCount("ready")).toBe(1);
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it("replaces listeners on reload instead of stacking them", async () => {
    const client = createClient();
    stubEvents(client, vi.fn());

    await client.handler.init();
    await client.handler.reload();

    expect(client.listenerCount("ready")).toBe(1);
  });
});

describe("DefaultCooldownManager", () => {
  it("evicts expired entries for users who never return", () => {
    vi.useFakeTimers();
    try {
      const manager = new DefaultCooldownManager();
      const metadata = { name: "ping", cooldown: 1000 } as any;

      manager.set({ authorId: "a" } as any, metadata);
      vi.advanceTimersByTime(120_000);
      manager.set({ authorId: "b" } as any, metadata);

      const users = (manager as any).cooldowns.get("ping") as Map<string, number>;
      expect([...users.keys()]).toEqual(["b"]);
    } finally {
      vi.useRealTimers();
    }
  });
});
