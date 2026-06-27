import { Arg, type CommandContext, CommandGroup, Stoat, SubCommand } from "stoatx";

@Stoat()
@CommandGroup({
  name: "config",
})
export class ConfigCommands {
  @SubCommand({ name: "prefix" })
  async setPrefix(@Arg() p: string, ctx: CommandContext) {
    await ctx.reply(`Prefix set to: ${p}`);
  }

  @SubCommand({
    name: "status",
  })
  async getStatus(ctx: CommandContext) {
    await ctx.reply("Everything is operational.");
  }
}
