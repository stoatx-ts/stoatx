import { Avatar, Badge, NavLink } from "@mantine/core";
import { Link } from "react-router";
import { ChannelIcon, type ChannelIconKind } from "./ChannelIcon";

interface ChannelLinkProps {
  label: string;
  kind: ChannelIconKind;
  to: string;
  active: boolean;
  unread: boolean;
  mentionCount: number;
  /** For DMs and groups: shown instead of the channel symbol. */
  avatarUrl?: string | null;
}

/** A channel in the sidebar: bold when unread, with a badge counting mentions. */
export function ChannelLink({ label, kind, to, active, unread, mentionCount, avatarUrl }: ChannelLinkProps) {
  const withAvatar = kind === "dm" || kind === "group";
  return (
    <NavLink
      component={Link}
      to={to}
      active={active}
      label={label}
      noWrap
      c={active || unread ? "bright" : "dimmed"}
      fw={unread ? 700 : 500}
      leftSection={
        withAvatar ? (
          <Avatar src={avatarUrl ?? null} name={label} color="initials" size={28} />
        ) : (
          <ChannelIcon kind={kind} />
        )
      }
      rightSection={
        mentionCount > 0 ? (
          <Badge size="sm" color="red" variant="filled" circle={mentionCount < 10}>
            {mentionCount > 99 ? "99+" : mentionCount}
          </Badge>
        ) : null
      }
      styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
    />
  );
}
