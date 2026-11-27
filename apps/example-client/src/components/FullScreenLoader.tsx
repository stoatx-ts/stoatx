import { Center, Loader, Stack, Text } from "@mantine/core";

/** Shown while there's nothing to render yet, e.g. before the first `ready`. */
export function FullScreenLoader({ label }: { label: string }) {
  return (
    <Center mih="100dvh">
      <Stack align="center" gap="sm">
        <Loader />
        <Text c="dimmed" size="sm">
          {label}
        </Text>
      </Stack>
    </Center>
  );
}
