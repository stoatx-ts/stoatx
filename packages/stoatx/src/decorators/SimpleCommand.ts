import "reflect-metadata";
import type { CommandContext, SimpleCommandOptions } from "../types";
import { METADATA_KEYS } from "./keys";
import { Client } from "../client";

/**
 * Stored simple command metadata from method decorator
 */
export interface SimpleCommandDefinition {
  methodName: string;
  options: SimpleCommandOptions;
}

type CommandMethod = (ctx: CommandContext<Client>) => Promise<void>;

/**
 * @SimpleCommand
 * Marks a method as a simple command within a @Stoat() decorated class.
 *
 * @example
 * ```ts
 * @Stoat()
 * class Example {
 *   @SimpleCommand({ name: 'ping', description: 'Replies with Pong!' })
 *   async ping(ctx: CommandContext) {
 *     await ctx.reply('Pong!');
 *   }
 *
 *   @SimpleCommand({ aliases: ['perm'], name: 'permission' })
 *   async permission(ctx: CommandContext) {
 *     await ctx.reply('Access granted');
 *   }
 * }
 * ```
 */
export function SimpleCommand(options: SimpleCommandOptions = {}) {
  return <T extends CommandMethod>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    const constructor = target.constructor;

    const existingCommands: SimpleCommandDefinition[] =
      Reflect.getMetadata(METADATA_KEYS.SIMPLE_COMMANDS, constructor) || [];

    existingCommands.push({
      methodName: String(propertyKey),
      options,
    });

    Reflect.defineMetadata(METADATA_KEYS.SIMPLE_COMMANDS, existingCommands, constructor);

    return descriptor;
  };
}

/**
 * Get all simple command definitions from a @Stoat class
 */
export function getSimpleCommands(target: Function): SimpleCommandDefinition[] {
  return Reflect.getMetadata(METADATA_KEYS.SIMPLE_COMMANDS, target) || [];
}
