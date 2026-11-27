import { useEffect } from "react";
import { AppShell, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, useLocation, useParams } from "react-router";
import { HEADER_HEIGHT, NAVBAR_WIDTH } from "./constants";
import { CurrentUser } from "./CurrentUser";
import { HomeSidebar } from "./HomeSidebar";
import { LayoutHeader } from "./LayoutHeader";
import { ServerRail } from "./ServerRail";
import { ServerSidebar } from "./ServerSidebar";

/**
 * The logged-in app: server rail and sidebar on the left, the open channel on the right.
 *
 * The "alt" layout runs the navbar the full height of the page, so the header only spans the
 * open channel. On small screens the navbar covers the page and opens from the header's menu button.
 */
export function MainLayout() {
  const [navbarOpened, { open, close }] = useDisclosure();
  const { serverId } = useParams();
  const { pathname } = useLocation();

  // On small screens, close the menu once something is picked.
  useEffect(close, [pathname, close]);

  return (
    <AppShell
      layout="alt"
      header={{ height: HEADER_HEIGHT }}
      navbar={{ width: NAVBAR_WIDTH, breakpoint: "sm", collapsed: { mobile: !navbarOpened } }}
      padding={0}
    >
      <AppShell.Header>
        <LayoutHeader onOpenNavbar={open} />
      </AppShell.Header>

      <AppShell.Navbar>
        <Group h="100%" gap={0} wrap="nowrap" align="stretch">
          <ServerRail />
          <Stack
            gap={0}
            h="100%"
            style={{
              flex: 1,
              minWidth: 0,
              background: "var(--mantine-color-default-hover)",
              borderLeft: "1px solid var(--app-shell-border-color)",
            }}
          >
            {serverId ? <ServerSidebar serverId={serverId} onClose={close} /> : <HomeSidebar onClose={close} />}
            <CurrentUser />
          </Stack>
        </Group>
      </AppShell.Navbar>

      {/* A full-height column, so a view can fill it (the message list will scroll inside). */}
      <AppShell.Main style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
