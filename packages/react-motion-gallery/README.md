# React Motion Gallery

Composable React media gallery primitives for production interfaces: sliders, grids, masonry, structured entries, fullscreen, thumbnails, video, zoom/pan, and loading states that are designed around the layout they protect.

The package stays close to React composition. `Slider`, `Grid`, and `Masonry` render children directly; `Entries` renders structured data; `GalleryCore` coordinates fullscreen state; `Video` handles Plyr-backed media; `ZoomPanImage` gives you a standalone zoom surface; and `Skeleton` can be used inside or outside gallery layouts. For loading-state precision, the repo also includes a development-time browser measurement workflow that turns real rendered text into stable skeleton text authoring data, including reflow-sensitive layouts such as masonry.

## Runtime Gzip Sizes

This table reports local gzip measurements for selected runtime surfaces. Type-only imports are erased and add no JS; feature subpath rows measure only that feature entry point. The script rebundles one export at a time from its published ESM entry point, excludes peer and runtime externals, and gzips the resulting JS bundle. Run `npm run build && npm run size:readme` in `packages/react-motion-gallery` to refresh it.

<!-- bundle-size:start -->
| Surface | JS gzip |
| --- | --- |
| `Entries` | 16.2kB |
| `entries/media/slider` | 20.7kB |
| `entries/media/grid` | 20.8kB |
| `entries/media/masonry` | 18.7kB |
| `entries/ready` | 360.0B |
| `entries/pagination` | 242.0B |
| `entries/load-more` | 198.0B |
| `entries/infinite-scroll` | 208.0B |
| `entries/virtualization` | 236.0B |
| `rating-stars` | 1.3kB |
| `FullscreenThumbnailSlider` | 20.4kB |
| `GalleryCore` | 2.7kB |
| `Grid` | 17.9kB |
| `grid/ready` | 323.0B |
| `grid/lazy-load` | 3.7kB |
| `grid/fullscreen` | 1.6kB |
| `grid/pagination` | 246.0B |
| `grid/load-more` | 236.0B |
| `grid/infinite-scroll` | 667.0B |
| `grid/virtualization` | 256.0B |
| `Masonry` | 12.2kB |
| `masonry/ready` | 323.0B |
| `masonry/fullscreen` | 1.1kB |
| `masonry/lazy-load` | 3.7kB |
| `masonry/text-wrap` | 1.8kB |
| `masonry/pagination` | 239.0B |
| `masonry/load-more` | 227.0B |
| `masonry/infinite-scroll` | 630.0B |
| `masonry/virtualization` | 252.0B |
| `Skeleton base` | 9.1kB |
| `skeleton/slider` | 14.7kB |
| `skeleton/slider/restore` | 25.3kB |
| `skeleton/grid` | 11.4kB |
| `skeleton/masonry` | 4.8kB |
| `Slider core` | 19.0kB |
| `slider/ready` | 894.0B |
| `slider/arrows` | 1.2kB |
| `slider/dots` | 928.0B |
| `slider/progress` | 892.0B |
| `slider/scrollbar` | 1.2kB |
| `slider/auto-height` | 1.3kB |
| `slider/lazy-load` | 3.9kB |
| `slider/parallax` | 1.4kB |
| `slider/scale` | 1.2kB |
| `slider/fade` | 1.2kB |
| `slider/crossfade` | 2.8kB |
| `slider/fullscreen` | 1.4kB |
| `ThumbnailSlider` | 18.9kB |
| `useFullscreenController` | 5.0kB |
| `fullscreen/slider` | 39.7kB |
| `fullscreen/controls` | 173.0B |
| `fullscreen/captions` | 13.6kB |
| `fullscreen/zoom-pan` | 12.4kB |
| `fullscreen/video` | 16.8kB |
| `fullscreen/lazy-load` | 13.6kB |
| `fullscreen/crossfade` | 181.0B |
| `fullscreen/thumbnails` | 160.0B |
| `Video` | 13.1kB |
| `ZoomPanImage` | 11.0kB |
| `zoomPan/hover` | 124.0B |
| `media / toMediaItems` | 260.0B |
| `media/ready` | 656.0B |
| `responsive / BREAKPOINT_MAP` | 85.0B |
| `Reveal` | 2.4kB |
<!-- bundle-size:end -->

## Installation

Install the package:

```bash
npm install react-motion-gallery
```

If you use `Video` or fullscreen video playback, also install the optional Plyr peers:

```bash
npm install plyr plyr-react
```

Import the stylesheet. The package uses CSS Modules internally, but consumers only load the compiled plain CSS file, so no CSS Modules setup is required in your app.

```typescript
import "react-motion-gallery/styles.css";
```

Most examples in this README use hooks, event handlers, or browser-only behavior. In Next.js App Router, put those components in a client file with `"use client";`; server components can still prepare media data and pass it down.

## License

