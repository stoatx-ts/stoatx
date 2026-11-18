import { Client } from "../client/Client";

/**
 * The base class for all structures.
 */
export abstract class Base {
  public readonly id: string;
  public cachedAt: number = Date.now();
  protected readonly client: Client;

  protected constructor(client: Client, data: { _id: string }) {
    this.id = data._id;
    this.client = client;

    Object.defineProperty(this, "client", {
      value: client,
      enumerable: false,
      writable: false,
    });
  }

  /**
   * Compares this object with another to see if they represent the same entity.
   */
  public equals(other: Base | string): boolean {
    if (typeof other === "string") return this.id === other;
    return other instanceof Base && this.id === other.id;
  }

  /**
   * Returns the UUID string when the object is cast to a string.
   */
  public toString(): string {
    return this.id;
  }

  /**
   * Creates a snapshot of this structure. Plain nested data (objects and arrays)
   * is copied so later patches to the original do not leak into the snapshot;
   * class instances (client, managers, other structures) are shared by reference.
   */
  public _clone(): this {
    const clone = Object.create(Object.getPrototypeOf(this));
    for (const key of Reflect.ownKeys(this)) {
      const descriptor = Object.getOwnPropertyDescriptor(this, key)!;
      if ("value" in descriptor) descriptor.value = clonePlain(descriptor.value);
      Object.defineProperty(clone, key, descriptor);
    }
    return clone;
  }
}

function clonePlain(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clonePlain);
  if (value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) copy[k] = clonePlain(v);
    return copy;
  }
  return value;
}
