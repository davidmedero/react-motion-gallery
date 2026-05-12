import type { CSSProperties } from "react";

export const DEMO_CANVAS_SHELL_GEOMETRY = {
  shellMaxWidthPx: 1280,
  shellMarginDesktopPx: 48,
  shellMarginCompactPx: 28,
  shellMarginBreakpointPx: 640,
  layoutStackBreakpointPx: 767,
  sidebarWidthPx: 250,
  layoutGapPx: 24,
  canvasPaddingMinPx: 12,
  canvasPaddingMaxPx: 20,
  canvasPaddingViewportRatio: 0.02,
  canvasBorderWidthPx: 1,
} as const;

export const DEMO_CANVAS_SHELL_SELECTOR = "[data-demo-canvas-shell]";

type DemoCanvasShellCssVars = CSSProperties & Record<`--${string}`, string>;

function px(value: number) {
  return `${value}px`;
}

export const DEMO_CANVAS_SHELL_CSS_VARS: DemoCanvasShellCssVars = {
  "--demos-shell-max-width": px(DEMO_CANVAS_SHELL_GEOMETRY.shellMaxWidthPx),
  "--demos-shell-margin-desktop": px(
    DEMO_CANVAS_SHELL_GEOMETRY.shellMarginDesktopPx
  ),
  "--demos-shell-margin-compact": px(
    DEMO_CANVAS_SHELL_GEOMETRY.shellMarginCompactPx
  ),
  "--demos-shell-margin-breakpoint": px(
    DEMO_CANVAS_SHELL_GEOMETRY.shellMarginBreakpointPx
  ),
  "--demos-layout-stack-breakpoint": px(
    DEMO_CANVAS_SHELL_GEOMETRY.layoutStackBreakpointPx
  ),
  "--demos-layout-sidebar-width": px(
    DEMO_CANVAS_SHELL_GEOMETRY.sidebarWidthPx
  ),
  "--demos-layout-gap": px(DEMO_CANVAS_SHELL_GEOMETRY.layoutGapPx),
  "--demos-layout-columns-desktop":
    "var(--demos-layout-sidebar-width) minmax(0, 1fr)",
  "--demos-layout-columns-stacked": "minmax(0, 1fr)",
  "--demos-layout-columns": "var(--demos-layout-columns-desktop)",
  "--demos-shell-outer-margin": "var(--demos-shell-margin-desktop)",
  "--demos-demo-canvas-padding-min": px(
    DEMO_CANVAS_SHELL_GEOMETRY.canvasPaddingMinPx
  ),
  "--demos-demo-canvas-padding-max": px(
    DEMO_CANVAS_SHELL_GEOMETRY.canvasPaddingMaxPx
  ),
  "--demos-demo-canvas-padding-ratio": String(
    DEMO_CANVAS_SHELL_GEOMETRY.canvasPaddingViewportRatio
  ),
  "--demos-demo-canvas-border-width": px(
    DEMO_CANVAS_SHELL_GEOMETRY.canvasBorderWidthPx
  ),
};

export const DEMO_CANVAS_SHELL_RESPONSIVE_CSS = `
@media (max-width:${DEMO_CANVAS_SHELL_GEOMETRY.shellMarginBreakpointPx}px) {
  ${DEMO_CANVAS_SHELL_SELECTOR} {
    --demos-shell-outer-margin: var(--demos-shell-margin-compact);
  }
}

@media (max-width:${DEMO_CANVAS_SHELL_GEOMETRY.layoutStackBreakpointPx}px) {
  ${DEMO_CANVAS_SHELL_SELECTOR} {
    --demos-layout-columns: var(--demos-layout-columns-stacked);
  }
}
`;
