import type { ReactNode } from "react";
import { Avatar, Box, Indicator, Tooltip, UnstyledButton } from "@mantine/core";
import { Link } from "react-router";
import classes from "./RailButton.module.css";

interface RailButtonProps {
  /** Shown in the tooltip, and as initials when there's no image or icon. */
  label: string;
  to: string;
  active: boolean;
  unread: boolean;
  mentionCount: number;
  imageUrl?: string | null;
  /** Shown instead of an image or initials, e.g. for the Home button. */
  icon?: ReactNode;
}

/**
 * A round button in the server rail. A pill on the left marks unread messages (or the selected
 * entry), and a red badge counts mentions.
 */
export function RailButton({ label, to, active, unread, mentionCount, imageUrl, icon }: RailButtonProps) {
  return (
    <Box className={classes.root} data-active={active || undefined} data-unread={unread || undefined}>
      <span className={classes.pill} />
      <Tooltip label={label} position="right" withArrow>
        <UnstyledButton component={Link} to={to} aria-label={label} aria-current={active ? "page" : undefined}>
          <Indicator
            disabled={mentionCount === 0}
            label={mentionCount > 99 ? "99+" : mentionCount}
            color="red"
            size={18}
            withBorder
            position="bottom-end"
            offset={6}
          >
            <Avatar
              src={imageUrl ?? null}
              // Without an image or icon, show the name's initials.
              {...(icon ? {} : { name: label, color: "initials" })}
              size={48}
              radius={active ? "md" : "xl"}
              variant={active ? "filled" : "light"}
              className={classes.avatar}
            >
              {icon}
            </Avatar>
          </Indicator>
        </UnstyledButton>
      </Tooltip>
    </Box>
  );
}
