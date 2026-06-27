import { type CommandContext, SimpleCommand, Stoat, StoatLifecycle, Arg, User } from "stoatx";

@Stoat()
export class PingCommand implements StoatLifecycle {
  @SimpleCommand({
    description: "Replies with Pong! and the bot's latency.",
    aliases: ["p"],
  })
  async ping(ctx: CommandContext) {
    const reply = await ctx.message.reply("Calculating Ping...");
    const latency = reply.createdAt!.getTime() - ctx.message.createdAt!.getTime();

    await reply.edit(`Pong! Latency: ${latency}ms,`);
  }

  @SimpleCommand({ name: "hello" })
  async hello(@Arg({ required: true, fetch: true }) user: User, ctx: CommandContext) {
    console.log(user);
    await ctx.reply(`Hello, ${user}!`);
  }
}
