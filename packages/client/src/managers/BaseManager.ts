import { inspectCustom } from "../utils/inspect";
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
 * Managers that can turn a resolvable into a cached structure or an ID.
 * @internal
 */
export interface Resolver<R, Holds> {
  resolve(resolvable: R): Holds | undefined;
  resolveId(resolvable: R): string;
}

type StructureClass<T> = Function & { prototype: T };

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

  /**
   * Resolves a structure instance, or an ID/mention string, to a cached structure.
   * @param value The structure instance, ID or mention to resolve.
   * @param holds The structure class this manager holds, used for the `instanceof` check.
   * @param mention Characters to strip from mention strings (e.g. `/[<@>]/g`).
   * @internal
   */
  protected resolveFromCache(value: unknown, holds: StructureClass<Holds>, mention: RegExp): Holds | undefined {
    if (value instanceof holds) return value as Holds;
    if (typeof value === "string") return this.cache.get(value.replace(mention, "") as K);
    return undefined;
  }

  /**
   * Extracts the ID from a structure instance, or an ID/mention string.
   * @param value The structure instance, ID or mention to read the ID from.
   * @param holds The structure class to accept instances of.
   * @param mention Characters to strip from mention strings (e.g. `/[<@>]/g`).
   * @throws {TypeError} If the value is neither.
   * @internal
   */
  protected resolveIdFrom(value: unknown, holds: StructureClass<{ id: string }>, mention: RegExp): string {
    if (value instanceof holds) return (value as { id: string }).id;
    if (typeof value === "string") return value.replace(mention, "");
    throw new TypeError(`Invalid resolvable provided. Expected a ${holds.name} object or a string ID/mention.`);
  }

  /**
   * Returns the cached structure unless `force` is set, otherwise requests it and caches the result.
   * @internal
   */
  protected async fetchWithCache<R>(
    this: BaseManager<K, Holds, RawData> & Resolver<R, Holds>,
    resolvable: R,
    force: boolean,
    request: (id: string) => Promise<RawData>,
  ): Promise<Holds> {
    if (!force) {
      const cached = this.resolve(resolvable);
      if (cached) return cached;
    }
    return this._add(await request(this.resolveId(resolvable)));
  }

  /**
   * Customizes how Node.js prints this manager with `console.log` and `util.inspect`:
   * it prints the cached structures instead of the manager itself. Ignored in browsers.
   * @internal
   */
  [inspectCustom]() {
    return this.cache;
  }

  private isPatchable(value: Holds): value is Holds & Patchable<RawData> {
    return typeof (value as Partial<Patchable<RawData>>)._patch === "function";
  }
}
