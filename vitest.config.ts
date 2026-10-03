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
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:4000/api/v1",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    },
    globals: true,
    hookTimeout: 60_000,
    testTimeout: 30_000,
    maxWorkers: 1,
    pool: "forks",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      include: [
        "app/{page,loading,error,not-found}.tsx",
        "app/categories/**/*.tsx",
        "app/tools/**/*.tsx",
        "components/**/*.tsx",
        "lib/tools/**/*.ts",
        "theme/**/*.ts",
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
});
