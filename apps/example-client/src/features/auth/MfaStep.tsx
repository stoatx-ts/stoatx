import { useState, type FormEvent } from "react";
import { Alert, Button, Group, PasswordInput, PinInput, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import type { MFAMethod, MFAResponse } from "@stoatx/client";
import { signInWithMfa } from "../../stoat/auth";
import { describeError } from "../../stoat/errors";

const METHOD_LABELS: Record<MFAMethod, string> = {
  Totp: "Authenticator app",
  Recovery: "Recovery code",
  Password: "Password",
};

interface MfaStepProps {
  /** From the `MFA` login result. */
  ticket: string;
  /** What the account accepts, from `result.allowedMethods`. */
  methods: MFAMethod[];
  onBack: () => void;
}

/** The second step of logging in, for accounts with two-factor authentication. */
export function MfaStep({ ticket, methods, onBack }: MfaStepProps) {
  // Prefer the authenticator app; recovery codes are for when the phone is lost.
  const [method, setMethod] = useState<MFAMethod>(methods.includes("Totp") ? "Totp" : (methods[0] ?? "Password"));
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(code = value) {
    const response: MFAResponse =
      method === "Totp" ? { totpCode: code } : method === "Recovery" ? { recoveryCode: code } : { password: code };
    setError(null);
    setLoading(true);
    try {
      // On success the auth state moves on and the router leaves this page.
      await signInWithMfa(ticket, response);
    } catch (err) {
      setError(describeError(err));
      setValue("");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit();
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <Text size="sm">This account has two-factor authentication. Confirm it's you to continue.</Text>
        {error && (
          <Alert color="red" icon={<IconAlertCircle />}>
            {error}
          </Alert>
        )}
        {methods.length > 1 && (
          <SegmentedControl
            fullWidth
            value={method}
            onChange={(next) => {
              setMethod(next as MFAMethod);
              setValue("");
              setError(null);
            }}
            data={methods.map((m) => ({ value: m, label: METHOD_LABELS[m] }))}
          />
        )}
        {method === "Totp" && (
          <Stack gap={4} align="center">
            <Text size="sm" c="dimmed">
              Enter the 6-digit code from your authenticator app
            </Text>
            <PinInput
              length={6}
              type="number"
              oneTimeCode
              autoFocus
              disabled={loading}
              value={value}
              onChange={setValue}
              onComplete={(code) => void submit(code)}
            />
          </Stack>
        )}
        {method === "Recovery" && (
          <TextInput
            label="Recovery code"
            placeholder="xxxxx-xxxxx"
            autoComplete="off"
            required
            autoFocus
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
        )}
        {method === "Password" && (
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            required
            autoFocus
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
        )}
        <Group justify="space-between">
          <Button variant="subtle" onClick={onBack} disabled={loading}>
            Back
          </Button>
          <Button type="submit" loading={loading} disabled={!value}>
            Verify
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
