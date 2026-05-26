import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(packageDir, "dist");
const outputFile = path.join(distDir, "styles.css");

const styleEntryFiles = [
  "index.css",
  // The root entry now points at the lightweight masonry core. Keep the
  // measured masonry CSS in the global stylesheet for users and demos that
  // import react-motion-gallery/styles.css with the measured subpath.
  "masonry-measured.css",
  // The root entry does not reference the split skeleton entries, but public
  // demos and copy-paste examples can import them from react-motion-gallery/skeleton/*.
  "skeleton-grid.css",
  "skeleton-masonry.css",
  "skeleton-masonry-structured.css",
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