React Motion Gallery is licensed under `PolyForm-Noncommercial-1.0.0`. Non-commercial use is free. Commercial use requires a paid license; see [react-motion-gallery.com/license](https://react-motion-gallery.com/license).

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

| Entry point                                              | Main surface                                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `react-motion-gallery`                                   | Aggregate root for primary components, helpers, and companion public types                   |
| `react-motion-gallery/styles.css`                        | Compiled stylesheet required by gallery primitives and controls                              |
| `react-motion-gallery/media`                             | `toMediaItems`, `MediaItem`, `MediaInput`                                                    |
| `react-motion-gallery/media/ready`                       | `useImageDecodeReady`                                                                        |
| `react-motion-gallery/responsive`                        | `BREAKPOINT_MAP` and responsive value types                                                  |
| `react-motion-gallery/reveal`                            | `Reveal`, `useReveal`, reveal types                                                          |
| `react-motion-gallery/rating-stars`                      | `RatingStars`                                                                                |
| `react-motion-gallery/core`                              | `GalleryCore`, `GalleryCoreProvider`, `useGalleryCore`                                       |
| `react-motion-gallery/slider`                            | `Slider`, `createSliderIndexChannel`, slider types                                           |
| `react-motion-gallery/slider/ready`                      | `useSliderReady`                                                                             |
| `react-motion-gallery/slider/arrows`                     | `sliderArrows`                                                                               |
| `react-motion-gallery/slider/dots`                       | `sliderDots`                                                                                 |
| `react-motion-gallery/slider/progress`                   | `sliderProgress`                                                                             |
| `react-motion-gallery/slider/scrollbar`                  | `sliderScrollbar`                                                                            |
| `react-motion-gallery/slider/ripple`                     | `sliderRipple`                                                                               |
| `react-motion-gallery/slider/auto-play`                  | `sliderAutoPlay`                                                                             |
| `react-motion-gallery/slider/auto-scroll`                | `sliderAutoScroll`                                                                           |
| `react-motion-gallery/slider/auto-height`                | `sliderAutoHeight`                                                                           |
| `react-motion-gallery/slider/lazy-load`                  | `sliderLazyLoad`                                                                             |
| `react-motion-gallery/slider/parallax`                   | `sliderParallax`                                                                             |
| `react-motion-gallery/slider/scale`                      | `sliderScale`                                                                                |
| `react-motion-gallery/slider/fade`                       | `sliderFade`                                                                                 |
| `react-motion-gallery/slider/crossfade`                  | `sliderCrossfade`                                                                            |
| `react-motion-gallery/slider/fullscreen`                 | `sliderFullscreen`                                                                           |
| `react-motion-gallery/slider/loading`                    | `sliderLoading`                                                                              |
| `react-motion-gallery/grid`                              | `Grid`, `Grid.Item`, grid types                                                              |
| `react-motion-gallery/grid/ready`                        | `useGridReady`                                                                               |
| `react-motion-gallery/grid/lazy-load`                    | `gridLazyLoad`                                                                               |
| `react-motion-gallery/grid/fullscreen`                   | `gridFullscreen` for Grid + `GalleryCore`                                                    |
| `react-motion-gallery/grid/pagination`                   | `gridPagination`, `useGridPagination`, `GridPaginationControls`, page range helpers          |
| `react-motion-gallery/grid/load-more`                    | `gridLoadMore`, `useGridLoadMore`                                                            |
| `react-motion-gallery/grid/infinite-scroll`              | `gridInfiniteScroll`, `useGridInfiniteScroll`                                                |
| `react-motion-gallery/grid/virtualization`               | `gridVirtualization`, `useGridVirtualizer`                                                   |
| `react-motion-gallery/masonry`                           | `Masonry`, `Masonry.Item`, masonry types                                                     |
| `react-motion-gallery/masonry/ready`                     | `useMasonryReady`                                                                            |
| `react-motion-gallery/masonry/fullscreen`                | `masonryFullscreen` for light Masonry + `GalleryCore`                                        |
| `react-motion-gallery/masonry/lazy-load`                 | `masonryLazyLoad`                                                                            |
| `react-motion-gallery/masonry/pagination`                | `masonryPagination`, `useMasonryPagination`, `MasonryPaginationControls`, page range helpers |
| `react-motion-gallery/masonry/load-more`                 | `masonryLoadMore`, `useMasonryLoadMore`                                                      |
| `react-motion-gallery/masonry/infinite-scroll`           | `masonryInfiniteScroll`, `useMasonryInfiniteScroll`                                          |
| `react-motion-gallery/masonry/virtualization`            | `masonryVirtualization`, `useMasonryVirtualizer`                                             |
| `react-motion-gallery/entries`                           | `Entries`, `flattenEntries`, entry data plugins, hooks, and types                           |
| `react-motion-gallery/entries/media/slider`              | `createEntriesSliderMedia`                                                                  |
| `react-motion-gallery/entries/media/grid`                | `createEntriesGridMedia`                                                                    |
| `react-motion-gallery/entries/media/masonry`             | `createEntriesMasonryMedia`                                                                 |
| `react-motion-gallery/entries/ready`                     | `useEntriesReady`                                                                            |
| `react-motion-gallery/entries/pagination`                | `entriesPagination`, `useEntriesPagination`, `EntriesPaginationControls`, page range helpers |
| `react-motion-gallery/entries/load-more`                 | `entriesLoadMore`, `useEntriesLoadMore`                                                      |
| `react-motion-gallery/entries/infinite-scroll`           | `entriesInfiniteScroll`, `useEntriesInfiniteScroll`                                          |
| `react-motion-gallery/entries/virtualization`            | `entriesVirtualization`, `useEntriesVirtualizer`                                             |
| `react-motion-gallery/skeleton/base`                     | Standalone `Skeleton` and generic skeleton authoring types                                   |
| `react-motion-gallery/skeleton/slider`                   | `SliderSkeleton` and slider skeleton authoring types                                         |
| `react-motion-gallery/skeleton/grid`                     | `GridSkeleton` and grid skeleton authoring types                                             |
| `react-motion-gallery/skeleton/masonry`                  | Lightweight `MasonrySkeleton` for dimensioned placeholders                                   |
| `react-motion-gallery/skeleton/cache`                    | Server-safe skeleton cookie cache helpers and types                                          |
| `react-motion-gallery/skeleton/cache/provider`           | Client `SkeletonCacheProvider` for SSR snapshots and client cookie refresh                   |
| `react-motion-gallery/skeleton/slider/restore`           | `SliderSkeleton` with `cache`, plus `RestoredSliderSkeleton` for optional restore            |
| `react-motion-gallery/fullscreen`                        | `useFullscreenController` and fullscreen types                                               |
| `react-motion-gallery/fullscreen/slider`                 | `fullscreenSlider`                                                                           |
| `react-motion-gallery/fullscreen/controls`               | `fullscreenControls`                                                                         |
| `react-motion-gallery/fullscreen/captions`               | `fullscreenCaptions`                                                                         |
| `react-motion-gallery/fullscreen/zoom-pan`               | `fullscreenZoomPan`                                                                          |
| `react-motion-gallery/fullscreen/video`                  | `fullscreenVideo`                                                                            |
| `react-motion-gallery/fullscreen/lazy-load`              | `fullscreenLazyLoad`                                                                         |
| `react-motion-gallery/fullscreen/crossfade`              | `fullscreenCrossfade`                                                                        |
| `react-motion-gallery/fullscreen/thumbnails`             | `fullscreenThumbnails`                                                                       |
| `react-motion-gallery/thumbnails`                        | `ThumbnailSlider`, thumbnail sync helpers                                                    |
| `react-motion-gallery/fullscreenThumbnails`              | `FullscreenThumbnailSlider`                                                                  |
| `react-motion-gallery/video`                             | `Video` and optional Plyr-backed video types                                                 |
| `react-motion-gallery/zoomPan`                           | `ZoomPanImage` and zoom/pan types                                                            |
| `react-motion-gallery/zoomPan/hover`                     | `zoomPanHover`                                                                               |

For a named-export inventory that covers every public subpath, including type-only exports and lower-level helpers, see [`docs/public-api-inventory.md`](./docs/public-api-inventory.md).

Data plugin imports are intentionally split by surface and behavior:

| Surface | Pagination                                | Load more                                | Infinite scroll                                | Virtualization                                |
| ------- | ----------------------------------------- | ---------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| Grid    | `react-motion-gallery/grid/pagination`    | `react-motion-gallery/grid/load-more`    | `react-motion-gallery/grid/infinite-scroll`    | `react-motion-gallery/grid/virtualization`    |
| Masonry | `react-motion-gallery/masonry/pagination` | `react-motion-gallery/masonry/load-more` | `react-motion-gallery/masonry/infinite-scroll` | `react-motion-gallery/masonry/virtualization` |
| Entries | `react-motion-gallery/entries/pagination` | `react-motion-gallery/entries/load-more` | `react-motion-gallery/entries/infinite-scroll` | `react-motion-gallery/entries/virtualization` |

```typescript
import { useGridPagination } from "react-motion-gallery/grid/pagination";
import { useMasonryLoadMore } from "react-motion-gallery/masonry/load-more";
import { entriesVirtualization } from "react-motion-gallery/entries/virtualization";
```

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
Use: stable selectors -> probe_render_context -> scaffold_skeleton_text with renderReceiptId -> generate:skeleton-text-module --analysis-output -> import sidecar
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

Call `scaffold_skeleton_text` as a dry run to get the exact `probe_render_context` call. Apply the browser-measurement manifest only after passing the returned `receiptId` as `renderReceiptId`.

```json
{
  "projectRoot": "/absolute/path/to/app",
  "manifestPath": "src/components/pricing.skeleton-text.browser.manifest.json",
  "url": "http://127.0.0.1:3000/pricing?skeletonMeasure=content",
  "outputFile": "src/components/pricing.skeleton-text.generated.ts",
  "moduleExportName": "pricingSkeletonText",
  "barWidthUnit": "px",
  "includeTextMetrics": true,
  "renderReceiptId": "rmg-render-...",
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

## Core

`GalleryCore` is the shared state boundary for fullscreen-aware galleries. Wrap a layout in it when you need shared breakpoints, a normalized fullscreen media list, fullscreen-open state, or programmatic fullscreen opening. `useGalleryCore()` is the public hook for reading that core state from descendants.

### `GalleryCore` props

| Option            | Type                                           | Default                                       | Notes                                                                          |
| ----------------- | ---------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| `children`        | `React.ReactNode`                              | `—`                                           | The gallery tree using the shared core.                                        |
| `layout`          | `"slider" \| "grid" \| "masonry" \| "entries"` | `—`                                           | Declares the owning base layout. Omit it for standalone fullscreen/core usage. |
| `breakpoints`     | `Record<string, number>`                       | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Breakpoint map shared with descendants.                                        |
| `fullscreenItems` | `MediaItem[] \| string[]`                      | `[]`                                          | Normalized fullscreen media list.                                              |
| `nodes`           | `ReactNode \| ReactNode[]`                     | `—`                                           | Advanced initial node list used by the slider-backed imperative state.         |

### `useGalleryCore` API

`GalleryApi` is the public alias for `GalleryCoreApi`. It covers core fullscreen state and programmatic fullscreen opening. Slider item mutation lives on `SliderHandle` and `SliderApi`.

| Field / Method            | Type                                                   | Notes                                                                                                     |
| ------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `layout`                  | `"slider" \| "grid" \| "masonry" \| "entries" \| null` | Current owning layout, or `null` for standalone fullscreen/core usage.                                    |
| `effectiveBreakpoints`    | `Record<string, number>`                               | Breakpoint map after merging custom `GalleryCore.breakpoints` with defaults.                              |
| `normalizedItems`         | `MediaItem[]`                                          | Fullscreen item list normalized from `fullscreenItems`.                                                   |
| `fsEnabled`               | `boolean`                                              | `true` when a mounted fullscreen controller has enabled fullscreen behavior.                              |
| `setFsEnabled`            | `(enabled: boolean) => void`                           | Enables or disables fullscreen behavior. Usually handled by `useFullscreenController`.                    |
| `isFullscreenOpen`        | `boolean`                                              | `true` while fullscreen is open.                                                                          |
| `isFullscreenOpenRef`     | `React.RefObject<boolean>`                             | Ref mirror for handlers that need the current fullscreen-open state.                                      |
| `setFullscreenOpen`       | `(open: boolean) => void`                              | Updates fullscreen-open state. Usually handled by the fullscreen runtime.                                 |
| `openFullscreenAt`        | `({ index, method?, event? }) => void`                 | Opens fullscreen at a normalized fullscreen item index. Pass the source event for scale-origin detection. |
| `notifyBaseVisibleIndex`  | `(index: number) => void`                              | Emits the visible base media index for fullscreen lazy-load/prewarm coordination.                         |
| `notifyFsVisibleIndex`    | `(index: number) => void`                              | Emits the active fullscreen index back to base media.                                                     |
| `registerExpandableImage` | `(index: number, node: HTMLElement \| null) => void`   | Registers an origin surface for layoutless scale transitions.                                             |

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

| Option                              | Type                                                                                | Default | Notes                                                                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `layout`                            | `SkeletonNode`                                                                      | `—`     | Structured placeholder layout tree.                                                                                                           |
| `children`                          | `React.ReactNode`                                                                   | `—`     | Real content. When present, `Skeleton` renders content and loading layers.                                                                    |
| `ready`                             | `boolean`                                                                           | `false` | Reveals content and exits the skeleton once true.                                                                                             |
| `enabled`                           | `boolean`                                                                           | `true`  | Set false to render content immediately with no skeleton layer.                                                                               |
| `force`                             | `boolean \| { enabled?: boolean; showContent?: boolean; skeletonOpacity?: number }` | `false` | Keeps the skeleton visible. Set `showContent: true` to preview ready content under the skeleton, and tune the overlay with `skeletonOpacity`. |
| `timing.exitMs`                     | `number`                                                                            | `600`   | Keeps the skeleton layer mounted for this long after exit starts and controls the opacity transition.                                         |
| `timing.minVisibleMs`               | `number`                                                                            | `220`   | Minimum time the skeleton stays visible before exit can begin.                                                                                |
| `shellClassName` / `shellStyle`     | `string` / `CSSProperties`                                                          | `—`     | Wrapper-layer class and style for content+skeleton mode.                                                                                      |
| `contentClassName` / `contentStyle` | `string` / `CSSProperties`                                                          | `—`     | Content-layer class and style for wrapper mode.                                                                                               |

The wrapper timing model matches the gallery loading layers: content begins fading in as soon as the skeleton exit starts; it does not wait for the skeleton to unmount.

Default skeleton imports are cache-free. The cache-backed public skeleton surface retained in this release is `SliderSkeleton` from `react-motion-gallery/skeleton/slider/restore`; use its `restore` option, or the `RestoredSliderSkeleton` alias, when slider reload/back-forward restore is needed. Non-slider gallery loading surfaces no longer accept `loading.cache`.

`SkeletonFrame` is also exported from `react-motion-gallery/skeleton/base` for lower-level composition when you already have a rendered skeleton node and want the shared wrapper timing/layering behavior.

| `SkeletonFrame` prop           | Type                                                                                | Default | Notes                                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `skeletonNode`                 | `React.ReactNode`                                                                   | required | Loading layer content.                                                                               |
| `children`                     | `React.ReactNode`                                                                   | `—`     | Real content. Without children, `SkeletonFrame` returns `skeletonNode` directly.                     |
| `ready`                        | `boolean`                                                                           | `false` | Reveals content when true.                                                                           |
| `enabled`                      | `boolean`                                                                           | `true`  | Bypasses loading behavior when false.                                                                |
| `force`                        | `boolean \| { enabled?: boolean; showContent?: boolean; skeletonOpacity?: number }` | `false` | Keeps or compares the loading layer.                                                                 |
| `timing`                       | `{ enterMs?, exitMs?, minVisibleMs? }`                                               | shared defaults | Loading-layer timing.                                                                         |
| `shellClassName` / `shellStyle` | `string` / `React.CSSProperties`                                                    | `—`     | Outer shell class and style.                                                                         |
| `loadingShellStyle`            | `React.CSSProperties \| null`                                                       | `—`     | Style applied to the shell only while the loading layer is showing.                                  |
| `contentClassName` / `contentStyle` | `string` / `React.CSSProperties`                                                | `—`     | Content layer class and style.                                                                       |
| `contentOwnsWrapperLayout`     | `boolean`                                                                           | `false` | Keeps the wrapper sized by content when the content layer is not locked.                             |
| `lockContentLayoutWhileLoading` | `boolean`                                                                          | `false` | Temporarily makes the loading layer the normal-flow owner and absolutely layers content over it.      |
| `loadingLayerFirst`            | `boolean`                                                                           | `false` | Renders the loading layer before the content layer.                                                   |
| `contentWrapper`               | `(children: ReactNode) => ReactNode`                                                | `—`     | Wraps content inside the shared skeleton reveal-gate provider.                                       |
| `shellDataAttributes`          | `Record<string, string \| boolean \| undefined>`                                   | `—`     | Extra data attributes for the shell.                                                                 |
| `loadingShellDataAttributes`   | `Record<string, string \| boolean \| undefined>`                                   | `—`     | Extra shell data attributes while loading is showing.                                                |
| `shellRef`                     | `React.Ref<HTMLDivElement>`                                                         | `—`     | Ref for the outer shell.                                                                             |

### Browser-measured skeleton text authoring

Responsive text is one of the easiest places for a polished loading state to drift away from the real UI. React Motion Gallery's skeleton text workflow measures real DOM text in a live page with headless Chrome, then emits `lines`, `barWidth`, `lastBarWidth`, and optional `barHeight`/`lineHeight` values for the skeleton `text` nodes used by `Slider`, `Grid`, `Masonry`, `Entries`, and standalone `Skeleton` layouts.

This is development-time authoring support, not production client code. It is especially useful for multiline cards, responsive grids, equal-height sliders, and reflow-sensitive masonry surfaces where a generic text placeholder can otherwise change row height, item height, or column packing when real content appears.

```bash
npm run --silent generate:skeleton-text-module -- \
  --input ./path/to/example.skeleton-text.browser.manifest.json \
  --analysis-output ./path/to/example.skeleton-text.measurements.json
```

Use `responsiveBy: "container"` when text wrapping follows the card or cell width more closely than the viewport. For equal-height card sliders, the browser analyzer can also measure all canonical slider items and emit `rowHeightCompensation` so unseen cards cannot surprise the skeleton row height. See [`docs/skeleton-text-authoring.md`](./docs/skeleton-text-authoring.md) for manifest fields, command options, and the Codex-friendly workflow.

### Slider skeleton cookie snapshot cache

The skeleton cookie snapshot cache remains available for slider skeletons. Use `SliderSkeleton` from `react-motion-gallery/skeleton/slider/restore` when a slider skeleton should read and write snapshot cookies, and add `restore` or use the `RestoredSliderSkeleton` alias when reload/back-forward restore is needed. Non-slider gallery loading surfaces no longer accept `loading.cache`, and the base/grid/masonry/entries cache wrapper subpaths have been removed.

In SSR frameworks, read cache cookies on the server with `react-motion-gallery/skeleton/cache`, pass snapshots through `SkeletonCacheProvider`, and opt slider skeletons in with a stable `cache={{ key, routeKey }}` object.

| Cache export | Notes |
| ------------ | ----- |
| `getSkeletonCacheCookieName(key)` | Returns the deterministic cookie name for a cache key. |
| `getSkeletonCacheRouteKey(location?)` | Builds the default route key from `pathname + search`, or `""` without a location. |
| `parseSkeletonCacheCookie(raw, options?)` | Parses and validates a cookie value into `SkeletonCacheSnapshot \| null`. |
| `serializeSkeletonCacheSnapshot(snapshot)` | Serializes a snapshot into the compact cookie payload string. |
| `validateSkeletonCacheSnapshot(snapshot, options?)` | Re-validates an already parsed snapshot against key, route, kind, viewport, TTL, text ids, and item metadata. |
| `SKELETON_CACHE_VERSION` and default constants | Exported for diagnostics and custom integrations: TTL, debounce, per-cookie byte budget, and total cookie byte budget. |

| `SkeletonCacheOptions` field | Type | Notes |
| ---------------------------- | ---- | ----- |
| `key` | `string` | Required stable cache identity. |
| `snapshot` | `SkeletonCacheSnapshot \| null` | Server-provided snapshot override. |
| `ttlMs` | `number` | Snapshot freshness window. Defaults to `DEFAULT_SKELETON_CACHE_TTL_MS`. |
| `debounceMs` | `number` | Client write debounce. Defaults to `DEFAULT_SKELETON_CACHE_DEBOUNCE_MS`. |
| `routeKey` | `string` | Optional route guard for page-specific skeleton geometry. |
| `cookie.path` | `string` | Cookie path. Defaults to `/`. |
| `cookie.sameSite` | `"lax" \| "strict" \| "none"` | SameSite policy. Defaults to `lax`. |
| `cookie.secure` | `boolean` | Adds the Secure cookie attribute when true. |
| `cookie.maxCookieBytes` | `number` | Per-cookie write budget. Defaults to `DEFAULT_SKELETON_CACHE_COOKIE_MAX_BYTES`. |
| `cookie.maxTotalCookieBytes` | `number` | Combined React Motion Gallery cache-cookie budget. Defaults to `DEFAULT_SKELETON_CACHE_COOKIE_MAX_TOTAL_BYTES`. |

| Parse/validate option | Notes |
| --------------------- | ----- |
| `key`, `scopeId`, `kind`, `routeKey` | Reject snapshots that do not match the expected identity, cache kind, or route. |
| `ttlMs`, `now` | Override freshness validation and the timestamp used for age checks. |
| `viewportWidth`, `viewportTolerancePx`, `widthBucketMin` | Require compatible viewport or bucket metadata. |
| `textIds` | Require text measurements for specific skeleton text ids. |
| `itemCount`, `variantKeys` | Require compatible masonry snapshot metadata when validating older/custom snapshots. |

`SkeletonCacheProvider` accepts `children`, shared `options`, one `snapshot`, or a keyed `snapshots` map. Provider snapshots are used during hydration, then the client refreshes readable cache cookies after mounted slider skeletons measure.

## Reveal

`Reveal` is a standalone entrance primitive for page sections and application UI. It is intentionally separate from skeleton loading and gallery reveal timing: content is already rendered, then opacity and optional transform animate when the element enters view.

Use `<Reveal>` by default. Use `useReveal` when you need to own the element, avoid an extra wrapper, merge refs, read `revealed` or `inView`, or build a higher-level abstraction. `Reveal` does not automatically wait for wrapped images to load or decode; pass `ready` when media readiness should gate the entrance.

```tsx
import { useImageDecodeReady } from "react-motion-gallery/media/ready";
import { Reveal } from "react-motion-gallery/reveal";

export function ImageSectionReveal({ src, alt }: { src: string; alt: string }) {
  const image = useImageDecodeReady({ src });

  return (
    <Reveal
      as="figure"
      ready={image.ready}
      transform={{ y: 18, scale: 0.98 }}
      durationMs={{ opacity: 220, transform: 680 }}
      easing={{
        opacity: "ease-out",
        transform: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      }}
      staggerIndex={1}
    >
      <img src={src} alt={alt} loading="eager" decoding="async" />
      <figcaption>Fast fade, slower motion.</figcaption>
    </Reveal>
  );
}
```

When you need to own the element directly, use `useReveal` with the same readiness gate:

```tsx
import { useImageDecodeReady } from "react-motion-gallery/media/ready";
import { useReveal } from "react-motion-gallery/reveal";

export function DecodedImageReveal({ src, alt }: { src: string; alt: string }) {
  const image = useImageDecodeReady({ src });
  const reveal = useReveal<HTMLElement>({
    ready: image.ready,
    transform: { y: 18, scale: 0.98 },
  });

  return (
    <figure
      {...reveal.revealProps}
      ref={reveal.ref}
      className={reveal.revealProps.className}
      style={reveal.revealProps.style}
    >
      <img src={src} alt={alt} loading="eager" decoding="async" />
    </figure>
  );
}
```

### Reveal props and options

`Reveal` is polymorphic through `as`; element-specific props are forwarded to the rendered element after the reveal options are removed. `useReveal(options)` accepts the same `RevealOptions` behavior props and returns props you can spread onto an element you own.

| Prop                | Type                                                         | Default                            | Notes                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`                | `React.ElementType`                                          | `"div"`                            | Render as another element or component, such as `"section"`, `"figure"`, or a custom component.                                                                  |
| `children`          | `React.ReactNode`                                            | `—`                                | Content rendered inside the revealed element.                                                                                                                    |
| `className`         | `string`                                                     | `—`                                | Merged with the internal reveal class.                                                                                                                           |
| `style`             | `React.CSSProperties`                                        | `—`                                | Merged onto the rendered element. A string `style.transform` becomes the final resting transform for transform reveals.                                          |
| `ref`               | `React.Ref<HTMLElement>`                                     | `—`                                | Forwarded to the rendered element.                                                                                                                               |
| `variant`           | `"fade" \| "transform"`                                      | `"transform"`                      | `fade` animates opacity only; `transform` also animates from the configured transform.                                                                           |
| `transform`         | `RevealTransform`                                            | `{ y: 14 }`                        | Typed transform object or raw CSS transform string used as the hidden/from transform.                                                                            |
| `once`              | `boolean`                                                    | `true`                             | Keeps the element revealed after the first reveal. Set `false` for reversible in-view reveals.                                                                   |
| `ready`             | `boolean`                                                    | `true`                             | Gates the reveal until external readiness, such as image decode, has completed. With `once: false`, dropping `ready` back to `false` can hide the element again. |
| `threshold`         | `number`                                                     | `0.12`                             | Intersection ratio required before reveal. Values are clamped between `0` and `1`.                                                                               |
| `rootMargin`        | `string`                                                     | `"0px 0px -8% 0px"`                | IntersectionObserver root margin used to tune when the element enters view.                                                                                      |
| `durationMs`        | `RevealDuration`                                             | `520`                              | Scalar timing applies to opacity and transform. Object timing can set `{ opacity, transform }` separately.                                                       |
| `delayMs`           | `number`                                                     | `0`                                | Base delay before the reveal animation starts. Negative values are clamped to `0`.                                                                               |
| `staggerIndex`      | `number`                                                     | `0`                                | Multiplies `staggerMs` and adds to `delayMs`; useful for repeated items. Negative values are clamped to `0`.                                                     |
| `staggerMs`         | `number`                                                     | `70`                               | Delay step used with `staggerIndex`. Negative values are clamped to `0`.                                                                                         |
| `easing`            | `RevealEasing`                                               | `"cubic-bezier(0.2, 0.7, 0.2, 1)"` | Scalar easing applies to both channels. Object easing can set `{ opacity, transform }` separately.                                                               |
| `disabled`          | `boolean`                                                    | `false`                            | Bypasses observer gating and renders as revealed.                                                                                                                |
| `onReveal`          | `() => void`                                                 | `—`                                | Called when the element transitions from hidden to revealed. Not called for disabled reveals.                                                                    |
| Other element props | `Omit<React.ComponentPropsWithoutRef<E>, reveal-owned keys>` | `—`                                | Forwarded to the rendered element, including ARIA attributes and event handlers, after reveal-owned props are removed.                                           |

### Reveal transform fields

Numbers in length fields become `px`; numbers in angle fields become `deg`. Pass a raw string as `transform` when you need complete CSS control.

| Field                          | Type           | Default                               | Notes                                                                    |
| ------------------------------ | -------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `x`, `y`, `z`                  | `RevealLength` | `0px` when any translate field is set | Builds `translate3d(x, y, z)`.                                           |
| `scale`                        | `number`       | `1`                                   | Uniform scale used by both axes unless `scaleX` or `scaleY` is provided. |
| `scaleX`, `scaleY`             | `number`       | `scale ?? 1`                          | Axis-specific scale values.                                              |
| `rotate`, `rotateX`, `rotateY` | `RevealAngle`  | `—`                                   | Rotation transforms.                                                     |
| `skewX`, `skewY`               | `RevealAngle`  | `—`                                   | Skew transforms.                                                         |
| `perspective`                  | `RevealLength` | `—`                                   | Prepended as `perspective(...)` when provided.                           |
| `raw`                          | `string`       | `—`                                   | Appended to the generated transform string.                              |

### Reveal exported types

| Type                      | Definition                                     | Notes                                                                                 |
| ------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| `RevealVariant`           | `"fade" \| "transform"`                        | Reveal animation mode.                                                                |
| `RevealLength`            | `number \| string`                             | Numeric values resolve to pixel lengths.                                              |
| `RevealAngle`             | `number \| string`                             | Numeric values resolve to degree angles.                                              |
| `RevealMotionChannel`     | `"opacity" \| "transform"`                     | Channels used by duration and easing objects.                                         |
| `RevealChannelOptions<T>` | `Partial<Record<RevealMotionChannel, T>>`      | Per-channel option helper.                                                            |
| `RevealDuration`          | `number \| RevealChannelOptions<number>`       | Shared or per-channel duration.                                                       |
| `RevealEasing`            | `string \| RevealChannelOptions<string>`       | Shared or per-channel easing.                                                         |
| `RevealTransformObject`   | transform fields table above                   | Object form for generated from-transforms.                                            |
| `RevealTransform`         | `RevealTransformObject \| string`              | Object or raw CSS transform string.                                                   |
| `RevealOptions`           | behavior options above                         | Options accepted by `useReveal`.                                                      |
| `RevealProps<E>`          | `RevealOptions` plus polymorphic element props | Props accepted by `<Reveal>`.                                                         |
| `UseRevealResult<T>`      | `{ ref, revealed, inView, revealProps }`       | Return value from `useReveal`; spread `revealProps` and attach `ref` to your element. |

## Slider

The default `Slider` is the small synchronous core: children, drag, wheel navigation, snapping, grouping, looping, index channels, reveal, and the imperative ref API. Heavier behavior is opt-in through first-party plugins, so importing one feature, such as arrows or parallax, does not pull in the rest of the slider feature set. Structured slider skeletons are owned by `SliderSkeleton`; reload and back/forward restore lives in the opt-in `RestoredSliderSkeleton`, composed with `useSliderReady()`.

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

| Option         | Type                     | Default                                       | Notes                                                                                                      |
| -------------- | ------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode`        | `—`                                           | Slide content rendered in order.                                                                           |
| `initialIndex` | `number`                 | `0`                                           | Selects the slide index used for the first layout and reveal fade-in.                                      |
| `breakpoints`  | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Merged with the internal breakpoint map for responsive values.                                             |
| `indexChannel` | `SliderIndexChannel`     | internal channel                              | Share index state with thumbnails or sibling sliders.                                                      |
| `plugins`      | `SliderPlugin[]`         | `[]`                                          | Explicit first-party slider features such as arrows, dots, auto-height, effects, fullscreen, or lazy-load. |

### Slider layout and scroll options

| Option                 | Type                                                   | Default   | Notes                                                                                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layout.gap`           | `number \| Record<string, number>`                     | `20`      | Responsive gap between cells.                                                                                                                                                                                                           |
| `layout.cellsPerSlide` | `number \| Record<string, number>`                     | `—`       | Groups multiple cells into a slide page.                                                                                                                                                                                                |
| `direction.dir`        | `"ltr" \| "rtl"`                                       | `"ltr"`   | Text direction and arrow direction.                                                                                                                                                                                                     |
| `direction.axis`       | `"x" \| "y"`                                           | `"x"`     | Horizontal or vertical slider axis.                                                                                                                                                                                                     |
| `align`                | `"start" \| "center"`                                  | `"start"` | Slide alignment inside the viewport.                                                                                                                                                                                                    |
| `scroll.groupCells`    | `boolean \| number \| Record<string, number>`          | `false`   | `true` groups each snap by the cells that fit in the viewport. A number groups exactly that many cells per snap without changing cell sizing. Responsive number maps use the same `breakpoints` prop as other slider responsive values. |
| `scroll.skipSnaps`     | `boolean \| { enabled?: boolean; threshold?: number }` | `false`   | Allows momentum to skip snap points. Object form enables skip snaps by default and `threshold` requires release force to reach a multiple of the adjacent snap distance before multi-snap momentum is used.                             |
| `scroll.strictSnaps`   | `boolean`                                              | `false`   | Prevents one drag release from settling more than one snap away from where the drag started. Overrides `scroll.skipSnaps`.                                                                                                              |
| `scroll.freeScroll`    | `boolean`                                              | `false`   | Enables free dragging instead of strict snapping.                                                                                                                                                                                       |
| `scroll.loop`          | `boolean`                                              | `false`   | Wraps around at the ends.                                                                                                                                                                                                               |
| `scroll.containScroll` | `boolean`                                              | `false`   | Clamps start/end snaps so non-looping variable-width or centered sliders do not leave excess empty space at the track edges.                                                                                                            |

`scroll.groupCells` affects the snap pages used by drag, wheel, arrows, dots, and imperative navigation. Use `true` for automatic fit-to-viewport grouping, or a count for explicit snap pages:

```tsx
<Slider
  breakpoints={{ desktop: 1000 }}
  scroll={{
    groupCells: {
      0: 1,
      desktop: 3,
    },
  }}
>
  {slides}
</Slider>
```

Numeric values are truncated and clamped to the available slide count. `1`, `0`, negative numbers, `NaN`, and `Infinity` resolve to the normal ungrouped snap behavior, so the slider keeps its standard end-of-track snap handling. Responsive values are re-resolved on viewport resize.

### Slider element and plugin options

`elements`, `motion`, and `reveal` stay in the core slider. Controls, autoplay, lazy media, effects, auto-height, fullscreen, and loading overlays are explicit plugin imports.

| Option                | Type                                                 | Default | Notes                                                   |
| --------------------- | ---------------------------------------------------- | ------- | ------------------------------------------------------- |
| `elements.viewport`   | `ElementStyle`                                       | `—`     | Class and inline style for the viewport element.        |
| `elements.container`  | `ElementStyle`                                       | `—`     | Class and inline style for the moving slider container. |
| `reveal.renderReveal` | `({ active, containerProps }, content) => ReactNode` | `—`     | Custom reveal wrapper.                                  |
| `reveal.staggerMs`    | `number`                                             | `—`     | Delay between item reveal fades.                        |
| `reveal.durationMs`   | `number`                                             | `—`     | Reveal fade duration.                                   |
| `reveal.easing`       | `string`                                             | `—`     | Reveal fade easing.                                     |

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

| Import                                    | Factory                     | Notes                                                                                      |
| ----------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| `react-motion-gallery/slider/arrows`      | `sliderArrows(options)`     | Previous/next arrows.                                                                      |
| `react-motion-gallery/slider/dots`        | `sliderDots(options)`       | Pagination dots.                                                                           |
| `react-motion-gallery/slider/progress`    | `sliderProgress(options)`   | Progress bar or custom progress renderer.                                                  |
| `react-motion-gallery/slider/scrollbar`   | `sliderScrollbar(options)`  | Range-style position control.                                                              |
| `react-motion-gallery/slider/ripple`      | `sliderRipple(options)`     | Enables ripple feedback for controls that call `createRipple`.                             |
| `react-motion-gallery/slider/auto-play`   | `sliderAutoPlay(options)`   | Timed slide changes.                                                                       |
| `react-motion-gallery/slider/auto-scroll` | `sliderAutoScroll(options)` | Timed continuous advancement.                                                              |
| `react-motion-gallery/slider/auto-height` | `sliderAutoHeight(options)` | Measures active slide height and gates slider readiness until measured.                    |
| `react-motion-gallery/slider/lazy-load`   | `sliderLazyLoad(options)`   | Adds lazy media attributes to slide images and videos.                                     |
| `react-motion-gallery/slider/parallax`    | `sliderParallax(options)`   | Parallax slide wrapper.                                                                    |
| `react-motion-gallery/slider/scale`       | `sliderScale(options)`      | Scales non-active slides.                                                                  |
| `react-motion-gallery/slider/fade`        | `sliderFade(options)`       | Fades non-active slides.                                                                   |
| `react-motion-gallery/slider/crossfade`   | `sliderCrossfade(options)`  | Enables crossfade-aware control navigation.                                                |
| `react-motion-gallery/slider/fullscreen`  | `sliderFullscreen()`        | Bridges a `GalleryCore layout="slider"` slider to fullscreen.                              |
| `react-motion-gallery/slider/loading`     | `sliderLoading(options)`    | Basic custom loading overlay. Prefer `SliderSkeleton` for structured skeleton and restore. |

### Slider loading skeletons

Use `SliderSkeleton` to own slider loading. `useSliderReady()` exposes the slider ref plus a settled `ready` flag; `isSlidesBuilt()` remains a lower-level DOM-built signal and is not the right fade-out trigger.

`layout.slots` is the per-slide override system. Define the shared placeholder once with `layout.item` and `layout.itemWrapStyle`, then override any individual slot with `slots[index]`. Slot `itemWrapStyle` values merge on top of the base wrap style, while `slot.item` can replace the placeholder node entirely for that slot.

`itemWrapStyle` now supports wrapper-only `border` and `boxShadow` values. Wrapper `width`, `height`, and `aspectRatio` are treated as outer border-box dimensions, so the inner placeholder shrinks by the border thickness. Use simple uniform border shorthands such as `1px solid #cbd5e1` when you want the built-in sizing math to account for the border width.

`text` nodes render one skeleton bar per `lines` value. `barHeight` controls the bar height and can be a single number or a numeric min-width map. `lineHeight` remains the full line-box multiplier and now accepts the same numeric min-width maps. `lines` can be a single number or a numeric min-width map such as `{ 0: 3, 767: 2, 1200: 1 }`. Use `lastBarWidth` to override the shortened trailing bar width; it defaults to `68%` of the text block width and can also be responsive with numeric min-width keys.

`centering: "first"` is designed for center-aligned peek sliders. When the real slider uses `align="center"` and the skeleton uses `mode: "peek"` with `layout.kind: "slider"`, the skeleton renderer inserts the leading spacer needed to center the first visible placeholder. You should not add that spacer manually.

When you provide `SliderSkeleton.timing`, `exitMs` controls both how long the loading layer remains mounted after exit starts and its opacity transition duration.

For sliders that need reload or back/forward restore, pair `RestoredSliderSkeleton.restore` with the same skeleton `cache` key. When cache is enabled, the restore payload is written into the skeleton cache cookie alongside text measurements. A valid cached restore can reserve the restored auto-height and slot order immediately, and `RestoredSliderSkeleton` can seed a direct `Slider` child with `initialIndex` before the handle is ready.

```tsx
import { RestoredSliderSkeleton as SliderSkeleton } from "react-motion-gallery/skeleton/slider/restore";
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

| Field             | Type                               | Notes                                                                                                          |
| ----------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `mode`            | `"fit" \| "peek"`                  | `"peek"` preserves partial next or previous slide visibility in the loading state.                             |
| `centering`       | `"first"`                          | Adds the leading spacer needed for the first visible slot when using the built-in centered peek skeleton flow. |
| `visibleCount`    | `number \| Record<string, number>` | Responsive count of visible skeleton slots.                                                                    |
| `className`       | `string \| undefined`              | Applied to the skeleton overlay root.                                                                          |
| `style`           | `React.CSSProperties \| undefined` | Inline styles for the skeleton overlay root.                                                                   |
| `layout`          | `SliderSkeletonNode \| undefined`  | Structured placeholder layout tree. Use `kind: "slider"` to model slide tracks.                                |
| `backgroundColor` | `string \| undefined`              | Overrides the shared skeleton background color token.                                                          |
| `radius`          | `number \| string \| undefined`    | Overrides the shared skeleton radius token.                                                                    |
| `shimmer`         | `SkeletonShimmer \| undefined`     | Shared shimmer settings for the entire skeleton tree.                                                          |

#### `SliderSkeletonSliderNode`

| Field           | Type                                                               | Notes                                                                                                                                         |
| --------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`          | `"slider"`                                                         | Slider-specific skeleton layout root.                                                                                                         |
| `style`         | `SkeletonContainerStyle \| Record<string, SkeletonContainerStyle>` | Track-level container styles such as `gap`, `padding`, `align`, `justify`, `width`, and `maxWidth`.                                           |
| `count`         | `number \| undefined`                                              | Optional explicit slot count for the layout. Falls back to `visibleCount` on the surrounding slider skeleton spec.                            |
| `item`          | `SkeletonNode`                                                     | Default placeholder node rendered in each slot.                                                                                               |
| `itemWrapStyle` | `SliderSkeletonWrapStyle \| undefined`                             | Shared wrapper size, margin, border, and box-shadow rules for every slot. Border sizing is border-box.                                        |
| `slots`         | `SliderSkeletonSlot[] \| undefined`                                | Per-slot overrides for variable widths, heights, aspect ratios, or custom placeholder nodes.                                                  |
| `direction`     | `"row" \| "col" \| undefined`                                      | Slot flow direction. `centering: "first"` only affects row layouts.                                                                           |
| `children`      | `SkeletonNode[] \| undefined`                                      | Optional extra skeleton content rendered after the slider row. It does not affect `--rmg-slider-initial-height` or reserve live layout space. |

#### `SliderSkeletonSlot`

| Field           | Type                                   | Notes                                                                                                 |
| --------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `item`          | `SkeletonNode \| undefined`            | Replaces the base `layout.item` for one slot.                                                         |
| `itemWrapStyle` | `SliderSkeletonWrapStyle \| undefined` | Merges on top of the base `layout.itemWrapStyle` for one slot, including wrapper borders and shadows. |

`SkeletonNode` supports these building blocks: `rect`, `square`, `circle`, `text`, `media`, `row`, `col`, and `stack`. `text.barHeight` controls the bar height, `text.lines` controls how many wrapped skeleton rows render for that text block, and `text.lastBarWidth` controls the trailing bar width.

### Slider motion options

| Option                      | Type     | Default | Notes                                  |
| --------------------------- | -------- | ------- | -------------------------------------- |
| `motion.selectDuration`     | `number` | `25`    | Duration for snapped selection motion. |
| `motion.freeScrollDuration` | `number` | `43`    | Duration for free-scroll settling.     |
| `motion.friction`           | `number` | `0.68`  | Drag and settling friction.            |

### Slider render callback args

#### `ArrowRenderArgs`

| Field          | Type                                      | Notes                                             |
| -------------- | ----------------------------------------- | ------------------------------------------------- |
| `ref`          | `React.RefObject<HTMLDivElement \| null>` | Attach to the arrow root.                         |
| `onClick`      | `() => void`                              | Calls the built-in previous or next action.       |
| `hidden`       | `boolean`                                 | `true` when the arrow should not render visually. |
| `disabled`     | `boolean`                                 | `true` when navigation is unavailable.            |
| `createRipple` | `(el: HTMLElement) => void`               | Triggers the built-in ripple effect manually.     |
| `className`    | `string \| undefined`                     | Resolved class name for the arrow root.           |

#### `DotsRenderArgs`

| Field                | Type                                                      | Notes                              |
| -------------------- | --------------------------------------------------------- | ---------------------------------- |
| `ref`                | `React.RefObject<HTMLDivElement \| null>`                 | Attach to the dots root.           |
| `count`              | `number`                                                  | Dot count.                         |
| `activeIndex`        | `number`                                                  | Current selected slide index.      |
| `hidden`             | `boolean`                                                 | `true` when dots should be hidden. |
| `goTo`               | `(index: number) => void`                                 | Navigate to a slide.               |
| `getDotRef`          | `(index: number) => (el: HTMLDivElement \| null) => void` | Ref factory for each dot.          |
| `createRipple`       | `(el: HTMLElement) => void`                               | Manual ripple trigger.             |
| `classNameContainer` | `string \| undefined`                                     | Resolved root class name.          |
| `classNameDot`       | `string \| undefined`                                     | Resolved dot class name.           |

#### `ProgressRenderArgs`

| Field            | Type                                     | Notes                                          |
| ---------------- | ---------------------------------------- | ---------------------------------------------- |
| `ref`            | `React.Ref<HTMLDivElement>`              | Attach to the progress root.                   |
| `innerRef`       | `React.Ref<HTMLDivElement> \| undefined` | Attach to the fill element.                    |
| `hidden`         | `boolean`                                | `true` when the progress bar should be hidden. |
| `progress`       | `number`                                 | Progress value from `0` to `1`.                |
| `axis`           | `"x" \| "y"`                             | Fill direction.                                |
| `className`      | `string \| undefined`                    | Root class name.                               |
| `style`          | `React.CSSProperties \| undefined`       | Root inline style.                             |
| `innerClassName` | `string \| undefined`                    | Fill class name.                               |
| `innerStyle`     | `React.CSSProperties \| undefined`       | Fill inline style.                             |

### `SliderHandle` methods

| Method              | Signature                                                                                     | Notes                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `centerSlider`      | `() => void`                                                                                  | Re-centers the slider after layout changes.                                                             |
| `getIndex`          | `() => number`                                                                                | Current active slide index.                                                                             |
| `setIndex`          | `(i: number, mode?: IndexMode) => void`                                                       | Jumps or animates to a slide.                                                                           |
| `subscribeIndex`    | `(fn: () => void) => () => void`                                                              | Subscribes to index changes.                                                                            |
| `slideIndexForCell` | `(cellIndex: number) => number`                                                               | Maps a cell index to its slide index when using grouped cells.                                          |
| `getRootNode`       | `() => HTMLElement \| null`                                                                   | Outer slider root.                                                                                      |
| `getContainerNode`  | `() => HTMLElement \| null`                                                                   | Moving slide container.                                                                                 |
| `getSlideNodes`     | `() => HTMLElement[]`                                                                         | Current slide elements.                                                                                 |
| `getViewportNode`   | `() => HTMLDivElement \| null`                                                                | Scroll viewport.                                                                                        |
| `onSlidesBuilt`     | `(cb: (nodes: HTMLElement[]) => void) => () => void`                                          | Runs when slide nodes are ready.                                                                        |
| `whenSlidesBuilt`   | `() => Promise<HTMLElement[]>`                                                                | Promise form of `onSlidesBuilt`.                                                                        |
| `isSlidesBuilt`     | `() => boolean`                                                                               | `true` once the slide list is ready.                                                                    |
| `onReady`           | `(cb: (nodes: HTMLElement[]) => void) => () => void`                                          | Runs when the slider has built, measured, committed its index, and all plugin ready gates have cleared. |
| `whenReady`         | `() => Promise<HTMLElement[]>`                                                                | Promise form of `onReady`.                                                                              |
| `isReady`           | `() => boolean`                                                                               | `true` once the settled slider ready signal has fired.                                                  |
| `scrollNext`        | `(mode?: IndexMode) => void`                                                                  | Advances one step.                                                                                      |
| `scrollPrev`        | `(mode?: IndexMode) => void`                                                                  | Moves backward one step.                                                                                |
| `canScrollNext`     | `() => boolean`                                                                               | Whether next navigation is available.                                                                   |
| `canScrollPrev`     | `() => boolean`                                                                               | Whether previous navigation is available.                                                               |
| `scrollProgress`    | `() => number`                                                                                | Current progress from `0` to `1`.                                                                       |
| `cellsInView`       | `() => number[]`                                                                              | Canonical cell indexes currently visible.                                                               |
| `append`            | `(nodes: ReactNode \| ReactNode[]) => number`                                                 | Appends nodes and returns the new total count.                                                          |
| `prepend`           | `(nodes: ReactNode \| ReactNode[]) => number`                                                 | Prepends nodes and returns the new total count.                                                         |
| `insert`            | `(index: number, nodes: ReactNode \| ReactNode[]) => number`                                  | Inserts nodes and returns the new total count.                                                          |
| `remove`            | `(indexOrPredicate: number \| ((i: number) => boolean)) => number`                            | Removes items and returns the new total count.                                                          |
| `replace`           | `(index: number, node: ReactNode) => void`                                                    | Replaces a node at an index.                                                                            |
| `setItems`          | `(nodes: ReactNode[]) => number`                                                              | Replaces all nodes and returns the new total count.                                                     |
| `onIndexChange`     | `(cb: (i: number, meta: { mode: IndexMode }) => void) => () => void`                          | Subscribes to index changes.                                                                            |
| `getInternals`      | `() => { slides, slider, visibleImages, selectedIndex, sliderX, sliderVelocity, isWrapping }` | Low-level internals used by fullscreen and advanced sync code.                                          |

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

| Method                     | Signature                                                                | Notes                                                             |
| -------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `createSliderIndexChannel` | `(initialIndex = 0, initialMode = "animated") => SliderIndexChannel`     | Creates a shared index event bus.                                 |
| `get`                      | `() => { index: number; mode: IndexMode }`                               | Reads the stored index and mode.                                  |
| `set`                      | `(next: number, mode?: IndexMode, opts?: { silent?: boolean }) => void`  | Sets the current index and emits a `"set"` event unless silenced. |
| `bump`                     | `(delta: number, mode?: IndexMode, opts?: { silent?: boolean }) => void` | Emits a relative index change event.                              |
| `subscribe`                | `(fn: () => void) => () => void`                                         | Subscribes to channel updates.                                    |
| `onEvent`                  | `(fn: (ev: IndexEvent) => void) => () => void`                           | Receives the last `"set"` or `"bump"` event payload.              |
| `onBasePointerDown`        | `(fn: () => void) => () => void`                                         | Subscribes to base slider pointer-down events.                    |
| `emitBasePointerDown`      | `() => void`                                                             | Broadcasts a pointer-down event to subscribers.                   |

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

| Option             | Type                       | Default                                       | Notes                                                                                   |
| ------------------ | -------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `children`         | `React.ReactNode`          | `—`                                           | Thumbnail nodes rendered in order. Overrides `options.children` when both are provided. |
| `options`          | `ThumbnailsOptions`        | `—`                                           | Base thumbnail configuration object.                                                    |
| `indexChannel`     | `SliderIndexChannel`       | internal channel                              | Share the same channel as a base `Slider` to keep selection in sync.                    |
| `breakpoints`      | `Record<string, number>`   | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Used to resolve `layout.position` and responsive loading counts.                        |
| `onThumbnailClick` | `(index: number) => void`  | `—`                                           | Fired when a thumbnail click publishes a selection to the shared channel.               |
| `onReadyChange`    | `(ready: boolean) => void` | `—`                                           | Fired when the thumbnail rail finishes or re-enters its loading/layout cycle.           |
| `direction`        | `"ltr" \| "rtl"`           | `"ltr"`                                       | Affects horizontal arrow direction and RTL scroll behavior.                             |

### Thumbnail layout and scroll options

| Option                     | Type                 | Default    | Notes                                                                 |
| -------------------------- | -------------------- | ---------- | --------------------------------------------------------------------- |
| `children`                 | `React.ReactNode`    | `—`        | Fallback thumbnail content when component children are omitted.       |
| `layout.position`          | `ResponsivePosition` | `"bottom"` | Thumbnail rail position: `"top"`, `"right"`, `"bottom"`, or `"left"`. |
| `layout.gap`               | `number`             | `8`        | Gap between thumbnails.                                               |
| `layout.center`            | `boolean`            | `false`    | Centers the overall rail content within its container when possible.  |
| `layout.thumbnail.width`   | `number \| string`   | `—`        | Width for each thumbnail item.                                        |
| `layout.thumbnail.height`  | `number \| string`   | `—`        | Height for each thumbnail item.                                       |
| `layout.container.width`   | `number \| string`   | `—`        | Width for the outer thumbnail container.                              |
| `layout.container.height`  | `number \| string`   | `—`        | Height for the outer thumbnail container.                             |
| `scroll.freeScroll`        | `boolean`            | `true`     | Enables drag or wheel movement without strict snapping.               |
| `scroll.groupCells`        | `boolean`            | `false`    | Pages the rail by grouped thumbnail cells.                            |
| `scroll.loop`              | `boolean`            | `false`    | Wraps thumbnails at the ends.                                         |
| `scroll.skipSnaps`         | `boolean`            | `false`    | Allows momentum to skip snap points.                                  |
| `scroll.centerActiveThumb` | `boolean`            | `false`    | Repositions the rail to keep the active thumbnail centered.           |

`ResponsivePosition` accepts a single side, an array, or a breakpoint map. For arrays, the first entry is used.

### Thumbnail element, control, and motion options

| Option                      | Type                                                               | Default                                       | Notes                                                                    |
| --------------------------- | ------------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------ |
| `elements.container`        | `ElementStyle`                                                     | `—`                                           | Class and inline style for the outer thumbnail container.                |
| `elements.thumbnail`        | `ElementStyle`                                                     | `—`                                           | Class and inline style for each thumbnail item shell.                    |
| `controls.enabled`          | `boolean`                                                          | `false`                                       | Shows previous and next arrows when the rail overflows.                  |
| `controls.arrow`            | `ElementStyle`                                                     | `—`                                           | Shared arrow class and style.                                            |
| `controls.prev`             | `ElementStyle`                                                     | `—`                                           | Previous-arrow override.                                                 |
| `controls.next`             | `ElementStyle`                                                     | `—`                                           | Next-arrow override.                                                     |
| `controls.render`           | `(args: ArrowRenderArgs & { dir: "prev" \| "next" }) => ReactNode` | `—`                                           | Custom renderer for both thumbnail arrows.                               |
| `controls.renderPrev`       | `(args: ArrowRenderArgs) => ReactNode`                             | `—`                                           | Custom previous arrow.                                                   |
| `controls.renderNext`       | `(args: ArrowRenderArgs) => ReactNode`                             | `—`                                           | Custom next arrow.                                                       |
| `controls.ripple.enabled`   | `boolean`                                                          | `true`                                        | Enables ripple feedback for thumbnail arrows.                            |
| `controls.ripple.className` | `string`                                                           | `—`                                           | Custom ripple class for the arrow feedback element.                      |
| `motion.selectDuration`     | `number`                                                           | `25`                                          | Duration for snapped thumbnail selection motion.                         |
| `motion.freeScrollDuration` | `number`                                                           | `43`                                          | Duration for free-scroll settling.                                       |
| `motion.friction`           | `number`                                                           | `0.68`                                        | Drag and settling friction.                                              |
| `breakpointMap`             | `Record<string, number>`                                           | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Override map used for responsive thumbnail positions and loading counts. |

### Thumbnail transition options

| Option                                    | Type                                                                                | Default                      | Notes                                                                                                                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transitions.loading.enabled`             | `boolean`                                                                           | `true`                       | Enables the thumbnail loading layer.                                                                                                                                        |
| `transitions.loading.force`               | `boolean \| { enabled?: boolean; showContent?: boolean; skeletonOpacity?: number }` | `false`                      | Forces the loading layer to remain visible. Set `showContent: true` to preview the real thumbnails under the skeleton, and tune the loading overlay with `skeletonOpacity`. |
| `transitions.loading.skeletonCount`       | `number \| Record<string, number>`                                                  | `—`                          | Responsive count for the built-in loading placeholders.                                                                                                                     |
| `transitions.loading.mode`                | `"fit" \| "peek"`                                                                   | `"peek"`                     | `"peek"` keeps fixed-size thumbnail placeholders when width or height is explicitly set; `"fit"` divides the rail evenly across the visible count.                          |
| `transitions.loading.elements.container`  | `ElementStyle`                                                                      | `—`                          | Class and inline style for the built-in loading overlay container.                                                                                                          |
| `transitions.loading.elements.row`        | `ElementStyle`                                                                      | `—`                          | Class and inline style for the built-in skeleton row or column wrapper.                                                                                                     |
| `transitions.loading.elements.thumbnail`  | `ElementStyle`                                                                      | `—`                          | Class and inline style for each built-in thumbnail placeholder.                                                                                                             |
| `transitions.loading.renderLoading`       | `({ count }) => ReactNode`                                                          | `—`                          | Replaces the built-in thumbnail loading skeleton and receives the resolved responsive count.                                                                                |
| `transitions.loading.timing.exitMs`       | `number`                                                                            | `600`                        | Keeps the thumbnail loading layer mounted for this long after exit starts.                                                                                                  |
| `transitions.loading.timing.minVisibleMs` | `number`                                                                            | `220`                        | Minimum time the loading layer stays visible before exit can begin.                                                                                                         |
| `reveal.renderReveal`                     | `({ active, containerProps }, inner) => ReactNode`                                  | `—`                          | Custom reveal wrapper for the thumbnail rail.                                                                                                                               |
| `reveal.staggerMs`                        | `number`                                                                            | `40`                         | Delay between thumbnail reveal fades.                                                                                                                                       |
| `reveal.durationMs`                       | `number`                                                                            | `300`                        | Reveal fade duration.                                                                                                                                                       |
| `reveal.easing`                           | `string`                                                                            | `"cubic-bezier(.2,.7,.2,1)"` | Reveal fade easing.                                                                                                                                                         |

`transitions.loading.elements.*` only applies to the built-in thumbnail skeleton. If you provide `transitions.loading.renderLoading`, you fully own the loading markup instead.

The built-in thumbnail placeholders use the same shimmer variable family as slider skeletons: `--rmg-skel-bg`, `--rmg-skel-shimmer-enabled`, `--rmg-skel-shimmer-opacity`, `--rmg-skel-shimmer-filter`, `--rmg-skel-shimmer-angle`, `--rmg-skel-shimmer-c1`, `--rmg-skel-shimmer-c2`, `--rmg-skel-shimmer-c3`, `--rmg-skel-shimmer-duration`, and `--rmg-skel-shimmer-timing`.

For thumbnails, `transitions.loading.timing.exitMs` controls both the mounted exit lifetime and the loading-layer opacity fade. The thumbnail reveal can begin as soon as the loading exit starts.

### `createThumbnailSyncBridge`

`ThumbnailSlider` creates and starts this bridge for you internally when you pass `indexChannel`. Reach for `createThumbnailSyncBridge()` only when you need to wire a local thumbnail rail to an external slider channel manually.

| Method                      | Signature                                                                        | Notes                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `createThumbnailSyncBridge` | `(args: { localChannel, externalChannel?, clampIndex? }) => ThumbnailSyncBridge` | Creates a bridge between local thumbnail state and an optional external slider channel. |
| `start`                     | `() => () => void`                                                               | Starts syncing and returns a cleanup function.                                          |
| `stop`                      | `() => void`                                                                     | Stops syncing without disposing the channels.                                           |
| `publishThumbnailClick`     | `(index: number, mode?: IndexMode) => void`                                      | Publishes a thumbnail click to the external slider channel.                             |

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

| Option              | Type                      | Default                                       | Notes                                                                                                            |
| ------------------- | ------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `children`          | `React.ReactNode`         | `—`                                           | Grid items rendered in order. Wrap individual cards in `Grid.Item` when they need custom spans or wrapper props. |
| `breakpoints`       | `Record<string, number>`  | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Used to resolve responsive columns and gaps.                                                                     |
| `gridItemBaseClass` | `string`                  | `"rmg__grid-item"`                            | Internal item base class override.                                                                               |
| `renderMode`        | `"wrap" \| "passthrough"` | `"wrap"`                                      | `wrap` adds an item wrapper; `passthrough` keeps child structure closer to the source node.                      |

### Grid.Item props

`Grid.Item` is a metadata wrapper. It renders only its children, while Grid reads the wrapper props and applies them to the generated item shell.

| Option      | Type                                                   | Default | Notes                                                                                                              |
| ----------- | ------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `children`  | `React.ReactNode`                                      | `—`     | The grid card content.                                                                                             |
| `span`      | `number \| "full" \| Record<string, number \| "full">` | `1`     | Per-item track span. `"full"` renders `grid-column: 1 / -1`; numeric values render `grid-column: span n / span n`. |
| `revealKey` | `React.Key`                                            | `—`     | Stable reveal identity for a slot whose backing data can change.                                                    |
| `className` | `string`                                               | `—`     | Extra class name merged onto the grid item wrapper.                                                                |
| `style`     | `React.CSSProperties`                                  | `—`     | Inline styles merged onto the grid item wrapper.                                                                   |

### Grid options

| Option                | Type                               | Default                      | Notes                                                                                                                                                                             |
| --------------------- | ---------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`             | `number \| Record<string, number>` | `—`                          | Fixed responsive column count. When omitted, Grid auto-fits using `minColumnWidth`.                                                                                               |
| `templateColumns`     | `string \| Record<string, string>` | `—`                          | Explicit `grid-template-columns` value. Takes precedence over `columns` and `minColumnWidth`.                                                                                     |
| `minColumnWidth`      | `number \| string`                 | `160`                        | Minimum width used by auto-fit mode.                                                                                                                                              |
| `gap`                 | `number \| Record<string, number>` | `8`                          | Responsive grid gap.                                                                                                                                                              |
| `rootClassName`       | `string`                           | `—`                          | Class name for the grid root.                                                                                                                                                     |
| `itemClassName`       | `string`                           | `—`                          | Class name added to each wrapped grid item.                                                                                                                                       |
| `fullscreenTrigger`   | `"item" \| "media"`                | `"media"`                    | When `gridFullscreen()` is active, opens fullscreen from the clicked media node or the entire item shell.                                                                         |
| `plugins`             | `GridPlugin[]`                     | `[]`                         | Explicit first-party Grid features such as lazy-load, fullscreen, pagination, load-more, infinite scroll, and virtualization.                                                     |
| `loading`             | `GridLoadingOptions`               | `—`                          | Core per-item skeleton/reveal lifecycle. Supports structured or callback skeletons, `active`, `count`, media decode waiting, forced compare mode, skeleton timing, and reveal identity memory. |
| `reveal.staggerMs`    | `number`                           | `60`                         | Reveal stagger for the fade-in.                                                                                                                                                   |
| `reveal.durationMs`   | `number`                           | `600`                        | Reveal fade duration.                                                                                                                                                             |
| `reveal.easing`       | `string`                           | `"cubic-bezier(.2,.7,.2,1)"` | Reveal fade easing.                                                                                                                                                               |
| `reveal.staggerLimit` | `number`                           | `—`                          | Optional cap on how many items stagger.                                                                                                                                           |
| `reveal.disabled`     | `boolean`                          | `false`                      | Disables the per-item reveal animation when `loading` is enabled.                                                                                                                 |

### Grid plugins

Import Grid plugins from their own subpaths and pass them to `plugins`.

```typescript
import { Grid } from "react-motion-gallery/grid";
import { gridLazyLoad } from "react-motion-gallery/grid/lazy-load";
import { gridFullscreen } from "react-motion-gallery/grid/fullscreen";
import { useGridPagination } from "react-motion-gallery/grid/pagination";
import { useGridLoadMore } from "react-motion-gallery/grid/load-more";
import { useGridInfiniteScroll } from "react-motion-gallery/grid/infinite-scroll";
import { gridVirtualization } from "react-motion-gallery/grid/virtualization";

function ProductGrid({ items, total }) {
  const pagination = useGridPagination({ pageSize: 12, total });

  return (
    <Grid plugins={[pagination.plugin, gridLazyLoad({ spinner: true }), gridFullscreen()]}>
      {items}
    </Grid>
  );
}
```

| Import                                      | Factory                       | Notes                                                                                                                                                    |
| ------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-motion-gallery/grid/lazy-load`       | `gridLazyLoad(options)`       | Rewrites trackable image `src` values into `data-rmg-lazy-src`, reveals them on viewport intersection, then fades them in after decode and spinner exit. |
| `react-motion-gallery/grid/fullscreen`      | `gridFullscreen()`            | Opens `GalleryCore` fullscreen from Grid items without adding fullscreen code to the default grid import.                                                |
| `react-motion-gallery/grid/pagination`      | `gridPagination(options)`     | Windows children by `pageIndex` and `pageSize`; `useGridPagination()` also returns page state and `GridPaginationControls`.                              |
| `react-motion-gallery/grid/load-more`       | `gridLoadMore(options)`       | Windows children by `visibleCount`; `useGridLoadMore()` owns and increments the visible count.                                                           |
| `react-motion-gallery/grid/infinite-scroll` | `gridInfiniteScroll(options)` | Renders a sentinel after the grid root and calls `onLoadMore` when it intersects.                                                                        |
| `react-motion-gallery/grid/virtualization`  | `gridVirtualization(options)` | Runs after pagination/load-more and mounts only rows near the viewport, using row spacers and measured row heights.                                      |

`gridLazyLoad()` enables lazy loading by default. Pass `{ enabled: false }` to make the plugin inert.

Grid pagination, load-more, infinite-scroll, and virtualization APIs are documented in the shared data-plugin sections after Entries. Pagination and load-more window the child list before CSS grid layout, so hidden items do not reserve tracks. In `"server"` mode the supplied children and `fullscreenItems` are treated as the current server window.

Grid fullscreen behavior is provided by `GalleryCore`, `useFullscreenController`, and the opt-in `gridFullscreen()` plugin. The Grid ref handle is for readiness and DOM access; fullscreen opens through `GalleryCore` rather than a Grid imperative method.

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

Grid owns a per-item loading lifecycle through `loading`. Each item paints hidden, enters the viewport, waits for its images/video and lazy-loaded media to be ready, exits its skeleton, then reveals. Below-fold items reveal when they enter view and do not block the initial grid ready state.

Grid skeleton specs live in `react-motion-gallery/skeleton/grid`. Their `text` nodes use the same wrapped-line treatment as slider skeletons, including responsive `barHeight` and `lines` maps plus the configurable trailing `lastBarWidth`.

Grid skeleton slots inherit real item spans by default. Slot overrides in the skeleton layout can change individual placeholder nodes or wrapper styles without losing the span applied by `Grid.Item`.

Use `loading.active` to hold reveals while async data is pending, `loading.timing.exitMs` to control the per-item skeleton opacity fade-out duration, and `loading.keepSkeletonMounted` when a settled skeleton layer should stay mounted at opacity 0 so a later loading transition can fade it back in smoothly. Set `rememberRevealed: false` for server-paged slots that should animate again when an item leaves and later re-enters the current data window. If an item should keep the same grid slot while its backing data changes, pass `revealKey` on `Grid.Item` or `data-rmg-grid-reveal-key` on a raw child.

#### `GridLoadingOptions`

| Option                       | Type                                                                                | Default | Notes                                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`                    | `boolean`                                                                           | `true` when `loading` is provided | Disables the Grid loading/reveal lifecycle when false.                                                                              |
| `active`                     | `boolean`                                                                           | `false` | Holds the grid busy, blocks reveal unless forced, and creates placeholder cells when there are no children.                                                       |
| `count`                      | `number`                                                                            | `0`     | Placeholder count used with `active` and empty children. Falls back to `GridSkeletonSpec.layout.count` when available.                                           |
| `skeleton`                   | `GridSkeletonSpec \| ((args: GridLoadingSkeletonArgs) => ReactNode)`                | `—`     | Structured skeleton spec or custom per-item skeleton renderer. Structured specs also render an internal normal-flow grid skeleton during SSR for layout stability. |
| `force`                      | `boolean \| { enabled?: boolean; showContent?: boolean; skeletonOpacity?: number }` | `false` | Keeps skeletons visible. `showContent: true` enables compare mode with mounted content under the skeleton.                                                       |
| `timing.enterMs`             | `number`                                                                            | `exitMs` | Skeleton opacity enter duration when forced loading returns.                                                                                                    |
| `timing.minVisibleMs`        | `number`                                                                            | `120`   | Minimum time an item skeleton remains visible before reveal can start.                                                                                          |
| `timing.exitMs`              | `number`                                                                            | `220`   | Item skeleton opacity fade-out duration.                                                                                                                        |
| `animate`                    | `boolean`                                                                           | `true`  | Set false to collapse enter/exit durations to zero. Reduced-motion preferences also disable these durations.                                                     |
| `waitForMedia`               | `boolean`                                                                           | `true`  | Waits for trackable descendant media to load/decode before reveal.                                                                                              |
| `decodeTimeoutMs`            | `number`                                                                            | `8000`  | Media readiness timeout fallback.                                                                                                                              |
| `rootMargin`                 | `string`                                                                            | `"0px"` | IntersectionObserver root margin for item reveal.                                                                                                               |
| `threshold`                  | `number`                                                                            | `0.01`  | IntersectionObserver threshold for item reveal.                                                                                                                 |
| `keepSkeletonMounted`        | `boolean`                                                                           | `false` | Keeps callback skeletons mounted after reveal. Structured `GridSkeletonSpec` skeletons stay mounted as inner layout anchors by default.                          |
| `rememberRevealed`           | `boolean`                                                                           | `true`  | Keeps known item identities revealed across data-window changes.                                                                                                |

#### `GridLoadingSkeletonArgs`

| Field         | Type        | Notes                                                            |
| ------------- | ----------- | ---------------------------------------------------------------- |
| `index`       | `number`    | Source item index.                                                |
| `key`         | `React.Key` | Grid item key.                                                    |
| `revealKey`   | `React.Key` | Stable reveal identity when provided.                            |
| `placeholder` | `boolean`   | True for empty-grid placeholder cells created from loading count. |
| `ready`       | `boolean`   | Whether the item content is considered ready for the skeleton.    |

### `GridHandle` methods

Forward a ref to `Grid` when parent code needs readiness or DOM access.

| Method         | Signature                                               | Notes                                      |
| -------------- | ------------------------------------------------------- | ------------------------------------------ |
| `getRootNode`  | `() => HTMLElement \| null`                             | Returns the live grid root.                |
| `getItemNodes` | `() => HTMLElement[]`                                   | Returns current rendered grid item nodes.  |
| `isReady`      | `() => boolean`                                         | True when client, loading, and plugin gates are ready. |
| `onReady`      | `(callback: (nodes: HTMLElement[]) => void) => () => void` | Subscribes to the ready signal.         |

```typescript
import { Grid } from "react-motion-gallery";
import type { GridSkeletonSpec } from "react-motion-gallery/skeleton/grid";

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
  return (
    <Grid
      columns={{ 0: 1, 640: 2, 960: 3 }}
      gap={{ 0: 12, 960: 20 }}
      loading={{
        skeleton: gridSkeleton,
        timing: { minVisibleMs: 220, exitMs: 600 },
      }}
    >
      {images.map((image) => (
        <img key={image.src} src={image.src} alt={image.alt} />
      ))}
    </Grid>
  );
}
```

## Masonry

```typescript
import { Masonry } from "react-motion-gallery";

const images = [
  { src: "https://picsum.photos/id/1018/1200/1600", width: 1200, height: 1600 },
  { src: "https://picsum.photos/id/1025/1200/900", width: 1200, height: 900 },
  { src: "https://picsum.photos/id/1036/1200/1500", width: 1200, height: 1500, span: { 0: 1, 1100: 2 } },
  { src: "https://picsum.photos/id/1041/1200/800", width: 1200, height: 800 },
];

export function BasicMasonry() {
  return (
    <Masonry columns={{ 0: 1, 700: 2, 1100: 3 }} gap={{ 0: 12, 1100: 20 }}>
      {images.map((image, index) => (
        <Masonry.Item
          key={image.src}
          width={image.width}
          height={image.height}
          span={image.span}
        >
          <img
            src={image.src}
            alt={`Masonry item ${index + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
          />
        </Masonry.Item>
      ))}
    </Masonry>
  );
}
```

### Masonry component props

| Option        | Type                     | Default                                       | Notes                                                                     |
| ------------- | ------------------------ | --------------------------------------------- | ------------------------------------------------------------------------- |
| `children`    | `React.ReactNode`        | `—`                                           | Dimensioned masonry items. Each item should be wrapped in `Masonry.Item`. |
| `breakpoints` | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Used to resolve responsive columns and gaps.                              |

### Masonry.Item props

| Option      | Type                                                   | Default | Notes                                                                                                                  |
| ----------- | ------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `children`  | `React.ReactNode`                                      | `—`     | The masonry card content.                                                                                              |
| `width`     | `number`                                               | `—`     | Intrinsic item width used for aspect-ratio layout.                                                                     |
| `height`    | `number`                                               | `—`     | Intrinsic item height used for aspect-ratio layout.                                                                    |
| `heightOffsetPx` | `number \| Record<string, number> \| { rules, fallback? }` | `0` | Pixel height added after aspect-ratio scaling, useful for ratio-based media plus fixed or responsive chrome.           |
| `span`      | `number \| "full" \| Record<string, number \| "full">` | `1`     | Per-item track span. `"full"` resolves to the active column count and numeric values clamp to the current track count. |
| `revealKey` | `React.Key`                                            | `—`     | Stable reveal identity for a slot whose backing data can change.                                                       |
| `placeholder` | `boolean`                                           | `false` | Marks a manually supplied item placeholder as hidden from assistive tech.                                              |
| `className` | `string`                                               | `—`     | Extra class name merged onto the masonry item wrapper.                                                                 |
| `style`     | `React.CSSProperties`                                  | `—`     | Inline styles merged onto the masonry item wrapper.                                                                    |

### Masonry options

| Option              | Type                                              | Default                      | Notes                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`           | `number \| Record<string, number>`                | `—`                          | Responsive column count.                                                                                                                                                                             |
| `gap`               | `number \| Record<string, number>`                | `—`                          | Responsive gap between columns and items.                                                                                                                                                            |
| `placement`         | `"balanced" \| "roundRobin" \| "horizontalOrder"` | `"balanced"`                 | `balanced` packs into the shortest fitting column group, `roundRobin` cycles start columns deterministically, and `horizontalOrder` preserves a stronger left-to-right scan when spans are involved. |
| `as`                | `React.ElementType`                               | `"div"`                      | Root HTML element or custom component.                                                                                                                                                               |
| `rootRef`           | `React.Ref<HTMLElement>`                          | `—`                          | Ref to the masonry root.                                                                                                                                                                             |
| `classNames.root`   | `string`                                          | `—`                          | Root class name.                                                                                                                                                                                     |
| `classNames.item`   | `string`                                          | `—`                          | Item class name.                                                                                                                                                                                     |
| `className`         | `string`                                          | `—`                          | Class name merged onto the masonry root.                                                                                                                                                             |
| `style`             | `React.CSSProperties`                             | `—`                          | Inline styles merged onto the masonry root.                                                                                                                                                          |
| `plugins`           | `MasonryPlugin[]`                                 | `[]`                         | Opt-in Masonry plugins for fullscreen, lazy-load, pagination, load-more, infinite scroll, and virtualization.                                                                                        |
| `loading`           | `MasonryLoadingOptions`                           | `—`                          | Core dimensioned Masonry skeleton/reveal lifecycle.                                                                                                                                                  |
| `reveal.staggerMs`  | `number`                                          | `160`                        | Reveal stagger for the fade-in.                                                                                                                                                                      |
| `reveal.durationMs` | `number`                                          | `600`                        | Reveal fade duration.                                                                                                                                                                                |
| `reveal.easing`     | `string`                                          | `"cubic-bezier(.2,.7,.2,1)"` | Reveal fade easing.                                                                                                                                                                                  |
| `reveal.staggerLimit` | `number`                                        | `—`                          | Optional cap on how many items stagger.                                                                                                                                                              |
| `reveal.disabled`   | `boolean`                                         | `false`                      | Disables the built-in reveal classes.                                                                                                                                                                |
| `revealReady`       | `boolean`                                         | `true`                       | Holds the reveal until external loading or viewport orchestration is ready.                                                                                                                          |

