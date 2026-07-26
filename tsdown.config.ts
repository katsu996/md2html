import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    outDir: "dist/lib",
    platform: "neutral",
    format: ["esm", "cjs"],
    target: "es2022",
    fixedExtension: true,
    dts: { cjsReexport: true },
    deps: { neverBundle: ["marked"] },
    sourcemap: true,
    clean: true,
    minify: false
  },
  {
    entry: { md2html: "src/cli.ts" },
    outDir: "dist/bin",
    platform: "node",
    format: ["esm"],
    target: "node22",
    fixedExtension: false,
    dts: false,
    deps: { neverBundle: ["marked"] },
    sourcemap: true,
    clean: false,
    minify: false
  }
]);
