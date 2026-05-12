# Skeleton Text Authoring

Skeleton text authoring is now browser-only.

The supported workflow measures real DOM text in a live page with headless Chrome, then emits `lines`, `barWidth`, `lastBarWidth`, and optionally `barHeight`/`lineHeight` values that match the existing skeleton authoring shapes.

## Runtime scope

This tooling lives under `src/dev/skeleton-text/` and is meant for development-time authoring assistance.

- It is not exported as part of the public package API.
- It is not intended for production client execution.
- It optimizes for accuracy and deterministic regeneration over speed.

## Supported Workflow

The browser analyzer:

1. opens a live page URL in headless Chrome
2. scans the requested viewport range
3. measures real text line boxes from the DOM
4. optionally measures the text metrics needed for skeleton bar height and line box height
5. records breakpoints according to the chosen strategy
6. emits plain JS/TS object literals for skeleton authoring

## Browser manifest

Both supported scripts consume a browser manifest.

```json
{
  "url": "http://127.0.0.1:3000/demos?demo=grid-template-columns&skeletonMeasure=content",
  "outputFile": "./grid-template-columns.skeleton-text.generated.ts",
  "moduleExportName": "gridTemplateColumnsSkeletonText",
  "viewportMin": 320,
  "viewportMax": 1600,
  "viewportHeight": 1800,
  "viewportWorkers": 1,
  "settleMs": 120,
  "stableGeometryFrames": 3,
  "lineWrapGuardPx": 0,
  "includeTextMetrics": true,
  "breakpointStrategy": "lineChanges",
  "barWidthUnit": "px",
  "responsiveBy": "viewport",
  "targets": [
    {
      "exportName": "leadTrackTitle",
      "selector": "[data-skeleton-text-id='leadTrackTitle']"
    },
    {
      "exportName": "leadTrackBody",
      "selector": "[data-skeleton-text-id='leadTrackBody']",
      "widthMode": "both"
    }
  ]
}
```

For equal-height card sliders, use slider mode instead of flat targets:

```json
{
  "url": "http://127.0.0.1:3000/demos?demo=slider-cards&skeletonMeasure=content",
  "outputFile": "./slider-cards.skeleton-text.generated.ts",
  "moduleExportName": "sliderCardsSkeletonText",
  "viewportMin": 320,
  "viewportMax": 1600,
  "breakpointStrategy": "lineChanges",
  "barWidthUnit": "px",
  "slider": {
    "itemSelector": "[data-skeleton-item-id]",
    "canonicalItemIdAttribute": "data-skeleton-item-id",
    "roles": [
      {
        "role": "title",
        "selector": "[data-skeleton-role='title']",
        "barHeight": 13,
        "lineHeight": 1.6
      },
      {
        "role": "price",
        "selector": "[data-skeleton-role='price']",
        "barHeight": 13,
        "lineHeight": 1.4,
        "style": { "marginTop": "3px" }
      }
    ],
    "trackedItems": [
      {
        "itemId": "cardOne",
        "roles": [
          { "role": "title", "exportName": "cardOneTitle" },
          { "role": "price", "exportName": "cardOnePrice" }
        ]
      }
    ],
    "rowHeightCompensationExportName": "sliderCardsRowHeightCompensation"
  }
}
```

For masonry demos, keep explicit text `targets` and add masonry readiness metadata
so browser analysis waits for the positioned masonry geometry to settle before
sampling line boxes:

```json
{
  "url": "http://127.0.0.1:3000/demos?demo=masonry-spans&skeletonMeasure=content",
  "viewportMin": 320,
  "viewportMax": 1340,
  "settleMs": 250,
  "stableGeometryFrames": 12,
  "masonry": {
    "anchorSelector": "[data-skeleton-text-id='masonrySpansItem01Body']",
    "itemSelector": "[data-rmg-idx]",
    "expectedItemCount": 8,
    "columns": { "0": 1, "760": 2, "1160": 4 }
  },
  "targets": [
    {
      "exportName": "masonrySpansItem01Body",
      "selector": "[data-skeleton-text-id='masonrySpansItem01Body']"
    }
  ]
}
```

### Key fields

- `url`: the live page to measure
- `targets`: selectors for the real rendered text nodes
- `slider`: slider-wide browser analysis for equal-height card sliders
  - measures all canonical items, ignoring clones
  - still emits tracked slot text exports for the visible items you care about
  - also emits a separate responsive numeric export for row-height compensation
- `masonry`: masonry-specific readiness metadata
  - `itemSelector` selects positioned masonry items, usually `[data-rmg-idx]`
  - `rootSelector` directly selects the masonry root when available
  - `anchorSelector` can be used instead of `rootSelector`; the analyzer finds
    its nearest masonry item and then that item's parent root
  - `expectedItemCount` requires the root to expose exactly that many items
  - `columns` maps viewport breakpoints to expected `--rmg-cols` values
  - this mode does not replace `targets`; it only waits for masonry item
    rects, root height, columns, and gap to stabilize before target sampling
- `breakpointStrategy`
  - `"lineChanges"` keeps exact values only where line count changes
  - `"lineOrBarChanges"` also keeps bar-width-only transitions
- `barWidthUnit`
  - `"percent"` emits percentage caps
  - `"px"` emits pixel caps for `width: 100%; max-width: ...`
