---
title: Creating Commands
sidebar_label: Creating Commands
sidebar_position: 4
---

# Creating Commands

With our `index.ts` file configured to automatically load everything, we can finally stop writing massive `if/else` statements inside a single event listener.

In the `stoatx` framework, every command is isolated into its own file and defined using a **Class** and a **Decorator**. This keeps your codebase incredibly clean and makes it easy to find and edit specific features later.

## Your First Command

Let's recreate the simple Ping command we wrote in the Getting Started section, but this time, we will use the framework's architecture.

Create a new file named `ping.ts` inside your `src/commands/` directory and add the following code:

```typescript
// src/commands/ping.ts
import { Stoat, SimpleCommand, type CommandContext, StoatLifeCycle } from "stoatx";
import type { Message } from "stoatx";

@Stoat()
export class PingCommand implements StoatLifecycle {
  @SimpleCommand({
    name: "ping",
    description: "Replies with Pong and tests the bot's responsiveness.",
    aliases: ["p"], // Users can type !ping or !p
  })
  // The method must match the name of the command, in this case "ping"
  async ping(ctx: CommandContext) {
    await ctx.message.reply({
      content: "Pong! 🏓",
    });
  }
}
```

## Understanding the Code

Let's break down exactly what is happening in this file:

1. The `@Stoat()` decorator marks this class to be automatically loaded by the framework. Without it, the command will not be registered.
2. The `@SimpleCommand()` decorator defines the command's name, description, and any aliases. This is what users will type to invoke the command.
3. The method name (`ping`) must match the command name defined in the decorator. This is where the logic for the command is implemented.
4. The `CommandContext` parameter provides access to the message that triggered the command, allowing you to reply or perform other actions.

:::tip
You can name the class itself whatever you want (e.g., `class PingCommand` or `class Ping`). The framework only cares about the `name` property inside the decorator!
:::

## Testing Your Command

Now that we have our command defined, let's test it out. Make sure your bot is running and type `!ping` or `!p` in a channel where the bot has access. You should see the bot reply with "Pong! 🏓".

## Adding Cooldowns

To prevent users from spamming your commands, you can add a `cooldown` property directly to your `@SimpleCommand` decorator. The value is defined in seconds.

```typescript
@SimpleCommand({
  name: "ping",
  description: "Replies with Pong",
  cooldown: 5 // Users can only run this every 5 seconds
})
```

By default, the framework uses a built-in memory manager to track these cooldowns. However, if your bot restarts, that memory is wiped.

### Custom Cooldown Managers

If you want to persist your cooldowns across restarts, you can easily override the framework's default behavior by creating a custom class that implements `CooldownManager`.

