import fs from "node:fs";
import path from "node:path";

import { repoPath, toPosixPath } from "./paths.js";
import type { ComponentSurface, DemoCategoryId, DemoMetadata } from "./types.js";

export const componentCatalog: ComponentSurface[] = [
  {
    id: "slider",
    name: "Slider",
    importPath: "react-motion-gallery/slider",
    exports: ["Slider", "useSliderReady", "createSliderIndexChannel"],
    categoryIds: ["slider"],
    description:
      "Small core carousel primitive for child slides, drag, wheel, snapping, grouped cells, loop, and shared index state.",
    whenToUse: [
      "Use for horizontal or vertical galleries where one active position matters.",
      "Use with ThumbnailSlider or createSliderIndexChannel when separate controls need to stay in sync.",
      "Import first-party plugins from granular subpaths such as react-motion-gallery/slider/arrows, /dots, /auto-height, /parallax, or /fullscreen when you need one feature.",
      "Wrap with standalone Skeleton plus useSliderReady when you need structured slider skeletons or restore.",
    ],
    relatedTags: [
      "slider",
      "loop",
      "center",
      "group-cells",
      "free-scroll",
      "wheel",
      "plugins",
    ],
  },
  {
    id: "grid",
    name: "Grid",
    importPath: "react-motion-gallery/grid",
    exports: ["Grid"],
    categoryIds: ["grid"],
    description:
      "Responsive media grid with spans, template columns, lazy loading, skeletons, and fullscreen item handoffs.",
    whenToUse: [
      "Use for predictable editorial or product grids.",
      "Use templateColumns when track proportions matter more than a plain column count.",
    ],
    relatedTags: ["grid", "span", "template-columns", "responsive"],
  },
  {
    id: "masonry",
    name: "Masonry",
    importPath: "react-motion-gallery/masonry",
    exports: ["Masonry"],
    categoryIds: ["masonry"],
    description:
      "Server-predicted masonry layout that keeps placement stable through hydration, then refines from live measurements.",
    whenToUse: [
      "Use for mixed aspect ratios or cards with uneven text/media heights.",
      "Choose placement mode based on whether balance, round-robin order, or horizontal visual order matters most.",
    ],
    relatedTags: ["masonry", "balanced", "round-robin", "horizontal-order", "span"],
  },
  {
    id: "entries",
    name: "Entries",
    importPath: "react-motion-gallery/entries",
    exports: ["Entries", "flattenEntries"],
    categoryIds: ["entries"],
    description:
      "Structured content renderer for rows with section text, body copy, media, metadata, and slider/grid/masonry media layouts.",
    whenToUse: [
      "Use when the data model is an editorial entry rather than loose child nodes.",
      "Use when text and media need coordinated fullscreen overlays.",
    ],
    relatedTags: ["entries", "slider", "grid", "masonry", "fullscreen"],
  },
  {
    id: "fullscreen",
    name: "Fullscreen",
    importPath: "react-motion-gallery/fullscreen",
    exports: ["useFullscreenController"],
    categoryIds: ["fullscreen", "slider", "grid", "masonry", "entries"],
    description:
      "Small fullscreen controller hook. Add fullscreenSlider for the runtime, rich media plugins for captions, zoom/pan, video, and lazy media, plus option plugins for controls, crossfade, and thumbnail bridge behavior.",
    whenToUse: [
      "Use inside GalleryCore when gallery media should expand into a fullscreen slider.",
      "Use layout-agnostic mode for custom cards or buttons that open fullscreen media directly.",
      "Import at least one fullscreen runtime plugin, usually fullscreenSlider from react-motion-gallery/fullscreen/slider.",
    ],
    relatedTags: ["fullscreen", "captions", "overlay", "lazy-load", "scale"],
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
      "fullscreenThumbnails",
    ],
    categoryIds: ["fullscreen"],
    description:
      "First-party fullscreen plugin factories. fullscreenSlider mounts the base runtime; rich media plugins add only the fullscreen behavior a route uses.",
    whenToUse: [
      "Use fullscreenSlider() to mount the fullscreen runtime.",
      "Add fullscreenZoomPan(), fullscreenVideo(), fullscreenCaptions(), or fullscreenLazyLoad() only when that route needs richer fullscreen media runtime.",
      "Add fullscreenCrossfade() only when that route needs crossfade navigation behavior.",
    ],
    relatedTags: ["fullscreen", "plugins", "captions", "video", "lazy-load", "crossfade"],
  },
  {
    id: "thumbnails",
    name: "ThumbnailSlider",
    importPath: "react-motion-gallery/thumbnails",
    exports: ["ThumbnailSlider", "createThumbnailSyncBridge"],
    categoryIds: ["slider", "fullscreen"],
    description:
      "Thumbnail rail primitive that can sync with a base Slider or fullscreen thumbnail bridge.",
    whenToUse: [
      "Use when a gallery needs direct visual navigation.",
      "Pair with createSliderIndexChannel for base slider synchronization.",
    ],
    relatedTags: ["thumbnails", "navigation", "sync"],
  },
  {
    id: "fullscreen-thumbnails",
    name: "FullscreenThumbnailSlider",
    importPath: "react-motion-gallery/fullscreenThumbnails",
    exports: ["FullscreenThumbnailSlider"],
    categoryIds: ["fullscreen"],
    description:
      "Thumbnail rail that follows the fullscreen controller bridge and can sit beside or under fullscreen media.",
    whenToUse: [
      "Use when fullscreen mode needs its own thumbnail navigation.",
      "Use with the fullscreenThumbnailBridge returned by useFullscreenController.",
    ],
    relatedTags: ["fullscreen-thumbnails", "thumbnails", "sync"],
  },
  {
    id: "video",
    name: "Video",
    importPath: "react-motion-gallery/video",
    exports: ["Video"],
    categoryIds: ["slider", "grid", "masonry", "entries"],
    description:
      "Gallery-ready video primitive for HTML5, YouTube, and Vimeo media backed by optional Plyr peers.",
    whenToUse: [
      "Use for video slides or media cards where player controls need gallery coordination.",
      "Install plyr and plyr-react only when the app uses Video.",
    ],
    relatedTags: ["video", "html5", "youtube", "vimeo"],
    optionalPeerDependencies: ["plyr", "plyr-react"],
  },
  {
    id: "zoom-pan",
    name: "ZoomPanImage",
    importPath: "react-motion-gallery/zoomPan",
    exports: ["ZoomPanImage"],
    categoryIds: ["zoom-pan", "slider", "grid", "masonry"],
    description:
      "Standalone zoomable image surface with click zoom, drag pan, ctrl-wheel zoom, and touch pinch.",
    whenToUse: [
      "Use for cropped images that should be inspectable without opening fullscreen.",
      "Use inside Slider, Grid, or Masonry when per-image zoom is the primary interaction.",
    ],
    relatedTags: ["zoom-pan", "image", "crop"],
  },
  {
    id: "skeleton",
    name: "Skeleton",
    importPath: "react-motion-gallery/skeleton/base",
    exports: ["Skeleton"],
    categoryIds: ["skeleton"],
    description:
      "Standalone and wrapper skeleton renderer with structured rect/text layouts, shimmer, timing, and browser-measured text support.",
    whenToUse: [
      "Use standalone Skeleton when loading UI is not tied to a gallery layout.",
      "Use react-motion-gallery/skeleton/slider, /grid, or /masonry for gallery-specific structured skeletons.",
    ],
    relatedTags: ["skeleton", "text", "responsive", "container-query", "force"],
  },
  {
    id: "core",
    name: "GalleryCore",
    importPath: "react-motion-gallery/core",
    exports: ["GalleryCore", "useGalleryCore"],
    categoryIds: ["slider", "grid", "masonry", "entries", "fullscreen"],
    description:
      "Shared state boundary for fullscreen-aware galleries, normalized fullscreen items, breakpoints, and programmatic opening.",
    whenToUse: [
      "Wrap layouts in GalleryCore when using fullscreen.",
      "Use useGalleryCore for custom fullscreen triggers or related controls.",
    ],
    relatedTags: ["gallery-api", "openFullscreenAt", "fullscreen"],
  },
  {
    id: "media",
    name: "Media helpers",
    importPath: "react-motion-gallery/media",
    exports: ["toMediaItems"],
    categoryIds: ["slider", "grid", "masonry", "entries"],
    description:
      "Normalization helpers for image, video, node, and string URL media inputs.",
    whenToUse: [
      "Use toMediaItems when examples or app data mix strings and structured media objects.",
    ],
    relatedTags: ["media", "image", "video"],
  },
];

