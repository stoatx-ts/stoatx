import "reflect-metadata";
import { METADATA_KEYS } from "./keys";
import type { SimpleCommandOptions } from "../types";

export function SubCommand(options: SimpleCommandOptions | string): MethodDecorator {
  const opts = typeof options === "string" ? { name: options } : options;
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(METADATA_KEYS.SUBCOMMAND, opts, target, propertyKey);
  };
}
