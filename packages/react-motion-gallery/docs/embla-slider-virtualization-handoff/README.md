# Embla Slider Virtualization Handoff

This folder is a focused handoff package for Embla Carousel contributors who want
to evaluate a fixed-stride virtualization plugin or a small core hook to support
one. It intentionally avoids copying the whole React Motion Gallery slider.

Embla references:

- Plugin API: https://www.embla-carousel.com/api/plugins/
- Methods and `internalEngine`: https://www.embla-carousel.com/api/methods/

## Files To Send

- `source/virtualTrack.ts`
  - Verbatim copy of the reusable fixed-track virtualization algorithm.
  - This is the primary file to port first.
- `source/virtualTrack.test.ts`
  - Verbatim unit tests for the algorithm.
  - These should become the first Embla-side tests.
- `source/layoutStability.slider-support.ts`
  - Verbatim copy of slider layout helpers.
  - Only the fixed-cell size, content span, grouping, contained snap, and loop
    helpers are relevant to the Embla handoff.
- `slider-core-engine-excerpts.md`
  - Exact source ranges in `SliderCoreEngine.tsx` that show how the algorithm is
    integrated into rendering, measurement, scrolling, and loop rebasing.
- `slider-virtualization-test-excerpts.md`
  - Integration scenarios that should be ported to Embla tests.
- `optional-fullscreen-reference.md`
  - Simpler one-slide-per-view reference that reuses the same helper.

## Recommended Embla API

```ts
Virtual({
  enabled = true,
  overscan = 2,
  threshold = 40,
})
```

The recommended v1 should stay fixed-size only:

- Horizontal axis.
- Uniform slide size or explicit slide size.
- Optional loop.
- Optional grouped snaps.

Treat variable-width slides, center alignment, vertical axis, and auto-height as
non-goals unless Embla maintainers prefer a larger core change.

## PR Shape

Start with an exploratory `embla-carousel-virtual` plugin and a short feasibility
note. If a plugin cannot safely replace slide DOM and synthetic geometry through
public APIs, propose a small core hook that lets a plugin provide virtual slide
geometry before Embla computes slide rects, snaps, slides in view, and loop state.

Keep the first PR small:

- Port `source/virtualTrack.ts`.
- Add direct unit tests from `source/virtualTrack.test.ts`.
- Add a minimal fixed-size plugin proof.
- Use Embla concepts for integration: `slideNodes`, `internalEngine`,
  `scrollSnaps`, `scrollProgress`, `reInit`, and loop handling.

## Test Plan

- Unit test the fixed virtual-track math directly.
- Render fewer DOM nodes than total slides for large fixed-size tracks.
- Confirm loop windows include negative and overflow virtual indexes that map to
  canonical slide indexes.
- Confirm wheel/free-scroll updates use scroll offset, not only selected index.
- Confirm threshold fallback renders the full track.
- Confirm cleanup and `reInit` restore normal Embla behavior.

## Not Included

Do not send these as primary source:

- `SliderEngine.tsx` and `Slider.tsx`, which are legacy/export noise for this
  task.
- Grid, masonry, and entries virtualization, which solve different windowing
  problems.
- Lazy-load, video, fullscreen plugin plumbing, and most CSS.
