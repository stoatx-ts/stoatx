---
title: Using a UI Framework
sidebar_label: UI Frameworks
sidebar_position: 7
---

# Using a UI Framework

`@stoatx/client` doesn't depend on any UI framework, so it works with React, Vue, Svelte or anything else. The one thing to get right is **reactivity**: telling your framework when to re-render. This guide explains how the client's data changes, then shows a small helper and how to use it in React, Vue and Svelte.

It assumes you're building a client for user accounts. See [User Accounts](./user-accounts.md) for logging in and [Browsers and Other Runtimes](./browsers-and-runtimes.md) for bundler setup.

## How the client's data changes

Three things to know:

1. **Structures are updated in place.** When a message is edited or a user changes their name, the client patches the existing `Message` or `User` object instead of creating a new one. `client.users.cache.get(id)` returns the same object every time, which keeps memory low and makes `===` checks reliable.
2. **Caches are mutated in place.** `channel.messages.cache`, `client.users.friends` and the other collections are `Map`s that the client adds to and removes from directly.
3. **Some values are computed when you read them.** Getters like `channel.unread`, `server.mentionCount` and `channel.voiceStates` look at the caches every time you read them.

So a framework can't see changes by itself. React compares references, and the reference never changes. Vue and Svelte track reads through proxies, but the client writes to its own objects, not to your proxies. Instead, **the client tells you through events** (`messageCreate`, `userUpdate`, `channelAck`, …), and your app re-reads what it needs when they fire.

:::warning
Don't put the client or its structures into deep reactive state: `reactive()` or `ref()` in Vue, `$state` in Svelte, MobX observables and so on. The proxy wraps a large object graph without ever seeing the client's own updates, and a proxied object isn't `===` to the one in the cache. Keep IDs in your state, and look up structures when you render.
:::

## A small helper

This helper is framework-agnostic. It calls a function when any of the given events fire, at most once per tick. That matters because events come in bursts: connecting, or a bulk delete, can fire hundreds in a row.

```ts title="src/stoat.ts"
import { Client, type ClientEvents } from "@stoatx/client";

export const client = new Client();

type EventName = keyof ClientEvents;

const subscribers = new Map<EventName, Set<() => void>>();

/**
 * Calls `onChange` when any of `events` fires, at most once per tick.
 * `ready` and `logout` are always included, because they replace or empty every cache.
 * Returns a function that stops watching.
 */
export function watchClient(events: EventName[], onChange: () => void): () => void {
  let scheduled = false;
  const notify = () => {
    if (scheduled) return;
    scheduled = true;
    // Let the rest of the burst arrive, then update once.
    queueMicrotask(() => {
      scheduled = false;
      onChange();
    });
  };

  const all = [...new Set<EventName>([...events, "ready", "logout"])];
  for (const event of all) {
    let listeners = subscribers.get(event);
    if (!listeners) {
      // One client listener per event, shared by every watcher.
      const set = (listeners = new Set());
      subscribers.set(event, set);
      client.on(event, () => set.forEach((listener) => listener()));
    }
    listeners.add(notify);
  }

  return () => {
    for (const event of all) subscribers.get(event)?.delete(notify);
  };
}
```

Sharing one listener per event means hundreds of components can watch the same event without the client warning about too many listeners.

:::tip
Avoid the `raw` event as a "something changed" signal. It fires before the client updates its caches, so reading them in the handler gives you the old data.
:::

### Which events to watch

