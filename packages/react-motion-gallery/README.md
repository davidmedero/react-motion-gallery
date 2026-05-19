# React Motion Gallery

Composable React media gallery primitives for production interfaces: sliders, grids, masonry, structured entries, fullscreen, thumbnails, video, zoom/pan, and loading states that are designed around the layout they protect.

The package stays close to React composition. `Slider`, `Grid`, and `Masonry` render children directly; `Entries` renders structured data; `GalleryCore` coordinates fullscreen state; `Video` handles Plyr-backed media; `ZoomPanImage` gives you a standalone zoom surface; and `Skeleton` can be used inside or outside gallery layouts. For loading-state precision, the repo also includes a development-time browser measurement workflow that turns real rendered text into stable skeleton text authoring data, including reflow-sensitive layouts such as masonry.

## Runtime Gzip Sizes

This table reports local gzip measurements for selected runtime surfaces. Type-only imports are erased and add no JS; feature subpath rows measure only that feature entry point. The script rebundles one export at a time from its published ESM entry point, excludes peer and runtime externals, and gzips the resulting JS bundle. Run `npm run build && npm run size:readme` in `packages/react-motion-gallery` to refresh it.

<!-- bundle-size:start -->
| Surface | JS gzip |
| --- | --- |
| `Entries` | 15.9kB |
| `FullscreenThumbnailSlider` | 20.3kB |
| `GalleryCore` | 2.6kB |
| `Grid` | 6.3kB |
| `grid/ready` | 323.0B |
| `grid/lazy-load` | 3.3kB |
| `Masonry` | 6.5kB |
| `masonry/ready` | 323.0B |
| `masonry/lazy-load` | 3.3kB |
| `Skeleton base` | 10.9kB |
| `skeleton/slider` | 23.9kB |
| `skeleton/grid` | 13.2kB |
| `skeleton/masonry` | 22.1kB |
| `Slider core` | 18.7kB |
| `slider/ready` | 894.0B |
| `slider/arrows` | 1.2kB |
| `slider/dots` | 933.0B |
| `slider/progress` | 892.0B |
| `slider/scrollbar` | 1.2kB |
| `slider/auto-height` | 1.3kB |
| `slider/lazy-load` | 3.9kB |
| `slider/parallax` | 1.4kB |
| `slider/scale` | 1.2kB |
| `slider/fade` | 1.2kB |
| `slider/crossfade` | 2.8kB |
| `slider/fullscreen` | 959.0B |
| `ThumbnailSlider` | 18.9kB |
| `useFullscreenController` | 5.0kB |
| `fullscreen/slider` | 38.3kB |
| `fullscreen/controls` | 173.0B |
| `fullscreen/captions` | 13.1kB |
| `fullscreen/zoom-pan` | 9.9kB |
| `fullscreen/video` | 16.4kB |
| `fullscreen/lazy-load` | 13.2kB |
| `fullscreen/crossfade` | 181.0B |
| `fullscreen/thumbnails` | 160.0B |
| `Video` | 12.7kB |
| `ZoomPanImage` | 8.7kB |
| `media / toMediaItems` | 260.0B |
| `responsive / BREAKPOINT_MAP` | 85.0B |
<!-- bundle-size:end -->

## Installation

Install the package, then add the optional video peers only if you use `Video`.

```bash
npm install react-motion-gallery
npm install plyr plyr-react
```

Import the stylesheet. The package uses CSS Modules internally, but consumers only load the compiled plain CSS file, so no CSS Modules setup is required in your app.

```typescript
import "react-motion-gallery/styles.css";
```

## Overview

Mental model:

- `Slider`, `Grid`, and `Masonry` render React children directly.
- `Entries` renders structured entry data with a custom media container.
- `GalleryCore` and `useFullscreenController` power fullscreen behavior.
- `Video` is the gallery-ready video primitive.
- `ZoomPanImage` attaches click-to-zoom, drag pan, ctrl-wheel pinch, and touch pinch to one clipped image surface.
- `Skeleton` renders standalone placeholders or wraps real content with shared loading-layer timing.

`MediaItem` accepts three shapes:

- image: `{ kind: "image", src, alt?, caption?, srcSet?, sizes?, width?, height? }`
- video: `{ kind: "video", src, poster?, alt?, caption? }`
- node: `{ kind: "node", node }`

`toMediaItems()` accepts string URLs, image/video objects, and node objects, then normalizes them into `MediaItem[]`. String URLs infer `kind` from the file extension.

```typescript
import "react-motion-gallery/styles.css";
import { toMediaItems, type MediaItem } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";

const items: MediaItem[] = toMediaItems([
  "https://picsum.photos/id/1015/1600/900",
  { src: "https://picsum.photos/id/1018/1600/900", alt: "Mountains" },
  { kind: "node", node: <div>Custom slide</div> },
]);

export function QuickStart() {
  return (
    <Slider>
      {items.map((item, index) =>
        item.kind === "image" ? (
          <img
            key={item.src}
            src={item.src}
            alt={item.alt ?? `Slide ${index + 1}`}
            style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }}
          />
        ) : item.kind === "node" ? (
          <div key={index}>{item.node}</div>
        ) : null
      )}
    </Slider>
  );
}
```

Responsive numeric props in this package accept either a plain number or a breakpoint map like `{ 0: 1, md: 2, 1200: 3 }`. Named breakpoints resolve from the internal map: `xs: 0`, `sm: 600`, `md: 900`, `lg: 1200`, `xl: 1536`.

The package root exports the primary public components, helper functions, and companion prop types. Use it when one module needs several gallery surfaces. Prefer subpaths for routes or components that only need one surface, such as `react-motion-gallery/media` or `react-motion-gallery/slider`.

Subpaths give bundlers a smaller graph than the root. Less JS to transfer, parse, evaluate, and hydrate can improve first loads, cache misses, slower devices, and perceived speed.

| Entry point | Main surface |
| --- | --- |
| `react-motion-gallery/media` | `toMediaItems`, `MediaItem`, `MediaInput` |
| `react-motion-gallery/responsive` | `BREAKPOINT_MAP` and responsive value types |
| `react-motion-gallery/core` | `GalleryCore`, `GalleryCoreProvider`, `useGalleryCore` |
| `react-motion-gallery/slider` | `Slider`, `createSliderIndexChannel`, slider types |
| `react-motion-gallery/slider/ready` | `useSliderReady` |
| `react-motion-gallery/slider/arrows` | `sliderArrows` |
| `react-motion-gallery/slider/dots` | `sliderDots` |
| `react-motion-gallery/slider/progress` | `sliderProgress` |
| `react-motion-gallery/slider/scrollbar` | `sliderScrollbar` |
| `react-motion-gallery/slider/ripple` | `sliderRipple` |
| `react-motion-gallery/slider/auto-play` | `sliderAutoPlay` |
| `react-motion-gallery/slider/auto-scroll` | `sliderAutoScroll` |
| `react-motion-gallery/slider/auto-height` | `sliderAutoHeight` |
| `react-motion-gallery/slider/lazy-load` | `sliderLazyLoad` |
| `react-motion-gallery/slider/parallax` | `sliderParallax` |
| `react-motion-gallery/slider/scale` | `sliderScale` |
| `react-motion-gallery/slider/fade` | `sliderFade` |
| `react-motion-gallery/slider/crossfade` | `sliderCrossfade` |
| `react-motion-gallery/slider/fullscreen` | `sliderFullscreen` |
| `react-motion-gallery/slider/loading` | `sliderLoading` |
| `react-motion-gallery/grid` | `Grid`, `Grid.Item`, grid types |
| `react-motion-gallery/grid/ready` | `useGridReady` |
| `react-motion-gallery/grid/lazy-load` | `gridLazyLoad` |
| `react-motion-gallery/masonry` | `Masonry`, `Masonry.Item`, masonry types |
| `react-motion-gallery/masonry/ready` | `useMasonryReady` |
| `react-motion-gallery/masonry/lazy-load` | `masonryLazyLoad` |
| `react-motion-gallery/entries` | `Entries`, `flattenEntries`, entry media container helpers |
| `react-motion-gallery/skeleton/base` | Standalone `Skeleton` and generic skeleton authoring types |
| `react-motion-gallery/skeleton/slider` | `SliderSkeleton` and slider skeleton authoring types |
| `react-motion-gallery/skeleton/grid` | `GridSkeleton` and grid skeleton authoring types |
| `react-motion-gallery/skeleton/masonry` | `MasonrySkeleton` and masonry skeleton authoring types |
| `react-motion-gallery/skeleton/cache` | Server-safe skeleton cookie cache helpers and types |
| `react-motion-gallery/skeleton/cache/provider` | Client `SkeletonCacheProvider` for SSR snapshots and client cookie refresh |
| `react-motion-gallery/fullscreen` | `useFullscreenController` and fullscreen types |
| `react-motion-gallery/fullscreen/slider` | `fullscreenSlider` |
| `react-motion-gallery/fullscreen/controls` | `fullscreenControls` |
| `react-motion-gallery/fullscreen/captions` | `fullscreenCaptions` |
| `react-motion-gallery/fullscreen/zoom-pan` | `fullscreenZoomPan` |
| `react-motion-gallery/fullscreen/video` | `fullscreenVideo` |
| `react-motion-gallery/fullscreen/lazy-load` | `fullscreenLazyLoad` |
| `react-motion-gallery/fullscreen/crossfade` | `fullscreenCrossfade` |
| `react-motion-gallery/fullscreen/thumbnails` | `fullscreenThumbnails` |
| `react-motion-gallery/thumbnails` | `ThumbnailSlider`, thumbnail sync helpers |
| `react-motion-gallery/fullscreenThumbnails` | `FullscreenThumbnailSlider` |
| `react-motion-gallery/video` | `Video` and optional Plyr-backed video types |
| `react-motion-gallery/zoomPan` | `ZoomPanImage` and zoom/pan types |

## MCP server

This repository includes `react-motion-gallery-mcp`, a local Model Context Protocol server for AI-assisted gallery design and integration. It runs over stdio and gives MCP-capable clients a structured way to inspect React Motion Gallery patterns, generate starter components, audit installs, and scaffold skeleton text measurement manifests.

From a local checkout, build the server first:

```bash
npm install
npm run build --workspace packages/react-motion-gallery-mcp
```

Then add it to your MCP client config. Replace the path with the absolute path to your checkout:

```json
{
  "mcpServers": {
    "react-motion-gallery": {
      "command": "node",
      "args": [
        "/absolute/path/to/react-motion-gallery/packages/react-motion-gallery-mcp/dist/server.js"
      ]
    }
  }
}
```

Once connected, start with workflow classification. The MCP server treats requests as **layout intent plus loading fidelity**, so agents can avoid unnecessary skeleton work when the user only asked for a layout.

```json
{
  "goal": "Build a pricing card grid with simple skeleton loading",
  "hasExistingLayout": false,
  "layoutHint": "grid",
  "framework": "next"
}
```

The classifier returns one of these modes:

```text
User goal: "Build a responsive gallery slider."
Workflow: layoutOnly
Use: recommend_pattern -> get_demo -> generate_gallery_component
Skip: skeleton tools
```

```text
User goal: "Build a product grid with image placeholders while loading."
Workflow: layoutWithNonTextSkeleton
Use: Skeleton rect/media nodes or gallery skeleton wrappers
Skip: browser text measurement
```

```text
User goal: "Build a card layout with simple text skeleton lines."
Workflow: layoutWithHandAuthoredTextSkeleton
Use: text skeleton nodes with hand-authored lines/barWidth values
Skip: generated sidecar
```

```text
User goal: "Build a masonry layout where skeleton text matches real responsive copy."
Workflow: layoutWithBrowserMeasuredTextSkeleton
Use: stable selectors -> scaffold_skeleton_text -> generate:skeleton-text-module --analysis-output -> import sidecar
```

When a connected agent needs context, it should read `rmg://context/agent-brief`, then use targeted resources such as `rmg://guides/layout-selection`, `rmg://guides/loading-fidelity`, `rmg://guides/browser-measured-skeletons`, `rmg://docs`, `rmg://catalog/demos`, and `rmg://examples/{demoId}`.

Read a specific example:

```text
rmg://examples/slider-video-html5
```

Call `recommend_pattern` with your UI goal to choose the right layout, imports, demos, and gotchas.

```json
{
  "goal": "Responsive masonry gallery with lazy-loaded images and fullscreen preview",
  "layout": "masonry",
  "features": ["lazy-load", "fullscreen"],
  "mediaKinds": ["image"],
  "framework": "next"
}
```

Call `classify_gallery_workflow` when the user goal is ambiguous about loading fidelity.

```json
{
  "goal": "Add a skeleton that matches the real responsive card copy",
  "hasExistingLayout": true,
  "layoutHint": "custom",
  "framework": "next"
}
```

Call `search_demos` to find matching examples by category, tags, component, media kind, or query.

```json
{
  "category": "slider",
  "mediaKind": "video",
  "query": "html5",
  "limit": 3
}
```

Call `get_demo` to retrieve consumer-ready TSX/CSS for a specific demo.

```json
{
  "demoId": "slider-video-html5",
  "includeExtraFiles": true
}
```

Call `audit_project` with a `projectRoot` to check installs, stylesheet imports, optional video peers, and common Next.js client-component issues.

```json
{
  "projectRoot": "/absolute/path/to/your-app"
}
```

Call `generate_gallery_component` to turn a selected demo into renamed TSX/CSS output for your app.

```json
{
  "demoId": "masonry-balanced",
  "componentName": "ProjectGallery",
  "cssModuleName": "ProjectGallery.module.css"
}
```

Call `write_gallery_files` after reviewing generated output. Pass `apply: true` only when you want the server to write files under `projectRoot`.

```json
{
  "projectRoot": "/absolute/path/to/your-app",
  "demoId": "masonry-balanced",
  "componentName": "ProjectGallery",
  "componentPath": "src/components/ProjectGallery.tsx",
  "cssPath": "src/components/ProjectGallery.module.css",
  "apply": true
}
```

Call `scaffold_skeleton_text` to create a browser-measurement manifest for the skeleton text workflow.

