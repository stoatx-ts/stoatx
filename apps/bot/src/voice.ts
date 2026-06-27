import { type CommandContext, SimpleCommand, Stoat, AudioResource, AudioPlayer } from "stoatx";
import { join } from "node:path";

@Stoat()
export class VoiceCommands {
  private readonly players = new Map<string, AudioPlayer>();

  @SimpleCommand({ name: "join", description: "Join the voice channel you're currently in." })
  async joinVoiceChannel(ctx: CommandContext) {
    if (!ctx.message.channel?.isVoice()) {
      await ctx.reply("This command can only be used in a voice channel!");
      return;
    }

    const channel = ctx.message.channel;
    const conn = await channel.join();

    const player = new AudioPlayer();
    conn.subscribe(player);
    this.players.set(channel.id, player);

    player.on("error", (err) => {
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
    player.play(AudioResource.from(join(import.meta.dirname, "../src/sound.mp3")));
    await ctx.reply("Playing!");
  }

  @SimpleCommand({ name: "leave", description: "Leave the voice channel." })
  async leave(ctx: CommandContext) {
    if (!ctx.message.channel?.isVoice()) return;
    this.players.delete(ctx.message.channel.id);
    await ctx.message.channel.leave();
    await ctx.reply("Left!");
  }
}
