import type { CommandMetadata, ParamSchema, SimpleCommandOptions } from "../types";
import { METADATA_KEYS } from "./keys";

/**
 * Build CommandMetadata from SimpleCommandOptions
 */
export function buildSimpleCommandMetadata(
  options: SimpleCommandOptions,
  methodName: string,
  category: string | undefined,
  params: ParamSchema[],
): CommandMetadata {
  return {
    name: options.name ?? methodName.toLowerCase(),
    description: options.description ?? "No description provided",
    aliases: options.aliases ?? [],
    permissions: options.permissions ?? [],
    category: options.category ?? category ?? "uncategorized",
    cooldown: options.cooldown ?? 0,
    ...(options.cooldownStorage !== undefined ? { cooldownStorage: options.cooldownStorage } : {}),
    nsfw: options.nsfw ?? false,
    ownerOnly: options.ownerOnly ?? false,
    params,
  };
}

export function getSubCommands(target: Function): { methodName: string; options: any }[] {
  const methods = Object.getOwnPropertyNames(target.prototype);
  const subCommands = [];

  for (const method of methods) {
    const options = Reflect.getMetadata(METADATA_KEYS.SUBCOMMAND, target.prototype, method);
    if (options) {
      subCommands.push({ methodName: method, options });
    }
  }
  return subCommands;
}