### Masonry plugins

Import Masonry plugins from their own subpaths and pass them to `plugins`.

```typescript
import { GalleryCore } from "react-motion-gallery/core";
import { Masonry } from "react-motion-gallery/masonry";
import { masonryFullscreen } from "react-motion-gallery/masonry/fullscreen";
import { useMasonryPagination } from "react-motion-gallery/masonry/pagination";
import { useMasonryLoadMore } from "react-motion-gallery/masonry/load-more";
import { useMasonryInfiniteScroll } from "react-motion-gallery/masonry/infinite-scroll";
import { masonryVirtualization } from "react-motion-gallery/masonry/virtualization";

function ProductMasonry({ children, items }) {
  const loadMore = useMasonryLoadMore({
    initialVisibleCount: 12,
    pageSize: 12,
    total: items.length,
  });

  return (
    <GalleryCore layout="masonry" fullscreenItems={items}>
      <Masonry plugins={[loadMore.plugin, masonryFullscreen()]}>{children}</Masonry>
    </GalleryCore>
  );
}
```

| Import                                         | Factory                          | Notes                                                                                                                                                                                        |
| ---------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-motion-gallery/masonry/fullscreen`      | `masonryFullscreen()`            | Opens `GalleryCore` fullscreen from light dimensioned Masonry items without adding fullscreen code to the default masonry import.                                                            |
| `react-motion-gallery/masonry/lazy-load`       | `masonryLazyLoad(options)`       | Uses the same image shell behavior as Slider: trackable image `src` values move into `data-rmg-lazy-src`, real images load on intersection, and items fade in after decode and spinner exit. |
| `react-motion-gallery/masonry/pagination`      | `masonryPagination(options)`     | Windows child items by `pageIndex` and `pageSize`; `useMasonryPagination()` also returns page state and `MasonryPaginationControls`.                                                         |
| `react-motion-gallery/masonry/load-more`       | `masonryLoadMore(options)`       | Windows child items by `visibleCount`; `useMasonryLoadMore()` owns and increments the visible count.                                                                                         |
| `react-motion-gallery/masonry/infinite-scroll` | `masonryInfiniteScroll(options)` | Renders a sentinel after the masonry root so it does not disturb absolute item positioning.                                                                                                  |
| `react-motion-gallery/masonry/virtualization`  | `masonryVirtualization(options)` | Runs after pagination/load-more and windows known dimensioned item positions.                                                                                                           |

`masonryLazyLoad()` enables lazy loading by default. Pass `{ enabled: false }` to make the plugin inert.

Masonry pagination, load-more, infinite-scroll, and virtualization APIs are documented in the shared data-plugin sections after Entries. Pagination and load-more apply before layout so hidden items do not reserve columns or masonry positions. In `"server"` mode the supplied children and `fullscreenItems` are treated as the current server window.

Wrap a card in `Masonry.Item` to provide its dimensions. Use `span`, `heightOffsetPx`, `className`, and `style` when it needs custom placement or wrapper styling:

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

Masonry no longer owns cache-backed loading UI. Use `useMasonryReady` and wrap Masonry with `MasonrySkeleton` when a separate full-layout skeleton wrapper should own loading layout.

The Masonry import is dimensioned and lightweight, with built-in reveal timing, `loading.skeleton` support, and opt-in fullscreen through `react-motion-gallery/masonry/fullscreen`.

Lightweight Masonry skeletons live in `react-motion-gallery/skeleton/masonry` and mirror dimensioned `Masonry.Item` data with `items`, `ratios`, or `heightsPx`.

For dimensioned cards with text that wraps at different viewport or container widths, import `useMasonryTextWrapLayout` and `createMasonryTextWrapSkeletonLayout` from `react-motion-gallery/masonry/text-wrap`. The hook returns a `rootRef` for Masonry plus `getItemGeometry()`, which computes the ratio dimensions and responsive `heightOffsetPx` rules from measured skeleton text metrics.

For text-heavy cards, `heightOffsetPx` lets the ratio-based media height and fixed or responsive card chrome participate in the same deterministic placement model.

Use `items` when one card needs a different placeholder height or span. For simpler shells, `ratios`, `heightsPx`, and `spans` can describe the same rhythm without a full item list.

```typescript
import { Masonry } from "react-motion-gallery/masonry";
import { useMasonryReady } from "react-motion-gallery/masonry/ready";
import {
  MasonrySkeleton,
  type MasonrySkeletonProps,
} from "react-motion-gallery/skeleton/masonry";

