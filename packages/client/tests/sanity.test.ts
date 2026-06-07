import { describe, it, expect } from "vitest";

describe("Infrastructure Sanity Check", () => {
  it("should successfully run a basic math test", () => {
    expect(1 + 1).toBe(2);
  });
});
