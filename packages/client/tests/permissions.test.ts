import { describe, it, expect } from "vitest";
import { PermissionFlags, Permissions } from "../src";

describe("Permissions Utility", () => {
  it("should initialize with 0n by default", () => {
    const perms = new Permissions();
    expect(perms.bitfield).toBe(0n);
  });

  it("should correctly check for specific permissions", () => {
    // Replace 32n and 4n with actual exported bit constants if you have them!
    const manageServerBit = Permissions.Flags.ManageServer;
    const perms = new Permissions(manageServerBit);

    expect(perms.has("ManageServer")).toBe(true);

    expect(perms.has("BanMembers")).toBe(false);
  });

  it("should correctly add and remove permissions", () => {
    const perms = new Permissions(0n);

    perms.add("KickMembers");
    expect(perms.has("KickMembers")).toBe(true);
    expect(perms.bitfield).toBe(PermissionFlags.KickMembers);

    perms.remove("KickMembers");
    expect(perms.has("KickMembers")).toBe(false);
  });

  it("should correctly return true if any permissions are present", () => {
    const perms = new Permissions(0n);
    expect(perms.any(["ManageServer", "KickMembers"])).toBe(false);

    perms.add("ManageServer");
    expect(perms.any(["ManageServer", "KickMembers"])).toBe(true);
  });

  describe("missing() method", () => {
    it("should return all specified permissions if the instance is empty", () => {
      const perms = new Permissions(0n);
      const required: ("ManageServer" | "KickMembers")[] = ["ManageServer", "KickMembers"];

      const missing = perms.missing(required);

      expect(missing).toEqual(["ManageServer", "KickMembers"]);
    });

    it("should only return the permissions that are actually missing", () => {
      const perms = new Permissions(Permissions.Flags.ManageServer);
      const required: ("ManageServer" | "KickMembers")[] = ["ManageServer", "KickMembers"];

      const missing = perms.missing(required);

      expect(missing).toEqual(["KickMembers"]);
    });

    it("should return an empty array if no permissions are missing", () => {
      const perms = new Permissions();
      perms.add("ManageServer", "KickMembers");

      const required: ("ManageServer" | "KickMembers")[] = ["ManageServer", "KickMembers"];
      const missing = perms.missing(required);

      expect(missing).toEqual([]);
    });
  });
});
