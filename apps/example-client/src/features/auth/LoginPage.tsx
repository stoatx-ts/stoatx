import { useState } from "react";
import { Alert, Stack } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { AuthLayout } from "../../components/AuthLayout";
import { useAuthState, type SignInStep } from "../../stoat/auth";
import { MfaStep } from "./MfaStep";
import { PasswordStep } from "./PasswordStep";
import { SecurityNote } from "./SecurityNote";

/**
 * Logging in: email and password, then a second factor if the account has one.
 * New accounts continue on the onboarding page.
 */
export function LoginPage() {
  const auth = useAuthState();
  const [mfa, setMfa] = useState<Extract<SignInStep, { step: "mfa" }> | null>(null);
  const notice = auth.status === "loggedOut" ? auth.notice : undefined;

  return (
    <AuthLayout
      title={mfa ? "Two-factor authentication" : "Log in to Stoat"}
      description="An example client built with @stoatx/client"
      footer={<SecurityNote />}
    >
      <Stack>
        {notice && !mfa && (
          <Alert color="blue" icon={<IconInfoCircle />}>
            {notice}
          </Alert>
        )}
        {mfa ? (
          <MfaStep ticket={mfa.ticket} methods={mfa.methods} onBack={() => setMfa(null)} />
        ) : (
          <PasswordStep onMfa={setMfa} />
        )}
      </Stack>
    </AuthLayout>
  );
}
