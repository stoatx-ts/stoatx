---
title: "Migrating to v1"
description: "A guide to help you migrate your application to v1."
---
# Migrating to v1

This guide covers all breaking changes introduced in v1.0.0 and how to update your bot accordingly.

## Stoatx

### `messageCreate` is no longer handled internally

The framework no longer registers a `messageCreate` listener automatically. You must wire it up yourself using `@On` in an event class, or inline with `client.on("messageCreate", ...)`.

**Before:**
```ts
const client = new Client({ prefix: "!" });
await client.initCommands();
await client.login(token);
```

**After:**
```ts
const client = new Client({ prefix: "!" });
await client.login(token);
```

```ts
// src/events/message.ts
import { Stoat, On } from "stoatx";
import type { Client, Message } from "stoatx";

@Stoat()
export class MessageEvents {
  @On("messageCreate")
  async onMessage(message: Message, client: Client) {
    if (message.author.bot) return;
    await client.executeCommand(message);
  }
}
```

### `initCommands()` has been removed

Command loading now happens automatically inside `login()`. Remove any `initCommands()` calls from your startup code.

### `@Arg` and `@Option` replace inline args/options

The `args` and `options` arrays on `@SimpleCommand` have been removed. Define your command parameters directly on the method using the `@Arg` and `@Option` decorators instead.

**Before:**
```ts
@SimpleCommand({
  name: "ban",
  args: [{ name: "target", type: "user", required: true }],
  options: [
    { name: "reason", type: "string" },
    { name: "deleteDays", type: "number" },
  ],
})
async ban(ctx: CommandContext<{ reason?: string; deleteDays?: number }, [string]>) {
  const targetId = ctx.args[0];
  const reason = ctx.options.reason;
}
```

**After:**
```ts
@SimpleCommand({ name: "ban" })
async ban(
  @Arg({ required: true }) target: User,
  @Option({ name: "reason" }) reason: string | undefined,
  @Option({ name: "deleteDays" }) deleteDays: number | undefined,
  ctx: CommandContext
) {
  await target.ban();
}
```

Types are inferred automatically from the TypeScript parameter type — no more manual `type: "user"` strings. The `ctx` parameter always goes last and requires no decorator.

#### `fetch` support for mention types

`User`, `BaseChannel`, and `Role` parameters now support `fetch: true` to hit the API instead of looking up the cache:

```ts
@Arg({ required: true, fetch: true }) target: User
```

If the fetch fails, `onValidationError` is called with a `FetchFailedError`.

### `CommandContext` generics removed

`CommandContext<TOptions, TArgs>` no longer accepts generics. Since args and options are now typed method parameters, the generics are unnecessary.

**Before:**
```ts
async ban(ctx: CommandContext<BanOptions, BanArgs>) {
  const targetId = ctx.args[0];
  const reason = ctx.options.reason;
}
```

**After:**
```ts
async ban(
  @Arg({ required: true }) target: User,
  @Option({ name: "reason" }) reason: string | undefined,
  ctx: CommandContext
) {}
```

`ctx.args` and `ctx.options` no longer exist on `CommandContext`.

### Error handling overhaul

Validation errors and runtime errors are now handled separately.

#### `onValidationError` replaces `onError` for input validation

Previously all errors — both runtime and validation — went through `onError`. Validation errors (missing arguments, wrong types, invalid mentions, failed fetches) now go through `onValidationError` instead.

**Before:**
```ts
async onError(ctx: CommandContext, error: Error) {
  if (error instanceof CommandValidationError) {
    await ctx.reply(`⚠️ ${error.message}`);
  } else {
    await ctx.reply("Something went wrong.");
  }
}
```

**After:**
```ts
async onValidationError(ctx: CommandContext, error: CommandValidationError) {
  await ctx.reply(`⚠️ ${error.message}`);
}

async onError(ctx: CommandContext, error: Error) {
  console.error(error);
  await ctx.reply("Something went wrong. Please try again later.");
}
```

`onError` is now exclusively for unhandled runtime errors thrown inside the command body.

#### New error subclasses

`CommandValidationError` is now a base class with specific subclasses for each failure case. Use `instanceof` in `onValidationError` for granular handling:

```ts
import {
  CommandValidationError,
  MissingArgumentError,
  MissingOptionError,
  InvalidTypeError,
  InvalidMentionError,
  FetchFailedError,
  NoServerContextError,
} from "stoatx";

async onValidationError(ctx: CommandContext, error: CommandValidationError) {
  if (error instanceof FetchFailedError) {
    await ctx.reply(`Couldn't find that ${error.mentionKind}.`);
  } else if (error instanceof MissingArgumentError) {
    await ctx.reply(`Missing required argument: \`<${error.paramName}>\``);
  } else if (error instanceof InvalidMentionError) {
    await ctx.reply(`\`${error.rawValue}\` is not a valid ${error.mentionKind}.`);
  } else if (error instanceof InvalidTypeError) {
    await ctx.reply(`Expected ${error.expected} but got \`${error.received}\`.`);
  } else {
    await ctx.reply(`⚠️ ${error.message}`);
  }
}
```

#### `CommandValidationError` constructor changed

If you were constructing `CommandValidationError` directly, the signature has changed.

**Before:**
```ts
new CommandValidationError(optionName, message)
```

**After:**
```ts
new CommandValidationError(paramName, paramKind, message)
// e.g.
new CommandValidationError("target", "arg", "Custom error message")
```
