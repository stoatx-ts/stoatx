import { Text } from "@mantine/core";

/** A reminder of where the credentials go, since this is an example app run locally. */
export function SecurityNote() {
  return (
    <Text c="dimmed" size="xs" ta="center">
      Your password is only sent to the Stoat instance. The session is kept in this browser's local storage. Consider
      using a test account.
    </Text>
  );
}
