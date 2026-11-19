---
title: User Accounts
sidebar_label: User Accounts
sidebar_position: 6
---

# User Accounts

Besides bots, `@stoatx/client` can log in to a regular user account. This is what you need to build your own Stoat client, for example a web app where people log in with their email and password.

:::warning
User-account support is new. Logging in, sessions, onboarding, unread tracking and typing indicators work; friends, blocking and joining servers through invites are still being added.
:::

## Logging in with an email and password

`loginWithCredentials()` creates a session and connects. It returns a `result` telling you what happened:

| `result`     | Meaning                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| `Success`    | Logged in and connecting. `result.session` holds the session to save.       |
| `MFA`        | The account has two-factor authentication. Ask for a code and log in again. |
| `Onboarding` | New account: it has to pick a username before it can connect.               |
| `Disabled`   | The account is disabled.                                                    |

```ts
import { Client } from "@stoatx/client";

const client = new Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.username}`);
});

let result = await client.loginWithCredentials({
  email,
  password,
  // Shown in the account's list of logged-in devices.
  friendlyName: "My Stoat App",
});

if (result.result === "MFA") {
  // result.allowedMethods lists what the account accepts: "Totp", "Recovery" and/or "Password".
  const totpCode = await askForCode();
  result = await client.loginWithCredentials({ mfaTicket: result.ticket, mfaResponse: { totpCode } });
}

if (result.result === "Onboarding") {
  await client.auth.completeOnboarding(await askForUsername());
  await client.login(result.session);
}

if (result.result === "Disabled") {
  throw new Error("This account is disabled.");
}
```

The MFA response can also be `{ recoveryCode }` or `{ password }`, depending on `allowedMethods`.

## Staying logged in

A session stays valid until it's logged out, so save it and log in with it next time instead of asking for the password again. `client.login()` accepts the session object as-is:

```ts
if (result.result === "Success" || result.result === "Onboarding") {
  localStorage.setItem("session", JSON.stringify(result.session));
}

// Later, e.g. when the page loads:
const saved = localStorage.getItem("session");
if (saved) await client.login(JSON.parse(saved));
```

`client.login({ token, type: "user" })` works too, if you only stored the token.

:::danger
The session token gives full access to the account. Only store it on the user's own device, never send it to your own server or include it in logs.
:::

### Onboarding

If an account hasn't picked a username yet, `client.login()` throws an `OnboardingRequiredError`. The token stays set, so you can finish onboarding and try again:

```ts
import { OnboardingRequiredError } from "@stoatx/client";

try {
  await client.login(session);
} catch (error) {
  if (!(error instanceof OnboardingRequiredError)) throw error;
  await client.auth.completeOnboarding(await askForUsername());
  await client.login(session);
}
```

Usernames are 2–32 characters long and can contain letters, numbers, `_`, `.` and `-`.

## Logging out

```ts
await client.auth.logout();
```

This ends the session on the server, disconnects, and empties the client's caches so the next person to log in on the same page can't see the previous account's data. Delete the session you saved, too.

The `logout` event fires whenever the session ends, including when it's revoked from another device:

```ts
client.on("logout", () => {
  localStorage.removeItem("session");
  showLoginScreen();
});
```

## Managing sessions

Every device an account is logged in on has its own session:

```ts
const sessions = await client.auth.fetchSessions();
// [{ id: "01J...", name: "My Stoat App" }, ...]

await client.auth.renameSession(sessions[0].id, "Laptop");

// Log out another device
await client.auth.revokeSession(sessions[1].id);

// Log out every other device, or pass { includeCurrent: true } to log out this one as well
await client.auth.revokeAllSessions();
```

The `client.auth` methods only work with a user session; with a bot token they throw a `USER_ONLY` error.

## Unread messages

The client keeps track of what the user has read, using the state sent on connect and live updates (including reads on the user's other devices). Channels and servers have getters for it:

```ts
channel.unread; // true if there are unread messages or unread mentions
channel.mentionCount; // unread messages that mention the user (see below)

server.unread; // true if any channel in the server is unread
server.mentionCount; // mentions across the whole server
```

These are plain getters, so read them when rendering, e.g. after `messageCreate` or `channelAck` events.

Mark things as read when the user looks at them:

```ts
await channel.ack(); // up to the latest message
await channel.ack(message); // up to a specific message
await server.ack(); // every channel in the server
```

`mentionCount` follows the same rules as Stoat's servers, so it doesn't change when the client reconnects:

- **Server channels:** messages that mention the user directly, including replies that ping them. Role, `@everyone` and `@online` mentions don't count.
- **DMs and groups:** every message from someone else counts.
- Messages sent with notifications suppressed never count.

When the user sends a message in a channel they had fully read, it stays read. If there were unread messages from others, it stays unread, so posting doesn't hide them. This only changes local state: ack the channel the user is viewing to save it on the server.

The raw state per channel is in `client.unreads.cache`. If you think it has drifted, `client.unreads.fetch()` reloads it.

For bots, `unread` is always `false`, `mentionCount` is always `0`, and the ack methods throw `USER_ONLY`.

## Typing indicators

Tell others the user is typing, and stop when they're done. Sending a message also ends the indicator:

```ts
input.addEventListener("input", () => channel.startTyping());
input.addEventListener("blur", () => channel.stopTyping());
```

Both return `false` if the client isn't connected. It's fine to call `startTyping()` on every keystroke: it sends at most once every 2.5 seconds, and other clients drop the indicator 4 seconds after the last one. The official client also calls `stopTyping()` after one second without input.

To show who else is typing, read `channel.typingUserIds`, a `Set` of user IDs that's updated from `typingStart` and `typingStop` events:

```ts
client.on("typingStart", (channelId) => renderTyping(channelId));
client.on("typingStop", (channelId) => renderTyping(channelId));

function renderTyping(channelId: string) {
  const channel = client.channels.cache.get(channelId);
  const names = [...(channel?.typingUserIds ?? [])]
    .filter((id) => id !== client.user?.id)
    .map((id) => client.users.cache.get(id)?.username ?? "Someone");
  typingLabel.textContent = names.length ? `${names.join(", ")} typing…` : "";
}
```

A user is removed (and `typingStop` fires) when they stop typing, send a message, or haven't refreshed their indicator for 4 seconds.

## Server presence

User sessions only get presence and member updates for a server after subscribing to it. Subscribe to the server that's on screen:

```ts
server.subscribe();
```

A subscription lasts 15 minutes, so subscribe again (for example every 10 minutes) while the server stays on screen. Each connection keeps at most 5 subscriptions; subscribing to a 6th drops the least recently used. Bots don't need this: they get updates from every server automatically.

## Bots vs. user accounts

Everything else in this guide works the same for both. The differences:

|                       | Bot                      | User account                                         |
| --------------------- | ------------------------ | ---------------------------------------------------- |
| Log in with           | `client.login(botToken)` | `client.loginWithCredentials()` or a session         |
| Where it can run      | A server you control     | Anywhere, including the user's browser               |
| `ready` payload extra | –                        | `user_settings`, `channel_unreads`, `policy_changes` |
| `client.auth`         | Not available            | Sessions, logout, onboarding                         |
| Unreads               | Always read, acks throw  | `channel.unread`, `mentionCount`, `ack()`            |
