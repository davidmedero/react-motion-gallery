import { SkeletonTextAnalyzerError } from "./types";
import type {
  DiscoverWrapBreakpointsResult,
  ResponsiveBarWidthMap,
  ResponsiveBarWidthValue,
  ResponsiveLineMap,
  WrapMeasureEngine,
  WrapSegment,
} from "./types";

export type DiscoverWrapBreakpointsOptions<TPrepared = unknown> = {
  prepared: TPrepared;
  lineHeight: number;
  viewportMin: number;
  viewportMax: number;
  widthAtViewport: (viewportWidth: number) => number;
  includeBarWidths?: boolean;
  measureEngine: WrapMeasureEngine<TPrepared>;
};

function clampViewportRange(viewportMin: number, viewportMax: number) {
  if (
    !Number.isInteger(viewportMin) ||
    !Number.isInteger(viewportMax) ||
    viewportMin < 0 ||
    viewportMax < viewportMin
  ) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_VIEWPORT_RANGE",
      "viewportMin and viewportMax must be integers where viewportMax >= viewportMin >= 0.",
      { viewportMin, viewportMax }
    );
  }
}

function toPercentWidth(width: number, containerWidth: number): string {
  if (containerWidth <= 0) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_WIDTH",
      "Cannot derive bar widths from a non-positive text container width.",
      { containerWidth }
    );
  }

  const ratio = (width / containerWidth) * 100;
  if (!Number.isFinite(ratio)) {
    throw new SkeletonTextAnalyzerError(
      "INVALID_WIDTH",
      "Encountered a non-finite line width while deriving bar widths.",
      { width, containerWidth }
    );
  }

  if (ratio >= 99) return "100%";
  const rounded = Math.max(1, Math.min(100, Math.round(ratio)));
  return `${rounded}%`;
}

export function deriveBarWidthValue(args: {
  lineWidths: number[];
  containerWidth: number;
}): ResponsiveBarWidthValue {
  const widths = args.lineWidths.map((lineWidth) =>
    toPercentWidth(lineWidth, args.containerWidth)
  );

  return widths.length <= 1 ? widths[0] ?? "100%" : widths;
}

export function resolveResponsiveLineCountAtViewport(
  lines: ResponsiveLineMap,
  viewportWidth: number
): number {
  const breakpoints = Object.keys(lines)
    .map(Number)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  let resolved = lines[breakpoints[0] ?? 0] ?? 1;

  for (const breakpoint of breakpoints) {
    if (viewportWidth >= breakpoint) {
      resolved = lines[breakpoint] ?? resolved;
    } else {
      break;
    }
  }

  return resolved;
}

export function discoverWrapBreakpoints<TPrepared>(
  options: DiscoverWrapBreakpointsOptions<TPrepared>
): DiscoverWrapBreakpointsResult {
  clampViewportRange(options.viewportMin, options.viewportMax);

  const lines: ResponsiveLineMap = {};
  const breakpoints: number[] = [];
  const segments: WrapSegment[] = [];

  let segmentStartViewport = options.viewportMin;
  let segmentStartWidthPx = options.widthAtViewport(options.viewportMin);
  let previousLineCount =
    options.measureEngine.measureLineCount({
      prepared: options.prepared,
      width: segmentStartWidthPx,
    }).lineCount ?? 1;

  lines[0] = previousLineCount;
  breakpoints.push(0);

  for (
    let viewportWidth = options.viewportMin + 1;
    viewportWidth <= options.viewportMax;
    viewportWidth += 1
  ) {
    const containerWidth = options.widthAtViewport(viewportWidth);
    const lineCount = options.measureEngine.measureLineCount({
      prepared: options.prepared,
      width: containerWidth,
    }).lineCount;

    if (lineCount === previousLineCount) {
      continue;
    }

    segments.push({
      fromViewport: segmentStartViewport,
      toViewport: viewportWidth - 1,
      fromWidthPx: segmentStartWidthPx,
      toWidthPx: options.widthAtViewport(viewportWidth - 1),
      lineCount: previousLineCount,
    });

    lines[viewportWidth] = lineCount;
    breakpoints.push(viewportWidth);
    previousLineCount = lineCount;
    segmentStartViewport = viewportWidth;
    segmentStartWidthPx = containerWidth;
  }

  segments.push({
    fromViewport: segmentStartViewport,
    toViewport: options.viewportMax,
    fromWidthPx: segmentStartWidthPx,
    toWidthPx: options.widthAtViewport(options.viewportMax),
    lineCount: previousLineCount,
  });

  if (!options.includeBarWidths) {
    return { lines, segments };
  }

  const barWidth: ResponsiveBarWidthMap = {};

  for (const breakpoint of breakpoints) {
    const sampleViewport = breakpoint === 0 ? options.viewportMin : breakpoint;
    const containerWidth = options.widthAtViewport(sampleViewport);
    const layoutLines = options.measureEngine.layoutLines({
      prepared: options.prepared,
      width: containerWidth,
      lineHeight: options.lineHeight,
    });

    barWidth[breakpoint] = deriveBarWidthValue({
      lineWidths: layoutLines.map((line) => line.width),
      containerWidth,
    });
  }

  return {
    lines,
    barWidth,
    segments,
  };
}
