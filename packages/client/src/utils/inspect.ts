/**
 * Node's `util.inspect.custom` symbol, read from the global registry so the
 * library does not have to import `node:util` (which breaks browser builds).
 * Node still picks it up when printing with `console.log` or `util.inspect`.
 * @internal
 */
export const inspectCustom: unique symbol = Symbol.for("nodejs.util.inspect.custom") as never;

/** Subset of Node's `InspectOptions` the structures pass through. @internal */
export interface InspectOptions {
  depth?: number | null;
  [key: string]: unknown;
}

/** The `inspect` function Node passes as the third argument to a custom inspector. @internal */
export type InspectFn = (value: unknown, options?: InspectOptions) => string;
