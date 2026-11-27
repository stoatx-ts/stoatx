import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useAuthState, type AuthState } from "../../stoat/auth";
import { ConnectionFailed } from "./ConnectionFailed";

/**
 * Renders `children` only in the given auth status. Otherwise it shows a loader or error, or
 * redirects to the page for the current status. Each route says which status it belongs to, so
 * logging in, out or finishing onboarding moves the user to the right page automatically.
 */
export function RequireAuthStatus({ status, children }: { status: AuthState["status"]; children: ReactNode }) {
  const auth = useAuthState();
  if (auth.status === status) return children;

  switch (auth.status) {
    case "restoring":
      return <FullScreenLoader label="Restoring your session…" />;
    case "connecting":
      // The caches are empty until the first `ready`, so there's nothing to render yet.
      return <FullScreenLoader label="Connecting to Stoat…" />;
    case "failed":
      return <ConnectionFailed message={auth.message} />;
    case "loggedOut":
      return <Navigate to="/login" replace />;
    case "onboarding":
      return <Navigate to="/onboarding" replace />;
    case "ready":
      return <Navigate to="/" replace />;
  }
}
