---
title: Event Handling
sidebar_label: Event Handling
sidebar_position: 4
---

# Event Handling

Just like commands, keeping all your event listeners inside `index.ts` will quickly make your code difficult to read.

The `stoatx` framework provides elegant `@On` and `@Once` decorators, allowing you to isolate your background tasks—like logging when the bot comes online, welcoming new users, or tracking deleted messages—into clean, dedicated classes.

## Creating an Event Listener

Let's create a file that listens for when the bot successfully connects to Stoat (the `ready` event), and when a message is deleted (the `messageDelete` event).

Create a new file named `general.ts` inside your `src/events/` directory and add the following code:

```typescript
// src/events/general.ts
import { Stoat, On, Once, type StoatLifecycle } from "stoatx";
import type { Client, Message } from "stoatx";

@Stoat()
export class GeneralEvents implements StoatLifecycle {
  // Triggers only the very first time the bot connects
  @Once("ready")
  onReady(client: Client) {
    console.log(`✅ ${client.user?.username} is successfully online!`);
  }

  // Triggers every single time a message gets deleted
  @On("messageDelete")
  messageDelete(message: Message) {
    console.log(`A message by ${message.author?.username} was deleted.`);
  }
}
```

## Handling Commands via Message Events

One key event you will almost always want to handle is `messageCreate`. This is how the framework knows to process incoming messages as commands.

Add the following method to your `GeneralEvents` class:

```typescript
import { Stoat, On, Once, type StoatLifecycle } from "stoatx";
import type { Client, Message } from "stoatx";

@Stoat()
export class GeneralEvents implements StoatLifecycle {
  @Once("ready")
  onReady(client: Client) {
    console.log(`✅ ${client.user?.username} is successfully online!`);
  }

  // Without this method, the framework will not process any commands from messages!
  @On("messageCreate")
  async onMessage(message: Message, client: Client) {
    await client.executeCommand(message);
  }

  @On("messageDelete")
  messageDelete(message: Message) {
    console.log(`A message by ${message.author?.username} was deleted.`);
  }
}
```

Because you own the `messageCreate` handler, you can add any filtering logic you need before passing the message to the framework:

```typescript
import { Stoat, On, Once, type StoatLifecycle } from "stoatx";
import type { Client, Message } from "stoatx";

@Stoat()
export class GeneralEvents implements StoatLifecycle {
  // Rest of the events...
  
  @On("messageCreate")
  async onMessage(message: Message, client: Client) {
    if(message.author?.bot) return; // Ignore messages from other bots
    await client.executeCommand(message);
  }
}
```

:::tip
You can also use the `@On("messageCreate")` decorator in a separate class if you want to isolate command handling from other background tasks. 
The framework will automatically scan all your event classes and register them, so you can organize your code however you like!
:::

## Understanding the Code

Here is exactly how the framework handles your background events:

1. **The `@Stoat()` Decorator:** Just like with commands, this marks the class so the framework knows to scan it on startup.
2. **The `@Once()` Decorator:** This tells the registry to execute the method only the _very first time_ the provided event (`"ready"`) fires. It is perfect for initialization logic.
3. **The `@On()` Decorator:** This tells the registry to execute the method _every time_ the event (`"messageDelete"`) fires.
4. **Method Names:** Unlike `@SimpleCommand`, the names of the methods inside an event class (e.g., `ready` or `messageDelete`) do not have to match anything specific. The framework only cares about the string passed into the decorator!

:::tip Grouping Events
You don't need to create a new file for every single event. Because the decorators attach directly to methods, you can group related events together in the same class. For example, a `ServerLogging` class could contain `@On("messageDelete")`, `@On("messageUpdate")`, and `@On("serverMemberJoin")` all in one place!
:::

## Testing It Out

Save your file and restart your bot:

```bash
pnpm tsx src/index.ts

```

Because of the `@Once("ready")` decorator, your terminal should immediately print your success message once the bot logs in. If you delete a message in a channel your bot can see, the `@On("messageDelete")` method will trigger and log it to the console.

## Wrapping Up

Congratulations! 🎉

You have successfully transitioned from a raw API wrapper to a structured, scalable application. You now know how to:

- Boot up the framework registry.
- Isolate commands using `@Stoat()` and `@SimpleCommand()`.
- Modularize background tasks using `@On()` and `@Once()`.
- Wire up command execution using `@On("messageCreate")` and `client.executeCommand()`.

From here, you have the foundational knowledge to build anything. Check out the rest of the guides to learn about the rest of the Stoat ecosystem!
