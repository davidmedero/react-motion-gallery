# React Motion Gallery

Simple, motion-first React gallery primitives for sliders, grids, masonry layouts, fullscreen media, structured entries, and video. The package stays composable: `Slider`, `Grid`, and `Masonry` render children directly, `Entries` renders structured data, `GalleryCore` coordinates fullscreen state, and `Video` handles Plyr-backed video media.

## Export Gzip Sizes

This table reports local gzip measurements for each exported runtime surface. The script rebundles one runtime export at a time from the published root entry, excludes peer and runtime externals, and gzips the resulting JS bundle. Run `npm run build && npm run size:readme` in `packages/react-motion-gallery` to refresh it.

<!-- bundle-size:start -->
| Export | JS gzip |
| --- | --- |
| `Entries` | 6.8kB |
| `FullscreenThumbnailSlider` | 16.9kB |
| `GalleryCore` | 1.8kB |
| `Grid` | 7.4kB |
| `Masonry` | 7.2kB |
| `Slider` | 29.0kB |
| `ThumbnailSlider` | 15.8kB |
| `useFullscreenController` | 42.1kB |
| `Video` | 9.0kB |
<!-- bundle-size:end -->

## Overview

Install the package, then add the optional video peers only if you use `Video`.

```bash
npm install react-motion-gallery
npm install plyr plyr-react
```

Import the stylesheet. The package uses CSS Modules internally, but consumers only load the compiled plain CSS file, so no CSS Modules setup is required in your app.

```typescript
import "react-motion-gallery/styles.css";
```

Mental model:

- `Slider`, `Grid`, and `Masonry` render React children directly.
- `Entries` renders structured entry data with a custom media container.
- `GalleryCore` and `useFullscreenController` power fullscreen behavior.
- `Video` is the gallery-ready video primitive.

`MediaItem` accepts three shapes:

- image: `{ kind: "image", src, alt?, caption?, srcSet?, sizes?, width?, height? }`
- video: `{ kind: "video", src, poster?, alt?, caption? }`
- node: `{ kind: "node", node }`

`toMediaItems()` accepts string URLs, image/video objects, and node objects, then normalizes them into `MediaItem[]`. String URLs infer `kind` from the file extension.

```typescript
import "react-motion-gallery/styles.css";
import { Slider, toMediaItems, type MediaItem } from "react-motion-gallery";

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

The package root now exports the primary public components, helper functions, and companion prop types. Subpath entrypoints are also available when you want narrower imports: `react-motion-gallery/core`, `react-motion-gallery/slider`, `react-motion-gallery/grid`, `react-motion-gallery/masonry`, `react-motion-gallery/entries`, `react-motion-gallery/fullscreen`, `react-motion-gallery/thumbnails`, `react-motion-gallery/fullscreenThumbnails`, and `react-motion-gallery/video`.

## Slider

```typescript
import { Slider } from "react-motion-gallery";

const slides = [
  "https://picsum.photos/id/1015/1600/900",
  "https://picsum.photos/id/1018/1600/900",
  "https://picsum.photos/id/1024/1600/900",
];

