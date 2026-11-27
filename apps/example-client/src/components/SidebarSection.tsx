import type { ReactNode } from "react";
import { Stack, Text } from "@mantine/core";

/** A group of sidebar links, e.g. a category of channels. */
export function SidebarSection({ title, children }: { title: string | null; children: ReactNode }) {
  return (
    <Stack gap={2}>
      {title && (
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" px="xs" pt="sm" pb={4} truncate>
          {title}
        </Text>
      )}
      {children}
    </Stack>
  );
}
