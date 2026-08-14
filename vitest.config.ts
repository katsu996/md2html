import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "lcov", "html"],
      reportsDirectory: "coverage",
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      },
      include: ["src/**/*.ts"],
      exclude: ["src/cli.ts"]
    }
  }
});
