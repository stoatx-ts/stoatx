import { type CommandContext, SimpleCommand, Stoat, StoatLifecycle } from "stoatx";

@Stoat()
export class PingCommand implements StoatLifecycle {
  @SimpleCommand({
    description: "Replies with Pong! and the bot's latency.",
    aliases: ["p"],
    args: [
      {
        name: "user",
        type: "user",
        required: true,
      },
    ],
    options: [
      {
        name: "count",
        type: "number",
      },
    ],
  })
  async ping(ctx: CommandContext) {
    const reply = await ctx.message.reply("Calculating Ping...");
    const latency = reply.createdAt!.getTime() - ctx.message.createdAt!.getTime();

    const count = ctx.options!.count as number;

    await reply.edit(`Pong! Latency: ${latency}ms, count: ${count}, user: ${ctx.args[0]}`);
  }
}
