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
3. The method name (`ping`) does not have to match the command name, but it is a good practice to keep them consistent for clarity. This method will be called when the command is executed.
4. The `CommandContext` parameter provides access to the message that triggered the command, allowing you to reply or perform other actions.

:::tip
You can name the class itself whatever you want (e.g., `class PingCommand` or `class Ping`). The framework only cares about the `name` property inside the decorator!
:::

## Testing Your Command

Now that we have our command defined, let's test it out. Make sure your bot is running and type `!ping` or `!p` in a channel where the bot has access. You should see the bot reply with "Pong! 🏓".

---

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

---

## Execution Guards

Sometimes you need to restrict a command so it can only be used under specific conditions like requiring a certain role, ensuring the user is in a voice channel, or checking a database first. Instead of writing the same `if/else` checks inside every command body, you can use **Guards**.

Guards act as middleware that runs _before_ your command. If a guard fails, the command is safely blocked from executing.

### Creating a Guard

To create a reusable guard with parameters (like checking for a specific role name), you can write a factory function that returns an anonymous class implementing the `GuardInterface`.

Here is an example of a `HasRole` guard:

```typescript
// src/guards/HasRole.ts
import type { CommandContext, GuardInterface } from "stoatx";

export function HasRole(roleName: string) {
  return class implements GuardInterface {
    async run(ctx: CommandContext): Promise<boolean> {
      const server = ctx.message.server;
      if (!server) return false;

      const member = server.members.cache.get(ctx.authorId);
      return member?.roles.cache.has(roleName) ?? false;
    }

    async guardFail(ctx: CommandContext): Promise<void> {
      await ctx.reply(`⛔ You need the **${roleName}** role to use this command.`);
    }
  };
}
```

- `run(ctx)`: Returns `true` if the command should execute, and `false` if it should be blocked.
- `guardFail(ctx)`: An optional method called automatically when `run` returns `false`, allowing you to centrally manage custom error messages without repeating them in your commands.

### Applying Guards

To use your new guard, import it and apply the `@Guard` decorator. You can apply guards in two ways: at the **Class Level** or the **Method Level**.

- **Class Level:** Applying `@Guard` right below `@Stoat()` protects _every_ command inside that file.
- **Method Level:** Applying `@Guard` right above `@SimpleCommand()` protects only that specific command.

You can safely mix and match these scopes! When both are used, the framework is smart enough to run the class-level guards first, followed by the specific method-level guards.

```typescript
// src/commands/admin.ts
import { Stoat, SimpleCommand, Guard, type CommandContext } from "stoatx";
import { HasRole } from "../guards/HasRole.js";
import { InVoiceChannel } from "../guards/InVoiceChannel.js";

@Stoat()
@Guard(HasRole("Admin")) // 1. Must be an Admin to use ANYTHING in this file
export class AdminCommands {
  @SimpleCommand({ name: "view-logs" })
  async viewLogs(ctx: CommandContext) {
    // Only needs Admin (Inherited from the class)
    await ctx.reply("Fetching logs...");
  }

  @SimpleCommand({ name: "nuke" })
  @Guard(InVoiceChannel) // 2. Must ALSO be in a voice channel to run this specific command
  async nuke(ctx: CommandContext) {
    // Needs Admin AND Voice Channel
    await ctx.reply("Nuking the channel...");
  }
}
```

### Global Guards

Sometimes you need to block execution before it even reaches a specific command file—like putting your entire bot into maintenance mode or creating a global user blacklist.

You can register **Global Guards** directly in your client configuration. These run before any Class-Level or Method-Level guards.

**1. Create the Global Guard:**

```typescript
// src/guards/MaintenanceMode.ts
import type { CommandContext, GuardInterface } from "stoatx";

export function MaintenanceMode(isActive: boolean) {
  return class implements GuardInterface {
    async run(ctx: CommandContext): Promise<boolean> {
      // If maintenance is NOT active, allow execution
      return !isActive;
    }

    async guardFail(ctx: CommandContext): Promise<void> {
      await ctx.reply("🛠️ The bot is currently in maintenance mode. Try again later!");
    }
  };
}
```

**2. Register it in your Client:**

```typescript
// src/index.ts
import { Client as StoatxClient } from "stoatx";
import { MaintenanceMode } from "./guards/MaintenanceMode.js";

const client = new StoatxClient({
  // ... your other options ...
  globalGuards: [MaintenanceMode(true)], // Pass the factory directly!
});
```

---

# Command Arguments & Options

Stoatx provides a powerful, type-safe parsing engine for your commands. Instead of defining args and options inside the decorator config, you declare them directly as method parameters using the `@Arg` and `@Option` decorators. Types are inferred automatically from your TypeScript parameter types — no manual type strings needed.

## Basic Usage

