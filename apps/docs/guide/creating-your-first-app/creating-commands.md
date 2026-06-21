---
title: Creating Commands
sidebar_label: Creating Commands
sidebar_position: 3
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

## Next Steps

Now that you know how to build commands, we need to handle the other half of the bot's logic: listening to background events like users joining the server or messages being deleted.

Head over to [Event Handling](./event-handling.md) to learn how to use the `@On`/`@Once` decorator.