- `responsiveBy`
  - `"viewport"` emits regular viewport media-query breakpoints
  - `"container"` emits container-width breakpoints and generated entries include `responsiveBy: "container"` so skeleton text renders with CSS container queries
  - use `"container"` for text inside responsive grids where wrapping follows the actual card/text box width more closely than the global viewport
- `viewportWorkers`
  - optional number of parallel browser workers to split the viewport range across
  - defaults to `1` for a deterministic serial scan
  - values above `1` reuse one headless Chrome process with one fresh target/page per measured viewport
- `settleMs`
  - optional post-font settle wait before final readiness and geometry checks
  - each viewport uses a fresh page, sets the viewport before navigation, waits for `document.fonts.ready`, waits this delay, then waits for any `readyExpression` and stable target geometry signatures
- `stableGeometryFrames`
  - optional number of consecutive polling ticks that target geometry must remain unchanged before sampling
  - defaults to `3`
  - increase this for layouts with extra client measurement passes, such as masonry pages that seed item heights and then update after `ResizeObserver`
- `readyExpression`
  - optional browser expression string that must evaluate truthy before stable geometry is sampled
  - use this for demos with a known client-only responsive state, such as masonry columns that briefly render in an intermediate layout before the final breakpoint state is applied
- `lineWrapGuardPx`
  - optional conservative text-wrap inset used during browser measurement
  - defaults to `0` for exact DOM line counts
  - values above `0` clone the text at a narrower width and may intentionally report extra wrapped lines near thresholds
- `includeTextMetrics`
  - optional boolean that emits generated `barHeight` and `lineHeight` beside each text entry
  - `barHeight` is measured from the target's computed `font-size` in pixels
  - `lineHeight` is the target's used line box height divided by that measured `barHeight`
  - this makes `barHeight * lineHeight * lines` match the real content line box height, including responsive typography changes
  - leave it unset when you want to keep hand-authored skeleton text heights

## Commands

Inspect measurements as JSON without writing a sidecar:

```bash
npm run --silent analyze:skeleton-text -- --input ./path/to/skeleton-text.browser.manifest.json
```

Generate a `.generated.ts` sidecar module:

```bash
npm run --silent generate:skeleton-text-module -- --input ./path/to/skeleton-text.browser.manifest.json
```

Generate and save the inspection JSON from the same browser scan:

```bash
npm run --silent generate:skeleton-text-module -- --input ./path/to/skeleton-text.browser.manifest.json --analysis-output ./path/to/skeleton-text.measurements.json
```

Generate and print the inspection JSON from the same browser scan:

```bash
npm run --silent generate:skeleton-text-module -- --input ./path/to/skeleton-text.browser.manifest.json --print-analysis
```

You can also override the output file:

```bash
npm run --silent generate:skeleton-text-module -- --input ./path/to/skeleton-text.browser.manifest.json --output ./path/to/Component.skeleton-text.generated.ts
```

If you need both the sidecar and measurement details, prefer `generate:skeleton-text-module` with `--analysis-output` or `--print-analysis` instead of running `analyze:skeleton-text` first. Running both commands scans the full viewport range twice.

## Generated module shape

```ts
/* This file is autogenerated by generate_skeleton_text_module.ts. */
/* eslint-disable */

export const leadTrackTitle = {
  lines: {
    0: 2,
    395: 1,
  },
  barWidth: {
    0: ["204px", "76px"],
    395: "284px",
  },
  barHeight: 16.32,
  lineHeight: 1.2,
  responsiveBy: "container",
};

export const templateColumnsSkeletonText = {
  leadTrackTitle,
};
```

Slider mode adds a separate numeric export alongside the text entries:

```ts
export const sliderCardsRowHeightCompensation: number | Record<number, number> = {
  0: 0,
  500: 20.8,
  1200: 41.6,
};
```

## Bar width semantics

`barWidth` now acts like a cap, not a literal width.

Skeleton text lines render with:

- `width: 100%`
- `max-width: <barWidth>`

This lets browser-measured `px` values map cleanly onto the skeleton bars while still supporting percentage values.

## AI / Codex workflow

For AI-driven updates:

1. add stable selectors to the real rendered text nodes
2. for sliders, also add a stable canonical item id attribute
3. create or update a browser manifest
4. run `generate:skeleton-text-module` with `--analysis-output` when you need to inspect the measurement output
5. import the generated values into the component

## Slider mode

Slider mode is meant for equal-height card sliders where unseen canonical items can still increase the required row height.

- Canonical items are measured from the live DOM, and clones are filtered out.
- Tracked items still emit exact `lines` and `barWidth` exports for the slots you author directly.
- The analyzer also emits `rowHeightCompensation`, which is:
  - `max total text height across all canonical items`
  - minus
  - `max total text height across the tracked items currently visible in the viewport`
- Runtime slider skeleton height should reserve that compensation at the row level.
- For card-style sliders, set `itemWrapStyle.height: "100%"` so the reserved height stays inside the card shell.

## Caveats

- This path requires a live page and headless Chrome.
- If the page does not render the real text immediately, add a query param or render mode that forces content for measurement.
- Browser measurement depends on the rendered page state, so selector mistakes or missing font loading can skew results.
