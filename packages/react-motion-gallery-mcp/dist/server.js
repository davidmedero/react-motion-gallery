#!/usr/bin/env node

// src/server.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// src/mcp.ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// src/catalog.ts
import fs from "fs";
import path2 from "path";

// src/paths.ts
import path from "path";
import { fileURLToPath } from "url";
var inferredRepoRoot = path.resolve(
  fileURLToPath(new URL("../../..", import.meta.url))
);
var repoRoot = process.env.RMG_REPO_ROOT ? path.resolve(process.env.RMG_REPO_ROOT) : inferredRepoRoot;
function repoPath(...parts) {
  return path.join(repoRoot, ...parts);
}
function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

// src/catalog.ts
var componentCatalog = [
  {
    id: "slider",
    name: "Slider",
    importPath: "react-motion-gallery/slider",
    exports: ["Slider", "useSliderReady", "createSliderIndexChannel"],
    categoryIds: ["slider"],
    description: "Small core carousel primitive for child slides, drag, wheel, snapping, grouped cells, loop, and shared index state.",
    whenToUse: [
      "Use for horizontal or vertical galleries where one active position matters.",
      "Use with ThumbnailSlider or createSliderIndexChannel when separate controls need to stay in sync.",
      "Import first-party plugins from granular subpaths such as react-motion-gallery/slider/arrows, /dots, /auto-height, /parallax, or /fullscreen when you need one feature.",
      "Wrap with standalone Skeleton plus useSliderReady when you need structured slider skeletons or restore."
    ],
    relatedTags: [
      "slider",
      "loop",
      "center",
      "group-cells",
      "free-scroll",
      "wheel",
      "plugins"
    ]
  },
  {
    id: "grid",
    name: "Grid",
    importPath: "react-motion-gallery/grid",
    exports: ["Grid"],
    categoryIds: ["grid"],
    description: "Responsive media grid with spans, template columns, lazy loading, skeletons, and fullscreen item handoffs.",
    whenToUse: [
      "Use for predictable editorial or product grids.",
      "Use templateColumns when track proportions matter more than a plain column count."
    ],
    relatedTags: ["grid", "span", "template-columns", "responsive"]
  },
  {
    id: "masonry",
    name: "Masonry",
    importPath: "react-motion-gallery/masonry",
    exports: ["Masonry"],
    categoryIds: ["masonry"],
    description: "Server-predicted masonry layout that keeps placement stable through hydration, then refines from live measurements.",
    whenToUse: [
      "Use for mixed aspect ratios or cards with uneven text/media heights.",
      "Choose placement mode based on whether balance, round-robin order, or horizontal visual order matters most."
    ],
    relatedTags: ["masonry", "balanced", "round-robin", "horizontal-order", "span"]
  },
  {
    id: "entries",
    name: "Entries",
    importPath: "react-motion-gallery/entries",
    exports: ["Entries", "flattenEntries"],
    categoryIds: ["entries"],
    description: "Structured content renderer for rows with section text, body copy, media, metadata, and slider/grid/masonry media layouts.",
    whenToUse: [
      "Use when the data model is an editorial entry rather than loose child nodes.",
      "Use when text and media need coordinated fullscreen overlays."
    ],
    relatedTags: ["entries", "slider", "grid", "masonry", "fullscreen"]
  },
  {
    id: "fullscreen",
    name: "Fullscreen",
    importPath: "react-motion-gallery/fullscreen",
    exports: ["useFullscreenController"],
    categoryIds: ["fullscreen", "slider", "grid", "masonry", "entries"],
    description: "Small fullscreen controller hook. Add fullscreenSlider for the runtime, rich media plugins for captions, zoom/pan, video, and lazy media, plus option plugins for controls, crossfade, and thumbnail bridge behavior.",
    whenToUse: [
      "Use inside GalleryCore when gallery media should expand into a fullscreen slider.",
      "Use layout-agnostic mode for custom cards or buttons that open fullscreen media directly.",
      "Import at least one fullscreen runtime plugin, usually fullscreenSlider from react-motion-gallery/fullscreen/slider."
    ],
    relatedTags: ["fullscreen", "captions", "overlay", "lazy-load", "scale"]
  },
  {
    id: "fullscreen-plugins",
    name: "Fullscreen Plugins",
    importPath: "react-motion-gallery/fullscreen/*",
    exports: [
      "fullscreenSlider",
      "fullscreenControls",
      "fullscreenCaptions",
      "fullscreenZoomPan",
      "fullscreenVideo",
      "fullscreenLazyLoad",
      "fullscreenCrossfade",
      "fullscreenThumbnails"
    ],
    categoryIds: ["fullscreen"],
    description: "First-party fullscreen plugin factories. fullscreenSlider mounts the base runtime; rich media plugins add only the fullscreen behavior a route uses.",
    whenToUse: [
      "Use fullscreenSlider() to mount the fullscreen runtime.",
      "Add fullscreenZoomPan(), fullscreenVideo(), fullscreenCaptions(), or fullscreenLazyLoad() only when that route needs richer fullscreen media runtime.",
      "Add fullscreenCrossfade() only when that route needs crossfade navigation behavior."
    ],
    relatedTags: ["fullscreen", "plugins", "captions", "video", "lazy-load", "crossfade"]
  },
  {
    id: "thumbnails",
    name: "ThumbnailSlider",
    importPath: "react-motion-gallery/thumbnails",
    exports: ["ThumbnailSlider", "createThumbnailSyncBridge"],
    categoryIds: ["slider", "fullscreen"],
    description: "Thumbnail rail primitive that can sync with a base Slider or fullscreen thumbnail bridge.",
    whenToUse: [
      "Use when a gallery needs direct visual navigation.",
      "Pair with createSliderIndexChannel for base slider synchronization."
    ],
    relatedTags: ["thumbnails", "navigation", "sync"]
  },
  {
    id: "fullscreen-thumbnails",
    name: "FullscreenThumbnailSlider",
    importPath: "react-motion-gallery/fullscreenThumbnails",
    exports: ["FullscreenThumbnailSlider"],
    categoryIds: ["fullscreen"],
    description: "Thumbnail rail that follows the fullscreen controller bridge and can sit beside or under fullscreen media.",
    whenToUse: [
      "Use when fullscreen mode needs its own thumbnail navigation.",
      "Use with the fullscreenThumbnailBridge returned by useFullscreenController."
    ],
    relatedTags: ["fullscreen-thumbnails", "thumbnails", "sync"]
  },
  {
    id: "video",
    name: "Video",
    importPath: "react-motion-gallery/video",
    exports: ["Video"],
    categoryIds: ["slider", "grid", "masonry", "entries"],
    description: "Gallery-ready video primitive for HTML5, YouTube, and Vimeo media backed by optional Plyr peers.",
    whenToUse: [
      "Use for video slides or media cards where player controls need gallery coordination.",
      "Install plyr and plyr-react only when the app uses Video."
    ],
    relatedTags: ["video", "html5", "youtube", "vimeo"],
    optionalPeerDependencies: ["plyr", "plyr-react"]
  },
  {
    id: "zoom-pan",
    name: "ZoomPanImage",
    importPath: "react-motion-gallery/zoomPan",
    exports: ["ZoomPanImage"],
    categoryIds: ["zoom-pan", "slider", "grid", "masonry"],
    description: "Standalone zoomable image surface with click zoom, drag pan, ctrl-wheel zoom, and touch pinch.",
    whenToUse: [
      "Use for cropped images that should be inspectable without opening fullscreen.",
      "Use inside Slider, Grid, or Masonry when per-image zoom is the primary interaction."
    ],
    relatedTags: ["zoom-pan", "image", "crop"]
  },
  {
    id: "skeleton",
    name: "Skeleton",
    importPath: "react-motion-gallery/skeleton/base",
    exports: ["Skeleton"],
    categoryIds: ["skeleton"],
    description: "Standalone and wrapper skeleton renderer with structured rect/text layouts, shimmer, timing, and browser-measured text support.",
    whenToUse: [
      "Use standalone Skeleton when loading UI is not tied to a gallery layout.",
      "Use react-motion-gallery/skeleton/slider, /grid, or /masonry for gallery-specific structured skeletons."
    ],
    relatedTags: ["skeleton", "text", "responsive", "container-query", "force"]
  },
  {
    id: "core",
    name: "GalleryCore",
    importPath: "react-motion-gallery/core",
    exports: ["GalleryCore", "useGalleryCore"],
    categoryIds: ["slider", "grid", "masonry", "entries", "fullscreen"],
    description: "Shared state boundary for fullscreen-aware galleries, normalized fullscreen items, breakpoints, and programmatic opening.",
    whenToUse: [
      "Wrap layouts in GalleryCore when using fullscreen.",
      "Use useGalleryCore for custom fullscreen triggers or related controls."
    ],
    relatedTags: ["gallery-api", "openFullscreenAt", "fullscreen"]
  },
  {
    id: "media",
    name: "Media helpers",
    importPath: "react-motion-gallery/media",
    exports: ["toMediaItems"],
    categoryIds: ["slider", "grid", "masonry", "entries"],
    description: "Normalization helpers for image, video, node, and string URL media inputs.",
    whenToUse: [
      "Use toMediaItems when examples or app data mix strings and structured media objects."
    ],
    relatedTags: ["media", "image", "video"]
  }
];
var categoryDescriptions = {
  slider: "Motion-first slider demos covering loop, axis, granular plugins, effects, thumbnails, video, API mutation, and Skeleton-owned loading.",
  grid: "Responsive grid demos for spans, template tracks, min column width, lazy loading, video, fullscreen, and skeletons.",
  masonry: "Masonry demos for balanced, round-robin, horizontal order, spans, video, fullscreen, and stable skeleton loading.",
  entries: "Structured entry demos that combine copy, metadata, media, and slider/grid/masonry renderers.",
  "zoom-pan": "Standalone and embedded zoom/pan image demos for cropped inspection surfaces.",
  fullscreen: "Fullscreen controller demos for custom triggers, captions, overlays, thumbnails, effects, and lazy media.",
  skeleton: "Standalone skeleton demos for app shells, cards, responsive text, and forced overlays."
};
var memoizedDemos = null;
function getCategoryDescriptions() {
  return categoryDescriptions;
}
function getDemoCatalog() {
  if (memoizedDemos) {
    return memoizedDemos;
  }
  const parsed = parseDemoRegistry();
  memoizedDemos = parsed.length > 0 ? parsed : discoverDemoFiles();
  return memoizedDemos;
}
function getDemoById(demoId) {
  return getDemoCatalog().find((demo) => demo.id === demoId) ?? null;
}
function parseDemoRegistry() {
  const registryPath = repoPath("apps", "marketing", "app", "demos", "DemosPageClient.tsx");
  if (!fs.existsSync(registryPath)) {
    return [];
  }
  const source = fs.readFileSync(registryPath, "utf8");
  const demosBlock = source.match(
    /const DEMOS: DemoDefinition\[] = \[([\s\S]*?)\];\s*\n\s*const DEMO_BY_ID/
  )?.[1];
  if (!demosBlock) {
    return [];
  }
  const demos = [];
  const objectPattern = /\{\s*id:\s*"([^"]+)"([\s\S]*?)\n\s*\},/g;
  for (const match of demosBlock.matchAll(objectPattern)) {
    const id = match[1];
    const body = match[2];
    const title = extractStringField(body, "title") ?? id;
    const eyebrow = extractStringField(body, "eyebrow") ?? title;
    const categoryId = extractStringField(body, "categoryId");
    if (!categoryId || !(categoryId in categoryDescriptions)) {
      continue;
    }
    const sourceFilename = extractStringField(body, "sourceFilename") ?? "Component.tsx";
    const cssFilename = extractStringField(body, "cssFilename") ?? `${id}-demo.module.css`;
    const tags = extractStringArrayField(body, "tags");
    const demoPath = demoDirectoryFor(categoryId, id);
    demos.push({
      id,
      title,
      eyebrow,
      tags,
      categoryId,
      demoPath,
      sourcePath: path2.join(demoPath, "source.ts"),
      cssPath: path2.join(demoPath, "css.ts"),
      sourceFilename,
      cssFilename
    });
  }
  return demos;
}
function discoverDemoFiles() {
  const demosRoot = repoPath("apps", "marketing", "app", "demos");
  if (!fs.existsSync(demosRoot)) {
    return [];
  }
  const demos = [];
  for (const categoryId of Object.keys(categoryDescriptions)) {
    const categoryPath = path2.join(demosRoot, categoryId);
    if (!fs.existsSync(categoryPath)) {
      continue;
    }
    for (const slug of fs.readdirSync(categoryPath)) {
      const demoPath = path2.join(categoryPath, slug);
      const sourcePath = path2.join(demoPath, "source.ts");
      const cssPath = path2.join(demoPath, "css.ts");
      if (!fs.existsSync(sourcePath) || !fs.existsSync(cssPath)) {
        continue;
      }
      const id = `${categoryId}-${slug}`;
      demos.push({
        id,
        title: titleFromSlug(slug),
        eyebrow: titleFromSlug(categoryId),
        tags: [categoryId, slug],
        categoryId,
        demoPath,
        sourcePath,
        cssPath,
        sourceFilename: "Component.tsx",
        cssFilename: `${id}-demo.module.css`
      });
    }
  }
  return demos.sort((a, b) => a.id.localeCompare(b.id));
}
function demoDirectoryFor(categoryId, id) {
  const prefix = `${categoryId}-`;
  const slug = categoryId === "zoom-pan" && id.startsWith(prefix) ? id.slice(prefix.length) : id;
  return repoPath("apps", "marketing", "app", "demos", categoryId, slug);
}
function extractStringField(source, fieldName) {
  return source.match(new RegExp(`${fieldName}:\\s*"([^"]+)"`))?.[1] ?? null;
}
function extractStringArrayField(source, fieldName) {
  const body = source.match(new RegExp(`${fieldName}:\\s*\\[([^\\]]*)\\]`))?.[1] ?? "";
  return [...body.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}
function titleFromSlug(slug) {
  return slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function serializeDemoMetadata(demo) {
  return {
    ...demo,
    demoPath: toPosixPath(path2.relative(repoPath(), demo.demoPath)),
    sourcePath: toPosixPath(path2.relative(repoPath(), demo.sourcePath)),
    cssPath: toPosixPath(path2.relative(repoPath(), demo.cssPath))
  };
}

// src/content.ts
function textContent(text) {
  return {
    content: [
      {
        type: "text",
        text
      }
    ]
  };
}
function jsonContent(value) {
  return textContent(JSON.stringify(value, null, 2));
}

// src/generate.ts
import path4 from "path";

// src/snippets.ts
import fs2 from "fs";
import path3 from "path";
var localPackageImportPattern = /from\s+["'][^"']*packages\/react-motion-gallery\/src["']/g;
var localPackageSubpathImportPattern = /from\s+["'][^"']*packages\/react-motion-gallery\/src\/([^"']+)["']/g;
var internalTypeImportReplacements = [
  {
    pattern: /import type \{[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/Gallery\/grid\/GridSkeleton["'];?/g,
    replacement: 'import type { GridSkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/grid";'
  },
  {
    pattern: /import type \{[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/Gallery\/masonry\/MasonrySkeleton["'];?/g,
    replacement: 'import type { MasonrySkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/masonry";'
  },
  {
    pattern: /import \{[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/Gallery\/masonry\/MasonrySkeleton["'];?/g,
    replacement: 'import type { MasonrySkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/masonry";'
  },
  {
    pattern: /import type \{[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/Gallery\/slider\/SliderSkeleton["'];?/g,
    replacement: 'import type { SliderSkeletonNode, SliderSkeletonSlot, SliderSkeletonSpec } from "react-motion-gallery/skeleton/slider";'
  },
  {
    pattern: /import type \{[\s\S]*?GridSkeletonSpec[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/skeleton["'];?/g,
    replacement: 'import type { GridSkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/grid";'
  },
  {
    pattern: /import type \{[\s\S]*?MasonrySkeletonSpec[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/skeleton["'];?/g,
    replacement: 'import type { MasonrySkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/masonry";'
  },
  {
    pattern: /import type \{[\s\S]*?SliderSkeletonSpec[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/skeleton["'];?/g,
    replacement: 'import type { SliderSkeletonNode, SliderSkeletonSlot, SliderSkeletonSpec } from "react-motion-gallery/skeleton/slider";'
  }
];
var publicImportByExport = /* @__PURE__ */ new Map([
  ["GalleryCore", "react-motion-gallery/core"],
  ["useGalleryCore", "react-motion-gallery/core"],
  ["Slider", "react-motion-gallery/slider"],
  ["useSliderReady", "react-motion-gallery/slider"],
  ["createSliderIndexChannel", "react-motion-gallery/slider"],
  ["Grid", "react-motion-gallery/grid"],
  ["Masonry", "react-motion-gallery/masonry"],
  ["Entries", "react-motion-gallery/entries"],
  ["flattenEntries", "react-motion-gallery/entries"],
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
  ["toMediaItems", "react-motion-gallery/media"]
]);
function getDemoCode(demoId) {
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
    notes: buildDemoNotes(tsx, extraFiles)
  };
}
function normalizeDemoSource(source) {
  let normalized = normalizeRawTemplate(source);
  for (const replacement of internalTypeImportReplacements) {
    normalized = normalized.replace(replacement.pattern, replacement.replacement);
  }
  normalized = normalized.replace(
    localPackageSubpathImportPattern,
    (_match, entry) => `from "${publicPathForLocalSourceEntry(entry)}"`
  );
  normalized = normalized.replace(localPackageImportPattern, 'from "react-motion-gallery"');
  normalized = normalizeRootRmgImports(normalized);
  normalized = normalized.replace(
    /from\s+["']\.\/([A-Za-z0-9._-]+)\.skeleton-text\.generated["']/g,
    'from "./$1.skeleton-text.generated"'
  );
  return normalized.trimEnd();
}
function publicPathForLocalSourceEntry(entry) {
  if (entry === "skeleton-base") return "react-motion-gallery/skeleton/base";
  if (entry === "skeleton-slider") return "react-motion-gallery/skeleton/slider";
  if (entry === "skeleton-grid") return "react-motion-gallery/skeleton/grid";
  if (entry === "skeleton-masonry") return "react-motion-gallery/skeleton/masonry";
  if (entry === "skeleton") return "react-motion-gallery/skeleton";
  if (entry === "fullscreenThumbnails") return "react-motion-gallery/fullscreenThumbnails";
  if (entry === "zoomPan") return "react-motion-gallery/zoomPan";
  if (entry.startsWith("slider-")) {
    return `react-motion-gallery/slider/${entry.slice("slider-".length)}`;
  }
  if (entry.startsWith("fullscreen-")) {
    return `react-motion-gallery/fullscreen/${entry.slice("fullscreen-".length)}`;
  }
  if (entry === "grid-ready") return "react-motion-gallery/grid/ready";
  if (entry === "masonry-ready") return "react-motion-gallery/masonry/ready";
  return `react-motion-gallery/${entry}`;
}
function normalizeDemoCss(source) {
  return normalizeRawTemplate(source).trimEnd();
}
function renameGeneratedComponent(tsx, args) {
  let next = tsx;
  if (args.componentName) {
    next = next.replace(/export function [A-Za-z0-9_]+Demo\(/, `export function ${args.componentName}(`);
    next = next.replace(/export function [A-Za-z0-9_]+\(/, (match) => {
      if (match.includes(args.componentName)) {
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
function inferPrimaryDemoForPrompt(goal) {
  const text = goal.toLowerCase();
  if (text.includes("zoom") || text.includes("pan")) return "zoom-pan-standalone";
  if (text.includes("entry") || text.includes("editorial")) return "entries-grid";
  if (text.includes("masonry") || text.includes("pinterest")) return "masonry-balanced";
  if (text.includes("grid")) return "grid-template-columns";
  if (text.includes("thumbnail")) return "fullscreen-thumbnails";
  if (text.includes("fullscreen")) return "fullscreen-layout-agnostic";
  if (text.includes("skeleton") || text.includes("loading")) return "skeleton-responsive-text";
  if (text.includes("video") && text.includes("slider")) return "slider-video-html5";
  if (text.includes("card")) return "slider-cards";
  return "slider-default";
}
function extractReactMotionGalleryImports(tsx) {
  const imports = /* @__PURE__ */ new Set();
  for (const match of tsx.matchAll(/from\s+["'](react-motion-gallery[^"']*)["']/g)) {
    imports.add(match[1]);
  }
  return [...imports].sort();
}
function normalizeRawTemplate(value) {
  return value.replaceAll("\\`", "`").replaceAll("\\${", "${");
}
function normalizeRootRmgImports(source) {
  return source.replace(
    /import\s+(type\s+)?\{([\s\S]*?)\}\s+from\s+["']react-motion-gallery["'];?/g,
    (fullMatch, typeOnly, importBody) => {
      const imports = importBody.split(",").map((part) => part.trim()).filter(Boolean);
      const grouped = groupImportsByPath(imports);
      if (grouped.size <= 2) {
        return renderGroupedImports(grouped, Boolean(typeOnly));
      }
      return fullMatch;
    }
  );
}
function groupImportsByPath(imports) {
  const grouped = /* @__PURE__ */ new Map();
  for (const importName of imports) {
    const cleanName = importName.replace(/^type\s+/, "").trim();
    const importPath = publicImportByExport.get(cleanName) ?? "react-motion-gallery";
    const group = grouped.get(importPath) ?? [];
    group.push(importName);
    grouped.set(importPath, group);
  }
  return grouped;
}
function renderGroupedImports(grouped, typeOnly) {
  return [...grouped.entries()].map(([importPath, imports]) => {
    const typePrefix = typeOnly ? "type " : "";
    return `import ${typePrefix}{ ${imports.join(", ")} } from "${importPath}";`;
  }).join("\n");
}
function readRawStringExport(filePath, exportName) {
  if (!fs2.existsSync(filePath)) {
    throw new Error(`Missing demo ${exportName} file: ${filePath}`);
  }
  const file = fs2.readFileSync(filePath, "utf8");
  const marker = `export const ${exportName} = String.raw\``;
  const start = file.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find String.raw export "${exportName}" in ${filePath}`);
  }
  const bodyStart = start + marker.length;
  for (let index = bodyStart; index < file.length; index += 1) {
    if (file[index] === "`" && file[index - 1] !== "\\") {
      return file.slice(bodyStart, index);
    }
  }
  throw new Error(`Unterminated String.raw export "${exportName}" in ${filePath}`);
}
function discoverExtraFiles(demo, tsx) {
  const files = [];
  for (const match of tsx.matchAll(/from\s+["']\.\/([^"']+\.skeleton-text\.generated)["']/g)) {
    const filename = `${match[1]}.ts`;
    const absolutePath = path3.join(demo.demoPath, filename);
    if (!fs2.existsSync(absolutePath)) {
      continue;
    }
    files.push({
      path: filename,
      filename,
      code: fs2.readFileSync(absolutePath, "utf8").trimEnd(),
      language: "ts"
    });
  }
  return files;
}
function buildDemoNotes(tsx, extraFiles) {
  const notes = ['Import "react-motion-gallery/styles.css" once in your app shell.'];
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

// src/generate.ts
function generateGalleryComponent(args) {
  const demoId = args.demoId ?? inferPrimaryDemoForPrompt(args.goal ?? "");
  const demo = getDemoCode(demoId);
  const cssModuleName = args.cssModuleName ?? demo.cssFilename;
  const tsx = renameGeneratedComponent(demo.tsx, {
    componentName: args.componentName,
    cssModuleName
  });
  return {
    demoId,
    componentName: args.componentName ?? inferExportedComponentName(tsx),
    files: {
      tsx,
      css: demo.css,
      cssModuleName,
      extraFiles: demo.extraFiles
    },
    imports: demo.imports,
    notes: demo.notes
  };
}
function inferExportedComponentName(tsx) {
  return tsx.match(/export function ([A-Za-z0-9_]+)/)?.[1] ?? "Gallery";
}
function cssModuleNameForComponent(componentPath) {
  const basename = path4.basename(componentPath).replace(/\.(tsx|jsx|ts|js)$/i, "");
  return `${basename}.module.css`;
}

// src/project.ts
import fs3 from "fs";
import path5 from "path";
var sourceExtensions = /* @__PURE__ */ new Set([".js", ".jsx", ".ts", ".tsx"]);
var ignoredDirectories = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  "storybook-static"
]);
function resolveInsideRoot(projectRoot, targetPath) {
  const root = path5.resolve(projectRoot);
  const resolved = path5.resolve(root, targetPath);
  const relative = path5.relative(root, resolved);
  if (relative === "" || !relative.startsWith("..") && !path5.isAbsolute(relative)) {
    return resolved;
  }
  throw new Error(`Refusing to write outside projectRoot: ${targetPath}`);
}
function detectProject(projectRoot) {
  const root = path5.resolve(projectRoot);
  const packageJsonPath = path5.join(root, "package.json");
  const packageJson = readJsonObject(packageJsonPath);
  const dependencies = objectRecord(packageJson?.dependencies);
  const devDependencies = objectRecord(packageJson?.devDependencies);
  const allDeps = { ...dependencies, ...devDependencies };
  const files = listSourceFiles(root, 400);
  const hasRmgStylesImport = files.some(
    (file) => fs3.readFileSync(file, "utf8").includes("react-motion-gallery/styles.css")
  );
  const usesCssModules = files.some((file) => file.endsWith(".module.css"));
  return {
    root,
    kind: detectProjectKind(allDeps),
    packageJsonPath: fs3.existsSync(packageJsonPath) ? packageJsonPath : null,
    dependencies,
    devDependencies,
    reactVersion: allDeps.react ?? null,
    hasReactMotionGallery: Boolean(allDeps["react-motion-gallery"]),
    hasRmgStylesImport,
    hasVideoPeers: Boolean(allDeps.plyr && allDeps["plyr-react"]),
    usesCssModules
  };
}
function auditProject(projectRoot) {
  const project = detectProject(projectRoot);
  const findings = [];
  if (!project.packageJsonPath) {
    findings.push({
      severity: "error",
      code: "missing-package-json",
      message: "No package.json was found at projectRoot."
    });
  }
  if (!project.hasReactMotionGallery) {
    findings.push({
      severity: "error",
      code: "missing-react-motion-gallery",
      message: "Install react-motion-gallery before using generated examples."
    });
  }
  if (!project.hasRmgStylesImport) {
    findings.push({
      severity: "warning",
      code: "missing-rmg-styles",
      message: 'Import "react-motion-gallery/styles.css" once in the app shell or global client entry.'
    });
  }
  const files = listSourceFiles(project.root, 500);
  const rmgFiles = files.filter(
    (file) => fs3.readFileSync(file, "utf8").includes("react-motion-gallery")
  );
  const videoLikely = rmgFiles.some((file) => /Video|kind:\s*"video"|youtube|vimeo/i.test(fs3.readFileSync(file, "utf8")));
  if (videoLikely && !project.hasVideoPeers) {
    findings.push({
      severity: "warning",
      code: "missing-video-peers",
      message: "Video integrations need optional peer dependencies plyr and plyr-react."
    });
  }
  if (project.kind === "next") {
    for (const file of rmgFiles) {
      const content = fs3.readFileSync(file, "utf8");
      if (usesInteractiveGallery(content) && !hasUseClientDirective(content)) {
        findings.push({
          severity: "warning",
          code: "next-use-client",
          file: path5.relative(project.root, file),
          message: 'This Next.js file imports interactive gallery surfaces but does not start with "use client".'
        });
      }
    }
  }
  if (findings.length === 0) {
    findings.push({
      severity: "info",
      code: "audit-clean",
      message: "No React Motion Gallery integration issues were found in the scanned files."
    });
  }
  return { project, findings };
}
function writeGalleryFiles(args) {
  const componentTarget = resolveInsideRoot(args.projectRoot, args.componentPath);
  const files = [
    {
      path: componentTarget,
      relativePath: path5.relative(path5.resolve(args.projectRoot), componentTarget),
      code: args.tsx
    }
  ];
  if (args.cssPath && args.css !== void 0) {
    const cssTarget = resolveInsideRoot(args.projectRoot, args.cssPath);
    files.push({
      path: cssTarget,
      relativePath: path5.relative(path5.resolve(args.projectRoot), cssTarget),
      code: args.css
    });
  }
  for (const extraFile of args.extraFiles ?? []) {
    const extraTarget = resolveInsideRoot(
      args.projectRoot,
      path5.join(path5.dirname(args.componentPath), extraFile.path)
    );
    files.push({
      path: extraTarget,
      relativePath: path5.relative(path5.resolve(args.projectRoot), extraTarget),
      code: extraFile.code
    });
  }
  if (args.apply) {
    for (const file of files) {
      fs3.mkdirSync(path5.dirname(file.path), { recursive: true });
      fs3.writeFileSync(file.path, `${file.code.trimEnd()}
`);
    }
  }
  return {
    applied: Boolean(args.apply),
    files: files.map((file) => ({
      path: file.relativePath,
      bytes: Buffer.byteLength(file.code)
    }))
  };
}
function listSourceFiles(root, maxFiles) {
  const files = [];
  walk(root, files, maxFiles);
  return files;
}
function walk(currentPath, files, maxFiles) {
  if (files.length >= maxFiles || !fs3.existsSync(currentPath)) {
    return;
  }
  const stat = fs3.statSync(currentPath);
  if (stat.isFile()) {
    if (sourceExtensions.has(path5.extname(currentPath)) || currentPath.endsWith(".module.css")) {
      files.push(currentPath);
    }
    return;
  }
  if (!stat.isDirectory()) {
    return;
  }
  const basename = path5.basename(currentPath);
  if (ignoredDirectories.has(basename)) {
    return;
  }
  for (const child of fs3.readdirSync(currentPath)) {
    walk(path5.join(currentPath, child), files, maxFiles);
    if (files.length >= maxFiles) {
      return;
    }
  }
}
function readJsonObject(filePath) {
  if (!fs3.existsSync(filePath)) {
    return null;
  }
  try {
    const parsed = JSON.parse(fs3.readFileSync(filePath, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function objectRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter((entry) => typeof entry[1] === "string")
  );
}
function detectProjectKind(dependencies) {
  if (dependencies.next) return "next";
  if (dependencies.vite || dependencies["@vitejs/plugin-react"]) return "vite";
  if (dependencies.react) return "react";
  return "unknown";
}
function hasUseClientDirective(source) {
  const trimmed = source.trimStart();
  return trimmed.startsWith('"use client"') || trimmed.startsWith("'use client'");
}
function usesInteractiveGallery(source) {
  return /Slider|Grid|Masonry|Entries|useFullscreenController|ThumbnailSlider|ZoomPanImage|Video|Skeleton/.test(
    source
  );
}

// src/recommend.ts
function recommendPattern(args) {
  const goal = args.goal.trim();
  const searchText = [
    goal,
    args.layout ?? "",
    ...args.features ?? [],
    ...args.mediaKinds ?? []
  ].join(" ").toLowerCase();
  const requestedFeatures = /* @__PURE__ */ new Set(
    [...tokens(searchText), ...(args.features ?? []).map((feature) => feature.toLowerCase())]
  );
  const components = scoreComponents(searchText, args.layout).slice(0, 5);
  const demos = scoreDemos(searchText, requestedFeatures, args.layout).slice(0, args.limit ?? 5);
  const install = buildInstallAdvice(searchText, args.mediaKinds ?? []);
  const gotchas = buildGotchas(searchText, args.framework);
  return {
    goal,
    recommendedComponents: components.map(({ component, score }) => ({
      ...component,
      score
    })),
    recommendedDemos: demos.map(({ demo, score }) => ({
      ...serializeDemoMetadata(demo),
      score
    })),
    install,
    gotchas,
    nextSteps: [
      "Call get_demo with the best demoId to inspect production-ready TSX and CSS.",
      "Call generate_gallery_component to rename the example for your app.",
      "Call write_gallery_files with apply: true only after reviewing the generated files."
    ]
  };
}
function searchDemos(args) {
  const tags = new Set((args.tags ?? []).map((tag) => tag.toLowerCase()));
  const query = args.query?.toLowerCase().trim() ?? "";
  const component = args.component?.toLowerCase().trim() ?? "";
  const mediaKind = args.mediaKind ?? "any";
  const demos = getDemoCatalog().map((demo) => ({ demo, score: scoreDemoForSearch(demo, { tags, query, component, mediaKind }) })).filter(({ demo, score }) => {
    if (args.category && demo.categoryId !== args.category) {
      return false;
    }
    return score > 0 || !query && tags.size === 0 && !component && mediaKind === "any";
  }).sort((a, b) => b.score - a.score || a.demo.id.localeCompare(b.demo.id)).slice(0, args.limit ?? 20);
  return demos.map(({ demo, score }) => ({
    ...serializeDemoMetadata(demo),
    score
  }));
}
function scoreComponents(searchText, layout) {
  return componentCatalog.map((component) => {
    let score = 0;
    const haystack = [
      component.id,
      component.name,
      component.description,
      component.importPath,
      ...component.exports,
      ...component.whenToUse,
      ...component.relatedTags
    ].join(" ").toLowerCase();
    for (const token of tokens(searchText)) {
      if (haystack.includes(token)) score += 2;
      if (component.relatedTags.includes(token)) score += 3;
    }
    if (layout && layout !== "any" && component.categoryIds.includes(layout)) {
      score += 6;
    }
    return { component, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.component.id.localeCompare(b.component.id));
}
function scoreDemos(searchText, requestedFeatures, layout) {
  return getDemoCatalog().map((demo) => {
    let score = 0;
    const haystack = [demo.id, demo.title, demo.eyebrow, demo.categoryId, ...demo.tags].join(" ").toLowerCase();
    for (const token of tokens(searchText)) {
      if (haystack.includes(token)) score += 2;
    }
    for (const tag of demo.tags) {
      if (requestedFeatures.has(tag.toLowerCase())) score += 4;
    }
    if (layout && layout !== "any" && demo.categoryId === layout) {
      score += 8;
    }
    if (searchText.includes("video") && demo.tags.some((tag) => /video|html5|youtube|vimeo/i.test(tag))) {
      score += 6;
    }
    if (searchText.includes("thumbnail") && demo.tags.includes("thumbnails")) score += 6;
    if (searchText.includes("fullscreen") && demo.tags.includes("fullscreen")) score += 5;
    if (searchText.includes("skeleton") && demo.tags.includes("skeleton")) score += 5;
    return { demo, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.demo.id.localeCompare(b.demo.id));
}
function scoreDemoForSearch(demo, args) {
  let score = 1;
  const haystack = [demo.id, demo.title, demo.eyebrow, demo.categoryId, ...demo.tags].join(" ").toLowerCase();
  if (args.query) {
    score = haystack.includes(args.query) ? score + 8 : 0;
    for (const token of tokens(args.query)) {
      if (haystack.includes(token)) score += 2;
    }
  }
  for (const tag of args.tags) {
    if (demo.tags.map((demoTag) => demoTag.toLowerCase()).includes(tag)) {
      score += 6;
    } else {
      score = 0;
    }
  }
  if (args.component && !haystack.includes(args.component)) {
    score = 0;
  } else if (args.component) {
    score += 5;
  }
  if (args.mediaKind === "video") {
    score += /video|html5|youtube|vimeo/.test(haystack) ? 8 : -5;
  }
  return score;
}
function buildInstallAdvice(searchText, mediaKinds) {
  const needsVideoPeers = searchText.includes("video") || mediaKinds.includes("video") || searchText.includes("youtube") || searchText.includes("vimeo");
  return {
    package: "npm install react-motion-gallery",
    stylesheet: 'import "react-motion-gallery/styles.css";',
    optionalVideoPeers: needsVideoPeers ? "npm install plyr plyr-react" : null,
    license: "The package currently declares PolyForm-Noncommercial; revenue use requires the commercial license linked from the package metadata."
  };
}
function buildGotchas(searchText, framework) {
  const gotchas = [
    "Use public package imports, not repo-local demo imports.",
    "Prefer subpath imports for narrow integrations; use the root import when a component needs several gallery surfaces."
  ];
  if (framework === "next") {
    gotchas.push('Interactive gallery components should live in a "use client" component.');
  }
  if (searchText.includes("fullscreen")) {
    gotchas.push("Fullscreen integrations need GalleryCore plus useFullscreenController.");
  }
  if (searchText.includes("skeleton")) {
    gotchas.push("Browser-measured skeleton text sidecars should be regenerated when copy or layout changes.");
  }
  return gotchas;
}
function tokens(value) {
  return value.toLowerCase().split(/[^a-z0-9]+/g).filter((token) => token.length >= 3);
}

// src/skeleton.ts
import fs4 from "fs";
import path6 from "path";
function scaffoldSkeletonText(args) {
  if (args.targets.length === 0) {
    throw new Error("scaffold_skeleton_text requires at least one target.");
  }
  const manifest = {
    url: args.url,
    outputFile: args.outputFile,
    moduleExportName: args.moduleExportName,
    viewportMin: args.viewportMin ?? 320,
    viewportMax: args.viewportMax ?? 1600,
    viewportHeight: args.viewportHeight ?? 1800,
    viewportWorkers: 1,
    settleMs: 120,
    stableGeometryFrames: 3,
    lineWrapGuardPx: 0,
    includeTextMetrics: args.includeTextMetrics ?? true,
    breakpointStrategy: args.breakpointStrategy ?? "lineChanges",
    barWidthUnit: args.barWidthUnit ?? "px",
    responsiveBy: args.responsiveBy ?? "viewport",
    targets: args.targets.map((target) => ({
      exportName: target.exportName,
      selector: target.selector,
      ...target.widthMode ? { widthMode: target.widthMode } : {},
      ...target.barHeight ? { barHeight: target.barHeight } : {},
      ...target.lineHeight ? { lineHeight: target.lineHeight } : {}
    }))
  };
  const targetPath = resolveInsideRoot(args.projectRoot, args.manifestPath);
  const code = `${JSON.stringify(manifest, null, 2)}
`;
  if (args.apply) {
    fs4.mkdirSync(path6.dirname(targetPath), { recursive: true });
    fs4.writeFileSync(targetPath, code);
  }
  return {
    applied: Boolean(args.apply),
    manifestPath: path6.relative(path6.resolve(args.projectRoot), targetPath),
    manifest,
    commands: [
      `npm run --silent generate:skeleton-text-module -- --input ${args.manifestPath}`,
      `npm run --silent generate:skeleton-text-module -- --input ${args.manifestPath} --analysis-output ${args.outputFile.replace(/\.generated\.ts$/, ".measurements.json")}`
    ]
  };
}

// src/mcp.ts
var categorySchema = z.enum([
  "slider",
  "grid",
  "masonry",
  "entries",
  "zoom-pan",
  "fullscreen",
  "skeleton"
]);
var frameworkSchema = z.enum(["next", "vite", "react", "unknown"]);
function createRmgMcpServer() {
  const server2 = new McpServer({
    name: "react-motion-gallery-mcp",
    version: "0.1.0"
  });
  registerResources(server2);
  registerTools(server2);
  registerPrompts(server2);
  return server2;
}
function registerResources(server2) {
  server2.resource("component catalog", "rmg://catalog/components", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({ components: componentCatalog }, null, 2)
      }
    ]
  }));
  server2.resource("demo catalog", "rmg://catalog/demos", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(
          {
            categories: getCategoryDescriptions(),
            demos: getDemoCatalog().map(serializeDemoMetadata)
          },
          null,
          2
        )
      }
    ]
  }));
  server2.resource("install guide", "rmg://docs/install", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: [
          "# React Motion Gallery Install",
          "",
          "```bash",
          "npm install react-motion-gallery",
          "```",
          "",
          "Import `react-motion-gallery/styles.css` once in the app shell or global client entry.",
          "",
          "Install optional video peers only when using `Video`:",
          "",
          "```bash",
          "npm install plyr plyr-react",
          "```",
          "",
          "Prefer subpath imports for narrow integrations, such as `react-motion-gallery/slider`, `react-motion-gallery/grid`, and `react-motion-gallery/masonry`.",
          "",
          "The package currently declares a PolyForm-Noncommercial license; revenue use requires the commercial license linked from package metadata."
        ].join("\n")
      }
    ]
  }));
  server2.resource("skeleton text guide", "rmg://docs/skeleton-text", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: [
          "# Skeleton Text Authoring",
          "",
          "React Motion Gallery includes development-time browser measurement for text skeletons.",
          "",
          "Use `scaffold_skeleton_text` to create a manifest, then run:",
          "",
          "```bash",
          "npm run --silent generate:skeleton-text-module -- --input ./path/to/example.skeleton-text.browser.manifest.json",
          "```",
          "",
          "The workflow opens a live page, measures real DOM text across viewports, and emits line counts, bar widths, and optional text metrics for stable skeleton layouts."
        ].join("\n")
      }
    ]
  }));
  server2.resource(
    "demo example",
    new ResourceTemplate("rmg://examples/{demoId}", {
      list: async () => ({
        resources: getDemoCatalog().map((demo) => ({
          uri: `rmg://examples/${demo.id}`,
          name: demo.id,
          mimeType: "application/json",
          description: `${demo.eyebrow}: ${demo.title}`
        }))
      })
    }),
    async (uri, variables) => {
      const demoId = String(variables.demoId);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(getDemoCode(demoId), null, 2)
          }
        ]
      };
    }
  );
}
function registerTools(server2) {
  server2.tool(
    "search_demos",
    "Filter React Motion Gallery demos by category, tags, component, media kind, or query.",
    {
      category: categorySchema.optional(),
      tags: z.array(z.string()).optional(),
      component: z.string().optional(),
      mediaKind: z.enum(["image", "video", "any"]).optional(),
      query: z.string().optional(),
      limit: z.number().int().min(1).max(50).optional()
    },
    async (args) => jsonContent({ demos: searchDemos(args) })
  );
  server2.tool(
    "get_demo",
    "Return consumer-ready TSX/CSS for a specific React Motion Gallery demo.",
    {
      demoId: z.string(),
      includeExtraFiles: z.boolean().optional()
    },
    async ({ demoId, includeExtraFiles }) => {
      const demo = getDemoCode(demoId);
      return jsonContent({
        ...demo,
        extraFiles: includeExtraFiles === false ? [] : demo.extraFiles
      });
    }
  );
  server2.tool(
    "recommend_pattern",
    "Map requirements to React Motion Gallery components, demos, imports, and gotchas.",
    {
      goal: z.string(),
      layout: categorySchema.or(z.literal("any")).optional(),
      features: z.array(z.string()).optional(),
      mediaKinds: z.array(z.enum(["image", "video", "node"])).optional(),
      framework: frameworkSchema.optional(),
      limit: z.number().int().min(1).max(10).optional()
    },
    async (args) => jsonContent(recommendPattern(args))
  );
  server2.tool(
    "generate_gallery_component",
    "Generate TSX/CSS from a selected demo or from a goal that can be matched to a demo.",
    {
      demoId: z.string().optional(),
      goal: z.string().optional(),
      componentName: z.string().regex(/^[A-Z][A-Za-z0-9_]*$/).optional(),
      cssModuleName: z.string().optional()
    },
    async (args) => jsonContent(generateGalleryComponent(args))
  );
  server2.tool(
    "write_gallery_files",
    "Write generated gallery files under a project root. Defaults to dry run unless apply is true.",
    {
      projectRoot: z.string(),
      componentPath: z.string(),
      cssPath: z.string().optional(),
      tsx: z.string().optional(),
      css: z.string().optional(),
      demoId: z.string().optional(),
      componentName: z.string().regex(/^[A-Z][A-Za-z0-9_]*$/).optional(),
      apply: z.boolean().optional()
    },
    async (args) => {
      const generated = args.tsx !== void 0 ? {
        files: {
          tsx: args.tsx,
          css: args.css ?? "",
          cssModuleName: args.cssPath ? cssModuleNameForComponent(args.cssPath) : void 0,
          extraFiles: []
        },
        notes: []
      } : generateGalleryComponent({
        demoId: args.demoId,
        componentName: args.componentName,
        cssModuleName: args.cssPath ? cssModuleNameForComponent(args.cssPath) : void 0
      });
      const result = writeGalleryFiles({
        projectRoot: args.projectRoot,
        componentPath: args.componentPath,
        cssPath: args.cssPath,
        tsx: generated.files.tsx,
        css: args.css ?? generated.files.css,
        extraFiles: generated.files.extraFiles,
        apply: args.apply
      });
      return jsonContent({
        ...result,
        notes: generated.notes
      });
    }
  );
  server2.tool(
    "audit_project",
    "Inspect a React app for React Motion Gallery install, stylesheet, peer dependency, and Next.js client-component issues.",
    {
      projectRoot: z.string()
    },
    async ({ projectRoot }) => jsonContent(auditProject(projectRoot))
  );
  server2.tool(
    "scaffold_skeleton_text",
    "Create a browser skeleton text manifest and regeneration commands for the existing RMG skeleton workflow.",
    {
      projectRoot: z.string(),
      manifestPath: z.string(),
      url: z.string(),
      outputFile: z.string(),
      moduleExportName: z.string(),
      viewportMin: z.number().int().min(1).optional(),
      viewportMax: z.number().int().min(1).optional(),
      viewportHeight: z.number().int().min(1).optional(),
      responsiveBy: z.enum(["viewport", "container"]).optional(),
      breakpointStrategy: z.enum(["lineChanges", "lineOrBarChanges"]).optional(),
      barWidthUnit: z.enum(["px", "percent"]).optional(),
      includeTextMetrics: z.boolean().optional(),
      targets: z.array(
        z.object({
          exportName: z.string(),
          selector: z.string(),
          widthMode: z.enum(["barWidth", "lastBarWidth", "both"]).optional(),
          barHeight: z.number().optional(),
          lineHeight: z.number().optional()
        })
      ),
      apply: z.boolean().optional()
    },
    async (args) => jsonContent(scaffoldSkeletonText(args))
  );
}
function registerPrompts(server2) {
  server2.prompt(
    "design_gallery_integration",
    {
      appContext: z.string(),
      desiredExperience: z.string(),
      framework: frameworkSchema.optional()
    },
    ({ appContext, desiredExperience, framework }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Design a React Motion Gallery integration.",
              "",
              `App context: ${appContext}`,
              `Desired experience: ${desiredExperience}`,
              `Framework: ${framework ?? "unknown"}`,
              "",
              "Decide the best layout surface, whether GalleryCore/fullscreen is needed, which demos to inspect, what imports and CSS are required, and whether skeleton text measurement should be scaffolded."
            ].join("\n")
          }
        }
      ]
    })
  );
  server2.prompt(
    "convert_existing_gallery_to_rmg",
    {
      currentCodeSummary: z.string(),
      migrationGoal: z.string(),
      framework: frameworkSchema.optional()
    },
    ({ currentCodeSummary, migrationGoal, framework }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Migrate an existing gallery implementation to React Motion Gallery.",
              "",
              `Current code summary: ${currentCodeSummary}`,
              `Migration goal: ${migrationGoal}`,
              `Framework: ${framework ?? "unknown"}`,
              "",
              "Recommend the closest RMG component pattern, list required install/style changes, identify files to change, and preserve existing media data and visual behavior where practical."
            ].join("\n")
          }
        }
      ]
    })
  );
}

// src/server.ts
var server = createRmgMcpServer();
var transport = new StdioServerTransport();
await server.connect(transport);
