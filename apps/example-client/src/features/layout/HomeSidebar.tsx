import { NavLink, ScrollArea, Stack, Text } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { Link, useParams } from "react-router";
import { ChannelLink } from "../../components/ChannelLink";
import { SidebarHeader } from "../../components/SidebarHeader";
import { SidebarSection } from "../../components/SidebarSection";
import { describeChannel, DIRECT_CHANNEL_EVENTS, getDirectChannels } from "../../stoat/channels";
import { useClientVersion } from "../../stoat/useClientVersion";
import { paths } from "../../routes";
import { HEADER_HEIGHT } from "./constants";

/** Home's sidebar: Saved Notes, DMs and groups, most recent first. */
export function HomeSidebar({ onClose }: { onClose: () => void }) {
  // Also re-renders on `messageCreate`, which moves a conversation to the top.
  useClientVersion(DIRECT_CHANNEL_EVENTS);
  const { channelId } = useParams();
  const channels = getDirectChannels();

  return (
    <>
      <SidebarHeader title="Home" height={HEADER_HEIGHT} onClose={onClose} />
      <ScrollArea style={{ flex: 1 }} px="xs" py="xs">
        <Stack gap="xs">
          <NavLink
            component={Link}
            to={paths.home()}
            active={!channelId}
            label="Home"
            leftSection={<IconHome size={18} stroke={1.75} />}
            styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
          />
          <SidebarSection title="Conversations">
            {channels.length === 0 && (
              <Text size="sm" c="dimmed" px="xs">
                No conversations yet.
              </Text>
            )}
            {channels.map((channel) => {
              const summary = describeChannel(channel);
              return (
                <ChannelLink
                  key={channel.id}
                  label={summary.name}
                  kind={summary.kind}
                  avatarUrl={summary.iconUrl}
                  to={paths.direct(channel.id)}
                  active={channel.id === channelId}
                  unread={channel.unread}
                  mentionCount={channel.mentionCount}
                />
              );
            })}
          </SidebarSection>
        </Stack>
      </ScrollArea>
    </>
  );
}
