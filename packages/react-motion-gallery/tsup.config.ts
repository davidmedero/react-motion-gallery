import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  splitting: true,
  treeshake: true,
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  metafile: true,
});