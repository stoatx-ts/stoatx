import { Collection } from "../utils/Collection";
import type { Client } from "../client/Client";

/**
 * Minimal contract for structures that support in-place patching.
 * Patch payloads are usually partial (gateway updates rarely send every field).
 */
export interface Patchable<RawData> {
  _patch(data: Partial<RawData>): void;
}

/**
 * @template K The type of the cache keys (usually string)
 * @template Holds The type of the Structure this manager holds
 * @template RawData The raw API/gateway payload shape used to construct/patch `Holds`
 */
export abstract class BaseManager<K, Holds, RawData = unknown> {
  public cache: Collection<K, Holds>;
  public client: Client;

  protected constructor(client: Client, limit: number = Infinity) {
    this.client = client;
    this.cache = new Collection<K, Holds>(limit);
  }

  /**
   * Defines how to extract the unique ID from a raw API payload.
   * @internal
   */
  protected abstract extractId(data: RawData): K;

  /**
   * Defines how to construct a new instance of the Structure.
   * @internal
   */
  protected abstract construct(data: RawData): Holds;

  /**
   * Transforms raw data into a Structure, patches if existing, and saves to cache.
   * @internal
   */
  _add(data: RawData): Holds {
    const id = this.extractId(data);
    const existing = this.cache.get(id);

    if (existing && this.isPatchable(existing)) {
      existing._patch(data);
      return existing;
    }

    const structure = this.construct(data);
    this.cache.set(id, structure);
    return structure;
  }

  private isPatchable(value: Holds): value is Holds & Patchable<RawData> {
    return typeof (value as Partial<Patchable<RawData>>)._patch === "function";
  }
}
