/**
 * The app's URLs. The URL holds what's selected (server and channel), so there's no separate
 * "selected channel" state to keep in sync, and links and the back button just work.
 */
export const paths = {
  /** Home: DMs and groups. */
  home: () => "/channels/@me",
  /** A DM, group or Saved Notes. */
  direct: (channelId: string) => `/channels/@me/${channelId}`,
  /** A server, or one of its channels. */
  server: (serverId: string, channelId?: string) =>
    channelId ? `/servers/${serverId}/${channelId}` : `/servers/${serverId}`,
};
