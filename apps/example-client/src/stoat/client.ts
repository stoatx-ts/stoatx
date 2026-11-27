import { Client } from "@stoatx/client";

/**
 * The one client for the whole app. Import it wherever you need it; never create one inside a
 * component, or every mount would open a new connection.
 *
 * See https://stoatx-ts.github.io/stoatx/guide/frameworks#one-client-for-the-whole-app
 */
function createClient(): Client {
  const apiURL = import.meta.env.VITE_STOAT_API_URL;
  // No `cacheLimits.users`: in a user client, evicted users would drop out of the friends lists.
  return new Client(apiURL ? { apiURL } : {});
}

// With Vite's hot reloading, editing this file re-runs it. Reuse the existing client instead of
// opening a second connection.
export const client: Client = import.meta.hot?.data.client ?? createClient();
if (import.meta.hot) import.meta.hot.data.client = client;

// In development, expose the client as `stoat` in the browser console, to poke at its caches.
// Never do this in a real build: anything on the page could read the session through it.
if (import.meta.env.DEV) (globalThis as { stoat?: Client }).stoat = client;