| What you show                  | Events                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| Messages in a channel          | `messageCreate`, `messageUpdate`, `messageDelete`, `messageDeleteBulk`                            |
| Reactions                      | `messageReact`, `messageUnreact`, `messageRemoveReaction`                                         |
| Channel and server lists       | `channelCreate`, `channelUpdate`, `channelDelete`, `serverCreate`, `serverUpdate`, `serverDelete` |
| Unread dots and mention badges | `messageCreate`, `channelAck`                                                                     |
| Typing indicator               | `typingStart`, `typingStop`                                                                       |
| Names, avatars, presence       | `userUpdate`                                                                                      |
| Member lists                   | `serverMemberJoin`, `serverMemberLeave`, `serverMemberUpdate`, `userUpdate`                       |
| Friends and requests           | `userRelationship`                                                                                |
| Who's in a voice call          | `voiceChannelJoin`, `voiceChannelLeave`, `voiceChannelMove`, `voiceStateUpdate`                   |
| Synced settings                | `settingsUpdate`                                                                                  |

Watching an event re-renders every component that watches it, even for changes in other channels. For most apps that's cheap. If a list gets large, check the event's arguments in your own listener before updating.

## React

`useSyncExternalStore` is made for this: subscribe with `watchClient`, and use a counter as the snapshot.

```ts title="src/useClientVersion.ts"
import { useCallback, useRef, useSyncExternalStore } from "react";
import type { ClientEvents } from "@stoatx/client";
import { watchClient } from "./stoat";

/** A number that changes whenever one of `events` fires. Use it as a dependency. */
export function useClientVersion(events: (keyof ClientEvents)[]): number {
  const version = useRef(0);
  const key = events.join();
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      watchClient(events, () => {
        version.current++;
        onStoreChange();
      }),
    // `events` is usually a new array each render; resubscribe only when its contents change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return useSyncExternalStore(subscribe, () => version.current);
}
```

Read the client's data during render, and use the version as the dependency for anything you memoize:

```tsx title="src/MessageList.tsx"
import { useEffect, useMemo } from "react";
import { client } from "./stoat";
import { useClientVersion } from "./useClientVersion";

export function MessageList({ channelId }: { channelId: string }) {
  const version = useClientVersion(["messageCreate", "messageUpdate", "messageDelete", "messageDeleteBulk"]);
  const channel = client.channels.cache.get(channelId);

  // Load history the first time the channel is shown.
  useEffect(() => {
    void channel?.messages.fetchMany({ limit: 50 });
  }, [channel]);

  const messages = useMemo(
    // The cache is in arrival order, and older messages fetched later end up at the end.
    // Message IDs are ULIDs, which sort by time.
    () => [...(channel?.messages.cache.values() ?? [])].sort((a, b) => (a.id < b.id ? -1 : 1)),
    [channel, version],
  );

  return (
    <ul>
      {messages.map((message) => (
        <li key={message.id}>
          <b>{message.author?.displayName ?? message.author?.username}</b> {message.content}
        </li>
      ))}
    </ul>
  );
}
```

:::warning
`React.memo` compares props by reference, and an edited message is the same object, so a memoized `<Message message={message} />` won't re-render after an edit. Pass the values you render (`content={message.content}`), or pass the version as a prop too.
:::

Getters work the same way:

```tsx
function ChannelName({ channelId }: { channelId: string }) {
  useClientVersion(["messageCreate", "channelAck", "channelUpdate"]);
  const channel = client.channels.resolveText(channelId); // a server channel
  return <span className={channel?.unread ? "unread" : ""}>{channel?.name}</span>;
}
```

## Vue

Count changes in a `shallowRef`, and read it inside `computed` so Vue knows when to recompute:

```ts title="src/useClientVersion.ts"
import { onScopeDispose, shallowRef, type ShallowRef } from "vue";
import type { ClientEvents } from "@stoatx/client";
import { watchClient } from "./stoat";

/** A ref that changes whenever one of `events` fires. Read it in `computed` to depend on it. */
export function useClientVersion(events: (keyof ClientEvents)[]): ShallowRef<number> {
  const version = shallowRef(0);
  onScopeDispose(watchClient(events, () => version.value++));
  return version;
}
```

