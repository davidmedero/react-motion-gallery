import fs from "node:fs";
import path from "node:path";

import { repoPath, toPosixPath } from "./paths.js";

export type PackageDoc = {
  id: string;
  title: string;
  uri: string;
  path: string;
  whenToRead: string;
};

const packageDocs: PackageDoc[] = [
  {
    id: "readme",
    title: "React Motion Gallery README",
    uri: "rmg://docs/readme",
    path: repoPath("packages", "react-motion-gallery", "README.md"),
    whenToRead: "Use for package overview, entry points, API reference, and MCP setup examples.",
  },
  {
    id: "skeleton-text-authoring",
    title: "Skeleton Text Authoring",
    uri: "rmg://docs/skeleton-text-authoring",
    path: repoPath("packages", "react-motion-gallery", "docs", "skeleton-text-authoring.md"),
    whenToRead: "Use for the browser-based measured skeleton text manifest and generator workflow.",
  },
  {
    id: "public-api-inventory",
    title: "Public API Inventory",
    uri: "rmg://docs/public-api-inventory",
    path: repoPath("packages", "react-motion-gallery", "docs", "public-api-inventory.md"),
    whenToRead:
      "Use as the exhaustive inventory of package export paths and named public exports.",
  },
  {
    id: "entries-data-plugins",
    title: "Entries Data Plugins",
    uri: "rmg://docs/entries-data-plugins",
    path: repoPath("packages", "react-motion-gallery", "docs", "entries-data-plugins.md"),
    whenToRead: "Use for Entries pagination, items-per-page controls, session storage, load-more, infinite scroll, virtualization, URL sync, and data-window behavior.",
  },
  {
    id: "grid-masonry-data-plugins",
    title: "Grid And Masonry Data Plugins",
    uri: "rmg://docs/grid-masonry-data-plugins",
    path: repoPath("packages", "react-motion-gallery", "docs", "grid-masonry-data-plugins.md"),
    whenToRead: "Use for Grid and Masonry pagination, items-per-page controls, session storage, load-more, infinite scroll, virtualization, and child-window behavior.",
  },
  {
    id: "skeleton-text-codex-prompt",
    title: "Skeleton Text AI Agent Prompt",
    uri: "rmg://docs/skeleton-text-codex-prompt",
    path: repoPath("packages", "react-motion-gallery", "docs", "skeleton-text-codex-prompt.md"),
    whenToRead: "Use when instructing an AI agent to add or update measured skeleton text.",
  },
  {
    id: "license",
    title: "License",
    uri: "rmg://docs/license",
    path: repoPath("packages", "react-motion-gallery", "LICENSE.md"),
    whenToRead: "Use for package license terms.",
  },
  {
    id: "third-party-notices",
    title: "Third Party Notices",
    uri: "rmg://docs/third-party-notices",
    path: repoPath("packages", "react-motion-gallery", "THIRD_PARTY_NOTICES.md"),
    whenToRead: "Use for bundled third-party license notices.",
  },
];

export function listPackageDocs() {
  return packageDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    uri: doc.uri,
    path: toPosixPath(path.relative(repoPath(), doc.path)),
    whenToRead: doc.whenToRead,
  }));
}

export function listPackageDocResources() {
  return packageDocs.map((doc) => ({
    uri: doc.uri,
    name: doc.title,
    mimeType: "text/markdown",
    description: doc.whenToRead,
  }));
}

export function readPackageDoc(docId: string) {
  const doc = packageDocs.find((candidate) => candidate.id === docId);
  if (!doc) {
    throw new Error(`Unknown React Motion Gallery doc: ${docId}`);
  }
  return fs.readFileSync(doc.path, "utf8");
}

export function agentBriefGuide() {
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
    "The skeleton cookie snapshot cache is opt-in for slider skeletons. Import `SliderSkeleton` from `react-motion-gallery/skeleton/slider/restore` and pass `cache={{ key, routeKey }}`. In SSR apps, parse cookies with `react-motion-gallery/skeleton/cache` on the server, then pass snapshots through `SkeletonCacheProvider` from `react-motion-gallery/skeleton/cache/provider`.",
  ].join("\n");
}

