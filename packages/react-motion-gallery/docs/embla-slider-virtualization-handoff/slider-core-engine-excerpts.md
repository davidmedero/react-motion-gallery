# Slider Core Engine Excerpts

Source file:
`packages/react-motion-gallery/src/Gallery/slider/SliderCoreEngine.tsx`

This file is too large and React-specific to send wholesale. These are the
source ranges worth copying or reading during the Embla port.

| Range | Purpose | Embla Porting Note |
| --- | --- | --- |
| `453-506` | Renders a virtual window from `FixedVirtualTrackWindow.items`. | Replace React cloning with Embla/plugin DOM pooling or a virtual slide renderer. |
| `508-549` | Converts engine location to scroll offset and syncs a window by offset, location, or slide. | Embla should sync from actual scroll location, not only selected snap. |
| `551-574` | Produces absolute slide offsets. | Embla v1 can use `translateX`/`left` for fixed-size slides. |
| `576-610` | Reuses mounted nodes when only offsets changed. | Keep this idea to avoid unnecessary DOM churn on resize. |
| `612-647` | Tracks temporary loop rebase compensation. | Needed because loop engines rebase location vectors while virtual items still need visual continuity. |
| `1481-1561` | Enables native virtualization only for fixed-size horizontal sliders, computes metrics, sizes the track, and renders the first window. | This is the main eligibility and setup branch. |
| `1739-1790` | Builds synthetic geometry for every canonical slide while only a small DOM window exists. | Embla likely needs core support if synthetic geometry cannot be injected from a plugin. |
| `1965-2101` | Builds pages/snaps from synthetic virtual geometry and maps mounted elements back to canonical indexes. | Port this behavior to preserve navigation, grouped snaps, and slide-in-view logic. |
| `2356`, `2594`, `2648`, `2715`, `2739`, `2818-2839`, `3141`, `3195-3207`, `3232` | Calls that resync the virtual window during instant nav, progress UI, plugin pixel scroll, init, drag/animation, wheel, restore, and jump. | The plugin needs all movement paths covered or it will render stale windows. |
| `3714-3726` | Track style uses full virtual track span and removes physical gaps while slides are absolutely positioned. | Embla needs the scrollable track to keep full logical size even when DOM nodes are pooled. |

## Integration Contract

The RMG slider does three separate things when virtualization is active:

1. It renders only the current `FixedVirtualTrackWindow.items`.
2. It still builds logical geometry for every canonical slide.
3. It resyncs the rendered window whenever scroll location changes.

That split is the important part for Embla. The React details are incidental.

## Fixed-Size Eligibility

RMG currently falls back unless all of these are true:

- `virtualization.enabled === true`.
- Horizontal axis.
- Not center aligned.
- Not auto-height.
- Fixed `cellsPerSlide`.
- Resolved fixed virtual metrics exist.
- `slideCount > threshold`.

For Embla v1, use the same narrow eligibility. It keeps the PR small and avoids
variable-size geometry questions.

## Loop Rebase Detail

The virtual helper `accumulateFixedVirtualTrackRebaseOffset(current, loopShift)`
compensates in the opposite direction of the engine rebase. RMG applies that
temporary CSS variable before forcing the new virtual window, then clears it
after the new slides mount.

Porting requirement: whenever Embla moves loop vectors or normalizes scroll
location, the virtual track must preserve visual continuity for the current DOM
pool.
