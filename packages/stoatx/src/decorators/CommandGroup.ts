import "reflect-metadata";
import { METADATA_KEYS } from "./keys";
import { GroupOptions } from "../types";

export function CommandGroup(options: GroupOptions): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_KEYS.COMMAND_GROUP, options, target);
  };
}
