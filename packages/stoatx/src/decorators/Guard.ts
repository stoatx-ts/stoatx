import "reflect-metadata";
import { METADATA_KEYS } from "./keys";

/**
 * @Guard
 * Runs before a command to check if it should execute.
 * Should return true to allow execution, false to block.
 * Applied on @Stoat classes to guard all contained @SimpleCommand methods.
 *
 * @example
 * ```ts
 * import { Guard, Stoat, SimpleCommand, CommandContext } from 'stoatx';
 *
 * // Define a guard
 * class NotBot implements StoatxGuard {
 *   run(ctx: CommandContext): boolean {
 *     return !ctx.message.author.bot;
 *   }
 *
 *   guardFail(ctx: CommandContext): void {
 *     ctx.reply("Bots cannot use this command!");
 *   }
 * }
 *
 * @Stoat()
 * @Guard(NotBot)
 * class AdminCommands {
 *   @SimpleCommand({ name: 'admin', description: 'Admin only command' })
 *   async admin(ctx: CommandContext) {
 *     ctx.reply("You passed the guard check!");
 *   }
 * }
 * ```
 */
export function Guard(guardClass: Function) {
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey) {
      // METHOD DECORATOR: target is the prototype, propertyKey is the method name
      const existingGuards: Function[] = Reflect.getMetadata(METADATA_KEYS.GUARDS, target, propertyKey) || [];
      existingGuards.push(guardClass);
      Reflect.defineMetadata(METADATA_KEYS.GUARDS, existingGuards, target, propertyKey);
    } else {
      // CLASS DECORATOR: target is the class constructor
      const existingGuards: Function[] = Reflect.getMetadata(METADATA_KEYS.GUARDS, target) || [];
      existingGuards.push(guardClass);
      Reflect.defineMetadata(METADATA_KEYS.GUARDS, existingGuards, target);
    }
  };
}

/**
 * Get all guards from a decorated class
 */
export function getGuards(target: Function, propertyKey?: string | symbol): Function[] {
  if (propertyKey) {
    return Reflect.getMetadata(METADATA_KEYS.GUARDS, target.prototype, propertyKey) || [];
  }
  return Reflect.getMetadata(METADATA_KEYS.GUARDS, target) || [];
}