import { ActionIcon, Avatar, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

interface UserPanelProps {
  name: string;
  tag: string;
  avatarUrl: string;
  loggingOut: boolean;
  onLogOut: () => void;
}

/** The logged-in user, at the bottom of the sidebar. */
export function UserPanel({ name, tag, avatarUrl, loggingOut, onLogOut }: UserPanelProps) {
  return (
    <Group gap="sm" wrap="nowrap" p="sm">
      <Avatar src={avatarUrl} alt={name} size={36} />
      <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={600} truncate>
          {name}
        </Text>
        <Text size="xs" c="dimmed" truncate>
          {tag}
        </Text>
      </Stack>
      <Tooltip label="Log out">
        <ActionIcon variant="subtle" color="gray" aria-label="Log out" loading={loggingOut} onClick={onLogOut}>
          <IconLogout size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