```json
{
  "projectRoot": "/absolute/path/to/app",
  "manifestPath": "src/components/pricing.skeleton-text.browser.manifest.json",
  "url": "http://127.0.0.1:3000/pricing?skeletonMeasure=content",
  "outputFile": "src/components/pricing.skeleton-text.generated.ts",
  "moduleExportName": "pricingSkeletonText",
  "barWidthUnit": "px",
  "includeTextMetrics": true,
  "targets": [
    {
      "exportName": "pricingCardTitle",
      "selector": "[data-skeleton-text-id='pricingCardTitle']"
    }
  ],
  "apply": true
}
```

Use flat `targets` for ordinary DOM text in any layout: sliders, grids, masonry cards, entries, thumbnails, flex layouts, app shells, pricing cards, and custom UI. Add the optional `slider`, `masonry`, or `entries` manifest blocks only when those specialized layouts need canonical item measurement, geometry readiness, or row readiness.

The file-writing tools default to dry runs unless `apply: true` is passed, and they refuse to write outside the provided `projectRoot`.

## Acknowledgements

React Motion Gallery's slider engine includes portions of code derived from [Embla Carousel](https://github.com/davidjerleke/embla-carousel), which is MIT licensed. Those portions have been substantially adapted for React Motion Gallery's React architecture, public API, transition system, fullscreen integration, loading layers, and media workflows.

See [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) for the preserved Embla Carousel copyright and MIT license notice.

## Core

`GalleryCore` is the shared state boundary for fullscreen-aware galleries. Wrap a layout in it when you need shared breakpoints, a normalized fullscreen media list, fullscreen-open state, or programmatic fullscreen opening. `useGalleryCore()` is the public hook for reading that core state from descendants.

### `GalleryCore` props

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `—` | The gallery tree using the shared core. |
| `layout` | `"slider" \| "grid" \| "masonry" \| "entries"` | `—` | Declares the owning base layout. Omit it for standalone fullscreen/core usage. |
| `breakpoints` | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Breakpoint map shared with descendants. |
| `fullscreenItems` | `MediaItem[] \| string[]` | `[]` | Normalized fullscreen media list. |
| `nodes` | `ReactNode \| ReactNode[]` | `—` | Advanced initial node list used by the slider-backed imperative state. |

### `useGalleryCore` API

`GalleryApi` is the public alias for `GalleryCoreApi`. It covers core fullscreen state and programmatic fullscreen opening. Slider item mutation lives on `SliderHandle` and `SliderApi`.

| Field / Method | Type | Notes |
| --- | --- | --- |
| `layout` | `"slider" \| "grid" \| "masonry" \| "entries" \| null` | Current owning layout, or `null` for standalone fullscreen/core usage. |
| `effectiveBreakpoints` | `Record<string, number>` | Breakpoint map after merging custom `GalleryCore.breakpoints` with defaults. |
| `normalizedItems` | `MediaItem[]` | Fullscreen item list normalized from `fullscreenItems`. |
| `fsEnabled` | `boolean` | `true` when a mounted fullscreen controller has enabled fullscreen behavior. |
| `setFsEnabled` | `(enabled: boolean) => void` | Enables or disables fullscreen behavior. Usually handled by `useFullscreenController`. |
| `isFullscreenOpen` | `boolean` | `true` while fullscreen is open. |
| `isFullscreenOpenRef` | `React.RefObject<boolean>` | Ref mirror for handlers that need the current fullscreen-open state. |
| `setFullscreenOpen` | `(open: boolean) => void` | Updates fullscreen-open state. Usually handled by the fullscreen runtime. |
| `openFullscreenAt` | `({ index, method?, event? }) => void` | Opens fullscreen at a normalized fullscreen item index. Pass the source event for scale-origin detection. |
| `notifyBaseVisibleIndex` | `(index: number) => void` | Emits the visible base media index for fullscreen lazy-load/prewarm coordination. |
| `notifyFsVisibleIndex` | `(index: number) => void` | Emits the active fullscreen index back to base media. |
| `registerExpandableImage` | `(index: number, node: HTMLElement \| null) => void` | Registers an origin surface for layoutless scale transitions. |

## ZoomPanImage

```typescript
import { ZoomPanImage } from "react-motion-gallery/zoomPan";

export function ZoomPanCard() {
  return (
    <ZoomPanImage
      src="https://picsum.photos/id/1035/1600/1200"
      alt="A hiker looking over a canyon at dusk"
      className="zoomCard"
      zoom={{
        clickZoomLevel: 2.35,
        maxZoomLevel: 3.5,
      }}
    />
  );
}
```

`ZoomPanImage` is the lightweight standalone zoom surface. The component root is the clipping container, so border radius, aspect ratio, and overflow all live on the same element.

## Skeleton

```typescript
import { Skeleton, type SkeletonNode } from "react-motion-gallery/skeleton/base";

const shellSkeleton: SkeletonNode = {
  kind: "rect",
  style: { width: "100%", height: 320 },
};

export function LoadingShell({ ready, children }: { ready: boolean; children: React.ReactNode }) {
  return (
    <Skeleton
      layout={shellSkeleton}
      ready={ready}
      timing={{ exitMs: 520, minVisibleMs: 220 }}
      force={false}
      ariaLabel={ready ? undefined : "Loading content"}
    >
      {children}
    </Skeleton>
  );
}
```

`Skeleton` can render a standalone placeholder by itself, or it can wrap real content and own the loading transition. Wrapper mode is enabled when `children` are provided.

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `layout` | `SkeletonNode` | `—` | Structured placeholder layout tree. |
| `children` | `React.ReactNode` | `—` | Real content. When present, `Skeleton` renders content and loading layers. |
| `ready` | `boolean` | `false` | Reveals content and exits the skeleton once true. |
| `enabled` | `boolean` | `true` | Set false to render content immediately with no skeleton layer. |
| `force` | `boolean \| { enabled?: boolean; showContent?: boolean; skeletonOpacity?: number }` | `false` | Keeps the skeleton visible. Set `showContent: true` to preview ready content under the skeleton, and tune the overlay with `skeletonOpacity`. |
| `timing.exitMs` | `number` | `600` | Keeps the skeleton layer mounted for this long after exit starts and controls the opacity transition. |
| `timing.minVisibleMs` | `number` | `220` | Minimum time the skeleton stays visible before exit can begin. |
| `shellClassName` / `shellStyle` | `string` / `CSSProperties` | `—` | Wrapper-layer class and style for content+skeleton mode. |
| `contentClassName` / `contentStyle` | `string` / `CSSProperties` | `—` | Content-layer class and style for wrapper mode. |
| `cache` | `SkeletonCacheOptions` | `—` | Opts into the cookie snapshot cache. Available on standalone `Skeleton`, `SliderSkeleton`, `GridSkeleton`, `MasonrySkeleton`, and `Entries.loading.cache`. |

The wrapper timing model matches the gallery loading layers: content begins fading in as soon as the skeleton exit starts; it does not wait for the skeleton to unmount.

### Browser-measured skeleton text authoring

Responsive text is one of the easiest places for a polished loading state to drift away from the real UI. React Motion Gallery's skeleton text workflow measures real DOM text in a live page with headless Chrome, then emits `lines`, `barWidth`, `lastBarWidth`, and optional `barHeight`/`lineHeight` values for the skeleton `text` nodes used by `Slider`, `Grid`, `Masonry`, `Entries`, and standalone `Skeleton` layouts.

This is development-time authoring support, not production client code. It is especially useful for multiline cards, responsive grids, equal-height sliders, and reflow-sensitive masonry surfaces where a generic text placeholder can otherwise change row height, item height, or column packing when real content appears.

```bash
npm run --silent generate:skeleton-text-module -- \
  --input ./path/to/example.skeleton-text.browser.manifest.json \
  --analysis-output ./path/to/example.skeleton-text.measurements.json
```

Use `responsiveBy: "container"` when text wrapping follows the card or cell width more closely than the viewport. For equal-height card sliders, the browser analyzer can also measure all canonical slider items and emit `rowHeightCompensation` so unseen cards cannot surprise the skeleton row height. See [`docs/skeleton-text-authoring.md`](./docs/skeleton-text-authoring.md) for manifest fields, command options, and the Codex-friendly workflow.

### Skeleton cookie snapshot cache

The skeleton cookie snapshot cache is an opt-in SSR acceleration path for skeletons with expensive responsive text or layout geometry. The first visit uses the normal responsive skeleton CSS. After hydration, and again after debounced resizes, the client measures the active rendered content/skeleton geometry and writes a compact cookie. On a later server render, a valid cookie lets the skeleton render only the active snapshot values instead of the full responsive text CSS table.

This exists because very accurate skeletons can require a lot of responsive text CSS, especially when text wrapping affects masonry packing or card heights. Client-only storage such as `sessionStorage` cannot help SSR because the server cannot read it and the browser only gets it after the document starts executing. A cookie is available during SSR, so the server can reserve the correct first-paint geometry before hydration.

What the cache stores:

- cache version, cache key, scope id, route key, timestamp, viewport width, and active width bucket
- measured skeleton text records keyed by `textId`: line count, per-line widths, and optional bar metrics
- masonry-only active geometry: variant key, shell height, and item heights
- slider-only restore state when enabled: active index, measured shell height, slide count, skeleton slot count, route key, scope id, viewport width, and timestamp
- no text strings, no media URLs, and no full CSS text

Benefits:

- first visit remains unchanged and uses the full responsive skeleton behavior
- later reloads can parse much less skeleton CSS for the active breakpoint
- text-heavy masonry, grid, slider, entries, and standalone skeletons can keep layout stability while reducing first-paint CSS work
- cache-backed slider restore can render the restored slot order and auto-height before the slider handle is ready
- stale, expired, route-mismatched, scope-mismatched, or malformed cookies silently fall back to the normal responsive path

Defaults: `ttlMs` is `10 * 60 * 1000`, `debounceMs` is `250`, cookie `path` is `/`, and `sameSite` is `lax`. Use a stable `key` per skeleton surface and a stable `routeKey` when a skeleton only applies to one route.

For skeleton text to be measurable, the skeleton `text` node needs a `textId`, and the matching real content text needs `data-skeleton-text-id`. Browser-generated skeleton text modules include `textId` automatically, so existing spreads such as `...skeletonText.body` are cache-ready.

```typescript
const cardBodySkeleton = {
  kind: "text",
  textId: "cardBody",
  barHeight: 14,
  lineHeight: 1.45,
  lines: { 0: 4, 900: 3, 1200: 2 },
} as const;

function CardBody({ children }: { children: React.ReactNode }) {
  return <p data-skeleton-text-id="cardBody">{children}</p>;
}
```

In SSR frameworks, read cache cookies on the server with the server-safe helper entry, then pass valid snapshots into a client provider. This example parses all React Motion Gallery skeleton cache cookies for the route.

```tsx
// app/gallery/page.tsx
import { cookies } from "next/headers";
import {
  parseSkeletonCacheCookie,
  type SkeletonCacheSnapshot,
} from "react-motion-gallery/skeleton/cache";
import { GalleryPageClient } from "./GalleryPageClient";

function readSkeletonCacheSnapshots(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  const snapshots: Record<string, SkeletonCacheSnapshot> = {};

  for (const cookie of cookieStore.getAll()) {
    if (!cookie.name.startsWith("rmg_skel_cache_")) continue;

    const snapshot = parseSkeletonCacheCookie(cookie.value);
    if (snapshot) snapshots[snapshot.key] = snapshot;
  }

  return snapshots;
}

export default async function GalleryPage() {
  const snapshotMap = readSkeletonCacheSnapshots(await cookies());

  return <GalleryPageClient skeletonCacheSnapshots={snapshotMap} />;
}
```

Wrap the client tree in `SkeletonCacheProvider`, then opt individual skeletons in with `cache={{ key, routeKey }}`. Per-skeleton `cache.snapshot` takes precedence over provider snapshots when you need to pass one directly. The provider uses server snapshots for hydration, then refreshes readable cache cookies on later client mounts and history restores so back/forward navigation can pick up snapshots written after the original server render.

```tsx
// app/gallery/GalleryPageClient.tsx
"use client";

import type { SkeletonCacheSnapshot } from "react-motion-gallery/skeleton/cache";
import { SkeletonCacheProvider } from "react-motion-gallery/skeleton/cache/provider";
import { MasonrySkeleton } from "react-motion-gallery/skeleton/masonry";
import { Masonry } from "react-motion-gallery/masonry";
import { useMasonryReady } from "react-motion-gallery/masonry/ready";

export function GalleryPageClient({
  skeletonCacheSnapshots,
}: {
  skeletonCacheSnapshots: Record<string, SkeletonCacheSnapshot | null | undefined>;
}) {
  const { ref, ready } = useMasonryReady();

  return (
    <SkeletonCacheProvider snapshots={skeletonCacheSnapshots}>
      <MasonrySkeleton
        cache={{
          key: "portfolio-masonry",
          routeKey: "/gallery",
        }}
        layout={portfolioSkeleton}
        ready={ready}
        masonry={{
          count: items.length,
          columns: { 0: 1, 720: 2, 1140: 4 },
          gap: { 0: 12, 1140: 18 },
        }}
      >
        <Masonry ref={ref} columns={{ 0: 1, 720: 2, 1140: 4 }}>
          {items.map((item) => (
            <Masonry.Item key={item.id}>{/* real card */}</Masonry.Item>
          ))}
        </Masonry>
      </MasonrySkeleton>
    </SkeletonCacheProvider>
  );
}
```

Use the same `cache` object on `SliderSkeleton`, `GridSkeleton`, and standalone `Skeleton`. For `Entries`, put it under `entries.loading.cache`.

```tsx
<Entries
  entries={{
    items,
    mediaLayout: "grid",
    loading: {
      cache: {
        key: "editorial-entries",
        routeKey: "/stories",
      },
      skeleton: entrySkeleton,
    },
  }}
/>
```

Cookie options can be tuned per skeleton:

```tsx
<GridSkeleton
  cache={{
    key: "product-grid",
    routeKey: "/products",
    ttlMs: 5 * 60 * 1000,
    debounceMs: 150,
    cookie: {
      path: "/",
      sameSite: "lax",
    },
  }}
  layout={productGridSkeleton}
/>
```

