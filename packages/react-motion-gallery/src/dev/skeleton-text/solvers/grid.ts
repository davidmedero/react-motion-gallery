import { resolveNumberFromResponsive, type BreakpointMap } from "../../../Gallery/shared/responsive";
import type { SkeletonNode } from "../../../Gallery/shared/skeleton/layout";
import type { GridTextAnalysisLayoutConfig } from "../types";
import {
  collectTextPathBreakpoints,
  resolveTextNodeWidthFromPath,
  resolveWrapContentWidth,
} from "../widths";
import {
  collectLayoutWidthResolverBreakpoints,
  collectResponsiveGridSpanBreakpoints,
  collectResponsiveNumberBreakpoints,
  collectResponsiveTemplateColumnBreakpoints,
  resolveLayoutWidthAtViewport,
  resolveGridColumnStartAtViewport,
  resolveGridColumnCount,
  resolveGridSpanAtViewport,
  resolveGridTemplateTrackWidths,
  uniqueSorted,
} from "./shared";

export function createGridTextWidthSolver(args: {
  layoutConfig: GridTextAnalysisLayoutConfig;
  itemNode: SkeletonNode;
  childIndexes: number[];
  breakpointMap: BreakpointMap;
  layoutWidthPx?: number;
  layoutWidthResolver?: GridTextAnalysisLayoutConfig["layoutWidthResolver"];
}) {
  const { layoutConfig, itemNode, childIndexes, breakpointMap } = args;
  const breakpoints = new Set<number>([0]);

  collectResponsiveNumberBreakpoints(layoutConfig.columns, breakpointMap, breakpoints);
  collectResponsiveNumberBreakpoints(layoutConfig.gap, breakpointMap, breakpoints);
  collectResponsiveNumberBreakpoints(layoutConfig.itemColumnStart, breakpointMap, breakpoints);
  collectLayoutWidthResolverBreakpoints(
    args.layoutWidthResolver ?? layoutConfig.layoutWidthResolver,
    breakpoints
  );
  collectResponsiveGridSpanBreakpoints(layoutConfig.itemSpan, breakpointMap, breakpoints);
  collectResponsiveTemplateColumnBreakpoints(
    layoutConfig.templateColumns,
    breakpointMap,
    breakpoints
  );
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
    const columnCount = resolveGridColumnCount({
      columns: layoutConfig.columns,
      templateColumns: layoutConfig.templateColumns,
      viewportWidth,
      breakpointMap,
    });
    const gap = resolveNumberFromResponsive(layoutConfig.gap, 0, viewportWidth, breakpointMap);
    const span = resolveGridSpanAtViewport({
      span: layoutConfig.itemSpan,
      columnCount,
      viewportWidth,
      breakpointMap,
    });
    const itemOuterWidth = (() => {
      if (!layoutConfig.templateColumns) {
        const columnWidth =
          (layoutWidth - Math.max(0, columnCount - 1) * gap) / Math.max(1, columnCount);
        return span >= columnCount
          ? layoutWidth
          : columnWidth * span + gap * Math.max(0, span - 1);
      }

      const trackWidths = resolveGridTemplateTrackWidths({
        templateColumns: layoutConfig.templateColumns,
        layoutWidth,
        gap,
        viewportWidth,
        breakpointMap,
      });
      const columnStart = resolveGridColumnStartAtViewport({
        columnStart: layoutConfig.itemColumnStart,
        viewportWidth,
        breakpointMap,
        columnCount,
      });
      const startIndex = Math.max(0, Math.min(trackWidths.length - 1, columnStart - 1));
      const endIndex = Math.min(trackWidths.length, startIndex + span);
      const occupiedTrackWidths = trackWidths.slice(startIndex, endIndex);

      return (
        occupiedTrackWidths.reduce((sum, width) => sum + width, 0) +
        gap * Math.max(0, occupiedTrackWidths.length - 1)
      );
    })();
    const wrapWidth = resolveWrapContentWidth(
      itemOuterWidth,
      layoutConfig.itemWrapStyle,
      viewportWidth,
      breakpointMap,
      "grid.itemWrapStyle"
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
