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
    exports: [
      "Grid",
      "gridPagination",
      "gridLoadMore",
      "gridInfiniteScroll",
      "gridVirtualization"
    ],
    categoryIds: ["grid"],
    description: "Responsive media grid with spans, template columns, skeletons, fullscreen item handoffs, and child-list data plugins.",
    whenToUse: [
      "Use for predictable editorial or product grids.",
      "Use templateColumns when track proportions matter more than a plain column count.",
      "Add gridLazyLoad from react-motion-gallery/grid/lazy-load only when the route needs lazy media.",
      "Add gridFullscreen from react-motion-gallery/grid/fullscreen when Grid should open GalleryCore fullscreen.",
      "Add gridPagination, gridLoadMore, gridInfiniteScroll, or gridVirtualization from granular grid subpaths when child items come from dynamic data."
    ],
    relatedTags: [
      "grid",
      "span",
      "template-columns",
      "responsive",
      "plugins",
      "pagination",
      "load-more",
      "infinite-scroll",
      "virtualization"
    ]
  },
  {
    id: "masonry",
    name: "Masonry",
    importPath: "react-motion-gallery/masonry",
    exports: [
      "Masonry",
      "masonryPagination",
      "masonryLoadMore",
      "masonryInfiniteScroll",
      "masonryVirtualization"
    ],
    categoryIds: ["masonry"],
    description: "Lightweight dimensioned masonry layout for image-first grids, with opt-in fullscreen, data plugins, and measured subpaths for arbitrary card heights.",
    whenToUse: [
      "Use the default import for image grids where every item has width and height.",
      "Add masonryFullscreen from react-motion-gallery/masonry/fullscreen when light masonry should open GalleryCore fullscreen.",
      "Use react-motion-gallery/masonry/measured for mixed text/media cards with arbitrary heights.",
      "Choose placement mode based on whether balance, round-robin order, or horizontal visual order matters most.",
      "Add masonryLazyLoad from react-motion-gallery/masonry/lazy-load only with measured masonry routes that need lazy media.",
      "Add masonryPagination, masonryLoadMore, masonryInfiniteScroll, or masonryVirtualization from granular masonry subpaths for dynamic child data; the same plugins work with measured masonry."
    ],
    relatedTags: [
      "masonry",
      "balanced",
      "round-robin",
      "horizontal-order",
      "span",
      "plugins",
      "pagination",
      "load-more",
      "infinite-scroll",
      "virtualization"
    ]
  },
  {
    id: "entries",
    name: "Entries",
    importPath: "react-motion-gallery/entries",
    exports: [
      "Entries",
      "flattenEntries",
      "useEntriesReady",
      "entriesPagination",
      "entriesLoadMore",
      "entriesInfiniteScroll",
      "entriesVirtualization"
    ],
    categoryIds: ["entries"],
    description: "Structured content renderer for rows with section text, body copy, media, metadata, slider/grid/masonry media layouts, data-window plugins, and readiness.",
    whenToUse: [
      "Use when the data model is an editorial entry rather than loose child nodes.",
      "Use when text and media need coordinated fullscreen overlays.",
      "Use nested slider/grid/masonry lazy-load plugins when entry media should lazy-load; Entries owns row mount/reveal gating while nested media layouts own media readiness.",
      "Use entries data plugins when users own dynamic fetching but need pagination, load-more, infinite scroll, or row virtualization."
    ],
    relatedTags: [
      "entries",
      "slider",
      "grid",
      "masonry",
      "fullscreen",
      "pagination",
      "load-more",
      "infinite-scroll",
      "virtualization"
    ]
  },
  {
    id: "rating-stars",
    name: "RatingStars",
    importPath: "react-motion-gallery/rating-stars",
    exports: ["RatingStars"],
    categoryIds: ["grid", "masonry", "entries"],
    description: "Small accessible rating display primitive for product cards, reviews, and commerce metadata.",
    whenToUse: [
      "Use when Grid, Masonry, or Entries cards need a consistent visual rating with optional review count.",
      "Use formatValue or formatReviewCount when the app has its own localization or compact count formatting."
    ],
    relatedTags: ["rating", "stars", "reviews", "products", "commerce"]
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
    id: "reveal",
    name: "Reveal",
    importPath: "react-motion-gallery/reveal",
    exports: ["Reveal", "useReveal"],
    categoryIds: ["reveal"],
    description: "Standalone fade and transform reveal primitive for page sections and application UI.",
    whenToUse: [
      "Use for entrance animations on already-rendered content.",
      "Use opacityDurationMs and transformDurationMs when fade and motion should resolve at different speeds.",
      "Use Skeleton instead when content is loading or readiness needs to gate layout handoff."
    ],
    relatedTags: ["reveal", "fade", "transform", "stagger", "intersection-observer"]
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
  grid: "Responsive grid demos for spans, template tracks, min column width, lazy-load plugins, data plugins, video, fullscreen, and skeletons.",
  masonry: "Masonry demos for the fullscreen-enabled light image core plus measured text-wrap, data plugins, video, fullscreen, and stable skeleton loading.",
  entries: "Structured entry demos that combine copy, metadata, media, slider/grid/masonry renderers, API-backed data controls, and readiness.",
  "zoom-pan": "Standalone and embedded zoom/pan image demos for cropped inspection surfaces.",
  fullscreen: "Fullscreen controller demos for custom triggers, captions, overlays, thumbnails, effects, and lazy media.",
  skeleton: "Standalone skeleton demos for app shells, cards, responsive text, and forced overlays.",
  reveal: "Standalone reveal demos for fade, transform, stagger, and section entrance motion."
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
function jsonErrorContent(value) {
  return {
    ...jsonContent(value),
    isError: true
  };
}

// src/docs.ts
import fs2 from "fs";
import path3 from "path";
var packageDocs = [
  {
    id: "readme",
    title: "React Motion Gallery README",
    uri: "rmg://docs/readme",
    path: repoPath("packages", "react-motion-gallery", "README.md"),
    whenToRead: "Use for package overview, entry points, API reference, and MCP setup examples."
  },
  {
    id: "skeleton-text-authoring",
    title: "Skeleton Text Authoring",
    uri: "rmg://docs/skeleton-text-authoring",
    path: repoPath("packages", "react-motion-gallery", "docs", "skeleton-text-authoring.md"),
    whenToRead: "Use for the browser-based measured skeleton text manifest and generator workflow."
  },
  {
    id: "public-api-inventory",
    title: "Public API Inventory",
    uri: "rmg://docs/public-api-inventory",
    path: repoPath("packages", "react-motion-gallery", "docs", "public-api-inventory.md"),
    whenToRead: "Use as the exhaustive inventory of package export paths and named public exports."
  },
  {
    id: "entries-data-plugins",
    title: "Entries Data Plugins",
    uri: "rmg://docs/entries-data-plugins",
    path: repoPath("packages", "react-motion-gallery", "docs", "entries-data-plugins.md"),
    whenToRead: "Use for Entries pagination, items-per-page controls, session storage, load-more, infinite scroll, virtualization, URL sync, and data-window behavior."
  },
  {
    id: "grid-masonry-data-plugins",
    title: "Grid And Masonry Data Plugins",
    uri: "rmg://docs/grid-masonry-data-plugins",
    path: repoPath("packages", "react-motion-gallery", "docs", "grid-masonry-data-plugins.md"),
    whenToRead: "Use for Grid and Masonry pagination, items-per-page controls, session storage, load-more, infinite scroll, virtualization, and child-window behavior."
  },
  {
    id: "skeleton-text-codex-prompt",
    title: "Skeleton Text AI Agent Prompt",
    uri: "rmg://docs/skeleton-text-codex-prompt",
    path: repoPath("packages", "react-motion-gallery", "docs", "skeleton-text-codex-prompt.md"),
    whenToRead: "Use when instructing an AI agent to add or update measured skeleton text."
  },
  {
    id: "license",
    title: "License",
    uri: "rmg://docs/license",
    path: repoPath("packages", "react-motion-gallery", "LICENSE.md"),
    whenToRead: "Use for package license terms."
  },
  {
    id: "third-party-notices",
    title: "Third Party Notices",
    uri: "rmg://docs/third-party-notices",
    path: repoPath("packages", "react-motion-gallery", "THIRD_PARTY_NOTICES.md"),
    whenToRead: "Use for bundled third-party license notices."
  }
];
function listPackageDocs() {
  return packageDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    uri: doc.uri,
    path: toPosixPath(path3.relative(repoPath(), doc.path)),
    whenToRead: doc.whenToRead
  }));
}
function listPackageDocResources() {
  return packageDocs.map((doc) => ({
    uri: doc.uri,
    name: doc.title,
    mimeType: "text/markdown",
    description: doc.whenToRead
  }));
}
function readPackageDoc(docId) {
  const doc = packageDocs.find((candidate) => candidate.id === docId);
  if (!doc) {
    throw new Error(`Unknown React Motion Gallery doc: ${docId}`);
  }
  return fs2.readFileSync(doc.path, "utf8");
}
function agentBriefGuide() {
  return [
    "# React Motion Gallery MCP Agent Brief",
    "",
    "Start by classifying the user's request as layout intent plus loading fidelity.",
    "",
    "1. Call `classify_gallery_workflow` with the user's goal.",
    "2. Read the recommended guide resources returned by the classifier.",
    "3. Use `recommend_pattern`, `search_demos`, and `get_demo` to choose examples.",
    "4. Only use `scaffold_skeleton_text` when the workflow calls for browser-measured skeleton text.",
    "5. Before applying browser-measured skeleton scaffolds, call `probe_render_context` for the live URL, viewport, and required selectors, then pass the returned `receiptId` as `renderReceiptId`.",
    "6. For file writing, keep dry-run output until generated files have been reviewed; pass `apply: true` only when writing is intended.",
    "7. For production skeletons with responsive or browser-measured text, read `rmg://guides/skeleton-cache` and consider the cookie snapshot cache so SSR can reuse active text/geometry values on reload.",
    "",
    "Browser-measured skeleton text applies to any real rendered DOM text: sliders, grids, masonry, entries, thumbnails, flex layouts, app shells, cards, and custom UI. Use flat `targets` by default. Add specialized `slider`, `masonry`, or `entries` manifest metadata only when those layout modes need readiness or compensation behavior.",
    "",
    "The skeleton cookie snapshot cache is opt-in for slider skeletons. Import `SliderSkeleton` from `react-motion-gallery/skeleton/slider/restore` and pass `cache={{ key, routeKey }}`. In SSR apps, parse cookies with `react-motion-gallery/skeleton/cache` on the server, then pass snapshots through `SkeletonCacheProvider` from `react-motion-gallery/skeleton/cache/provider`."
  ].join("\n");
}
function layoutSelectionGuide() {
  return [
    "# React Motion Gallery Layout Selection",
    "",
    "- Use `Slider` for one active position, carousel navigation, grouped cells, loop, wheel, thumbnails, and slide plugins.",
    "- Use `Grid` for predictable responsive tracks, product/editorial grids, spans, and template columns.",
    "- Use default `Masonry` for dimensioned image grids; add `react-motion-gallery/masonry/fullscreen` for GalleryCore fullscreen; use `react-motion-gallery/masonry/measured` for arbitrary uneven text/card heights and structured skeleton text.",
    '- Use `Entries` when the content model is rows or cards of text, metadata, and coordinated media. Set `entries.layout` to `"list"` for stacked rows or `"grid"` for entry cards.',
    "- Use `ThumbnailSlider` or `FullscreenThumbnailSlider` when navigation should be visual.",
    "- Use `GalleryCore` and `useFullscreenController` when media should expand into fullscreen.",
    "- Use `ZoomPanImage` for inspectable cropped images without a fullscreen overlay.",
    "- Use standalone `Skeleton` for app shells, flex layouts, custom cards, and non-gallery loading UI.",
    "",
    "For custom layouts, keep the real markup ergonomic first, then choose skeleton fidelity separately. Skeleton text measurement does not require a gallery primitive; it only needs stable selectors on rendered DOM text and a live page URL."
  ].join("\n");
}
function loadingFidelityGuide() {
  return [
    "# React Motion Gallery Loading Fidelity",
    "",
    "Think of each request as layout intent plus loading fidelity.",
    "",
    "```text",
    'User goal: "Build a responsive gallery slider."',
    "Workflow: layoutOnly",
    "Use: recommend_pattern -> get_demo -> generate_gallery_component",
    "Skip: skeleton tools",
    "```",
    "",
    "```text",
    'User goal: "Build a product grid with image placeholders while loading."',
    "Workflow: layoutWithNonTextSkeleton",
    "Use: Skeleton rect/media nodes or gallery skeleton wrappers",
    "Skip: browser text measurement",
    "```",
    "",
    "```text",
    'User goal: "Build a card layout with simple text skeleton lines."',
    "Workflow: layoutWithHandAuthoredTextSkeleton",
    "Use: text skeleton nodes with hand-authored lines/barWidth values",
    "Skip: generated sidecar",
    "```",
    "",
    "```text",
    'User goal: "Build a masonry layout where skeleton text matches real responsive copy."',
    "Workflow: layoutWithBrowserMeasuredTextSkeleton",
    "Use: stable selectors -> probe_render_context -> scaffold_skeleton_text with renderReceiptId -> generate:skeleton-text-module --analysis-output -> import sidecar",
    "```",
    "",
    "If the user has an existing layout and asks to add or improve skeletons, classify it as `skeletonRetrofit` and preserve existing rendering behavior while choosing the smallest skeleton layer that meets the requested fidelity."
  ].join("\n");
}
function browserMeasuredSkeletonGuide() {
  return [
    "# Browser-Measured Skeleton Text",
    "",
    "Use browser-measured skeleton text only when the user wants skeleton text to match real rendered content across responsive widths. This is optional; simple skeletons can be hand-authored.",
    "",
    "The workflow applies to any rendered DOM text: slider cards, grids, masonry cards, entries rows, thumbnails, app shells, flex layouts, pricing cards, and custom UI.",
    "",
    "Default workflow:",
    "",
    "1. Add stable selectors to the real rendered text, such as `data-skeleton-text-id`.",
    "2. Dry-run `scaffold_skeleton_text` to get the exact `probe_render_context` call for the live URL, viewport, and selectors.",
    "3. Call `probe_render_context`; use the returned `receiptId` as `renderReceiptId` when applying the scaffold.",
    "4. Run `npm run --silent generate:skeleton-text-module -- --input ./path/to/manifest.json --analysis-output ./path/to/measurements.json`.",
    "5. Import the generated sidecar exports into the component.",
    "6. Wire generated values into skeleton `text` nodes.",
    "",
    "Manifest modes:",
    "",
    "- Use flat `targets` for ordinary DOM text in any layout.",
    "- Add `slider` mode for equal-height card sliders that need canonical item measurement and row-height compensation.",
    "- Add `masonry` readiness metadata when text is inside positioned masonry items and geometry needs to settle before sampling.",
    "- Add `entries` readiness metadata when measuring `Entries` rows that expose mount/ready attributes.",
    "- Use `readyExpression`, `settleMs`, and `stableGeometryFrames` for custom client-measured layouts.",
    "",
    "Example flat-target manifest call:",
    "",
    "```json",
    "{",
    '  "projectRoot": "/absolute/path/to/app",',
    '  "manifestPath": "src/components/pricing.skeleton-text.browser.manifest.json",',
    '  "url": "http://127.0.0.1:3000/pricing?skeletonMeasure=content",',
    '  "outputFile": "src/components/pricing.skeleton-text.generated.ts",',
    '  "moduleExportName": "pricingSkeletonText",',
    '  "barWidthUnit": "px",',
    '  "includeTextMetrics": true,',
    '  "renderReceiptId": "rmg-render-...",',
    '  "targets": [',
    "    {",
    '      "exportName": "pricingCardTitle",',
    `      "selector": "[data-skeleton-text-id='pricingCardTitle']"`,
    "    }",
    "  ],",
    '  "apply": true',
    "}",
    "```"
  ].join("\n");
}
function skeletonCacheGuide() {
  return [
    "# Skeleton Cookie Snapshot Cache",
    "",
    "Use the skeleton cookie snapshot cache when a production skeleton has expensive responsive text or geometry CSS and the user cares about reload/back-forward first paint. First visits keep the normal responsive skeleton CSS. After hydration and debounced resizes, the client writes compact geometry/text measurements into a cookie. Later SSR can read that cookie and render the active snapshot instead of the full responsive text CSS table.",
    "",
    "Why cookies instead of sessionStorage:",
    "",
    "- SSR cannot read `sessionStorage`; it is only available after client JavaScript starts.",
    "- Cookies are available to the server request, so SSR can reserve active skeleton geometry before hydration.",
    "- The payload stores geometry only: version, key, scope id, route key, timestamp, active width bucket, viewport/layout width, text line counts and per-line widths, and masonry active variant/item heights when present.",
    "- It never stores real text content, media URLs, app CSS, or full skeleton CSS.",
    "",
    "API surface:",
    "",
    "- Import server-safe helpers from `react-motion-gallery/skeleton/cache`.",
    "- Import the client provider from `react-motion-gallery/skeleton/cache/provider`.",
    "- Import cache-capable slider skeletons from `react-motion-gallery/skeleton/slider/restore`.",
    "- Pass `cache={{ key, routeKey, ttlMs?, debounceMs?, cookie? }}` to `SliderSkeleton` from that restore subpath.",
    "- Generated skeleton text sidecars emit `textId`; for hand-authored skeleton text, add `textId` to the skeleton `text` node and add matching `data-skeleton-text-id` to the real DOM text.",
    "",
    "Next.js pattern:",
    "",
    "```tsx",
    'import { cookies } from "next/headers";',
    'import { parseSkeletonCacheCookie, type SkeletonCacheSnapshot } from "react-motion-gallery/skeleton/cache";',
    "",
    "function readSkeletonCacheSnapshots(cookieStore: Awaited<ReturnType<typeof cookies>>) {",
    "  const snapshots: Record<string, SkeletonCacheSnapshot> = {};",
    "  for (const cookie of cookieStore.getAll()) {",
    '    if (!cookie.name.startsWith("rmg_skel_cache_")) continue;',
    "    const snapshot = parseSkeletonCacheCookie(cookie.value);",
    "    if (snapshot) snapshots[snapshot.key] = snapshot;",
    "  }",
    "  return snapshots;",
    "}",
    "```",
    "",
    "```tsx",
    '"use client";',
    'import { SkeletonCacheProvider } from "react-motion-gallery/skeleton/cache/provider";',
    'import { SliderSkeleton } from "react-motion-gallery/skeleton/slider/restore";',
    "",
    "<SkeletonCacheProvider snapshots={skeletonCacheSnapshots}>",
    "  <SliderSkeleton",
    '    cache={{ key: "portfolio-slider", routeKey: "/gallery" }}',
    "    layout={portfolioSliderSkeleton}",
    "    ready={ready}",
    "  >",
    "    {content}",
    "  </SliderSkeleton>",
    "</SkeletonCacheProvider>",
    "```",
    "",
    "Validation and fallback:",
    "",
    "- Default TTL is 10 minutes; default resize debounce is 250ms.",
    "- Route, scope, text-id, kind, width bucket, item-count, and variant mismatches fall back silently to the responsive path.",
    "- Do not use the cache as a persistence layer for user content; it is strictly first-paint geometry."
  ].join("\n");
}