export function BasicSlider() {
  return (
    <Slider>
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
| `breakpoints` | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Merged with the internal breakpoint map for responsive values. |
| `expandableImageRefs` | `React.RefObject<(HTMLImageElement | null)[]>` | internal ref | Supplies origin images for fullscreen scale transitions. |
| `indexChannel` | `SliderIndexChannel` | internal channel | Share index state with thumbnails or sibling sliders. |

### Slider layout and scroll options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `layout.gap` | `number` | `20` | Gap between cells. |
| `layout.cellsPerSlide` | `number \| Record<string, number>` | `—` | Groups multiple cells into a slide page. |
| `direction.dir` | `"ltr" \| "rtl"` | `"ltr"` | Text direction and arrow direction. |
| `direction.axis` | `"x" \| "y"` | `"x"` | Horizontal or vertical slider axis. |
| `align` | `"start" \| "center"` | `"start"` | Slide alignment inside the viewport. |
| `scroll.groupCells` | `boolean` | `false` | Scrolls by grouped cells instead of every cell. |
| `scroll.skipSnaps` | `boolean` | `false` | Allows momentum to skip snap points. |
| `scroll.freeScroll` | `boolean` | `false` | Enables free dragging instead of strict snapping. |
| `scroll.loop` | `boolean` | `false` | Wraps around at the ends. |

### Slider element and lazy-load options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `elements.viewport` | `ElementStyle` | `—` | Class and inline style for the viewport element. |
| `elements.container` | `ElementStyle` | `—` | Class and inline style for the moving slider container. |
| `lazyLoad.enabled` | `boolean` | `false` | Enables slide-level lazy image and video loading. |
| `lazyLoad.spinner` | `boolean \| ReactNode \| ((args) => ReactNode)` | `true` | `false` disables the built-in spinner. |
| `lazyLoad.spinnerClassName` | `string` | `""` | Applied to the spinner wrapper. |
| `lazyLoad.spinnerStyle` | `React.CSSProperties` | `{}` | Inline styles for the spinner wrapper. |

### Slider control options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `controls.arrows.enabled` | `boolean` | `true` | Toggles previous and next arrows. |
| `controls.arrows.arrow` | `ElementStyle` | `{}` | Shared arrow class and style. |
| `controls.arrows.prev` | `ElementStyle` | `{}` | Previous-arrow override. |
| `controls.arrows.next` | `ElementStyle` | `{}` | Next-arrow override. |
| `controls.arrows.render` | `(args) => ReactNode` | `—` | Custom renderer for both arrows. |
| `controls.arrows.renderPrev` | `(args) => ReactNode` | `—` | Custom previous arrow. |
| `controls.arrows.renderNext` | `(args) => ReactNode` | `—` | Custom next arrow. |
| `controls.dots.enabled` | `boolean` | `true` | Toggles pagination dots. |
| `controls.dots.root` | `ElementStyle` | `{}` | Dot container class and style. |
| `controls.dots.dot` | `ElementStyle` | `{}` | Individual dot class and style. |
| `controls.dots.render` | `(args) => ReactNode` | `—` | Full custom dots UI. |
| `controls.progress.enabled` | `boolean` | `false` | Toggles the progress bar. |
| `controls.progress.root` | `ElementStyle` | `{}` | Progress track class and style. |
| `controls.progress.bar` | `ElementStyle` | `{}` | Progress fill class and style. |
| `controls.progress.render` | `(args) => ReactNode` | `—` | Full custom progress UI. |
| `controls.ripple.enabled` | `boolean` | `true` | Toggles control ripple feedback. |
| `controls.ripple.className` | `string` | `""` | Custom ripple class. |

### Slider auto and transition options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `auto.play.enabled` | `boolean` | `false` | Timed slide changes. |
| `auto.play.speedMs` | `number` | `3000` | Delay between autoplay advances. |
| `auto.play.pauseMs` | `number` | `1000` | Delay after interaction before autoplay resumes. |
| `auto.play.pauseOnHover` | `boolean` | `true` | Pauses autoplay while hovering. |
| `auto.scroll.enabled` | `boolean` | `false` | Continuous timed scrolling. |
| `auto.scroll.speedMs` | `number` | `3000` | Interval for auto-scroll movement. |
| `auto.scroll.pauseMs` | `number` | `1000` | Delay after interaction before auto-scroll resumes. |
| `auto.scroll.pauseOnHover` | `boolean` | `true` | Pauses while hovering. |
| `transitions.loading.enabled` | `boolean` | `—` | Enables the loading skeleton layer. |
| `transitions.loading.force` | `boolean` | `—` | Forces the loading layer to stay visible. |
| `transitions.loading.skeletonCount` | `number \| Record<string, number>` | `—` | Responsive skeleton slot count. |
| `transitions.loading.renderLoading` | `({ count }) => ReactNode` | `—` | Custom loading renderer. |
| `transitions.loading.skeleton` | `SliderSkeletonSpec` | `—` | Built-in skeleton spec. |
| `transitions.intro.renderIntro` | `({ active, containerProps }, content) => ReactNode` | `—` | Custom intro wrapper. |
| `transitions.intro.staggerMs` | `number` | `—` | Delay between item reveals. |
| `transitions.intro.transform` | `number \| string` | `—` | Initial intro transform. |
| `transitions.intro.durationMs` | `number` | `—` | Intro duration. |
| `transitions.intro.easing` | `string` | `—` | Intro easing. |

### Slider motion and effect options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `motion.selectDuration` | `number` | `25` | Duration for snapped selection motion. |
| `motion.freeScrollDuration` | `number` | `43` | Duration for free-scroll settling. |
| `motion.friction` | `number` | `0.68` | Drag and settling friction. |
| `effects.parallax.enabled` | `boolean` | `—` | Enables the parallax slide treatment. |
| `effects.parallax.bleedPct` | `string` | `—` | Extra image bleed around the viewport. |
| `effects.parallax.borderRadius` | `string` | `—` | Radius for the parallax frame. |
| `effects.parallax.sideWidth` | `string` | `—` | Side crop width used by the effect. |
| `effects.scale.enabled` | `boolean` | `—` | Scales neighboring slides. |
| `effects.scale.amount` | `number` | `—` | Scale multiplier for the scale effect. |
| `effects.fade.enabled` | `boolean` | `—` | Fades slides based on position. |

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
| `scrollNext` | `(mode?: IndexMode) => void` | Advances one step. |
| `scrollPrev` | `(mode?: IndexMode) => void` | Moves backward one step. |
| `canScrollNext` | `() => boolean` | Whether next navigation is available. |
| `canScrollPrev` | `() => boolean` | Whether previous navigation is available. |
| `scrollProgress` | `() => number` | Current progress from `0` to `1`. |
| `cellsInView` | `() => number[]` | Canonical cell indexes currently visible. |
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

The component forwards a ref to its outer thumbnail shell. The explicit `layout`, `scroll`, and `motion` defaults below are also exported as `DEFAULT_THUMBNAILS`.

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
| `transitions.loading.force` | `boolean` | `false` | Forces the loading layer to remain visible. |
| `transitions.loading.skeletonCount` | `number \| Record<string, number>` | `—` | Responsive count for the built-in loading placeholders. |
| `transitions.loading.renderLoading` | `() => ReactNode` | `—` | Replaces the built-in thumbnail loading skeleton. |
| `transitions.intro.renderIntro` | `({ active, containerProps }, inner) => ReactNode` | `—` | Custom intro wrapper for the thumbnail rail. |
| `transitions.intro.staggerMs` | `number` | `40` | Delay between thumbnail reveals. |
| `transitions.intro.transform` | `string` | `"10px"` | Starting translate offset used by the default intro. |
| `transitions.intro.durationMs` | `number` | `300` | Intro duration. |
| `transitions.intro.easing` | `string` | `"cubic-bezier(.2,.7,.2,1)"` | Intro easing. |

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
| `children` | `React.ReactNode` | `—` | Grid items rendered in order. |
| `breakpoints` | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Used to resolve responsive columns and gaps. |
| `gridItemBaseClass` | `string` | `"rmg__grid-item"` | Internal item base class override. |
| `renderMode` | `"wrap" \| "passthrough"` | `"wrap"` | `wrap` adds an item wrapper; `passthrough` keeps child structure closer to the source node. |

### Grid options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | `number \| Record<string, number>` | `—` | Fixed responsive column count. When omitted, Grid auto-fits using `minColumnWidth`. |
| `minColumnWidth` | `number \| string` | `160` | Minimum width used by auto-fit mode. |
| `gap` | `number \| Record<string, number>` | `8` | Responsive grid gap. |
| `rootClassName` | `string` | `—` | Class name for the grid root. |
| `itemClassName` | `string` | `—` | Class name added to each wrapped grid item. |
| `fullscreenTrigger` | `"item" \| "media"` | `"media"` | Opens fullscreen from the clicked media node or the entire item shell. |
| `lazyLoad.enabled` | `boolean` | `—` | Enables lazy media loading. |
| `lazyLoad.spinner` | `boolean \| ReactNode \| ((args) => ReactNode)` | `—` | Spinner override for lazy items. |
| `lazyLoad.spinnerClassName` | `string` | `—` | Spinner wrapper class. |
| `lazyLoad.spinnerStyle` | `React.CSSProperties` | `—` | Spinner wrapper style. |
| `loading.enabled` | `boolean` | `—` | Enables the loading layer. |
| `loading.force` | `boolean` | `—` | Keeps the loading layer visible even when media is ready. |
| `loading.renderLoading` | `({ count }) => ReactNode` | `—` | Custom loading renderer. |
| `loading.skeleton` | `GridSkeletonSpec` | `—` | Built-in grid skeleton spec. |
| `intro.renderIntro` | `({ active, containerProps }, content) => ReactNode` | `—` | Custom intro wrapper. |
| `intro.staggerMs` | `number` | `40` | Reveal stagger. |
| `intro.transform` | `string` | `"translateY(10px) scale(0.99)"` | Starting transform. |
| `intro.durationMs` | `number` | `300` | Intro duration. |
| `intro.easing` | `string` | `"cubic-bezier(.2,.7,.2,1)"` | Intro easing. |
| `intro.staggerLimit` | `number` | `—` | Optional cap on how many items stagger. |

Grid fullscreen behavior is provided by `GalleryCore` and `useFullscreenController`; Grid itself does not expose a ref-based imperative API.

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
| `children` | `React.ReactNode` | `—` | Masonry items rendered in order. |
| `breakpoints` | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Used to resolve responsive columns and gaps. |

### Masonry options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | `number \| Record<string, number>` | `—` | Responsive column count. |
| `gap` | `number \| Record<string, number>` | `—` | Responsive gap between columns and items. |
| `placement` | `"balanced" \| "roundRobin"` | `"balanced"` | `balanced` aims for even column heights. |
| `estimatedItemHeight` | `number` | `—` | Hint used before measurements settle. |
| `as` | `React.ElementType` | `"div"` | Root HTML element or custom component. |
| `rootRef` | `React.Ref<HTMLDivElement>` | `—` | Ref to the masonry root. |
| `classNames.root` | `string` | `—` | Root class name. |
| `classNames.column` | `string` | `—` | Column class name. |
| `classNames.item` | `string` | `—` | Item class name. |
| `lazyLoad.enabled` | `boolean` | `—` | Enables lazy media loading. |
| `lazyLoad.spinner` | `boolean \| ReactNode \| ((args) => ReactNode)` | `—` | Spinner override for lazy items. |
| `lazyLoad.spinnerClassName` | `string` | `—` | Spinner wrapper class. |
| `lazyLoad.spinnerStyle` | `React.CSSProperties` | `—` | Spinner wrapper style. |
| `loading.enabled` | `boolean` | `—` | Enables the loading layer. |
| `loading.force` | `boolean` | `—` | Forces the loading layer to stay visible. |
| `loading.renderLoading` | `({ count }) => ReactNode` | `—` | Custom loading renderer. |
| `loading.skeleton` | `MasonrySkeletonSpec` | `—` | Built-in masonry skeleton spec. |
| `intro.renderIntro` | `({ active, containerProps }, content) => ReactNode` | `—` | Custom intro wrapper. |
| `intro.staggerMs` | `number` | `40` | Reveal stagger. |
| `intro.transform` | `string` | `"translateY(10px) scale(0.99)"` | Starting transform. |
| `intro.durationMs` | `number` | `300` | Intro duration. |
| `intro.easing` | `string` | `"cubic-bezier(.2,.7,.2,1)"` | Intro easing. |
| `intro.staggerLimit` | `number` | `—` | Optional cap on how many items stagger. |

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
| `render.overlay` | `({ entry, entryIndex, mediaIndex, link, opacity, fsIndex, style, containerProps }) => ReactNode` | `—` | Renders fullscreen overlay content for the active entry slide. |
| `render.skeleton` | `({ entry, entryIndex }) => ReactNode` | `—` | Declared in the type, but the current runtime uses `loading.skeleton` instead. |
| `overlay` | `ElementStyle` | `—` | Styles the fullscreen overlay container that wraps `render.overlay`. |
| `loading.enabled` | `boolean` | `—` | Enables entry loading and decode gating. |
| `loading.force` | `boolean` | `—` | Forces entry skeletons to remain visible. |
| `loading.skeleton` | `EntrySkeletonSpec \| ((args) => EntrySkeletonSpec \| null \| undefined)` | `—` | Built-in skeleton spec or resolver. |
| `loading.minHeight` | `number \| string` | `"260px"` | Minimum reserved height while loading. |
| `loading.nearMargin` | `string` | `"700px 0px"` | Preload margin used before entries enter view. |
| `loading.viewMargin` | `string` | `"0px 0px"` | Margin used for the actual in-view gate. |
| `loading.threshold` | `number` | `0.01` | Intersection threshold for view detection. |
| `loading.waitForDecode` | `boolean` | `true` | Waits for image decode before revealing an entry. |
| `loading.decodeTimeoutMs` | `number` | `8000` | Decode timeout fallback. |
| `loading.skeletonWrap` | `ElementStyle` | `—` | Styles the skeleton wrapper. |
| `intro.renderIntro` | `({ active, containerProps }, content) => ReactNode` | `—` | Custom intro wrapper. |
| `intro.staggerMs` | `number` | `200` | Delay between entry reveals. |
| `intro.durationMs` | `number` | `700` | Entry intro duration. |
| `intro.easing` | `string` | `"cubic-bezier(.2,.7,.2,1)"` | Entry intro easing. |
| `intro.staggerLimit` | `number` | `6` | Maximum number of entries that receive staggered delays. |
| `entryList` | `ElementStyle` | `—` | Styles the entry list container. |
| `entryRow` | `ElementStyle` | `—` | Styles each entry row container. |

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

```typescript
import * as React from "react";
import { GalleryCore, Slider, useFullscreenController } from "react-motion-gallery";

const slides = [
  "https://picsum.photos/id/1015/1600/900",
  "https://picsum.photos/id/1018/1600/900",
  "https://picsum.photos/id/1024/1600/900",
];

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
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

Add fullscreen thumbnails by rendering `FullscreenThumbnailSlider` with the bridge returned from `useFullscreenController`.

```typescript
import { FullscreenThumbnailSlider, useFullscreenController } from "react-motion-gallery";

function FullscreenWithThumbs({ thumbs }: { thumbs: string[] }) {
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
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
  fullscreen: {
    enabled: true,
    slider: {
      direction: "rtl",
    },
  },
});
```

### `GalleryCore` props

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `—` | The gallery tree using the shared core. |
| `layout` | `"slider" \| "grid" \| "masonry" \| "entries"` | `—` | Declares the owning base layout. |
| `breakpoints` | `Record<string, number>` | `xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536` | Breakpoint map shared with descendants. |
| `fullscreenItems` | `MediaItem[] \| string[]` | `[]` | Normalized fullscreen media list. |
| `nodes` | `ReactNode \| ReactNode[]` | `—` | Advanced initial node list for imperative gallery state. |

### `useFullscreenController` args

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `fullscreen` | `FullscreenOptions` | `—` | Fullscreen behavior and rendering options. |

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
| `renderImage` | `({ item, index, isZoomed, className, baseStyle }) => ReactNode` | `—` | Custom fullscreen image renderer. Must render a real descendant `<img>`. |
| `video.source` | `(item: MediaItem, index: number) => Plyr.SourceInfo` | `—` | Builds fullscreen Plyr sources for video items. |
| `video.options` | `Plyr.Options \| ((item: MediaItem, index: number) => Plyr.Options)` | `—` | Builds fullscreen Plyr options. |
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
| `caption.placement` | `"top" \| "right" \| "bottom" \| "left"` | `—` | Preferred caption placement. |
| `caption.width` | `number` | `—` | Caption area width. |
| `caption.height` | `number` | `—` | Caption area height. |
| `caption.breakpoint` | `number` | `—` | Viewport cutoff for switching placement logic. |
| `caption.render` | `({ item, index, isZoomed }) => ReactNode` | `—` | Custom caption renderer. |
| `slider.duration` | `number` | `25` | Fullscreen slider motion duration. |
| `slider.friction` | `number` | `0.68` | Fullscreen slider friction. |
| `slider.direction` | `"ltr" \| "rtl"` | `"ltr"` | Fullscreen slider interaction direction. |
| `zoom.clickZoomLevel` | `number` | `2.5` | Zoom level used for click-to-zoom. |
| `zoom.maxZoomLevel` | `number` | `3` | Maximum allowed zoom level. |
| `zoom.panDuration` | `number` | `43` | Pan settling duration. |
| `zoom.panFriction` | `number` | `0.68` | Pan friction. |
| `effects.introDuration` | `number` | `300` | Open animation duration. |
| `effects.introEasing` | `string` | `"cubic-bezier(.4,0,.22,1)"` | Open animation easing. |
| `effects.introFade` | `boolean` | `false` | Forces fade intro behavior. |
| `effects.slideFade` | `boolean` | `false` | Fades between fullscreen slides. |
| `effects.slideFadeDuration` | `number` | `120` | Slide-fade duration. |
| `effects.slideFadeEasing` | `string` | `"cubic-bezier(.4,0,.22,1)"` | Slide-fade easing. |
| `lazyLoad.images.enabled` | `boolean` | `—` | Enables fullscreen image lazy loading. |
| `lazyLoad.images.spinner` | `boolean \| ReactNode \| ((args) => ReactNode)` | `—` | Spinner override for fullscreen images. |
| `lazyLoad.images.spinnerClassName` | `string` | `—` | Spinner class for image slides. |
| `lazyLoad.images.spinnerStyle` | `React.CSSProperties` | `—` | Spinner style for image slides. |
| `lazyLoad.videos.enabled` | `boolean` | `—` | Enables fullscreen video lazy loading. |
| `lazyLoad.videos.spinner` | `boolean \| ReactNode \| ((args) => ReactNode)` | `—` | Spinner override for fullscreen videos. |
| `lazyLoad.videos.spinnerClassName` | `string` | `—` | Spinner class for video slides. |
| `lazyLoad.videos.spinnerStyle` | `React.CSSProperties` | `—` | Spinner style for video slides. |

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

### `GalleryApi`

`GalleryApi` is exported as a type from the package root. The package also exposes `GalleryCore` and `useGalleryCore()` for core-context access, but it does not expose a dedicated hook that returns a `GalleryApi`-typed instance directly.

| Method | Signature | Notes |
| --- | --- | --- |
| `rootNode` | `() => HTMLElement \| null` | Gallery root node. |
| `containerNode` | `() => HTMLElement \| null` | Moving or content container node. |
| `getViewportNode` | `() => HTMLDivElement \| null` | Viewport node. |
| `slideNodes` | `() => HTMLElement[]` | Current slide elements. |
| `onReady` | `(cb: (nodes: HTMLElement[]) => void) => () => void` | Subscribes to readiness. |
| `whenReady` | `() => Promise<HTMLElement[]>` | Promise form of readiness. |
| `isReady` | `() => boolean` | `true` after readiness resolves. |
| `scrollTo` | `(index: number, jump?: boolean) => void` | Navigates to a slide. |
| `scrollNext` | `(jump?: boolean) => void` | Advances to the next slide. |
| `scrollPrev` | `(jump?: boolean) => void` | Moves to the previous slide. |
| `canScrollNext` | `() => boolean` | Whether next navigation is available. |
| `canScrollPrev` | `() => boolean` | Whether previous navigation is available. |
| `getIndex` | `() => number` | Current active index. |
| `selectCell` | `(index: number, jump?: boolean) => void` | Selects a cell by canonical index. |
| `scrollProgress` | `() => number` | Scroll progress from `0` to `1`. |
| `cellsInView` | `() => number[]` | Canonical cells currently visible. |
| `append` | `(nodes: ReactNode \| ReactNode[]) => number` | Appends nodes and returns the new total count. |
| `prepend` | `(nodes: ReactNode \| ReactNode[]) => number` | Prepends nodes and returns the new total count. |
| `insert` | `(index: number, nodes: ReactNode \| ReactNode[]) => number` | Inserts nodes and returns the new total count. |
| `remove` | `(indexOrPredicate: number \| ((i: number) => boolean)) => number` | Removes items and returns the new total count. |
| `replace` | `(index: number, node: ReactNode) => void` | Replaces a node at an index. |
| `setItems` | `(nodes: ReactNode[]) => number` | Replaces all nodes and returns the new total count. |
| `onIndexChange` | `(cb: (i: number, meta: { mode: IndexMode }) => void) => () => void` | Subscribes to index changes. |
| `openFullscreenAt` | `({ index, method?, event? }) => void` | Programmatically opens fullscreen at an index. |

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