## Slider

The default `Slider` is the small synchronous core: children, drag, wheel navigation, snapping, grouping, looping, index channels, intro, and the imperative ref API. Heavier behavior is opt-in through first-party plugins, so importing one feature, such as arrows or parallax, does not pull in the rest of the slider feature set. Structured slider skeletons and restore behavior are owned by `SliderSkeleton`, composed with `useSliderReady()`.

```typescript
import { Slider } from "react-motion-gallery/slider";
import { sliderArrows } from "react-motion-gallery/slider/arrows";

const slides = [
  "https://picsum.photos/id/1015/1600/900",
  "https://picsum.photos/id/1018/1600/900",
  "https://picsum.photos/id/1024/1600/900",
];

export function BasicSlider() {
  return (
    <Slider plugins={[sliderArrows()]}>
      {slides.map((src, index) => (
        <img key={src} src={src} alt={`Slide ${index + 1}`} style={{ width: "100%" }} />
      ))}
    </Slider>
  );
}
```

### Slider component props

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `—` | Slide content rendered in order. |
| `initialIndex` | `number` | `0` | Selects the slide index used for the first layout and intro fade-in. |
| `breakpoints` | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Merged with the internal breakpoint map for responsive values. |
| `indexChannel` | `SliderIndexChannel` | internal channel | Share index state with thumbnails or sibling sliders. |
| `plugins` | `SliderPlugin[]` | `[]` | Explicit first-party slider features such as arrows, dots, auto-height, effects, fullscreen, or lazy-load. |

### Slider layout and scroll options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `layout.gap` | `number \| Record<string, number>` | `20` | Responsive gap between cells. |
| `layout.cellsPerSlide` | `number \| Record<string, number>` | `—` | Groups multiple cells into a slide page. |
| `direction.dir` | `"ltr" \| "rtl"` | `"ltr"` | Text direction and arrow direction. |
| `direction.axis` | `"x" \| "y"` | `"x"` | Horizontal or vertical slider axis. |
| `align` | `"start" \| "center"` | `"start"` | Slide alignment inside the viewport. |
| `scroll.groupCells` | `boolean` | `false` | Scrolls by grouped cells instead of every cell. |
| `scroll.skipSnaps` | `boolean \| { enabled?: boolean; threshold?: number }` | `false` | Allows momentum to skip snap points. Object form enables skip snaps by default and `threshold` requires release force to reach a multiple of the adjacent snap distance before multi-snap momentum is used. |
| `scroll.strictSnaps` | `boolean` | `false` | Prevents one drag release from settling more than one snap away from where the drag started. Overrides `scroll.skipSnaps`. |
| `scroll.freeScroll` | `boolean` | `false` | Enables free dragging instead of strict snapping. |
| `scroll.loop` | `boolean` | `false` | Wraps around at the ends. |

### Slider element and plugin options

`elements`, `motion`, and `transitions.intro` stay in the core slider. Controls, autoplay, lazy media, effects, auto-height, fullscreen, and loading overlays are explicit plugin imports.

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `elements.viewport` | `ElementStyle` | `—` | Class and inline style for the viewport element. |
| `elements.container` | `ElementStyle` | `—` | Class and inline style for the moving slider container. |
| `transitions.intro.renderIntro` | `({ active, containerProps }, content) => ReactNode` | `—` | Custom intro wrapper. |
| `transitions.intro.staggerMs` | `number` | `—` | Delay between item fade-ins. |
| `transitions.intro.durationMs` | `number` | `—` | Intro fade duration. |
| `transitions.intro.easing` | `string` | `—` | Intro fade easing. |

### Slider plugins

Each plugin is imported from its own subpath and passed to `plugins`. There is no aggregate controls or effects helper; this keeps one-feature imports as small as possible.

```typescript
import { Slider } from "react-motion-gallery/slider";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderParallax } from "react-motion-gallery/slider/parallax";

<Slider plugins={[sliderArrows(), sliderParallax({ bleedPct: "8%" })]}>
  {slides}
</Slider>;
```

| Import | Factory | Notes |
| --- | --- | --- |
| `react-motion-gallery/slider/arrows` | `sliderArrows(options)` | Previous/next arrows. |
| `react-motion-gallery/slider/dots` | `sliderDots(options)` | Pagination dots. |
| `react-motion-gallery/slider/progress` | `sliderProgress(options)` | Progress bar or custom progress renderer. |
| `react-motion-gallery/slider/scrollbar` | `sliderScrollbar(options)` | Range-style position control. |
| `react-motion-gallery/slider/ripple` | `sliderRipple(options)` | Enables ripple feedback for controls that call `createRipple`. |
| `react-motion-gallery/slider/auto-play` | `sliderAutoPlay(options)` | Timed slide changes. |
| `react-motion-gallery/slider/auto-scroll` | `sliderAutoScroll(options)` | Timed continuous advancement. |
| `react-motion-gallery/slider/auto-height` | `sliderAutoHeight(options)` | Measures active slide height and gates slider readiness until measured. |
| `react-motion-gallery/slider/lazy-load` | `sliderLazyLoad(options)` | Adds lazy media attributes to slide images and videos. |
| `react-motion-gallery/slider/parallax` | `sliderParallax(options)` | Parallax slide wrapper. |
| `react-motion-gallery/slider/scale` | `sliderScale(options)` | Scales non-active slides. |
| `react-motion-gallery/slider/fade` | `sliderFade(options)` | Fades non-active slides. |
| `react-motion-gallery/slider/crossfade` | `sliderCrossfade(options)` | Enables crossfade-aware control navigation. |
| `react-motion-gallery/slider/fullscreen` | `sliderFullscreen()` | Bridges a `GalleryCore layout="slider"` slider to fullscreen. |
| `react-motion-gallery/slider/loading` | `sliderLoading(options)` | Basic custom loading overlay. Prefer `SliderSkeleton` for structured skeleton and restore. |

### Slider loading skeletons

Use `SliderSkeleton` to own slider loading. `useSliderReady()` exposes the slider ref plus a settled `ready` flag; `isSlidesBuilt()` remains a lower-level DOM-built signal and is not the right fade-out trigger.

`layout.slots` is the per-slide override system. Define the shared placeholder once with `layout.item` and `layout.itemWrapStyle`, then override any individual slot with `slots[index]`. Slot `itemWrapStyle` values merge on top of the base wrap style, while `slot.item` can replace the placeholder node entirely for that slot.

`itemWrapStyle` now supports wrapper-only `border` and `boxShadow` values. Wrapper `width`, `height`, and `aspectRatio` are treated as outer border-box dimensions, so the inner placeholder shrinks by the border thickness. Use simple uniform border shorthands such as `1px solid #cbd5e1` when you want the built-in sizing math to account for the border width.

`text` nodes render one skeleton bar per `lines` value. `barHeight` controls the bar height and can be a single number or a numeric min-width map. `lineHeight` remains the full line-box multiplier and now accepts the same numeric min-width maps. `lines` can be a single number or a numeric min-width map such as `{ 0: 3, 767: 2, 1200: 1 }`. Use `lastBarWidth` to override the shortened trailing bar width; it defaults to `68%` of the text block width and can also be responsive with numeric min-width keys.

`centering: "first"` is designed for center-aligned peek sliders. When the real slider uses `align="center"` and the skeleton uses `mode: "peek"` with `layout.kind: "slider"`, the skeleton renderer inserts the leading spacer needed to center the first visible placeholder. You should not add that spacer manually.

When you provide `SliderSkeleton.timing`, `exitMs` controls both how long the loading layer remains mounted after exit starts and its opacity transition duration.

For sliders that need reload or back/forward restore, pair `SliderSkeleton.restore` with the same skeleton `cache` key. When cache is enabled, the restore payload is written into the skeleton cache cookie alongside text measurements. A valid cached restore can reserve the restored auto-height and slot order immediately, and `SliderSkeleton` can seed a direct `Slider` child with `initialIndex` before the handle is ready.

```tsx
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { sliderAutoHeight } from "react-motion-gallery/slider/auto-height";

const sliderCache = { key: "story-slider", routeKey: "/stories" };

export function RestoredAutoHeightSlider() {
  const slider = useSliderReady();

  return (
    <SliderSkeleton
      cache={sliderCache}
      layout={storySliderSkeleton}
      ready={slider.ready}
      restore={{
        kind: "slider",
        enabled: true,
        key: sliderCache.key,
        slider: { handleRef: slider.handleRef },
        itemCount: slides.length,
        visibleCount: 3,
        loop: true,
        activeSlotOffset: 1,
      }}
    >
      <Slider
        ref={slider.ref}
        align="center"
        scroll={{ loop: true }}
        plugins={[sliderAutoHeight()]}
      >
        {slides.map((slide) => (
          <Slide key={slide.id} slide={slide} />
        ))}
      </Slider>
    </SliderSkeleton>
  );
}
```

Keep `restore.key` stable and match it to the cache key for cache-backed restore. `itemCount` must match the real slide count, while `visibleCount`, `loop`, and `activeSlotOffset` should mirror the skeleton layout and slider scroll behavior. If the skeleton wraps a single custom child that does not already provide `initialIndex`, `SliderSkeleton` seeds that child with the cached restored index. If you pass your own `initialIndex`, wrap the slider in another component, or render multiple children, wire the initial index yourself; the restore fallback can still correct after mount, but it is not as first-paint precise. The default first slide is treated as no-op restore state unless the page also needs bottom-scroll preservation.

```typescript
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";

const slides = [
  { src: "https://picsum.photos/id/1020/660/960", width: 220, height: 320 },
  { src: "https://picsum.photos/id/1029/1020/630", width: 340, height: 320 },
  { src: "https://picsum.photos/id/1039/780/840", width: 260, height: 320 },
];

export function VariableWidthSkeletonSlider() {
  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <SliderSkeleton
      ready={sliderReady}
      layout={{
        mode: "peek",
        centering: "first",
        visibleCount: 2,
        layout: {
          kind: "slider",
          direction: "row",
          style: { gap: 20 },
          item: {
            kind: "rect",
            style: {
              width: "100%",
              height: "100%",
              borderRadius: 12,
            },
          },
          slots: slides.map((slide) => ({
            itemWrapStyle: {
              width: slide.width,
              height: slide.height,
            },
          })),
        },
      }}
    >
      <Slider ref={sliderRef} align="center">
        {slides.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={`Slide ${index + 1}`}
            style={{ width: slide.width, height: slide.height, objectFit: "cover" }}
          />
        ))}
      </Slider>
    </SliderSkeleton>
  );
}
```

#### `SliderSkeletonSpec`

| Field | Type | Notes |
| --- | --- | --- |
| `mode` | `"fit" \| "peek"` | `"peek"` preserves partial next or previous slide visibility in the loading state. |
| `centering` | `"first"` | Adds the leading spacer needed for the first visible slot when using the built-in centered peek skeleton flow. |
| `visibleCount` | `number \| Record<string, number>` | Responsive count of visible skeleton slots. |
| `className` | `string \| undefined` | Applied to the skeleton overlay root. |
| `style` | `React.CSSProperties \| undefined` | Inline styles for the skeleton overlay root. |
| `layout` | `SliderSkeletonNode \| undefined` | Structured placeholder layout tree. Use `kind: "slider"` to model slide tracks. |
| `backgroundColor` | `string \| undefined` | Overrides the shared skeleton background color token. |
| `radius` | `number \| string \| undefined` | Overrides the shared skeleton radius token. |
| `shimmer` | `SkeletonShimmer \| undefined` | Shared shimmer settings for the entire skeleton tree. |

#### `SliderSkeletonSliderNode`

| Field | Type | Notes |
| --- | --- | --- |
| `kind` | `"slider"` | Slider-specific skeleton layout root. |
| `style` | `SkeletonContainerStyle \| Record<string, SkeletonContainerStyle>` | Track-level container styles such as `gap`, `padding`, `align`, `justify`, `width`, and `maxWidth`. |
| `count` | `number \| undefined` | Optional explicit slot count for the layout. Falls back to `visibleCount` on the surrounding slider skeleton spec. |
| `item` | `SkeletonNode` | Default placeholder node rendered in each slot. |
| `itemWrapStyle` | `SliderSkeletonWrapStyle \| undefined` | Shared wrapper size, margin, border, and box-shadow rules for every slot. Border sizing is border-box. |
| `slots` | `SliderSkeletonSlot[] \| undefined` | Per-slot overrides for variable widths, heights, aspect ratios, or custom placeholder nodes. |
| `direction` | `"row" \| "col" \| undefined` | Slot flow direction. `centering: "first"` only affects row layouts. |
| `children` | `SkeletonNode[] \| undefined` | Optional extra skeleton content rendered after the slider row. It does not affect `--rmg-slider-initial-height` or reserve live layout space. |

#### `SliderSkeletonSlot`

| Field | Type | Notes |
| --- | --- | --- |
| `item` | `SkeletonNode \| undefined` | Replaces the base `layout.item` for one slot. |
| `itemWrapStyle` | `SliderSkeletonWrapStyle \| undefined` | Merges on top of the base `layout.itemWrapStyle` for one slot, including wrapper borders and shadows. |

`SkeletonNode` supports these building blocks: `rect`, `square`, `circle`, `text`, `media`, `row`, `col`, and `stack`. `text.barHeight` controls the bar height, `text.lines` controls how many wrapped skeleton rows render for that text block, and `text.lastBarWidth` controls the trailing bar width.

### Slider motion options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `motion.selectDuration` | `number` | `25` | Duration for snapped selection motion. |
| `motion.freeScrollDuration` | `number` | `43` | Duration for free-scroll settling. |
| `motion.friction` | `number` | `0.68` | Drag and settling friction. |

### Slider render callback args

#### `ArrowRenderArgs`

| Field | Type | Notes |
| --- | --- | --- |
| `ref` | `React.RefObject<HTMLDivElement \| null>` | Attach to the arrow root. |
| `onClick` | `() => void` | Calls the built-in previous or next action. |
| `hidden` | `boolean` | `true` when the arrow should not render visually. |
| `disabled` | `boolean` | `true` when navigation is unavailable. |
| `createRipple` | `(el: HTMLElement) => void` | Triggers the built-in ripple effect manually. |
| `className` | `string \| undefined` | Resolved class name for the arrow root. |