export function layoutSelectionGuide() {
  return [
    "# React Motion Gallery Layout Selection",
    "",
    "- Use `Slider` for one active position, carousel navigation, grouped cells, loop, wheel, thumbnails, and slide plugins.",
    "- Use `Grid` for predictable responsive tracks, product/editorial grids, spans, and template columns.",
    "- Use default `Masonry` for dimensioned image grids; add `react-motion-gallery/masonry/fullscreen` for GalleryCore fullscreen; use `react-motion-gallery/masonry/measured` for arbitrary uneven text/card heights and structured skeleton text.",
    "- Use `Entries` when the content model is rows or cards of text, metadata, and coordinated media. Set `entries.layout` to `\"list\"` for stacked rows or `\"grid\"` for entry cards.",
    "- Use `ThumbnailSlider` or `FullscreenThumbnailSlider` when navigation should be visual.",
    "- Use `GalleryCore` and `useFullscreenController` when media should expand into fullscreen.",
    "- Use `ZoomPanImage` for inspectable cropped images without a fullscreen overlay.",
    "- Use standalone `Skeleton` for app shells, flex layouts, custom cards, and non-gallery loading UI.",
    "",
    "For custom layouts, keep the real markup ergonomic first, then choose skeleton fidelity separately. Skeleton text measurement does not require a gallery primitive; it only needs stable selectors on rendered DOM text and a live page URL.",
  ].join("\n");
}

export function loadingFidelityGuide() {
  return [
    "# React Motion Gallery Loading Fidelity",
    "",
    "Think of each request as layout intent plus loading fidelity.",
    "",
    "```text",
    "User goal: \"Build a responsive gallery slider.\"",
    "Workflow: layoutOnly",
    "Use: recommend_pattern -> get_demo -> generate_gallery_component",
    "Skip: skeleton tools",
    "```",
    "",
    "```text",
    "User goal: \"Build a product grid with image placeholders while loading.\"",
    "Workflow: layoutWithNonTextSkeleton",
    "Use: Skeleton rect/media nodes or gallery skeleton wrappers",
    "Skip: browser text measurement",
    "```",
    "",
    "```text",
    "User goal: \"Build a card layout with simple text skeleton lines.\"",
    "Workflow: layoutWithHandAuthoredTextSkeleton",
    "Use: text skeleton nodes with hand-authored lines/barWidth values",
    "Skip: generated sidecar",
    "```",
    "",
    "```text",
    "User goal: \"Build a masonry layout where skeleton text matches real responsive copy.\"",
    "Workflow: layoutWithBrowserMeasuredTextSkeleton",
    "Use: stable selectors -> probe_render_context -> scaffold_skeleton_text with renderReceiptId -> generate:skeleton-text-module --analysis-output -> import sidecar",
    "```",
    "",
    "If the user has an existing layout and asks to add or improve skeletons, classify it as `skeletonRetrofit` and preserve existing rendering behavior while choosing the smallest skeleton layer that meets the requested fidelity.",
  ].join("\n");
}

export function browserMeasuredSkeletonGuide() {
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
    "  \"projectRoot\": \"/absolute/path/to/app\",",
    "  \"manifestPath\": \"src/components/pricing.skeleton-text.browser.manifest.json\",",
    "  \"url\": \"http://127.0.0.1:3000/pricing?skeletonMeasure=content\",",
    "  \"outputFile\": \"src/components/pricing.skeleton-text.generated.ts\",",
    "  \"moduleExportName\": \"pricingSkeletonText\",",
    "  \"barWidthUnit\": \"px\",",
    "  \"includeTextMetrics\": true,",
    "  \"renderReceiptId\": \"rmg-render-...\",",
    "  \"targets\": [",
    "    {",
    "      \"exportName\": \"pricingCardTitle\",",
    "      \"selector\": \"[data-skeleton-text-id='pricingCardTitle']\"",
    "    }",
    "  ],",
    "  \"apply\": true",
    "}",
    "```",
  ].join("\n");
}

export function skeletonCacheGuide() {
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
    "import { cookies } from \"next/headers\";",
    "import { parseSkeletonCacheCookie, type SkeletonCacheSnapshot } from \"react-motion-gallery/skeleton/cache\";",
    "",
    "function readSkeletonCacheSnapshots(cookieStore: Awaited<ReturnType<typeof cookies>>) {",
    "  const snapshots: Record<string, SkeletonCacheSnapshot> = {};",
    "  for (const cookie of cookieStore.getAll()) {",
    "    if (!cookie.name.startsWith(\"rmg_skel_cache_\")) continue;",
    "    const snapshot = parseSkeletonCacheCookie(cookie.value);",
    "    if (snapshot) snapshots[snapshot.key] = snapshot;",
    "  }",
    "  return snapshots;",
    "}",
    "```",
    "",
    "```tsx",
    "\"use client\";",
    "import { SkeletonCacheProvider } from \"react-motion-gallery/skeleton/cache/provider\";",
    "import { SliderSkeleton } from \"react-motion-gallery/skeleton/slider/restore\";",
    "",
    "<SkeletonCacheProvider snapshots={skeletonCacheSnapshots}>",
    "  <SliderSkeleton",
    "    cache={{ key: \"portfolio-slider\", routeKey: \"/gallery\" }}",
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
    "- Do not use the cache as a persistence layer for user content; it is strictly first-paint geometry.",
  ].join("\n");
}
