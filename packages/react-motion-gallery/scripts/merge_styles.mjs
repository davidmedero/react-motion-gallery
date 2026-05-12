import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(packageDir, "dist");
const outputFile = path.join(distDir, "styles.css");

const styleEntryFiles = [
  "index.css",
  // The root entry does not reference GridSkeleton, but public demos and
  // copy-paste examples can import it from react-motion-gallery/skeleton/grid.
  "skeleton-grid.css",
];

const missingFiles = styleEntryFiles.filter(
  (file) => !fs.existsSync(path.join(distDir, file))
);

if (missingFiles.length) {
  throw new Error(
    `Cannot build dist/styles.css; missing ${missingFiles.join(", ")} in dist.`
  );
}

const merged = styleEntryFiles
  .map((file) => {
    const css = fs.readFileSync(path.join(distDir, file), "utf8").trim();
    return css ? `/* ${file} */\n${css}` : "";
  })
  .filter(Boolean)
  .join("\n");

fs.writeFileSync(outputFile, `${merged}\n`);
console.log(`Wrote dist/styles.css from ${styleEntryFiles.length} CSS files.`);
