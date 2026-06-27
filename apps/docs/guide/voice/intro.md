---
sidebar_position: 1
---

# Voice

Stoatx supports voice channels out of the box. You can join and leave voice channels, and play audio using the `AudioPlayer` and `AudioResource` APIs.

:::info
Voice is only available in voice channels. Use `channel.isVoice()` to check before calling any voice methods.
:::

## Requirements

- `ffmpeg` must be installed and available in your `PATH`.
- `@livekit/rtc-node` is used internally — no extra setup needed.