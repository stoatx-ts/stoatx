---
title: "Migrating to v1"
description: "A guide to help you migrate your application to v1."
---
# Migrating to v1

This guide covers all breaking changes introduced in v1.0.0 and how to update your bot accordingly.

## `messageCreate` is no longer handled internally

The framework no longer registers a `messageCreate` listener automatically. You must wire it up yourself using `@On` in an event class. 
Or you can use `client.on("messageCreate", ...)` if you prefer to handle it inline.

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
    await client.executeCommand(message);
  }
}
```

This gives you full control over filtering before commands are executed:
```ts
@On("messageCreate")
async onMessage(message: Message, client: Client) {
  if (message.author.bot) return;
  await client.executeCommand(message);
}
```

## `initCommands()` is no longer required

Command loading now happens automatically inside `login()`. You can remove any `initCommands()` calls from your startup code.

## `@Arg` and `@Option` replace inline args/options

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

### `fetch` support for mention types

`User`, `BaseChannel`, and `Role` parameters now support `fetch: true` to hit the API instead of looking up the cache:

```ts
@Arg({ required: true, fetch: true }) target: User
```

If the fetch fails, `onError` is called with a `CommandValidationError`.

## `CommandContext` generics removed

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