#### `DotsRenderArgs`

| Field | Type | Notes |
| --- | --- | --- |
| `ref` | `React.RefObject<HTMLDivElement \| null>` | Attach to the dots root. |
| `count` | `number` | Dot count. |
| `activeIndex` | `number` | Current selected slide index. |
| `hidden` | `boolean` | `true` when dots should be hidden. |
| `goTo` | `(index: number) => void` | Navigate to a slide. |
| `getDotRef` | `(index: number) => (el: HTMLDivElement \| null) => void` | Ref factory for each dot. |
| `createRipple` | `(el: HTMLElement) => void` | Manual ripple trigger. |
| `classNameContainer` | `string \| undefined` | Resolved root class name. |
| `classNameDot` | `string \| undefined` | Resolved dot class name. |

#### `ProgressRenderArgs`

| Field | Type | Notes |
| --- | --- | --- |
| `ref` | `React.Ref<HTMLDivElement>` | Attach to the progress root. |
| `innerRef` | `React.Ref<HTMLDivElement> \| undefined` | Attach to the fill element. |
| `hidden` | `boolean` | `true` when the progress bar should be hidden. |
| `progress` | `number` | Progress value from `0` to `1`. |
| `axis` | `"x" \| "y"` | Fill direction. |
| `className` | `string \| undefined` | Root class name. |
| `style` | `React.CSSProperties \| undefined` | Root inline style. |
| `innerClassName` | `string \| undefined` | Fill class name. |
| `innerStyle` | `React.CSSProperties \| undefined` | Fill inline style. |

### `SliderHandle` methods

| Method | Signature | Notes |
| --- | --- | --- |
| `centerSlider` | `() => void` | Re-centers the slider after layout changes. |
| `getIndex` | `() => number` | Current active slide index. |
| `setIndex` | `(i: number, mode?: IndexMode) => void` | Jumps or animates to a slide. |
| `subscribeIndex` | `(fn: () => void) => () => void` | Subscribes to index changes. |
| `slideIndexForCell` | `(cellIndex: number) => number` | Maps a cell index to its slide index when using grouped cells. |
| `getRootNode` | `() => HTMLElement \| null` | Outer slider root. |
| `getContainerNode` | `() => HTMLElement \| null` | Moving slide container. |
| `getSlideNodes` | `() => HTMLElement[]` | Current slide elements. |
| `getViewportNode` | `() => HTMLDivElement \| null` | Scroll viewport. |
| `onSlidesBuilt` | `(cb: (nodes: HTMLElement[]) => void) => () => void` | Runs when slide nodes are ready. |
| `whenSlidesBuilt` | `() => Promise<HTMLElement[]>` | Promise form of `onSlidesBuilt`. |
| `isSlidesBuilt` | `() => boolean` | `true` once the slide list is ready. |
| `onReady` | `(cb: (nodes: HTMLElement[]) => void) => () => void` | Runs when the slider has built, measured, committed its index, and all plugin ready gates have cleared. |
| `whenReady` | `() => Promise<HTMLElement[]>` | Promise form of `onReady`. |
| `isReady` | `() => boolean` | `true` once the settled slider ready signal has fired. |
| `scrollNext` | `(mode?: IndexMode) => void` | Advances one step. |
| `scrollPrev` | `(mode?: IndexMode) => void` | Moves backward one step. |
| `canScrollNext` | `() => boolean` | Whether next navigation is available. |
| `canScrollPrev` | `() => boolean` | Whether previous navigation is available. |
| `scrollProgress` | `() => number` | Current progress from `0` to `1`. |
| `cellsInView` | `() => number[]` | Canonical cell indexes currently visible. |
| `append` | `(nodes: ReactNode \| ReactNode[]) => number` | Appends nodes and returns the new total count. |
| `prepend` | `(nodes: ReactNode \| ReactNode[]) => number` | Prepends nodes and returns the new total count. |
| `insert` | `(index: number, nodes: ReactNode \| ReactNode[]) => number` | Inserts nodes and returns the new total count. |
| `remove` | `(indexOrPredicate: number \| ((i: number) => boolean)) => number` | Removes items and returns the new total count. |
| `replace` | `(index: number, node: ReactNode) => void` | Replaces a node at an index. |
| `setItems` | `(nodes: ReactNode[]) => number` | Replaces all nodes and returns the new total count. |
| `onIndexChange` | `(cb: (i: number, meta: { mode: IndexMode }) => void) => () => void` | Subscribes to index changes. |
| `getInternals` | `() => { slides, slider, visibleImages, selectedIndex, sliderX, sliderVelocity, isWrapping }` | Low-level internals used by fullscreen and advanced sync code. |

### `createSliderIndexChannel`

```typescript
import { Slider, createSliderIndexChannel } from "react-motion-gallery";

const channel = createSliderIndexChannel();

export function SharedIndexSlider() {
  return (
    <Slider indexChannel={channel}>
      <div>One</div>
      <div>Two</div>
      <div>Three</div>
    </Slider>
  );
}
```

| Method | Signature | Notes |
| --- | --- | --- |
| `createSliderIndexChannel` | `(initialIndex = 0, initialMode = "animated") => SliderIndexChannel` | Creates a shared index event bus. |
| `get` | `() => { index: number; mode: IndexMode }` | Reads the stored index and mode. |
| `set` | `(next: number, mode?: IndexMode, opts?: { silent?: boolean }) => void` | Sets the current index and emits a `"set"` event unless silenced. |
| `bump` | `(delta: number, mode?: IndexMode, opts?: { silent?: boolean }) => void` | Emits a relative index change event. |
| `subscribe` | `(fn: () => void) => () => void` | Subscribes to channel updates. |
| `onEvent` | `(fn: (ev: IndexEvent) => void) => () => void` | Receives the last `"set"` or `"bump"` event payload. |
| `onBasePointerDown` | `(fn: () => void) => () => void` | Subscribes to base slider pointer-down events. |
| `emitBasePointerDown` | `() => void` | Broadcasts a pointer-down event to subscribers. |

### ThumbnailSlider

Use `ThumbnailSlider` when you want a synced thumbnail rail for a base `Slider`. In the common case, share one `createSliderIndexChannel()` instance and pass it to both components.

```typescript
import {
  Slider,
  ThumbnailSlider,
  createSliderIndexChannel,
} from "react-motion-gallery";

const slides = [
  "https://picsum.photos/id/1015/1600/900",
  "https://picsum.photos/id/1018/1600/900",
  "https://picsum.photos/id/1024/1600/900",
];

const channel = createSliderIndexChannel();

export function SliderWithThumbnails() {
  return (
    <>
      <Slider indexChannel={channel}>
        {slides.map((src, index) => (
          <img key={src} src={src} alt={`Slide ${index + 1}`} style={{ width: "100%" }} />
        ))}
      </Slider>
      <ThumbnailSlider
        indexChannel={channel}
        options={{
          layout: { position: "bottom", gap: 8, thumbnail: { width: 88, height: 56 } },
          scroll: { centerActiveThumb: true },
          controls: { enabled: true },
        }}
      >
        {slides.map((src, index) => (
          <img
            key={`thumb-${src}`}
            src={src}
            alt={`Thumbnail ${index + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ))}
      </ThumbnailSlider>
    </>
  );
}
```

The component forwards a ref to its outer thumbnail shell.

### ThumbnailSlider component props

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `—` | Thumbnail nodes rendered in order. Overrides `options.children` when both are provided. |
| `options` | `ThumbnailsOptions` | `—` | Base thumbnail configuration object. |
| `indexChannel` | `SliderIndexChannel` | internal channel | Share the same channel as a base `Slider` to keep selection in sync. |
| `breakpoints` | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Used to resolve `layout.position` and responsive loading counts. |
| `onThumbnailClick` | `(index: number) => void` | `—` | Fired when a thumbnail click publishes a selection to the shared channel. |
| `onReadyChange` | `(ready: boolean) => void` | `—` | Fired when the thumbnail rail finishes or re-enters its loading/layout cycle. |
| `direction` | `"ltr" \| "rtl"` | `"ltr"` | Affects horizontal arrow direction and RTL scroll behavior. |

### Thumbnail layout and scroll options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `—` | Fallback thumbnail content when component children are omitted. |
| `layout.position` | `ResponsivePosition` | `"bottom"` | Thumbnail rail position: `"top"`, `"right"`, `"bottom"`, or `"left"`. |
| `layout.gap` | `number` | `8` | Gap between thumbnails. |
| `layout.center` | `boolean` | `false` | Centers the overall rail content within its container when possible. |
| `layout.thumbnail.width` | `number \| string` | `—` | Width for each thumbnail item. |
| `layout.thumbnail.height` | `number \| string` | `—` | Height for each thumbnail item. |
| `layout.container.width` | `number \| string` | `—` | Width for the outer thumbnail container. |
| `layout.container.height` | `number \| string` | `—` | Height for the outer thumbnail container. |
| `scroll.freeScroll` | `boolean` | `true` | Enables drag or wheel movement without strict snapping. |
| `scroll.groupCells` | `boolean` | `false` | Pages the rail by grouped thumbnail cells. |
| `scroll.loop` | `boolean` | `false` | Wraps thumbnails at the ends. |
| `scroll.skipSnaps` | `boolean` | `false` | Allows momentum to skip snap points. |
| `scroll.centerActiveThumb` | `boolean` | `false` | Repositions the rail to keep the active thumbnail centered. |

`ResponsivePosition` accepts a single side, an array, or a breakpoint map. For arrays, the first entry is used.

### Thumbnail element, control, and motion options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `elements.container` | `ElementStyle` | `—` | Class and inline style for the outer thumbnail container. |
| `elements.thumbnail` | `ElementStyle` | `—` | Class and inline style for each thumbnail item shell. |
| `controls.enabled` | `boolean` | `false` | Shows previous and next arrows when the rail overflows. |
| `controls.arrow` | `ElementStyle` | `—` | Shared arrow class and style. |
| `controls.prev` | `ElementStyle` | `—` | Previous-arrow override. |
| `controls.next` | `ElementStyle` | `—` | Next-arrow override. |
| `controls.render` | `(args: ArrowRenderArgs & { dir: "prev" \| "next" }) => ReactNode` | `—` | Custom renderer for both thumbnail arrows. |
| `controls.renderPrev` | `(args: ArrowRenderArgs) => ReactNode` | `—` | Custom previous arrow. |
| `controls.renderNext` | `(args: ArrowRenderArgs) => ReactNode` | `—` | Custom next arrow. |
| `controls.ripple.enabled` | `boolean` | `true` | Enables ripple feedback for thumbnail arrows. |
| `controls.ripple.className` | `string` | `—` | Custom ripple class for the arrow feedback element. |
| `motion.selectDuration` | `number` | `25` | Duration for snapped thumbnail selection motion. |
| `motion.freeScrollDuration` | `number` | `43` | Duration for free-scroll settling. |
| `motion.friction` | `number` | `0.68` | Drag and settling friction. |
| `breakpointMap` | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Override map used for responsive thumbnail positions and loading counts. |

### Thumbnail transition options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `transitions.loading.enabled` | `boolean` | `true` | Enables the thumbnail loading layer. |
| `transitions.loading.force` | `boolean \| { enabled?: boolean; showContent?: boolean; skeletonOpacity?: number }` | `false` | Forces the loading layer to remain visible. Set `showContent: true` to preview the real thumbnails under the skeleton, and tune the loading overlay with `skeletonOpacity`. |
| `transitions.loading.skeletonCount` | `number \| Record<string, number>` | `—` | Responsive count for the built-in loading placeholders. |
| `transitions.loading.mode` | `"fit" \| "peek"` | `"peek"` | `"peek"` keeps fixed-size thumbnail placeholders when width or height is explicitly set; `"fit"` divides the rail evenly across the visible count. |
| `transitions.loading.elements.container` | `ElementStyle` | `—` | Class and inline style for the built-in loading overlay container. |
| `transitions.loading.elements.row` | `ElementStyle` | `—` | Class and inline style for the built-in skeleton row or column wrapper. |
| `transitions.loading.elements.thumbnail` | `ElementStyle` | `—` | Class and inline style for each built-in thumbnail placeholder. |
| `transitions.loading.renderLoading` | `({ count }) => ReactNode` | `—` | Replaces the built-in thumbnail loading skeleton and receives the resolved responsive count. |
| `transitions.loading.timing.exitMs` | `number` | `600` | Keeps the thumbnail loading layer mounted for this long after exit starts. |
| `transitions.loading.timing.minVisibleMs` | `number` | `220` | Minimum time the loading layer stays visible before exit can begin. |
| `transitions.intro.renderIntro` | `({ active, containerProps }, inner) => ReactNode` | `—` | Custom intro wrapper for the thumbnail rail. |
| `transitions.intro.staggerMs` | `number` | `40` | Delay between thumbnail fade-ins. |
| `transitions.intro.durationMs` | `number` | `300` | Intro fade duration. |
| `transitions.intro.easing` | `string` | `"cubic-bezier(.2,.7,.2,1)"` | Intro fade easing. |

`transitions.loading.elements.*` only applies to the built-in thumbnail skeleton. If you provide `transitions.loading.renderLoading`, you fully own the loading markup instead.

The built-in thumbnail placeholders use the same shimmer variable family as slider skeletons: `--rmg-skel-bg`, `--rmg-skel-shimmer-enabled`, `--rmg-skel-shimmer-opacity`, `--rmg-skel-shimmer-filter`, `--rmg-skel-shimmer-angle`, `--rmg-skel-shimmer-c1`, `--rmg-skel-shimmer-c2`, `--rmg-skel-shimmer-c3`, `--rmg-skel-shimmer-duration`, and `--rmg-skel-shimmer-timing`.

For thumbnails, `transitions.loading.timing.exitMs` controls both the mounted exit lifetime and the loading-layer opacity fade. The thumbnail intro can begin as soon as the loading exit starts.

### `createThumbnailSyncBridge`

`ThumbnailSlider` creates and starts this bridge for you internally when you pass `indexChannel`. Reach for `createThumbnailSyncBridge()` only when you need to wire a local thumbnail rail to an external slider channel manually.

| Method | Signature | Notes |
| --- | --- | --- |
| `createThumbnailSyncBridge` | `(args: { localChannel, externalChannel?, clampIndex? }) => ThumbnailSyncBridge` | Creates a bridge between local thumbnail state and an optional external slider channel. |
| `start` | `() => () => void` | Starts syncing and returns a cleanup function. |
| `stop` | `() => void` | Stops syncing without disposing the channels. |
| `publishThumbnailClick` | `(index: number, mode?: IndexMode) => void` | Publishes a thumbnail click to the external slider channel. |

## Grid

```typescript
import { Grid } from "react-motion-gallery";

