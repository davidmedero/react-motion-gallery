import fs from "node:fs";
import path from "node:path";

import { getDemoById } from "./catalog.js";
import type { DemoCode, DemoMetadata, GeneratedExtraFile } from "./types.js";

const localPackageImportPattern =
  /from\s+["'][^"']*packages\/react-motion-gallery\/src["']/g;
const localPackageSubpathImportPattern =
  /from\s+["'][^"']*packages\/react-motion-gallery\/src\/([^"']+)["']/g;

const internalTypeImportReplacements: Array<{
  pattern: RegExp;
  replacement: string;
}> = [
  {
    pattern:
      /import type \{[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/Gallery\/grid\/GridSkeleton["'];?/g,
    replacement:
      'import type { GridSkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/grid";',
  },
  {
    pattern:
      /import type \{[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/Gallery\/masonry\/MasonrySkeleton["'];?/g,
    replacement:
      'import type { MasonrySkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/masonry/structured";',
  },
  {
    pattern:
      /import \{[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/Gallery\/masonry\/MasonrySkeleton["'];?/g,
    replacement:
      'import type { MasonrySkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/masonry/structured";',
  },
  {
    pattern:
      /import type \{[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/Gallery\/slider\/SliderSkeleton["'];?/g,
    replacement:
      'import type { SliderSkeletonNode, SliderSkeletonSlot, SliderSkeletonSpec } from "react-motion-gallery/skeleton/slider";',
  },
  {
    pattern:
      /import type \{[\s\S]*?GridSkeletonSpec[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/skeleton["'];?/g,
    replacement:
      'import type { GridSkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/grid";',
  },
  {
    pattern:
      /import type \{[\s\S]*?MasonrySkeletonSpec[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/skeleton["'];?/g,
    replacement:
      'import type { MasonrySkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/masonry/structured";',
  },
  {
    pattern:
      /import type \{[\s\S]*?SliderSkeletonSpec[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/skeleton["'];?/g,
    replacement:
      'import type { SliderSkeletonNode, SliderSkeletonSlot, SliderSkeletonSpec } from "react-motion-gallery/skeleton/slider";',
  },
];

const publicImportByExport = new Map<string, string>([
  ["GalleryCore", "react-motion-gallery/core"],
  ["useGalleryCore", "react-motion-gallery/core"],
  ["RatingStars", "react-motion-gallery/rating-stars"],
  ["Slider", "react-motion-gallery/slider"],
  ["useSliderReady", "react-motion-gallery/slider"],
  ["createSliderIndexChannel", "react-motion-gallery/slider"],
  ["Grid", "react-motion-gallery/grid"],
  ["gridPagination", "react-motion-gallery/grid/pagination"],
  ["useGridPagination", "react-motion-gallery/grid/pagination"],
  ["GridPaginationControls", "react-motion-gallery/grid/pagination"],
  ["gridLoadMore", "react-motion-gallery/grid/load-more"],
  ["useGridLoadMore", "react-motion-gallery/grid/load-more"],
  ["gridInfiniteScroll", "react-motion-gallery/grid/infinite-scroll"],
  ["useGridInfiniteScroll", "react-motion-gallery/grid/infinite-scroll"],
  ["gridVirtualization", "react-motion-gallery/grid/virtualization"],
  ["useGridVirtualizer", "react-motion-gallery/grid/virtualization"],
  ["Masonry", "react-motion-gallery/masonry"],
  ["masonryFullscreen", "react-motion-gallery/masonry/fullscreen"],
  ["masonryPagination", "react-motion-gallery/masonry/pagination"],
  ["useMasonryPagination", "react-motion-gallery/masonry/pagination"],
  ["MasonryPaginationControls", "react-motion-gallery/masonry/pagination"],
  ["masonryLoadMore", "react-motion-gallery/masonry/load-more"],
  ["useMasonryLoadMore", "react-motion-gallery/masonry/load-more"],
  ["masonryInfiniteScroll", "react-motion-gallery/masonry/infinite-scroll"],
  ["useMasonryInfiniteScroll", "react-motion-gallery/masonry/infinite-scroll"],
  ["masonryVirtualization", "react-motion-gallery/masonry/virtualization"],
  ["useMasonryVirtualizer", "react-motion-gallery/masonry/virtualization"],
  ["Entries", "react-motion-gallery/entries"],
  ["flattenEntries", "react-motion-gallery/entries"],
  ["useEntriesReady", "react-motion-gallery/entries/ready"],
  ["entriesPagination", "react-motion-gallery/entries/pagination"],
  ["useEntriesPagination", "react-motion-gallery/entries/pagination"],
  ["entriesLoadMore", "react-motion-gallery/entries/load-more"],
  ["useEntriesLoadMore", "react-motion-gallery/entries/load-more"],
  ["entriesInfiniteScroll", "react-motion-gallery/entries/infinite-scroll"],
  ["useEntriesInfiniteScroll", "react-motion-gallery/entries/infinite-scroll"],
  ["entriesVirtualization", "react-motion-gallery/entries/virtualization"],
  ["useEntriesVirtualizer", "react-motion-gallery/entries/virtualization"],
  ["useFullscreenController", "react-motion-gallery/fullscreen"],
  ["ThumbnailSlider", "react-motion-gallery/thumbnails"],
  ["createThumbnailSyncBridge", "react-motion-gallery/thumbnails"],
  ["FullscreenThumbnailSlider", "react-motion-gallery/fullscreenThumbnails"],
  ["Video", "react-motion-gallery/video"],
  ["ZoomPanImage", "react-motion-gallery/zoomPan"],
  ["Skeleton", "react-motion-gallery/skeleton/base"],
  ["SkeletonNode", "react-motion-gallery/skeleton/base"],
  ["SliderSkeleton", "react-motion-gallery/skeleton/slider"],
  ["SliderSkeletonNode", "react-motion-gallery/skeleton/slider"],
  ["SliderSkeletonSlot", "react-motion-gallery/skeleton/slider"],
  ["SliderSkeletonSpec", "react-motion-gallery/skeleton/slider"],
  ["GridSkeleton", "react-motion-gallery/skeleton/grid"],
  ["GridSkeletonNode", "react-motion-gallery/skeleton/grid"],
  ["GridSkeletonSlot", "react-motion-gallery/skeleton/grid"],
  ["GridSkeletonSpec", "react-motion-gallery/skeleton/grid"],
  ["MasonrySkeleton", "react-motion-gallery/skeleton/masonry"],
  ["MasonrySkeletonNode", "react-motion-gallery/skeleton/masonry"],
  ["MasonrySkeletonSlot", "react-motion-gallery/skeleton/masonry"],
  ["MasonrySkeletonSpec", "react-motion-gallery/skeleton/masonry"],
  ["toMediaItems", "react-motion-gallery/media"],
]);

export function getDemoCode(demoId: string): DemoCode {
  const demo = getDemoById(demoId);
  if (!demo) {
    throw new Error(`Unknown React Motion Gallery demo: ${demoId}`);
  }

  const rawTsx = readRawStringExport(demo.sourcePath, "source");
  const rawCss = readRawStringExport(demo.cssPath, "css");
  const tsx = normalizeDemoSource(rawTsx);
  const css = normalizeDemoCss(rawCss);
  const extraFiles = discoverExtraFiles(demo, tsx);

  return {
    ...demo,
    tsx,
    css,
    extraFiles,
    imports: extractReactMotionGalleryImports(tsx),
    notes: buildDemoNotes(tsx, extraFiles),
  };
}

export function normalizeDemoSource(source: string) {
  let normalized = normalizeRawTemplate(source);

  for (const replacement of internalTypeImportReplacements) {
    normalized = normalized.replace(replacement.pattern, replacement.replacement);
  }

  normalized = normalized.replace(
    localPackageSubpathImportPattern,
    (_match: string, entry: string) =>
      `from "${publicPathForLocalSourceEntry(entry)}"`
  );
  normalized = normalized.replace(localPackageImportPattern, 'from "react-motion-gallery"');
  normalized = normalizeRootRmgImports(normalized);
  normalized = normalized.replace(
    /from\s+["']\.\/([A-Za-z0-9._-]+)\.skeleton-text\.generated["']/g,
    'from "./$1.skeleton-text.generated"'
  );

  return normalized.trimEnd();
}

function publicPathForLocalSourceEntry(entry: string) {
  if (entry === "skeleton-base") return "react-motion-gallery/skeleton/base";
  if (entry === "skeleton-slider") return "react-motion-gallery/skeleton/slider";
  if (entry === "skeleton-grid") return "react-motion-gallery/skeleton/grid";
  if (entry === "skeleton-masonry") return "react-motion-gallery/skeleton/masonry";
  if (entry === "fullscreenThumbnails") return "react-motion-gallery/fullscreenThumbnails";
  if (entry === "zoomPan") return "react-motion-gallery/zoomPan";

  if (entry.startsWith("slider-")) {
    return `react-motion-gallery/slider/${entry.slice("slider-".length)}`;
  }

  if (entry.startsWith("fullscreen-")) {
    return `react-motion-gallery/fullscreen/${entry.slice("fullscreen-".length)}`;
  }

  if (entry === "grid-ready") return "react-motion-gallery/grid/ready";
  if (entry === "grid-pagination") return "react-motion-gallery/grid/pagination";
  if (entry === "grid-load-more") return "react-motion-gallery/grid/load-more";
  if (entry === "grid-infinite-scroll") return "react-motion-gallery/grid/infinite-scroll";
  if (entry === "grid-virtualization") return "react-motion-gallery/grid/virtualization";
  if (entry === "masonry-ready") return "react-motion-gallery/masonry/ready";
  if (entry === "masonry-fullscreen") return "react-motion-gallery/masonry/fullscreen";
  if (entry === "masonry-pagination") return "react-motion-gallery/masonry/pagination";
  if (entry === "masonry-load-more") return "react-motion-gallery/masonry/load-more";
  if (entry === "masonry-infinite-scroll") return "react-motion-gallery/masonry/infinite-scroll";
  if (entry === "masonry-virtualization") return "react-motion-gallery/masonry/virtualization";

  return `react-motion-gallery/${entry}`;
}

export function normalizeDemoCss(source: string) {
  return normalizeRawTemplate(source).trimEnd();
}

export function renameGeneratedComponent(
  tsx: string,
  args: { componentName?: string; cssModuleName?: string }
) {
  let next = tsx;

  if (args.componentName) {
    next = next.replace(/export function [A-Za-z0-9_]+Demo\(/, `export function ${args.componentName}(`);
    next = next.replace(/export function [A-Za-z0-9_]+\(/, (match) => {
      if (match.includes(args.componentName!)) {
        return match;
      }
      return `export function ${args.componentName}(`;
    });
  }

  if (args.cssModuleName) {
    next = next.replace(/from\s+["']\.\/[^"']+\.module\.css["']/g, `from "./${args.cssModuleName}"`);
  }

  return next;
}

export function inferPrimaryDemoForPrompt(goal: string) {
  const text = goal.toLowerCase();

  if (text.includes("zoom") || text.includes("pan")) return "zoom-pan-standalone";
  if (text.includes("entry") || text.includes("editorial")) return "entries-grid";
  if (text.includes("masonry") || text.includes("pinterest")) return "masonry-core-balanced";
  if (text.includes("grid")) return "grid-template-columns";
  if (text.includes("thumbnail")) return "fullscreen-thumbnails";
  if (text.includes("fullscreen")) return "fullscreen-layout-agnostic";
  if (text.includes("skeleton") || text.includes("loading")) return "skeleton-responsive-text";
  if (text.includes("video") && text.includes("slider")) return "slider-video-html5";
  if (text.includes("card")) return "slider-cards";

  return "slider-default";
}

export function extractReactMotionGalleryImports(tsx: string) {
  const imports = new Set<string>();
  for (const match of tsx.matchAll(/from\s+["'](react-motion-gallery[^"']*)["']/g)) {
    imports.add(match[1]!);
  }
  return [...imports].sort();
}

function normalizeRawTemplate(value: string) {
  return value.replaceAll("\\`", "`").replaceAll("\\${", "${");
}

function normalizeRootRmgImports(source: string) {
  return source.replace(
    /import\s+(type\s+)?\{([\s\S]*?)\}\s+from\s+["']react-motion-gallery["'];?/g,
    (fullMatch: string, typeOnly: string | undefined, importBody: string) => {
      const imports = importBody
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      const grouped = groupImportsByPath(imports);
      if (grouped.size <= 2) {
        return renderGroupedImports(grouped, Boolean(typeOnly));
      }

      return fullMatch;
    }
  );
}

function groupImportsByPath(imports: string[]) {
  const grouped = new Map<string, string[]>();
  for (const importName of imports) {
    const cleanName = importName.replace(/^type\s+/, "").trim();
    const importPath = publicImportByExport.get(cleanName) ?? "react-motion-gallery";
    const group = grouped.get(importPath) ?? [];
    group.push(importName);
    grouped.set(importPath, group);
  }
  return grouped;
}

function renderGroupedImports(grouped: Map<string, string[]>, typeOnly: boolean) {
  return [...grouped.entries()]
    .map(([importPath, imports]) => {
      const typePrefix = typeOnly ? "type " : "";
      return `import ${typePrefix}{ ${imports.join(", ")} } from "${importPath}";`;
    })
    .join("\n");
}

function readRawStringExport(filePath: string, exportName: "source" | "css") {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing demo ${exportName} file: ${filePath}`);
  }

  const file = fs.readFileSync(filePath, "utf8");
  const rawMarker = `export const ${exportName} = String.raw\``;
  const templateMarker = `export const ${exportName} = \``;
  const rawStart = file.indexOf(rawMarker);
  const templateStart = rawStart === -1 ? file.indexOf(templateMarker) : -1;
  const marker = rawStart !== -1 ? rawMarker : templateMarker;
  const start = rawStart !== -1 ? rawStart : templateStart;
  if (start === -1) {
    throw new Error(`Could not find template export "${exportName}" in ${filePath}`);
  }

  const bodyStart = start + marker.length;
  for (let index = bodyStart; index < file.length; index += 1) {
    if (file[index] === "`" && file[index - 1] !== "\\") {
      return file.slice(bodyStart, index);
    }
  }

  throw new Error(`Unterminated template export "${exportName}" in ${filePath}`);
}

function discoverExtraFiles(demo: DemoMetadata, tsx: string): GeneratedExtraFile[] {
  const files: GeneratedExtraFile[] = [];
  for (const match of tsx.matchAll(/from\s+["']\.\/([^"']+\.skeleton-text\.generated)["']/g)) {
    const filename = `${match[1]!}.ts`;
    const absolutePath = path.join(demo.demoPath, filename);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    files.push({
      path: filename,
      filename,
      code: fs.readFileSync(absolutePath, "utf8").trimEnd(),
      language: "ts",
    });
  }
  return files;
}

function buildDemoNotes(tsx: string, extraFiles: GeneratedExtraFile[]) {
  const notes: string[] = ['Import "react-motion-gallery/styles.css" once in your app shell.'];

  if (/\bVideo\b|kind:\s*"video"|youtube|vimeo|html5/i.test(tsx)) {
    notes.push("Video examples require the optional peer packages: plyr and plyr-react.");
  }

  if (extraFiles.length > 0) {
    notes.push("This example includes generated skeleton text sidecars; write them beside the component.");
  }

  if (/^['"]use client['"]/m.test(tsx)) {
    notes.push("This component is client-side because gallery interactions use browser events.");
  }

  return notes;
}
