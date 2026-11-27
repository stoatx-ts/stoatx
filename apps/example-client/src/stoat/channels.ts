import { DMChannel, GroupChannel, TextChannel, VoiceChannel, type BaseChannel, type Server } from "@stoatx/client";
import { client } from "./client";
import { getServerListLayout, type ServerFolder } from "./settings";
import type { ClientEventName } from "./watch";

/**
 * Read helpers for the server rail and channel lists. They only read the client's caches; call
 * them during render, in a component that re-renders on the events listed below.
 */

/** Events that change unread dots and mention badges. */
export const UNREAD_EVENTS: ClientEventName[] = ["messageCreate", "channelAck"];

/** Events that change the server list. `settingsUpdate`: the user reordered it on another device. */
export const SERVER_LIST_EVENTS: ClientEventName[] = [
  "serverCreate",
  "serverUpdate",
  "serverDelete",
  "settingsUpdate",
  ...UNREAD_EVENTS,
];

/** Events that change a server's channel list: channels, categories, unreads. */
export const SERVER_CHANNEL_EVENTS: ClientEventName[] = [
  "channelCreate",
  "channelUpdate",
  "channelDelete",
  "serverUpdate",
  ...UNREAD_EVENTS,
];

/** Events that change the DM and group list: new conversations, names, avatars, members, unreads. */
export const DIRECT_CHANNEL_EVENTS: ClientEventName[] = [
  "channelCreate",
  "channelUpdate",
  "channelDelete",
  "channelGroupJoin",
  "channelGroupLeave",
  "userUpdate",
  ...UNREAD_EVENTS,
];

export type ChannelKind = "text" | "voice" | "dm" | "group" | "saved" | "unknown";

/** What the UI needs to show a channel, whatever its type. */
export interface ChannelSummary {
  id: string;
  kind: ChannelKind;
  name: string;
  description: string | null;
  /** An icon or avatar, if the channel has one. */
  iconUrl: string | null;
}

export function describeChannel(channel: BaseChannel): ChannelSummary {
  const base = { id: channel.id, description: null, iconUrl: null };

  // VoiceChannel extends TextChannel, so check it first.
  if (channel instanceof VoiceChannel) {
    return { ...base, kind: "voice", name: channel.name, description: channel.description ?? null };
  }
  if (channel instanceof TextChannel) {
    return { ...base, kind: "text", name: channel.name, description: channel.description ?? null };
  }
  if (channel instanceof GroupChannel) {
    return {
      ...base,
      kind: "group",
      name: channel.name,
      description: channel.description ?? null,
      iconUrl: channel.icon?.previewURL ?? null,
    };
  }
  if (channel instanceof DMChannel) {
    // A DM's name and picture are the other person's.
    const otherId = channel.recipients.find((id) => id !== client.user?.id);
    const other = otherId ? client.users.cache.get(otherId) : undefined;
    return {
      ...base,
      kind: "dm",
      name: other ? (other.displayName ?? other.username) : "Unknown user",
      iconUrl: other?.displayAvatarURL ?? null,
    };
  }
  // Saved Notes has no class of its own in @stoatx/client yet.
  if (channel.type === "SavedMessages") {
    return { ...base, kind: "saved", name: "Saved Notes", description: "Only you can see these messages." };
  }
  return { ...base, kind: "unknown", name: "Unknown channel" };
}

// --- Servers ------------------------------------------------------------------------------------

/**
 * The user's servers, in the order they arranged them in the official client.
 *
 * This follows the official client's rules. The sidebar order lists servers and folders; a
 * folder's servers appear where the folder is (this app doesn't draw folders, so they're simply
 * inlined). A server in a folder is shown with its folder, even if it's also listed on its own.
 * Servers missing from the order, e.g. ones joined since, go at the end.
 */
export function getServers(): Server[] {
  const { sidebar, folders } = getServerListLayout();
  const folderById = new Map(folders.map((folder) => [folder.id, folder]));
  const folderOf = new Map<string, ServerFolder>();
  for (const folder of folders) {
    // A server can only be in one folder; the first one wins.
    for (const id of folder.servers) if (!folderOf.has(id)) folderOf.set(id, folder);
  }

  const servers: Server[] = [];
  const added = new Set<string>();
  const add = (id: string) => {
    const server = client.servers.cache.get(id);
    if (!server || added.has(id)) return; // Left the server, or already shown.
    added.add(id);
    servers.push(server);
  };

  const drawnFolders = new Set<ServerFolder>();
  // The saved order first, then every server, so the ones missing from it end up last.
  for (const id of [...sidebar, ...client.servers.cache.keys()]) {
    const folder = folderById.get(id) ?? folderOf.get(id);
    if (!folder) {
      add(id);
    } else if (!drawnFolders.has(folder)) {
      drawnFolders.add(folder);
      folder.servers.forEach(add);
    }
  }
  return servers;
}

export interface ChannelSection {
  id: string;
  /** The category's name, or `null` for channels outside any category. */
  title: string | null;
  channels: TextChannel[];
}

/**
 * A server's channels grouped like the official client shows them: channels outside any category
 * first, then each category, in the server's order.
 */
export function getServerSections(server: Server): ChannelSection[] {
  const channels = server.channelIds
    .map((id) => client.channels.cache.get(id))
    .filter((channel): channel is TextChannel => channel instanceof TextChannel);
  const byId = new Map(channels.map((channel) => [channel.id, channel]));

  const inCategory = new Set<string>();
  const categories = (server.categories ?? []).map((category) => ({
    id: category.id,
    title: category.title,
    channels: category.channels.flatMap((id) => {
      const channel = byId.get(id);
      if (!channel) return [];
      inCategory.add(id);
      return [channel];
    }),
  }));

  const uncategorized = { id: "uncategorized", title: null, channels: channels.filter((c) => !inCategory.has(c.id)) };
  return [uncategorized, ...categories].filter((section) => section.channels.length > 0);
}

/** The channel to open when a server is selected without one. */
export function getDefaultChannelId(server: Server): string | undefined {
  const channels = getServerSections(server).flatMap((section) => section.channels);
  return (channels.find((channel) => !(channel instanceof VoiceChannel)) ?? channels[0])?.id;
}

// --- DMs and groups -----------------------------------------------------------------------------

/** Saved Notes, DMs and groups, i.e. every channel that isn't in a server. */
export function isDirectChannel(channel: BaseChannel): boolean {
  return channel instanceof DMChannel || channel instanceof GroupChannel || channel.type === "SavedMessages";
}

/** Sorts by most recent message, falling back to when the channel was created. Both IDs are ULIDs. */
function lastActivity(channel: BaseChannel): string {
  return (channel as { lastMessageId?: string | null }).lastMessageId ?? channel.id;
}

/**
 * Saved Notes first, then DMs and groups with the most recent conversation on top. DMs that were
 * closed (`active: false`) are left out, like in the official client.
 */
export function getDirectChannels(): BaseChannel[] {
  const channels = [...client.channels.cache.values()].filter(
    (channel) => isDirectChannel(channel) && !(channel instanceof DMChannel && !channel.active),
  );
  return channels.sort((a, b) => {
    if (a.type === "SavedMessages") return -1;
    if (b.type === "SavedMessages") return 1;
    return lastActivity(a) < lastActivity(b) ? 1 : -1;
  });
}

/** Unread state for the Home button: DMs and groups. */
export function getDirectUnreads(): { unread: boolean; mentionCount: number } {
  const channels = getDirectChannels();
  return {
    unread: channels.some((channel) => channel.unread),
    mentionCount: channels.reduce((total, channel) => total + channel.mentionCount, 0),
  };
}
