import { Box, Burger, Divider, Group, Text } from "@mantine/core";
import { useParams } from "react-router";
import { ChannelIcon } from "../../components/ChannelIcon";
import { describeChannel } from "../../stoat/channels";
import { client } from "../../stoat/client";
import { useClientVersion } from "../../stoat/useClientVersion";

/** The bar over the open channel: its name and topic. The server's name is in the sidebar. */
export function LayoutHeader({ onOpenNavbar }: { onOpenNavbar: () => void }) {
  useClientVersion(["serverUpdate", "channelUpdate", "userUpdate"]);
  const { serverId, channelId } = useParams();
  const server = serverId ? client.servers.cache.get(serverId) : undefined;
  const channel = channelId ? client.channels.cache.get(channelId) : undefined;
  const summary = channel ? describeChannel(channel) : null;

  return (
    <Group h="100%" gap="xs" px="md" wrap="nowrap">
      <Burger opened={false} onClick={onOpenNavbar} hiddenFrom="sm" size="sm" aria-label="Open menu" />
      {summary ? (
        <>
          <Box c="dimmed" style={{ display: "flex" }}>
            <ChannelIcon kind={summary.kind} />
          </Box>
          <Text fw={600} truncate style={{ flexShrink: 0, maxWidth: "50%" }}>
            {summary.name}
          </Text>
          {summary.description && (
            <>
              <Divider orientation="vertical" my={14} visibleFrom="md" />
              <Text size="sm" c="dimmed" truncate visibleFrom="md">
                {summary.description}
              </Text>
            </>
          )}
        </>
      ) : (
        <Text fw={600} truncate>
          {server ? server.name : "Home"}
        </Text>
      )}
    </Group>
  );
}
