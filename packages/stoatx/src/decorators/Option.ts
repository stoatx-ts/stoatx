import "reflect-metadata";
import { METADATA_KEYS } from "./keys";

export interface OptionDefinition {
  index: number;
  name: string;
  required?: boolean;
}

/**
 * @Option
 * Marks a method parameter as a named flag option (e.g. --reason value).
 * Type is inferred from the TypeScript parameter type via reflect-metadata.
 *
 * @example
 * ```ts
 * @SimpleCommand({ name: "ban" })
 * async ban(
 *   @Option({ name: "reason" }) reason: string | undefined,
 *   @Option({ name: "days" }) days: number | undefined,
 *   ctx: CommandContext
 * ) {}
 * ```
 */
export function Option(options: Omit<OptionDefinition, "index">) {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const existing: OptionDefinition[] = Reflect.getMetadata(METADATA_KEYS.OPTIONS, target, propertyKey) || [];
    existing.push({ ...options, index: parameterIndex });
    Reflect.defineMetadata(METADATA_KEYS.OPTIONS, existing, target, propertyKey);
  };
}

export function getOptions(target: Object, propertyKey: string): OptionDefinition[] {
  return Reflect.getMetadata(METADATA_KEYS.OPTIONS, target, propertyKey) || [];
}
