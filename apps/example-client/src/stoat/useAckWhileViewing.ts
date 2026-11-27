import { useEffect } from "react";
import type { BaseChannel } from "@stoatx/client";
import { useClientVersion } from "./useClientVersion";

/** Wait a moment, so scrolling past the bottom or a burst of messages sends one ack. */
const DELAY_MS = 500;

/**
 * Marks `channel` as read while the user is looking at its latest messages: when they scroll to
 * the bottom, and when new messages arrive while they're there. The ack is saved on the server
 * and reaches the user's other devices.
 *
 * `viewing` should be true only when the latest messages are on screen and the tab is visible.
 *
 * See https://stoatx-ts.github.io/stoatx/guide/user-accounts#unread-messages
 */
export function useAckWhileViewing(channel: BaseChannel, viewing: boolean): void {
  const version = useClientVersion(["messageCreate", "channelAck"]);

  useEffect(() => {
    // `unread` is a getter over the read state, so this also skips channels that are already read.
    if (!viewing || !channel.unread) return;
    const timer = setTimeout(() => {
      channel.ack().catch(() => {
        // Not worth bothering the user: the next message or scroll tries again.
      });
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [channel, viewing, version]);
}
