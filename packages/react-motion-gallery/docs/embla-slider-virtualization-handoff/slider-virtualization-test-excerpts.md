# Slider Virtualization Test Excerpts

Source files:

- `packages/react-motion-gallery/src/Gallery/shared/virtualTrack.test.ts`
- `packages/react-motion-gallery/src/Gallery/slider/SliderCoreDefault.test.tsx`

## Unit Tests To Port First

Port all tests from `source/virtualTrack.test.ts`. They cover:

- Negative and overflow virtual index normalization.
- Fixed-stride geometry from viewport, cells per slide, cell size, and gap.
- Viewport-stale metric detection.
- Non-loop clamping.
- Loop windows with negative and overflow virtual indexes.
- Free-scroll coordinates.
- Minimum viewport-sized overscan.
- Window equality with and without offset changes.
- Threshold fallback.
- Loop rebase compensation.

## Integration Tests To Port

Use these RMG test ranges as behavior references:

| Range | Test | Required Embla Behavior |
| --- | --- | --- |
| `SliderCoreDefault.test.tsx:224-251` | `virtualizes fixed-stride loop sliders with bounded shells` | Large looped fixed-size carousel renders a bounded window and maps a negative virtual index to the correct canonical slide. |
| `SliderCoreDefault.test.tsx:279-304` | `virtualized arrows preserve logical indexes without rendering every slide` | Navigation changes selected index while rendered node count remains below total slide count. |
| `SliderCoreDefault.test.tsx:306-344` | `virtualized loop seam keeps mounted shells and reports built nodes` | Jumping near loop edges and navigating across them keeps a non-empty bounded DOM window. |
| `SliderCoreDefault.test.tsx:346-382` | `virtualized free-scroll updates the rendered window from wheel coordinates` | Wheel/free-scroll movement updates rendered virtual indexes from scroll offset. |
| `SliderCoreDefault.test.tsx:384-400` | `falls back to full rendering for variable slider layouts` | Unsupported layouts warn/fallback instead of partially virtualizing. |

## Suggested Embla-Specific Additions

- `reInit` with changed slides destroys and rebuilds the virtual registry.
- Destroying the plugin restores DOM styles and event subscriptions.
- Loop on/off option changes rebuild the virtual window.
- Plugin-disabled mode behaves exactly like normal Embla.
- Public methods such as `slideNodes()`, `slidesInView()`, and selected snap
  behavior remain documented and predictable while virtualization is enabled.
