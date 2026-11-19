import { builtinModules } from "node:module";
import type { Options } from "tsup";
import { createTsupConfig } from "../../tsup.config.js";

/** Modules the browser build must never import. `events` is left out because browsers get the npm polyfill. */
const nodeOnly = new Set([...builtinModules.filter((m) => m !== "events"), "ws", "@livekit/rtc-node"]);

/** Fails the build when anything reachable from src/browser.ts imports a Node-only module. */
const rejectNodeImports: NonNullable<Options["esbuildPlugins"]>[number] = {
  name: "reject-node-imports",
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      const name = args.path.replace(/^node:/, "");
      const root = name.startsWith("@") ? name.split("/").slice(0, 2).join("/") : name.split("/")[0]!;
      if (!args.path.startsWith("node:") && !nodeOnly.has(root)) return undefined;
      return { errors: [{ text: `Node-only import "${args.path}" reached the browser build from ${args.importer}` }] };
    });
  },
};

/** Browser build. Runs after the Node build (see the `build` script), so it must not clean `dist`. */
export default createTsupConfig({
  entry: ["src/browser.ts"],
  format: ["esm"],
  platform: "browser",
  clean: false,
  // tsup normally strips `node:` and externalizes dependencies before user plugins run;
  // turn both off for the Node-only modules so the guard below gets to see them.
  removeNodeProtocol: false,
  noExternal: ["ws", "@livekit/rtc-node"],
  esbuildPlugins: [rejectNodeImports],
});
