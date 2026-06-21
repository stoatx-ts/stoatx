---
title: Events and Managers
sidebar_label: Events & Managers
sidebar_position: 3
---

# Events and Managers

In `@stoatx/client`, data doesn't just float around loosely. Everything is highly structured to ensure type safety and memory efficiency.
To build reliable bots, you need to master two core concepts: **Events** (how data arrives) and **Managers** (how data is stored and retrieved).

## The Event System

The `Client` extends the native Node.js `EventEmitter`, but with strict TypeScript validation.
This means your IDE will automatically know exactly what parameters an event provides.

### Listening to Events

You generally use two methods to listen to events:

- `client.on()`: Runs every time the event is emitted.
- `client.once()`: Runs only the very first time the event is emitted, then unregisters itself.

```typescript
// Triggers every time a message is created or received
client.on("messageCreate", async (message) => {
  console.log(`New message from ${message.author.username}`);
});

// Triggers only once when the bot successfully connects
client.once("ready", () => {
  console.log("Bot is online!");
});
```

Because of our strict typings, if you try to access `message.nonExistentProperty`, TypeScript will immediately throw an error.

### Working with Managers

A **Manager** is a dedicated controller for a specific type of data. Instead of placing all methods directly on the `Client`, we group them logically.

For example, to interact with users, you use the `UserManager` located at `client.users`. To interact with servers, you use the `ServerManager` at `client.servers`.

### Fetching vs. Caching

This is the most important concept in `@stoatx/client`. Managers provide two primary ways to access data,
and understanding the difference will dictate how you write your bot:

1. **The Cache (`manager.cache.get()`):** This is **synchronous** and instant. It looks directly into your bot's active RAM. If the object hasn't been cached yet (or was swept to save memory), it will immediately return `undefined`. Use this when you are inside a non-async function or need raw speed.
2. **Fetching (`manager.fetch()`):** This is **asynchronous** (returns a Promise). It is the safest way to get data. Under the hood, `fetch` will actually check your cache first! If the data is already in memory, it resolves instantly. If the data is _missing_, it automatically makes a REST API request to Stoat, saves the result into the cache for next time, and returns the object.

:::tip
Which should I use?
If you are inside an `async` function, default to using `await manager.fetch()`. It guarantees you get the data whether it was already in memory or not.
Only use `cache.get()` when you specifically want to avoid network requests entirely or are working in synchronous code.
:::

```typescript
// ✅ Safe & Reliable: Will check cache, and fallback to API if needed
const server = await client.servers.fetch("SERVER_ID");
console.log(server.name);

// ⚡ Fast & Synchronous: Will return undefined if the server was swept from memory
const cachedServer = client.servers.cache.get("SERVER_ID");
if (cachedServer) {
  console.log(cachedServer.name);
}
```

### Scoped Managers

Managers aren't just global; they can also be scoped to specific objects. For instance,
a Server structure has its own `MemberManager` (`server.members`), which only handles members inside that specific server.

```typescript
// Find a server in the global cache
const server = client.servers.cache.get("SERVER_ID");

if (server) {
  // Fetch a specific member from within that server
  const member = await server.members.fetch("USER_ID");
  console.log(`Fetched member: ${member.nickname}`);
}
```

### Memory Management (Sweepers)

If your bot runs for weeks in hundreds of servers, caching every single message and user will eventually consume all your server's RAM and crash the application.

To prevent this, `@stoatx/client` includes a built-in SweeperManager. Sweepers run on an interval and automatically delete old or unused data from your caches.

You can configure sweepers when initializing your client:

```typescript
import { Client } from "@stoatx/client";

const client = new Client({
  sweepers: {
    messages: {
      // How long a message stays in the cache (e.g., 1 hour)
      lifetime: 1000 * 60 * 60,
      // How often the sweeper runs to clean up (e.g., every 10 minutes)
      interval: 1000 * 60 * 10,
    },
  },
  cacheLimits: {
    // Hard limit: The bot will never cache more than 5,000 users globally
    users: 5000,
  },
});
```

By dialing in your `sweepers` and `cacheLimits`, you can ensure your bot remains lightning-fast while maintaining a tiny, predictable memory footprint.
