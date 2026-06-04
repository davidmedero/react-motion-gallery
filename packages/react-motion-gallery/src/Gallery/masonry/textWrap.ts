"use client";

import * as React from "react";
import type { SkeletonNode } from "../skeleton/base";
import type {
  MasonryHeightOffsetPx,
  MasonryHeightOffsetRule,
  ResponsiveMasonrySpan,
} from "./light/placement";

export type MasonryTextWrapResponsiveNumber =
  | number
  | Record<string | number, number>;

export type MasonryTextWrapTextState = {
  lines: MasonryTextWrapResponsiveNumber;
  barHeight?: MasonryTextWrapResponsiveNumber;
  lineHeight?: MasonryTextWrapResponsiveNumber;
  responsiveBy?: "viewport" | "container";
};

export type MasonryTextWrapTextEntry = {
  badge: MasonryTextWrapTextState;
  title: MasonryTextWrapTextState;
  body: MasonryTextWrapTextState;
};

export type MasonryTextWrapChromeMetrics = {
  cardPaddingBlockPx: number;
  cardPaddingInlinePx: number;
  cardGapPx: number;
  metaGapPx: number;
  metaPaddingInlinePx: number;
  borderBlockPx?: number;
  borderInlinePx?: number;
  textGapCount?: number;
};

export type MasonryTextWrapLayoutOptions = {
  columns: MasonryTextWrapResponsiveNumber;
  gap: MasonryTextWrapResponsiveNumber;
  metrics: MasonryTextWrapChromeMetrics;
};

export type MasonryTextWrapItemGeometryOptions = {
  ratio: string;
  span?: ResponsiveMasonrySpan;
  skeletonText?: MasonryTextWrapTextEntry;
  textStates?: readonly MasonryTextWrapTextState[];
};

export type MasonryTextWrapItemGeometry = {
  width: number;
  height: number;
  heightOffsetPx: MasonryHeightOffsetPx;
};

export type MasonryTextWrapLayoutController = {
  rootRef: React.RefCallback<HTMLElement>;
  getItemGeometry: (
    args: MasonryTextWrapItemGeometryOptions,
  ) => MasonryTextWrapItemGeometry;
};

const DEFAULT_VIEWPORT_WIDTH = 1200;
const DEFAULT_MEDIA_WIDTH = 1200;
const RESPONSIVE_WIDTH_EPSILON_PX = 0.001;

function resolveResponsiveNumber(
  value: MasonryTextWrapResponsiveNumber | undefined,
  width: number,
  fallback: number,
) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object") return fallback;

  let resolved = fallback;
  let hasResolved = false;

  Object.entries(value)
    .map(([key, nextValue]) => ({
      minWidth: Number(key),
      value: nextValue,
    }))
    .filter(
      (entry) =>
        Number.isFinite(entry.minWidth) && Number.isFinite(entry.value),
    )
    .sort((a, b) => a.minWidth - b.minWidth)
    .forEach((entry) => {
      if (width + RESPONSIVE_WIDTH_EPSILON_PX >= entry.minWidth) {
        resolved = entry.value;
        hasResolved = true;
      }
    });

  return hasResolved ? resolved : fallback;
}

function resolveResponsiveSpan(
  value: ResponsiveMasonrySpan | undefined,
  columnCount: number,
  viewportWidth: number,
) {
  const safeColumnCount = Math.max(1, columnCount | 0);

  if (value === "full") return safeColumnCount;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.min(safeColumnCount, value | 0));
  }
  if (!value || typeof value !== "object") return 1;

  let resolved: number | "full" | undefined;

  Object.entries(value)
    .map(([key, nextValue]) => ({
      minWidth: Number(key),
      value: nextValue,
    }))
    .filter((entry) => Number.isFinite(entry.minWidth))
    .sort((a, b) => a.minWidth - b.minWidth)
    .forEach((entry) => {
      if (viewportWidth >= entry.minWidth) resolved = entry.value;
    });

  if (resolved === "full") return safeColumnCount;
  if (typeof resolved === "number" && Number.isFinite(resolved)) {
    return Math.max(1, Math.min(safeColumnCount, resolved | 0));
  }

  return 1;
}

