import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    fileParallelism: false,
    globals: true,
    maxWorkers: 1,
    pool: "forks",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      include: ["app/{page,loading,error,not-found}.tsx", "components/**/*.tsx", "theme/**/*.ts"],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
});
