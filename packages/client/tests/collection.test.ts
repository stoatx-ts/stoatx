import { describe, it, expect } from "vitest";
import { Collection } from "../src";

describe("Collection Utility", () => {
  describe("Cache Limit (FIFO) Logic", () => {
    it("should enforce the maximum cache limit and drop oldest items", () => {
      const cache = new Collection<string, number>(3);

      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      expect(cache.size).toBe(3);

      cache.set("d", 4);
      expect(cache.size).toBe(3);
      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.get("d")).toBe(4);
    });

    it("should not drop items if updating an existing key while at the limit", () => {
      const cache = new Collection<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);

      cache.set("a", 99);
      expect(cache.size).toBe(2);
      expect(cache.get("a")).toBe(99);
      expect(cache.has("b")).toBe(true);
    });

    it("should refuse to store items entirely if the limit is 0", () => {
      const cache = new Collection<string, number>(0);
      cache.set("a", 1);

      expect(cache.size).toBe(0);
      expect(cache.has("a")).toBe(false);
    });

    it("should safely handle negative limits without throwing (hitting undefined oldestKey)", () => {
      const cache = new Collection<string, number>(-1);

      cache.set("a", 1);

      expect(cache.size).toBe(1);
      expect(cache.get("a")).toBe(1);
    });
  });

  describe("Array-like Utility Methods", () => {
    it("should find the first matching item", () => {
      const cache = new Collection<string, { role: string }>();
      cache.set("1", { role: "Member" });
      cache.set("2", { role: "Admin" });
      cache.set("3", { role: "Moderator" });

      const admin = cache.find((val) => val.role === "Admin");
      expect(admin).toBeDefined();
      expect(admin?.role).toBe("Admin");

      const notFound = cache.find((val) => val.role === "Owner");
      expect(notFound).toBeUndefined();
    });

    it("should filter items into a brand new Collection", () => {
      const cache = new Collection<string, { bot: boolean }>();
      cache.set("1", { bot: true });
      cache.set("2", { bot: false });
      cache.set("3", { bot: true });

      const bots = cache.filter((val) => val.bot);

      expect(bots).toBeInstanceOf(Collection);
      expect(bots.size).toBe(2);
      expect(bots.has("1")).toBe(true);
      expect(bots.has("2")).toBe(false);
    });

    it("should map items into a native Array", () => {
      const cache = new Collection<string, { name: string }>();
      cache.set("1", { name: "Alice" });
      cache.set("2", { name: "Bob" });

      const names = cache.map((val) => val.name);

      expect(Array.isArray(names)).toBe(true);
      expect(names).toEqual(["Alice", "Bob"]);
    });

    it("should retrieve the first and last items correctly", () => {
      const cache = new Collection<number, string>();

      expect(cache.first()).toBeUndefined();
      expect(cache.last()).toBeUndefined();

      cache.set(1, "First Element");
      cache.set(2, "Middle Element");
      cache.set(3, "Last Element");

      expect(cache.first()).toBe("First Element");
      expect(cache.last()).toBe("Last Element");
    });

    it("should correctly identify if some items match a condition", () => {
      const cache = new Collection<string, { active: boolean }>();
      cache.set("1", { active: false });
      cache.set("2", { active: true });

      expect(cache.some((val) => val.active)).toBe(true);
      expect(cache.some((val) => val.active === null)).toBe(false); // intentional mismatch
    });
  });
});