```typescript
import { Stoat, SimpleCommand, Arg, Option, type CommandContext } from "stoatx";
import type { User } from "stoatx";

@Stoat()
export class ModerationCommand {
  @SimpleCommand({
    name: "ban",
    description: "Bans a user from the server",
  })
  async ban(
    @Arg({ required: true }) target: User,
    @Option({ name: "reason" }) reason: string | undefined,
    @Option({ name: "deleteDays" }) deleteDays: number | undefined,
    ctx: CommandContext,
  ) {
    const why = reason ?? "No reason provided";
    const days = deleteDays ?? 0;
    await ctx.reply(`Banning ${target.username} for ${why}. (Deleting ${days} days of messages)`);
  }
}
```

The `ctx` parameter always goes last and requires no decorator — Stoatx identifies it automatically.

## Supported Types

Types are inferred from the TypeScript parameter type:

- `string` — standard text
- `number` — automatically cast and validated
- `boolean` — `"false"` becomes `false`, anything else becomes `true`; bare flags (e.g. `--force`) become `true`
- `User`, `BaseChannel`, `Role` — Stoat mention types from `stoatx`

## Stoat Mentions

When a parameter is typed as `User`, `BaseChannel`, or `Role`, the parser accepts either a raw ULID or a formatted mention (e.g. `<@01ARZ3...>`). By default, it resolves from the cache. If you need a guaranteed fresh object from the API, use `fetch: true`:

```typescript
@SimpleCommand({ name: "info" })
async info(
  @Arg({ required: true, fetch: true }) target: User,
  ctx: CommandContext
) {
  await ctx.reply(`Username: ${target.username}`);
}
```

If the fetch fails (user not found, API error), `onValidationError` is called with a `FetchFailedError`.

## Positional Args vs Named Options

`@Arg` maps to positional arguments — the order they appear on the decorator is the order the user types them:

```
!ban @user
```

`@Option` maps to named flags — the user passes them explicitly by name:

```
!ban @user --reason spam --deleteDays 7
```

## Custom Flag Prefixes

By default, flags use `-` (so `--reason` works since all leading prefix chars are stripped). You can customize this globally:

```typescript
const client = new StoatxClient({
  flagPrefix: "+", // users type +reason or ++reason
});
```

## Error Handling

Stoatx separates validation errors from runtime errors, giving you precise control over each.

### `onValidationError`

Called when user input fails validation before the command runs — missing arguments, wrong types, invalid mentions, or failed fetches. If not implemented, falls back to `onError`, then a default reply.

```typescript
import {
  CommandValidationError,
  MissingArgumentError,
  MissingOptionError,
  InvalidTypeError,
  InvalidMentionError,
  FetchFailedError,
} from "stoatx";

@Stoat()
export class ModerationCommand implements StoatLifecycle {
  @SimpleCommand({ name: "ban" })
  async ban(
    @Arg({ name: "target", required: true, fetch: true }) target: User,
    @Option({ name: "reason" }) reason: string | undefined,
    ctx: CommandContext,
  ) {
    await ctx.reply(`Banned ${target.username} for ${reason ?? "no reason"}.`);
  }

  async onValidationError(ctx: CommandContext, error: CommandValidationError) {
    if (error instanceof FetchFailedError) {
      await ctx.reply(`Couldn't find that ${error.mentionKind}.`);
    } else if (error instanceof MissingArgumentError) {
      await ctx.reply(`Usage: \`!ban <target>\``);
    } else if (error instanceof InvalidMentionError) {
      await ctx.reply(`\`${error.rawValue}\` is not a valid ${error.mentionKind}.`);
    } else if (error instanceof InvalidTypeError) {
      await ctx.reply(`Expected ${error.expected} but got \`${error.received}\`.`);
    } else {
      await ctx.reply(`⚠️ ${error.message}`);
    }
  }

  async onError(ctx: CommandContext, error: Error) {
    console.error(error);
    await ctx.reply("Something went wrong. Please try again later.");
  }
}
```

The `else` branch acts as a catch-all for any validation error you didn't handle specifically. For simple bots that just want a generic message, you can skip the `instanceof` checks entirely and just use `error.message`.

### `onError`

Called when an unhandled runtime error is thrown inside the command body — the safety net for errors you didn't anticipate. If not implemented, the framework logs the error and replies with a generic message so the bot never silently fails.

### Available error types

| Class                  | When thrown                             |
| ---------------------- | --------------------------------------- |
| `MissingArgumentError` | Required `@Arg` not provided            |
| `MissingOptionError`   | Required `@Option` not provided         |
| `InvalidTypeError`     | Value couldn't be cast to expected type |
| `InvalidMentionError`  | Mention string isn't a valid ULID       |
| `FetchFailedError`     | `fetch: true` but API call failed       |
| `NoServerContextError` | Role fetch attempted outside a server   |

All extend `CommandValidationError` which extends `StoatxError`.

## Next Steps

Now that you know how to build commands, we need to handle the other half of the bot's logic: listening to background events like users joining the server or messages being deleted.

Head over to [Event Handling](./event-handling.md) to learn how to use the `@On`/`@Once` decorator.
