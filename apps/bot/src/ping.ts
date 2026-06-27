import { type CommandContext, SimpleCommand, Stoat, StoatLifecycle } from "stoatx";
import { LoggerService } from "./services/LoggerService.js";

@Stoat()
export class PingCommand implements StoatLifecycle {
  constructor(private readonly logger: LoggerService) {}

  @SimpleCommand({
    description: "Replies with Pong! and the bot's latency.",
    aliases: ["p"],
  })
  async ping(ctx: CommandContext) {
    this.logger.log(`Ping triggered by user: ${ctx.authorId}`);
    const reply = await ctx.message.reply("Calculating Ping...");
    const latency = reply.createdAt!.getTime() - ctx.message.createdAt!.getTime();

    await reply.edit(`Pong! Latency: ${latency}ms,`);
  }
}
