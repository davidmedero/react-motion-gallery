#!/usr/bin/env node

import { build } from "esbuild";
import { gzipSync } from "node:zlib";
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
const REPORTED_SURFACES = [
  { label: "Entries", exportName: "Entries", entry: "dist/entries.mjs" },
  {
    label: "entries/cache",
    exportName: "CachedEntries",
    entry: "dist/entries-cache.mjs",
  },
  {
    label: "entries/ready",
    exportName: "useEntriesReady",
    entry: "dist/entries-ready.mjs",
  },
  {
    label: "entries/pagination",
    exportName: "entriesPagination",
    entry: "dist/entries-pagination.mjs",
  },
  {
    label: "entries/load-more",
    exportName: "entriesLoadMore",
    entry: "dist/entries-load-more.mjs",
  },
  {
    label: "entries/infinite-scroll",
    exportName: "entriesInfiniteScroll",
    entry: "dist/entries-infinite-scroll.mjs",
  },
  {
    label: "entries/virtualization",
    exportName: "entriesVirtualization",
    entry: "dist/entries-virtualization.mjs",
  },
  {
    label: "rating-stars",
    exportName: "RatingStars",
    entry: "dist/rating-stars.mjs",
  },
  {
    label: "FullscreenThumbnailSlider",
    exportName: "FullscreenThumbnailSlider",
    entry: "dist/fullscreenThumbnails.mjs",
  },
  { label: "GalleryCore", exportName: "GalleryCore", entry: "dist/core.mjs" },
  { label: "Grid", exportName: "Grid", entry: "dist/grid.mjs" },
  {
    label: "grid/ready",
    exportName: "useGridReady",
    entry: "dist/grid-ready.mjs",
  },
  {
    label: "grid/lazy-load",
    exportName: "gridLazyLoad",
    entry: "dist/grid-lazy-load.mjs",
  },
  {
    label: "grid/fullscreen",
    exportName: "gridFullscreen",
    entry: "dist/grid-fullscreen.mjs",
  },
  {
    label: "grid/pagination",
    exportName: "gridPagination",
    entry: "dist/grid-pagination.mjs",
  },
  {
    label: "grid/load-more",
    exportName: "gridLoadMore",
    entry: "dist/grid-load-more.mjs",
  },
  {
    label: "grid/infinite-scroll",
    exportName: "gridInfiniteScroll",
    entry: "dist/grid-infinite-scroll.mjs",
  },
  {
    label: "grid/virtualization",
    exportName: "gridVirtualization",
    entry: "dist/grid-virtualization.mjs",
  },
  { label: "Masonry", exportName: "Masonry", entry: "dist/masonry.mjs" },
  {
    label: "masonry/ready",
    exportName: "useMasonryReady",
    entry: "dist/masonry-ready.mjs",
  },
  {
    label: "masonry/fullscreen",
    exportName: "masonryFullscreen",
    entry: "dist/masonry-fullscreen.mjs",
  },
  {
    label: "masonry/measured",
    exportName: "Masonry",
    entry: "dist/masonry-measured.mjs",
  },
  {
    label: "masonry/measured/ready",
    exportName: "useMasonryReady",
    entry: "dist/masonry-measured-ready.mjs",
  },
  {
    label: "masonry/lazy-load",
    exportName: "masonryLazyLoad",
    entry: "dist/masonry-lazy-load.mjs",
  },
  {
    label: "masonry/pagination",
    exportName: "masonryPagination",
    entry: "dist/masonry-pagination.mjs",
  },
  {
    label: "masonry/load-more",
    exportName: "masonryLoadMore",
    entry: "dist/masonry-load-more.mjs",
  },
  {
    label: "masonry/infinite-scroll",
    exportName: "masonryInfiniteScroll",
    entry: "dist/masonry-infinite-scroll.mjs",
  },
  {
    label: "masonry/virtualization",
    exportName: "masonryVirtualization",
    entry: "dist/masonry-virtualization.mjs",
  },
  {
    label: "Skeleton base",
    exportName: "Skeleton",
    entry: "dist/skeleton-base.mjs",
  },
  {
    label: "skeleton/cache/base",
    exportName: "CachedSkeleton",
    entry: "dist/skeleton-cache-base.mjs",
  },
  {
    label: "skeleton/slider",
    exportName: "SliderSkeleton",
    entry: "dist/skeleton-slider.mjs",
  },
  {
    label: "skeleton/cache/slider",
    exportName: "CachedSliderSkeleton",
    entry: "dist/skeleton-cache-slider.mjs",
  },
  {
    label: "skeleton/slider/restore",
    exportName: "RestoredSliderSkeleton",
    entry: "dist/skeleton-slider-restore.mjs",
  },
  {
    label: "skeleton/grid",
    exportName: "GridSkeleton",
    entry: "dist/skeleton-grid.mjs",
  },
  {
    label: "skeleton/cache/grid",
    exportName: "CachedGridSkeleton",
    entry: "dist/skeleton-cache-grid.mjs",
  },
  {
    label: "skeleton/masonry",
    exportName: "MasonrySkeleton",
    entry: "dist/skeleton-masonry.mjs",
  },
  {
    label: "skeleton/cache/masonry",
    exportName: "CachedMasonrySkeleton",
    entry: "dist/skeleton-cache-masonry.mjs",
  },
  {
    label: "skeleton/masonry/structured",
    exportName: "MasonrySkeleton",
    entry: "dist/skeleton-masonry-structured.mjs",
  },
  {
    label: "skeleton/cache/masonry/structured",
    exportName: "CachedMasonrySkeleton",
    entry: "dist/skeleton-cache-masonry-structured.mjs",
  },
  {
    label: "Slider core",
    exportName: "Slider",
    entry: "dist/slider.mjs",
  },
  {
    label: "slider/ready",
    exportName: "useSliderReady",
    entry: "dist/slider-ready.mjs",
  },
  {
    label: "slider/arrows",
    exportName: "sliderArrows",
    entry: "dist/slider-arrows.mjs",
  },
  {
    label: "slider/dots",
    exportName: "sliderDots",
    entry: "dist/slider-dots.mjs",
  },
  {
    label: "slider/progress",
    exportName: "sliderProgress",
    entry: "dist/slider-progress.mjs",
  },
  {
    label: "slider/scrollbar",
    exportName: "sliderScrollbar",
    entry: "dist/slider-scrollbar.mjs",
  },
  {
    label: "slider/auto-height",
    exportName: "sliderAutoHeight",
    entry: "dist/slider-auto-height.mjs",
  },
  {
    label: "slider/lazy-load",
    exportName: "sliderLazyLoad",
    entry: "dist/slider-lazy-load.mjs",
  },
  {
    label: "slider/parallax",
    exportName: "sliderParallax",
    entry: "dist/slider-parallax.mjs",
  },
  {
    label: "slider/scale",
    exportName: "sliderScale",
    entry: "dist/slider-scale.mjs",
  },
  {
    label: "slider/fade",
    exportName: "sliderFade",
    entry: "dist/slider-fade.mjs",
  },
  {
    label: "slider/crossfade",
    exportName: "sliderCrossfade",
    entry: "dist/slider-crossfade.mjs",
  },
  {
    label: "slider/fullscreen",
    exportName: "sliderFullscreen",
    entry: "dist/slider-fullscreen.mjs",
  },
  {
    label: "ThumbnailSlider",
    exportName: "ThumbnailSlider",
    entry: "dist/thumbnails.mjs",
  },
  {
    label: "useFullscreenController",
    exportName: "useFullscreenController",
    entry: "dist/fullscreen.mjs",
  },
  {
    label: "fullscreen/slider",
    exportName: "fullscreenSlider",
    entry: "dist/fullscreen-slider.mjs",
  },
  {
    label: "fullscreen/controls",
    exportName: "fullscreenControls",
    entry: "dist/fullscreen-controls.mjs",
  },
  {
    label: "fullscreen/captions",
    exportName: "fullscreenCaptions",
    entry: "dist/fullscreen-captions.mjs",
  },
  {
    label: "fullscreen/zoom-pan",
    exportName: "fullscreenZoomPan",
    entry: "dist/fullscreen-zoom-pan.mjs",
  },
  {
    label: "fullscreen/video",
    exportName: "fullscreenVideo",
    entry: "dist/fullscreen-video.mjs",
  },
  {
    label: "fullscreen/lazy-load",
    exportName: "fullscreenLazyLoad",
    entry: "dist/fullscreen-lazy-load.mjs",
  },
  {
    label: "fullscreen/crossfade",
    exportName: "fullscreenCrossfade",
    entry: "dist/fullscreen-crossfade.mjs",
  },
  {
    label: "fullscreen/thumbnails",
    exportName: "fullscreenThumbnails",
    entry: "dist/fullscreen-thumbnails.mjs",
  },
  { label: "Video", exportName: "Video", entry: "dist/video.mjs" },
  { label: "ZoomPanImage", exportName: "ZoomPanImage", entry: "dist/zoomPan.mjs" },
  {
    label: "zoomPan/hover",
    exportName: "zoomPanHover",
    entry: "dist/zoomPan-hover.mjs",
  },
  {
    label: "media / toMediaItems",
    exportName: "toMediaItems",
    entry: "dist/media.mjs",
  },
  {
    label: "media/ready",
    exportName: "useImageDecodeReady",
    entry: "dist/media-ready.mjs",
  },
  {
    label: "responsive / BREAKPOINT_MAP",
    exportName: "BREAKPOINT_MAP",
    entry: "dist/responsive.mjs",
  },
  { label: "Reveal", exportName: "Reveal", entry: "dist/reveal.mjs" },
];
const EXTERNALS = [
  "react",
  "react-dom",
  "react-dom/client",
  "react/jsx-runtime",
  "plyr",
  "plyr-react",
];

