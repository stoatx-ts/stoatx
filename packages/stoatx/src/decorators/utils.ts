import type { CommandMetadata, ParamSchema, SimpleCommandOptions } from "../types";

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
