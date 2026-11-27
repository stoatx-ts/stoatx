import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { App } from "./App";
import { restoreSession } from "./stoat/auth";
import { theme } from "./theme";

// Log in with the saved session from startup code, not from a component's mount effect:
// React's Strict Mode runs effects twice in development, which would log in twice.
void restoreSession();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
);
