import { describe, expect, test } from "vitest";
import { BREAKPOINT_MAP } from "../../Gallery/shared/responsive";
import type { SkeletonNode } from "../../Gallery/shared/skeleton/layout";
import { createEntriesTextWidthSolver } from "./solvers/entries";
import { createGridTextWidthSolver } from "./solvers/grid";
import { createMasonryTextWidthSolver } from "./solvers/masonry";
import { createSliderTextWidthSolver } from "./solvers/slider";
import { resolveTextNodePath } from "./tree";

function makeTextNode(style?: Extract<SkeletonNode, { kind: "text" }>["style"]): SkeletonNode {
  return {
    kind: "text",
    barHeight: 12,
    lineHeight: 1.6,
    style,
  };
}

describe("layout text width solvers", () => {
  test("resolves grid item text width across responsive columns and spans", () => {
    const itemNode: SkeletonNode = {
      kind: "stack",
      style: { padding: 20 },
      children: [makeTextNode({ width: "100%" })],
    };
    const { childIndexes } = resolveTextNodePath(itemNode, 0);
    const solver = createGridTextWidthSolver({
      layoutConfig: {
        columns: { 0: 1, 900: 4 },
        gap: { 0: 20, 900: 24 },
        itemSpan: { 0: "full", 900: 2 },
        itemWrapStyle: {
          padding: 16,
          border: "2px solid #000",
        },
      },
      itemNode,
      childIndexes,
      breakpointMap: BREAKPOINT_MAP,
    });

    expect(solver.widthAtViewport(500)).toBeCloseTo(424);
    expect(solver.widthAtViewport(1000)).toBeCloseTo(412);
    expect(solver.breakpoints).toEqual([0, 900]);
  });

  test("resolves grid templateColumns widths using the item's responsive column start", () => {
    const itemNode: SkeletonNode = {
      kind: "stack",
      style: { padding: 14 },
      children: [makeTextNode({ width: "100%" })],
    };
    const { childIndexes } = resolveTextNodePath(itemNode, 0);

    const wideLaneSolver = createGridTextWidthSolver({
      layoutConfig: {
        templateColumns: {
          0: "minmax(0, 1fr)",
          820: "minmax(0, 1.18fr) minmax(220px, 0.82fr)",
          1200:
            "minmax(0, 1.42fr) minmax(148px, 0.48fr) minmax(0, 1.08fr) minmax(180px, 0.42fr)",
        },
        gap: { 0: 12, 820: 16, 1200: 18 },
        itemSpan: { 0: "full", 820: 1, 1200: 1 },
        itemColumnStart: { 0: 1, 820: 1, 1200: 3 },
      },
      itemNode,
      childIndexes,
      breakpointMap: BREAKPOINT_MAP,
    });

    const narrowRailSolver = createGridTextWidthSolver({
      layoutConfig: {
        templateColumns: {
          0: "minmax(0, 1fr)",
          820: "minmax(0, 1.18fr) minmax(220px, 0.82fr)",
          1200:
            "minmax(0, 1.42fr) minmax(148px, 0.48fr) minmax(0, 1.08fr) minmax(180px, 0.42fr)",
        },
        gap: { 0: 12, 820: 16, 1200: 18 },
        itemSpan: { 0: "full", 820: 1, 1200: 1 },
        itemColumnStart: { 0: 1, 820: 2, 1200: 4 },
      },
      itemNode,
      childIndexes,
      breakpointMap: BREAKPOINT_MAP,
    });

    expect(wideLaneSolver.widthAtViewport(900)).toBeCloseTo(493.56);
    expect(narrowRailSolver.widthAtViewport(900)).toBeCloseTo(334.44);
    expect(wideLaneSolver.widthAtViewport(1300)).toBeCloseTo(358.34);
    expect(narrowRailSolver.widthAtViewport(1300)).toBeCloseTo(152);
    expect(wideLaneSolver.breakpoints).toEqual([0, 820, 1200]);
    expect(narrowRailSolver.breakpoints).toEqual([0, 820, 1200]);
  });

  test("resolves slider text width for fit and peek layouts", () => {
    const itemNode: SkeletonNode = {
      kind: "stack",
      style: { padding: 10 },
      children: [makeTextNode({ width: "100%" })],
    };
    const { childIndexes } = resolveTextNodePath(itemNode, 0);

    const peekSolver = createSliderTextWidthSolver({
      layoutConfig: {
        cellsPerSlide: { 0: 1, 900: 3 },
        style: {
          padding: "0 20px",
          gap: 12,
        },
        itemWrapStyle: {
          width: "260px",
          border: "1px solid #000",
        },
        mode: "peek",
      },
      itemNode,
      childIndexes,
      breakpointMap: BREAKPOINT_MAP,
    });

    const fitSolver = createSliderTextWidthSolver({
      layoutConfig: {
        cellsPerSlide: 2,
        style: {
          padding: "0 20px",
          gap: 20,
        },
        itemWrapStyle: {
          maxWidth: "300px",
          border: "1px solid #000",
        },
        mode: "fit",
      },
      itemNode,
      childIndexes,
      breakpointMap: BREAKPOINT_MAP,
    });

    expect(peekSolver.widthAtViewport(600)).toBeCloseTo(238);
    expect(peekSolver.widthAtViewport(1000)).toBeCloseTo(238);
    expect(peekSolver.breakpoints).toEqual([0, 900]);

    expect(fitSolver.widthAtViewport(1000)).toBeCloseTo(278);
    expect(fitSolver.breakpoints).toEqual([0]);
  });

  test("resolves masonry item widths from responsive columns and spans", () => {
    const itemNode: SkeletonNode = {
      kind: "stack",
      style: { padding: 5 },
      children: [makeTextNode({ width: "100%" })],
    };
    const { childIndexes } = resolveTextNodePath(itemNode, 0);
    const solver = createMasonryTextWidthSolver({
      layoutConfig: {
        columns: { 0: 2, 800: 4 },
        gap: 16,
        itemSpan: { 0: 1, 800: 2 },
        itemWrapStyle: {
          padding: 10,
        },
      },
      itemNode,
      childIndexes,
      breakpointMap: BREAKPOINT_MAP,
    });

    expect(solver.widthAtViewport(600)).toBeCloseTo(262);
    expect(solver.widthAtViewport(900)).toBeCloseTo(412);
    expect(solver.breakpoints).toEqual([0, 800]);
  });

  test("resolves grid text widths inside the demo canvas shell instead of using full viewport width", () => {
    const itemNode: SkeletonNode = {
      kind: "stack",
      style: { padding: 5 },
      children: [makeTextNode({ width: "100%" })],
    };
    const { childIndexes } = resolveTextNodePath(itemNode, 0);
    const solver = createGridTextWidthSolver({
      layoutConfig: {
        columns: 2,
        gap: 20,
        itemSpan: 1,
        itemWrapStyle: {
          padding: 10,
        },
      },
      itemNode,
      childIndexes,
      breakpointMap: BREAKPOINT_MAP,
      layoutWidthResolver: {
        kind: "demoCanvasShell",
        shellMaxWidthPx: 1280,
        shellMarginDesktopPx: 48,
        shellMarginCompactPx: 28,
        shellMarginBreakpointPx: 640,
        stackBreakpointPx: 767,
        sidebarWidthPx: 250,
        layoutGapPx: 24,
        canvasPaddingMinPx: 12,
        canvasPaddingMaxPx: 20,
        canvasPaddingViewportRatio: 0.02,
        canvasBorderWidthPx: 1,
      },
    });

    expect(solver.widthAtViewport(500)).toBeCloseTo(183);
    expect(solver.widthAtViewport(800)).toBeCloseTo(182);
    expect(solver.widthAtViewport(1500)).toBeCloseTo(442);
    expect(solver.breakpoints).toEqual([0, 600, 640, 767, 1000, 1308, 1328]);
  });

  test("treats entries layouts as full-width rows unless a fixed layout width is supplied", () => {
    const itemNode: SkeletonNode = {
      kind: "row",
      style: { gap: 20 },
      children: [
        {
          kind: "col",
          children: [makeTextNode({ width: "100%" })],
        },
        {
          kind: "rect",
          style: { width: 100, height: 20 },
        },
      ],
    };
    const { childIndexes } = resolveTextNodePath(itemNode, 0);
    const solver = createEntriesTextWidthSolver({
      layoutConfig: {
        layoutWidthPx: 700,
      },
      itemNode,
      childIndexes,
      breakpointMap: BREAKPOINT_MAP,
    });

    expect(solver.widthAtViewport(1200)).toBeCloseTo(580);
    expect(solver.breakpoints).toEqual([0]);
  });
});
