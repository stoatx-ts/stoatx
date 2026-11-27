import type { ClientEvents } from "@stoatx/client";
import { client } from "./client";

export type ClientEventName = keyof ClientEvents;

const subscribers = new Map<ClientEventName, Set<() => void>>();

/**
 * Calls `onChange` when any of `events` fires, at most once per tick.
 *
 * The client updates its structures and caches in place, so a UI framework can't see changes by
 * itself. Events are the signal to re-read them. They come in bursts (connecting, bulk deletes),
 * hence the batching.
 *
 * `ready` and `logout` are always included, because they replace or empty every cache.
 * Returns a function that stops watching.
 *
 * See https://stoatx-ts.github.io/stoatx/guide/frameworks#a-small-helper
 */
export function watchClient(events: ClientEventName[], onChange: () => void): () => void {
  let scheduled = false;
  const notify = () => {
    if (scheduled) return;
    scheduled = true;
    // Let the rest of the burst arrive, then update once.
    queueMicrotask(() => {
      scheduled = false;
      onChange();
    });
  };

  const all = [...new Set<ClientEventName>([...events, "ready", "logout"])];
  for (const event of all) {
    let listeners = subscribers.get(event);
    if (!listeners) {
      // One client listener per event, shared by every watcher, so hundreds of components can
      // watch the same event without hitting the EventEmitter's listener limit.
      const set = (listeners = new Set());
      subscribers.set(event, set);
      client.on(event, () => set.forEach((listener) => listener()));
    }
    listeners.add(notify);
  }

  return () => {
    for (const event of all) subscribers.get(event)?.delete(notify);
  };
}
