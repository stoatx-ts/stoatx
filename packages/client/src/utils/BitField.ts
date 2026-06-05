export type BitFieldResolvable = number | string | bigint | BitField | BitFieldResolvable[];

export class BitField {
  public static Flags: Record<string, number | bigint> = {};
  public static DefaultBit: number | bigint = 0;

  public bitfield: number | bigint;

  constructor(bits?: BitFieldResolvable) {
    this.bitfield = (this.constructor as typeof BitField).resolve(
      bits ?? (this.constructor as typeof BitField).DefaultBit,
    );
  }

  /**
   * Checks whether this bitfield has any of the given bits set.
   *
   * @param bit The bit(s) to test against.
   * @returns `true` if at least one of the provided bits is set.
   *
   * @example
   * perms.any(['SendMessage', 'ManageChannel']); // true if either is set
   */
  public any(bit: BitFieldResolvable): boolean {
    const resolved = (this.constructor as typeof BitField).resolve(bit);
    if (typeof this.bitfield === "bigint" && typeof resolved === "bigint") {
      return (this.bitfield & resolved) !== BigInt(0);
    }
    return (Number(this.bitfield) & Number(resolved)) !== 0;
  }

  /**
   * Checks whether this bitfield is exactly equal to the given bit value.
   *
   * @param bit The bit(s) to compare against.
   * @returns `true` if the resolved bit value is identical to this bitfield.
   *
   * @example
   * new Permissions(0n).equals(0n); // true
   */
  public equals(bit: BitFieldResolvable): boolean {
    return this.bitfield === (this.constructor as typeof BitField).resolve(bit);
  }

  /**
   * Checks whether this bitfield has *all* of the given bits set.
   *
   * @param bit The bit(s) to check for.
   * @returns `true` if every provided bit is set in this bitfield.
   *
   * @example
   * perms.has('SendMessage');
   * perms.has(['SendMessage', 'ViewChannel']); // true only if both are set
   */
  public has(bit: BitFieldResolvable, ..._hasParams: any[]): boolean {
    const resolvedBit = (this.constructor as typeof BitField).resolve(bit);
    if (typeof this.bitfield === "bigint" && typeof resolvedBit === "bigint") {
      return (this.bitfield & resolvedBit) === resolvedBit;
    }
    return (Number(this.bitfield) & Number(resolvedBit)) === Number(resolvedBit);
  }

  /**
   * Returns the flag names present in `bits` that are *missing* from this bitfield.
   *
   * @param bits The bits to check against.
   * @returns An array of flag name strings that are in `bits` but not in this bitfield.
   *
   * @example
   * // If perms only has SendMessage:
   * perms.missing(['SendMessage', 'ManageChannel']); // ['ManageChannel']
   */
  public missing(bits: BitFieldResolvable, ...hasParams: any[]): string[] {
    return new (this.constructor as typeof BitField)(bits).remove(this).toArray(...hasParams);
  }

  /**
   * Freezes this BitField instance, making it immutable.
   * Subsequent calls to `add()` or `remove()` will return a new instance instead of mutating this one.
   *
   * @returns This instance, frozen.
   */
  public freeze(): Readonly<this> {
    return Object.freeze(this);
  }

  /**
   * Adds one or more bits to this bitfield.
   * If the instance is frozen, returns a new BitField with the bits added.
   *
   * @param bits The bit(s) to add.
   * @returns This instance (or a new one if frozen), with the bits added.
   *
   * @example
   * perms.add('SendMessage', 'ViewChannel');
   */
  public add(...bits: BitFieldResolvable[]): this {
    let total = (this.constructor as typeof BitField).DefaultBit;
    for (const bit of bits) {
      const resolved = (this.constructor as typeof BitField).resolve(bit);
      if (typeof total === "bigint" && typeof resolved === "bigint") {
        total |= resolved;
      } else {
        total = Number(total) | Number(resolved);
      }
    }
    if (typeof this.bitfield === "bigint" && typeof total === "bigint") {
      if (Object.isFrozen(this)) return new (this.constructor as typeof BitField)(this.bitfield | total) as this;
      this.bitfield |= total;
    } else {
      if (Object.isFrozen(this))
        return new (this.constructor as typeof BitField)(Number(this.bitfield) | Number(total)) as this;
      this.bitfield = Number(this.bitfield) | Number(total);
    }
    return this;
  }

