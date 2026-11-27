# Stoat Example Client

An example Stoat client for user accounts, built with [React](https://react.dev), [Mantine](https://mantine.dev) and [`@stoatx/client`](../../packages/client).

It shows how the pieces from the guides fit together in a real app. It isn't hosted anywhere: to try it, run it on your own machine and log in with your own account.

> **Work in progress.** So far it covers logging in, the main layout with unread markers, and reading and sending messages. Friends, invites and settings come next.

## What it shows

- **Logging in** with an email and password, with a second step for accounts with two-factor authentication (authenticator app, recovery code or password).
- **Onboarding**: new accounts pick a username before they can connect.
- **Staying logged in**: the session is saved, and the next visit logs straight back in.
- **Waiting for `ready`**: a loading screen until the client's caches are filled.
- **Logging out**, including being logged out from another device.
- **The main layout**: a server rail, a sidebar with each server's channels (grouped by category) or your DMs and groups, and a header with the open channel. On small screens the sidebar folds behind a menu button.
- **Unread markers and mention badges** on servers, channels, DMs and the Home button, kept up to date as messages arrive and are read, also on your other devices.
- **Server order** from the official client's synced settings (`ordering` and `server-folders`), so servers appear in the order you arranged them there, also when you rearrange them. Servers in a folder are shown where the folder is; folders themselves aren't drawn.
- **Server subscriptions**: the server on screen is subscribed to, and renewed, so its presence and member updates keep arriving.
- **Messages**: the latest page loads when a channel opens and older pages as you scroll up, in a virtualized list (react-virtuoso) that stays at the bottom as messages arrive. Messages are grouped by author, with day dividers, replies, mentions shown as names, role colours (gradients included), system messages ("Alice joined"), images and files. Images and avatars use the CDN's smaller previews, and images reserve their space before they load, so the list doesn't jump.
- **Marking as read**: a channel is acked while its latest messages are on screen and the tab is visible, which clears its unread marker here and on your other devices.
- **Sending**: Enter sends and Shift+Enter adds a line. Files can be attached with the paperclip, pasted, or dropped anywhere on the page. A failed send gives the message back.
- **Typing indicators**, both ways: you show as typing while you type, and "Alice is typing…" shows above the composer.
- **The URL as the selection**: `/servers/:serverId/:channelId` and `/channels/@me/:channelId`, so links and the back button work, and leaving a server or losing a channel sends you somewhere sensible.
- **Reacting to client events** in React, with the `watchClient` helper and `useClientVersion` hook from the [UI Frameworks guide](https://stoatx-ts.github.io/stoatx/guide/frameworks).

## Running it

You need the repository's tools set up first (see [Contributing](../../README.md#-contributing)). Then, from the repository root:

```bash
mise run install:frozen
mise run dev:example-client
```

This builds `@stoatx/client` and starts the app at <http://localhost:5173>.

Without mise: `pnpm install`, `pnpm --filter @stoatx/client build`, then `pnpm --filter @stoatx/example-client dev`.

### Poking at the client

In development, the client is available as `stoat` in the browser console, e.g. `stoat.servers.cache` or `stoat.user`. It's left out of production builds, where anything on the page could read the session through it.

### Using another instance

The app uses stoat.chat by default. To use another instance, such as a self-hosted one, copy `.env.example` to `.env.local` and set `VITE_STOAT_API_URL` to its API URL.

### Your account and password

- Your email and password are only sent to the Stoat instance, never anywhere else.
- The session token is saved in your browser's local storage, so you stay logged in. Logging out ends the session and removes it.
- The session shows up as "stoatx example client" in your account's list of logged-in devices.

Consider using a test account, especially while trying things out.

## How it's organized

The code is split so the client usage is easy to find. To learn `@stoatx/client`, start with `src/stoat/` and skip the UI.

| Folder            | What's in it                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `src/stoat/`      | Everything that talks to `@stoatx/client`: the client, the event helpers, login, the session and the read helpers for the lists |
| `src/components/` | Plain Mantine UI that doesn't know about the client                                                |
| `src/features/`   | The screens: they read from `src/stoat/` and render Mantine components                             |

### The files

| File                                       | What it does                                                                                                                                     | Guide                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `src/stoat/client.ts`                      | The one client for the whole app, kept across hot reloads                                                                                        | [One client for the whole app](https://stoatx-ts.github.io/stoatx/guide/frameworks#one-client-for-the-whole-app) |
| `src/stoat/watch.ts`                       | `watchClient()`: calls a function when client events fire, at most once per tick                                                                 | [A small helper](https://stoatx-ts.github.io/stoatx/guide/frameworks#a-small-helper)                             |
| `src/stoat/useClientVersion.ts`            | `useClientVersion()`: re-renders a component when client events fire                                                                             | [React](https://stoatx-ts.github.io/stoatx/guide/frameworks#react)                                               |
| `src/stoat/auth.ts`                        | The login state (`restoring`, `loggedOut`, `connecting`, `onboarding`, `ready`, `failed`) and the actions that change it                         | [User Accounts](https://stoatx-ts.github.io/stoatx/guide/user-accounts)                                          |
| `src/stoat/session.ts`                     | Saving, loading and clearing the session in local storage                                                                                        | [Staying logged in](https://stoatx-ts.github.io/stoatx/guide/user-accounts#staying-logged-in)                    |
| `src/stoat/errors.ts`                      | Turns `StoatAPIError`s into messages for the user                                                                                                |                                                                                                                  |
| `src/stoat/channels.ts`                    | Read helpers for the lists: servers, channels by category, DMs by recent activity, a name and icon for any channel, and which events change each | [Unread messages](https://stoatx-ts.github.io/stoatx/guide/user-accounts#unread-messages)                        |
| `src/stoat/useServerSubscription.ts`       | Subscribes to the server on screen and renews it every 10 minutes and after reconnects                                                           | [Server presence](https://stoatx-ts.github.io/stoatx/guide/user-accounts#server-presence)                        |
| `src/stoat/history.ts`                     | Loading a channel's history: the latest page on open, older pages on scroll, and starting over after a reconnect                                 |                                                                                                                  |
| `src/stoat/messages.ts`                    | Messages as plain values for the list (author, colour, mentions, replies, attachments), and sending with files                                   | [Uploading files](https://stoatx-ts.github.io/stoatx/guide/browsers-and-runtimes#uploading-files-from-the-page)  |
| `src/stoat/useAckWhileViewing.ts`          | Marks the open channel as read while its latest messages are on screen                                                                           | [Unread messages](https://stoatx-ts.github.io/stoatx/guide/user-accounts#unread-messages)                        |
| `src/stoat/typing.ts`                      | Sending typing indicators while the user types, and who else is typing                                                                           | [Typing indicators](https://stoatx-ts.github.io/stoatx/guide/user-accounts#typing-indicators)                    |
| `src/stoat/settings.ts`                    | Reads synced settings the official client writes: the server order and folders                                                                   | [Synced settings](https://stoatx-ts.github.io/stoatx/guide/user-accounts#synced-settings)                        |
| `src/routes.ts`                            | The app's URLs                                                                                                                                   |                                                                                                                  |
| `src/features/auth/RequireAuthStatus.tsx`  | Shows each route only in its login state, and redirects otherwise                                                                                |                                                                                                                  |
| `src/features/auth/LoginPage.tsx`          | The login page: `PasswordStep.tsx`, then `MfaStep.tsx` if the account has two-factor authentication                                              | [Logging in](https://stoatx-ts.github.io/stoatx/guide/user-accounts#logging-in-with-an-email-and-password)       |
| `src/features/auth/OnboardingPage.tsx`     | Picking a username for a new account                                                                                                             | [Onboarding](https://stoatx-ts.github.io/stoatx/guide/user-accounts#onboarding)                                  |
| `src/features/layout/MainLayout.tsx`       | The Mantine `AppShell`: header, navbar (server rail and sidebar) and the open page                                                               |                                                                                                                  |
| `src/features/layout/ServerRail.tsx`       | Home and the servers, with unread pills and mention badges                                                                                       |                                                                                                                  |
| `src/features/layout/ServerSidebar.tsx`    | A server's channels, grouped by category                                                                                                         |                                                                                                                  |
| `src/features/layout/HomeSidebar.tsx`      | Saved Notes, DMs and groups, most recent first                                                                                                   |                                                                                                                  |
| `src/features/layout/CurrentUser.tsx`      | The logged-in user and the logout button                                                                                                         |                                                                                                                  |
| `src/features/home/HomePage.tsx`           | Home with nothing open: the logged-in user and some counts                                                                                       |                                                                                                                  |
| `src/features/channel/ChannelPage.tsx`     | An open channel: the message list, who's typing and the composer                                                                                 |                                                                                                                  |
| `src/features/channel/MessageList.tsx`     | The virtualized message list: paging, following new messages, grouping, "Jump to present"                                                        |                                                                                                                  |
| `src/features/channel/Composer.tsx`        | Writing and sending, with attachments and typing                                                                                                 |                                                                                                                  |
| `src/features/channel/TypingLine.tsx`      | "Alice is typing…"                                                                                                                               |                                                                                                                  |
| `src/features/channel/ServerIndexPage.tsx` | Opens a server's first text channel                                                                                                              |                                                                                                                  |

## How the layout stays up to date

Nothing in the layout keeps its own copy of the client's data. Each part re-renders on the events that affect it, then reads the caches again:

| Part               | Re-renders on                                                                                      | Reads                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Server rail        | `serverCreate`, `serverUpdate`, `serverDelete`, `settingsUpdate`, `messageCreate`, `channelAck`    | `server.unread`, `server.mentionCount`                    |
| Server sidebar     | `channelCreate`, `channelUpdate`, `channelDelete`, `serverUpdate`, `messageCreate`, `channelAck`   | `server.categories`, `channel.unread`, `channel.mentionCount` |
| Home sidebar       | The same channel events, plus `channelGroupJoin`, `channelGroupLeave` and `userUpdate`             | DMs and groups, sorted by `lastMessageId`                 |
| Header, user panel | `serverUpdate`, `channelUpdate`, `userUpdate`                                                      | Names, topics and avatars                                 |

`ready` and `logout` always re-render everything, because they replace or empty the caches.

### Known gaps

- Messages are shown as plain text: no Markdown, embeds or reactions yet.
- `@stoatx/client` doesn't calculate permissions yet, so the sidebar lists every channel the instance sends, without checking whether you can view it.

## How logging in works

```text
            page load
                │
   saved session? ── no ──────────────────────────┐
                │ yes                             │
                ▼                                 ▼
           restoring ── expired ──────────►  loggedOut  ◄──── logout event
                │   └── unreachable ──► failed   │             (own logout, or
                │                      (retry)   │ email + password   revoked elsewhere)
                │                                ├── MFA? → code ─┐
                │                                ▼                │
                │       ┌──── new account ── loginWithCredentials ◄┘
                ▼       ▼                        │
           onboarding ── pick username ──►  connecting ── ready event ──►  ready
```

- The saved session is restored from `main.tsx`, not from a component effect. React's Strict Mode runs effects twice in development, which would log in twice.
- `client.login()` resolves as soon as the connection starts. The caches are only filled once `ready` fires, so the app waits for that before showing anything.
- The `logout` event is the one place the app reacts to a session ending, whether the user logged out or the session was revoked from another device.

## Tech

- [Vite](https://vite.dev) and TypeScript
- [Mantine](https://mantine.dev) for the UI, with [Tabler icons](https://tabler.io/icons)
- [React Router](https://reactrouter.com)
- No separate state library: the client's caches are the app's data, and components re-read them when events fire. A second store would only get out of sync.

## License

MIT: see [LICENSE](LICENSE). Copy whatever you need into your own client.