function collectResponsiveMinWidths(value: unknown, out: Set<number>) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;

  Object.keys(value)
    .map(Number)
    .filter((width) => Number.isFinite(width) && width >= 0)
    .forEach((width) => out.add(width));
}

function getTextStates(entry: MasonryTextWrapTextEntry) {
  return [entry.badge, entry.title, entry.body];
}

function getTextGapCount(metrics: MasonryTextWrapChromeMetrics) {
  return Math.max(0, metrics.textGapCount ?? 2);
}

function collectTextMinWidths(
  state: MasonryTextWrapTextState,
  out: Set<number>,
) {
  collectResponsiveMinWidths(state.lines, out);
  collectResponsiveMinWidths(state.barHeight, out);
  collectResponsiveMinWidths(state.lineHeight, out);
}

function quantizeLineBoxHeight(value: number) {
  return Math.floor(value * 64) / 64;
}

function resolveTextHeight(args: {
  state: MasonryTextWrapTextState;
  viewportWidth: number;
  textWidth: number;
}) {
  const width =
    args.state.responsiveBy === "container"
      ? args.textWidth
      : args.viewportWidth;
  const lines = Math.max(
    1,
    Math.trunc(resolveResponsiveNumber(args.state.lines, width, 1)),
  );
  const barHeight = Math.max(
    0,
    resolveResponsiveNumber(args.state.barHeight, width, 0),
  );
  const lineHeight = Math.max(
    0,
    resolveResponsiveNumber(args.state.lineHeight, width, 1),
  );
  const rawLineBoxHeight = Math.max(0, barHeight * lineHeight);
  const safeBarHeight = Math.min(barHeight, rawLineBoxHeight);
  const lineBoxHeight = Math.max(
    safeBarHeight,
    quantizeLineBoxHeight(rawLineBoxHeight),
  );

  return lineBoxHeight * lines;
}

function parseRatio(ratio: string) {
  const [rawWidth, rawHeight] = ratio
    .split("/")
    .map((part) => Number(part.trim()));

  if (
    !Number.isFinite(rawWidth) ||
    !Number.isFinite(rawHeight) ||
    rawWidth <= 0 ||
    rawHeight <= 0
  ) {
    return { width: 1, height: 1 };
  }

  return { width: rawWidth, height: rawHeight };
}

function mediaDimensionsFromRatio(ratioValue: string) {
  const ratio = parseRatio(ratioValue);

  return {
    width: DEFAULT_MEDIA_WIDTH,
    height: Math.max(
      1,
      roundPx(DEFAULT_MEDIA_WIDTH * (ratio.height / ratio.width)),
    ),
  };
}

function mediaInlineCompensationPx(args: {
  ratio: string;
  metrics: MasonryTextWrapChromeMetrics;
}) {
  const ratio = parseRatio(args.ratio);

  return (
    (args.metrics.cardPaddingInlinePx + (args.metrics.borderInlinePx ?? 0)) *
    (ratio.height / ratio.width)
  );
}

function getLayoutMetrics(args: {
  columns: MasonryTextWrapResponsiveNumber;
  gap: MasonryTextWrapResponsiveNumber;
  span?: ResponsiveMasonrySpan;
  viewportWidth: number;
}) {
  const columnCount = Math.max(
    1,
    resolveResponsiveNumber(args.columns, args.viewportWidth, 1) | 0,
  );
  const gapPx = Math.max(
    0,
    resolveResponsiveNumber(args.gap, args.viewportWidth, 0),
  );
  const span = resolveResponsiveSpan(
    args.span,
    columnCount,
    args.viewportWidth,
  );

  return { columnCount, gapPx, span };
}

function getItemWidthForLayoutWidth(args: {
  layoutWidth: number;
  columnCount: number;
  gapPx: number;
  span: number;
}) {
  const columnWidth =
    args.columnCount <= 1
      ? args.layoutWidth
      : Math.max(
          0,
          (args.layoutWidth - args.gapPx * (args.columnCount - 1)) /
            args.columnCount,
        );

  return columnWidth * args.span + args.gapPx * Math.max(0, args.span - 1);
}

