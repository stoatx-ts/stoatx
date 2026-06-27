---
title: Advanced Commands
sidebar_label: Advanced Commands
sidebar_position: 5
---

# Advanced Commands

Now that you've built your first command, let's look at how to secure them, manage spam, and handle complex user input.

## Adding Cooldowns

To prevent users from spamming your commands, add a `cooldown` property (in seconds) to your `@SimpleCommand` decorator.

```typescript
@SimpleCommand({
  name: "ping",
  description: "Replies with Pong",
  cooldown: 5 // Users can only run this every 5 seconds
})
```

### Custom Cooldown Managers

If you want to persist cooldowns across restarts (e.g., in a database), you can create a custom class that implements `CooldownManager` and pass it into your client configuration in `src/index.ts`.

## Execution Guards

Guards act as middleware that runs _before_ your command. If a guard fails, the command is blocked from executing.

### Creating a Guard

Write a factory function that returns an anonymous class implementing the `GuardInterface`.

```typescript
export function HasRole(roleName: string) {
  return class implements GuardInterface {
    async run(ctx: CommandContext): Promise<boolean> {
      // Logic here...
      return true;
    }
    async guardFail(ctx: CommandContext): Promise<void> {
      await ctx.reply(`⛔ You need the **${roleName}** role.`);
    }
  };
}
```

### Applying Guards (Class, Method, and Global)

- **Class Level:** Apply `@Guard` below `@Stoat()` to protect _every_ command in the file.
- **Method Level:** Apply `@Guard` above `@SimpleCommand()` to protect that specific command.
- **Global:** Add to `globalGuards` in your `StoatxClient` config to protect the entire bot.

```typescript
@Stoat()
@Guard(HasRole("Admin")) // 1. Class level: Must be Admin to use ANYTHING here
export class AdminCommands {
  @SimpleCommand({ name: "nuke" })
  @Guard(InVoiceChannel) // 2. Method level: Must be Admin AND in a voice channel
  async nuke(ctx: CommandContext) {
    await ctx.reply("Nuking the channel...");
  }
}
```

## Command Groups & Subcommands

As your bot grows, having 50+ individual command files can become difficult to manage. **Command Groups** allow you to create namespaces (e.g., `!config prefix`) and centralize configuration.

### Defining Groups

Use `@CommandGroup` on your class to define the parent namespace. You can also define default configuration—like `ownerOnly` or `cooldown`—which will **automatically apply to all subcommands** within that class.

### Defining Subcommands

Use `@SubCommand` on your methods. These behave exactly like `@SimpleCommand`, but they inherit the group's configuration unless you explicitly override it.

```typescript
@Stoat()
@CommandGroup({
  name: "config",
  ownerOnly: true, // Group-wide security
  cooldown: 5,
})
export class ConfigCommands {
  @SubCommand({ name: "prefix" })
  async setPrefix(@Arg() p: string, ctx: CommandContext) {
    await ctx.reply(`Prefix set to: ${p}`);
  }

  @SubCommand({
    name: "status",
    ownerOnly: false, // Override: This command is public!
  })
  async getStatus(ctx: CommandContext) {
    await ctx.reply("Everything is operational.");
  }
}
```

## Command Arguments & Options

Stoatx provides a powerful, type-safe parsing engine. Declare arguments and options directly as method parameters using `@Arg` and `@Option`.

```typescript
@SimpleCommand({ name: "ban" })
async ban(
  @Arg({ required: true }) target: User,
  @Option({ name: "reason" }) reason: string | undefined,
  ctx: CommandContext
) {
  await ctx.reply(`Banned ${target.username} for ${reason ?? "no reason"}.`);
}
```

- `@Arg`: Positional arguments (e.g., `!ban @user`).
- `@Option`: Named flags (e.g., `!ban @user --reason spam`).

## Error Handling

Stoatx distinguishes between validation errors (invalid user input) and runtime errors (code crashes).

- **`onValidationError`**: Handle missing arguments or bad types.
- **`onError`**: Catch unhandled runtime exceptions.

```typescript
async onError(ctx: CommandContext, error: Error) {
  console.error(error);
  await ctx.reply("Something went wrong.");
}
```

---

## Next Steps

Now that you've mastered command logic, head over to [Event Handling](https://www.google.com/search?q=./event-handling.md) to learn how to listen to background events like users joining the server or messages being deleted.
