import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { CommandRegistry } from "../src/registry";
import { StoatxContainer } from "../src/di/Container";
import { CommandGroup, SubCommand } from "../src/decorators";

describe("CommandRegistry command groups", () => {
  it("applies group options to subcommands unless they override them", () => {
    class Config {
      async prefix() {}
      async status() {}
    }
    CommandGroup({ name: "config", ownerOnly: true, cooldown: 5000, nsfw: true })(Config);
    SubCommand({ name: "prefix" })(Config.prototype, "prefix", {});
    SubCommand({ name: "status", ownerOnly: false })(Config.prototype, "status", {});

    const registry = new CommandRegistry(new StoatxContainer());
    (registry as any).registerStoatClassCommands(Config, "/bot/config.js", "/bot");

    const prefix = registry.get("config:prefix")!.metadata;
    const status = registry.get("config:status")!.metadata;

    expect(prefix).toMatchObject({ ownerOnly: true, cooldown: 5000, nsfw: true });
    expect(status).toMatchObject({ ownerOnly: false, cooldown: 5000, nsfw: true });
  });
});
