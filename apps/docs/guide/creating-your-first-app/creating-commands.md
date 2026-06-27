---
title: Creating Commands
sidebar_label: Creating Commands
sidebar_position: 4
---

# Creating Commands

In the `stoatx` framework, every command is isolated into its own file and defined using a **Class** and a **Decorator**. This keeps your codebase incredibly clean and makes it easy to find and edit specific features later.

## Your First Command

Let's create a simple Ping command. Create a new file named `ping.ts` inside your `src/commands/` directory and add the following code:

```typescript
// src/commands/ping.ts
import { Stoat, SimpleCommand, type CommandContext, StoatLifecycle } from "stoatx";

@Stoat()
export class PingCommand implements StoatLifecycle {
  @SimpleCommand({
    name: "ping",
    description: "Replies with Pong and tests the bot's responsiveness.",
    aliases: ["p"],
  })
  async ping(ctx: CommandContext) {
    await ctx.message.reply({
      content: "Pong! 🏓",
    });
  }
}
```

## Understanding the Code

1. **`@Stoat()`**: Marks this class to be automatically loaded by the framework.
2. **`@SimpleCommand()`**: Defines the command's name, description, and aliases.
3. **`ping()` method**: The method name doesn't have to match the command name, but it is good practice to keep them consistent.
4. **`CommandContext`**: Provides access to the message that triggered the command, allowing you to reply or perform other actions.

:::tip
You can name the class itself whatever you want (e.g., `class PingCommand` or `class Ping`). The framework only cares about the `name` property inside the decorator!
:::

## Testing Your Command

Now that we have our command defined, make sure your bot is running and type `!ping` or `!p` in a channel where the bot has access. You should see the bot reply with "Pong! 🏓".

---

## Next Steps

Now that you know how to define a basic command, it's time to add power to them. Learn about cooldowns, user permissions, execution guards, and dynamic arguments in our [Advanced Commands](./advanced-commands.md) guide.
