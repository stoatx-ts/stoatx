import { useEffect } from "react";
import type { Server } from "@stoatx/client";
import { watchClient } from "./watch";

/** A subscription lasts 15 minutes; renew it well before then. */
const RENEW_EVERY_MS = 10 * 60 * 1000;

/**
 * Keeps the gateway sending presence and member updates for the server on screen.
 *
 * User sessions only get these after subscribing, a subscription lasts 15 minutes, and a
 * connection keeps at most 5 (the least recently used is dropped). So: subscribe when the server
 * is shown, renew on a timer, and again after a reconnect, which starts without subscriptions.
 *
 * See https://stoatx-ts.github.io/stoatx/guide/user-accounts#server-presence
 */
export function useServerSubscription(server: Server | undefined): void {
  useEffect(() => {
    if (!server) return;
    const subscribe = () => server.subscribe();
    subscribe();
    const timer = setInterval(subscribe, RENEW_EVERY_MS);
    const stopWatching = watchClient(["ready"], subscribe);
    return () => {
      clearInterval(timer);
      stopWatching();
    };
  }, [server]);
}
