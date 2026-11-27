import type { CSSProperties } from "react";
import { Anchor, Avatar, Box, Group, Paper, Text, Tooltip } from "@mantine/core";
import { IconArrowForwardUp, IconFile, IconInfoCircle } from "@tabler/icons-react";
import classes from "./MessageItem.module.css";

export interface MessageItemData {
  authorName: string;
  avatarUrl: string | null;
  /** Any CSS colour, or a CSS gradient. */
  color: string | null;
  createdAt: Date;
  edited: boolean;
  /** For system messages, what happened; `null` for normal messages. */
  system: string | null;
  segments: ({ type: "text"; text: string } | { type: "mention"; text: string })[];
  attachments: {
    id: string;
    /** The original file, opened on click. */
    url: string;
    /** What's shown in the list. */
    previewUrl: string;
    name: string;
    size: number;
    image: { width: number; height: number } | null;
  }[];
  reply: { authorName: string; text: string } | null;
}

interface MessageItemProps {
  message: MessageItemData;
  /** A follow-up from the same author: no avatar or name, just the content. */
  compact: boolean;
}

const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
const full = new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" });

/** Largest size an image is shown at; the real size is kept for the aspect ratio. */
const MAX_IMAGE = { width: 400, height: 320 };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** A plain colour colours the text; a gradient is painted onto the letters. */
function nameStyle(color: string | null): CSSProperties | undefined {
  if (!color) return undefined;
  if (!color.includes("gradient(")) return { color };
  return {
    backgroundImage: color,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  };
}

/** The size an image is shown at: its own size, scaled down to fit, never up. */
function fitImage({ width, height }: { width: number; height: number }) {
  const scale = Math.min(1, MAX_IMAGE.width / width, MAX_IMAGE.height / height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** One message in the list. */
export function MessageItem({ message, compact }: MessageItemProps) {
  if (message.system !== null) {
    return (
      <Group className={classes.root} gap="sm" wrap="nowrap" c="dimmed" py={4}>
        <Box w={40} style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <IconInfoCircle size={18} />
        </Box>
        <Text size="sm">{message.system}</Text>
        <Text size="xs">{time.format(message.createdAt)}</Text>
      </Group>
    );
  }

  const timestamp = (
    <Tooltip label={full.format(message.createdAt)} openDelay={500}>
      <Text component="time" dateTime={message.createdAt.toISOString()} size="xs" c="dimmed">
        {time.format(message.createdAt)}
      </Text>
    </Tooltip>
  );

  return (
    <Box className={classes.root} data-compact={compact || undefined}>
      {message.reply && (
        <Group gap={6} wrap="nowrap" pl={50} c="dimmed" className={classes.reply}>
          <IconArrowForwardUp size={14} style={{ flexShrink: 0, transform: "scaleX(-1)" }} />
          <Text size="xs" fw={600} style={{ flexShrink: 0 }}>
            {message.reply.authorName}
          </Text>
          <Text size="xs" truncate>
            {message.reply.text}
          </Text>
        </Group>
      )}
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <Box w={40} style={{ flexShrink: 0 }}>
          {compact ? (
            <Box className={classes.hoverTime}>{timestamp}</Box>
          ) : (
            <Avatar src={message.avatarUrl} alt={message.authorName} name={message.authorName} color="initials" />
          )}
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          {!compact && (
            <Group gap="xs" wrap="nowrap">
              <Text fw={600} size="sm" truncate style={nameStyle(message.color)}>
                {message.authorName}
              </Text>
              {timestamp}
            </Group>
          )}
          {message.segments.length > 0 && (
            <Text size="sm" className={classes.content}>
              {message.segments.map((segment, i) =>
                segment.type === "mention" ? (
                  <span key={i} className={classes.mention}>
                    {segment.text}
                  </span>
                ) : (
                  segment.text
                ),
              )}
              {message.edited && (
                <Text component="span" size="xs" c="dimmed" ml={4}>
                  (edited)
                </Text>
              )}
            </Text>
          )}
          {message.attachments.map((attachment) => {
            if (attachment.image) {
              const size = fitImage(attachment.image);
              return (
                // The box has the image's size before it loads, so the list doesn't jump; the
                // image fills it. On narrow screens it shrinks but keeps the aspect ratio.
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className={classes.image}
                  style={{ width: size.width, aspectRatio: `${size.width} / ${size.height}` }}
                >
                  <img src={attachment.previewUrl} alt={attachment.name} loading="lazy" decoding="async" />
                </a>
              );
            }
            return (
              <Paper key={attachment.id} withBorder p="xs" mt={4} maw={400}>
                <Group gap="xs" wrap="nowrap">
                  <IconFile size={20} style={{ flexShrink: 0 }} />
                  <Anchor href={attachment.url} target="_blank" rel="noreferrer" size="sm" truncate>
                    {attachment.name}
                  </Anchor>
                  <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                    {formatSize(attachment.size)}
                  </Text>
                </Group>
              </Paper>
            );
          })}
        </Box>
      </Group>
    </Box>
  );
}
