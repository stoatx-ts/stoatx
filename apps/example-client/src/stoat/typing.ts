import { useCallback, useEffect, useRef } from "react";
import type { BaseChannel } from "@stoatx/client";
import { client } from "./client";
import type { ClientEventName } from "./watch";

/**
 * Typing indicators, both ways.
 *
 * See https://stoatx-ts.github.io/stoatx/guide/user-accounts#typing-indicators
 */

export const TYPING_EVENTS: ClientEventName[] = ["typingStart", "typingStop"];

/** Like the official client: stop the indicator after a second without input. */
const IDLE_MS = 1000;

/**
 * Tells others when the user types in `channel`. Call `onInput` on every keystroke: the client
 * sends at most one event every 2.5 seconds. `stop` ends it, e.g. on blur; sending a message ends
 * it on the server's side.
 */
export function useTypingNotifier(channel: BaseChannel): { onInput: () => void; stop: () => void } {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const typing = useRef(false);

  const stop = useCallback(() => {
    clearTimeout(timer.current);
    // Only tell the server if there's an indicator to end.
    if (!typing.current) return;
    typing.current = false;
    channel.stopTyping();
  }, [channel]);

  const onInput = useCallback(() => {
    typing.current = true;
    channel.startTyping();
    clearTimeout(timer.current);
    timer.current = setTimeout(stop, IDLE_MS);
  }, [channel, stop]);

  // Leaving the channel ends the indicator there.
  useEffect(() => stop, [stop]);

  return { onInput, stop };
}

/** The names of everyone else typing in `channel`. */
export function getTypingNames(channel: BaseChannel): string[] {
  return [...channel.typingUserIds]
    .filter((id) => id !== client.user?.id)
    .map((id) => {
      const user = client.users.cache.get(id);
      return user?.displayName ?? user?.username ?? "Someone";
    });
}
