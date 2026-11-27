import { Divider, ScrollArea, Stack } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { useParams } from "react-router";
import { RailButton } from "../../components/RailButton";
import { getDirectUnreads, getServers, SERVER_LIST_EVENTS } from "../../stoat/channels";
import { useClientVersion } from "../../stoat/useClientVersion";
import { paths } from "../../routes";

/** The column of servers on the far left, with Home (DMs and groups) on top. */
export function ServerRail() {
  // `server.unread` and `server.mentionCount` are getters over the unread cache: re-render on the
  // events that change it, and read them again.
  useClientVersion(SERVER_LIST_EVENTS);
  const { serverId } = useParams();
  const home = getDirectUnreads();

  return (
    <ScrollArea w={72} h="100%" scrollbars="y" type="never" style={{ flexShrink: 0 }}>
      <Stack gap={8} py="sm" align="center">
        <RailButton
          label="Home"
          to={paths.home()}
          active={!serverId}
          unread={home.unread}
          mentionCount={home.mentionCount}
          icon={<IconHome size={24} />}
        />
        <Divider w={32} />
        {getServers().map((server) => (
          <RailButton
            key={server.id}
            label={server.name}
            to={paths.server(server.id)}
            active={server.id === serverId}
            unread={server.unread}
            mentionCount={server.mentionCount}
            imageUrl={server.icon?.previewURL ?? null}
          />
        ))}
      </Stack>
    </ScrollArea>
  );
}
