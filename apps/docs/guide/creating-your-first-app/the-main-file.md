---
title: The Main File
sidebar_label: The Main File
sidebar_position: 2
---

# The Main File

In the previous section, we set up our folders and installed the `@stoatx/framework`. Now, it's time to rewrite our bot's entry point (`src/index.ts`).

Instead of manually importing the base `Client` and stuffing it full of `client.on` event listeners, we are going to use the framework's registry to automatically load everything for us.

## Bootstrapping the Framework

Open your `src/index.ts` file and replace its contents with the following code.

```typescript
// src/index.ts
// Renamed to not confuse when stoatx and @stoatx/client are compared.
import { Client as StoatxClient } from "stoatx";
import { env } from "./env.js";

// 2. Initialize the Framework Client
const client = new StoatxClient({
  // You can still pass all your base @stoatx/client options here!
  cacheLimits: {
    messages: 200,
  },
  // The framework will automatically load all your commands and events, we will cover how to create those in the next few sections.

  // Stoatx related options
  disableMentionPrefix: true, // Disabling this makes the bot ignore @mentions as a command prefix, so it will only respond to your custom prefixes.

  // You can pass a simple string, such as prefix: "!" or prefix: "$", but using a function allows you to have dynamic prefixes based on the server or any other context!
  prefix: ({ serverId }) => {
    // You can also use a function to return dynamic prefixes based on the server, user, or any other context!
    if (serverId === "123") return "$"; // Custom prefix for a specific server
    return "!"; // Default prefix for all other servers
  },

  // Bot owners are users that have special access to your bot, such as bypassing cooldowns or accessing owner-only commands. You can specify them here by their user IDs.
  owners: ["01JE2MM759J5D7CHJF084R7MJ2"],

  // Extensions are required if you are using tsx
  extensions: process.env.NODE_ENV === "development" ? [".ts"] : [".js"],
});

// 3. Connect to Stoat
client.login(env.STOAT_TOKEN).then(() => {
  console.log("Framework is initializing...");
});
```

## What changed?

This new setup might look incredibly minimal, but it is doing a massive amount of heavy lifting behind the scenes.

1. StoatxClient vs Client: By importing StoatxClient from the framework instead of the base client, your bot gains a built-in "Registry". This registry is responsible for mapping out your decorators.
2. **Automated Registration:** The framework is incredibly smart. Notice how we didn't have to specify where our commands or events live? The framework will automatically scan your directory for @Command and @Event decorators, instantiate the classes, and wire them into the bot's memory.
3. No More Spaghetti Code: Notice that there is no client.on("messageCreate") in this file. Your main file is now purely a configuration file. Its only job is to boot up the engine.

## Running the Code

If you run pnpm tsx src/index.ts right now, your bot will successfully log in, but it won't actually do anything. That is because our commands and events folders are currently empty!

In the next section, we will populate those folders and write our very first decorator-based command.

## Next Steps

Head over to [Creating Commands](./creating-commands.md) to learn how to use the `@Command` decorator to build scalable, isolated features for your bot.
