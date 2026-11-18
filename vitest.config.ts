import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["./packages/*"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["packages/*/src/**/*.ts"],
      exclude: ["packages/*/src/**/index.ts"],
    },
  },
});
