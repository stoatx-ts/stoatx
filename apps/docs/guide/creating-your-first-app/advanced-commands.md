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

Now that you know how to secure your commands, manage spam, and handle complex input, you can explore more advanced features like Dependency Injection in our [Dependency Injection](./dependency-injection.md) guide.
