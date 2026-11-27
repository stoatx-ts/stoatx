import {
  IconBookmark,
  IconHash,
  IconHelpCircle,
  IconMessageCircle,
  IconUsersGroup,
  IconVolume,
} from "@tabler/icons-react";

export type ChannelIconKind = "text" | "voice" | "dm" | "group" | "saved" | "unknown";

const ICONS = {
  text: IconHash,
  voice: IconVolume,
  dm: IconMessageCircle,
  group: IconUsersGroup,
  saved: IconBookmark,
  unknown: IconHelpCircle,
} as const;

/** The symbol for a kind of channel, e.g. `#` for text channels. */
export function ChannelIcon({ kind, size = 18 }: { kind: ChannelIconKind; size?: number }) {
  const Icon = ICONS[kind];
  return <Icon size={size} stroke={1.75} />;
}
