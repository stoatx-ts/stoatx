import { describe, it, expect } from "vitest";
import { BitField } from "../src"; // Adjust path as needed

class NumberBitField extends BitField {
  public static override Flags: Record<string, number> = {
    READ: 1 << 0,
    WRITE: 1 << 1,
    EXECUTE: 1 << 2,
    ADMIN: 1 << 3,
  };
  public static override DefaultBit = 0;
}

class BigIntBitField extends BitField {
  public static override Flags: Record<string, bigint> = {
    READ: 1n << 0n,
    WRITE: 1n << 1n,
    EXECUTE: 1n << 2n,
    ADMIN: 1n << 3n,
  };
  public static override DefaultBit = 0n;
}

describe("BitField Utility", () => {
  describe("Resolution Logic (static resolve)", () => {
    it("should return DefaultBit when undefined is passed", () => {
      expect(NumberBitField.resolve(undefined)).toBe(0);
      expect(BigIntBitField.resolve(undefined)).toBe(0n);
    });

    it("should return the number/bigint as-is if passed directly", () => {
      expect(NumberBitField.resolve(5)).toBe(5);
      expect(BigIntBitField.resolve(5n)).toBe(5n);
    });

    it("should resolve a BitField instance to its raw value", () => {
      const bitfield = new NumberBitField(3);
      expect(NumberBitField.resolve(bitfield)).toBe(3);
    });

    it("should resolve string flag names using the Flags record", () => {
      expect(NumberBitField.resolve("READ")).toBe(1);
      expect(BigIntBitField.resolve("ADMIN")).toBe(8n);
    });

    it("should parse numeric strings to the correct type based on DefaultBit", () => {
      expect(NumberBitField.resolve("16")).toBe(16);
      expect(BigIntBitField.resolve("16")).toBe(16n);
    });

    it("should resolve arrays by ORing all values together", () => {
      expect(NumberBitField.resolve(["READ", "WRITE"])).toBe(3);
      expect(BigIntBitField.resolve(["READ", "ADMIN"])).toBe(9n);
    });

    it("should throw a RangeError for invalid flags", () => {
      expect(() => NumberBitField.resolve("INVALID_FLAG")).toThrow(RangeError);
      expect(() => NumberBitField.resolve({} as any)).toThrow(RangeError);
    });
  });

  describe("Core Bitwise Checks (has, any, equals)", () => {
    describe("Number implementation", () => {
      it("should accurately check if it has ALL specified bits", () => {
        const perms = new NumberBitField(["READ", "WRITE"]);
        expect(perms.has("READ")).toBe(true);
        expect(perms.has(["READ", "WRITE"])).toBe(true);
        expect(perms.has("EXECUTE")).toBe(false);
        expect(perms.has(["READ", "EXECUTE"])).toBe(false);
      });

      it("should accurately check if it has ANY of the specified bits", () => {
        const perms = new NumberBitField(["READ", "WRITE"]);
        expect(perms.any("READ")).toBe(true);
        expect(perms.any(["WRITE", "EXECUTE"])).toBe(true);
        expect(perms.any("EXECUTE")).toBe(false);
      });

      it("should accurately check exact equality", () => {
        const perms = new NumberBitField("READ");
        expect(perms.equals(1)).toBe(true);
        expect(perms.equals("READ")).toBe(true);
        expect(perms.equals(["READ", "WRITE"])).toBe(false);
      });
    });

    describe("BigInt implementation", () => {
      it("should accurately perform has, any, and equals checks with bigints", () => {
        const perms = new BigIntBitField(["READ", "EXECUTE"]);

        expect(perms.has("READ")).toBe(true);
        expect(perms.has(["READ", "EXECUTE"])).toBe(true);
        expect(perms.has(["READ", "WRITE"])).toBe(false);

        expect(perms.any("WRITE")).toBe(false);
        expect(perms.any(["WRITE", "EXECUTE"])).toBe(true);

        expect(perms.equals(5n)).toBe(true);
        expect(perms.equals(["READ", "EXECUTE"])).toBe(true);
        expect(perms.equals("READ")).toBe(false);
      });
    });
  });

  describe("Mutation (add, remove)", () => {
    it("should add bits correctly", () => {
      const perms = new NumberBitField("READ");
      perms.add("WRITE", "EXECUTE");
      expect(perms.bitfield).toBe(7);
      expect(perms.has(["READ", "WRITE", "EXECUTE"])).toBe(true);
    });

    it("should remove bits correctly", () => {
      const perms = new NumberBitField(["READ", "WRITE", "EXECUTE"]);
      perms.remove("WRITE");
      expect(perms.bitfield).toBe(5);
      expect(perms.has("READ")).toBe(true);
      expect(perms.has("WRITE")).toBe(false);
      expect(perms.has("EXECUTE")).toBe(true);
    });

    it("should add and remove bits correctly for BigInts", () => {
      const perms = new BigIntBitField("READ");
      perms.add("ADMIN");
      expect(perms.bitfield).toBe(9n);

      perms.remove("READ");
      expect(perms.bitfield).toBe(8n);
    });
  });

  describe("Immutability (freeze)", () => {
    it("should freeze the instance", () => {
      const perms = new NumberBitField("READ");
      perms.freeze();
      expect(Object.isFrozen(perms)).toBe(true);
    });

    it("should return a new instance when adding to a frozen bitfield", () => {
      const perms = new NumberBitField("READ").freeze();
      const newPerms = perms.add("WRITE");

      expect(perms.bitfield).toBe(1);
      expect(newPerms.bitfield).toBe(3);
      expect(newPerms).not.toBe(perms);
    });

    it("should return a new instance when adding to a frozen BigInt bitfield", () => {
      const perms = new BigIntBitField("READ").freeze();
      const newPerms = perms.add("WRITE");

      expect(perms.bitfield).toBe(1n);
      expect(newPerms.bitfield).toBe(3n);
      expect(newPerms).not.toBe(perms);
    });

    it("should return a new instance when removing from a frozen bitfield", () => {
      const perms = new BigIntBitField(["READ", "WRITE"]).freeze();
      const newPerms = perms.remove("WRITE");

      expect(perms.bitfield).toBe(3n);
      expect(newPerms.bitfield).toBe(1n);
      expect(newPerms).not.toBe(perms);
    });

    it("should return a new instance when removing from a frozen Number bitfield", () => {
      const perms = new NumberBitField(["READ", "WRITE"]).freeze();

      const newPerms = perms.remove("WRITE");

      expect(perms.bitfield).toBe(3);
      expect(newPerms.bitfield).toBe(1);
      expect(newPerms).not.toBe(perms);
    });
  });

  describe("Extraction and Serialization", () => {
    it("should return missing flags", () => {
      const perms = new NumberBitField(["READ", "EXECUTE"]);
      const missing = perms.missing(["READ", "WRITE", "ADMIN"]);

      expect(missing).toEqual(["WRITE", "ADMIN"]);
    });

    it("should serialize to an object of booleans", () => {
      const perms = new NumberBitField(["READ", "EXECUTE"]);
      const serialized = perms.serialize();

      expect(serialized).toEqual({
        READ: true,
        WRITE: false,
        EXECUTE: true,
        ADMIN: false,
      });
    });

    it("should convert to an array of flag strings", () => {
      const perms = new NumberBitField(["READ", "ADMIN"]);
      expect(perms.toArray()).toEqual(["READ", "ADMIN"]);
    });

    it("should act as an iterable", () => {
      const perms = new NumberBitField(["WRITE", "EXECUTE"]);
      const flags = [];
      for (const flag of perms) {
        flags.push(flag);
      }
      expect(flags).toEqual(["WRITE", "EXECUTE"]);
    });

    it("should serialize to JSON safely", () => {
      const numPerms = new NumberBitField(5);
      expect(numPerms.toJSON()).toBe(5);

      const bigIntPerms = new BigIntBitField(9n);
      expect(bigIntPerms.toJSON()).toBe("9");
    });

    it("should return raw value on valueOf()", () => {
      const numPerms = new NumberBitField(5);
      expect(numPerms.valueOf()).toBe(5);

      const bigIntPerms = new BigIntBitField(9n);
      expect(bigIntPerms.valueOf()).toBe(9n);
    });

    it("should safely ignore numeric keys when serializing (e.g., from enum reverse mappings)", () => {
      NumberBitField.Flags["1"] = 1;

      const perms = new NumberBitField("READ");
      const serialized = perms.serialize();

      expect(serialized).toHaveProperty("READ", true);

      expect(serialized).not.toHaveProperty("1");

      delete NumberBitField.Flags["1"];
    });
  });
});