```vue title="src/MessageList.vue"
<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { client } from "./stoat";
import { useClientVersion } from "./useClientVersion";

const props = defineProps<{ channelId: string }>();
const version = useClientVersion(["messageCreate", "messageUpdate", "messageDelete", "messageDeleteBulk"]);

const channel = computed(() => client.channels.cache.get(props.channelId));

watchEffect(() => {
  void channel.value?.messages.fetchMany({ limit: 50 });
});

const messages = computed(() => {
  version.value; // re-run when a message event fires
  return [...(channel.value?.messages.cache.values() ?? [])].sort((a, b) => (a.id < b.id ? -1 : 1));
});
</script>

<template>
  <ul>
    <li v-for="message in messages" :key="message.id">
      <b>{{ message.author?.displayName ?? message.author?.username }}</b> {{ message.content }}
    </li>
  </ul>
</template>
```

Passing structures as props is fine: Vue makes props shallowly reactive, so it doesn't proxy the object itself. Just don't store them in `ref()` or `reactive()`. If you need to keep one in state, use `shallowRef()` or wrap it in `markRaw()`.

## Svelte

In Svelte 5, keep a `$state` counter in a `.svelte.ts` module and read it inside `$derived`:

```ts title="src/clientVersion.svelte.ts"
import type { ClientEvents } from "@stoatx/client";
import { watchClient } from "./stoat";

/** Changes whenever one of `events` fires. Call it while a component initializes. */
export function clientVersion(events: (keyof ClientEvents)[]) {
  let version = $state(0);
  $effect(() => watchClient(events, () => version++));
  return {
    get current() {
      return version;
    },
  };
}
```

```svelte title="src/MessageList.svelte"
<script lang="ts">
  import { client } from "./stoat";
  import { clientVersion } from "./clientVersion.svelte";

  let { channelId }: { channelId: string } = $props();

  const version = clientVersion(["messageCreate", "messageUpdate", "messageDelete", "messageDeleteBulk"]);
  const channel = $derived(client.channels.cache.get(channelId));

  $effect(() => {
    void channel?.messages.fetchMany({ limit: 50 });
  });

  const messages = $derived.by(() => {
    version.current; // re-run when a message event fires
    return [...(channel?.messages.cache.values() ?? [])].sort((a, b) => (a.id < b.id ? -1 : 1));
  });
</script>

<ul>
  {#each messages as message (message.id)}
    <li><b>{message.author?.displayName ?? message.author?.username}</b> {message.content}</li>
  {/each}
</ul>
```

To keep a structure in component state, use `$state.raw`, which doesn't proxy the object.

## Setting up the client

### One client for the whole app

Create the client once, in a module like `stoat.ts` above, and import it wherever you need it. Don't create it inside a component: every render or remount would open a new connection.

Log in from your app's startup code or a login form, not from a component's mount effect. React runs effects twice in development (Strict Mode), which would log in twice.

### Waiting for the first `ready`

The caches are empty until the client has connected. Show a loading screen until the first `ready`:

```ts
let connected = false;
client.once("ready", () => {
  connected = true;
  renderApp();
});
```

`ready` fires again after a reconnect, with fresh caches. Because `watchClient` always includes `ready`, everything re-renders then.

### Logging out

On `logout` the client has disconnected and emptied its caches. Clear your own state, such as the selected channel, and show the login screen. Because `watchClient` includes `logout`, components re-render with the empty caches.

```ts
client.on("logout", () => {
  localStorage.removeItem("session");
  showLoginScreen();
});
```

### Hot module reloading

With Vite, editing `stoat.ts` re-runs it and would create a second client with its own connection. Keep the existing client across reloads:

```ts title="src/stoat.ts"
export const client: Client = import.meta.hot?.data.client ?? new Client();
if (import.meta.hot) import.meta.hot.data.client = client;
```

### Server-side rendering

In Next.js, Nuxt, SvelteKit and similar frameworks, only use the client in the browser. A client created in a server module is shared by every visitor, and a user's session must never be. Create and log in the client in browser-only code (a client component, `onMounted`, `onMount`, or a check for `typeof window !== "undefined"`), and render a loading state on the server.
