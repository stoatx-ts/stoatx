---
sidebar_position: 3
---

# Playing Audio

`AudioResource` wraps an audio source and handles transcoding via ffmpeg. It accepts a file path or a `Readable` stream.

```ts
import { AudioResource } from "@stoatx/voice-node";
import { join } from "node:path";

// From a file path (relative to your process CWD, or use import.meta.dirname to anchor to the source file)
const resource = AudioResource.from(join(import.meta.dirname, "./sounds/beep.mp3"));

// From a readable stream
import { createReadStream } from "node:fs";
const resource = AudioResource.from(createReadStream("./sounds/beep.ogg"));
```

Pass the resource to `player.play()`:

```ts
player.play(resource);
```

## Options

```ts
AudioResource.from(source, {
  volume: 0.5, // Adjust volume, 1.0 = original (default)
  inputType: "webm", // Override ffmpeg input format if autodetection fails
});
```

## Full example

```ts
import { type Client, type CommandContext, SimpleCommand, Stoat } from "stoatx";
import { AudioPlayer, AudioResource, VoiceManager } from "@stoatx/voice-node";
import { join } from "node:path";

@Stoat()
export class VoiceCommands {
  private readonly players = new Map<string, AudioPlayer>();
  private voice: VoiceManager | undefined;

  /** One voice manager for the bot, created on first use. */
  private voiceFor(client: Client): VoiceManager {
    return (this.voice ??= new VoiceManager(client));
  }

  @SimpleCommand({ name: "join", description: "Join the voice channel." })
  async joinVoiceChannel(ctx: CommandContext) {
    if (!ctx.message.channel?.isVoice()) {
      await ctx.reply("This command can only be used in a voice channel!");
      return;
    }

    const channel = ctx.message.channel;
    const conn = await this.voiceFor(ctx.client).join(channel);

    const player = new AudioPlayer();
    conn.subscribe(player);
    this.players.set(channel.id, player);

    player.on("error", (err: Error) => {
      console.error(err);
      this.players.delete(channel.id);
    });

    await ctx.reply("Joined!");
  }

  @SimpleCommand({ name: "play", description: "Play a sound." })
  async play(ctx: CommandContext) {
    const player = ctx.message.channel && this.players.get(ctx.message.channel.id);
    if (!player) {
      await ctx.reply("Not in a voice channel!");
      return;
    }

    player.play(AudioResource.from(join(import.meta.dirname, "./sounds/beep.mp3")));
    await ctx.reply("Playing!");
  }

  @SimpleCommand({ name: "leave", description: "Leave the voice channel." })
  async leave(ctx: CommandContext) {
    if (!ctx.message.channel?.isVoice()) return;
    this.players.delete(ctx.message.channel.id);
    await this.voiceFor(ctx.client).leave(ctx.message.channel);
    await ctx.reply("Left!");
  }
}
```
