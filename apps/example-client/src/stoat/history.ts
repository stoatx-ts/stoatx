import { useSyncExternalStore } from "react";
import type { BaseChannel } from "@stoatx/client";
import { client } from "./client";
import { describeError } from "./errors";

/**
 * Loading a channel's message history: the latest page when it's opened, then older pages as the
 * user scrolls up. The messages themselves live in `channel.messages.cache`; this only tracks
 * what has been loaded.
 *
 * See https://stoatx-ts.github.io/stoatx/guide/frameworks#react
 */

/** Messages per request. The API allows up to 100. */
const PAGE_SIZE = 50;

export interface HistoryState {
  status: "idle" | "loading" | "loaded" | "error";
  /** Whether there may be older messages to load. `false` once the start of the channel is reached. */
  hasMoreOlder: boolean;
  loadingOlder: boolean;
  error: string | null;
}

const IDLE: HistoryState = { status: "idle", hasMoreOlder: true, loadingOlder: false, error: null };

const states = new Map<string, HistoryState>();
const listeners = new Set<() => void>();

function update(channelId: string, patch: Partial<HistoryState>): void {
  states.set(channelId, { ...(states.get(channelId) ?? IDLE), ...patch });
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The history state of a channel; re-renders when it changes. */
export function useHistory(channelId: string): HistoryState {
  return useSyncExternalStore(subscribe, () => states.get(channelId) ?? IDLE);
}

/**
 * Loads the latest messages, once per channel. `includeUsers` also caches the authors (and, in
 * servers, their members), so their names and avatars can be shown.
 */
export async function loadLatest(channel: BaseChannel): Promise<void> {
  const state = states.get(channel.id) ?? IDLE;
  if (state.status === "loading" || state.status === "loaded") return;

  update(channel.id, { status: "loading", error: null });
  try {
    const page = await channel.messages.fetchMany({ limit: PAGE_SIZE, sort: "Latest", includeUsers: true });
    update(channel.id, { status: "loaded", hasMoreOlder: page.size === PAGE_SIZE });
  } catch (error) {
    update(channel.id, { status: "error", error: describeError(error) });
  }
}

/** Loads the page before the oldest cached message, when the user scrolls to the top. */
export async function loadOlder(channel: BaseChannel): Promise<void> {
  const state = states.get(channel.id) ?? IDLE;
  if (state.status !== "loaded" || !state.hasMoreOlder || state.loadingOlder) return;

  // Message IDs are ULIDs, which sort by time as plain strings.
  let oldest: string | undefined;
  for (const id of channel.messages.cache.keys()) if (oldest === undefined || id < oldest) oldest = id;
  if (!oldest) return;

  update(channel.id, { loadingOlder: true });
  try {
    const page = await channel.messages.fetchMany({
      limit: PAGE_SIZE,
      before: oldest,
      sort: "Latest",
      includeUsers: true,
    });
    update(channel.id, { loadingOlder: false, hasMoreOlder: page.size === PAGE_SIZE });
  } catch {
    // Leave hasMoreOlder as it is, so scrolling up again retries.
    update(channel.id, { loadingOlder: false });
  }
}

// After a reconnect, messages sent while the client was offline are missing from the caches, and
// there's no way to tell where the gap is. Start over: drop what was loaded and load it again.
const onReady = () => {
  if (states.size === 0) return;
  for (const channelId of states.keys()) client.channels.cache.get(channelId)?.messages.cache.clear();
  states.clear();
  listeners.forEach((listener) => listener());
};
// The client has already emptied its caches; just forget what was loaded.
const onLogout = () => {
  states.clear();
  listeners.forEach((listener) => listener());
};

client.on("ready", onReady);
client.on("logout", onLogout);
import.meta.hot?.dispose(() => {
  client.off("ready", onReady);
  client.off("logout", onLogout);
});
