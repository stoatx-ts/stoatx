import { useState, type FormEvent } from "react";
import { Alert, Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { signIn, type SignInStep } from "../../stoat/auth";
import { describeError } from "../../stoat/errors";

/** Email and password, the first step of logging in. */
export function PasswordStep({ onMfa }: { onMfa: (step: Extract<SignInStep, { step: "mfa" }>) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const next = await signIn(email, password);
      // On "done", the auth state moves on and the router leaves this page.
      if (next.step === "mfa") onMfa(next);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Stack>
        {error && (
          <Alert color="red" icon={<IconAlertCircle />}>
            {error}
          </Alert>
        )}
        <TextInput
          label="Email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
        />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
        />
        <Button type="submit" loading={loading} fullWidth>
          Log in
        </Button>
      </Stack>
    </form>
  );
}