function getTextWidthForItemWidth(args: {
  itemWidth: number;
  metrics: MasonryTextWrapChromeMetrics;
}) {
  return Math.max(
    0,
    args.itemWidth -
      args.metrics.cardPaddingInlinePx -
      (args.metrics.borderInlinePx ?? 0) -
      args.metrics.metaPaddingInlinePx,
  );
}

function getContainerWidthForTextMinWidth(args: {
  textMinWidth: number;
  columnCount: number;
  gapPx: number;
  span: number;
  metrics: MasonryTextWrapChromeMetrics;
}) {
  const textChromePx =
    args.metrics.cardPaddingInlinePx +
    (args.metrics.borderInlinePx ?? 0) +
    args.metrics.metaPaddingInlinePx;
  const itemWidthPx = args.textMinWidth + textChromePx;
  const gapTerm = args.gapPx * (args.span / args.columnCount - 1);

  return Math.max(
    0,
    ((itemWidthPx - gapTerm) * args.columnCount) / args.span,
  );
}

function resolveTextEntryHeight(args: {
  textStates: readonly MasonryTextWrapTextState[];
  viewportWidth: number;
  textWidth: number;
}) {
  return args.textStates.reduce(
    (height, state) =>
      height +
      resolveTextHeight({
        state,
        viewportWidth: args.viewportWidth,
        textWidth: args.textWidth,
      }),
    0,
  );
}

function resolveHeightOffsetPx(args: {
  ratio: string;
  metrics: MasonryTextWrapChromeMetrics;
  textHeight: number;
}) {
  return roundPx(
    Math.max(
      0,
      args.metrics.cardPaddingBlockPx +
        (args.metrics.borderBlockPx ?? 0) +
        args.metrics.cardGapPx +
        args.metrics.metaGapPx * getTextGapCount(args.metrics) +
        args.textHeight -
        mediaInlineCompensationPx({
          ratio: args.ratio,
          metrics: args.metrics,
        }),
    ),
  );
}

function createHeightOffsetRules(args: {
  columns: MasonryTextWrapResponsiveNumber;
  gap: MasonryTextWrapResponsiveNumber;
  metrics: MasonryTextWrapChromeMetrics;
  ratio: string;
  span?: ResponsiveMasonrySpan;
  textStates: readonly MasonryTextWrapTextState[];
  fallbackViewportWidth: number;
  fallbackLayoutWidth: number;
}): MasonryHeightOffsetPx {
  const viewportMinWidths = new Set<number>([0]);
  collectResponsiveMinWidths(args.columns, viewportMinWidths);
  collectResponsiveMinWidths(args.gap, viewportMinWidths);
  collectResponsiveMinWidths(args.span, viewportMinWidths);

  for (const state of args.textStates) {
    if (state.responsiveBy === "container") continue;
    collectTextMinWidths(state, viewportMinWidths);
  }

  const rules: MasonryHeightOffsetRule[] = [];

  for (const viewportMinWidth of Array.from(viewportMinWidths).sort(
    (a, b) => a - b,
  )) {
    const viewportWidth = Math.max(1, viewportMinWidth);
    const layoutMetrics = getLayoutMetrics({
      columns: args.columns,
      gap: args.gap,
      span: args.span,
      viewportWidth,
    });
    const containerMinWidths = new Set<number>([0]);

    for (const state of args.textStates) {
      if (state.responsiveBy !== "container") continue;

      const textMinWidths = new Set<number>([0]);
      collectTextMinWidths(state, textMinWidths);
      for (const textMinWidth of textMinWidths) {
        containerMinWidths.add(
          roundPx(
            getContainerWidthForTextMinWidth({
              textMinWidth,
              ...layoutMetrics,
              metrics: args.metrics,
            }),
          ),
        );
      }
    }

    for (const containerMinWidth of Array.from(containerMinWidths).sort(
      (a, b) => a - b,
    )) {
      const itemWidth = getItemWidthForLayoutWidth({
        layoutWidth: containerMinWidth,
        ...layoutMetrics,
      });
      const textWidth = getTextWidthForItemWidth({
        itemWidth,
        metrics: args.metrics,
      });
      const textHeight = resolveTextEntryHeight({
        textStates: args.textStates,
        viewportWidth,
        textWidth,
      });

      rules.push({
        viewportMinWidth,
        containerMinWidth,
        value: resolveHeightOffsetPx({
          ratio: args.ratio,
          metrics: args.metrics,
          textHeight,
        }),
      });
    }
  }

  const fallbackLayoutMetrics = getLayoutMetrics({
    columns: args.columns,
    gap: args.gap,
    span: args.span,
    viewportWidth: args.fallbackViewportWidth,
  });
  const fallbackItemWidth = getItemWidthForLayoutWidth({
    layoutWidth: args.fallbackLayoutWidth,
    ...fallbackLayoutMetrics,
  });
  const fallbackTextHeight = resolveTextEntryHeight({
    textStates: args.textStates,
    viewportWidth: args.fallbackViewportWidth,
    textWidth: getTextWidthForItemWidth({
      itemWidth: fallbackItemWidth,
      metrics: args.metrics,
    }),
  });

  return {
    fallback: resolveHeightOffsetPx({
      ratio: args.ratio,
      metrics: args.metrics,
      textHeight: fallbackTextHeight,
    }),
    rules,
  };
}