const images = Array.from({ length: 6 }, (_, index) => ({
  src: `https://picsum.photos/seed/grid-${index}/1200/1200`,
  alt: `Grid item ${index + 1}`,
}));

export function BasicGrid() {
  return (
    <Grid columns={{ 0: 1, 640: 2, 960: 3 }} gap={{ 0: 12, 960: 20 }}>
      {images.map((image) => (
        <img key={image.src} src={image.src} alt={image.alt} style={{ width: "100%" }} />
      ))}
    </Grid>
  );
}
```

### Grid component props

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `—` | Grid items rendered in order. Wrap individual cards in `Grid.Item` when they need custom spans or wrapper props. |
| `breakpoints` | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Used to resolve responsive columns and gaps. |
| `gridItemBaseClass` | `string` | `"rmg__grid-item"` | Internal item base class override. |
| `renderMode` | `"wrap" \| "passthrough"` | `"wrap"` | `wrap` adds an item wrapper; `passthrough` keeps child structure closer to the source node. |

### Grid.Item props

`Grid.Item` is a metadata wrapper. It renders only its children, while Grid reads the wrapper props and applies them to the generated item shell.

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `—` | The grid card content. |
| `span` | `number \| "full" \| Record<string, number \| "full">` | `1` | Per-item track span. `"full"` renders `grid-column: 1 / -1`; numeric values render `grid-column: span n / span n`. |
| `className` | `string` | `—` | Extra class name merged onto the grid item wrapper. |
| `style` | `React.CSSProperties` | `—` | Inline styles merged onto the grid item wrapper. |

### Grid options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | `number \| Record<string, number>` | `—` | Fixed responsive column count. When omitted, Grid auto-fits using `minColumnWidth`. |
| `templateColumns` | `string \| Record<string, string>` | `—` | Explicit `grid-template-columns` value. Takes precedence over `columns` and `minColumnWidth`. |
| `minColumnWidth` | `number \| string` | `160` | Minimum width used by auto-fit mode. |
| `gap` | `number \| Record<string, number>` | `8` | Responsive grid gap. |
| `rootClassName` | `string` | `—` | Class name for the grid root. |
| `itemClassName` | `string` | `—` | Class name added to each wrapped grid item. |
| `fullscreenTrigger` | `"item" \| "media"` | `"media"` | Opens fullscreen from the clicked media node or the entire item shell. |
| `plugins` | `GridPlugin[]` | `[]` | Explicit first-party Grid features such as lazy-load. |
| `intro.renderIntro` | `({ active, containerProps }, content) => ReactNode` | `—` | Custom intro wrapper. |
| `intro.staggerMs` | `number` | `60` | Reveal stagger for the fade-in. |
| `intro.durationMs` | `number` | `600` | Intro fade duration. |
| `intro.easing` | `string` | `"cubic-bezier(.2,.7,.2,1)"` | Intro fade easing. |
| `intro.staggerLimit` | `number` | `—` | Optional cap on how many items stagger. |

### Grid plugins

Import Grid plugins from their own subpaths and pass them to `plugins`.

```typescript
import { Grid } from "react-motion-gallery/grid";
import { gridLazyLoad } from "react-motion-gallery/grid/lazy-load";

<Grid plugins={[gridLazyLoad({ spinner: true })]}>{items}</Grid>;
```

| Import | Factory | Notes |
| --- | --- | --- |
| `react-motion-gallery/grid/lazy-load` | `gridLazyLoad(options)` | Rewrites trackable image `src` values into `data-rmg-lazy-src`, reveals them on viewport intersection, then fades them in after decode and spinner exit. |

`gridLazyLoad()` enables lazy loading by default. Pass `{ enabled: false }` to make the plugin inert.

Grid fullscreen behavior is provided by `GalleryCore` and `useFullscreenController`; Grid itself does not expose a ref-based imperative API.

Wrap a card in `Grid.Item` when it should span tracks or needs wrapper styling:

```typescript
<Grid columns={{ 0: 1, 720: 6, 1100: 12 }} gap={{ 0: 12, 1100: 18 }}>
  <Grid.Item span={{ 0: "full", 720: 3, 1100: 6 }} className="feature-card">
    <FeatureCard />
  </Grid.Item>
  <Grid.Item span={{ 0: "full", 720: 3, 1100: 3 }}>
    <ProductCard />
  </Grid.Item>
  <Grid.Item span="full">
    <WideEditorialCard />
  </Grid.Item>
</Grid>
```

Grid spans require explicit tracks: use `columns` or `templateColumns`. If Grid is in auto-fit mode through `minColumnWidth`, item spans are ignored because there is no stable track count to span. Responsive span maps use the same breakpoint keys as responsive numeric props, so named keys such as `md` and numeric keys such as `900` are both valid.

Use `templateColumns` when the tracks themselves need custom proportions:

```typescript
<Grid
  templateColumns={{
    0: "1fr",
    900: "minmax(0, 1.4fr) minmax(0, 1fr)",
    1200: "minmax(0, 2fr) repeat(2, minmax(0, 1fr))",
  }}
  gap={{ 0: 12, 1200: 18 }}
>
  <Grid.Item span={{ 0: "full", 900: 2 }}>
    <FeatureCard />
  </Grid.Item>
</Grid>
```

Grid no longer owns loading UI. Use `useGridReady` and wrap Grid with `GridSkeleton`, the same composition pattern used by Slider and Masonry.

Grid skeletons live in `react-motion-gallery/skeleton/grid`. Their `text` nodes use the same wrapped-line treatment as slider skeletons, including responsive `barHeight` and `lines` maps plus the configurable trailing `lastBarWidth`.

Grid skeletons inherit real item spans by default. Slot overrides in the Skeleton layout can change individual placeholder nodes or wrapper styles without losing the span applied by `Grid.Item`.

When Grid is wrapped in `GridSkeleton`, `GridSkeleton.timing.exitMs` controls both how long the loading layer stays mounted after exit starts and its opacity transition, and the real grid intro begins as soon as exit starts.

```typescript
import { Grid, useGridReady } from "react-motion-gallery";
import { GridSkeleton, type GridSkeletonSpec } from "react-motion-gallery/skeleton/grid";

const gridSkeleton: GridSkeletonSpec = {
  radius: 14,
  layout: {
    kind: "grid",
    count: 6,
    item: {
      kind: "rect",
      style: { aspectRatio: "4 / 5" },
    },
  },
};

function GridWithSkeleton({ images }: { images: { src: string; alt: string }[] }) {
  const { ref: gridRef, ready: gridReady } = useGridReady();

  return (
    <GridSkeleton
      layout={gridSkeleton}
      ready={gridReady}
      timing={{ minVisibleMs: 220, exitMs: 600 }}
      grid={{
        count: images.length,
        columns: { 0: 1, 640: 2, 960: 3 },
        gap: { 0: 12, 960: 20 },
      }}
    >
      <Grid
        ref={gridRef}
        columns={{ 0: 1, 640: 2, 960: 3 }}
        gap={{ 0: 12, 960: 20 }}
      >
        {images.map((image) => (
          <img key={image.src} src={image.src} alt={image.alt} />
        ))}
      </Grid>
    </GridSkeleton>
  );
}
```

## Masonry

```typescript
import { Masonry } from "react-motion-gallery";

const cards = [280, 360, 220, 420, 300, 340];

export function BasicMasonry() {
  return (
    <Masonry columns={{ 0: 1, 700: 2, 1100: 3 }} gap={{ 0: 12, 1100: 20 }}>
      {cards.map((height, index) => (
        <img
          key={index}
          src={`https://picsum.photos/seed/masonry-${index}/1000/${height * 3}`}
          alt={`Masonry item ${index + 1}`}
          style={{ width: "100%", height, objectFit: "cover", borderRadius: 12 }}
        />
      ))}
    </Masonry>
  );
}
```

### Masonry component props

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `—` | Masonry items rendered in order. Wrap individual cards in `Masonry.Item` when they need custom spans or wrapper props. |
| `breakpoints` | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Used to resolve responsive columns and gaps. |

### Masonry.Item props

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `—` | The masonry card content. |
| `span` | `number \| "full" \| Record<string, number \| "full">` | `1` | Per-item track span. `"full"` resolves to the active column count and numeric values clamp to the current track count. |
| `className` | `string` | `—` | Extra class name merged onto the masonry item wrapper. |
| `style` | `React.CSSProperties` | `—` | Inline styles merged onto the masonry item wrapper. |

### Masonry options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | `number \| Record<string, number>` | `—` | Responsive column count. |
| `gap` | `number \| Record<string, number>` | `—` | Responsive gap between columns and items. |
| `placement` | `"balanced" \| "roundRobin" \| "horizontalOrder"` | `"balanced"` | `balanced` packs into the shortest fitting column group, `roundRobin` cycles start columns deterministically, and `horizontalOrder` preserves a stronger left-to-right scan when spans are involved. |
| `fullscreenTrigger` | `"item" \| "media"` | `"media"` | Opens fullscreen from the clicked media node or the entire masonry item shell. |
| `itemWrapClassName` | `string` | `—` | Class name added to the masonry item wrapper. |
| `itemWrapStyle` | `React.CSSProperties` | `—` | Inline styles applied to the masonry item wrapper. |
| `as` | `React.ElementType` | `"div"` | Root HTML element or custom component. |
| `rootRef` | `React.Ref<HTMLDivElement>` | `—` | Ref to the masonry root. |
| `classNames.root` | `string` | `—` | Root class name. |
| `classNames.column` | `string` | `—` | Retained for backwards compatibility with the legacy column-wrapper renderer. |
| `classNames.item` | `string` | `—` | Item class name. |
| `plugins` | `MasonryPlugin[]` | `[]` | Explicit first-party Masonry features such as lazy-load. |
| `intro.renderIntro` | `({ active, containerProps }, content) => ReactNode` | `—` | Custom intro wrapper. |
| `intro.staggerMs` | `number` | `160` | Reveal stagger for the fade-in. |
| `intro.durationMs` | `number` | `600` | Intro fade duration. |
| `intro.easing` | `string` | `"cubic-bezier(.2,.7,.2,1)"` | Intro fade easing. |
| `intro.staggerLimit` | `number` | `—` | Optional cap on how many items stagger. |

### Masonry plugins

Import Masonry plugins from their own subpaths and pass them to `plugins`.

```typescript
import { Masonry } from "react-motion-gallery/masonry";
import { masonryLazyLoad } from "react-motion-gallery/masonry/lazy-load";

<Masonry plugins={[masonryLazyLoad({ spinner: true })]}>{items}</Masonry>;
```

| Import | Factory | Notes |
| --- | --- | --- |
| `react-motion-gallery/masonry/lazy-load` | `masonryLazyLoad(options)` | Uses the same image shell behavior as Slider: trackable image `src` values move into `data-rmg-lazy-src`, real images load on intersection, and items fade in after decode and spinner exit. |

`masonryLazyLoad()` enables lazy loading by default. Pass `{ enabled: false }` to make the plugin inert.

Masonry already accepts arbitrary React children, including text-containing JSX. The wrapper props are only for styling the built-in masonry item shell.

Wrap a card in `Masonry.Item` when it needs its own span, wrapper `className`, or wrapper `style`:

```typescript
<Masonry
  columns={{ 0: 1, 760: 2, 1160: 4 }}
  gap={{ 0: 12, 1160: 18 }}
  placement="horizontalOrder"
>
  <Masonry.Item span={{ 0: 1, 760: 2, 1160: 2 }}>
    <FeatureCard />
  </Masonry.Item>
  <Masonry.Item span={1}>
    <StandardCard />
  </Masonry.Item>
</Masonry>
```

Choose a placement based on what should feel stable:

- `balanced`: best when visual balance and the shortest overall columns matter most.
- `roundRobin`: best when deterministic column assignment matters more than tight packing.
- `horizontalOrder`: best when wider cards should still read in a mostly left-to-right order.

Masonry no longer owns loading UI. Use `useMasonryReady` and wrap Masonry with `MasonrySkeleton`, the same composition pattern used by Slider and Grid.

Masonry skeletons live in `react-motion-gallery/skeleton/masonry` and can use a structured `layout` spec with the same inner node vocabulary as Grid skeletons, including `text` nodes and `itemWrapStyle`.

Live Masonry content mounts invisibly until the current item set has completed an initial measurement pass. The Skeleton wrapper stays visible during that handoff, so the first revealed layout is based on measured DOM geometry rather than approximate height hints.

`layout.slots` gives Masonry the same per-card override escape hatch that slider skeletons have. Use a slot when one card needs a different placeholder tree, wrapper styling, span, or outer height. `slot.span` can override the corresponding `Masonry.Item` span for the placeholder, `slot.ratio` maps to Masonry's card-height rhythm, and `slot.heightPx` lets you pin a specific shell height when you need an exact placeholder.

```typescript
import { Masonry, useMasonryReady } from "react-motion-gallery";
import {
  MasonrySkeleton,
  type MasonrySkeletonSpec,
} from "react-motion-gallery/skeleton/masonry";

