---
title: User Accounts
sidebar_label: User Accounts
sidebar_position: 6
---

# User Accounts

Besides bots, `@stoatx/client` can log in to a regular user account. This is what you need to build your own Stoat client, for example a web app where people log in with their email and password.

:::warning
User-account support is new. Signing up, logging in, sessions, onboarding, account management, two-factor authentication, settings sync, unreads, typing, friends, blocking, DMs, groups, creating servers and invites all work, but expect rough edges.
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

The `client.auth` methods that act on the logged-in account only work with a user session; with a bot token they throw a `USER_ONLY` error.

## Creating an account

Signing up works before logging in. Stoat emails a verification link, and the account can log in once it's verified:

```ts
await client.auth.createAccount({ email, password });
// Some instances also need { invite } or { captcha }.
```

The link contains a code. Pass it to `verifyEmail()`, which returns a ticket that logs the new account in without asking for the password again:

```ts
const ticket = await client.auth.verifyEmail(code);
if (ticket) {
  const result = await client.loginWithCredentials({ mfaTicket: ticket.token });
  // A new account always needs onboarding: result.result === "Onboarding"
}
```

If the email didn't arrive, `client.auth.resendVerification(email)` sends it again.

## Resetting a forgotten password

Also works before logging in:

```ts
await client.auth.sendPasswordReset(email);

// Later, with the token from the emailed link:
await client.auth.resetPassword(token, newPassword, { logoutAllSessions: true });
```

## Account settings

```ts
const { email } = await client.auth.fetchAccount();

await client.auth.changePassword(currentPassword, newPassword);

// Stoat emails a link to the new address; the change applies once it's verified with verifyEmail().
await client.auth.changeEmail(currentPassword, newEmail);

// The discriminator can change too, if the new username is taken with the current one.
await client.users.setUsername(newUsername, currentPassword);
```

## Two-factor authentication

Sensitive actions need an **MFA ticket**, which proves the user just confirmed who they are. Create one with a TOTP or recovery code, or with the password if the account doesn't have two-factor authentication yet:

```ts
const methods = await client.auth.mfa.fetchMethods(); // e.g. ["Password"] or ["Totp", "Recovery"]
const ticket = await client.auth.mfa.createTicket({ password });
// or { totpCode } / { recoveryCode }
```

A ticket can only be used once and expires after a few minutes, so create a new one for each action.

### Setting up an authenticator app

```ts
// Recovery codes first, so the user can still get in if they lose their phone.
const codes = await client.auth.mfa.generateRecoveryCodes(await client.auth.mfa.createTicket({ password }));
showRecoveryCodes(codes);

const { secret, uri } = await client.auth.mfa.generateTotpSecret(await client.auth.mfa.createTicket({ password }));
showQrCode(uri); // or show `secret` so it can be typed in by hand

// TOTP isn't on until the user confirms a code from the app.
await client.auth.mfa.enableTotp(await askForCode());
```

`uri` is an `otpauth://` link with `Stoat` as the issuer and the username as the label. Pass `{ issuer, accountName }` as the second argument to change them.

### Managing it

```ts
const status = await client.auth.mfa.fetchStatus(); // { totp: true, recoveryCodes: true }

await client.auth.mfa.fetchRecoveryCodes(await client.auth.mfa.createTicket({ totpCode }));

await client.auth.mfa.disableTotp(await client.auth.mfa.createTicket({ totpCode }));
```

`generateRecoveryCodes()` replaces the old codes, so they stop working.

## Disabling or deleting the account

Both need an MFA ticket:

```ts
// Logs out every session, including this one: the client disconnects and emits `logout`.
await client.auth.disableAccount(await client.auth.mfa.createTicket({ password }));

// Emails a confirmation link. Nothing is deleted until it's confirmed.
await client.auth.deleteAccount(await client.auth.mfa.createTicket({ password }));

// Later, with the token from the link (works without logging in):
await client.auth.confirmAccountDeletion(token);
```

## Policy changes

When Stoat updates a platform policy, like its terms of service, users have to acknowledge the change. The pending changes are loaded when the client connects:

```ts
client.on("ready", () => {
  for (const change of client.auth.policyChanges) {
    // change.description, change.url, change.createdAt, change.effectiveAt
  }
});

// Once the user has seen them:
await client.auth.acknowledgePolicyChanges();
```

`acknowledgePolicyChanges()` acknowledges every pending change at once and empties the list.

## Synced settings

Settings like the theme or notification preferences can be saved on the server, so they follow the user to every device. Stoat stores each setting as a string under a key you choose and never looks inside it, so most apps store JSON:

```ts
await client.settings.fetch(["appearance", "notifications"]);

const appearance = client.settings.getJSON<{ theme: string }>("appearance");
client.settings.get("appearance"); // the raw string

// Strings are stored as-is, anything else as JSON. Other keys are left unchanged.
await client.settings.set({ appearance: { theme: "dark" } });
```