function roundPx(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function createMasonryTextWrapSkeletonLayout(args: {
  item: SkeletonNode;
  itemWrapStyle: React.CSSProperties;
}): SkeletonNode {
  return {
    kind: "col",
    style: {
      width: "100%",
      boxSizing: "border-box",
      ...args.itemWrapStyle,
    },
    children: [args.item],
  };
}

export function useMasonryTextWrapLayout({
  columns,
  gap,
  metrics,
}: MasonryTextWrapLayoutOptions): MasonryTextWrapLayoutController {
  const [rootNode, setRootNode] = React.useState<HTMLElement | null>(null);
  const [rootWidth, setRootWidth] = React.useState(0);
  const [viewportWidth, setViewportWidth] = React.useState(
    DEFAULT_VIEWPORT_WIDTH,
  );

  const rootRef = React.useCallback((node: HTMLElement | null) => {
    setRootNode(node);
  }, []);

  React.useLayoutEffect(() => {
    const readViewportWidth = () => {
      setViewportWidth(
        typeof window === "undefined"
          ? DEFAULT_VIEWPORT_WIDTH
          : window.innerWidth || DEFAULT_VIEWPORT_WIDTH,
      );
    };

    readViewportWidth();
    window.addEventListener("resize", readViewportWidth);
    return () => window.removeEventListener("resize", readViewportWidth);
  }, []);

  React.useLayoutEffect(() => {
    if (!rootNode) return;

    const commit = (nextWidth: number | undefined) => {
      const measuredWidth = Number(nextWidth);
      if (!Number.isFinite(measuredWidth) || measuredWidth <= 0) return;
      setRootWidth((previous) =>
        Math.abs(previous - measuredWidth) < 0.5 ? previous : measuredWidth,
      );
    };
    const readRootWidth = () => commit(rootNode.getBoundingClientRect().width);

    readRootWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", readRootWidth);
      return () => window.removeEventListener("resize", readRootWidth);
    }

    const observer = new ResizeObserver((entries) => {
      commit(entries[0]?.contentRect.width);
    });
    observer.observe(rootNode);
    return () => observer.disconnect();
  }, [rootNode]);

  const getItemGeometry = React.useCallback(
    (args: MasonryTextWrapItemGeometryOptions) => {
      const effectiveViewportWidth = viewportWidth || DEFAULT_VIEWPORT_WIDTH;
      const layoutWidth = rootWidth || effectiveViewportWidth;
      const textStates =
        args.textStates ??
        (args.skeletonText ? getTextStates(args.skeletonText) : []);

      return {
        ...mediaDimensionsFromRatio(args.ratio),
        heightOffsetPx: createHeightOffsetRules({
          columns,
          gap,
          metrics,
          ratio: args.ratio,
          span: args.span,
          textStates,
          fallbackViewportWidth: effectiveViewportWidth,
          fallbackLayoutWidth: layoutWidth,
        }),
      };
    },
    [columns, gap, metrics, rootWidth, viewportWidth],
  );

  return { rootRef, getItemGeometry };
}