const masonrySkeleton: MasonrySkeletonSpec = {
  ratios: [118, 126, 102, 146],
  layout: {
    kind: "masonry",
    itemWrapStyle: {
      padding: 14,
      borderRadius: 20,
      boxShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
    },
    item: {
      kind: "col",
      style: { gap: 12 },
      children: [
        {
          kind: "rect",
          style: { width: "100%", height: 180, borderRadius: 16 },
        },
        {
          kind: "text",
          barHeight: 14,
          lineHeight: 1.55,
          lines: 3,
          lastBarWidth: "74%",
          style: { width: "100%" },
        },
      ],
    },
    slots: [
      {
        ratio: 182,
        span: { 0: 1, 1100: 2 },
        item: {
          kind: "rect",
          style: { width: "100%", aspectRatio: "3 / 5", borderRadius: 16 },
        },
      },
    ],
  },
};

function MasonryWithSkeleton({ items }: { items: React.ReactNode[] }) {
  const { ref: masonryRef, ready: masonryReady } = useMasonryReady();

  return (
    <MasonrySkeleton
      layout={masonrySkeleton}
      ready={masonryReady}
      timing={{ minVisibleMs: 220, exitMs: 600 }}
      masonry={{
        count: items.length,
        columns: { 0: 1, 700: 2, 1100: 3 },
        gap: { 0: 12, 1100: 20 },
        placement: "balanced",
      }}
    >
      <Masonry
        ref={masonryRef}
        columns={{ 0: 1, 700: 2, 1100: 3 }}
        gap={{ 0: 12, 1100: 20 }}
        itemWrapStyle={{
          padding: "6px",
          borderRadius: "28px",
        }}
      >
        {items}
      </Masonry>
    </MasonrySkeleton>
  );
}
```

## Entries

`Entries` is the structured-data surface. You pass entry objects, render each media item however you want, and provide a `renderMediaContainer` function that decides whether an entry’s media should be laid out as a slider, grid, or masonry block.

```typescript
import * as React from "react";
import {
  Entries,
  GalleryCore,
  Slider,
  flattenEntries,
  type SliderHandle,
} from "react-motion-gallery";

const entries = [
  {
    id: "a",
    title: "Entry A",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/a1/1400/900", alt: "A1" },
      { kind: "image", src: "https://picsum.photos/seed/a2/1400/900", alt: "A2" },
    ],
  },
  {
    id: "b",
    title: "Entry B",
    media: [{ kind: "image", src: "https://picsum.photos/seed/b1/1400/900", alt: "B1" }],
  },
] as const;

export function EntryGallery() {
  const flat = React.useMemo(() => flattenEntries(entries as any), []);
  const fullscreenItems = flat.flattenedMedia;

  return (
    <GalleryCore layout="entries" fullscreenItems={fullscreenItems}>
      <Entries
        entries={{
          items: entries as any,
          mediaLayout: "slider",
          render: {
            card: ({ entry, media }) => (
              <article style={{ display: "grid", gap: 12 }}>
                <h3>{entry.title}</h3>
                {media}
              </article>
            ),
            media: ({ media, mediaIndex }) =>
              media.kind === "image" ? (
                <img key={mediaIndex} src={media.src} alt={media.alt ?? ""} style={{ width: "100%" }} />
              ) : null,
          },
        }}
        fullscreen={{ enabled: true }}
        renderMediaContainer={({ entryIndex, mediaNodes, entrySliderRefs }) => (
          <Slider
            ref={(node: SliderHandle | null) => {
              if (entrySliderRefs?.current) entrySliderRefs.current[entryIndex] = node;
            }}
          >
            {mediaNodes}
          </Slider>
        )}
      />
    </GalleryCore>
  );
}
```

### Entry loading, decode, and reveal flow

When `loading.enabled` is true, entries use two viewport gates instead of one generic fade-in. `loading.nearMargin` marks a row as near the viewport, mounts the real entry content, and starts the entry media work early. `loading.viewMargin` and `loading.threshold` record when the row has actually entered view.

With `loading.waitForDecode` enabled, an entry does not reveal as soon as it intersects. The built-in gate waits for every trackable media URL in that entry to load and decode; in the current entry-level gate, that means image media in the entry’s `media` array. It falls back after `loading.decodeTimeoutMs`, and entries without image media are decode-ready immediately. The row fades from skeleton to content only after both conditions are true: the row has entered view and the entry media decode gate is ready.

Reveal timing is assigned when each entry becomes ready, so entries fade in by actual load/decode completion order as well as viewport intersection. A later row that loads quickly can take the next reveal slot while a slower row keeps its skeleton visible until its media is ready.

Fullscreen close has a matching entry-aware path. If the user closes fullscreen from a slide whose owning entry has not been viewed yet, the runtime resolves the flattened fullscreen index back to the owner entry, shows a temporary loading spinner while that row mounts and decodes, scrolls the owner entry into view, forces the skeleton/content layers to their final revealed state, and then runs the close animation back to the now-visible entry media. This keeps the close animation from landing on an unrevealed skeleton or an offscreen row.

### `Entries` component props

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Master switch for rendering entry content and transitions. |
| `entries` | `EntriesOptions` | `—` | Structured entry configuration. |
| `fullscreen.enabled` | `boolean` | `true` | Enables fullscreen opening for entry media. |
| `fullscreen.items` | `MediaItem[] \| string[]` | flattened entry media | Optional fullscreen media override. |
| `renderMediaContainer` | `({ entryIndex, mediaNodes, entrySliderRefs }) => ReactNode` | `—` | Chooses how each entry’s media nodes are laid out. |
| `nodeFromMedia` | `(media: MediaItem) => ReactNode` | built-in image/video renderer | Fallback renderer when `entries.render.media` is omitted. |
| `entryFlatIndexRef` | `React.RefObject<number[][] \| null>` | internal ref | Receives per-entry local-to-global media index maps. |
| `entryMapRef` | `React.RefObject<MediaEntryLink[] \| null>` | internal ref | Receives the flattened media-to-entry map. |
| `fsOwnersRef` | `React.RefObject<SlideOwner[]>` | internal ref | Receives the fullscreen slide owner list. |
| `entrySliderRefs` | `React.RefObject<(SliderHandle \| null)[]>` | internal ref | Lets `renderMediaContainer` wire fullscreen back to per-entry sliders. |

### `EntriesOptions`

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `EntryItem[]` | `—` | Entry records. Each item can hold arbitrary fields plus `media`. |
| `mediaLayout` | `"slider" \| "grid" \| "masonry"` | `"slider"` | Declares the intended media layout. |
| `render.card` | `({ entry, entryIndex, media }) => ReactNode` | `—` | Wraps the media container in custom card UI. |
| `render.media` | `({ entry, entryIndex, media, mediaIndex }) => ReactNode` | `—` | Custom media renderer per media item. |
| `render.overlay` | `({ entry, entryIndex, media, mediaIndex, link, opacity, fsIndex, style, containerProps }) => ReactNode` | `—` | Renders fullscreen overlay content for the active entry slide. |
| `render.skeleton` | `({ entry, entryIndex }) => ReactNode` | `—` | Declared in the type, but the current runtime uses `loading.skeleton` instead. |
| `overlay` | `ElementStyle` | `—` | Styles the fullscreen overlay container that wraps `render.overlay`. |
| `overlay.overlayCrossfadeTarget` | `"content" \| "overlay"` | `"overlay"` | Selects whether fullscreen entry changes fade only the rendered overlay content or the whole overlay layer. |
| `overlay.overlayCrossfadeDurationMs` | `number` | `300` | Duration for fullscreen entry overlay crossfades. |
| `overlay.overlayCrossfadeEasing` | `string` | `"cubic-bezier(.4,0,.22,1)"` | Easing for fullscreen entry overlay crossfades. |
| `loading.enabled` | `boolean` | `—` | Enables entry loading and decode gating. |
| `loading.force` | `boolean \| { enabled?: boolean; showContent?: boolean; skeletonOpacity?: number }` | `—` | Forces entry skeletons to remain visible. Set `showContent: true` to preview mounted, ready entry content under the skeleton, and tune the loading overlay with `skeletonOpacity`. |
| `loading.skeleton` | `EntrySkeletonSpec \| ((args) => EntrySkeletonSpec \| null \| undefined)` | `—` | Built-in skeleton spec or resolver. |
| `loading.cache` | `SkeletonCacheOptions` | `—` | Opts entry skeleton text into the cookie snapshot cache. |
| `loading.minHeight` | `number \| string` | `"260px"` | Minimum reserved height while loading. |
| `loading.nearMargin` | `string` | `"700px 0px"` | Preload margin used before entries enter view. |
| `loading.viewMargin` | `string` | `"0px 0px"` | Margin used for the actual in-view gate. |
| `loading.threshold` | `number` | `0.01` | Intersection threshold for view detection. |
| `loading.waitForDecode` | `boolean` | `true` | Waits for image decode before revealing an entry. |
| `loading.decodeTimeoutMs` | `number` | `8000` | Decode timeout fallback. |
| `loading.skeletonWrap` | `ElementStyle` | `—` | Styles the skeleton wrapper. |
| `intro.renderIntro` | `({ active, containerProps }, content) => ReactNode` | `—` | Custom intro wrapper. |
| `intro.staggerMs` | `number` | `200` | Delay between entry fade-ins. |
| `intro.durationMs` | `number` | `700` | Entry intro fade duration. |
| `intro.easing` | `string` | `"cubic-bezier(.2,.7,.2,1)"` | Entry intro fade easing. |
| `intro.staggerLimit` | `number` | `6` | Maximum number of entries that receive staggered delays. |
| `entryList` | `ElementStyle` | `—` | Styles the entry list container. |
| `entryRow` | `ElementStyle` | `—` | Styles each entry row container. |

Entry skeleton `text` nodes also render wrapped line bars via `lines`, matching the slider and grid skeleton behavior, including responsive `barHeight` and line counts plus configurable trailing `lastBarWidth`.

### Entry-related callback and helper types

#### `EntryItem`

| Field | Type | Notes |
| --- | --- | --- |
| `media` | `MediaItem[] \| undefined` | Optional list of media items for the entry. |
| `[key: string]` | `any` | Additional entry fields are allowed. |

#### `EntryMediaRenderArgs`

| Field | Type | Notes |
| --- | --- | --- |
| `entry` | `EntryItem` | Current entry object. |
| `entryIndex` | `number` | Entry index. |
| `media` | `MediaItem` | Current media item. |
| `mediaIndex` | `number` | Media index within the entry. |

#### `EntryCardRenderArgs`

| Field | Type | Notes |
| --- | --- | --- |
| `entry` | `EntryItem` | Current entry object. |
| `entryIndex` | `number` | Entry index. |
| `media` | `ReactNode` | The rendered media container returned by `renderMediaContainer`. |

#### `EntryOverlayRenderArgs`

| Field | Type | Notes |
| --- | --- | --- |
| `entry` | `EntryItem` | Entry owning the active fullscreen slide. |
| `entryIndex` | `number` | Entry index. |
| `media` | `MediaItem \| null` | Media item for the active fullscreen slide, when available. |
| `mediaIndex` | `number \| null` | Media index inside the entry when available. |
| `link` | `MediaEntryLink \| null` | Flattened link back to the entry/media pair. |
| `opacity` | `number` | Overlay opacity supplied by the runtime. |
| `fsIndex` | `number` | Current fullscreen slide index. |
| `style` | `React.CSSProperties` | Overlay positioning and animation style. |
| `containerProps` | `React.HTMLAttributes<HTMLDivElement>` | Props to spread onto the overlay root. |

#### `EntrySkeletonRenderArgs`

| Field | Type | Notes |
| --- | --- | --- |
| `entry` | `EntryItem` | Current entry object. |
| `entryIndex` | `number` | Entry index. |

#### `MediaEntryLink`

| Field | Type | Notes |
| --- | --- | --- |
| `entryIndex` | `number` | Entry index. |
| `mediaIndex` | `number` | Media index inside the entry. |

#### `SlideOwner`

| Field | Type | Notes |
| --- | --- | --- |
| `entryIndex` | `number` | Entry that owns a fullscreen slide. |

### `flattenEntries`

| Field | Type | Notes |
| --- | --- | --- |
| `flattenedMedia` | `MediaItem[]` | One flat media array, in fullscreen order. |
| `flattenedMap` | `MediaEntryLink[]` | Global slide index back to `entryIndex` and `mediaIndex`. |
| `entryFlatIndex` | `number[][] \| null` | Per-entry lookup from local media index to global slide index. |
| `owners` | `SlideOwner[]` | Owner metadata for each flattened slide. |

## Fullscreen

Fullscreen is compositional. `GalleryCore` owns the normalized fullscreen item list, your layout opens slides through that core, and `useFullscreenController` renders the portal UI.

### Standalone fullscreen

Use `GalleryCore` without a `layout` prop when your own markup owns the visible surface. Call `openFullscreenAt` with the matching item index, and render the fullscreen portal once inside the core.

```typescript
import * as React from "react";
import { GalleryCore, useGalleryCore } from "react-motion-gallery/core";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { toMediaItems } from "react-motion-gallery/media";

const images = [
  {
    src: "https://picsum.photos/id/1015/1600/900",
    alt: "Mountain lake",
  },
  {
    src: "https://picsum.photos/id/1018/1600/900",
    alt: "Forest path",
  },
];

const fullscreenItems = toMediaItems(images);

function FullscreenPortal() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider()],
    fullscreen: { enabled: true },
  });

  return <>{fullscreenNode}</>;
}

function ImageButton(props: {
  image: (typeof images)[number];
  index: number;
}) {
  const gallery = useGalleryCore();

  const open = (event: React.MouseEvent<HTMLButtonElement>) => {
    gallery.openFullscreenAt({
      index: props.index,
      event: event.nativeEvent,
    });
  };

  return (
    <button type="button" onClick={open}>
      <img
        src={props.image.src}
        alt={props.image.alt}
        style={{
          display: "block",
          width: 180,
          aspectRatio: "16 / 9",
          objectFit: "cover",
        }}
      />
    </button>
  );
}

export function StandaloneFullscreen() {
  return (
    <GalleryCore fullscreenItems={fullscreenItems}>
      {images.map((image, index) => (
        <ImageButton key={image.src} image={image} index={index} />
      ))}
      <FullscreenPortal />
    </GalleryCore>
  );
}
```

### Slider fullscreen

```typescript
import * as React from "react";
import { GalleryCore, Slider, useFullscreenController } from "react-motion-gallery";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";

