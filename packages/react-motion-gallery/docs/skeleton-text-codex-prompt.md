# Skeleton Text Codex Prompt

Use these prompts when you want Codex, Cursor, Claude, or another repo-aware AI agent to build React Motion Gallery layouts or update skeleton authoring. Start by choosing the loading fidelity; browser-measured text is powerful, but it is not required for every skeleton.

## Workflow Decision Prompt

```text
Classify this React Motion Gallery request by layout intent and loading fidelity before writing code.

Modes:
- layoutOnly: real client-side layout, no skeleton
- layoutWithNonTextSkeleton: media/card/app-shell placeholders, no text measurement
- layoutWithHandAuthoredTextSkeleton: simple text skeleton values, no generated sidecar
- layoutWithBrowserMeasuredTextSkeleton: text skeleton must match real rendered responsive copy
- skeletonRetrofit: existing layout needs loading UI added or improved

After classification:
- choose the layout primitive or custom layout shape
- list which docs, demos, and MCP tools you will use
- skip browser skeleton tooling unless the chosen mode is layoutWithBrowserMeasuredTextSkeleton or the retrofit explicitly needs measured text
```

## Layout Only Prompt

```text
Build the requested React Motion Gallery layout without skeleton loading.

Requirements:
- inspect the app conventions and choose the best layout primitive or custom composition
- use public package imports and import react-motion-gallery/styles.css once in the app shell if needed
- inspect relevant demos before implementing
- do not add Skeleton imports, browser manifests, or generated sidecars
- summarize the layout primitive, demos, and imports used
```

## Non-Text Skeleton Prompt

```text
Build the requested layout with non-text skeleton loading.

Requirements:
- use Skeleton rect/media/stack/row nodes or gallery-specific skeleton wrappers
- reserve stable dimensions for media, cards, app-shell regions, and controls
- do not create text measurement manifests or generated sidecars
- keep the skeleton structure close to the final rendered layout
- summarize which loading regions are represented by skeleton shapes
```

## Hand-Authored Text Skeleton Prompt

```text
Build the requested layout with simple hand-authored text skeleton placeholders.

Requirements:
- use text skeleton nodes with hand-authored lines, barWidth, lastBarWidth, barHeight, and lineHeight values
- use responsive values only where they are obvious from the component design
- do not run browser analysis or generate a sidecar module
- keep object shapes stable and easy to diff
- summarize the hand-authored text skeleton assumptions
```

## Browser-Measured Text Prompt

```text
Update skeleton text authoring in <file> using the repo's browser-based skeleton text workflow.

Requirements:
- inspect the component and find every real rendered text node that the skeleton should model
- add or reuse stable selectors for those nodes when needed
- use flat manifest targets by default for sliders, grids, masonry, entries, thumbnails, flex layouts, app shells, cards, and custom UI
- add slider manifest mode only for equal-height card sliders that need canonical item measurement and row-height compensation
- add masonry readiness metadata only when target text is inside positioned masonry items
- add entries readiness metadata only when target text is inside Entries rows that expose mount/ready state
- create or update a browser manifest for the file
- use npm run --silent generate:skeleton-text-module with --analysis-output to inspect browser-measured results and regenerate the sidecar module in one scan
- prefer px barWidth values from browser measurement unless the file already relies on percentage caps
- keep runtime code readable and do not change unrelated rendering behavior

After measuring:
- regenerate the .generated.ts sidecar module
- patch the component to import and use the generated values
- for equal-height sliders, import and apply the generated rowHeightCompensation export too
- summarize the selectors, manifest entries, and generated outputs you used
- mention any assumptions about render mode, fonts, or page URLs
```

## Retrofit Prompt

```text
Retrofit skeleton loading into <file> without changing unrelated layout behavior.

Process:
- inspect the existing component, CSS, loading state, and final rendered content
- decide whether the retrofit needs non-text skeletons, hand-authored text skeletons, or browser-measured text skeletons
- preserve the existing visual layout and interaction behavior
- if browser-measured text is needed, follow the browser-measured prompt above
- summarize the selected fidelity level and why it was enough for the user goal
```

## MCP Tool Call Examples

Classify the workflow:

```json
{
  "goal": "Build a pricing card grid with simple skeleton loading",
  "hasExistingLayout": false,
  "layoutHint": "grid",
  "framework": "next"
}
```

Scaffold flat-target measured text for any DOM layout:

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

## When To Prefer The Non-AI Route

Use the manifest-driven generator directly when:

- the user wants deterministic regeneration without AI patching source
- the same skeleton authoring data will be regenerated repeatedly in CI or local scripts
- the project prefers importing sidecar-generated authoring objects over editing inline literals
