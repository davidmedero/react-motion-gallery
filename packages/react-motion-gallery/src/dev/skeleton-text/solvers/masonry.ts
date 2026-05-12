import { resolveNumberFromResponsive, type BreakpointMap } from "../../../Gallery/shared/responsive";
import type { SkeletonNode } from "../../../Gallery/shared/skeleton/layout";
import type { MasonryTextAnalysisLayoutConfig } from "../types";
import {
  collectTextPathBreakpoints,
  resolveTextNodeWidthFromPath,
  resolveWrapContentWidth,
} from "../widths";
import {
  collectLayoutWidthResolverBreakpoints,
  collectResponsiveMasonrySpanBreakpoints,
  collectResponsiveNumberBreakpoints,
  resolveLayoutWidthAtViewport,
  resolveMasonrySpanAtViewport,
  uniqueSorted,
} from "./shared";

export function createMasonryTextWidthSolver(args: {
  layoutConfig: MasonryTextAnalysisLayoutConfig;
  itemNode: SkeletonNode;
  childIndexes: number[];
  breakpointMap: BreakpointMap;
  layoutWidthPx?: number;
  layoutWidthResolver?: MasonryTextAnalysisLayoutConfig["layoutWidthResolver"];
}) {
  const { layoutConfig, itemNode, childIndexes, breakpointMap } = args;
  const breakpoints = new Set<number>([0]);

  collectResponsiveNumberBreakpoints(layoutConfig.columns, breakpointMap, breakpoints);
  collectResponsiveNumberBreakpoints(layoutConfig.gap, breakpointMap, breakpoints);
  collectLayoutWidthResolverBreakpoints(
    args.layoutWidthResolver ?? layoutConfig.layoutWidthResolver,
    breakpoints
  );
  collectResponsiveMasonrySpanBreakpoints(layoutConfig.itemSpan, breakpointMap, breakpoints);
  for (const breakpoint of collectTextPathBreakpoints({
    root: itemNode,
    childIndexes,
    wrapStyle: layoutConfig.itemWrapStyle,
    breakpointMap,
  })) {
    breakpoints.add(breakpoint);
  }

  const widthAtViewport = (viewportWidth: number) => {
    const layoutWidth = resolveLayoutWidthAtViewport({
      viewportWidth,
      layoutWidthPx: args.layoutWidthPx ?? layoutConfig.layoutWidthPx,
      layoutWidthResolver:
        args.layoutWidthResolver ?? layoutConfig.layoutWidthResolver,
    });
    const columnCount = Math.max(
      1,
      Math.round(resolveNumberFromResponsive(layoutConfig.columns, 1, viewportWidth, breakpointMap))
    );
    const gap = resolveNumberFromResponsive(layoutConfig.gap, 0, viewportWidth, breakpointMap);
    const span = resolveMasonrySpanAtViewport({
      span: layoutConfig.itemSpan,
      columnCount,
      viewportWidth,
      breakpointMap,
    });
    const columnWidth =
      (layoutWidth - Math.max(0, columnCount - 1) * gap) / Math.max(1, columnCount);
    const itemOuterWidth =
      span >= columnCount ? layoutWidth : columnWidth * span + gap * Math.max(0, span - 1);
    const wrapWidth = resolveWrapContentWidth(
      itemOuterWidth,
      layoutConfig.itemWrapStyle,
      viewportWidth,
      breakpointMap,
      "masonry.itemWrapStyle"
    );

    return resolveTextNodeWidthFromPath({
      root: itemNode,
      childIndexes,
      availableWidth: wrapWidth,
      viewportWidth,
      breakpointMap,
    });
  };

  return {
    breakpoints: uniqueSorted(breakpoints),
    widthAtViewport,
  };
}