const slides = [
  "https://picsum.photos/id/1015/1600/900",
  "https://picsum.photos/id/1018/1600/900",
  "https://picsum.photos/id/1024/1600/900",
];

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider()],
    fullscreen: { enabled: true },
  });

  return <>{fullscreenNode}</>;
}

export function SliderWithFullscreen() {
  return (
    <GalleryCore layout="slider" fullscreenItems={slides}>
      <Slider>
        {slides.map((src, index) => (
          <img key={src} src={src} alt={`Slide ${index + 1}`} style={{ width: "100%" }} />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}
```

### Fullscreen lazy-load handshake

Fullscreen keeps the base layout and fullscreen surface as separate render trees joined by one canonical index. The base layout can render thumbnails, cropped images, cards, or entries while `GalleryCore.fullscreenItems` provides the media that fullscreen renders for the same positions.

That index is also the communication channel for lazy loading. When a base item becomes visible, `GalleryCore` emits a base-visible event. If `fullscreen.lazyLoad.images.enabled` or `fullscreen.lazyLoad.videos.enabled` is active through `fullscreenLazyLoad()`, the fullscreen runtime listens for that event and prewarms the matching fullscreen media: images are fetched and decoded with high priority, and videos can prewarm their poster/source before being force-mounted.

Once the modal is open, the fullscreen slider index becomes the live gate. `fsSub` changes recompute which canonical image or video is allowed to mount or apply its source, then notify the lazy slide listeners. The active slide is always allowed; decoded images and prepared videos stay warm, and videos that were prewarmed from the base layout remain in the allowed set so navigation can land on prepared media.

Fullscreen also emits its visible index back through `GalleryCore`. Base media primitives use the core fullscreen state to suspend while fullscreen is active, and can use the visible fullscreen index to prewarm their matching media. Captions, overlays, and thumbnail rails stay synchronized through the same index contract.

For custom fullscreen images, `fullscreen.renderImage` must render a real descendant `<img>`. With `fullscreenLazyLoad({ images: { enabled: true } })`, that custom renderer participates in the same mount, spinner, load, and decode flow instead of mounting every fullscreen image eagerly.

Add fullscreen thumbnails by rendering `FullscreenThumbnailSlider` with the bridge returned from `useFullscreenController`.

```typescript
import { FullscreenThumbnailSlider, useFullscreenController } from "react-motion-gallery";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenThumbnails } from "react-motion-gallery/fullscreen/thumbnails";

function FullscreenWithThumbs({ thumbs }: { thumbs: string[] }) {
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenThumbnails()],
    fullscreen: {
      enabled: true,
      slider: {
        direction: "rtl",
      },
    },
  });

  return (
    <>
      {fullscreenNode}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={thumbs.map((thumbSrc, index) => ({ thumbSrc, alt: `Thumb ${index + 1}` }))}
        position="bottom"
        thumbnailHeight={60}
        gap={10}
      />
    </>
  );
}
```

Set `fullscreen.slider.direction` when fullscreen should mirror RTL interaction:

```typescript
useFullscreenController({
  plugins: [fullscreenSlider()],
  fullscreen: {
    enabled: true,
    slider: {
      direction: "rtl",
    },
  },
});
```

Set `fullscreen.slider.gap` to add space between fullscreen slides. It accepts the same responsive number form as the base slider, using the `GalleryCore.breakpoints` map for named breakpoint keys:

```typescript
useFullscreenController({
  plugins: [fullscreenSlider()],
  fullscreen: {
    enabled: true,
    slider: {
      gap: { 0: 12, md: 20, 1200: 28 },
    },
  },
});
```

Import `fullscreenVideo` from `react-motion-gallery/fullscreen/video` for fullscreen video slides. Set `fullscreen.video.playOnOpen` to start a Plyr-backed fullscreen video when fullscreen opens directly onto that video slide:

```typescript
useFullscreenController({
  plugins: [fullscreenSlider(), fullscreenVideo()],
  fullscreen: {
    enabled: true,
    video: {
      playOnOpen: true,
    },
  },
});
```

### `useFullscreenController` args

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `plugins` | `FullscreenPlugin[]` | `[]` | Explicit first-party fullscreen features. At minimum, import `fullscreenSlider()` to mount the fullscreen runtime. |
| `fullscreen` | `FullscreenOptions` | `—` | Fullscreen behavior and rendering options. |

| Import | Factory | Notes |
| --- | --- | --- |
| `react-motion-gallery/fullscreen/slider` | `fullscreenSlider(options)` | Mounts the fullscreen slider runtime and accepts `fullscreen.slider` options. |
| `react-motion-gallery/fullscreen/controls` | `fullscreenControls(options)` | Option plugin for close, arrows, and counter options. Use with `fullscreenSlider()`. |
| `react-motion-gallery/fullscreen/captions` | `fullscreenCaptions(options)` | Adds caption rendering, placement, and caption motion runtime. Use with `fullscreenSlider()`. |
| `react-motion-gallery/fullscreen/zoom-pan` | `fullscreenZoomPan(options)` | Adds fullscreen click zoom, pan, and pinch runtime. Use with `fullscreenSlider()`. |
| `react-motion-gallery/fullscreen/video` | `fullscreenVideo(options)` | Adds fullscreen Plyr rendering, source/options, and `playOnOpen` runtime. Use with `fullscreenSlider()`. |
| `react-motion-gallery/fullscreen/lazy-load` | `fullscreenLazyLoad(options)` | Adds fullscreen image and video lazy-load gates. Use with `fullscreenSlider()`. |
| `react-motion-gallery/fullscreen/crossfade` | `fullscreenCrossfade(options)` | Option plugin for fullscreen crossfade controls, drag, and wheel behavior. Use with `fullscreenSlider()`. |
| `react-motion-gallery/fullscreen/thumbnails` | `fullscreenThumbnails()` | Option-only plugin for fullscreen thumbnail bridge behavior. Use with `fullscreenSlider()`. |

### Recommended `useFullscreenController` return values

| Field | Type | Notes |
| --- | --- | --- |
| `fullscreenNode` | `ReactNode` | The fullscreen portal UI. Render this once inside the `GalleryCore` tree. |
| `fullscreenThumbnailBridge` | `FullscreenThumbnailBridge` | Bridge consumed by `FullscreenThumbnailSlider`. |
| `openFullscreenAt` | `(source, index, originEl?, requestedMethod?) => void` | Programmatic fullscreen open helper returned by the controller. |
| `showFullscreenModal` | `boolean` | `true` while the fullscreen modal is mounted and open. |
| `showFullscreenSlider` | `boolean` | `true` once the slider portion is visible. |
| `fsFadeOpening` | `boolean` | `true` while a fade-based open animation is running. |
| `closingModal` | `boolean` | `true` while the close animation is running. |

The hook returns additional refs and setters for the internal fullscreen runtime. Those values are implementation plumbing and are not the recommended consumer-facing surface for app code.

### `FullscreenOptions`

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `false` | Master switch for fullscreen UI. |
| `items` | `MediaItem[] \| string[]` | `—` | Declared in the type, but current fullscreen media resolution comes from `GalleryCore.fullscreenItems`. |
| `renderImage` | `({ item, index, isZoomed, className, baseStyle }) => ReactNode` | `—` | Custom fullscreen image renderer. Must render a real descendant `<img>`. With `lazyLoad.images.enabled`, the renderer is mounted only when the slide is allowed and the runtime watches that descendant image for load/decode readiness. |
| `closeScroll` | `boolean \| FullscreenCloseScrollOptions` | `false` | Scrolls the matching base item into the center of the viewport when fullscreen closes. `true` enables the default before-close scroll; object form defaults `enabled` to `true`. |
| `closeScroll.enabled` | `boolean \| "desktop-only" \| "mobile-only" \| ((context) => boolean)` | `true` in object form | Enables close-scroll conditionally. Function form receives the current fullscreen index, layout, target element, viewport and pointer details, and the resolved `isMobile` flag. |
| `closeScroll.timing` | `"before-close" \| "after-close"` | `"before-close"` | Chooses whether to scroll before the close animation starts or after the modal has closed. |
| `closeScroll.mobileDetection` | `(context: FullscreenMobileDetectionContext) => boolean` | built-in heuristic | Overrides mobile detection used by `"desktop-only"`, `"mobile-only"`, and the resolver context. The built-in heuristic treats narrow touch/no-hover viewports as mobile. |
| `video.source` | `(item: MediaItem, index: number) => Plyr.SourceInfo` | `—` | Builds fullscreen Plyr sources for video items. |
| `video.options` | `Plyr.Options \| ((item: MediaItem, index: number) => Plyr.Options)` | `—` | Builds fullscreen Plyr options. |
| `video.playOnOpen` | `boolean` | `false` | Attempts to play the fullscreen Plyr video when fullscreen opens directly onto a video slide. Browser autoplay rules still apply. |
| `video.style` | `React.CSSProperties` | `—` | Fullscreen player inline style. |
| `video.className` | `string` | `—` | Fullscreen player class. |
| `controls.close.enabled` | `boolean` | `true` | Toggles the close button. |
| `controls.close.style` | `React.CSSProperties` | `{}` | Close button inline style. |
| `controls.close.className` | `string` | `""` | Close button class. |
| `controls.close.render` | `() => ReactNode` | `—` | Custom close button renderer. |
| `controls.arrows.enabled` | `boolean` | `true` | Toggles fullscreen arrows. |
| `controls.arrows.arrow` | `ElementStyle` | `{}` | Shared arrow style. |
| `controls.arrows.prev` | `ElementStyle` | `{}` | Previous-arrow override. |
| `controls.arrows.next` | `ElementStyle` | `{}` | Next-arrow override. |
| `controls.arrows.render` | `({ dir }) => ReactNode` | `—` | Custom renderer for both arrows. |
| `controls.arrows.renderPrev` | `() => ReactNode` | `—` | Custom previous arrow. |
| `controls.arrows.renderNext` | `() => ReactNode` | `—` | Custom next arrow. |
| `controls.counter.enabled` | `boolean` | `true` | Toggles the index counter. |
| `controls.counter.style` | `React.CSSProperties` | `{}` | Counter inline style. |
| `controls.counter.className` | `string` | `""` | Counter class. |
| `controls.counter.render` | `({ index, count }) => ReactNode` | `—` | Custom counter renderer. |
| `caption.className` | `string` | `—` | Caption root class. |
| `caption.style` | `React.CSSProperties` | `—` | Caption root style. |
| `caption.placement` | `FsCaptionPlacement \| FsCaptionPlacement[] \| Record<string, FsCaptionPlacement>` | `—` | Preferred caption placement. Responsive maps use the `GalleryCore.breakpoints` keys such as `xs`, `md`, and `lg`. |
| `caption.width` | `number \| string \| Record<string, number \| string>` | `—` | Caption area width. Strings can use `px` or `%`; percentages are viewport-relative in fullscreen. Responsive maps use breakpoint keys. |
| `caption.height` | `number \| string \| Record<string, number \| string>` | `—` | Caption area height. Strings can use `px` or `%`; percentages are viewport-relative in fullscreen. Responsive maps use breakpoint keys. |
| `caption.breakpoint` | `number` | `—` | Viewport cutoff for switching placement logic. |
| `caption.render` | `({ item, index, isZoomed }) => ReactNode` | `—` | Custom caption renderer. |
| `caption.layout` | `"overlay" \| "slide"` | `—` | Chooses whether the caption overlays the media or lives in the slide layout. |
| `caption.overlayCrossfadeTarget` | `"content" \| "overlay"` | `"content"` | Selects whether overlay caption changes fade only the rendered caption content or the whole overlay layer. |
| `caption.overlayCrossfadeDurationMs` | `number` | `300` | Duration for fullscreen overlay caption crossfades. |
| `caption.overlayCrossfadeEasing` | `string` | `"cubic-bezier(.4,0,.22,1)"` | Easing for fullscreen overlay caption crossfades. |
| `caption.zoomFade` | `boolean` | `true` | Fades captions out on fullscreen zoom-in and back in on zoom-out. |
| `caption.zoomFadeDurationMs` | `number` | `300` | Duration for fullscreen caption zoom fades. |
| `caption.zoomFadeEasing` | `string` | `"cubic-bezier(.4,0,.22,1)"` | Easing for fullscreen caption zoom fades. |
| `caption.zoomInTransform` | `string` | `""` | Optional transform applied while captions fade out on zoom-in. |
| `caption.zoomOutTransform` | `string` | `""` | Optional transform used as the starting point when captions fade back in on zoom-out. |
| `slider.duration` | `number` | `25` | Fullscreen slider motion duration. |
| `slider.friction` | `number` | `0.68` | Fullscreen slider friction. |
| `slider.direction` | `"ltr" \| "rtl"` | `"ltr"` | Fullscreen slider interaction direction. |
| `slider.gap` | `number \| Record<string, number>` | `0` | Responsive pixel gap between fullscreen slides. Named keys resolve from `GalleryCore.breakpoints`. |
| `zoom.clickZoomLevel` | `number` | `2.5` | Zoom level used for click-to-zoom. |
| `zoom.maxZoomLevel` | `number` | `3` | Maximum allowed zoom level. |
| `zoom.panDuration` | `number` | `43` | Pan settling duration. |
| `zoom.panFriction` | `number` | `0.68` | Pan friction. |
| `effects.introDuration` | `number \| { transform?: number; fade?: number }` | `{ transform: 300, fade: 500 }` | Open and close intro timing. A scalar applies to both paths. Use `transform` for scale/FLIP handoffs and `fade` for opacity-only paths. |
| `effects.introEasing` | `string \| { transform?: string; fade?: string }` | `"cubic-bezier(.4,0,.22,1)"` | Open and close intro easing. A scalar applies to both paths. Object keys mirror `introDuration`. |
| `effects.introFade` | `boolean` | `false` | Forces fade intro behavior. |
| `effects.crossfade.controls` | `boolean` | `false` | Uses crossfade transitions for fullscreen arrow navigation and animated slide requests. Also enables wheel crossfade unless `effects.crossfade.wheel` is provided. |
| `effects.crossfade.drag` | `boolean` | `false` | Scrubs adjacent fullscreen slides with crossfade during drag instead of moving the track. |
| `effects.crossfade.wheel` | `boolean \| CrossFadeWheelOptions` | `effects.crossfade.controls` | Uses wheel or touchpad travel as a one-slide-at-a-time fullscreen crossfade gesture. Set `false` to keep arrow crossfades while using normal wheel scrolling. |
| `effects.crossfade.wheel.enabled` | `boolean` | `true` when object form is used | Enables or disables fullscreen wheel crossfade when using the object form. |
| `effects.crossfade.wheel.sensitivity` | `number` | `5` | Multiplies wheel delta into virtual drag progress. Higher values reach the commit threshold sooner. |
| `effects.crossfade.wheel.commitThreshold` | `number` | `0.38` | Progress needed to commit to the previous or next fullscreen slide. Values are clamped from `0` to below `0.5`. |
| `effects.crossfade.wheel.durationMs` | `number` | `effects.crossfade.durationMs` | Fade duration after fullscreen wheel crossfade commits. |
| `effects.crossfade.wheel.sessionGapMs` | `number` | `24` | Short quiet window used to distinguish same-direction touchpad tail from a fresh fullscreen wheel gesture after a committed wheel crossfade. |
| `effects.crossfade.durationMs` | `number` | `120` | Shared fullscreen crossfade duration for controls, drag release, and wheel commit unless wheel overrides it. |
| `effects.crossfade.easing` | `string` | `"cubic-bezier(.4,0,.22,1)"` | Shared fullscreen crossfade easing. |
| `lazyLoad.images.enabled` | `boolean` | `—` | Enables fullscreen image lazy loading. Base-visible indices predecode matching fullscreen images, and fullscreen index changes allow the active image slide to mount or apply its source. |
| `lazyLoad.images.spinner` | `boolean \| ReactNode \| ((args) => ReactNode)` | `—` | Spinner override for fullscreen images. |
| `lazyLoad.images.spinnerClassName` | `string` | `—` | Spinner class for image slides. |
| `lazyLoad.images.spinnerStyle` | `React.CSSProperties` | `—` | Spinner style for image slides. |
| `lazyLoad.videos.enabled` | `boolean` | `—` | Opts fullscreen videos into lazy mounting. Base-visible indices prewarm matching video posters/sources and fullscreen index changes mount the active or already-prepared video slide. By default fullscreen Plyr videos mount eagerly in the hidden fullscreen tree. |
| `lazyLoad.videos.spinner` | `boolean \| ReactNode \| ((args) => ReactNode)` | `—` | Spinner override for fullscreen videos. |
| `lazyLoad.videos.spinnerClassName` | `string` | `—` | Spinner class for video slides. |
| `lazyLoad.videos.spinnerStyle` | `React.CSSProperties` | `—` | Spinner style for video slides. |

Fullscreen uses the transform close path only when the matching base image is actually exposed in the viewport. If that image is missing, offscreen, or fully covered by another page element, fullscreen falls back to the opacity close path.

Use `fullscreen.closeScroll` when the base gallery item might be offscreen by the time the user closes fullscreen. This can bring the matching item into view before the close-path decision, keeping the transform close animation anchored to the item instead of falling back because the origin is hidden or distant.

Fullscreen `effects.crossfade.wheel` uses the same `true`, `false`, or object form as slider wheel crossfade. Its `durationMs` default follows fullscreen `effects.crossfade.durationMs`, which defaults to `120`.

Use path-specific intro timing when the scale handoff should feel slower or faster than the opacity fallback:

```tsx
useFullscreenController({
  plugins: [fullscreenSlider()],
  fullscreen: {
    enabled: true,
    effects: {
      introDuration: { transform: 500, fade: 300 },
    },
  },
});
```

### Responsive fullscreen captions

Use `fullscreenCaptions()` with `fullscreenSlider()` when fullscreen slides need captions. Caption placement and size accept responsive values. This example places captions on the right at desktop widths, reserves 50% of the fullscreen viewport for the caption area, and moves captions to the bottom on mobile:

```typescript
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenCaptions } from "react-motion-gallery/fullscreen/captions";

