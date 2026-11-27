import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert, Box, Button, Center, Loader } from "@mantine/core";
import { useDocumentVisibility } from "@mantine/hooks";
import { IconAlertCircle, IconArrowDown } from "@tabler/icons-react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import type { BaseChannel } from "@stoatx/client";
import { DayDivider } from "../../components/DayDivider";
import { MessageItem } from "../../components/MessageItem";
import { client } from "../../stoat/client";
import { loadLatest, loadOlder, useHistory } from "../../stoat/history";
import { getSortedMessages, MESSAGE_EVENTS, toMessageView, type MessageView } from "../../stoat/messages";
import { useAckWhileViewing } from "../../stoat/useAckWhileViewing";
import { useClientVersion } from "../../stoat/useClientVersion";

/**
 * Virtuoso keeps the scroll position when items are added at the top if the index of the first
 * item goes down by the number added. Start high, so it never goes below zero.
 */
const START_INDEX = 1_000_000;

/** Messages from the same author within this time are grouped under one name and avatar. */
const GROUP_WITHIN_MS = 7 * 60 * 1000;

interface ListContext {
  loadingOlder: boolean;
  /** Shown above the first message once the start of the channel is reached. */
  start: ReactNode | null;
}

/** Height of the header while there may be older messages: room for the spinner. */
const HEADER_HEIGHT = 48;

/**
 * Above the first message: a spinner while older messages load, or the start of the channel.
 * It keeps the same height whether or not it's loading: a header that changes size shifts every
 * message under it.
 */
function ListHeader({ context }: { context?: ListContext }) {
  if (context?.start) return <Box py="xl">{context.start}</Box>;
  return <Center h={HEADER_HEIGHT}>{context?.loadingOlder && <Loader size="sm" />}</Center>;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function isFollowUp(message: MessageView, previous: MessageView | undefined): boolean {
  return (
    !!previous &&
    !message.system &&
    !previous.system &&
    !message.reply &&
    message.authorId === previous.authorId &&
    message.authorName === previous.authorName &&
    message.createdAt.getTime() - previous.createdAt.getTime() < GROUP_WITHIN_MS &&
    isSameDay(message.createdAt, previous.createdAt)
  );
}

/**
 * A channel's messages: loads the latest page on open and older pages when scrolling up, follows
 * new messages while at the bottom, and marks the channel read while its end is on screen.
 */
export function MessageList({ channel, start }: { channel: BaseChannel; start: ReactNode }) {
  const history = useHistory(channel.id);
  // Re-render when messages arrive, change or go away. Pages loaded by fetchMany() don't emit
  // events, so `history` (which changes when a page arrives) is a dependency below too.
  const version = useClientVersion(MESSAGE_EVENTS);
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [atBottom, setAtBottom] = useState(true);
  const visible = useDocumentVisibility() === "visible";

  // Load on open, and again after a reconnect resets the history (status back to "idle").
  useEffect(() => {
    if (history.status === "idle") void loadLatest(channel);
  }, [channel, history.status]);

  const messages = useMemo(
    () => getSortedMessages(channel).map(toMessageView),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channel, version, history],
  );

  // Count the messages loaded above the first one shown, to keep Virtuoso's indexes stable.
  const anchor = useRef<string | null>(null);
  if (anchor.current === null && messages[0]) anchor.current = messages[0].id;
  const olderCount = anchor.current ? messages.filter((m) => m.id < anchor.current!).length : 0;
  const firstItemIndex = START_INDEX - olderCount;

  // Read in followOutput, which Virtuoso calls with the new data already in place.
  const latest = useRef(messages);
  latest.current = messages;

  useAckWhileViewing(channel, history.status === "loaded" && atBottom && visible);

  if (history.status === "error") {
    return (
      <Center style={{ flex: 1 }} p="md">
        <Alert color="red" icon={<IconAlertCircle />} title="Couldn't load messages">
          {history.error}
          <Button mt="sm" size="xs" variant="light" onClick={() => void loadLatest(channel)}>
            Try again
          </Button>
        </Alert>
      </Center>
    );
  }

  if (history.status !== "loaded") {
    return (
      <Center style={{ flex: 1 }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Box pos="relative" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <Virtuoso<MessageView, ListContext>
        ref={virtuoso}
        style={{ flex: 1 }}
        data={messages}
        context={{ loadingOlder: history.loadingOlder, start: history.hasMoreOlder ? null : start }}
        components={{ Header: ListHeader }}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={{ index: "LAST", align: "end" }}
        // Short channels sit at the bottom, above the composer, like in other chat apps.
        alignToBottom
        increaseViewportBy={{ top: 600, bottom: 200 }}
        computeItemKey={(_, message) => message.id}
        // Stick to the bottom as messages arrive, but don't yank the user down while they read
        // older messages, unless it's their own message.
        followOutput={(isAtBottom) =>
          isAtBottom || latest.current.at(-1)?.authorId === client.user?.id ? "smooth" : false
        }
        atBottomThreshold={64}
        atBottomStateChange={setAtBottom}
        startReached={() => void loadOlder(channel)}
        itemContent={(index, message) => {
          const previous = messages[index - firstItemIndex - 1];
          const newDay = !previous || !isSameDay(previous.createdAt, message.createdAt);
          return (
            <>
              {newDay && <DayDivider date={message.createdAt} />}
              <MessageItem message={message} compact={!newDay && isFollowUp(message, previous)} />
            </>
          );
        }}
      />
      {!atBottom && (
        <Button
          size="xs"
          radius="xl"
          variant="filled"
          leftSection={<IconArrowDown size={14} />}
          pos="absolute"
          bottom={12}
          right={16}
          style={{ zIndex: 1 }}
          onClick={() => virtuoso.current?.scrollToIndex({ index: "LAST", behavior: "smooth" })}
        >
          Jump to present
        </Button>
      )}
    </Box>
  );
}
