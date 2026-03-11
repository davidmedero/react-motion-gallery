import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/core.ts",
    "src/index.ts",
    "src/slider.ts",
    "src/grid.ts",
    "src/masonry.ts",
    "src/entries.ts",
    "src/fullscreen.ts",
    "src/thumbnails.ts",
    "src/fullscreenThumbnails.ts",
    "src/video.ts",
  ],
  format: ["esm"],
  loader: {
    ".css": "local-css",
  },
  splitting: true,
  treeshake: true,
  dts: true,
  sourcemap: false,
  clean: true,
  minify: true,
  metafile: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
});
