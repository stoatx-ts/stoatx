---
sidebar_position: 2
---

# AudioPlayer

`AudioPlayer` controls playback in Node.js, from `@stoatx/voice-node`. It isn't tied to a connection: create it on its own and subscribe connections to it. One player can play into several calls at once.

```ts
import { AudioPlayer } from "@stoatx/voice-node";

const player = new AudioPlayer();
```

## Subscribing to a connection

After joining a voice channel, subscribe the player to the connection:

```ts
const connection = await voice.join(channel);
const player = new AudioPlayer();
connection.subscribe(player);
```

`connection.unsubscribe()` stops playing from the player.

## Events

| Event   | Description                                                     |
| ------- | --------------------------------------------------------------- |
| `idle`  | Emitted when the current track finishes playing.                |
| `error` | Emitted when playback fails. Receives the error as an argument. |

```ts
player.on("idle", () => {
  console.log("Track finished.");
});

player.on("error", (err) => {
  console.error("Playback error:", err);
});
```

## Controls

```ts
player.pause(); // Pause playback
player.resume(); // Resume playback
player.stop(); // Stop and discard the current track
```
