import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { UserPanel } from "../../components/UserPanel";
import { logOut } from "../../stoat/auth";
import { client } from "../../stoat/client";
import { describeError } from "../../stoat/errors";
import { useClientVersion } from "../../stoat/useClientVersion";

/** The logged-in user and the logout button, at the bottom of the sidebar. */
export function CurrentUser() {
  useClientVersion(["userUpdate"]);
  const [loggingOut, setLoggingOut] = useState(false);
  const user = client.user;
  if (!user) return null;

  async function onLogOut() {
    setLoggingOut(true);
    try {
      // The `logout` event then moves the app back to the login page.
      await logOut();
    } catch (error) {
      notifications.show({ color: "red", title: "Couldn't log out", message: describeError(error) });
      setLoggingOut(false);
    }
  }

  return (
    <UserPanel
      name={user.displayName ?? user.username}
      tag={user.tag}
      avatarUrl={user.displayAvatarURL}
      loggingOut={loggingOut}
      onLogOut={() => void onLogOut()}
    />
  );
}
