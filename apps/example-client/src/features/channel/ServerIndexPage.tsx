import { Center, EmptyState } from "@mantine/core";
import { IconHash } from "@tabler/icons-react";
import { Navigate, useParams } from "react-router";
import { getDefaultChannelId, SERVER_CHANNEL_EVENTS } from "../../stoat/channels";
import { client } from "../../stoat/client";
import { useClientVersion } from "../../stoat/useClientVersion";
import { paths } from "../../routes";

/** A server without a channel in the URL: open its first text channel. */
export function ServerIndexPage() {
  useClientVersion([...SERVER_CHANNEL_EVENTS, "serverDelete"]);
  const { serverId } = useParams();
  const server = serverId ? client.servers.cache.get(serverId) : undefined;

  // Not in this server (anymore): go home.
  if (!server) return <Navigate to={paths.home()} replace />;

  const channelId = getDefaultChannelId(server);
  if (channelId) return <Navigate to={paths.server(server.id, channelId)} replace />;

  return (
    <Center style={{ flex: 1 }} p="md">
      <EmptyState
        icon={<IconHash size={32} />}
        withIndicatorBackground
        title="No channels"
        description="This server has no channels yet."
      />
    </Center>
  );
}