const masonrySkeleton: MasonrySkeletonProps = {
  ratios: [118, 126, 102, 146],
  spans: [undefined, { 0: 1, 1100: 2 }, undefined, undefined],
  columns: { 0: 1, 700: 2, 1100: 3 },
  gap: { 0: 12, 1100: 20 },
  placement: "balanced",
  radius: 18,
};

function MasonryWithSkeleton({ items }: { items: React.ReactNode[] }) {
  const { ref: masonryRef, ready: masonryReady } = useMasonryReady();

  return (
    <MasonrySkeleton
      {...masonrySkeleton}
      ready={masonryReady}
      timing={{ minVisibleMs: 220, exitMs: 600 }}
      count={items.length}
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

#### `MasonryLoadingOptions`

| Option                       | Type                                                                                   | Default | Notes                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `enabled`                    | `boolean`                                                                              | `true` when `loading` is provided | Disables the Masonry loading/reveal lifecycle when false.                       |
| `active`                     | `boolean`                                                                              | `false` | Holds the masonry busy, blocks reveal unless forced, and creates placeholder items when there are no children. |
| `count`                      | `number`                                                                               | `0`     | Placeholder count used with `active` and empty children.                                                 |
| `skeleton`                   | `MasonrySkeletonProps \| ((args: MasonryLoadingSkeletonArgs) => ReactNode)`            | `—`     | Standalone masonry skeleton props or custom per-item skeleton renderer.                                  |
| `force`                      | `boolean \| { enabled?: boolean; showContent?: boolean; skeletonOpacity?: number }`    | `false` | Keeps skeletons visible. `showContent: true` enables compare mode with mounted content under the skeleton. |
| `timing.enterMs`             | `number`                                                                               | `exitMs` | Skeleton opacity enter duration when forced loading returns.                                             |
| `timing.minVisibleMs`        | `number`                                                                               | `120`   | Minimum time an item skeleton remains visible before reveal can start.                                   |
| `timing.exitMs`              | `number`                                                                               | `220`   | Item skeleton opacity fade-out duration.                                                                 |
| `animate`                    | `boolean`                                                                              | `true`  | Set false to collapse enter/exit durations to zero. Reduced-motion preferences also disable these durations. |
| `waitForMedia`               | `boolean`                                                                              | `true`  | Waits for trackable descendant media to load/decode before reveal.                                       |
| `decodeTimeoutMs`            | `number`                                                                               | `8000`  | Media readiness timeout fallback.                                                                       |
| `rootMargin`                 | `string`                                                                               | `"0px"` | IntersectionObserver root margin for item reveal.                                                        |
| `threshold`                  | `number`                                                                               | `0.01`  | IntersectionObserver threshold for item reveal.                                                          |
| `keepSkeletonMounted`        | `boolean`                                                                              | `false` | Keeps settled skeleton layers mounted at opacity 0 for later loading transitions.                        |
| `rememberRevealed`           | `boolean`                                                                              | `true`  | Keeps known item identities revealed across data-window changes.                                         |

#### `MasonryLoadingSkeletonArgs`

| Field            | Type                     | Notes                                                             |
| ---------------- | ------------------------ | ----------------------------------------------------------------- |
| `index`          | `number`                 | Source item index.                                                 |
| `itemIndex`      | `number`                 | Original item index when a plugin window is active.                |
| `key`            | `React.Key`              | Masonry item key.                                                  |
| `revealKey`      | `React.Key`              | Stable reveal identity when provided.                              |
| `placeholder`    | `boolean`                | True for empty-masonry placeholder items created from loading count. |
| `ready`          | `boolean`                | Whether the item content is considered ready for the skeleton.     |
| `span`           | `ResponsiveMasonrySpan`  | Active item span metadata.                                         |
| `width`          | `number`                 | Intrinsic item width.                                              |
| `height`         | `number`                 | Intrinsic item height.                                             |
| `heightOffsetPx` | `MasonryHeightOffsetPx`  | Extra fixed or responsive item chrome height.                      |

### `MasonryHandle` methods

Forward a ref to `Masonry` when parent code needs readiness or DOM access.

| Method         | Signature                                                  | Notes                                         |
| -------------- | ---------------------------------------------------------- | --------------------------------------------- |
| `getRootNode`  | `() => HTMLElement \| null`                                | Returns the masonry root.                     |
| `getItemNodes` | `() => HTMLElement[]`                                      | Returns current rendered masonry item nodes.  |
| `isReady`      | `() => boolean`                                            | True when client, loading, and plugin gates are ready. |
| `onReady`      | `(callback: (nodes: HTMLElement[]) => void) => () => void` | Subscribes to the ready signal.               |

## Entries

`Entries` is the structured-data surface. You pass entry objects, choose whether the entry rows themselves render as a vertical list or a card grid, render each media item however you want, and provide a `renderMediaContainer` function that decides whether an entry's media should be laid out as a slider, grid, or masonry block.

### Entries layout

`entries.layout` controls the outer list of entries. The default is `"list"`, which stacks full-width rows with a vertical gap. Use `"grid"` when each entry should behave like a card in a responsive grid. This is separate from `entries.mediaLayout`: `layout` controls entry rows, while `mediaLayout` describes the media block inside each entry.

```tsx
<Entries
  entries={{
    items,
    layout: "list",
    mediaLayout: "slider",
  }}
  renderMediaContainer={renderEntryMedia}
/>
```

```tsx
<Entries
  entries={{
    items,
    layout: "grid",
    mediaLayout: "slider",
    entryList: {
      style: {
        gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
        gap: 16,
      },
    },
  }}
  renderMediaContainer={renderEntryMedia}
/>
```

When `layout: "grid"` is set, `Entries` uses a responsive CSS grid by default and makes infinite-scroll sentinels and virtualization spacers span every column. Use `entryList` and `entryRow` for class names or inline styles when a product grid needs exact tracks, gaps, or row styling.

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

For common entry media layouts, the exported helper factories can own `renderMediaContainer` for you. Use the slider, grid, or masonry helper that matches `entries.mediaLayout`, then keep custom card and media rendering focused on your data shape.

```typescript
import {
  Entries,
  type EntriesOptions,
} from "react-motion-gallery/entries";
import { createEntriesGridMedia } from "react-motion-gallery/entries/media/grid";

const renderEntryGridMedia = createEntriesGridMedia({
  gridObject: {
    columns: { 0: 1, 760: 2 },
    gap: { 0: 10, 760: 14 },
  },
});

export function EntryGrid({ entries }: { entries: EntriesOptions["items"] }) {
  return (
    <Entries
      entries={{
        items: entries,
        mediaLayout: "grid",
      }}
      renderMediaContainer={renderEntryGridMedia}
    />
  );
}
```

The same pattern works with `createEntriesSliderMedia()` from `react-motion-gallery/entries/media/slider` and `createEntriesMasonryMedia()` from `react-motion-gallery/entries/media/masonry`.

### Entry loading, decode, and reveal flow

When `loading.enabled` is true, entries use two viewport gates instead of one generic fade-in. `loading.nearMargin` marks a row as near the viewport, mounts the real entry content, and starts the entry media work early. `loading.viewMargin` and `loading.threshold` record when the row has actually entered view.

With `loading.waitForDecode` enabled, an entry does not reveal as soon as it intersects. The built-in gate waits for every trackable media URL in that entry to load and decode; in the current entry-level gate, that means image media in the entry’s `media` array. It falls back after `loading.decodeTimeoutMs`, and entries without image media are decode-ready immediately. The row fades from skeleton to content only after both conditions are true: the row has entered view and the entry media decode gate is ready.

Reveal timing is assigned when each entry becomes ready, so entries fade in by actual load/decode completion order as well as viewport intersection. A later row that loads quickly can take the next reveal slot while a slower row keeps its skeleton visible until its media is ready.

Entry reveal state is remembered by default. Set `loading.rememberRevealed: false` when rows that leave the rendered window should fade in again if they return, such as client-paginated entries revisiting an earlier page.

Fullscreen close has a matching entry-aware path. If the user closes fullscreen from a slide whose owning entry has not been viewed yet, the runtime resolves the flattened fullscreen index back to the owner entry, shows a temporary loading spinner while that row mounts and decodes, scrolls the owner entry into view, forces the skeleton/content layers to their final revealed state, and then runs the close animation back to the now-visible entry media. This keeps the close animation from landing on an unrevealed skeleton or an offscreen row.

### `Entries` component props

| Option                 | Type                                                         | Default                       | Notes                                                                  |
| ---------------------- | ------------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------------------- |
| `enabled`              | `boolean`                                                    | `true`                        | Master switch for rendering entry content and transitions.             |
| `entries`              | `EntriesOptions`                                             | `—`                           | Structured entry configuration.                                        |
| `fullscreen.enabled`   | `boolean`                                                    | `true`                        | Enables fullscreen opening for entry media.                            |
| `fullscreen.items`     | `MediaItem[] \| string[]`                                    | flattened entry media         | Optional fullscreen media override.                                    |
| `renderMediaContainer` | `({ entryIndex, mediaNodes, entrySliderRefs }) => ReactNode` | `—`                           | Chooses how each entry’s media nodes are laid out.                     |
| `nodeFromMedia`        | `(media: MediaItem) => ReactNode`                            | built-in image/video renderer | Fallback renderer when `entries.render.media` is omitted.              |
| `entryFlatIndexRef`    | `React.RefObject<number[][] \| null>`                        | internal ref                  | Receives per-entry local-to-global media index maps.                   |
| `entryMapRef`          | `React.RefObject<MediaEntryLink[] \| null>`                  | internal ref                  | Receives the flattened media-to-entry map.                             |
| `fsOwnersRef`          | `React.RefObject<SlideOwner[]>`                              | internal ref                  | Receives the fullscreen slide owner list.                              |
| `entrySliderRefs`      | `React.RefObject<(SliderHandle \| null)[]>`                  | internal ref                  | Lets `renderMediaContainer` wire fullscreen back to per-entry sliders. |

### `EntriesOptions`

| Option                               | Type                                                                                                     | Default                      | Notes                                                                                                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`                              | `EntryItem[]`                                                                                            | `—`                          | Entry records. Each item can hold arbitrary fields plus `media`.                                                                                                                   |
| `layout`                             | `"list" \| "grid"`                                                                                       | `"list"`                     | Controls the outer entry row layout. `list` stacks rows; `grid` arranges entries as responsive cards.                                                                              |
| `mediaLayout`                        | `"slider" \| "grid" \| "masonry"`                                                                        | `"slider"`                   | Declares the intended media layout.                                                                                                                                                |
| `plugins`                            | `EntriesPlugin[]`                                                                                        | `[]`                         | Optional data plugins for pagination, load-more, infinite scroll, and virtualization.                                                                                              |
| `render.card`                        | `({ entry, entryIndex, media }) => ReactNode`                                                            | `—`                          | Wraps the media container in custom card UI.                                                                                                                                       |
| `render.media`                       | `({ entry, entryIndex, media, mediaIndex }) => ReactNode`                                                | `—`                          | Custom media renderer per media item.                                                                                                                                              |
| `render.overlay`                     | `({ entry, entryIndex, media, mediaIndex, link, opacity, fsIndex, style, containerProps }) => ReactNode` | `—`                          | Renders fullscreen overlay content for the active entry slide.                                                                                                                     |
| `render.skeleton`                    | `({ entry, entryIndex }) => ReactNode`                                                                   | `—`                          | Declared in the type, but the current runtime uses `loading.skeleton` instead.                                                                                                     |
| `overlay`                            | `ElementStyle`                                                                                           | `—`                          | Styles the fullscreen overlay container that wraps `render.overlay`.                                                                                                               |
| `overlay.overlayCrossfadeTarget`     | `"content" \| "overlay"`                                                                                 | `"overlay"`                  | Selects whether fullscreen entry changes fade only the rendered overlay content or the whole overlay layer.                                                                        |
| `overlay.overlayCrossfadeDurationMs` | `number`                                                                                                 | `300`                        | Duration for fullscreen entry overlay crossfades.                                                                                                                                  |
| `overlay.overlayCrossfadeEasing`     | `string`                                                                                                 | `"cubic-bezier(.4,0,.22,1)"` | Easing for fullscreen entry overlay crossfades.                                                                                                                                    |
| `loading.enabled`                    | `boolean`                                                                                                | `—`                          | Enables entry loading and decode gating.                                                                                                                                           |
| `loading.force`                      | `boolean \| { enabled?: boolean; showContent?: boolean; skeletonOpacity?: number }`                      | `—`                          | Forces entry skeletons to remain visible. Set `showContent: true` to preview mounted, ready entry content under the skeleton, and tune the loading overlay with `skeletonOpacity`. |
| `loading.skeleton`                   | `EntrySkeletonSpec \| ((args) => EntrySkeletonSpec \| null \| undefined)`                                | `—`                          | Built-in skeleton spec or resolver.                                                                                                                                                |
| `loading.minHeight`                  | `number \| string`                                                                                       | `"260px"`                    | Minimum reserved height while loading.                                                                                                                                             |
| `loading.exitMs`                     | `number`                                                                                                 | `220`                        | Entry skeleton opacity fade-out duration.                                                                                                                                          |
| `loading.nearMargin`                 | `string`                                                                                                 | `"700px 0px"`                | Preload margin used before entries enter view.                                                                                                                                     |
| `loading.viewMargin`                 | `string`                                                                                                 | `"0px 0px"`                  | Margin used for the actual in-view gate.                                                                                                                                           |
| `loading.threshold`                  | `number`                                                                                                 | `0.01`                       | Intersection threshold for view detection.                                                                                                                                         |
| `loading.waitForDecode`              | `boolean`                                                                                                | `true`                       | Waits for image decode before revealing an entry.                                                                                                                                  |
| `loading.decodeTimeoutMs`            | `number`                                                                                                 | `8000`                       | Decode timeout fallback.                                                                                                                                                           |
| `loading.skeletonWrap`               | `ElementStyle`                                                                                           | `—`                          | Styles the skeleton wrapper.                                                                                                                                                       |
| `loading.rememberRevealed`           | `boolean`                                                                                                | `true`                       | Keeps revealed entry rows revealed while they remain known. Set false to reveal rows again after they leave and later re-enter the rendered window.                                |
| `reveal.renderReveal`                | `({ active, containerProps }, content) => ReactNode`                                                     | `—`                          | Custom reveal wrapper.                                                                                                                                                             |
| `reveal.staggerMs`                   | `number`                                                                                                 | `200`                        | Delay between entry reveal fades.                                                                                                                                                  |
| `reveal.durationMs`                  | `number`                                                                                                 | `700`                        | Entry reveal fade duration.                                                                                                                                                        |
| `reveal.easing`                      | `string`                                                                                                 | `"cubic-bezier(.2,.7,.2,1)"` | Entry reveal fade easing.                                                                                                                                                          |
| `reveal.staggerLimit`                | `number`                                                                                                 | `6`                          | Maximum number of entries that receive staggered delays.                                                                                                                           |
| `entryList`                          | `ElementStyle`                                                                                           | `—`                          | Styles the entry list container.                                                                                                                                                   |
| `entryRow`                           | `ElementStyle`                                                                                           | `—`                          | Styles each entry row container.                                                                                                                                                   |

### `EntriesHandle` methods

| Method          | Type                                                    | Notes                                      |
| --------------- | ------------------------------------------------------- | ------------------------------------------ |
| `getRootNode`   | `() => HTMLDivElement \| null`                          | Returns the live entries root.             |
| `getEntryNodes` | `() => HTMLElement[]`                                   | Returns the rendered entry row elements.   |
| `isReady`       | `() => boolean`                                         | True when loading and plugin gates are ready. |
| `onReady`       | `(callback: (nodes: HTMLElement[]) => void) => () => void` | Subscribes to the ready signal.         |

Entry skeleton `text` nodes also render wrapped line bars via `lines`, matching the slider and grid skeleton behavior, including responsive `barHeight` and line counts plus configurable trailing `lastBarWidth`.

### Entries data plugins

Entries data plugins are passed through `entries.plugins`. They do not fetch data for you; they describe how the current `entries.items` array should be windowed, observed, or virtualized while your app owns network requests and state.

Prefer the granular subpaths when a route only needs one plugin. The `react-motion-gallery/entries` subpath also re-exports these helpers for modules that already import the full Entries surface. Full pagination, load-more, infinite-scroll, and virtualization APIs for Entries, Grid, and Masonry are documented in the shared data-plugin sections after `flattenEntries`.

### Entry-related callback and helper types

#### `EntryItem`

| Field           | Type                       | Notes                                       |
| --------------- | -------------------------- | ------------------------------------------- |
| `media`         | `MediaItem[] \| undefined` | Optional list of media items for the entry. |
| `[key: string]` | `any`                      | Additional entry fields are allowed.        |

#### `EntryMediaRenderArgs`

| Field        | Type        | Notes                         |
| ------------ | ----------- | ----------------------------- |
| `entry`      | `EntryItem` | Current entry object.         |
| `entryIndex` | `number`    | Entry index.                  |
| `media`      | `MediaItem` | Current media item.           |
| `mediaIndex` | `number`    | Media index within the entry. |

#### `EntryCardRenderArgs`

| Field        | Type        | Notes                                                            |
| ------------ | ----------- | ---------------------------------------------------------------- |
| `entry`      | `EntryItem` | Current entry object.                                            |
| `entryIndex` | `number`    | Entry index.                                                     |
| `media`      | `ReactNode` | The rendered media container returned by `renderMediaContainer`. |

#### `EntryOverlayRenderArgs`

| Field            | Type                                   | Notes                                                       |
| ---------------- | -------------------------------------- | ----------------------------------------------------------- |
| `entry`          | `EntryItem`                            | Entry owning the active fullscreen slide.                   |
| `entryIndex`     | `number`                               | Entry index.                                                |
| `media`          | `MediaItem \| null`                    | Media item for the active fullscreen slide, when available. |
| `mediaIndex`     | `number \| null`                       | Media index inside the entry when available.                |
| `link`           | `MediaEntryLink \| null`               | Flattened link back to the entry/media pair.                |
| `opacity`        | `number`                               | Overlay opacity supplied by the runtime.                    |
| `fsIndex`        | `number`                               | Current fullscreen slide index.                             |
| `style`          | `React.CSSProperties`                  | Overlay positioning and animation style.                    |
| `containerProps` | `React.HTMLAttributes<HTMLDivElement>` | Props to spread onto the overlay root.                      |

#### `EntrySkeletonRenderArgs`

| Field        | Type        | Notes                 |
| ------------ | ----------- | --------------------- |
| `entry`      | `EntryItem` | Current entry object. |
| `entryIndex` | `number`    | Entry index.          |

#### `MediaEntryLink`

| Field        | Type     | Notes                         |
| ------------ | -------- | ----------------------------- |
| `entryIndex` | `number` | Entry index.                  |
| `mediaIndex` | `number` | Media index inside the entry. |

#### `SlideOwner`

| Field        | Type     | Notes                               |
| ------------ | -------- | ----------------------------------- |
| `entryIndex` | `number` | Entry that owns a fullscreen slide. |

### `flattenEntries`

| Field            | Type                 | Notes                                                          |
| ---------------- | -------------------- | -------------------------------------------------------------- |
| `flattenedMedia` | `MediaItem[]`        | One flat media array, in fullscreen order.                     |
| `flattenedMap`   | `MediaEntryLink[]`   | Global slide index back to `entryIndex` and `mediaIndex`.      |
| `entryFlatIndex` | `number[][] \| null` | Per-entry lookup from local media index to global slide index. |
| `owners`         | `SlideOwner[]`       | Owner metadata for each flattened slide.                       |

## Pagination

Pagination, load-more, infinite-scroll, and virtualization are data plugins for Grid, Masonry, and Entries. Your app still owns fetching, caching, URL state, and append behavior; the plugins describe how the current child or entry list should be windowed, observed, or virtualized.

Pagination creates fixed page windows. In `"client"` mode it slices Grid children, Masonry children, or `entries.items` before rendering. In `"server"` mode it leaves the supplied records untouched so your API response can already represent the current page. Grid and Masonry also treat `fullscreenItems` as the current server window in server mode.

| Surface | Entry point                                   | Factory                        | Hook                            | Controls and helpers                                                                    | Common exported types                                                                                                       |
| ------- | --------------------------------------------- | ------------------------------ | ------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Grid    | `react-motion-gallery/grid/pagination`        | `gridPagination(options)`      | `useGridPagination(options)`    | `GridPaginationControls`, `getGridPageRange()`, `getGridPageItems()`                    | `GridPaginationOptions`, `UseGridPaginationOptions`, `GridPaginationControlsProps`, `GridItemsPerPageOption`                |
| Masonry | `react-motion-gallery/masonry/pagination`     | `masonryPagination(options)`   | `useMasonryPagination(options)` | `MasonryPaginationControls`, `getMasonryPageRange()`, `getMasonryPageItems()`           | `MasonryPaginationOptions`, `UseMasonryPaginationOptions`, `MasonryPaginationControlsProps`, `MasonryItemsPerPageOption`    |
| Entries | `react-motion-gallery/entries/pagination`     | `entriesPagination(options)`   | `useEntriesPagination(options)` | `EntriesPaginationControls`, `getEntriesPageRange()`, `getEntriesPageItems()`           | `EntriesPaginationOptions`, `UseEntriesPaginationOptions`, `EntriesPaginationControlsProps`, `EntriesItemsPerPageOption`    |

Pagination subpaths also export surface-prefixed page item/range types, URL sync types, session storage types, and ripple types: for example `GridPageControlItem`, `MasonryPaginationUrlSyncOptions`, and `EntriesPaginationRippleOptions`. Entries also exports `EntriesPaginationController`.

### Pagination plugin options

These options apply to `gridPagination()`, `masonryPagination()`, and `entriesPagination()`.

| Option      | Type                   | Default    | Notes                                                                                 |
| ----------- | ---------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `enabled`   | `boolean`              | `true`     | Disables the plugin when false.                                                       |
| `mode`      | `"client" \| "server"` | `"client"` | Client mode slices records by page. Server mode leaves supplied records unchanged.    |
| `pageIndex` | `number`               | required   | Zero-based current page. Values below zero clamp to zero.                             |
| `pageSize`  | `number`               | required   | Items per page. Values below one clamp to one.                                        |
| `total`     | `number`               | `—`        | Total record count for controls and loading state.                                    |
| `loading`   | `boolean`              | `—`        | Marks the surface busy. Entries pagination also keeps current rows under the skeleton overlay during page transitions. |

### Pagination hook options

These options apply to `useGridPagination()`, `useMasonryPagination()`, and `useEntriesPagination()`.

| Option             | Type                                                                                          | Default           | Notes                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `pageSize`         | `number`                                                                                      | `initialPageSize` | Controlled items per page.                                                                     |
| `initialPageSize`  | `number`                                                                                      | `1`               | Uncontrolled initial items per page when `pageSize` is omitted.                                |
| `onPageSizeChange` | `(pageSize: number) => void`                                                                  | `—`               | Called from `setPageSize`, including when stored page size is restored into a controlled hook. |
| `total`            | `number`                                                                                      | `0`               | Used to derive `pageCount`.                                                                    |
| `initialPageIndex` | `number`                                                                                      | `0`               | Initial zero-based page when URL sync or session storage does not provide one.                 |
| `mode`             | `"client" \| "server"`                                                                        | `"client"`        | Passed through to the plugin.                                                                  |
| `loading`          | `boolean`                                                                                     | `—`               | Passed through to the plugin.                                                                  |
| `enabled`          | `boolean`                                                                                     | `true`            | Passed through to the plugin.                                                                  |
| `urlSync`          | `boolean \| { enabled?, param?, history?, omitFirstPage?, basePath?, preserveSearch? }`        | `false`           | Reads and writes a one-based page query param.                                                 |
| `sessionStorage`   | `boolean \| { enabled?: boolean; key?: string }`                                              | `false`           | Restores and writes `pageIndex` and `pageSize` in `window.sessionStorage`.                     |

The pagination controller returns `pageIndex`, `pageSize`, `pageCount`, `offset`, `canPrevPage`, `canNextPage`, `setPageIndex`, `setPageSize`, `nextPage`, `prevPage`, `plugin`, and optional `getPageHref`. Calling `setPageSize` resets the current page to zero.

`urlSync: true` uses `?page=2`, pushes history entries, omits the first page from the URL, and preserves the current search string. Pass `{ param, history, omitFirstPage, basePath, preserveSearch }` to customize those defaults. `basePath` lets server-rendered controls build stable hrefs before `window.location` is available.

`sessionStorage: true` uses a default key based on the current path and page query param; pass `{ key: "products-pagination" }` when a page has multiple paginated surfaces. If URL sync is also enabled, the URL page wins and storage fills in when the query param is absent. Session storage is client-only persistence for pagination state; it does not fetch or cache records.

### Pagination controls props

`GridPaginationControls`, `MasonryPaginationControls`, and `EntriesPaginationControls` share the same prop surface. They render buttons by default. When `getPageHref` returns a URL, page controls render anchors, preserve normal modified-click browser behavior, and intercept plain clicks to call `onPageChange`.

| Prop                     | Type                                                               | Default      | Notes                                                                                                  |
| ------------------------ | ------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------ |
| `pageIndex`              | `number`                                                           | required     | Zero-based selected page.                                                                              |
| `pageCount`              | `number`                                                           | required     | Total number of pages.                                                                                 |
| `pageRangeDisplayed`     | `number`                                                           | `5`          | Number of center pages to show around the selected page.                                               |
| `marginPagesDisplayed`   | `number`                                                           | `1`          | Number of edge pages to keep visible on each side.                                                     |
| `disabled`               | `boolean`                                                          | `false`      | Disables previous, next, and page controls.                                                            |
| `previousLabel`          | `React.ReactNode`                                                  | `"Previous"` | Previous-control content.                                                                              |
| `nextLabel`              | `React.ReactNode`                                                  | `"Next"`     | Next-control content.                                                                                  |
| `breakLabel`             | `React.ReactNode`                                                  | `"..."`      | Content for compact pagination breaks.                                                                |
| `getPageLabel`           | `(pageIndex: number) => React.ReactNode`                           | page number  | Returns content for page buttons or anchors.                                                           |
| `onPageChange`           | `(pageIndex: number) => void`                                      | required     | Called when a page, previous, or next control is activated.                                            |
| `getPageHref`            | `(pageIndex, item) => string \| undefined`                         | `—`          | Returns anchor URLs for page controls. The hook controller's `getPageHref` can be passed directly.     |
| `renderItem`             | `(item, defaultNode) => React.ReactNode`                           | `—`          | Customizes each computed page, previous, next, or break item.                                          |
| `disableSelected`        | `boolean`                                                          | `false`      | Disables the selected page control.                                                                    |
| `ariaLabel`              | `string`                                                           | `"Pagination"` | Label for the wrapping `nav`.                                                                        |
| `ripple`                 | `boolean \| { enabled?, color?, duration?, easing?, opacity?, className? }` | enabled      | Click-position ripple for page, previous, and next controls. Pass `false` to disable.                 |
| `pageSize`               | `number`                                                           | `—`          | Current items per page. Required with `itemsPerPageOptions` and `onItemsPerPageChange` to show the selector. |
| `itemsPerPageOptions`    | `readonly (number \| { value: number; label: React.ReactNode })[]` | `[]`         | Listbox choices. Number options use the number as their label; duplicate normalized values are removed. |
| `itemsPerPageLabel`      | `React.ReactNode`                                                  | `"Items per page"` | Visible label rendered before the selector trigger.                                              |
| `itemsPerPageSelectLabel` | `string`                                                          | `"Items per page"` | Accessible label for the selector trigger and listbox.                                           |
| `onItemsPerPageChange`   | `(pageSize: number) => void`                                       | `—`          | Called when a different page size is selected. Pair with `pagination.setPageSize`.                    |
| `className`              | `string`                                                           | `—`          | Class applied to the wrapping `nav`.                                                                  |
| `pageItemsClassName`     | `string`                                                           | `—`          | Class applied to the page-control group with `data-rmg-page-items`.                                  |
| `itemClassName`          | `string`                                                           | `—`          | Base class for every page, previous, next, or break item.                                             |
| `pageClassName`          | `string`                                                           | `—`          | Class applied to numbered page items.                                                                 |
| `controlClassName`       | `string`                                                           | `—`          | Class applied to previous and next items.                                                             |
| `breakClassName`         | `string`                                                           | `—`          | Class applied to break items.                                                                         |
| `selectedClassName`      | `string`                                                           | `—`          | Class applied to the selected page item.                                                              |
| `itemsPerPageClassName`  | `string`                                                           | `—`          | Class applied to the selector wrapper with `data-rmg-items-per-page`.                                |
| `itemsPerPageLabelClassName` | `string`                                                       | `—`          | Class applied to the visible selector label.                                                          |
| `itemsPerPageSelectClassName` | `string`                                                      | `—`          | Class applied to the selector trigger button.                                                         |

The items-per-page selector renders as a separate group before page controls. It is shown only when `pageSize`, `itemsPerPageOptions`, and `onItemsPerPageChange` are all provided. If the current `pageSize` is not present in `itemsPerPageOptions`, the controls add it as the selected option.

### Pagination helper APIs

| Surface | Page range helper    | Page items helper    | Controls component           |
| ------- | -------------------- | -------------------- | ---------------------------- |
| Grid    | `getGridPageRange()` | `getGridPageItems()` | `GridPaginationControls`     |
| Masonry | `getMasonryPageRange()` | `getMasonryPageItems()` | `MasonryPaginationControls` |
| Entries | `getEntriesPageRange()` | `getEntriesPageItems()` | `EntriesPaginationControls` |

`get*PageRange({ pageIndex, pageCount, pageRangeDisplayed, marginPagesDisplayed })` returns page and break items for compact pagination. `get*PageItems(options)` adds previous/next controls, disabled state, and labels around that page range.

## Load More

Load-more plugins reveal or append a growing record window. In `"client"` mode they render the first `visibleCount` records. In `"server"` mode they leave supplied records unchanged, which is useful when your app appends API results to the current list.

| Surface | Entry point                                  | Factory                       | Hook                           | Common exported types                                                        |
| ------- | -------------------------------------------- | ----------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| Grid    | `react-motion-gallery/grid/load-more`        | `gridLoadMore(options)`       | `useGridLoadMore(options)`     | `GridLoadMoreOptions`, `UseGridLoadMoreOptions`                              |
| Masonry | `react-motion-gallery/masonry/load-more`     | `masonryLoadMore(options)`    | `useMasonryLoadMore(options)`  | `MasonryLoadMoreOptions`, `UseMasonryLoadMoreOptions`, `MasonryLoadMorePlugin` |
| Entries | `react-motion-gallery/entries/load-more`     | `entriesLoadMore(options)`    | `useEntriesLoadMore(options)`  | `EntriesLoadMoreOptions`, `UseEntriesLoadMoreOptions`, `EntriesLoadMoreController` |

### Load-more plugin options

These options apply to `gridLoadMore()`, `masonryLoadMore()`, and `entriesLoadMore()`.

| Option         | Type                   | Default  | Notes                                                                                            |
| -------------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `enabled`      | `boolean`              | `true`   | Disables the plugin when false.                                                                  |
| `mode`         | `"client" \| "server"` | `"client"` | Client mode renders the first `visibleCount` records. Server mode leaves supplied records unchanged. |
| `visibleCount` | `number`               | required | Number of currently visible records. Values below zero clamp to zero.                            |
| `total`        | `number`               | `—`      | Total record count for controls and loading state.                                               |
| `loading`      | `boolean`              | `—`      | Marks the surface busy.                                                                          |

### Load-more hook options

These options apply to `useGridLoadMore()`, `useMasonryLoadMore()`, and `useEntriesLoadMore()`.

| Option                | Type                   | Default               | Notes                                                           |
| --------------------- | ---------------------- | --------------------- | --------------------------------------------------------------- |
| `initialVisibleCount` | `number`               | `pageSize`            | Uncontrolled initial visible count. Values below zero clamp to zero. |
| `pageSize`            | `number`               | required              | Number of records added by each `loadMore()` call. Values below one clamp to one. |
| `total`               | `number`               | `initialVisibleCount` | Used to compute `canLoadMore` and clamp increments.             |
| `mode`                | `"client" \| "server"` | `"client"`            | Passed through to the plugin.                                   |
| `loading`             | `boolean`              | `—`                   | Passed through to the plugin.                                   |
| `enabled`             | `boolean`              | `true`                | Passed through to the plugin.                                   |

The load-more controller returns `visibleCount`, `pageSize`, `canLoadMore`, `setVisibleCount`, `loadMore`, `reset`, and `plugin`.

Pagination and load-more are both data-window plugins. When both are enabled on the same surface, the first one in the plugin list supplies the rendered data window.

## Infinite Scroll

Infinite scroll renders a sentinel and calls your append function when that sentinel intersects. It does not fetch or append records itself, so it is commonly paired with server-mode load-more or your own list state.

| Surface | Entry point                                       | Factory                            | Hook                                | Common exported types                                                                    |
| ------- | ------------------------------------------------- | ---------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| Grid    | `react-motion-gallery/grid/infinite-scroll`       | `gridInfiniteScroll(options)`      | `useGridInfiniteScroll(options)`    | `GridInfiniteScrollOptions`, `UseGridInfiniteScrollOptions`                              |
| Masonry | `react-motion-gallery/masonry/infinite-scroll`    | `masonryInfiniteScroll(options)`   | `useMasonryInfiniteScroll(options)` | `MasonryInfiniteScrollOptions`, `UseMasonryInfiniteScrollOptions`, `MasonryInfiniteScrollPlugin` |
| Entries | `react-motion-gallery/entries/infinite-scroll`    | `entriesInfiniteScroll(options)`   | `useEntriesInfiniteScroll(options)` | `EntriesInfiniteScrollOptions`, `UseEntriesInfiniteScrollOptions`                        |

### Infinite-scroll options

These options apply to `gridInfiniteScroll()`, `masonryInfiniteScroll()`, `entriesInfiniteScroll()`, and their hooks.

| Option       | Type              | Default       | Notes                                                                        |
| ------------ | ----------------- | ------------- | ---------------------------------------------------------------------------- |
| `enabled`    | `boolean`         | `true`        | Disables sentinel rendering when false.                                      |
| `hasMore`    | `boolean`         | `true`        | Removes the sentinel when false.                                             |
| `loading`    | `boolean`         | `—`           | Prevents repeated `onLoadMore` calls while a request is active.              |
| `rootMargin` | `string`          | `"600px 0px"` | IntersectionObserver preload margin.                                         |
| `threshold`  | `number`          | `0`           | IntersectionObserver threshold.                                              |
| `onLoadMore` | `() => void`      | `—`           | Called when the sentinel intersects and loading gates allow another request. |
| `sentinel`   | `React.ReactNode` | `—`           | Optional visual content inside the sentinel element.                         |

The hook form memoizes the factory call and returns the plugin. Grid and Masonry sentinels render after the layout root so they do not disturb CSS grid tracks or masonry positioning. Entries sentinels render after the entry rows and span every column when `entries.layout` is `"grid"`.

## Virtualization

Virtualization mounts only the records near the viewport. It runs after pagination or load-more windowing, so the virtualized set is the current page or visible window.

| Surface | Entry point                                      | Factory                           | Hook                              | Common exported types                                                                    |
| ------- | ------------------------------------------------ | --------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- |
| Grid    | `react-motion-gallery/grid/virtualization`       | `gridVirtualization(options)`     | `useGridVirtualizer(options)`     | `GridVirtualizationOptions`, `UseGridVirtualizerOptions`                                 |
| Masonry | `react-motion-gallery/masonry/virtualization`    | `masonryVirtualization(options)`  | `useMasonryVirtualizer(options)`  | `MasonryVirtualizationOptions`, `UseMasonryVirtualizerOptions`, `MasonryVirtualizationPlugin` |
| Entries | `react-motion-gallery/entries/virtualization`    | `entriesVirtualization(options)`  | `useEntriesVirtualizer(options)`  | `EntriesVirtualizationOptions`, `UseEntriesVirtualizerOptions`                           |

### Virtualization options

| Option         | Surfaces | Type               | Default          | Notes                                                                                            |
| -------------- | -------- | ------------------ | ---------------- | ------------------------------------------------------------------------------------------------ |
| `enabled`      | all      | `boolean`          | `true`           | Disables virtualization when false.                                                              |
| `layout`       | Entries  | `"list" \| "grid"` | `entries.layout` | Tells Entries whether to virtualize one entry per row or grid rows with multiple entries.        |
| `estimateSize` | all      | `number`           | `420`            | Initial row or item height estimate in pixels. Values below one clamp to one.                    |
| `gap`          | all      | `number`           | `24`             | Vertical gap included in virtual range and spacer calculations. Values below zero clamp to zero. |
| `overscan`     | all      | `number`           | `3`              | Extra rows or items to mount before and after the visible range. Values below zero clamp to zero. |

The hook form memoizes the factory call and returns the plugin. Grid virtualizes by rows and inserts top and bottom spacers that span every grid column. Entries virtualizes list rows by default and grid rows when `entries.layout: "grid"` or `entriesVirtualization({ layout: "grid" })` is used. Masonry virtualizes known dimensioned item positions from `Masonry.Item` geometry, including spans and `heightOffsetPx`.

## RatingStars

`RatingStars` renders accessible star ratings with optional value and review-count labels. It is useful inside entry card renderers for product, review, or catalog metadata. Fractional ratings are shown by default with `fillMode="partial"`; the component maps fractional fill through the star shape so a `4.5` rating fills half the visual star area instead of clipping a naive rectangle. Use `fillMode="floor"`, `"round"`, or `"ceil"` when the visual stars should snap to whole stars.

```tsx
import { RatingStars } from "react-motion-gallery/rating-stars";

export function ProductRating() {
  return (
    <RatingStars
      value={4.35}
      precision={1}
      reviewCount={128}
      activeColor="#f5a524"
    />
  );
}
```

`value` is clamped between `0` and `max`, `precision` formats the numeric label, and `reviewCount` automatically enables the review label unless `showReviewCount={false}` is passed. Keep `fillMode="partial"` for fractional source data, and choose a whole-star mode only when your product UI intentionally rounds ratings.

### `RatingStars` props

| Option              | Type                                        | Default               | Notes                                                                                               |
| ------------------- | ------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------- |
| `value`             | `number`                                    | `—`                   | Rating value. Non-finite values render as `0`, and finite values are clamped between `0` and `max`. |
| `max`               | `number`                                    | `5`                   | Number of stars to render. Values are coerced to an integer of at least `1`.                        |
| `precision`         | `number`                                    | `1`                   | Decimal places used by the default numeric value label.                                             |
| `fillMode`          | `"partial" \| "floor" \| "round" \| "ceil"` | `"partial"`           | Controls whether fractional ratings fill the star shape or snap to whole stars.                     |
| `reviewCount`       | `number`                                    | `—`                   | Review total used by the default review-count label.                                                |
| `showValue`         | `boolean`                                   | `true`                | Shows the formatted rating value beside the stars.                                                  |
| `showReviewCount`   | `boolean`                                   | `reviewCount != null` | Shows the review-count label when `reviewCount` is provided.                                        |
| `formatValue`       | `(value: number) => ReactNode`              | `—`                   | Custom formatter for the clamped rating value.                                                      |
| `formatReviewCount` | `(count: number) => ReactNode`              | `—`                   | Custom formatter for the review count.                                                              |
| `className`         | `string`                                    | `—`                   | Class name for the root inline-flex element.                                                        |
| `starsClassName`    | `string`                                    | `—`                   | Class name for the star row.                                                                        |
| `starClassName`     | `string`                                    | `—`                   | Class name for each star wrapper.                                                                   |
| `labelClassName`    | `string`                                    | `—`                   | Class name for the value and review-count label.                                                    |
| `style`             | `React.CSSProperties`                       | `—`                   | Inline styles for the root element.                                                                 |
| `activeColor`       | `string`                                    | `"#f5a524"`           | Fill color for active stars.                                                                        |
| `emptyColor`        | `string`                                    | `"#d6dee4"`           | Fill color for empty stars.                                                                         |
| `gap`               | `number \| string`                          | `"0.08em"`            | Gap between individual stars.                                                                       |
| `ariaLabel`         | `string`                                    | computed label        | Accessible label override for the root `role="img"` element.                                        |

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
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";

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
      <Slider plugins={[sliderFullscreen()]}>
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

| Option       | Type                 | Default | Notes                                                                                                              |
| ------------ | -------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `plugins`    | `FullscreenPlugin[]` | `[]`    | Explicit first-party fullscreen features. At minimum, import `fullscreenSlider()` to mount the fullscreen runtime. |
| `fullscreen` | `FullscreenOptions`  | `—`     | Fullscreen behavior and rendering options.                                                                         |

| Import                                       | Factory                        | Notes                                                                                                     |
| -------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `react-motion-gallery/fullscreen/slider`     | `fullscreenSlider(options)`    | Mounts the fullscreen slider runtime and accepts `fullscreen.slider` options.                             |
| `react-motion-gallery/fullscreen/controls`   | `fullscreenControls(options)`  | Option plugin for close, arrows, and counter options. Use with `fullscreenSlider()`.                      |
| `react-motion-gallery/fullscreen/captions`   | `fullscreenCaptions(options)`  | Adds caption rendering, placement, and caption motion runtime. Use with `fullscreenSlider()`.             |
| `react-motion-gallery/fullscreen/zoom-pan`   | `fullscreenZoomPan(options)`   | Adds fullscreen click zoom, pan, and pinch runtime. Use with `fullscreenSlider()`.                        |
| `react-motion-gallery/fullscreen/video`      | `fullscreenVideo(options)`     | Adds fullscreen Plyr rendering, source/options, and `playOnOpen` runtime. Use with `fullscreenSlider()`.  |
| `react-motion-gallery/fullscreen/lazy-load`  | `fullscreenLazyLoad(options)`  | Adds fullscreen image and video lazy-load gates. Use with `fullscreenSlider()`.                           |
| `react-motion-gallery/fullscreen/crossfade`  | `fullscreenCrossfade(options)` | Option plugin for fullscreen crossfade controls, drag, and wheel behavior. Use with `fullscreenSlider()`. |
| `react-motion-gallery/fullscreen/thumbnails` | `fullscreenThumbnails()`       | Option-only plugin for fullscreen thumbnail bridge behavior. Use with `fullscreenSlider()`.               |

### Recommended `useFullscreenController` return values

| Field                       | Type                                                   | Notes                                                                     |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `fullscreenNode`            | `ReactNode`                                            | The fullscreen portal UI. Render this once inside the `GalleryCore` tree. |
| `fullscreenThumbnailBridge` | `FullscreenThumbnailBridge`                            | Bridge consumed by `FullscreenThumbnailSlider`.                           |
| `openFullscreenAt`          | `(source, index, originEl?, requestedMethod?) => void` | Programmatic fullscreen open helper returned by the controller.           |
| `showFullscreenModal`       | `boolean`                                              | `true` while the fullscreen modal is mounted and open.                    |
| `showFullscreenSlider`      | `boolean`                                              | `true` once the slider portion is visible.                                |
| `fsFadeOpening`             | `boolean`                                              | `true` while a fade-based open animation is running.                      |
| `closingModal`              | `boolean`                                              | `true` while the close animation is running.                              |

The hook returns additional refs and setters for the internal fullscreen runtime. Those values are implementation plumbing and are not the recommended consumer-facing surface for app code.

### `FullscreenOptions`

| Option                                    | Type                                                                               | Default                         | Notes                                                                                                                                                                                                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`                                 | `boolean`                                                                          | `false`                         | Master switch for fullscreen UI.                                                                                                                                                                                                                                     |
| `items`                                   | `MediaItem[] \| string[]`                                                          | `—`                             | Declared in the type, but current fullscreen media resolution comes from `GalleryCore.fullscreenItems`.                                                                                                                                                              |
| `renderImage`                             | `({ item, index, isZoomed, className, baseStyle }) => ReactNode`                   | `—`                             | Custom fullscreen image renderer. Must render a real descendant `<img>`. With `lazyLoad.images.enabled`, the renderer is mounted only when the slide is allowed and the runtime watches that descendant image for load/decode readiness.                             |
| `closeScroll`                             | `boolean \| FullscreenCloseScrollOptions`                                          | `false`                         | Scrolls the matching base item into the center of the viewport when fullscreen closes. `true` enables the default before-close scroll; object form defaults `enabled` to `true`.                                                                                     |
| `closeScroll.enabled`                     | `boolean \| "desktop-only" \| "mobile-only" \| ((context) => boolean)`             | `true` in object form           | Enables close-scroll conditionally. Function form receives the current fullscreen index, layout, target element, viewport and pointer details, and the resolved `isMobile` flag.                                                                                     |
| `closeScroll.timing`                      | `"before-close" \| "after-close"`                                                  | `"before-close"`                | Chooses whether to scroll before the close animation starts or after the modal has closed.                                                                                                                                                                           |
| `closeScroll.mobileDetection`             | `(context: FullscreenMobileDetectionContext) => boolean`                           | built-in heuristic              | Overrides mobile detection used by `"desktop-only"`, `"mobile-only"`, and the resolver context. The built-in heuristic treats narrow touch/no-hover viewports as mobile.                                                                                             |
| `video.source`                            | `(item: MediaItem, index: number) => Plyr.SourceInfo`                              | `—`                             | Builds fullscreen Plyr sources for video items.                                                                                                                                                                                                                      |
| `video.options`                           | `Plyr.Options \| ((item: MediaItem, index: number) => Plyr.Options)`               | `—`                             | Builds fullscreen Plyr options.                                                                                                                                                                                                                                      |
| `video.playOnOpen`                        | `boolean`                                                                          | `false`                         | Attempts to play the fullscreen Plyr video when fullscreen opens directly onto a video slide. Browser autoplay rules still apply.                                                                                                                                    |
| `video.style`                             | `React.CSSProperties`                                                              | `—`                             | Fullscreen player inline style.                                                                                                                                                                                                                                      |
| `video.className`                         | `string`                                                                           | `—`                             | Fullscreen player class.                                                                                                                                                                                                                                             |
| `controls.close.enabled`                  | `boolean`                                                                          | `true`                          | Toggles the close button.                                                                                                                                                                                                                                            |
| `controls.close.style`                    | `React.CSSProperties`                                                              | `{}`                            | Close button inline style.                                                                                                                                                                                                                                           |
| `controls.close.className`                | `string`                                                                           | `""`                            | Close button class.                                                                                                                                                                                                                                                  |
| `controls.close.render`                   | `() => ReactNode`                                                                  | `—`                             | Custom close button renderer.                                                                                                                                                                                                                                        |
| `controls.arrows.enabled`                 | `boolean`                                                                          | `true`                          | Toggles fullscreen arrows.                                                                                                                                                                                                                                           |
| `controls.arrows.arrow`                   | `ElementStyle`                                                                     | `{}`                            | Shared arrow style.                                                                                                                                                                                                                                                  |
| `controls.arrows.prev`                    | `ElementStyle`                                                                     | `{}`                            | Previous-arrow override.                                                                                                                                                                                                                                             |
| `controls.arrows.next`                    | `ElementStyle`                                                                     | `{}`                            | Next-arrow override.                                                                                                                                                                                                                                                 |
| `controls.arrows.render`                  | `({ dir }) => ReactNode`                                                           | `—`                             | Custom renderer for both arrows.                                                                                                                                                                                                                                     |
| `controls.arrows.renderPrev`              | `() => ReactNode`                                                                  | `—`                             | Custom previous arrow.                                                                                                                                                                                                                                               |
| `controls.arrows.renderNext`              | `() => ReactNode`                                                                  | `—`                             | Custom next arrow.                                                                                                                                                                                                                                                   |
| `controls.counter.enabled`                | `boolean`                                                                          | `true`                          | Toggles the index counter.                                                                                                                                                                                                                                           |
| `controls.counter.style`                  | `React.CSSProperties`                                                              | `{}`                            | Counter inline style.                                                                                                                                                                                                                                                |
| `controls.counter.className`              | `string`                                                                           | `""`                            | Counter class.                                                                                                                                                                                                                                                       |
| `controls.counter.render`                 | `({ index, count }) => ReactNode`                                                  | `—`                             | Custom counter renderer.                                                                                                                                                                                                                                             |
| `caption.className`                       | `string`                                                                           | `—`                             | Caption root class.                                                                                                                                                                                                                                                  |
| `caption.style`                           | `React.CSSProperties`                                                              | `—`                             | Caption root style.                                                                                                                                                                                                                                                  |
| `caption.placement`                       | `FsCaptionPlacement \| FsCaptionPlacement[] \| Record<string, FsCaptionPlacement>` | `—`                             | Preferred caption placement. Responsive maps use the `GalleryCore.breakpoints` keys such as `xs`, `md`, and `lg`.                                                                                                                                                    |
| `caption.width`                           | `number \| string \| Record<string, number \| string>`                             | `—`                             | Caption area width. Strings can use `px` or `%`; percentages are viewport-relative in fullscreen. Responsive maps use breakpoint keys.                                                                                                                               |
| `caption.height`                          | `number \| string \| Record<string, number \| string>`                             | `—`                             | Caption area height. Strings can use `px` or `%`; percentages are viewport-relative in fullscreen. Responsive maps use breakpoint keys.                                                                                                                              |
| `caption.breakpoint`                      | `number`                                                                           | `—`                             | Viewport cutoff for switching placement logic.                                                                                                                                                                                                                       |
| `caption.render`                          | `({ item, index, isZoomed }) => ReactNode`                                         | `—`                             | Custom caption renderer.                                                                                                                                                                                                                                             |
| `caption.layout`                          | `"overlay" \| "slide"`                                                             | `—`                             | Chooses whether the caption overlays the media or lives in the slide layout.                                                                                                                                                                                         |
| `caption.overlayCrossfadeTarget`          | `"content" \| "overlay"`                                                           | `"content"`                     | Selects whether overlay caption changes fade only the rendered caption content or the whole overlay layer.                                                                                                                                                           |
| `caption.overlayCrossfadeDurationMs`      | `number`                                                                           | `300`                           | Duration for fullscreen overlay caption crossfades.                                                                                                                                                                                                                  |
| `caption.overlayCrossfadeEasing`          | `string`                                                                           | `"cubic-bezier(.4,0,.22,1)"`    | Easing for fullscreen overlay caption crossfades.                                                                                                                                                                                                                    |
| `caption.zoomFade`                        | `boolean`                                                                          | `true`                          | Fades captions out on fullscreen zoom-in and back in on zoom-out.                                                                                                                                                                                                    |
| `caption.zoomFadeDurationMs`              | `number`                                                                           | `300`                           | Duration for fullscreen caption zoom fades.                                                                                                                                                                                                                          |
| `caption.zoomFadeEasing`                  | `string`                                                                           | `"cubic-bezier(.4,0,.22,1)"`    | Easing for fullscreen caption zoom fades.                                                                                                                                                                                                                            |
| `caption.zoomInTransform`                 | `string`                                                                           | `""`                            | Optional transform applied while captions fade out on zoom-in.                                                                                                                                                                                                       |
| `caption.zoomOutTransform`                | `string`                                                                           | `""`                            | Optional transform used as the starting point when captions fade back in on zoom-out.                                                                                                                                                                                |
| `slider.duration`                         | `number`                                                                           | `25`                            | Fullscreen slider motion duration.                                                                                                                                                                                                                                   |
| `slider.friction`                         | `number`                                                                           | `0.68`                          | Fullscreen slider friction.                                                                                                                                                                                                                                          |
| `slider.direction`                        | `"ltr" \| "rtl"`                                                                   | `"ltr"`                         | Fullscreen slider interaction direction.                                                                                                                                                                                                                             |
| `slider.gap`                              | `number \| Record<string, number>`                                                 | `0`                             | Responsive pixel gap between fullscreen slides. Named keys resolve from `GalleryCore.breakpoints`.                                                                                                                                                                   |
| `slider.skipSnaps`                        | `boolean \| { enabled?: boolean; threshold?: number }`                             | `false`                         | Allows fullscreen drag momentum to skip snap points. Object form matches the base slider `scroll.skipSnaps` behavior.                                                                                                                                                |
| `slider.strictSnaps`                      | `boolean`                                                                          | `false`                         | Prevents one fullscreen drag release from settling more than one snap away from where the drag started. Overrides `slider.skipSnaps`.                                                                                                                                |
| `zoom.clickZoomLevel`                     | `number`                                                                           | `2.5`                           | Zoom level used for click-to-zoom.                                                                                                                                                                                                                                   |
| `zoom.maxZoomLevel`                       | `number`                                                                           | `3`                             | Maximum allowed zoom level.                                                                                                                                                                                                                                          |
| `zoom.panDuration`                        | `number`                                                                           | `43`                            | Pan settling duration.                                                                                                                                                                                                                                               |
| `zoom.panFriction`                        | `number`                                                                           | `0.68`                          | Pan friction.                                                                                                                                                                                                                                                        |
| `effects.introDuration`                   | `number \| { transform?: number; fade?: number }`                                  | `{ transform: 300, fade: 500 }` | Open and close intro timing. A scalar applies to both paths. Use `transform` for scale/FLIP handoffs and `fade` for opacity-only paths.                                                                                                                              |
| `effects.introEasing`                     | `string \| { transform?: string; fade?: string }`                                  | `"cubic-bezier(.4,0,.22,1)"`    | Open and close intro easing. A scalar applies to both paths. Object keys mirror `introDuration`.                                                                                                                                                                     |
| `effects.introFade`                       | `boolean`                                                                          | `false`                         | Forces fade intro behavior.                                                                                                                                                                                                                                          |
| `effects.introStickyNavSelector`          | `string`                                                                           | `—`                             | Selector for a sticky navigation element that may cover the source image during scale intro or close path calculations.                                                                                                                                              |
| `effects.crossfade.controls`              | `boolean`                                                                          | `false`                         | Uses crossfade transitions for fullscreen arrow navigation and animated slide requests. Also enables wheel crossfade unless `effects.crossfade.wheel` is provided.                                                                                                   |
| `effects.crossfade.drag`                  | `boolean`                                                                          | `false`                         | Scrubs adjacent fullscreen slides with crossfade during drag instead of moving the track.                                                                                                                                                                            |
| `effects.crossfade.wheel`                 | `boolean \| CrossFadeWheelOptions`                                                 | `effects.crossfade.controls`    | Uses wheel or touchpad travel as a one-slide-at-a-time fullscreen crossfade gesture. Set `false` to keep arrow crossfades while using normal wheel scrolling.                                                                                                        |
| `effects.crossfade.wheel.enabled`         | `boolean`                                                                          | `true` when object form is used | Enables or disables fullscreen wheel crossfade when using the object form.                                                                                                                                                                                           |
| `effects.crossfade.wheel.sensitivity`     | `number`                                                                           | `5`                             | Multiplies wheel delta into virtual drag progress. Higher values reach the commit threshold sooner.                                                                                                                                                                  |
| `effects.crossfade.wheel.commitThreshold` | `number`                                                                           | `0.38`                          | Progress needed to commit to the previous or next fullscreen slide. Values are clamped from `0` to below `0.5`.                                                                                                                                                      |
| `effects.crossfade.wheel.durationMs`      | `number`                                                                           | `effects.crossfade.durationMs`  | Fade duration after fullscreen wheel crossfade commits.                                                                                                                                                                                                              |
| `effects.crossfade.wheel.sessionGapMs`    | `number`                                                                           | `24`                            | Short quiet window used to distinguish same-direction touchpad tail from a fresh fullscreen wheel gesture after a committed wheel crossfade.                                                                                                                         |
| `effects.crossfade.durationMs`            | `number`                                                                           | `120`                           | Shared fullscreen crossfade duration for controls, drag release, and wheel commit unless wheel overrides it.                                                                                                                                                         |
| `effects.crossfade.easing`                | `string`                                                                           | `"cubic-bezier(.4,0,.22,1)"`    | Shared fullscreen crossfade easing.                                                                                                                                                                                                                                  |
| `lazyLoad.images.enabled`                 | `boolean`                                                                          | `—`                             | Enables fullscreen image lazy loading. Base-visible indices predecode matching fullscreen images, and fullscreen index changes allow the active image slide to mount or apply its source.                                                                            |
| `lazyLoad.images.spinner`                 | `boolean \| ReactNode \| ((args) => ReactNode)`                                    | `—`                             | Spinner override for fullscreen images.                                                                                                                                                                                                                              |
| `lazyLoad.images.spinnerClassName`        | `string`                                                                           | `—`                             | Spinner class for image slides.                                                                                                                                                                                                                                      |
| `lazyLoad.images.spinnerStyle`            | `React.CSSProperties`                                                              | `—`                             | Spinner style for image slides.                                                                                                                                                                                                                                      |
| `lazyLoad.videos.enabled`                 | `boolean`                                                                          | `—`                             | Opts fullscreen videos into lazy mounting. Base-visible indices prewarm matching video posters/sources and fullscreen index changes mount the active or already-prepared video slide. By default fullscreen Plyr videos mount eagerly in the hidden fullscreen tree. |
| `lazyLoad.videos.spinner`                 | `boolean \| ReactNode \| ((args) => ReactNode)`                                    | `—`                             | Spinner override for fullscreen videos.                                                                                                                                                                                                                              |
| `lazyLoad.videos.spinnerClassName`        | `string`                                                                           | `—`                             | Spinner class for video slides.                                                                                                                                                                                                                                      |
| `lazyLoad.videos.spinnerStyle`            | `React.CSSProperties`                                                              | `—`                             | Spinner style for video slides.                                                                                                                                                                                                                                      |

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

| Field   | Type     | Notes                     |
| ------- | -------- | ------------------------- |
| `index` | `number` | Current fullscreen index. |
| `count` | `number` | Total slide count.        |

#### `FsCaptionRenderArgs`

| Field      | Type        | Notes                                   |
| ---------- | ----------- | --------------------------------------- |
| `item`     | `MediaItem` | Active fullscreen item.                 |
| `index`    | `number`    | Active fullscreen index.                |
| `isZoomed` | `boolean`   | `true` when the active slide is zoomed. |

#### `FsCaptionPlacement`

| Value      | Notes                                         |
| ---------- | --------------------------------------------- |
| `"top"`    | Places the caption above the media.           |
| `"right"`  | Places the caption to the right of the media. |
| `"bottom"` | Places the caption below the media.           |
| `"left"`   | Places the caption to the left of the media.  |

#### `FsIntroRequest`

| Field             | Type                       | Notes                                              |
| ----------------- | -------------------------- | -------------------------------------------------- |
| `originalImage`   | `HTMLImageElement \| null` | Origin image used for scale transitions.           |
| `index`           | `number`                   | Target fullscreen index.                           |
| `method`          | `"fade" \| "scale"`        | Requested intro method.                            |
| `closestSelector` | `string \| undefined`      | Selector used to resolve the source slide element. |

#### `FullscreenLazyLoadArgs`

| Field     | Type                   | Notes                                          |
| --------- | ---------------------- | ---------------------------------------------- |
| `kind`    | `"image" \| "video"`   | Media kind currently loading.                  |
| `isClone` | `boolean \| undefined` | `true` for cloned looped slides when relevant. |

#### `FullscreenThumbnailSlider` props

`FullscreenThumbnailSliderProps` is exported from both the package root and `react-motion-gallery/fullscreenThumbnails`. The table below summarizes the prop surface.

| Option                      | Type                                     | Default                                           | Notes                                                                               |
| --------------------------- | ---------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `bridge`                    | `FullscreenThumbnailBridge`              | `—`                                               | Bridge returned from `useFullscreenController`.                                     |
| `items`                     | `{ thumbSrc: string; alt?: string }[]`   | `—`                                               | Thumbnail list.                                                                     |
| `position`                  | `"top" \| "right" \| "bottom" \| "left"` | `—`                                               | Thumbnail rail position.                                                            |
| `containerClassName`        | `string`                                 | `—`                                               | Thumbnail container class.                                                          |
| `containerStyle`            | `React.CSSProperties`                    | `—`                                               | Thumbnail container style.                                                          |
| `thumbnailWidth`            | `number \| string`                       | `—`                                               | Individual thumbnail width.                                                         |
| `thumbnailHeight`           | `number \| string`                       | `—`                                               | Individual thumbnail height.                                                        |
| `thumbnailsCenter`          | `boolean`                                | `—`                                               | Centers the thumbnail strip within its container.                                   |
| `thumbnailsContainerWidth`  | `number \| string`                       | `—`                                               | Explicit strip width.                                                               |
| `thumbnailsContainerHeight` | `number \| string`                       | `—`                                               | Explicit strip height.                                                              |
| `fadeDurationMs`            | `number`                                 | `300`                                             | Mount and unmount fade duration.                                                    |
| `fadeEasing`                | `string`                                 | `"cubic-bezier(.4,0,.22,1)"`                      | Fade easing.                                                                        |
| `thumbnailItemClassName`    | `string`                                 | `—`                                               | Thumbnail item class.                                                               |
| `thumbnailItemStyle`        | `React.CSSProperties`                    | `—`                                               | Thumbnail item style.                                                               |
| `gap`                       | `number`                                 | `—`                                               | Gap between thumbnails.                                                             |
| `freeScroll`                | `boolean`                                | `—`                                               | Enables free thumbnail dragging.                                                    |
| `groupCells`                | `boolean`                                | `—`                                               | Groups thumbnail cells into snaps.                                                  |
| `loop`                      | `boolean`                                | `—`                                               | Loops the thumbnail slider.                                                         |
| `axis`                      | `"x" \| "y"`                             | `—`                                               | Declared in the prop type, but the current implementation does not wire it through. |
| `skipSnaps`                 | `boolean`                                | `—`                                               | Allows momentum to skip snaps.                                                      |
| `centerActiveThumb`         | `boolean`                                | `—`                                               | Keeps the active thumbnail centered.                                                |
| `selectDuration`            | `number`                                 | `—`                                               | Selection motion duration.                                                          |
| `freeScrollDuration`        | `number`                                 | `—`                                               | Free-scroll settling duration.                                                      |
| `sliderFriction`            | `number`                                 | `—`                                               | Thumbnail slider friction.                                                          |
| `breakpointMap`             | `Record<string, number>`                 | `{ xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 }` | Breakpoints used by the thumbnail strip.                                            |
| `rippleEnabled`             | `boolean`                                | `—`                                               | Enables thumbnail arrow ripples.                                                    |
| `rippleClassName`           | `string`                                 | `—`                                               | Ripple class name.                                                                  |
| `showArrows`                | `boolean`                                | `false`                                           | Toggles thumbnail arrows.                                                           |
| `arrowStyles`               | `React.CSSProperties`                    | `—`                                               | Shared arrow styles.                                                                |
| `arrowClassName`            | `string`                                 | `—`                                               | Shared arrow class.                                                                 |
| `prevArrowStyles`           | `React.CSSProperties`                    | `—`                                               | Previous-arrow styles.                                                              |
| `prevArrowClassName`        | `string`                                 | `—`                                               | Previous-arrow class.                                                               |
| `nextArrowStyles`           | `React.CSSProperties`                    | `—`                                               | Next-arrow styles.                                                                  |
| `nextArrowClassName`        | `string`                                 | `—`                                               | Next-arrow class.                                                                   |
| `renderArrows`              | `(args) => ReactNode`                    | `—`                                               | Custom renderer for both arrows.                                                    |
| `renderPrevArrow`           | `(args) => ReactNode`                    | `—`                                               | Custom previous arrow.                                                              |
| `renderNextArrow`           | `(args) => ReactNode`                    | `—`                                               | Custom next arrow.                                                                  |

#### `FullscreenThumbnailBridge`

| Field            | Type                                              | Notes                                            |
| ---------------- | ------------------------------------------------- | ------------------------------------------------ |
| `mountEl`        | `HTMLDivElement \| null`                          | Portal mount node for the thumbnail strip.       |
| `fsSub`          | `FullscreenSliderSub`                             | Fullscreen slider index channel used internally. |
| `visible`        | `boolean`                                         | `true` when the strip should be visible.         |
| `invisible`      | `boolean`                                         | `true` during hidden transitional states.        |
| `direction`      | `"ltr" \| "rtl"`                                  | Fullscreen direction.                            |
| `registerLayout` | `(layout: FullscreenThumbnailSlotLayout) => void` | Registers the slot layout metadata.              |
| `clearLayout`    | `() => void`                                      | Clears the current slot layout.                  |

#### `FullscreenThumbnailSlotLayout`

| Field            | Type                                     | Notes                    |
| ---------------- | ---------------------------------------- | ------------------------ |
| `position`       | `"top" \| "right" \| "bottom" \| "left"` | Thumbnail rail position. |
| `className`      | `string \| undefined`                    | Slot container class.    |
| `style`          | `React.CSSProperties \| undefined`       | Slot container style.    |
| `fadeDurationMs` | `number \| undefined`                    | Slot fade duration.      |
| `fadeEasing`     | `string \| undefined`                    | Slot fade easing.        |

## ZoomPanImage

```typescript
import { ZoomPanImage } from "react-motion-gallery/zoomPan";
import { zoomPanHover } from "react-motion-gallery/zoomPan/hover";

export function ZoomPanCard() {
  return (
    <ZoomPanImage
      src="https://picsum.photos/id/1035/1600/1200"
      alt="A hiker looking over a canyon at dusk"
      className="zoomCard"
      zoom={{
        clickZoomLevel: 2.35,
        maxZoomLevel: 3.5,
        plugins: [zoomPanHover()],
      }}
    />
  );
}
```

`ZoomPanImage` is the lightweight standalone zoom surface. The component root is the clipping container, so border radius, aspect ratio, and overflow all live on the same element. Add `zoomPanHover()` to opt into smooth mouse hover zoom with cursor-driven pan; the same plugin can be passed through `fullscreenZoomPan({ plugins: [zoomPanHover()] })`.

### ZoomPanImage props

`ZoomPanImage` forwards its ref to the root `HTMLDivElement`. Standard image attributes are passed to the inner `<img>` except `children`, `className`, and `style`; use `className` / `style` for the root and `imageClassName` / `imageStyle` for the rendered image.

| Prop                   | Type                                                                                    | Default               | Notes                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `ref`                  | `React.Ref<HTMLDivElement>`                                                             | `—`                   | Forwarded to the root clipping container.                                                                                    |
| `src`                  | `string \| undefined`                                                                   | `—`                   | Forwarded to the inner image.                                                                                                |
| `alt`                  | `string \| undefined`                                                                   | `—`                   | Forwarded to the inner image.                                                                                                |
| `className`            | `string`                                                                                | `—`                   | Class name for the root clipping container.                                                                                  |
| `style`                | `React.CSSProperties`                                                                   | built-in root styles  | Merged onto the root clipping container after the built-in `position`, `overflow`, sizing, and touch-action styles.          |
| `imageClassName`       | `string`                                                                                | `—`                   | Class name for the inner image element.                                                                                      |
| `imageStyle`           | `React.CSSProperties`                                                                   | built-in image styles | Merged onto the inner image after the built-in `display`, `objectFit`, transform, selection, and cursor styles.              |
| `zoom`                 | `ZoomPanOptions`                                                                        | default zoom options  | Configures click zoom, wheel/pinch zoom limits, pan motion, and optional plugins.                                            |
| `disabled`             | `boolean`                                                                               | `false`               | Disables zoom, pan, pinch, wheel, and hover behavior and resets the image to identity while disabled.                        |
| `onDragStart`          | `React.DragEventHandler<HTMLImageElement>`                                              | `—`                   | Called after native image dragging is prevented.                                                                             |
| Other image attributes | `Omit<React.ImgHTMLAttributes<HTMLImageElement>, "children" \| "className" \| "style">` | `—`                   | Forwarded to the inner image, including `loading`, `decoding`, `srcSet`, `sizes`, ARIA attributes, and image event handlers. |

### Zoom options

| Option           | Type              | Default | Notes                                                                                  |
| ---------------- | ----------------- | ------- | -------------------------------------------------------------------------------------- |
| `clickZoomLevel` | `number`          | `2.5`   | Target scale for click/tap zoom and the default hover zoom level.                      |
| `maxZoomLevel`   | `number`          | `3`     | Upper scale limit for click, wheel, pinch, and hover zoom.                             |
| `panDuration`    | `number`          | `43`    | Motion duration used by pan and zoom settling.                                         |
| `panFriction`    | `number`          | `0.68`  | Friction used by drag-pan momentum.                                                    |
| `plugins`        | `ZoomPanPlugin[]` | `—`     | First-party feature plugins for the zoom surface. Currently includes `zoomPanHover()`. |

### `zoomPanHover()` options

| Option              | Type      | Default               | Notes                                                                      |
| ------------------- | --------- | --------------------- | -------------------------------------------------------------------------- |
| `enabled`           | `boolean` | `true`                | Set `false` to keep the plugin in the list while disabling hover behavior. |
| `zoomLevel`         | `number`  | `zoom.clickZoomLevel` | Target hover scale, clamped by `zoom.maxZoomLevel`.                        |
| `zoomInDurationMs`  | `number`  | `zoomOutDurationMs`   | Duration for the hover-in zoom animation.                                  |
| `zoomOutDurationMs` | `number`  | `260`                 | Duration for the hover-out reset animation.                                |

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

| Option                      | Type                                                 | Default               | Notes                                                                                                                                   |
| --------------------------- | ---------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src`                       | `string`                                             | `—`                   | Source URL used to build the default Plyr source.                                                                                       |
| `poster`                    | `string`                                             | `—`                   | Poster image.                                                                                                                           |
| `alt`                       | `string`                                             | `—`                   | Optional metadata label; the `Video` component itself does not render a visible alt attribute.                                          |
| `source`                    | `Plyr.SourceInfo`                                    | auto-built MP4 source | Direct Plyr source object. Overrides `sourceBuilder`.                                                                                   |
| `sourceBuilder`             | `({ src: string }) => Plyr.SourceInfo`               | `—`                   | Builds the Plyr source from `src`.                                                                                                      |
| `options`                   | `Plyr.Options \| (({ src, index }) => Plyr.Options)` | `—`                   | Direct or computed Plyr options. When omitted, the component still applies `autoplay: false` and `preload: "none"` defaults internally. |
| `className`                 | `string`                                             | `—`                   | Player wrapper class.                                                                                                                   |
| `style`                     | `React.CSSProperties`                                | `—`                   | Player wrapper style.                                                                                                                   |
| `onApi`                     | `(api: APITypes \| null) => void`                    | `—`                   | Called whenever the Plyr API ref changes.                                                                                               |
| `registerApiByIndex`        | `(index: number, api: APITypes \| null) => void`     | `—`                   | Registers the API by canonical gallery index.                                                                                           |
| `lazyLoad.enabled`          | `boolean`                                            | `true`                | `false` mounts immediately after reveal.                                                                                                |
| `lazyLoad.spinner`          | `boolean \| ReactNode \| ((args) => ReactNode)`      | `true`                | `false` disables the spinner; `true` uses the built-in spinner.                                                                         |
| `lazyLoad.spinnerClassName` | `string`                                             | `—`                   | Spinner wrapper class.                                                                                                                  |
| `lazyLoad.spinnerStyle`     | `React.CSSProperties`                                | `—`                   | Spinner wrapper style.                                                                                                                  |

### Supporting video types

These helper type names are available from both the package root and `react-motion-gallery/video`.

| Type                      | Shape                                                      | Notes                    |
| ------------------------- | ---------------------------------------------------------- | ------------------------ |
| `RmgPlyrSourceBuilder`    | `({ src: string }) => Plyr.SourceInfo`                     | Used by `sourceBuilder`. |
| `RmgPlyrOptionsResolver`  | `Plyr.Options \| (({ src, index }) => Plyr.Options)`       | Used by `options`.       |
| `RmgVideoLazyLoadOptions` | `{ enabled?, spinner?, spinnerClassName?, spinnerStyle? }` | Used by `lazyLoad`.      |

If you do not use `Video`, you do not need `plyr` or `plyr-react`. Install those optional peer dependencies only for video playback.

## Acknowledgements

React Motion Gallery's slider engine includes portions of code derived from [Embla Carousel](https://github.com/davidjerleke/embla-carousel), which is MIT licensed. Those portions have been substantially adapted for React Motion Gallery's React architecture, public API, transition system, fullscreen integration, loading layers, and media workflows.

See [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) for the preserved Embla Carousel copyright and MIT license notice.