  /**
   * Removes one or more bits from this bitfield.
   * If the instance is frozen, returns a new BitField with the bits removed.
   *
   * @param bits The bit(s) to remove.
   * @returns This instance (or a new one if frozen), with the bits cleared.
   *
   * @example
   * perms.remove('ManageChannel');
   */
  public remove(...bits: BitFieldResolvable[]): this {
    let total = (this.constructor as typeof BitField).DefaultBit;
    for (const bit of bits) {
      const resolved = (this.constructor as typeof BitField).resolve(bit);
      if (typeof total === "bigint" && typeof resolved === "bigint") {
        total |= resolved;
      } else {
        total = Number(total) | Number(resolved);
      }
    }
    if (typeof this.bitfield === "bigint" && typeof total === "bigint") {
      if (Object.isFrozen(this)) return new (this.constructor as typeof BitField)(this.bitfield & ~total) as this;
      this.bitfield &= ~total;
    } else {
      if (Object.isFrozen(this))
        return new (this.constructor as typeof BitField)(Number(this.bitfield) & ~Number(total)) as this;
      this.bitfield = Number(this.bitfield) & ~Number(total);
    }
    return this;
  }

  /**
   * Serializes this bitfield to a plain object mapping each flag name to a boolean
   * indicating whether that flag is set.
   *
   * @returns A record of `{ [flagName]: boolean }` for all defined flags.
   *
   * @example
   * perms.serialize();
   * // { SendMessage: true, ManageChannel: false, ... }
   */
  public serialize(...hasParams: any[]): Record<string, boolean> {
    const serialized: Record<string, boolean> = {};
    for (const [flag, bit] of Object.entries((this.constructor as typeof BitField).Flags)) {
      if (isNaN(Number(flag))) serialized[flag] = this.has(bit, ...hasParams);
    }
    return serialized;
  }

  /**
   * Returns an array of flag names that are set in this bitfield.
   *
   * @returns An array of string flag names.
   *
   * @example
   * perms.toArray(); // ['SendMessage', 'ViewChannel']
   */
  public toArray(...hasParams: any[]): string[] {
    return [...this[Symbol.iterator](...hasParams)];
  }

  /**
   * Returns the bitfield value as a JSON-safe primitive.
   * Numbers are returned as-is; bigints are converted to their string representation
   * to avoid JSON serialization errors.
   */
  public toJSON(): number | string {
    return typeof this.bitfield === "number" ? this.bitfield : this.bitfield.toString();
  }

  /**
   * Returns the underlying numeric value of this bitfield.
   * Allows BitField instances to be used directly in arithmetic expressions.
   */
  public valueOf(): number | bigint {
    return this.bitfield;
  }

  /**
   * Iterates over the names of all flags that are set in this bitfield.
   *
   * @example
   * for (const flag of perms) {
   *   console.log(flag); // 'SendMessage', 'ViewChannel', etc.
   * }
   */
  public *[Symbol.iterator](...hasParams: any[]): IterableIterator<string> {
    for (const bitName of Object.keys((this.constructor as typeof BitField).Flags)) {
      if (isNaN(Number(bitName)) && this.has(bitName, ...hasParams)) yield bitName;
    }
  }

  /**
   * Resolves a {@link BitFieldResolvable} into a raw `number | bigint`.
   *
   * Resolution rules (in order):
   * - `undefined` → `DefaultBit`
   * - A number or bigint matching `DefaultBit`'s type and >= 0 → returned as-is
   * - A `BitField` instance → its `.bitfield` value
   * - An array → each element resolved and OR'd together
   * - A numeric string → parsed as `BigInt` or `Number` depending on `DefaultBit`'s type
   * - A named string flag → looked up in `Flags`
   * - Anything else → throws `RangeError`
   *
   * @param bit The value to resolve.
   * @throws {RangeError} If the value cannot be resolved to a valid bit.
   */
  public static resolve(bit?: BitFieldResolvable): number | bigint {
    const { DefaultBit } = this;
    if (bit === undefined) return DefaultBit;
    if (typeof DefaultBit === typeof bit && (bit as any) >= DefaultBit) return bit as number | bigint;
    if (bit instanceof BitField) return bit.bitfield;
    if (Array.isArray(bit)) {
      return bit
        .map((b: BitFieldResolvable) => this.resolve(b))
        .reduce((prev: number | bigint, b: number | bigint) => {
          if (typeof prev === "bigint" && typeof b === "bigint") return prev | b;
          return Number(prev) | Number(b);
        }, DefaultBit);
    }

    if (typeof bit === "string") {
      if (!isNaN(Number(bit))) return typeof DefaultBit === "bigint" ? BigInt(bit) : Number(bit);
      if (this.Flags[bit] !== undefined) return this.Flags[bit];
    }

    throw new RangeError(`Invalid bitfield flag or number: ${String(bit)}`);
  }
}