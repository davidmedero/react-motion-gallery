import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(packageDir, "dist");
const clientEntryFiles = [
  "masonry-text-wrap.mjs",
  "media-ready.mjs",
  "reveal.mjs",
  "skeleton-cache-provider.mjs",
];

for (const file of clientEntryFiles) {
  const outputPath = path.join(distDir, file);
  if (!fs.existsSync(outputPath)) continue;

  const contents = fs.readFileSync(outputPath, "utf8");
  if (contents.startsWith('"use client";') || contents.startsWith("'use client';")) {
    continue;
  }

  fs.writeFileSync(outputPath, `"use client";\n${contents}`);
  console.log(`Preserved use client directive in dist/${file}.`);
}