function formatSize(bytes) {
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

function selectReportedSurfaces(metafile, sourcePath) {
  const missing = REPORTED_SURFACES.filter((surface) => {
    if (surface.source) return false;
    const output = metafile.outputs[surface.entry];
    return !output || !new Set(output.exports).has(surface.exportName);
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing expected exports in ${sourcePath}: ${missing
        .map((surface) => `${surface.entry}:${surface.exportName}`)
        .join(", ")}`
    );
  }

  return REPORTED_SURFACES;
}

function gzipSize(contents) {
  return gzipSync(contents, { level: 9, mtime: 0 }).length;
}

async function measureExportSizes(packageRoot, surfaces) {
  const tempRoot = mkdtempSync(join(tmpdir(), "rmg-export-size-"));
  const abs = (relativePath) => JSON.stringify(join(packageRoot, relativePath));

  try {
    const rows = [];

    for (const surface of surfaces) {
      const sourcePath = surface.entry ? join(packageRoot, surface.entry) : "";
      const fileName = surface.label.replace(/[^\w.-]+/g, "_");
      const entryPath = join(tempRoot, `${fileName}.mjs`);
      writeFileSync(
        entryPath,
        surface.source
          ? surface.source({ abs })
          : `export { ${surface.exportName} as default } from ${JSON.stringify(sourcePath)};\n`
      );

      const result = await build({
        entryPoints: [entryPath],
        bundle: true,
        write: false,
        outdir: join(tempRoot, "out"),
        format: "esm",
        splitting: true,
        platform: "browser",
        target: "esnext",
        minify: true,
        treeShaking: true,
        legalComments: "none",
        logLevel: "silent",
        external: EXTERNALS,
        metafile: true,
      });

      const outputByBasename = new Map(
        result.outputFiles.map((file) => [file.path.split("/").pop(), file.contents])
      );
      const outputs = result.metafile.outputs;
      const entryOutput = Object.entries(outputs).find(([, output]) => output.entryPoint);
      if (!entryOutput) throw new Error(`No entry output generated for "${surface.label}"`);

      const initialOutputKeys = collectInitialOutputKeys(outputs, entryOutput[0]);
      const allOutputKeys = new Set(Object.keys(outputs));
      const asyncOutputKeys = new Set(
        [...allOutputKeys].filter((key) => !initialOutputKeys.has(key))
      );
      const gzipOutputKeys = (keys) =>
        [...keys].reduce((total, key) => {
          const contents = outputByBasename.get(key.split("/").pop());
          return contents ? total + gzipSize(contents) : total;
        }, 0);

      const initialJsGzipBytes = gzipOutputKeys(initialOutputKeys);
      const asyncJsGzipBytes = gzipOutputKeys(asyncOutputKeys);
      const jsGzipBytes = initialJsGzipBytes + asyncJsGzipBytes;

      rows.push({
        export: surface.label,
        jsGzipBytes,
        jsGzip: formatSize(jsGzipBytes),
      });
    }

    return rows;
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function collectInitialOutputKeys(outputs, entryKey) {
  const seen = new Set();

  const visit = (key) => {
    if (!key || seen.has(key)) return;
    seen.add(key);

    for (const outputImport of outputs[key]?.imports ?? []) {
      if (outputImport.external || outputImport.kind === "dynamic-import") continue;
      visit(outputImport.path);
    }
  };

  visit(entryKey);
  return seen;
}

function renderMarkdownTable(rows) {
  const lines = ["| Surface | JS gzip |", "| --- | --- |"];

  for (const row of rows) {
    lines.push(`| \`${row.export}\` | ${row.jsGzip} |`);
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

  const surfaces = selectReportedSurfaces(metafile, metafilePath);
  const rows = await measureExportSizes(packageRoot, surfaces);
  const table = renderMarkdownTable(rows);

  if (args.writeReadme) {
    writeReadme(packageRoot, table);
  } else {
    process.stdout.write(`${table}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
