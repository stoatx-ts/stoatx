---
title: Browsers and Other Runtimes
sidebar_label: Browsers & Runtimes
sidebar_position: 5
---

# Browsers and Other Runtimes

`@stoatx/client` runs in Node.js, in browsers, and in other runtimes with a standard `WebSocket` and `fetch` (Deno, Bun).
Everything works the same way in each one except voice, which needs Node.js.

:::danger
Never put a bot token in a browser

Anything shipped to a browser can be read by whoever opens the page: the token is visible in devtools, in network requests and in your JavaScript bundle.
Someone with your bot token has full control of your bot. Keep bot tokens on a server you control.

Logging in as a regular user account (for building web clients) is not supported yet. Until it is, only use the browser build with tokens that are safe for the person in front of the screen to see.
:::

## Requirements

| Runtime  | Version                                                 |
| -------- | ------------------------------------------------------- |
| Node.js  | 22 or newer (the gateway uses the built-in `WebSocket`) |
| Browsers | Any current browser                                     |
| Deno/Bun | Any version with a global `WebSocket` and `fetch`       |

## Using it in a browser

Install it like any other package. There is no separate browser package or import path:

```bash
pnpm add @stoatx/client
```

```ts
import { Client } from "@stoatx/client";

const client = new Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.username}`);
});

await client.login(token);
```

Bundlers such as Vite, webpack, Rollup and esbuild pick the browser build automatically through the `"browser"` export condition.
The browser build has the same API as the Node.js build, without the voice classes.

### What works

- REST requests, rate limiting and the gateway connection, including reconnects
- Caches, managers and every client event
- Message and reaction collectors
- File uploads with `AttachmentBuilder`

### Uploading files from the page

`AttachmentBuilder` accepts a `Blob`, an `ArrayBuffer` or a typed array, and a `File` is a `Blob`, so a file picked by the user can be passed in directly:

```ts
import { AttachmentBuilder } from "@stoatx/client";

const input = document.querySelector<HTMLInputElement>("#file")!;

input.addEventListener("change", async () => {
  const file = input.files?.[0];
  if (!file) return;

  await channel.send({
    content: "Here you go",
    attachments: [new AttachmentBuilder(file, file.name)],
  });
});
```

In Node.js, a `Buffer` works too.

### Voice

Voice uses `@livekit/rtc-node` and `ffmpeg`, which only run in Node.js. In the browser build, `VoiceConnection`, `AudioPlayer` and `AudioResource` are not exported,
and `client.voice.join()` (or `channel.join()`) rejects with a `VOICE_UNAVAILABLE` error.

## TypeScript

The browser build's type declarations still reference a few Node.js types. If type checking reports errors inside `@stoatx/client`, either:

- enable `skipLibCheck` in your `tsconfig.json` (the default in most Vite templates), or
- install `@types/node` as a dev dependency.

To have TypeScript resolve the browser build's declarations, add the `browser` condition:

```json
{
  "compilerOptions": {
    "moduleResolution": "Bundler",
    "customConditions": ["browser"]
  }
}
```

This is optional: without it, TypeScript uses the Node.js declarations, which only add the voice classes.