Changes from the user's other devices update `client.settings.cache` and emit `settingsUpdate` with the keys that changed. Your own `set()` calls don't trigger it:

```ts
client.on("settingsUpdate", (changed) => {
  if (changed.has("appearance")) applyTheme(client.settings.getJSON("appearance"));
});
```

:::note
Keys are shared with every other Stoat client the user logs in with, including the official one. Prefix your keys (e.g. `myapp:appearance`) unless you mean to read or write the official client's settings.
:::

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

## Checking permissions

To hide channels the user can't see, or disable the message box where they can't post, check their permissions in the channel. They're calculated the same way Stoat does it: the server's defaults, the member's roles, the channel's overrides, timeouts, and the rules for DMs and groups.

```ts
channel.permissions.has("ViewChannel"); // the logged-in user
channel.permissions.has("SendMessage");
channel.permissionsFor(member).has("ManageMessages"); // anyone else: a user, their ID or their member

member.permissions.has("KickMembers"); // server-wide, before channel overrides
```

DMs can only be messaged between friends (or with a bot); other DMs, including with someone who blocked the user, are read-only.

Everyone the user has a relationship with is loaded when the client connects, so the lists are ready straight away:

```ts
client.users.friends; // Collection of friends
client.users.incomingFriendRequests; // requests waiting for an answer
client.users.outgoingFriendRequests; // requests the user sent
client.users.blocked; // users the user blocked
```

They're kept up to date as relationships change, including from the other side or another device. Listen to `userRelationship` to re-render:

```ts
client.on("userRelationship", (user) => {
  console.log(`${user.username} is now: ${user.relationship}`);
});
```

Each user's `relationship` is one of `"None"`, `"Friend"`, `"Outgoing"`, `"Incoming"`, `"Blocked"`, `"BlockedOther"` (they blocked the user) or `"User"` (the logged-in user).

To change a relationship:

```ts
// Send a request by username. The discriminator is required.
await client.users.sendFriendRequest("alice#1234");

await user.addFriend(); // send a request, or accept theirs
await user.removeFriend(); // unfriend, cancel your request, or decline theirs
await user.block(); // also removes any friendship or request
await user.unblock();
```

Each returns the updated user. Invalid changes reject with a `StoatAPIError`, e.g. `AlreadyFriends`, `AlreadySentRequest`, `Blocked`, `TooManyPendingFriendRequests`, or `NoEffect` when there's nothing to remove.

:::note
If you set `cacheLimits.users`, users can be evicted from the cache and drop out of these lists. Leave it unset for user clients.
:::

## Profiles and mutuals

For a profile page, fetch the user's profile and what they have in common with the logged-in user:

```ts
const profile = await user.fetchProfile();
profile.content; // the "about me" text, or null
profile.background?.url; // the background image, or null

const mutual = await user.fetchMutual();
// IDs: look them up in client.users, client.servers and client.channels
mutual.userIds; // mutual friends
mutual.serverIds; // servers you're both in
mutual.channelIds; // groups and DMs you're both in
```

Both also exist on the manager, for when you only have an ID: `client.users.fetchProfile(id)` and `client.users.fetchMutual(id)`.

For avatars, `user.displayAvatarURL` is the user's avatar, or the generated default one if they haven't set any (`user.defaultAvatarURL`). It's the CDN's small preview, which is what you want to show; `user.avatar?.url` is the original file. The same goes for any file: `attachment.previewURL` is a resized WebP for images (the CDN redirects to the original for other files), and `attachment.url` is the original, to open or download.

## Direct messages

All DM, group and Saved Messages channels are loaded when the client connects. To open a DM with someone:

```ts
const dm = await client.users.createDM(user);
await dm.send("Hey!");
```

`client.users.fetchDMs()` reloads the full list if you need to resync.

## Groups

A group is a channel with up to 50 members. Only friends can be added:

```ts
const group = await client.channels.createGroup({
  name: "Weekend plans",
  users: [alice, bob], // users or IDs
  // Optional: description, icon (a file ID or an AttachmentBuilder), nsfw
});

await group.addMember(carol);
await group.removeMember(bob); // owner only
const members = await group.fetchMembers();

await group.leave(); // or { silent: true } to leave without a "user left" message
```

`group.recipients` holds the member IDs and stays up to date as people join and leave.

## Creating servers

```ts
const server = await client.servers.create({ name: "My Server" });
// Optional: description, nsfw
```

The server and its default channels are cached by the time `create()` resolves. Bots can't create servers.

## Joining servers with invites

Preview an invite before joining. This works even before logging in, e.g. for an invite landing page:

