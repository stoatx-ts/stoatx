---
title: Dependency Injection
sidebar_label: Dependency Injection
sidebar_position: 6
---

# Dependency Injection

Stoatx features a built-in, native Dependency Injection (DI) container. This allows you to manage services—like database connections, API wrappers, or cache managers—in a clean, decoupled way.

Instead of importing and instantiating services manually inside your commands, the framework automatically resolves and injects them into your class constructor.

## Creating a Service

To make a class available for injection, mark it with the `@Injectable()` decorator. By default, Stoatx resolves services as **Singletons**, meaning the same instance is shared across your entire bot.

```typescript
// src/services/DatabaseService.ts
import { Injectable } from "stoatx";

@Injectable()
export class DatabaseService {
  async getUserCoins(userId: string): Promise<number> {
    // Simulated database call
    return 100;
  }
}
```

## Injecting into Commands

To use your service, simply add it to the `constructor` of your command class. The Stoatx DI container will detect the type, resolve the service, and inject it automatically.

```typescript
// src/commands/economy.ts
import { Stoat, SimpleCommand, type CommandContext } from "stoatx";
import { DatabaseService } from "../services/DatabaseService.js";

@Stoat()
export class EconomyCommands {
  // ✅ The container automatically provides DatabaseService here
  constructor(private readonly db: DatabaseService) {}

  @SimpleCommand({ name: "balance" })
  async balance(ctx: CommandContext) {
    const coins = await this.db.getUserCoins(ctx.authorId);
    await ctx.reply(`You currently have ${coins} coins.`);
  }
}
```

## Why use DI?

1. **Cleaner Code:** Stop writing `new DatabaseService()` in every command file.
2. **Testability:** Because dependencies are passed into the constructor, you can easily pass "mock" services when writing unit tests for your commands.
3. **Performance:** Since Stoatx uses a Singleton pattern, your services (like a database pool) are initialized exactly once, saving memory and connection overhead.

---

## Next Steps

Now that your bot is modular and DI-enabled, you may want to learn how to keep your logic separate from your command structure by reading the guide on [Event Handling](./event-handling.md).
