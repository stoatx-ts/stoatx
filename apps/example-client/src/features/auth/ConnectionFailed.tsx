import { useState } from "react";
import { Alert, Button, Group, Stack } from "@mantine/core";
import { IconPlugConnectedX } from "@tabler/icons-react";
import { AuthLayout } from "../../components/AuthLayout";
import { forgetSession, restoreSession } from "../../stoat/auth";

/** The saved session couldn't connect, but isn't known to be invalid: offer to retry. */
export function ConnectionFailed({ message }: { message: string }) {
  const [retrying, setRetrying] = useState(false);

  return (
    <AuthLayout title="Couldn't connect">
      <Stack>
        <Alert color="red" icon={<IconPlugConnectedX />}>
          {message}
        </Alert>
        <Group justify="space-between">
          <Button variant="subtle" onClick={forgetSession}>
            Log in again
          </Button>
          <Button
            loading={retrying}
            onClick={() => {
              setRetrying(true);
              void restoreSession().finally(() => setRetrying(false));
            }}
          >
            Retry
          </Button>
        </Group>
      </Stack>
    </AuthLayout>
  );
}