const categoryDescriptions: Record<DemoCategoryId, string> = {
  slider:
    "Motion-first slider demos covering loop, axis, granular plugins, effects, thumbnails, video, API mutation, and Skeleton-owned loading.",
  grid:
    "Responsive grid demos for spans, template tracks, min column width, lazy loading, video, fullscreen, and skeletons.",
  masonry:
    "Masonry demos for balanced, round-robin, horizontal order, spans, video, fullscreen, and stable skeleton loading.",
  entries:
    "Structured entry demos that combine copy, metadata, media, and slider/grid/masonry renderers.",
  "zoom-pan":
    "Standalone and embedded zoom/pan image demos for cropped inspection surfaces.",
  fullscreen:
    "Fullscreen controller demos for custom triggers, captions, overlays, thumbnails, effects, and lazy media.",
  skeleton:
    "Standalone skeleton demos for app shells, cards, responsive text, and forced overlays.",
};

let memoizedDemos: DemoMetadata[] | null = null;

export function getCategoryDescriptions() {
  return categoryDescriptions;
}

export function getDemoCatalog(): DemoMetadata[] {
  if (memoizedDemos) {
    return memoizedDemos;
  }

  const parsed = parseDemoRegistry();
  memoizedDemos = parsed.length > 0 ? parsed : discoverDemoFiles();
  return memoizedDemos;
}

