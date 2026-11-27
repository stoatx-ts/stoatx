import { ScrollArea, Stack, Text } from "@mantine/core";
import { useParams } from "react-router";
import { ChannelLink } from "../../components/ChannelLink";
import { SidebarHeader } from "../../components/SidebarHeader";
import { SidebarSection } from "../../components/SidebarSection";
import { describeChannel, getServerSections, SERVER_CHANNEL_EVENTS } from "../../stoat/channels";
import { client } from "../../stoat/client";
import { useClientVersion } from "../../stoat/useClientVersion";
import { useServerSubscription } from "../../stoat/useServerSubscription";
import { paths } from "../../routes";
import { HEADER_HEIGHT } from "./constants";

/** A server's channels, grouped by category. */
export function ServerSidebar({ serverId, onClose }: { serverId: string; onClose: () => void }) {
  useClientVersion(SERVER_CHANNEL_EVENTS);
  const { channelId } = useParams();
  const server = client.servers.cache.get(serverId);
  // Presence and member updates only arrive for subscribed servers.
  useServerSubscription(server);

  if (!server) return null;
  const sections = getServerSections(server);

  return (
    <>
      <SidebarHeader title={server.name} height={HEADER_HEIGHT} onClose={onClose} />
      <ScrollArea style={{ flex: 1 }} px="xs" py="xs">
        <Stack gap="xs">
          {sections.length === 0 && (
            <Text size="sm" c="dimmed" p="xs">
              No channels yet.
            </Text>
          )}
          {sections.map((section) => (
            <SidebarSection key={section.id} title={section.title}>
              {section.channels.map((channel) => {
                const summary = describeChannel(channel);
                return (
                  <ChannelLink
                    key={channel.id}
                    label={summary.name}
                    kind={summary.kind}
                    to={paths.server(server.id, channel.id)}
                    active={channel.id === channelId}
                    unread={channel.unread}
                    mentionCount={channel.mentionCount}
                  />
                );
              })}
            </SidebarSection>
          ))}
        </Stack>
      </ScrollArea>
    </>
  );
}