const slides = [
  {
    title: "Lorem ipsum dolor sit amet",
    description: "Consectetur adipiscing elit, sed do eiusmod tempor.",
  },
];

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenCaptions()],
    fullscreen: {
      enabled: true,
      caption: {
        layout: "overlay",
        placement: {
          xs: "bottom",
          lg: "right",
        },
        width: {
          lg: "50%",
        },
        style: {
          padding: 0,
        },
        render: ({ index }) => {
          const slide = slides[index];
          if (!slide) return null;

          return (
            <div className="fullscreenCaption">
              <p>{slide.title}</p>
              <p>{slide.description}</p>
            </div>
          );
        },
      },
    },
  });

  return <>{fullscreenNode}</>;
}
```

For overlay captions, style the rendered caption content to fill the reserved caption surface when needed:

```css
.fullscreenCaption {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(18px, 3vw, 34px);
}

@media (max-width: 1199px) {
  .fullscreenCaption {
    justify-content: flex-end;
    padding-bottom: 30px;
  }
}
```

### Fullscreen callback and helper types

#### `FsCounterArgs`

| Field | Type | Notes |
| --- | --- | --- |
| `index` | `number` | Current fullscreen index. |
| `count` | `number` | Total slide count. |

#### `FsCaptionRenderArgs`

| Field | Type | Notes |
| --- | --- | --- |
| `item` | `MediaItem` | Active fullscreen item. |
| `index` | `number` | Active fullscreen index. |
| `isZoomed` | `boolean` | `true` when the active slide is zoomed. |

#### `FsCaptionPlacement`

| Value | Notes |
| --- | --- |
| `"top"` | Places the caption above the media. |
| `"right"` | Places the caption to the right of the media. |
| `"bottom"` | Places the caption below the media. |
| `"left"` | Places the caption to the left of the media. |

#### `FsIntroRequest`

| Field | Type | Notes |
| --- | --- | --- |
| `originalImage` | `HTMLImageElement \| null` | Origin image used for scale transitions. |
| `index` | `number` | Target fullscreen index. |
| `method` | `"fade" \| "scale"` | Requested intro method. |
| `closestSelector` | `string \| undefined` | Selector used to resolve the source slide element. |

#### `FullscreenLazyLoadArgs`

| Field | Type | Notes |
| --- | --- | --- |
| `kind` | `"image" \| "video"` | Media kind currently loading. |
| `isClone` | `boolean \| undefined` | `true` for cloned looped slides when relevant. |

#### `FullscreenThumbnailSlider` props

`FullscreenThumbnailSliderProps` is exported from both the package root and `react-motion-gallery/fullscreenThumbnails`. The table below summarizes the prop surface.

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `bridge` | `FullscreenThumbnailBridge` | `—` | Bridge returned from `useFullscreenController`. |
| `items` | `{ thumbSrc: string; alt?: string }[]` | `—` | Thumbnail list. |
| `position` | `"top" \| "right" \| "bottom" \| "left"` | `—` | Thumbnail rail position. |
| `containerClassName` | `string` | `—` | Thumbnail container class. |
| `containerStyle` | `React.CSSProperties` | `—` | Thumbnail container style. |
| `thumbnailWidth` | `number \| string` | `—` | Individual thumbnail width. |
| `thumbnailHeight` | `number \| string` | `—` | Individual thumbnail height. |
| `thumbnailsCenter` | `boolean` | `—` | Centers the thumbnail strip within its container. |
| `thumbnailsContainerWidth` | `number \| string` | `—` | Explicit strip width. |
| `thumbnailsContainerHeight` | `number \| string` | `—` | Explicit strip height. |
| `fadeDurationMs` | `number` | `300` | Mount and unmount fade duration. |
| `fadeEasing` | `string` | `"cubic-bezier(.4,0,.22,1)"` | Fade easing. |
| `thumbnailItemClassName` | `string` | `—` | Thumbnail item class. |
| `thumbnailItemStyle` | `React.CSSProperties` | `—` | Thumbnail item style. |
| `gap` | `number` | `—` | Gap between thumbnails. |
| `freeScroll` | `boolean` | `—` | Enables free thumbnail dragging. |
| `groupCells` | `boolean` | `—` | Groups thumbnail cells into snaps. |
| `loop` | `boolean` | `—` | Loops the thumbnail slider. |
| `axis` | `"x" \| "y"` | `—` | Declared in the prop type, but the current implementation does not wire it through. |
| `skipSnaps` | `boolean` | `—` | Allows momentum to skip snaps. |
| `centerActiveThumb` | `boolean` | `—` | Keeps the active thumbnail centered. |
| `selectDuration` | `number` | `—` | Selection motion duration. |
| `freeScrollDuration` | `number` | `—` | Free-scroll settling duration. |
| `sliderFriction` | `number` | `—` | Thumbnail slider friction. |
| `breakpointMap` | `Record<string, number>` | `{ xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 }` | Breakpoints used by the thumbnail strip. |
| `rippleEnabled` | `boolean` | `—` | Enables thumbnail arrow ripples. |
| `rippleClassName` | `string` | `—` | Ripple class name. |
| `showArrows` | `boolean` | `false` | Toggles thumbnail arrows. |
| `arrowStyles` | `React.CSSProperties` | `—` | Shared arrow styles. |
| `arrowClassName` | `string` | `—` | Shared arrow class. |
| `prevArrowStyles` | `React.CSSProperties` | `—` | Previous-arrow styles. |
| `prevArrowClassName` | `string` | `—` | Previous-arrow class. |
| `nextArrowStyles` | `React.CSSProperties` | `—` | Next-arrow styles. |
| `nextArrowClassName` | `string` | `—` | Next-arrow class. |
| `renderArrows` | `(args) => ReactNode` | `—` | Custom renderer for both arrows. |
| `renderPrevArrow` | `(args) => ReactNode` | `—` | Custom previous arrow. |
| `renderNextArrow` | `(args) => ReactNode` | `—` | Custom next arrow. |

#### `FullscreenThumbnailBridge`

| Field | Type | Notes |
| --- | --- | --- |
| `mountEl` | `HTMLDivElement \| null` | Portal mount node for the thumbnail strip. |
| `fsSub` | `FullscreenSliderSub` | Fullscreen slider index channel used internally. |
| `visible` | `boolean` | `true` when the strip should be visible. |
| `invisible` | `boolean` | `true` during hidden transitional states. |
| `direction` | `"ltr" \| "rtl"` | Fullscreen direction. |
| `registerLayout` | `(layout: FullscreenThumbnailSlotLayout) => void` | Registers the slot layout metadata. |
| `clearLayout` | `() => void` | Clears the current slot layout. |

#### `FullscreenThumbnailSlotLayout`

| Field | Type | Notes |
| --- | --- | --- |
| `position` | `"top" \| "right" \| "bottom" \| "left"` | Thumbnail rail position. |
| `className` | `string \| undefined` | Slot container class. |
| `style` | `React.CSSProperties \| undefined` | Slot container style. |
| `fadeDurationMs` | `number \| undefined` | Slot fade duration. |
| `fadeEasing` | `string \| undefined` | Slot fade easing. |

## Video

`Video` is the gallery-aware video primitive. It mounts Plyr lazily, syncs with gallery visibility, and can be used inside `Slider`, `Grid`, `Masonry`, `Entries`, and fullscreen flows.

```typescript
import { Video } from "react-motion-gallery";

export function BasicVideo() {
  return (
    <div style={{ width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
      <Video
        src="https://cdn.plyr.io/static/blank.mp4"
        poster="https://picsum.photos/seed/video-poster/1600/900"
        options={{ controls: ["play", "progress", "mute", "fullscreen"] } as any}
        lazyLoad={{ enabled: true, spinner: true }}
      />
    </div>
  );
}
```

### `Video` props

`VideoProps` is exported from both the package root and `react-motion-gallery/video`. The table below summarizes the prop surface.

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | `—` | Source URL used to build the default Plyr source. |
| `poster` | `string` | `—` | Poster image. |
| `alt` | `string` | `—` | Optional metadata label; the `Video` component itself does not render a visible alt attribute. |
| `source` | `Plyr.SourceInfo` | auto-built MP4 source | Direct Plyr source object. Overrides `sourceBuilder`. |
| `sourceBuilder` | `({ src: string }) => Plyr.SourceInfo` | `—` | Builds the Plyr source from `src`. |
| `options` | `Plyr.Options \| (({ src, index }) => Plyr.Options)` | `—` | Direct or computed Plyr options. When omitted, the component still applies `autoplay: false` and `preload: "none"` defaults internally. |
| `className` | `string` | `—` | Player wrapper class. |
| `style` | `React.CSSProperties` | `—` | Player wrapper style. |
| `onApi` | `(api: APITypes \| null) => void` | `—` | Called whenever the Plyr API ref changes. |
| `registerApiByIndex` | `(index: number, api: APITypes \| null) => void` | `—` | Registers the API by canonical gallery index. |
| `lazyLoad.enabled` | `boolean` | `true` | `false` mounts immediately after reveal. |
| `lazyLoad.spinner` | `boolean \| ReactNode \| ((args) => ReactNode)` | `true` | `false` disables the spinner; `true` uses the built-in spinner. |
| `lazyLoad.spinnerClassName` | `string` | `—` | Spinner wrapper class. |
| `lazyLoad.spinnerStyle` | `React.CSSProperties` | `—` | Spinner wrapper style. |

### Supporting video types

These helper type names are available from both the package root and `react-motion-gallery/video`.

| Type | Shape | Notes |
| --- | --- | --- |
| `RmgPlyrSourceBuilder` | `({ src: string }) => Plyr.SourceInfo` | Used by `sourceBuilder`. |
| `RmgPlyrOptionsResolver` | `Plyr.Options \| (({ src, index }) => Plyr.Options)` | Used by `options`. |
| `RmgVideoLazyLoadOptions` | `{ enabled?, spinner?, spinnerClassName?, spinnerStyle? }` | Used by `lazyLoad`. |

If you do not use `Video`, you do not need `plyr` or `plyr-react`. Install those optional peer dependencies only for video playback.
