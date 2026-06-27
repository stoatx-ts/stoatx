import "reflect-metadata";
import { METADATA_KEYS } from "./keys";
import { GroupOptions } from "../types";

export function CommandGroup(name: GroupOptions): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_KEYS.COMMAND_GROUP, name, target);
  };
}