export function getDemoById(demoId: string) {
  return getDemoCatalog().find((demo) => demo.id === demoId) ?? null;
}

export function findComponentSurface(value: string) {
  const normalized = value.toLowerCase();
  return (
    componentCatalog.find(
      (component) =>
        component.id === normalized ||
        component.name.toLowerCase() === normalized ||
        component.exports.some((exportName) => exportName.toLowerCase() === normalized)
    ) ?? null
  );
}

function parseDemoRegistry(): DemoMetadata[] {
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

  const demos: DemoMetadata[] = [];
  const objectPattern = /\{\s*id:\s*"([^"]+)"([\s\S]*?)\n\s*\},/g;

  for (const match of demosBlock.matchAll(objectPattern)) {
    const id = match[1]!;
    const body = match[2]!;
    const title = extractStringField(body, "title") ?? id;
    const eyebrow = extractStringField(body, "eyebrow") ?? title;
    const categoryId = extractStringField(body, "categoryId") as DemoCategoryId | null;

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
      sourcePath: path.join(demoPath, "source.ts"),
      cssPath: path.join(demoPath, "css.ts"),
      sourceFilename,
      cssFilename,
    });
  }

  return demos;
}

function discoverDemoFiles(): DemoMetadata[] {
  const demosRoot = repoPath("apps", "marketing", "app", "demos");
  if (!fs.existsSync(demosRoot)) {
    return [];
  }

  const demos: DemoMetadata[] = [];
  for (const categoryId of Object.keys(categoryDescriptions) as DemoCategoryId[]) {
    const categoryPath = path.join(demosRoot, categoryId);
    if (!fs.existsSync(categoryPath)) {
      continue;
    }

    for (const slug of fs.readdirSync(categoryPath)) {
      const demoPath = path.join(categoryPath, slug);
      const sourcePath = path.join(demoPath, "source.ts");
      const cssPath = path.join(demoPath, "css.ts");
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
        cssFilename: `${id}-demo.module.css`,
      });
    }
  }

  return demos.sort((a, b) => a.id.localeCompare(b.id));
}

function demoDirectoryFor(categoryId: DemoCategoryId, id: string) {
  const prefix = `${categoryId}-`;
  const slug = categoryId === "zoom-pan" && id.startsWith(prefix) ? id.slice(prefix.length) : id;
  return repoPath("apps", "marketing", "app", "demos", categoryId, slug);
}

function extractStringField(source: string, fieldName: string) {
  return source.match(new RegExp(`${fieldName}:\\s*"([^"]+)"`))?.[1] ?? null;
}

function extractStringArrayField(source: string, fieldName: string) {
  const body = source.match(new RegExp(`${fieldName}:\\s*\\[([^\\]]*)\\]`))?.[1] ?? "";
  return [...body.matchAll(/"([^"]+)"/g)].map((match) => match[1]!);
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function serializeDemoMetadata(demo: DemoMetadata) {
  return {
    ...demo,
    demoPath: toPosixPath(path.relative(repoPath(), demo.demoPath)),
    sourcePath: toPosixPath(path.relative(repoPath(), demo.sourcePath)),
    cssPath: toPosixPath(path.relative(repoPath(), demo.cssPath)),
  };
}
