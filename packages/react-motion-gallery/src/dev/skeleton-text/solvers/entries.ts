import type { BreakpointMap } from "../../../Gallery/shared/responsive";
import type { SkeletonNode } from "../../../Gallery/shared/skeleton/layout";
import type { EntriesTextAnalysisLayoutConfig } from "../types";
import {
  collectTextPathBreakpoints,
  resolveTextNodeWidthFromPath,
} from "../widths";
import {
  collectLayoutWidthResolverBreakpoints,
  resolveLayoutWidthAtViewport,
  uniqueSorted,
} from "./shared";

export function createEntriesTextWidthSolver(args: {
  layoutConfig: EntriesTextAnalysisLayoutConfig;
  itemNode: SkeletonNode;
  childIndexes: number[];
  breakpointMap: BreakpointMap;
  layoutWidthPx?: number;
  layoutWidthResolver?: EntriesTextAnalysisLayoutConfig["layoutWidthResolver"];
}) {
  const { layoutConfig, itemNode, childIndexes, breakpointMap } = args;
  const breakpoints = new Set<number>(
    collectTextPathBreakpoints({
      root: itemNode,
      childIndexes,
      breakpointMap,
    })
  );
  collectLayoutWidthResolverBreakpoints(
    args.layoutWidthResolver ?? layoutConfig.layoutWidthResolver,
    breakpoints
  );
  breakpoints.add(0);

  const widthAtViewport = (viewportWidth: number) => {
    const layoutWidth = resolveLayoutWidthAtViewport({
      viewportWidth,
      layoutWidthPx: args.layoutWidthPx ?? layoutConfig.layoutWidthPx,
      layoutWidthResolver:
        args.layoutWidthResolver ?? layoutConfig.layoutWidthResolver,
    });

    return resolveTextNodeWidthFromPath({
      root: itemNode,
      childIndexes,
      availableWidth: layoutWidth,
      viewportWidth,
      breakpointMap,
    });
  };

  return {
    breakpoints: uniqueSorted(breakpoints),
    widthAtViewport,
  };
}