Here is an example of a "Mixed" manager. It uses a database for specific commands (mocked here with a simple `Map` so we don't have to set up a real database just for a tutorial!), while falling back to the default memory manager for everything else:

```typescript
// src/cooldowns.ts
import { CooldownManager, DefaultCooldownManager } from "stoatx";
import type { CommandContext, CommandMetadata } from "stoatx";

// Mock database (In production, this would be Redis, PostgreSQL, etc.)
const slowmodes = new Map<string, number>();

export class MixedCooldownManager implements CooldownManager {
  private memory = new DefaultCooldownManager();

  async check(ctx: CommandContext, metadata: CommandMetadata): Promise<boolean> {
    if (metadata.cooldownStorage === "database") {
      const key = `${ctx.message.author?.id}:${metadata.name}`;
      const expiresAt = slowmodes.get(key);

      if (expiresAt && expiresAt > Date.now()) {
        return false; // Still on cooldown
      }
      return true; // Not on cooldown
    }

    // Fallback to default memory management
    return this.memory.check(ctx, metadata);
  }

  async getRemaining(ctx: CommandContext, metadata: CommandMetadata): Promise<number> {
    if (metadata.cooldownStorage === "database") {
      const key = `${ctx.message.author?.id}:${metadata.name}`;
      const expiresAt = slowmodes.get(key);

      if (expiresAt) {
        return Math.max(0, expiresAt - Date.now());
      }
      return 0;
    }
    return this.memory.getRemaining(ctx, metadata);
  }

  async set(ctx: CommandContext, metadata: CommandMetadata): Promise<void> {
    if (metadata.cooldownStorage === "database") {
      const key = `${ctx.message.author?.id}:${metadata.name}`;
      const expiresAt = Date.now() + (metadata.cooldown ?? 0) * 1000;
      slowmodes.set(key, expiresAt);
      return;
    }
    this.memory.set(ctx, metadata);
  }
}
```

### Registering the Custom Manager

To apply your new cooldown logic, simply pass it into your client configuration inside your `src/index.ts` file:

```typescript
// src/index.ts
import { Client as StoatxClient } from "stoatx";
import { MixedCooldownManager } from "./cooldowns.js";

const client = new StoatxClient({
  // ... your other options ...
  cooldownManager: new MixedCooldownManager(),
});
```

Now, any command that includes `cooldownStorage: "database"` in its decorator metadata will route through your custom persistence logic, keeping your bot perfectly synchronized even after updates!

# Command Arguments & Options

Stoatx provides a powerful, type-safe parsing engine for your commands. It automatically handles positional arguments, optional flags, type casting, and Stoat mentions—saving you from writing manual regex or validation checks.

## Basic Usage

You can define expected inputs directly inside the `@SimpleCommand` decorator using the `args` (positional) and `options` (flags) arrays.

```typescript
import { Stoat, SimpleCommand, CommandContext } from "stoatx";

@Stoat()
export class ModerationCommand {
  @SimpleCommand({
    name: "ban",
    description: "Bans a user from the server",
    // Positional Arguments (e.g., !ban @user)
    args: [{ name: "target", type: "user", required: true }],
    // Optional Flags (e.g., --reason spam --deleteDays 7)
    options: [
      { name: "reason", type: "string" },
      { name: "deleteDays", type: "number" },
    ],
  })
  async ban(ctx: CommandContext) {
    const targetId = ctx.args[0];
    const reason = ctx.options.reason || "No reason provided";
    const deleteDays = ctx.options.deleteDays || 0;

    await ctx.reply(`Banning <@${targetId}> for ${reason}. (Deleting ${deleteDays} days)`);
  }
}
```

### Supported Types

Both `args` and `options` support the following types:

- `"string"` - Standard text.
- `"number"` - Automatically casts to a JavaScript `Number`.
- `"boolean"` - Automatically casts to `true`/`false` (e.g., `--force` becomes `true`).
- `"user"`, `"channel"`, `"role"` - Stoat mentions.

## Stoat Mentions (ULID Support)

When you require a `"user"`, `"channel"`, or `"role"`, the Stoatx parser is smart enough to accept either a raw ID or a formatted chat mention (like `<@01ARZ3...>`).

Regardless of what the user types, **the parser automatically strips the formatting and guarantees a clean, valid 26-character ULID string** is passed to your command.

```typescript
// If the user types: !lock <#01ARZ3NDEKTSV4RRFFQ69G5FAV>
const channelId = ctx.args[0];

// ctx.args[0] is strictly "01ARZ3NDEKTSV4RRFFQ69G5FAV"
const channel = await ctx.client.channels.fetch(channelId);
```

## Custom Flag Prefixes

By default, options are parsed using the `-` or `--` prefix (e.g., `--force`). You can customize this prefix globally when initializing your bot handler.

```typescript
const handler = new StoatxHandler({
  client: myClient,
  flagPrefix: "+", // Users will now type +force or ++force
  commandsDir: "./commands",
});
```

## Advanced: Full Type Safety

Stoatx allows you to pass generics to your `CommandContext` to achieve complete, compile-time type safety for your parsed arguments and options.

To use this, define an interface for your options and a tuple for your arguments:

```typescript
// 1. Define your expected shapes
interface BanOptions {
  reason?: string;
  deleteDays?: number;
  force?: boolean;
}

type BanArgs = [string]; // Index 0 is guaranteed to be a string ID

@Stoat()
export class ModerationCommand {
  @SimpleCommand({
    name: "ban",
    args: [{ name: "target", type: "user", required: true }],
    options: [
      { name: "reason", type: "string" },
      { name: "deleteDays", type: "number" },
      { name: "force", type: "boolean" },
    ],
  })
  // 2. Pass them to the context
  async ban(ctx: CommandContext<BanOptions, BanArgs>) {
    // IDE Autocomplete works perfectly here!
    const targetId = ctx.args[0];
    const isForced = ctx.options.force;
    const days = ctx.options.deleteDays;
  }
}
```

## Error Handling

If a user provides an invalid type (like typing `!purge --count apples` when a `number` is expected), Stoatx will automatically abort the command execution and throw a `CommandValidationError`.

You can catch and format these errors gracefully using your class's `onError` lifecycle method:

```typescript
import { CommandValidationError } from "stoatx";

@Stoat()
export class ModerationCommand {
  // ... your commands ...

  async onError(ctx: CommandContext, error: Error) {
    if (error instanceof CommandValidationError) {
      await ctx.reply(`⚠️ **Invalid Input:** ${error.message}`);
      // Example output: "⚠️ Invalid Input: Invalid value for `--count`. Expected a number."
    } else {
      console.error(error);
      await ctx.reply("An unexpected error occurred.");
    }
  }
}
```

## Next Steps

Now that you know how to build commands, we need to handle the other half of the bot's logic: listening to background events like users joining the server or messages being deleted.

Head over to [Event Handling](./event-handling.md) to learn how to use the `@On`/`@Once` decorator.
