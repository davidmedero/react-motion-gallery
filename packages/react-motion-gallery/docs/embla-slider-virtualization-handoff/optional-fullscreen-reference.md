# Optional Fullscreen Reference

Fullscreen is not the primary Embla handoff target. It is useful only because it
shows the same virtual-track helper in a simpler one-slide-per-view environment.

Source file:
`packages/react-motion-gallery/src/Gallery/fullscreen/FullscreenSlider.tsx`

Useful ranges:

| Range | Purpose |
| --- | --- |
| `751-829` | Measures viewport span and resolves one-slide-per-view virtual metrics. |
| `831-871` | Applies and clears loop rebase compensation. |
| `873-929` | Clears, renders, and syncs a fullscreen virtual window. |
| `3485-3545` | Creates render-window items from `FixedVirtualTrackWindow.items`. |

Related renderer:
`packages/react-motion-gallery/src/Gallery/fullscreen/renderFullscreenSlides.tsx:2461-2545`

Related tests:
`packages/react-motion-gallery/src/Gallery/fullscreen/FullscreenSliderVirtualization.test.tsx:529-592`

Use this reference when explaining the algorithm to Embla maintainers:

- One logical slide per viewport.
- `cellsPerSlide` is always `1`.
- The window still maps `virtualIndex` to `canonicalIndex`.
- Threshold fallback renders the full wrapped track.

Do not copy fullscreen-specific media, zoom, lazy-load, or dialog behavior into
the Embla PR.
