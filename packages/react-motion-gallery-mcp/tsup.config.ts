import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  platform: "node",
  target: "node18",
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
});
