import "reflect-metadata";
import { METADATA_KEYS } from "./keys";

export interface ArgDefinition {
  index: number;
  name?: string;
  required?: boolean;
  fetch?: boolean;
}

/**
 * Marks a method parameter as a positional command argument.
 * Type is inferred from the TypeScript parameter type via reflect-metadata.
 *
 * @example
 * ```ts
 * @SimpleCommand({ name: "ban" })
 * async ban(
 *   @Arg({ required: true }) target: User,
 *   @Arg() reason: string | undefined,
 *   ctx: CommandContext
 * ) {}
 * ```
 */
export function Arg(options: Omit<ArgDefinition, "index"> = {}) {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const existing: ArgDefinition[] = Reflect.getMetadata(METADATA_KEYS.ARGS, target, propertyKey) || [];
    existing.push({ ...options, index: parameterIndex });
    Reflect.defineMetadata(METADATA_KEYS.ARGS, existing, target, propertyKey);
  };
}

export function getArgs(target: Object, propertyKey: string): ArgDefinition[] {
  return Reflect.getMetadata(METADATA_KEYS.ARGS, target, propertyKey) || [];
}