```ts
const invite = await client.invites.fetch("abc123"); // the code from https://stt.gg/abc123

if (invite.type === "Server") {
  console.log(`${invite.inviterName} invited you to ${invite.serverName} (${invite.memberCount} members)`);
} else {
  console.log(`${invite.inviterName} invited you to the group ${invite.channelName}`);
}
```

Then join:

```ts
const joined = await client.invites.accept("abc123"); // a Server, or a GroupChannel for group invites
```

The server or group is cached by the time `accept()` resolves. Bots can't accept invites.

### Creating invites

Server channels and groups can create invites:

```ts
const invite = await channel.createInvite({
  maxUses: 10, // 1–100, unlimited by default
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // never expires by default
});
invite.code; // e.g. share https://stt.gg/<code> on stoat.chat

await invite.delete(); // or client.invites.delete(code)
```

`expiresAt` must be in the future and within the instance's maximum invite duration, otherwise the request fails with `InvalidOperation`. A server's invites are listed with `server.invites.fetch()`.

## Searching messages

```ts
const results = await channel.messages.search({ query: "meeting notes", sort: "Latest", limit: 20 });
const pinned = await channel.messages.search({ pinned: true });
```

Pass `query` or `pinned`, not both. `before` and `after` page through results, and `includeUsers: true` also caches the authors. `sort` defaults to `"Relevance"`.

## Calls

When the user starts a call in a DM or group, the other members' clients ring. To stop ringing one of them, for example after they decline:

```ts
await channel.stopRinging(user); // the logged-in user has to be in the call
```

## Reporting

Messages, servers and users can be reported to Stoat's moderation team:

```ts
await message.report("SpamAbuse", { context: "Posted the same link in every channel" });
await server.report("ScamsFraud");
await user.report("Impersonation", { message }); // optionally, the message that shows it
```

Messages and servers take a `ContentReportReason` (e.g. `"Illegal"`, `"Harassment"`, `"Malware"`), users a `UserReportReason` (e.g. `"InappropriateProfile"`, `"BanEvasion"`, `"Underage"`).

## Push notifications

In the browser, a service worker can receive notifications while your app is closed. Subscribe with the instance's VAPID key, then hand the subscription to Stoat:

```ts
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: await client.auth.fetchVapidKey(),
});
await client.auth.subscribePush(subscription);
```

Each session has one subscription; subscribing again replaces it. `client.auth.unsubscribePush()` stops notifications for this session. `fetchVapidKey()` returns `null` if the instance doesn't support push.

## Managing bots

A user can create bots and manage them through `client.bots`:

```ts
const bot = await client.bots.create("my-bot");
bot.token; // log the bot in with this, e.g. client.login(bot.token) in another process

const bots = await client.bots.fetchOwned();

await bot.edit({ public: true, defaultPermissions: ["SendMessage", "ViewChannel"] });
await bot.resetToken(); // the old token stops working
await bot.delete();
```

To add a bot to a server or group, including public bots made by others:

```ts
await bot.inviteToServer(server); // or pass permissions as the second argument
await bot.inviteToGroup(group);

// Show a public bot's details, e.g. on an invite page
const info = await client.bots.fetchPublic(botId);
await client.bots.inviteToServer(botId, server);
```

### Discover

Bots and servers can ask to be listed on Discover. Requests are reviewed only on instances that run Discover, such as stoat.chat; elsewhere they're stored without anyone reviewing them.

```ts
await bot.requestDiscover(); // or server.requestDiscover()

const request = await bot.fetchDiscoverRequest();
request.status; // "Pending", "UnderReview", "Approved", "Denied" or "Removed"
request.reason; // the reviewers' reason, if they gave one

await bot.cancelDiscoverRequest(); // only while it's still in the queue
```

A bot needs `analytics` turned on to be listed: `bot.edit({ analytics: true })`.

## Bots vs. user accounts

Everything else in this guide works the same for both. The differences:

|                       | Bot                      | User account                                         |
| --------------------- | ------------------------ | ---------------------------------------------------- |
| Log in with           | `client.login(botToken)` | `client.loginWithCredentials()` or a session         |
| Where it can run      | A server you control     | Anywhere, including the user's browser               |
| `ready` payload extra | –                        | `user_settings`, `channel_unreads`, `policy_changes` |
| `client.auth`         | Not available            | Account, 2FA, sessions, logout, onboarding           |
| Unreads               | Always read, acks throw  | `channel.unread`, `mentionCount`, `ack()`            |
| Synced settings       | Not available            | `client.settings`                                    |
| Friends and invites   | Not allowed by Stoat     | `user.addFriend()`, `client.invites.accept()`, …     |
| Push notifications    | Not available            | `client.auth.subscribePush()`                        |
| Managing bots         | Not available            | `client.bots`                                        |
