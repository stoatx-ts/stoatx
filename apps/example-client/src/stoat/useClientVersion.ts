import { useCallback, useRef, useSyncExternalStore } from "react";
import { watchClient, type ClientEventName } from "./watch";

/**
 * A number that changes whenever one of `events` fires.
 *
 * Calling it re-renders the component on those events. Read the client's data during render, and
 * use the version as a dependency for anything you memoize: the structures are the same objects
 * before and after a change, so React can't tell they changed on its own.
 *
 * See https://stoatx-ts.github.io/stoatx/guide/frameworks#react
 */
export function useClientVersion(events: ClientEventName[]): number {
  const version = useRef(0);
  const key = events.join();
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      watchClient(events, () => {
        version.current++;
        onStoreChange();
      }),
    // `events` is usually a new array each render; resubscribe only when its contents change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return useSyncExternalStore(subscribe, () => version.current);
}
