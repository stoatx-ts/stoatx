import "reflect-metadata";
import { METADATA_KEYS } from "./keys";

export function Injectable(): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
