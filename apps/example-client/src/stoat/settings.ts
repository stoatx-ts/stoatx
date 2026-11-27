import { client } from "./client";

/**
 * Synced settings this app reads. These keys are written by the official Stoat client, so the
 * app follows what the user set up there, e.g. the order of their servers.
 *
 * See https://stoatx-ts.github.io/stoatx/guide/user-accounts#synced-settings
 */

/**
 * The server list's order: `{ serverSidebar?: string[], servers?: string[] }`.
 * `serverSidebar` holds server and folder IDs; `servers` is the older format, servers only.
 */
const ORDERING_KEY = "ordering";

/** Server folders: `{ folders: [{ id, name, servers: string[], … }] }`. */
const FOLDERS_KEY = "server-folders";

export interface ServerFolder {
  id: string;
  name: string;
  /** The folder's servers, in order. */
  servers: string[];
}

export interface ServerListLayout {
  /** Server and folder IDs, in the order the user arranged them. */
  sidebar: string[];
  folders: ServerFolder[];
}

/**
 * Loads the settings the layout needs. Called before the layout is shown, so the server list
 * doesn't jump around once they arrive. (Asking for them in the gateway's Ready payload, with
 * `ready=user_settings[...]`, doesn't work on current Stoat instances.)
 */
export async function loadSyncedSettings(): Promise<void> {
  const missing = [ORDERING_KEY, FOLDERS_KEY].filter((key) => !client.settings.cache.has(key));
  if (missing.length === 0) return;
  try {
    await client.settings.fetch(missing);
  } catch {
    // Not fatal: the servers are shown in the client's order instead.
  }
}

/** Keeps the strings from something that should be a string array, since settings are user data. */
function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/** The server list's order and folders, as the official client saved them. Empty if it never did. */
export function getServerListLayout(): ServerListLayout {
  const ordering = client.settings.getJSON<{ serverSidebar?: unknown; servers?: unknown }>(ORDERING_KEY);
  const sidebar = stringArray(ordering?.serverSidebar ?? ordering?.servers);

  const rawFolders = client.settings.getJSON<{ folders?: unknown }>(FOLDERS_KEY)?.folders;
  const folders = (Array.isArray(rawFolders) ? rawFolders : []).flatMap((folder: unknown): ServerFolder[] => {
    if (typeof folder !== "object" || folder === null) return [];
    const { id, name, servers } = folder as Record<string, unknown>;
    if (typeof id !== "string") return [];
    return [{ id, name: typeof name === "string" ? name : "", servers: stringArray(servers) }];
  });

  return { sidebar, folders };
}
