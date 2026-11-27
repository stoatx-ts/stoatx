import { Text } from "@mantine/core";
import type { BaseChannel } from "@stoatx/client";
import { getTypingNames, TYPING_EVENTS } from "../../stoat/typing";
import { useClientVersion } from "../../stoat/useClientVersion";

function describe(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} is typing…`;
  if (names.length <= 3) return `${names.slice(0, -1).join(", ")} and ${names.at(-1)} are typing…`;
  return "Several people are typing…";
}

/** "Alice is typing…" above the composer. Always takes up its line, so the layout doesn't jump. */
export function TypingLine({ channel }: { channel: BaseChannel }) {
  useClientVersion([...TYPING_EVENTS, "userUpdate"]);
  return (
    <Text size="xs" c="dimmed" h={20} truncate aria-live="polite">
      {describe(getTypingNames(channel))}
    </Text>
  );
}
