import { useState, type FormEvent } from "react";
import { Alert, Button, Group, Stack, TextInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { completeOnboarding, logOut } from "../../stoat/auth";
import { describeError } from "../../stoat/errors";
import { AuthLayout } from "../../components/AuthLayout";

// What Stoat accepts, checked here too so most mistakes show up before a request.
const USERNAME_PATTERN = /^[\p{L}\p{N}_.-]{2,32}$/u;

/** New accounts pick a username before they can connect. */
export function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const invalid = username !== "" && !USERNAME_PATTERN.test(username);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // On success the auth state moves to "connecting", then "ready".
      await completeOnboarding(username);
    } catch (err) {
      setError(describeError(err));
      setLoading(false);
    }
  }

  async function switchAccount() {
    try {
      await logOut();
    } catch (err) {
      setError(describeError(err));
    }
  }

  return (
    <AuthLayout
      title="Pick a username"
      description="Your account is ready. Choose how others will see you; you can change it later."
    >
      <form onSubmit={submit}>
        <Stack>
          {error && (
            <Alert color="red" icon={<IconAlertCircle />}>
              {error}
            </Alert>
          )}
          <TextInput
            label="Username"
            description="2–32 characters: letters, numbers, _, . and -"
            required
            autoFocus
            autoComplete="off"
            value={username}
            error={invalid ? "Use 2–32 letters, numbers, _, . or -" : undefined}
            onChange={(event) => setUsername(event.currentTarget.value)}
          />
          <Group justify="space-between">
            <Button variant="subtle" onClick={() => void switchAccount()} disabled={loading}>
              Use another account
            </Button>
            <Button type="submit" loading={loading} disabled={!username || invalid}>
              Continue
            </Button>
          </Group>
        </Stack>
      </form>
    </AuthLayout>
  );
}
