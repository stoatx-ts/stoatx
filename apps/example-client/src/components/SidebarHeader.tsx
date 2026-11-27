import { Burger, Group, Text } from "@mantine/core";

interface SidebarHeaderProps {
  title: string;
  height: number;
  /** Closes the sidebar on small screens, where it covers the whole page. */
  onClose: () => void;
}

/** The title bar at the top of the channel sidebar, e.g. the server's name. */
export function SidebarHeader({ title, height, onClose }: SidebarHeaderProps) {
  return (
    <Group
      h={height}
      px="md"
      gap="sm"
      wrap="nowrap"
      justify="space-between"
      style={{ flexShrink: 0, borderBottom: "1px solid var(--app-shell-border-color)" }}
    >
      <Text fw={700} truncate>
        {title}
      </Text>
      <Burger opened onClick={onClose} hiddenFrom="sm" size="sm" aria-label="Close menu" />
    </Group>
  );
}
