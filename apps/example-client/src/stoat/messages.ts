import { AttachmentBuilder, type BaseChannel, type Message, type SystemMessage } from "@stoatx/client";
import { client } from "./client";
import type { ClientEventName } from "./watch";

/**
 * Read helpers for the message list, and sending. Like the other helpers, they read the caches
 * during render; the message list re-renders on the events below.
 */

/** Events that change what the message list shows. */
export const MESSAGE_EVENTS: ClientEventName[] = [
  "messageCreate",
  "messageUpdate",
  "messageDelete",
  "messageDeleteBulk",
  // Names, avatars and role colours of the authors.
  "userUpdate",
  "serverMemberUpdate",
];

/** Stoat's limit on a message's length. */
export const MAX_MESSAGE_LENGTH = 2000;

/** The ID Stoat uses as the author of system messages ("X joined", "Y pinned a message"…). */
const SYSTEM_AUTHOR_ID = "00000000000000000000000000";

/**
 * A channel's cached messages, oldest first. The cache is in arrival order: older pages loaded
 * later end up at the end. Message IDs are ULIDs, which sort by time.
 */
export function getSortedMessages(channel: BaseChannel): Message[] {
  return [...channel.messages.cache.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
}

export type ContentSegment = { type: "text"; text: string } | { type: "mention"; text: string };

export interface AttachmentView {
  id: string;
  /** The original file, to open or download. */
  url: string;
  /** A smaller version to show, made by the CDN. For non-images the CDN redirects to the original. */
  previewUrl: string;
  name: string;
  size: number;
  /** For images: the size to reserve, so the list doesn't jump when the image loads. */
  image: { width: number; height: number } | null;
}

/** Everything the UI needs to show a message, as plain values. */
export interface MessageView {
  id: string;
  authorId: string;
  authorName: string;
  avatarUrl: string | null;
  /**
   * The colour of the author's highest coloured role, in servers: any CSS colour, or a CSS
   * gradient such as `linear-gradient(…)`.
   */
  color: string | null;
  createdAt: Date;
  edited: boolean;
  /** For system messages, what happened ("Alice joined"); `null` for normal messages. */
  system: string | null;
  segments: ContentSegment[];
  attachments: AttachmentView[];
  /** The first message this one replies to, if it's cached. */
  reply: { authorName: string; text: string } | null;
}

/** The name, avatar and colour to show for a message's author. */
function describeAuthor(message: Message): Pick<MessageView, "authorName" | "avatarUrl" | "color"> {
  const user = message.author;
  const member = message.member;

  // Webhooks and bridges can show a different name and avatar per message.
  const masquerade = message.masquerade;

  // The highest role with a colour decides; roles with a lower rank are higher in the list.
  // Colours can be gradients; the UI paints those onto the text.
  const roleColor =
    member?.roleIds
      .map((id) => member.server?.roles.cache.get(id))
      .filter((role) => role?.color)
      .sort((a, b) => a!.rank - b!.rank)[0]?.color ?? null;

  return {
    authorName: masquerade?.name ?? member?.nickname ?? user?.displayName ?? user?.username ?? "Unknown user",
    // Previews, not the original files: avatars are shown at 40px.
    avatarUrl: masquerade?.avatar ?? member?.avatarURL ?? user?.displayAvatarURL ?? null,
    color: masquerade?.colour ?? roleColor,
  };
}

/** A user's name for system messages, from the cache. */
function userName(id: string): string {
  const user = client.users.cache.get(id);
  return user ? (user.displayName ?? user.username) : "Someone";
}

/** Says what a system message is about, e.g. "Alice joined" or "Bob pinned a message". */
export function describeSystemMessage(system: SystemMessage): string {
  switch (system.type) {
    case "text":
      return system.content;
    case "user_added":
      return `${userName(system.by)} added ${userName(system.id)}`;
    case "user_remove":
      return `${userName(system.by)} removed ${userName(system.id)}`;
    case "user_joined":
      return `${userName(system.id)} joined`;
    case "user_left":
      return `${userName(system.id)} left`;
    case "user_kicked":
      return `${userName(system.id)} was kicked`;
    case "user_banned":
      return `${userName(system.id)} was banned`;
    case "channel_renamed":
      return `${userName(system.by)} renamed the channel to ${system.name}`;
    case "channel_description_changed":
      return `${userName(system.by)} changed the channel description`;
    case "channel_icon_changed":
      return `${userName(system.by)} changed the channel icon`;
    case "channel_ownership_changed":
      return `${userName(system.from)} gave ownership to ${userName(system.to)}`;
    case "message_pinned":
      return `${userName(system.by)} pinned a message`;
    case "message_unpinned":
      return `${userName(system.by)} unpinned a message`;
    case "call_started":
      return `${userName(system.by)} started a call`;
    default:
      return "System message";
  }
}

const MENTION = /<([@#%])([0-9A-HJKMNP-TV-Z]{26})>/g;

/** Splits content into text and mentions, with mentions resolved to names from the caches. */
export function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let last = 0;
  for (const match of content.matchAll(MENTION)) {
    const [whole, kind, id] = match;
    if (match.index > last) segments.push({ type: "text", text: content.slice(last, match.index) });
    let name: string | undefined;
    if (kind === "@") {
      const user = client.users.cache.get(id!);
      name = user && `@${user.displayName ?? user.username}`;
    } else if (kind === "#") {
      const channel = client.channels.cache.get(id!);
      name = channel && "name" in channel ? `#${channel.name}` : undefined;
    } else {
      for (const server of client.servers.cache.values()) {
        const role = server.roles.cache.get(id!);
        if (role) name = `@${role.name}`;
      }
    }
    segments.push(name ? { type: "mention", text: name } : { type: "text", text: whole });
    last = match.index + whole.length;
  }
  if (last < content.length) segments.push({ type: "text", text: content.slice(last) });
  return segments;
}

export function toMessageView(message: Message): MessageView {
  const replyTo = message.replies?.[0] ? message.channel?.messages.cache.get(message.replies[0]) : undefined;
  return {
    id: message.id,
    authorId: message.authorId,
    ...describeAuthor(message),
    createdAt: message.createdAt,
    edited: message.editedAt !== null,
    system: message.system
      ? describeSystemMessage(message.system)
      : message.authorId === SYSTEM_AUTHOR_ID
        ? "System message"
        : null,
    segments: message.content ? parseContent(message.content) : [],
    attachments: message.attachments.map((attachment) => {
      const metadata = attachment.metadata as { type: string; width?: number; height?: number };
      return {
        id: attachment.id,
        url: attachment.url,
        previewUrl: attachment.previewURL,
        name: attachment.filename,
        size: attachment.size,
        image:
          metadata.type === "Image" && metadata.width && metadata.height
            ? { width: metadata.width, height: metadata.height }
            : null,
      };
    }),
    reply: replyTo
      ? {
          authorName: describeAuthor(replyTo).authorName,
          text: replyTo.content ?? (replyTo.attachments.length > 0 ? "Attachment" : ""),
        }
      : null,
  };
}

/**
 * Sends a message with optional files. Files picked in the browser are `File`s, which are `Blob`s,
 * so AttachmentBuilder takes them as they are.
 *
 * See https://stoatx-ts.github.io/stoatx/guide/browsers-and-runtimes#uploading-files-from-the-page
 */
export async function sendMessage(channel: BaseChannel, content: string, files: File[]): Promise<void> {
  const text = content.trim();
  await channel.send({
    ...(text ? { content: text } : {}),
    ...(files.length > 0 ? { attachments: files.map((file) => new AttachmentBuilder(file, file.name)) } : {}),
  });
}