// src/generate.ts
import path5 from "path";

// src/snippets.ts
import fs3 from "fs";
import path4 from "path";
var localPackageImportPattern = /from\s+["'][^"']*packages\/react-motion-gallery\/src["']/g;
var localPackageSubpathImportPattern = /from\s+["'][^"']*packages\/react-motion-gallery\/src\/([^"']+)["']/g;
var internalTypeImportReplacements = [
  {
    pattern: /import type \{[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/Gallery\/grid\/GridSkeleton["'];?/g,
    replacement: 'import type { GridSkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/grid";'
  },
  {
    pattern: /import type \{[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/Gallery\/masonry\/MasonrySkeleton["'];?/g,
    replacement: 'import type { MasonrySkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/masonry/structured";'
  },
  {
    pattern: /import \{[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/Gallery\/masonry\/MasonrySkeleton["'];?/g,
    replacement: 'import type { MasonrySkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/masonry/structured";'
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
    replacement: 'import type { MasonrySkeletonSpec, SkeletonNode } from "react-motion-gallery/skeleton/masonry/structured";'
  },
  {
    pattern: /import type \{[\s\S]*?SliderSkeletonSpec[\s\S]*?\} from ["'][^"']*packages\/react-motion-gallery\/src\/skeleton["'];?/g,
    replacement: 'import type { SliderSkeletonNode, SliderSkeletonSlot, SliderSkeletonSpec } from "react-motion-gallery/skeleton/slider";'
  }
];
var publicImportByExport = /* @__PURE__ */ new Map([
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
  if (text.includes("masonry") || text.includes("pinterest")) return "masonry-core-balanced";
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
  if (!fs3.existsSync(filePath)) {
    throw new Error(`Missing demo ${exportName} file: ${filePath}`);
  }
  const file = fs3.readFileSync(filePath, "utf8");
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
function discoverExtraFiles(demo, tsx) {
  const files = [];
  for (const match of tsx.matchAll(/from\s+["']\.\/([^"']+\.skeleton-text\.generated)["']/g)) {
    const filename = `${match[1]}.ts`;
    const absolutePath = path4.join(demo.demoPath, filename);
    if (!fs3.existsSync(absolutePath)) {
      continue;
    }
    files.push({
      path: filename,
      filename,
      code: fs3.readFileSync(absolutePath, "utf8").trimEnd(),
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
  const basename = path5.basename(componentPath).replace(/\.(tsx|jsx|ts|js)$/i, "");
  return `${basename}.module.css`;
}

// src/project.ts
import fs4 from "fs";
import path6 from "path";
var sourceExtensions = /* @__PURE__ */ new Set([".js", ".jsx", ".ts", ".tsx"]);
var ignoredDirectories = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage"
]);
function resolveInsideRoot(projectRoot, targetPath) {
  const root = path6.resolve(projectRoot);
  const resolved = path6.resolve(root, targetPath);
  const relative = path6.relative(root, resolved);
  if (relative === "" || !relative.startsWith("..") && !path6.isAbsolute(relative)) {
    return resolved;
  }
  throw new Error(`Refusing to write outside projectRoot: ${targetPath}`);
}
function detectProject(projectRoot) {
  const root = path6.resolve(projectRoot);
  const packageJsonPath = path6.join(root, "package.json");
  const packageJson = readJsonObject(packageJsonPath);
  const dependencies = objectRecord(packageJson?.dependencies);
  const devDependencies = objectRecord(packageJson?.devDependencies);
  const allDeps = { ...dependencies, ...devDependencies };
  const files = listSourceFiles(root, 400);
  const hasRmgStylesImport = files.some(
    (file) => fs4.readFileSync(file, "utf8").includes("react-motion-gallery/styles.css")
  );
  const usesCssModules = files.some((file) => file.endsWith(".module.css"));
  return {
    root,
    kind: detectProjectKind(allDeps),
    packageJsonPath: fs4.existsSync(packageJsonPath) ? packageJsonPath : null,
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
    (file) => fs4.readFileSync(file, "utf8").includes("react-motion-gallery")
  );
  const videoLikely = rmgFiles.some((file) => /Video|kind:\s*"video"|youtube|vimeo/i.test(fs4.readFileSync(file, "utf8")));
  if (videoLikely && !project.hasVideoPeers) {
    findings.push({
      severity: "warning",
      code: "missing-video-peers",
      message: "Video integrations need optional peer dependencies plyr and plyr-react."
    });
  }
  if (project.kind === "next") {
    for (const file of rmgFiles) {
      const content = fs4.readFileSync(file, "utf8");
      if (usesInteractiveGallery(content) && !hasUseClientDirective(content)) {
        findings.push({
          severity: "warning",
          code: "next-use-client",
          file: path6.relative(project.root, file),
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
      relativePath: path6.relative(path6.resolve(args.projectRoot), componentTarget),
      code: args.tsx
    }
  ];
  if (args.cssPath && args.css !== void 0) {
    const cssTarget = resolveInsideRoot(args.projectRoot, args.cssPath);
    files.push({
      path: cssTarget,
      relativePath: path6.relative(path6.resolve(args.projectRoot), cssTarget),
      code: args.css
    });
  }
  for (const extraFile of args.extraFiles ?? []) {
    const extraTarget = resolveInsideRoot(
      args.projectRoot,
      path6.join(path6.dirname(args.componentPath), extraFile.path)
    );
    files.push({
      path: extraTarget,
      relativePath: path6.relative(path6.resolve(args.projectRoot), extraTarget),
      code: extraFile.code
    });
  }
  if (args.apply) {
    for (const file of files) {
      fs4.mkdirSync(path6.dirname(file.path), { recursive: true });
      fs4.writeFileSync(file.path, `${file.code.trimEnd()}
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
  if (files.length >= maxFiles || !fs4.existsSync(currentPath)) {
    return;
  }
  const stat = fs4.statSync(currentPath);
  if (stat.isFile()) {
    if (sourceExtensions.has(path6.extname(currentPath)) || currentPath.endsWith(".module.css")) {
      files.push(currentPath);
    }
    return;
  }
  if (!stat.isDirectory()) {
    return;
  }
  const basename = path6.basename(currentPath);
  if (ignoredDirectories.has(basename)) {
    return;
  }
  for (const child of fs4.readdirSync(currentPath)) {
    walk(path6.join(currentPath, child), files, maxFiles);
    if (files.length >= maxFiles) {
      return;
    }
  }
}
function readJsonObject(filePath) {
  if (!fs4.existsSync(filePath)) {
    return null;
  }
  try {
    const parsed = JSON.parse(fs4.readFileSync(filePath, "utf8"));
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

// src/workflow.ts
function classifyGalleryWorkflow(args) {
  const goal = args.goal.trim();
  const text = `${goal} ${args.layoutHint ?? ""}`.toLowerCase();
  const mentionsLoading = hasAny(text, [
    "skeleton",
    "loading",
    "placeholder",
    "shimmer",
    "fallback",
    "pending"
  ]);
  const mentionsText = hasAny(text, [
    "text",
    "copy",
    "title",
    "body",
    "caption",
    "headline",
    "description",
    "label",
    "metadata",
    "content"
  ]);
  const mentionsMeasuredText = hasAny(text, [
    "browser",
    "measure",
    "measured",
    "analysis",
    "sidecar",
    "generated",
    "match real",
    "real content",
    "responsive copy",
    "exact",
    "fidelity"
  ]);
  const mentionsHandAuthored = hasAny(text, [
    "hand",
    "manual",
    "simple",
    "rough",
    "static",
    "no browser",
    "without browser",
    "no analysis",
    "without analysis"
  ]);
  const mentionsRetrofit = args.hasExistingLayout === true || hasAny(text, [
    "existing",
    "retrofit",
    "add skeleton",
    "improve skeleton",
    "update skeleton"
  ]);
  let mode = "layoutOnly";
  if (mentionsRetrofit && mentionsLoading) {
    mode = "skeletonRetrofit";
  } else if (mentionsLoading && mentionsText && mentionsMeasuredText) {
    mode = "layoutWithBrowserMeasuredTextSkeleton";
  } else if (mentionsLoading && mentionsText) {
    mode = mentionsHandAuthored || !mentionsMeasuredText ? "layoutWithHandAuthoredTextSkeleton" : "layoutWithBrowserMeasuredTextSkeleton";
  } else if (mentionsLoading) {
    mode = "layoutWithNonTextSkeleton";
  }
  const recommendedResources = resourcesForMode(mode);
  const recommendedTools = toolsForMode(mode);
  const nextSteps = nextStepsForMode(mode);
  const warnings = warningsForMode(mode, args.framework);
  return {
    goal,
    mode,
    layoutHint: args.layoutHint ?? "any",
    recommendedResources,
    recommendedTools,
    nextSteps,
    warnings
  };
}
function resourcesForMode(mode) {
  const base = [
    "rmg://context/agent-brief",
    "rmg://guides/layout-selection",
    "rmg://catalog/demos"
  ];
  if (mode === "layoutOnly") return base;
  if (mode === "layoutWithBrowserMeasuredTextSkeleton") {
    return [
      ...base,
      "rmg://guides/loading-fidelity",
      "rmg://guides/browser-measured-skeletons",
      "rmg://guides/skeleton-cache",
      "rmg://docs/skeleton-text-authoring",
      "rmg://docs/skeleton-text-codex-prompt"
    ];
  }
  if (mode === "skeletonRetrofit") {
    return [
      ...base,
      "rmg://guides/loading-fidelity",
      "rmg://guides/browser-measured-skeletons",
      "rmg://guides/skeleton-cache",
      "rmg://docs/skeleton-text-codex-prompt"
    ];
  }
  return [...base, "rmg://guides/loading-fidelity", "rmg://guides/skeleton-cache"];
}
function toolsForMode(mode) {
  const base = ["recommend_pattern", "search_demos", "get_demo", "generate_gallery_component"];
  if (mode === "layoutWithBrowserMeasuredTextSkeleton" || mode === "skeletonRetrofit") {
    return [...base, "probe_render_context", "scaffold_skeleton_text", "audit_project"];
  }
  return base;
}
function nextStepsForMode(mode) {
  switch (mode) {
    case "layoutOnly":
      return [
        "Choose the layout primitive and demo with recommend_pattern or search_demos.",
        "Fetch the closest example with get_demo.",
        "Generate or hand-author the component and CSS without skeleton tooling."
      ];
    case "layoutWithNonTextSkeleton":
      return [
        "Choose the layout primitive and loading surface.",
        "Use rect, media, stack, row, or gallery-specific skeleton wrappers.",
        "Skip browser text measurement and generated sidecars."
      ];
    case "layoutWithHandAuthoredTextSkeleton":
      return [
        "Choose the layout primitive and skeleton wrapper.",
        "Hand-author text nodes with lines, barWidth, lastBarWidth, barHeight, and lineHeight.",
        "Skip browser text measurement unless the user asks for matching responsive copy."
      ];
    case "layoutWithBrowserMeasuredTextSkeleton":
      return [
        "Add stable selectors to the real rendered text.",
        "Use flat targets by default; add slider, masonry, or entries metadata only when that layout needs it.",
        "Dry-run scaffold_skeleton_text to get the exact probe_render_context call, then probe the live page and pass renderReceiptId when applying.",
        "Run generate:skeleton-text-module with --analysis-output, then import the generated sidecar values.",
        "For SSR reload performance, wire the skeleton cookie snapshot cache with a stable cache key and route key."
      ];
    case "skeletonRetrofit":
      return [
        "Inspect the existing layout and current loading behavior before changing code.",
        "Choose non-text, hand-authored text, or browser-measured text fidelity based on the user goal.",
        "Preserve existing layout behavior and add the smallest skeleton layer that satisfies the request.",
        "For browser-measured text, apply scaffolds only after probe_render_context returns a fresh matching renderReceiptId.",
        "If the skeleton has responsive text or expensive geometry CSS, add the cookie snapshot cache instead of client-only storage."
      ];
  }
}
function warningsForMode(mode, framework) {
  const warnings = [];
  if (framework === "next") {
    warnings.push('Interactive gallery components should live in a "use client" component.');
  }
  if (mode === "layoutWithBrowserMeasuredTextSkeleton" || mode === "skeletonRetrofit") {
    warnings.push("Browser-measured text needs a live page URL, stable selectors, and a fresh probe_render_context receipt before apply.");
  }
  return warnings;
}
function hasAny(value, needles) {
  return needles.some((needle) => value.includes(needle));
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
  const workflow = classifyGalleryWorkflow({
    goal,
    hasExistingLayout: args.hasExistingLayout,
    layoutHint: args.layout,
    framework: args.framework
  });
  return {
    goal,
    workflow,
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
      `Workflow mode: ${workflow.mode}.`,
      ...workflow.nextSteps,
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

// src/renderReceipt.ts
import { spawn } from "child_process";
import { createHash, randomUUID } from "crypto";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import WebSocket from "ws";
var DEFAULT_CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
var DEFAULT_TTL_MS = 5 * 60 * 1e3;
var DEFAULT_TIMEOUT_MS = 1e4;
var DEFAULT_SETTLE_MS = 120;
var DEFAULT_STABLE_GEOMETRY_FRAMES = 3;
var RMG_MARKER_SELECTORS = {
  skeletonText: "[data-skeleton-text-id]",
  sliderScope: "[data-rmg-slider-core-scope]",
  galleryIndex: "[data-rmg-idx]",
  entryOwner: "[data-rmg-entry-owner]",
  fullscreenTrigger: "[data-rmg-fullscreen-trigger]",
  zoomPanRoot: "[data-rmg-zoom-pan-root]"
};
var RenderReceiptError = class extends Error {
  code;
  detail;
  constructor(code, message, detail = {}) {
    super(message);
    this.name = "RenderReceiptError";
    this.code = code;
    this.detail = detail;
  }
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      detail: this.detail
    };
  }
};
var RenderReceiptValidationError = class extends Error {
  code;
  issues;
  constructor(code, issues) {
    super(`${code}: ${issues.map((issue) => `${issue.code}: ${issue.message}`).join("; ")}`);
    this.name = "RenderReceiptValidationError";
    this.code = code;
    this.issues = issues;
  }
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      issues: this.issues
    };
  }
};
var RenderReceiptStore = class {
  receipts = /* @__PURE__ */ new Map();
  put(receipt) {
    this.receipts.set(receipt.receiptId, receipt);
    return receipt;
  }
  get(receiptId) {
    return receiptId ? this.receipts.get(receiptId) ?? null : null;
  }
  validate(args) {
    const receipt = this.get(args.receiptId);
    return validateRenderReceipt({
      receipt,
      receiptId: args.receiptId,
      required: args.required,
      now: args.now
    });
  }
};
var ChromeCdpClient = class _ChromeCdpClient {
  ws;
  pending = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Map();
  nextId = 1;
  constructor(ws) {
    this.ws = ws;
    this.ws.on("message", (data) => {
      const message = JSON.parse(String(data));
      if (message.id != null) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) {
          pending.reject(
            new RenderReceiptError(
              "BROWSER_PROTOCOL_ERROR",
              message.error.message || "Chrome DevTools Protocol error.",
              { message }
            )
          );
          return;
        }
        pending.resolve(message.result);
        return;
      }
      if (message.method) {
        const handlers = this.listeners.get(message.method) ?? [];
        for (const handler of handlers) {
          handler(message.params, message.sessionId);
        }
      }
    });
  }
  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.once("open", () => resolve());
      ws.once("error", reject);
    });
    return new _ChromeCdpClient(ws);
  }
  async close() {
    if (this.ws.readyState === WebSocket.CLOSED) return;
    await new Promise((resolve) => {
      const done = () => {
        clearTimeout(timeout);
        resolve();
      };
      const timeout = setTimeout(done, 500);
      this.ws.once("close", done);
      this.ws.once("error", done);
      if (this.ws.readyState === WebSocket.CLOSING) return;
      try {
        this.ws.close();
      } catch {
        done();
      }
    });
  }
  on(method, handler) {
    const handlers = this.listeners.get(method) ?? [];
    handlers.push(handler);
    this.listeners.set(method, handlers);
    return () => {
      this.listeners.set(
        method,
        (this.listeners.get(method) ?? []).filter((entry) => entry !== handler)
      );
    };
  }
  waitFor(method, sessionId) {
    return new Promise((resolve) => {
      const dispose = this.on(method, (params, incomingSessionId) => {
        if (sessionId && incomingSessionId !== sessionId) return;
        dispose();
        resolve(params);
      });
    });
  }
  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    const payload = sessionId ? { id, method, params, sessionId } : { id, method, params };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }
};
function normalizeRenderProbeRequest(args) {
  return {
    url: canonicalizeUrl(args.url),
    viewport: {
      width: positiveInteger(args.viewport.width, "viewport.width"),
      height: positiveInteger(args.viewport.height, "viewport.height"),
      deviceScaleFactor: args.viewport.deviceScaleFactor != null ? positiveNumber(args.viewport.deviceScaleFactor, "viewport.deviceScaleFactor") : 1,
      mobile: args.viewport.mobile === true
    },
    selectors: uniqueStrings(args.selectors ?? []),
    readyExpression: cleanOptionalString(args.readyExpression),
    settleMs: nonNegativeNumber(args.settleMs ?? DEFAULT_SETTLE_MS, "settleMs"),
    stableGeometryFrames: positiveInteger(
      args.stableGeometryFrames ?? DEFAULT_STABLE_GEOMETRY_FRAMES,
      "stableGeometryFrames"
    ),
    timeoutMs: positiveInteger(args.timeoutMs ?? DEFAULT_TIMEOUT_MS, "timeoutMs")
  };
}
async function probeRenderContext(args) {
  const request = normalizeRenderProbeRequest(args);
  const chromePath = args.chromePath ?? process.env.RMG_CHROME_PATH ?? DEFAULT_CHROME_PATH;
  const ttlMs = positiveInteger(args.ttlMs ?? DEFAULT_TTL_MS, "ttlMs");
  const launched = await launchChrome(chromePath);
  let client = null;
  let targetId = null;
  try {
    client = await ChromeCdpClient.connect(launched.wsUrl);
    const target = await createPageTarget({ client, request });
    targetId = target.targetId;
    const readiness = await waitForReadyExpression({
      client,
      sessionId: target.sessionId,
      expression: request.readyExpression,
      timeoutMs: request.timeoutMs
    });
    await wait(request.settleMs);
    const stability = await waitForStableGeometry({
      client,
      sessionId: target.sessionId,
      request
    });
    const observed = await collectObservedState({
      client,
      sessionId: target.sessionId,
      request,
      stability
    });
    const warnings = buildWarnings({ request, observed, readiness });
    await client.send("Target.closeTarget", { targetId: target.targetId }).catch(() => void 0);
    targetId = null;
    return buildRenderReceipt({
      request,
      observed,
      targetId: target.targetId,
      ttlMs,
      warnings
    });
  } finally {
    if (client && targetId) {
      await client.send("Target.closeTarget", { targetId }).catch(() => void 0);
    }
    await client?.close().catch(() => void 0);
    await stopChrome(launched);
  }
}
function buildRenderReceipt(args) {
  const receipt = {
    receiptId: args.receiptId ?? `rmg-render-${randomUUID()}`,
    stateHash: "",
    createdAt: args.createdAt ?? (/* @__PURE__ */ new Date()).toISOString(),
    ttlMs: args.ttlMs ?? DEFAULT_TTL_MS,
    request: args.request,
    tab: {
      targetId: args.targetId,
      type: "page",
      lifecycle: "created-and-closed"
    },
    observed: args.observed,
    warnings: args.warnings ?? []
  };
  return {
    ...receipt,
    stateHash: hashRenderReceiptState(receipt)
  };
}
function hashRenderReceiptState(value) {
  return sha256(
    stableJson({
      finalUrl: canonicalizeUrl(value.observed.finalUrl),
      viewport: value.observed.viewport,
      selectorSummaries: value.observed.selectorSummaries,
      rmgMarkerCounts: value.observed.rmgMarkerCounts
    })
  );
}
function validateRenderReceipt(args) {
  if (!args.receipt) {
    return {
      status: "missing",
      issues: [
        {
          code: "RENDER_RECEIPT_MISSING",
          message: "A fresh render receipt is required before applying browser-measured skeleton scaffolding.",
          detail: { receiptId: args.receiptId }
        }
      ]
    };
  }
  const receipt = args.receipt;
  const issues = [];
  const now = args.now ?? Date.now();
  const createdAtMs = Date.parse(receipt.createdAt);
  if (!Number.isFinite(createdAtMs) || now - createdAtMs > receipt.ttlMs) {
    issues.push({
      code: "RENDER_RECEIPT_EXPIRED",
      message: "The render receipt is stale. Probe the page again before applying.",
      detail: { createdAt: receipt.createdAt, ttlMs: receipt.ttlMs }
    });
  }
  const requiredUrl = canonicalizeUrl(args.required.url);
  if (receipt.request.url !== requiredUrl || canonicalizeUrl(receipt.observed.finalUrl) !== requiredUrl) {
    issues.push({
      code: "RENDER_RECEIPT_URL_MISMATCH",
      message: "The render receipt URL does not match the skeleton manifest URL.",
      detail: {
        expected: requiredUrl,
        requested: receipt.request.url,
        observed: receipt.observed.finalUrl
      }
    });
  }
  const width = receipt.observed.viewport.innerWidth;
  if (width < args.required.viewportMin || width > args.required.viewportMax) {
    issues.push({
      code: "RENDER_RECEIPT_VIEWPORT_WIDTH_MISMATCH",
      message: "The render receipt viewport width is outside the skeleton manifest range.",
      detail: {
        expectedMin: args.required.viewportMin,
        expectedMax: args.required.viewportMax,
        observed: width
      }
    });
  }
  const height = receipt.observed.viewport.innerHeight;
  if (height !== args.required.viewportHeight) {
    issues.push({
      code: "RENDER_RECEIPT_VIEWPORT_HEIGHT_MISMATCH",
      message: "The render receipt viewport height does not match the skeleton manifest height.",
      detail: { expected: args.required.viewportHeight, observed: height }
    });
  }
  if (!receipt.observed.stability.stable) {
    issues.push({
      code: "RENDER_RECEIPT_UNSTABLE",
      message: "The render receipt did not observe stable rendered geometry.",
      detail: receipt.observed.stability
    });
  }
  const missingSelectors = uniqueStrings(args.required.selectors).filter((selector) => {
    const summary = receipt.observed.selectorSummaries[selector];
    return !summary || summary.count < 1;
  });
  if (missingSelectors.length > 0) {
    issues.push({
      code: "RENDER_RECEIPT_MISSING_SELECTORS",
      message: "The render receipt did not observe every skeleton measurement selector.",
      detail: { selectors: missingSelectors }
    });
  }
  if (issues.length > 0) {
    return {
      status: issues.some((issue) => issue.code === "RENDER_RECEIPT_EXPIRED") ? "expired" : "mismatch",
      receipt,
      issues
    };
  }
  return {
    status: "valid",
    receipt,
    issues: []
  };
}
function buildRenderReceiptValidationError(result) {
  if (result.status === "valid") {
    throw new Error("Cannot build a render receipt validation error for a valid receipt.");
  }
  return new RenderReceiptValidationError(
    result.status === "missing" ? "RENDER_RECEIPT_MISSING" : "RENDER_RECEIPT_INVALID",
    result.issues
  );
}
function renderReceiptErrorPayload(error) {
  if (error instanceof RenderReceiptValidationError || error instanceof RenderReceiptError) {
    return error.toJSON();
  }
  if (error instanceof Error) {
    return {
      code: "UNEXPECTED_RENDER_RECEIPT_ERROR",
      message: error.message,
      detail: {}
    };
  }
  return {
    code: "UNEXPECTED_RENDER_RECEIPT_ERROR",
    message: "An unexpected non-Error value was thrown.",
    detail: { error }
  };
}
function buildSkeletonRenderProbeRequest(args) {
  const viewportMin = args.viewportMin ?? 320;
  const viewportMax = args.viewportMax ?? 1600;
  const width = Math.min(viewportMax, Math.max(viewportMin, 1024));
  return {
    url: args.url,
    viewport: {
      width,
      height: args.viewportHeight ?? 1800
    },
    selectors: collectSkeletonRenderSelectors(args),
    ...args.readyExpression ? { readyExpression: args.readyExpression } : null,
    settleMs: args.settleMs ?? DEFAULT_SETTLE_MS,
    stableGeometryFrames: args.stableGeometryFrames ?? DEFAULT_STABLE_GEOMETRY_FRAMES
  };
}
function buildSkeletonRenderReceiptRequirement(args) {
  return {
    url: args.url,
    viewportMin: args.viewportMin ?? 320,
    viewportMax: args.viewportMax ?? 1600,
    viewportHeight: args.viewportHeight ?? 1800,
    selectors: collectSkeletonRenderSelectors(args)
  };
}
function collectSkeletonRenderSelectors(args) {
  return uniqueStrings([
    ...(args.targets ?? []).map((target) => target.selector),
    ...args.slider ? [args.slider.itemSelector, ...args.slider.roles.map((role) => role.selector)] : [],
    ...args.masonry ? [args.masonry.rootSelector, args.masonry.anchorSelector, args.masonry.itemSelector] : [],
    ...args.entries ? [args.entries.rootSelector, args.entries.anchorSelector, args.entries.entrySelector] : []
  ]);
}
function buildWarnings(args) {
  const warnings = [];
  if (canonicalizeUrl(args.observed.finalUrl) !== args.request.url) {
    warnings.push({
      code: "url-mismatch",
      message: "The probed page ended on a different URL than requested.",
      detail: { requested: args.request.url, observed: args.observed.finalUrl }
    });
  }
  if (args.readiness.timedOut) {
    warnings.push({
      code: "ready-expression-timeout",
      message: "The readyExpression did not become truthy before timeout.",
      detail: { readyExpression: args.request.readyExpression, error: args.readiness.error }
    });
  }
  if (!args.observed.stability.stable) {
    warnings.push({
      code: "unstable-render-state",
      message: "The probed page did not reach stable geometry before timeout.",
      detail: args.observed.stability
    });
  }
  const missingSelectors = Object.values(args.observed.selectorSummaries).filter((summary) => summary.count === 0).map((summary) => summary.selector);
  if (missingSelectors.length > 0) {
    warnings.push({
      code: "missing-selectors",
      message: "One or more requested selectors did not match the rendered page.",
      detail: { selectors: missingSelectors }
    });
  }
  return warnings;
}
async function createPageTarget(args) {
  const target = await args.client.send("Target.createTarget", {
    url: "about:blank"
  });
  const attached = await args.client.send("Target.attachToTarget", {
    targetId: target.targetId,
    flatten: true
  });
  const sessionId = attached.sessionId;
  await args.client.send("Page.enable", {}, sessionId);
  await args.client.send("Runtime.enable", {}, sessionId);
  await args.client.send(
    "Emulation.setDeviceMetricsOverride",
    {
      width: args.request.viewport.width,
      height: args.request.viewport.height,
      deviceScaleFactor: args.request.viewport.deviceScaleFactor,
      mobile: args.request.viewport.mobile
    },
    sessionId
  );
  const documentReady = withTimeout(
    args.client.waitFor("Page.domContentEventFired", sessionId),
    args.request.timeoutMs,
    () => new RenderReceiptError("BROWSER_NAVIGATION_TIMEOUT", "Timed out waiting for page DOMContentLoaded.", {
      url: args.request.url,
      timeoutMs: args.request.timeoutMs
    })
  );
  const navigation = await args.client.send(
    "Page.navigate",
    { url: args.request.url },
    sessionId
  );
  if (navigation.errorText) {
    throw new RenderReceiptError("BROWSER_NAVIGATION_FAILED", navigation.errorText, {
      url: args.request.url
    });
  }
  await documentReady;
  return { sessionId, targetId: target.targetId };
}
async function waitForReadyExpression(args) {
  if (!args.expression) {
    return { satisfied: true, timedOut: false };
  }
  const evaluation = await args.client.send(
    "Runtime.evaluate",
    {
      expression: `new Promise((resolve) => {
        const readyExpression = ${JSON.stringify(args.expression)};
        const timeoutMs = ${Math.max(0, args.timeoutMs)};
        const startedAt = performance.now();
        const evaluateReady = () => {
          try {
            return { value: Boolean(Function('"use strict"; return (' + readyExpression + ');')()) };
          } catch (error) {
            return { value: false, error: error instanceof Error ? error.message : String(error) };
          }
        };

        const tick = () => {
          const result = evaluateReady();
          if (result.value) {
            resolve({ satisfied: true, timedOut: false });
            return;
          }

          if (performance.now() - startedAt >= timeoutMs) {
            resolve({ satisfied: false, timedOut: true, error: result.error });
            return;
          }

          window.setTimeout(tick, 25);
        };

        tick();
      })`,
      returnByValue: true,
      awaitPromise: true
    },
    args.sessionId
  );
  return evaluation.result?.value ?? { satisfied: false, timedOut: true };
}
async function waitForStableGeometry(args) {
  const evaluation = await args.client.send(
    "Runtime.evaluate",
    {
      expression: createStableGeometryExpression(args.request),
      returnByValue: true,
      awaitPromise: true
    },
    args.sessionId
  );
  return evaluation.result?.value ?? {
    stable: false,
    stableFrames: 0,
    requiredFrames: args.request.stableGeometryFrames,
    framesObserved: 0,
    timedOut: true,
    timeoutMs: args.request.timeoutMs
  };
}
async function collectObservedState(args) {
  const evaluation = await args.client.send(
    "Runtime.evaluate",
    {
      expression: createObservedStateExpression(args.request.selectors),
      returnByValue: true,
      awaitPromise: true
    },
    args.sessionId
  );
  const observed = evaluation.result?.value;
  if (!observed) {
    throw new RenderReceiptError(
      "BROWSER_RECEIPT_FAILED",
      "Browser probing did not return rendered page state."
    );
  }
  return {
    ...observed,
    stability: args.stability
  };
}
function createStableGeometryExpression(request) {
  return `new Promise((resolve) => {
    const selectors = ${JSON.stringify(request.selectors)};
    const markerSelectors = ${JSON.stringify(RMG_MARKER_SELECTORS)};
    const requiredFrames = ${Math.max(1, request.stableGeometryFrames)};
    const timeoutMs = ${Math.max(1, request.timeoutMs)};
    const startedAt = performance.now();
    let lastSignature = "";
    let stableFrames = 0;
    let framesObserved = 0;

    ${browserDomSummaryHelpers()}

    function collectSignature() {
      return JSON.stringify({
        url: location.href,
        readyState: document.readyState,
        viewport: readViewportMetrics(),
        selectors: selectors.map((selector) => summarizeSelector(selector)),
        rmgMarkerCounts: summarizeMarkerCounts(markerSelectors),
        documentSize: {
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight
        }
      });
    }

    function tick() {
      const signature = collectSignature();
      framesObserved += 1;

      if (document.readyState !== "loading" && signature === lastSignature) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
        lastSignature = signature;
      }

      if (stableFrames >= requiredFrames) {
        resolve({
          stable: true,
          stableFrames,
          requiredFrames,
          framesObserved,
          timedOut: false,
          timeoutMs
        });
        return;
      }

      if (performance.now() - startedAt >= timeoutMs) {
        resolve({
          stable: false,
          stableFrames,
          requiredFrames,
          framesObserved,
          timedOut: true,
          timeoutMs
        });
        return;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  })`;
}
function createObservedStateExpression(selectors) {
  return `(() => {
    const selectors = ${JSON.stringify(selectors)};
    const markerSelectors = ${JSON.stringify(RMG_MARKER_SELECTORS)};

    ${browserDomSummaryHelpers()}

    const selectorSummaries = {};
    for (const selector of selectors) {
      selectorSummaries[selector] = summarizeSelector(selector);
    }

    return {
      finalUrl: location.href,
      title: document.title,
      readyState: document.readyState,
      viewport: readViewportMetrics(),
      selectorSummaries,
      rmgMarkerCounts: summarizeMarkerCounts(markerSelectors)
    };
  })()`;
}
function browserDomSummaryHelpers() {
  return `
    function round(value) {
      return Math.round(Number(value || 0) * 100) / 100;
    }

    function hashString(value) {
      let hash = 2166136261;
      for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(16).padStart(8, "0");
    }

    function readViewportMetrics() {
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        documentElementClientWidth: document.documentElement.clientWidth,
        documentElementClientHeight: document.documentElement.clientHeight,
        visualViewportWidth: window.visualViewport ? window.visualViewport.width : null,
        visualViewportHeight: window.visualViewport ? window.visualViewport.height : null,
        devicePixelRatio: window.devicePixelRatio
      };
    }

    function summarizeDataAttributes(elements) {
      const valuesByName = new Map();
      for (const element of elements) {
        for (const attr of Array.from(element.attributes || [])) {
          if (!/^data-(rmg|skeleton)/.test(attr.name)) continue;
          const values = valuesByName.get(attr.name) || [];
          values.push(String(attr.value || ""));
          valuesByName.set(attr.name, values);
        }
      }

      const out = {};
      for (const [name, values] of valuesByName.entries()) {
        const uniqueValues = Array.from(new Set(values)).sort();
        out[name] = {
          count: values.length,
          valueCount: uniqueValues.length,
          valuesHash: uniqueValues.length > 0 ? hashString(uniqueValues.join("\\u001f")) : null
        };
      }
      return out;
    }

    function summarizeSelector(selector) {
      let elements = [];
      try {
        elements = Array.from(document.querySelectorAll(selector));
      } catch {
        elements = [];
      }

      const rects = [];
      let visibleCount = 0;
      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        const visible = rect.width > 0 && rect.height > 0;
        if (visible) {
          visibleCount += 1;
          if (rects.length < 20) {
            rects.push({
              top: round(rect.top),
              left: round(rect.left),
              width: round(rect.width),
              height: round(rect.height)
            });
          }
        }
      }

      return {
        selector,
        count: elements.length,
        visibleCount,
        rects,
        dataAttributes: summarizeDataAttributes(elements)
      };
    }

    function summarizeMarkerCounts(markerSelectors) {
      const out = {};
      for (const [name, selector] of Object.entries(markerSelectors)) {
        try {
          out[name] = document.querySelectorAll(selector).length;
        } catch {
          out[name] = 0;
        }
      }
      return out;
    }
  `;
}
async function launchChrome(chromePath) {
  const userDataDir = await mkdtemp(join(tmpdir(), "rmg-mcp-render-"));
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-features=CalculateNativeWinOcclusion,PaintHolding",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank"
  ];
  const child = spawn(chromePath, args, {
    stdio: ["ignore", "pipe", "pipe"]
  });
  try {
    const wsUrl = await withTimeout(
      new Promise((resolve, reject) => {
        let launchOutput = "";
        const onData = (chunk) => {
          const value = chunk.toString("utf8");
          launchOutput = `${launchOutput}${value}`.slice(-4e3);
          const match = value.match(/DevTools listening on (ws:\/\/[^\s]+)/);
          if (match?.[1]) {
            cleanup();
            resolve(match[1]);
          }
        };
        const onError = (error) => {
          cleanup();
          reject(error);
        };
        const onExit = (code, signal) => {
          cleanup();
          reject(
            new RenderReceiptError(
              "BROWSER_LAUNCH_FAILED",
              "Chrome exited before exposing a DevTools websocket endpoint.",
              { code, signal, output: launchOutput.trim() || void 0, userDataDir }
            )
          );
        };
        const cleanup = () => {
          child.stdout.off("data", onData);
          child.stderr.off("data", onData);
          child.off("error", onError);
          child.off("exit", onExit);
        };
        child.stdout.on("data", onData);
        child.stderr.on("data", onData);
        child.once("error", onError);
        child.once("exit", onExit);
      }),
      DEFAULT_TIMEOUT_MS,
      () => new RenderReceiptError(
        "BROWSER_LAUNCH_TIMEOUT",
        "Timed out waiting for Chrome to expose a DevTools websocket endpoint.",
        { chromePath, userDataDir }
      )
    );
    return { child, userDataDir, wsUrl };
  } catch (error) {
    await stopChrome({ child, userDataDir, wsUrl: "" }).catch(() => void 0);
    throw error;
  }
}
async function stopChrome(launched) {
  const isExited = () => launched.child.exitCode != null || launched.child.signalCode != null;
  if (!isExited()) {
    launched.child.kill("SIGTERM");
    const exited = await Promise.race([
      new Promise((resolve) => launched.child.once("exit", () => resolve(true))),
      wait(500).then(() => false)
    ]);
    if (!exited && !isExited()) {
      launched.child.kill("SIGKILL");
      await Promise.race([
        new Promise((resolve) => launched.child.once("exit", () => resolve())),
        wait(500)
      ]);
    }
  }
  await rm(launched.userDataDir, { recursive: true, force: true }).catch(() => void 0);
}
function withTimeout(promise, timeoutMs, createError) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(createError()), Math.max(1, timeoutMs));
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
}
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.max(0, ms));
  });
}
function canonicalizeUrl(value) {
  try {
    return new URL(value).href;
  } catch {
    return value.trim();
  }
}
function positiveInteger(value, name) {
  if (!Number.isFinite(value) || value < 1) {
    throw new RenderReceiptError("INVALID_RENDER_RECEIPT_INPUT", `${name} must be a positive integer.`, {
      [name]: value
    });
  }
  return Math.trunc(value);
}
function positiveNumber(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RenderReceiptError("INVALID_RENDER_RECEIPT_INPUT", `${name} must be a positive number.`, {
      [name]: value
    });
  }
  return value;
}
function nonNegativeNumber(value, name) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RenderReceiptError("INVALID_RENDER_RECEIPT_INPUT", `${name} must be a non-negative number.`, {
      [name]: value
    });
  }
  return value;
}
function cleanOptionalString(value) {
  return value && value.trim() ? value.trim() : void 0;
}
function uniqueStrings(values) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value) => Boolean(value)))
  );
}
function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJson(entry)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entryValue]) => `${JSON.stringify(key)}:${stableJson(entryValue)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

// src/skeleton.ts
import fs5 from "fs";
import path7 from "path";
function scaffoldSkeletonText(args) {
  const hasTargets = (args.targets?.length ?? 0) > 0;
  const hasSlider = args.slider != null;
  if (!hasTargets && !hasSlider) {
    throw new Error("scaffold_skeleton_text requires targets or a slider manifest block.");
  }
  const manifest = stripUndefined({
    url: args.url,
    outputFile: args.outputFile,
    moduleExportName: args.moduleExportName,
    chromePath: args.chromePath,
    viewportMin: args.viewportMin ?? 320,
    viewportMax: args.viewportMax ?? 1600,
    viewportHeight: args.viewportHeight ?? 1800,
    viewportWorkers: args.viewportWorkers ?? 1,
    settleMs: args.settleMs ?? 120,
    stableGeometryFrames: args.stableGeometryFrames ?? 3,
    readyExpression: args.readyExpression,
    lineWrapGuardPx: args.lineWrapGuardPx ?? 0,
    lineMeasurementMethod: args.lineMeasurementMethod,
    includeTextMetrics: args.includeTextMetrics ?? true,
    breakpointStrategy: args.breakpointStrategy ?? "lineChanges",
    barWidthUnit: args.barWidthUnit ?? "px",
    ...args.responsiveBy === "container" ? { responsiveBy: "container" } : null,
    ...hasTargets ? {
      targets: args.targets.map(
        (target) => stripUndefined({
          exportName: target.exportName,
          selector: target.selector,
          widthMode: target.widthMode,
          lineWrapGuardPx: target.lineWrapGuardPx
        })
      )
    } : null,
    ...args.slider ? { slider: stripUndefined(args.slider) } : null,
    ...args.masonry ? { masonry: stripUndefined(args.masonry) } : null,
    ...args.entries ? { entries: stripUndefined(args.entries) } : null
  });
  const targetPath = resolveInsideRoot(args.projectRoot, args.manifestPath);
  const code = `${JSON.stringify(manifest, null, 2)}
`;
  const analysisOutputPath = analysisOutputFor(args.outputFile);
  if (args.apply) {
    fs5.mkdirSync(path7.dirname(targetPath), { recursive: true });
    fs5.writeFileSync(targetPath, code);
  }
  return {
    applied: Boolean(args.apply),
    manifestPath: path7.relative(path7.resolve(args.projectRoot), targetPath),
    manifest,
    commands: [
      `npm run --silent generate:skeleton-text-module -- --input ${args.manifestPath} --analysis-output ${analysisOutputPath}`,
      `npm run --silent generate:skeleton-text-module -- --input ${args.manifestPath} --analysis-output ${analysisOutputPath} --print-analysis`
    ]
  };
}
function stripUndefined(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => stripUndefined(entry));
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  const out = {};
  for (const [key, entryValue] of Object.entries(value)) {
    if (entryValue !== void 0) {
      out[key] = stripUndefined(entryValue);
    }
  }
  return out;
}
function analysisOutputFor(outputFile) {
  if (outputFile.endsWith(".generated.ts")) {
    return outputFile.replace(/\.generated\.ts$/, ".measurements.json");
  }
  return `${outputFile}.measurements.json`;
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
var layoutHintSchema = categorySchema.or(z.enum(["app-shell", "flex", "custom", "any"]));
var widthModeSchema = z.enum(["barWidth", "lastBarWidth", "both"]);
var responsiveMetricSchema = z.number().or(z.record(z.string(), z.number()));
var skeletonTargetSchema = z.object({
  exportName: z.string(),
  selector: z.string(),
  widthMode: widthModeSchema.optional(),
  lineWrapGuardPx: z.number().min(0).optional()
});
var skeletonSliderSchema = z.object({
  itemSelector: z.string(),
  canonicalItemIdAttribute: z.string(),
  cloneAttribute: z.string().optional(),
  cloneValue: z.string().optional(),
  roles: z.array(
    z.object({
      role: z.string(),
      selector: z.string(),
      barHeight: responsiveMetricSchema,
      lineHeight: responsiveMetricSchema,
      lineWrapGuardPx: z.number().min(0).optional(),
      style: z.record(z.string(), z.unknown()).optional()
    })
  ),
  trackedItems: z.array(
    z.object({
      itemId: z.string(),
      roles: z.array(
        z.object({
          role: z.string(),
          exportName: z.string(),
          widthMode: widthModeSchema.optional()
        })
      )
    })
  ),
  rowHeightCompensationExportName: z.string()
});
var skeletonMasonrySchema = z.object({
  rootSelector: z.string().optional(),
  anchorSelector: z.string().optional(),
  itemSelector: z.string(),
  expectedItemCount: z.number().int().min(1).optional(),
  columns: z.record(z.string(), z.number()).optional()
});
var skeletonEntriesSchema = z.object({
  rootSelector: z.string().optional(),
  anchorSelector: z.string().optional(),
  entrySelector: z.string().optional(),
  expectedEntryCount: z.number().int().min(1).optional(),
  mountedAttribute: z.string().optional(),
  mountedValue: z.string().optional(),
  readyAttribute: z.string().optional(),
  readyValue: z.string().optional(),
  timeoutMs: z.number().min(0).optional()
});
function createRmgMcpServer(options = {}) {
  const server2 = new McpServer({
    name: "react-motion-gallery-mcp",
    version: "0.1.0"
  });
  registerResources(server2);
  registerTools(server2, {
    now: options.now ?? Date.now,
    probeRenderContext: options.probeRenderContext ?? probeRenderContext,
    renderReceiptStore: options.renderReceiptStore ?? new RenderReceiptStore()
  });
  registerPrompts(server2);
  return server2;
}
function registerResources(server2) {
  server2.resource("agent brief", "rmg://context/agent-brief", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: agentBriefGuide()
      }
    ]
  }));
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
  server2.resource("docs index", "rmg://docs", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({ docs: listPackageDocs() }, null, 2)
      }
    ]
  }));
  server2.resource(
    "package doc",
    new ResourceTemplate("rmg://docs/{docId}", {
      list: async () => ({
        resources: listPackageDocResources()
      })
    }),
    async (uri, variables) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: readPackageDoc(String(variables.docId))
        }
      ]
    })
  );
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
          "React Motion Gallery includes development-time browser measurement for text skeletons in any rendered DOM layout: sliders, grids, masonry, entries, thumbnails, flex layouts, app shells, cards, and custom UI.",
          "",
          "Use flat `targets` for ordinary DOM text. Add `slider`, `masonry`, or `entries` manifest metadata only when those specialized layouts need readiness or compensation behavior.",
          "",
          "Dry-run `scaffold_skeleton_text` to get the exact `probe_render_context` call. Apply the manifest only after passing the returned `receiptId` as `renderReceiptId`, then run:",
          "",
          "```bash",
          "npm run --silent generate:skeleton-text-module -- --input ./path/to/example.skeleton-text.browser.manifest.json --analysis-output ./path/to/example.measurements.json",
          "```",
          "",
          "The workflow opens a live page, measures real DOM text across viewports, and emits line counts, bar widths, optional text metrics, and optional responsive number exports such as slider row-height compensation."
        ].join("\n")
      }
    ]
  }));
  server2.resource("layout selection guide", "rmg://guides/layout-selection", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: layoutSelectionGuide()
      }
    ]
  }));
  server2.resource("loading fidelity guide", "rmg://guides/loading-fidelity", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: loadingFidelityGuide()
      }
    ]
  }));
  server2.resource(
    "browser measured skeleton guide",
    "rmg://guides/browser-measured-skeletons",
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: browserMeasuredSkeletonGuide()
        }
      ]
    })
  );
  server2.resource("skeleton cache guide", "rmg://guides/skeleton-cache", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: skeletonCacheGuide()
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
function registerTools(server2, options) {
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
      hasExistingLayout: z.boolean().optional(),
      limit: z.number().int().min(1).max(10).optional()
    },
    async (args) => jsonContent(recommendPattern(args))
  );
  server2.tool(
    "probe_render_context",
    "Launch a fresh headless Chrome tab and return a stable render receipt for a live page URL, viewport, selectors, and rendered state.",
    {
      url: z.string(),
      viewport: z.object({
        width: z.number().int().min(1),
        height: z.number().int().min(1),
        deviceScaleFactor: z.number().min(0).optional(),
        mobile: z.boolean().optional()
      }),
      selectors: z.array(z.string()).optional(),
      readyExpression: z.string().optional(),
      settleMs: z.number().min(0).optional(),
      stableGeometryFrames: z.number().int().min(1).optional(),
      timeoutMs: z.number().int().min(1).optional(),
      ttlMs: z.number().int().min(1).optional(),
      chromePath: z.string().optional()
    },
    async (args) => {
      try {
        const receipt = await options.probeRenderContext(args);
        options.renderReceiptStore.put(receipt);
        return jsonContent(receipt);
      } catch (error) {
        return jsonErrorContent(renderReceiptErrorPayload(error));
      }
    }
  );
  server2.tool(
    "classify_gallery_workflow",
    "Classify a React Motion Gallery request by layout intent and loading fidelity.",
    {
      goal: z.string(),
      hasExistingLayout: z.boolean().optional(),
      layoutHint: layoutHintSchema.optional(),
      framework: frameworkSchema.optional()
    },
    async (args) => jsonContent(classifyGalleryWorkflow(args))
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
      chromePath: z.string().optional(),
      viewportMin: z.number().int().min(1).optional(),
      viewportMax: z.number().int().min(1).optional(),
      viewportHeight: z.number().int().min(1).optional(),
      viewportWorkers: z.number().int().min(1).optional(),
      settleMs: z.number().min(0).optional(),
      stableGeometryFrames: z.number().int().min(1).optional(),
      readyExpression: z.string().optional(),
      lineWrapGuardPx: z.number().min(0).optional(),
      lineMeasurementMethod: z.literal("domRange").optional(),
      responsiveBy: z.enum(["viewport", "container"]).optional(),
      breakpointStrategy: z.enum(["lineChanges", "lineOrBarChanges"]).optional(),
      barWidthUnit: z.enum(["px", "percent"]).optional(),
      includeTextMetrics: z.boolean().optional(),
      targets: z.array(skeletonTargetSchema).optional(),
      slider: skeletonSliderSchema.optional(),
      masonry: skeletonMasonrySchema.optional(),
      entries: skeletonEntriesSchema.optional(),
      renderReceiptId: z.string().optional(),
      apply: z.boolean().optional()
    },
    async (args) => {
      const required = buildSkeletonRenderReceiptRequirement(args);
      const receiptValidation = options.renderReceiptStore.validate({
        receiptId: args.renderReceiptId,
        required,
        now: options.now()
      });
      const suggestedProbeRenderContextCall = {
        name: "probe_render_context",
        arguments: buildSkeletonRenderProbeRequest(args)
      };
      if (args.apply && receiptValidation.status !== "valid") {
        return jsonErrorContent(
          renderReceiptErrorPayload(buildRenderReceiptValidationError(receiptValidation))
        );
      }
      const result = scaffoldSkeletonText(args);
      return jsonContent({
        ...result,
        renderReceiptId: args.renderReceiptId ?? null,
        receiptStatus: receiptValidation.status,
        receiptIssues: receiptValidation.issues,
        ...receiptValidation.status === "valid" ? {
          renderStateHash: receiptValidation.receipt.stateHash
        } : {
          suggestedProbeRenderContextCall
        }
      });
    }
  );
}
function registerPrompts(server2) {
  server2.prompt(
    "build_layout_only",
    {
      appContext: z.string(),
      desiredExperience: z.string(),
      framework: frameworkSchema.optional()
    },
    ({ appContext, desiredExperience, framework }) => promptResponse([
      "Build a React Motion Gallery layout without skeleton loading.",
      "",
      `App context: ${appContext}`,
      `Desired experience: ${desiredExperience}`,
      `Framework: ${framework ?? "unknown"}`,
      "",
      "Classify this as layoutOnly. Choose the layout primitive, inspect relevant demos, import public package entry points, and do not add skeleton imports, manifests, or generated sidecars unless the user asks for loading UI."
    ])
  );
  server2.prompt(
    "build_layout_with_skeleton",
    {
      appContext: z.string(),
      desiredExperience: z.string(),
      skeletonFidelity: z.enum(["non-text", "hand-authored-text"]).optional(),
      framework: frameworkSchema.optional()
    },
    ({ appContext, desiredExperience, skeletonFidelity, framework }) => promptResponse([
      "Build a React Motion Gallery layout with skeleton loading.",
      "",
      `App context: ${appContext}`,
      `Desired experience: ${desiredExperience}`,
      `Skeleton fidelity: ${skeletonFidelity ?? "choose non-text unless text placeholders are requested"}`,
      `Framework: ${framework ?? "unknown"}`,
      "",
      "Use Skeleton rect/media/stack/row nodes or gallery-specific skeleton wrappers. If text placeholders are requested but browser measurement is not, hand-author lines/barWidth/lastBarWidth values. Do not create browser manifests or generated sidecars for this workflow."
    ])
  );
  server2.prompt(
    "build_layout_with_measured_text_skeleton",
    {
      appContext: z.string(),
      desiredExperience: z.string(),
      livePageUrl: z.string(),
      framework: frameworkSchema.optional()
    },
    ({ appContext, desiredExperience, livePageUrl, framework }) => promptResponse([
      "Build a React Motion Gallery layout with browser-measured skeleton text.",
      "",
      `App context: ${appContext}`,
      `Desired experience: ${desiredExperience}`,
      `Live page URL: ${livePageUrl}`,
      `Framework: ${framework ?? "unknown"}`,
      "",
      "Inspect real rendered text, add stable selectors, dry-run scaffold_skeleton_text for the suggested probe_render_context call, probe the live page, apply the scaffold with renderReceiptId, run generate:skeleton-text-module with --analysis-output, import the generated sidecar values, and wire them into skeleton text nodes. Use flat targets by default; add slider, masonry, or entries manifest metadata only when that layout needs it."
    ])
  );
  server2.prompt(
    "retrofit_skeleton_loading",
    {
      currentCodeSummary: z.string(),
      desiredLoadingExperience: z.string(),
      framework: frameworkSchema.optional()
    },
    ({ currentCodeSummary, desiredLoadingExperience, framework }) => promptResponse([
      "Retrofit skeleton loading into an existing React Motion Gallery or custom layout.",
      "",
      `Current code summary: ${currentCodeSummary}`,
      `Desired loading experience: ${desiredLoadingExperience}`,
      `Framework: ${framework ?? "unknown"}`,
      "",
      "Preserve existing layout behavior. Choose non-text, hand-authored text, or browser-measured text fidelity based on the request. If browser-measured text is needed, add selectors, dry-run scaffold_skeleton_text for the suggested probe_render_context call, apply with renderReceiptId, run the generator with --analysis-output, and import the generated sidecar values."
    ])
  );
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
function promptResponse(lines) {
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: lines.join("\n")
        }
      }
    ]
  };
}

// src/server.ts
var server = createRmgMcpServer();
var transport = new StdioServerTransport();
await server.connect(transport);
