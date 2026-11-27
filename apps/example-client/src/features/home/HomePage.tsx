import { Avatar, Center, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { client } from "../../stoat/client";
import { useClientVersion } from "../../stoat/useClientVersion";

/**
 * Home, when no conversation is open: the logged-in user and some counts from the caches.
 * It shows the basic pattern: re-render on events, read the client's data during render.
 */
export function HomePage() {
  // Re-render when names or avatars change, or servers, channels or friends change.
  useClientVersion([
    "userUpdate",
    "userRelationship",
    "serverCreate",
    "serverDelete",
    "channelCreate",
    "channelDelete",
  ]);
  const user = client.user;
  if (!user) return null;

  return (
    <Center style={{ flex: 1 }} p="md">
      <Paper withBorder shadow="sm" p="xl" radius="md" w={420} maw="100%">
        <Stack align="center">
          <Avatar src={user.displayAvatarURL} alt={user.username} size="xl" radius="xl" />
          <Stack gap={0} align="center">
            <Title order={3}>{user.displayName ?? user.username}</Title>
            <Text c="dimmed" size="sm">
              {user.tag}
            </Text>
          </Stack>
          <Group gap="xl">
            <Stat label="Servers" value={client.servers.cache.size} />
            <Stat label="Channels" value={client.channels.cache.size} />
            <Stat label="Friends" value={client.users.friends.size} />
          </Group>
          <Text c="dimmed" size="sm" ta="center">
            You're connected.
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Stack gap={0} align="center">
      <Text fw={700} size="lg">
        {value}
      </Text>
      <Text c="dimmed" size="xs">
        {label}
      </Text>
    </Stack>
  );
}
