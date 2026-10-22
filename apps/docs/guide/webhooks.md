---
title: Webhooks
sidebar_label: Webhooks
sidebar_position: 4
---

# Webhooks

Webhooks let you post messages to a channel without a full bot session. They are ideal for
CI notifications, deployment alerts, or any external service that needs to drop a message into
a channel. Each webhook has a public `id` and a secret `token`; the pair together authorizes
sending messages.

In `@stoatx/client`, webhooks are managed through the `WebhookManager`, available on every
channel as `channel.webhooks`, and represented by the `Webhook` structure.

## Creating a Webhook

Creating, listing, editing, and deleting webhooks require **bot authentication** — that is, a
logged-in `Client` with access to the channel. Use `channel.webhooks.create()`:

```typescript
const channel = client.channels.cache.get("CHANNEL_ID")!;

const webhook = await channel.webhooks.create({
  name: "Deploy Bot",
});
```

You can attach an avatar in the same call. Pass a raw CDN file ID, or an
`AttachmentBuilder` which will be uploaded
automatically:

```typescript
import { AttachmentBuilder } from "@stoatx/client";

const webhook = await channel.webhooks.create({
  name: "Deploy Bot",
  avatar: new AttachmentBuilder(avatarBuffer, "bot.png"),
});
```

## Fetching Webhooks

`fetch()` retrieves a single webhook by ID. Because a token grants send access, the token is
optional here — omit it when you only need the public metadata:

```typescript
// Public metadata (bot auth)
const webhook = await channel.webhooks.fetch("WEBHOOK_ID");

// With the token, when acting from an external process
const webhook = await channel.webhooks.fetch("WEBHOOK_ID", "WEBHOOK_TOKEN");
```

To list every webhook in the channel, use `fetchMany()`. It returns a
`Collection` keyed by webhook ID:

```typescript
const webhooks = await channel.webhooks.fetchMany();

for (const webhook of webhooks.values()) {
  console.log(webhook.name);
}
```

:::tip
`fetch()` and `fetchMany()` populate the manager cache. You can also read webhooks synchronously
via `channel.webhooks.cache.get("WEBHOOK_ID")`, which returns `undefined` if the webhook has not
been fetched yet.
:::

## Sending Messages

The `Webhook` structure exposes a `send()` method that posts
a message through the webhook. It accepts either a plain string or a full
`MessageOptions` object, and returns the created
`Message`:

```typescript
// Simple string content
await webhook.send("Deployment finished successfully.");

// Full message options
await webhook.send({
  content: "Deployment finished successfully.",
  embeds: [embed],
});
```

`send()` supports the same options as regular messages, including attachments, replies, embeds,
masquerade, interactions, and flags:

```typescript
import { AttachmentBuilder } from "@stoatx/client";

await webhook.send({
  content: "Here is the build artifact.",
  attachments: [new AttachmentBuilder(artifactBuffer, "build.zip")],
  embeds: [embed],
});
```

:::info
Sending requires the webhook's `token`. If you constructed a `Webhook` without a token, call
`fetch()` with the token first so `webhook.token` is populated.
:::

## Editing a Webhook

Use `edit()` to change the name, avatar, or permissions of a webhook. All fields are optional,
so you only need to pass what you want to change:

```typescript
await webhook.edit({
  name: "Release Bot",
  permissions: ["ViewChannel", "SendMessages"],
});
```

To remove an existing avatar, pass `avatar: null`. This maps to the API's `remove` field:

```typescript
await webhook.edit({ avatar: null });
```

## Deleting a Webhook

Delete a webhook either through the structure or through the manager. Both accept a `Webhook`
object or a raw string ID and evict the webhook from the cache:

```typescript
// From the structure
await webhook.delete();

// From the manager, by object or ID
await channel.webhooks.delete(webhook);
await channel.webhooks.delete("WEBHOOK_ID");
```

## Full Example

A small CI notifier that creates a webhook once and reuses it to post build results:

```typescript
import { Client } from "@stoatx/client";

const client = new Client();

client.once("ready", async () => {
  const channel = client.channels.cache.get("CHANNEL_ID");
  if (!channel) return;

  // Reuse an existing webhook named "CI" or create one
  const webhooks = await channel.webhooks.fetchMany();
  const webhook = webhooks.find((w) => w.name === "CI") ?? (await channel.webhooks.create({ name: "CI" }));

  await webhook.send("Build #42 passed ✅");
});

client.login(process.env.TOKEN!);
```

## Permissions

Webhooks carry their own `permissions` bitfield, separate from your bot's. When creating or
editing a webhook you can restrict what it is allowed to do using any
`PermissionResolvable`:

```typescript
import { Permissions } from "@stoatx/client";

await webhook.edit({
  permissions: new Permissions(["ViewChannel", "SendMessages", "EmbedLinks"]),
});
```
