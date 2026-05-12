import type { BreakpointMap, ResponsiveNumber } from "../../Gallery/shared/responsive";
import type {
  SkeletonContainerStyleResponsive,
  SkeletonNode,
  SkeletonWrapStyle,
} from "../../Gallery/shared/skeleton/layout";
import type { ResponsiveGridSpan, ResponsiveGridTemplate } from "../../Gallery/grid/types";
import type { ResponsiveMasonrySpan } from "../../Gallery/masonry/types";

export type ResponsiveLineMap = Record<number, number>;
export type ResponsiveBarWidthValue = string | string[];
export type ResponsiveBarWidthMap = Record<number, ResponsiveBarWidthValue>;
export type ResponsiveLastBarWidthMap = Record<number, string>;
export type WidthMode = "barWidth" | "lastBarWidth" | "both";

export type DemoCanvasShellLayoutWidthResolver = {
  kind: "demoCanvasShell";
  shellMaxWidthPx: number;
  shellMarginDesktopPx: number;
  shellMarginCompactPx: number;
  shellMarginBreakpointPx: number;
  stackBreakpointPx: number;
  sidebarWidthPx: number;
  layoutGapPx: number;
  canvasPaddingMinPx: number;
  canvasPaddingMaxPx: number;
  canvasPaddingViewportRatio: number;
  canvasBorderWidthPx?: number;
};

export type LayoutWidthResolver = DemoCanvasShellLayoutWidthResolver;

export type WrapLine = {
  text: string;
  width: number;
};

export type WrapSegment = {
  fromViewport: number;
  toViewport: number;
  fromWidthPx: number;
  toWidthPx: number;
  lineCount: number;
};

export type WrapMeasurePreparationOptions = {
  whiteSpace?: "normal" | "pre-wrap";
  wordBreak?: "normal" | "keep-all";
  letterSpacing?: number;
};

export interface WrapMeasureEngine<TPrepared = unknown> {
  prepare(args: {
    text: string;
    font: string;
    options?: WrapMeasurePreparationOptions;
  }): TPrepared;
  measureLineCount(args: {
    prepared: TPrepared;
    width: number;
  }): { lineCount: number; maxLineWidth: number };
  layoutLines(args: {
    prepared: TPrepared;
    width: number;
    lineHeight: number;
  }): WrapLine[];
}

export type DiscoverWrapBreakpointsResult = {
  lines: ResponsiveLineMap;
  barWidth?: ResponsiveBarWidthMap;
  segments: WrapSegment[];
};

export type GridTextAnalysisLayoutConfig = {
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  itemSpan?: ResponsiveGridSpan;
  itemColumnStart?: ResponsiveNumber;
  itemWrapStyle?: SkeletonWrapStyle;
  layoutWidthPx?: number;
  layoutWidthResolver?: LayoutWidthResolver;
  templateColumns?: ResponsiveGridTemplate;
};

export type SliderTextAnalysisLayoutConfig = {
  cellsPerSlide: ResponsiveNumber;
  style?: SkeletonContainerStyleResponsive;
  itemWrapStyle?: SkeletonWrapStyle;
  mode?: "fit" | "peek";
  layoutWidthPx?: number;
  layoutWidthResolver?: LayoutWidthResolver;
};

export type MasonryTextAnalysisLayoutConfig = {
  columns: ResponsiveNumber;
  gap?: ResponsiveNumber;
  itemSpan?: ResponsiveMasonrySpan;
  itemWrapStyle?: SkeletonWrapStyle;
  layoutWidthPx?: number;
  layoutWidthResolver?: LayoutWidthResolver;
};

export type EntriesTextAnalysisLayoutConfig = {
  layoutWidthPx?: number;
  layoutWidthResolver?: LayoutWidthResolver;
};

export type SolverContext = {
  viewportWidth: number;
  breakpointMap: BreakpointMap;
};

export type SolverResult = {
  widthPx: number;
  breakpoints: number[];
};

export type ErrorDetail = Record<string, unknown>;

export class SkeletonTextAnalyzerError extends Error {
  readonly code: string;
  readonly detail: ErrorDetail;

  constructor(code: string, message: string, detail: ErrorDetail = {}) {
    super(message);
    this.name = "SkeletonTextAnalyzerError";
    this.code = code;
    this.detail = detail;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      detail: this.detail,
    };
  }
}
