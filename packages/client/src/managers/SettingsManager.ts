import type { Client } from "../client/Client";
import { Collection } from "../utils/Collection";
import { assertUserSession } from "../utils/assertUserSession";

/** One synced setting. */
export interface SyncedSetting {
  /** The setting's value, as stored on the server. Clients usually store JSON here. */
  value: string;
  /** When the setting was last changed, in milliseconds since the epoch. */
  updatedAt: number;
}

/** Raw settings as the API sends them: `[updatedAt, value]` per key. */
type RawSettings = Record<string, [number, string]>;

/**
 * Settings synced between the user's devices, such as theme or notification preferences
 * (user sessions only). Available as `client.settings`.
 *
 * Stoat stores each setting as a string under a key, without looking at it, so apps can
 * pick their own keys and formats. Most store JSON, which {@link getJSON} and {@link set} handle.
 *
 * The cache is kept up to date from the user's other devices. Listen to `settingsUpdate` to react.
 *
 * @example
 * await client.settings.fetch(["appearance"]);
 * const appearance = client.settings.getJSON<{ theme: string }>("appearance");
 *
 * await client.settings.set({ appearance: { theme: "dark" } });
 */
export class SettingsManager {
  /** Settings loaded so far, by key. */
  public readonly cache = new Collection<string, SyncedSetting>();

  /**
   * @param client The client this manager belongs to.
   */
  constructor(private readonly client: Client) {}

  /**
   * Gets a setting's raw value from the cache.
   * @param key The setting's key.
   * @returns The value, or `undefined` if it isn't loaded or doesn't exist.
   */
  public get(key: string): string | undefined {
    return this.cache.get(key)?.value;
  }

  /**
   * Gets a setting from the cache and parses it as JSON.
   * @param key The setting's key.
   * @returns The parsed value, or `undefined` if it isn't loaded, doesn't exist, or isn't valid JSON.
   */
  public getJSON<T = unknown>(key: string): T | undefined {
    const value = this.get(key);
    if (value === undefined) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }

  /**
   * Loads settings from the server into the cache.
   * @param keys The keys to load. Keys that don't exist are left out of the result.
   * @returns The loaded settings, by key.
   */
  public async fetch(keys: string[]): Promise<Collection<string, SyncedSetting>> {
    assertUserSession(this.client, "settings.fetch");
    const data = await this.client.rest.post("/sync/settings/fetch", { keys });
    const result = new Collection<string, SyncedSetting>();
    for (const [key, [updatedAt, value]] of Object.entries(data as RawSettings)) {
      const setting = { value, updatedAt };
      this.cache.set(key, setting);
      result.set(key, setting);
    }
    return result;
  }

  /**
   * Saves settings and syncs them to the user's other devices. Strings are stored as-is;
   * anything else is stored as JSON. Keys that aren't passed are left unchanged.
   * @param settings The settings to save, by key.
   * @example
   * await client.settings.set({ appearance: { theme: "dark" }, locale: JSON.stringify("en") });
   */
  public async set(settings: Record<string, unknown>): Promise<void> {
    assertUserSession(this.client, "settings.set");
    const values: Record<string, string> = {};
    for (const [key, value] of Object.entries(settings)) {
      values[key] = typeof value === "string" ? value : JSON.stringify(value);
    }

    // The server echoes the change back with this timestamp, which _applyUpdate() skips.
    const updatedAt = Date.now();
    // `query` keeps every key in the body, even ones named like a query parameter (e.g. "limit").
    await this.client.rest.post("/sync/settings/set", values, { query: { timestamp: updatedAt } });
    for (const [key, value] of Object.entries(values)) this.cache.set(key, { value, updatedAt });
  }

  /**
   * Replaces the cache with the settings from the `Ready` payload.
   * @param data The `user_settings` field.
   * @internal
   */
  public _setAll(data: RawSettings): void {
    this.cache.clear();
    for (const [key, [updatedAt, value]] of Object.entries(data)) this.cache.set(key, { value, updatedAt });
  }

  /**
   * Applies a `UserSettingsUpdate` from the gateway, skipping keys the cache already has
   * at the same or a newer time (such as the echo of this client's own {@link set}).
   * @param data The changed settings.
   * @returns The settings that changed.
   * @internal
   */
  public _applyUpdate(data: RawSettings): Collection<string, SyncedSetting> {
    const changed = new Collection<string, SyncedSetting>();
    for (const [key, [updatedAt, value]] of Object.entries(data)) {
      const cached = this.cache.get(key);
      if (cached && cached.updatedAt >= updatedAt) continue;
      const setting = { value, updatedAt };
      this.cache.set(key, setting);
      changed.set(key, setting);
    }
    return changed;
  }
}
