---
sidebar_position: 2
---

# AudioPlayer

`AudioPlayer` is the playback controller. It is decoupled from any specific voice connection, meaning you can create it independently and subscribe it to a connection later.

```ts
import { AudioPlayer } from "stoatx";

const player = new AudioPlayer();
```

## Subscribing to a connection

After joining a voice channel, subscribe the player to the connection:

```ts
const conn = await channel.join();
player = new AudioPlayer();
conn.subscribe(player);
```

## Events

| Event   | Description                                                     |
|---------|-----------------------------------------------------------------|
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
player.pause();   // Pause playback
player.resume();  // Resume playback
player.stop();    // Stop and discard the current track
```