---
sidebar_position: 1
---

# Voice

Voice lives in its own packages, so apps that don't use it don't download it:

| Package                 | For                                                           |
| ----------------------- | ------------------------------------------------------------- |
| `@stoatx/voice-node`    | Bots in Node.js: join calls and play audio files or streams.  |
| `@stoatx/voice-browser` | Web apps: join calls with the user's microphone and speakers. |

Both are built on `@stoatx/voice`, which installs automatically, and work with `@stoatx/client` (and `stoatx`, which re-exports it).

## Installation

```bash
# Node.js
npm install @stoatx/voice-node

# Browsers
npm install @stoatx/voice-browser
```

`@stoatx/voice-node` also needs `ffmpeg` installed and on your `PATH` to play audio.

## Joining and leaving

Create one `VoiceManager` for your client and join calls through it. The API is the same in both packages:

```ts
import { VoiceManager } from "@stoatx/voice-node"; // or "@stoatx/voice-browser"

const voice = new VoiceManager(client);

const connection = await voice.join(channel); // a voice channel, DM or group, or its ID
connection.on("disconnect", () => console.log("Left the call"));

voice.get(channel); // the connection, if the client is in that call
await voice.leave(channel);
await voice.leaveAll();
```

Joining a channel the client is already in returns the existing connection. The client leaves every call when it logs out.

:::info
Server voice channels are `VoiceChannel`s: check with `channel.isVoice()` before joining.
:::

## Connection events

| Event        | Description                                           |
| ------------ | ----------------------------------------------------- |
| `ready`      | Connected to the call.                                |
| `disconnect` | Left the call, or the connection was lost.            |
| `error`      | Something failed while connected, e.g. sending audio. |

`connection.status` is `"connecting"`, `"ready"`, `"disconnecting"` or `"disconnected"`.

## Next steps

- Node.js: [AudioPlayer](./audio-player.md) and [Playing Audio](./playing-audio.md)
- Browsers: [Voice in the Browser](./browser.md)
