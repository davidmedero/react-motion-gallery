import {
  resolveNumberFromResponsive,
  type BreakpointMap,
} from "../../../Gallery/shared/responsive";
import type { SkeletonNode } from "../../../Gallery/shared/skeleton/layout";
import type { SliderTextAnalysisLayoutConfig } from "../types";
import {
  collectResponsiveStyleBreakpoints,
  resolveResponsiveContainerStyleAtMinWidth,
} from "../responsiveStyles";
import {
  collectTextPathBreakpoints,
  parseSupportedLength,
  resolveResponsiveContainerContentWidth,
  resolveTextNodeWidthFromPath,
  resolveWrapContentWidth,
} from "../widths";
import { collectResponsiveNumberBreakpoints, uniqueSorted } from "./shared";
import {
  collectLayoutWidthResolverBreakpoints,
  resolveLayoutWidthAtViewport,
} from "./shared";

export function createSliderTextWidthSolver(args: {
  layoutConfig: SliderTextAnalysisLayoutConfig;
  itemNode: SkeletonNode;
  childIndexes: number[];
  breakpointMap: BreakpointMap;
  layoutWidthPx?: number;
  layoutWidthResolver?: SliderTextAnalysisLayoutConfig["layoutWidthResolver"];
}) {
  const { layoutConfig, itemNode, childIndexes, breakpointMap } = args;
  const breakpoints = new Set<number>([0]);

  collectResponsiveNumberBreakpoints(layoutConfig.cellsPerSlide, breakpointMap, breakpoints);
  collectResponsiveStyleBreakpoints(layoutConfig.style, breakpoints, breakpointMap);
  collectLayoutWidthResolverBreakpoints(
    args.layoutWidthResolver ?? layoutConfig.layoutWidthResolver,
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
    const cellsPerSlide = Math.max(
      1,
      Math.round(
        resolveNumberFromResponsive(
          layoutConfig.cellsPerSlide,
          1,
          viewportWidth,
          breakpointMap
        )
      )
    );
    const sliderStyle = resolveResponsiveContainerStyleAtMinWidth(
      layoutConfig.style,
      viewportWidth,
      breakpointMap
    );
    const sliderContentWidth = resolveResponsiveContainerContentWidth({
      style: layoutConfig.style,
      availableWidth: layoutWidth,
      viewportWidth,
      breakpointMap,
      detailPath: "slider.style",
    });
    const gap = parseSupportedLength(sliderStyle?.gap, sliderContentWidth, "slider.style.gap") ?? 0;
    const fitWidth =
      (sliderContentWidth - Math.max(0, cellsPerSlide - 1) * gap) / Math.max(1, cellsPerSlide);
    const explicitWrapWidth = parseSupportedLength(
      layoutConfig.itemWrapStyle?.width,
      fitWidth,
      "slider.itemWrapStyle.width"
    );
    const useExplicitPeekWidth =
      layoutConfig.mode === "peek" &&
      explicitWrapWidth != null &&
      (typeof layoutConfig.itemWrapStyle?.width !== "string" ||
        !layoutConfig.itemWrapStyle.width.trim().endsWith("%"));
    const itemOuterWidth = useExplicitPeekWidth ? explicitWrapWidth : fitWidth;
    const wrapWidth = resolveWrapContentWidth(
      itemOuterWidth,
      layoutConfig.itemWrapStyle,
      viewportWidth,
      breakpointMap,
      "slider.itemWrapStyle"
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
