#!/usr/bin/env node

import { build } from "esbuild";
import {
  constants as zlibConstants,
  brotliCompressSync,
  gzipSync,
} from "node:zlib";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const README_START = "<!-- bundle-size:start -->";
const README_END = "<!-- bundle-size:end -->";
const REPORTED_EXPORTS = [
  "Entries",
  "FullscreenThumbnailSlider",
  "GalleryCore",
  "Grid",
  "Masonry",
  "Slider",
  "ThumbnailSlider",
  "useFullscreenController",
  "Video",
];
const EXTERNALS = [
  "react",
  "react-dom",
  "react-dom/client",
  "react/jsx-runtime",
  "plyr",
  "plyr-react",
];

function formatBundlephobiaSize(bytes) {
  if (bytes < 1_000) return `${bytes.toFixed(1)}B`;
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(1)}kB`;
  return `${(bytes / 1_000_000).toFixed(1)}MB`;
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function parseArgs(argv) {
  return {
    writeReadme: argv.includes("--write-readme"),
  };
}

function selectReportedExports(availableExports, sourcePath) {
  const available = new Set(availableExports);
  const missing = REPORTED_EXPORTS.filter((exportName) => !available.has(exportName));

  if (missing.length > 0) {
    throw new Error(
      `Missing expected root exports in ${sourcePath}: ${missing.join(", ")}`
    );
  }

  return REPORTED_EXPORTS;
}

async function measureExportSizes(packageRoot, exportNames) {
  const distIndexPath = join(packageRoot, "dist", "index.mjs");
  const tempRoot = mkdtempSync(join(tmpdir(), "rmg-export-size-"));

  try {
    const rows = [];

    for (const exportName of exportNames) {
      const entryPath = join(tempRoot, `${exportName}.mjs`);
      writeFileSync(
        entryPath,
        `export { ${exportName} as default } from ${JSON.stringify(distIndexPath)};\n`
      );

      const result = await build({
        entryPoints: [entryPath],
        bundle: true,
        write: false,
        outfile: join(tempRoot, `${exportName}.bundle.mjs`),
        format: "esm",
        platform: "browser",
        target: "esnext",
        minify: true,
        treeShaking: true,
        legalComments: "none",
        logLevel: "silent",
        external: EXTERNALS,
      });

      const bundle = result.outputFiles[0]?.contents;
      if (!bundle) {
        throw new Error(`No output file generated for export "${exportName}"`);
      }

      const gzip = gzipSync(bundle, { level: 9, mtime: 0 });
      const brotli = brotliCompressSync(bundle, {
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
        },
      });

      rows.push({
        export: exportName,
        size: formatBundlephobiaSize(brotli.length),
        minified: formatBundlephobiaSize(bundle.length),
        gzip: formatBundlephobiaSize(gzip.length),
        brotli: formatBundlephobiaSize(brotli.length),
      });
    }

    return rows;
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function renderMarkdownTable(rows) {
  const lines = [
    "| Export | Size |",
    "| --- | --- |",
  ];

  for (const row of rows) {
    lines.push(`| \`${row.export}\` | ${row.size} |`);
  }

  return lines.join("\n");
}

function writeReadme(packageRoot, table) {
  const readmePath = join(packageRoot, "README.md");
  const readme = readFileSync(readmePath, "utf8");

  if (!readme.includes(README_START) || !readme.includes(README_END)) {
    throw new Error(
      `README markers not found in ${readmePath}. Expected ${README_START} and ${README_END}.`
    );
  }

  const [before, remainder] = readme.split(README_START, 2);
  const [, after] = remainder.split(README_END, 2);
  const updated = `${before}${README_START}\n${table}\n${README_END}${after}`;
  writeFileSync(readmePath, updated);
}

async function main() {
  const scriptPath = fileURLToPath(import.meta.url);
  const packageRoot = resolve(dirname(scriptPath), "..");
  const args = parseArgs(process.argv.slice(2));

  const metafilePath = join(packageRoot, "dist", "metafile-esm.json");
  const metafile = loadJson(metafilePath);
  const rootOutput = metafile.outputs["dist/index.mjs"];

  if (!rootOutput) {
    throw new Error(
      `Missing dist/index.mjs in ${metafilePath}. Run \`npm run build\` in packages/react-motion-gallery first.`
    );
  }

  const exportNames = selectReportedExports(rootOutput.exports, metafilePath);
  const rows = await measureExportSizes(packageRoot, exportNames);
  const table = renderMarkdownTable(rows);

  if (args.writeReadme) {
    writeReadme(packageRoot, table);
    return;
  }

  process.stdout.write(`${table}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
