import { Box, EmptyState, Stack } from "@mantine/core";
import { Navigate, useParams } from "react-router";
import { TextChannel } from "@stoatx/client";
import { ChannelIcon } from "../../components/ChannelIcon";
import { describeChannel, isDirectChannel } from "../../stoat/channels";
import { client } from "../../stoat/client";
import { useClientVersion } from "../../stoat/useClientVersion";
import { paths } from "../../routes";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import { TypingLine } from "./TypingLine";

/**
 * An open channel: a server channel, or a DM, group or Saved Notes under Home.
 * The messages, then who's typing and the composer.
 */
export function ChannelPage() {
  // `channelDelete` and `serverDelete`: leave the page when the channel goes away, e.g. after
  // being kicked or the channel being deleted. `ready` and `logout` are always included.
  useClientVersion(["channelUpdate", "channelDelete", "serverDelete", "userUpdate"]);
  const { serverId, channelId } = useParams();
  const channel = channelId ? client.channels.cache.get(channelId) : undefined;

  // The URL might point to a channel that's gone, or that doesn't belong where the URL says.
  const belongs = serverId
    ? channel instanceof TextChannel && channel.serverId === serverId
    : channel !== undefined && isDirectChannel(channel);
  if (!channel || !belongs) {
    return (
      <Navigate to={serverId && client.servers.cache.has(serverId) ? paths.server(serverId) : paths.home()} replace />
    );
  }

  const summary = describeChannel(channel);
  const title =
    summary.kind === "dm"
      ? `This is the start of your conversation with ${summary.name}`
      : summary.kind === "saved"
        ? "Saved Notes"
        : `Welcome to ${summary.kind === "text" ? "#" : ""}${summary.name}`;

  const placeholder =
    summary.kind === "dm"
      ? `Message @${summary.name}`
      : summary.kind === "text"
        ? `Message #${summary.name}`
        : `Message ${summary.name}`;

  // Keyed by channel, so switching channels starts with a fresh list and an empty composer.
  return (
    <Stack gap={0} style={{ flex: 1, minHeight: 0 }}>
      <MessageList
        key={channel.id}
        channel={channel}
        start={
          <EmptyState
            icon={<ChannelIcon kind={summary.kind} size={32} />}
            withIndicatorBackground
            title={title}
            description={summary.description ?? undefined}
            maw={480}
            mx="auto"
          />
        }
      />
      <Box px="md" pb="md">
        <TypingLine channel={channel} />
        <Composer key={channel.id} channel={channel} placeholder={placeholder} />
      </Box>
    </Stack>
  );
}
