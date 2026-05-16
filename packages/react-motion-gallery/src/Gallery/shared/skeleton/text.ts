import { BREAKPOINT_MAP, type BreakpointMap } from "../responsive";

export const TEXT_SKELETON_LAST_BAR_WIDTH = "68%";
export const TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER = "__NODE_SEL__";
export const SAFARI_TEXT_SKELETON_SUPPORTS =
  "(font: -apple-system-body) and (-webkit-hyphens: none)";

export type ResponsiveTextLineCount = number | Record<string, number>;
export type ResponsiveTextBarHeight = number | Record<string, number>;
export type ResponsiveTextLineHeight = number | Record<string, number>;
export type TextBarWidth = number | string;
export type TextBarWidths = TextBarWidth | TextBarWidth[];
export type ResponsiveTextBarWidth =
  | TextBarWidths
  | Record<string, TextBarWidths>;
export type ResponsiveTextLastBarWidth =
  | number
  | string
  | Record<string, number | string>;
export type TextSkeletonResponsiveBy = "viewport" | "container";

export type TextSkeletonMetrics = {
  lines: number;
  lineBoxHeight: number;
  barHeight: number;
  leading: number;
  paddingBlock: number;
  rowGap: number;
  totalHeight: number;
};

export type TextSkeletonResolvedState = {
  lineCount: number;
  barWidths: string[];
  metrics: TextSkeletonMetrics;
};

export type ResponsiveTextStateRule = {
  minWidth: number;
  state: TextSkeletonResolvedState;
};

export type ResponsiveTextRenderState = {
  baseState: TextSkeletonResolvedState;
  states: ResponsiveTextStateRule[];
  maxLines: number;
  usesResponsiveBarCss: boolean;
  baseLines: number;
  baseLastBarWidth: string;
  metrics: TextSkeletonMetrics;
  responsiveBy: TextSkeletonResponsiveBy;
};

export function getTextSkeletonMetrics(args: {
  barHeight: number;
  lineHeight: number;
  lines?: number;
}): TextSkeletonMetrics {
  const lines = Math.max(1, Math.trunc(args.lines ?? 1));
  const lineBoxHeight = Math.max(0, args.barHeight * args.lineHeight);
  const barHeight = Math.min(Math.max(0, args.barHeight), lineBoxHeight);
  const leading = Math.max(lineBoxHeight - barHeight, 0);

  return {
    lines,
    lineBoxHeight,
    barHeight,
    leading,
    paddingBlock: leading / 2,
    rowGap: leading,
    totalHeight: lineBoxHeight * lines,
  };
}

export function getSafariTextSkeletonMetricsFromMetrics(
  metrics: TextSkeletonMetrics
): TextSkeletonMetrics {
  const lineBoxHeight = Math.max(
    metrics.barHeight,
    Math.floor(metrics.lineBoxHeight)
  );
  const leading = Math.max(lineBoxHeight - metrics.barHeight, 0);

  return {
    ...metrics,
    lineBoxHeight,
    leading,
    paddingBlock: leading / 2,
    rowGap: leading,
    totalHeight: lineBoxHeight * metrics.lines,
  };
}

export function getSafariTextSkeletonMetrics(args: {
  barHeight: number;
  lineHeight: number;
  lines?: number;
}): TextSkeletonMetrics {
  return getSafariTextSkeletonMetricsFromMetrics(getTextSkeletonMetrics(args));
}

function isResponsiveTextRecord(
  value: unknown,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return Object.keys(value).some(
    (key) => parseResponsiveMinWidth(key, breakpointMap) != null
  );
}

function clampTextLines(value: number | undefined, fallback: number): number {
  const n = Number.isFinite(value) ? Math.trunc(value as number) : fallback;
  return Math.max(1, n);
}

function clampTextBarHeight(value: number | undefined, fallback: number): number {
  const n = Number.isFinite(value) ? Number(value) : fallback;
  return Math.max(0, n);
}

function clampTextLineHeight(value: number | undefined, fallback: number): number {
  const n = Number.isFinite(value) ? Number(value) : fallback;
  return Math.max(0, n);
}

function parseResponsiveMinWidth(
  key: string,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number | null {
  const named = breakpointMap[key];
  if (Number.isFinite(named)) return Math.max(0, named);

  const numeric = Number(key);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, numeric);
}

function toCssLength(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

function toCssTextBarWidths(value: TextBarWidths): string | string[] {
  return Array.isArray(value) ? value.map(toCssLength) : toCssLength(value);
}

function normalizeResolvedBarWidths(args: {
  barWidths: string[];
  lineCount: number;
  finalBarWidthFallback: string;
}): string[] {
  const { barWidths, lineCount, finalBarWidthFallback } = args;

  if (lineCount <= 0) {
    return [finalBarWidthFallback];
  }

  if (barWidths.length >= lineCount) {
    return barWidths.slice(0, lineCount);
  }

  return Array.from({ length: lineCount }, (_, index) =>
    index < barWidths.length
      ? barWidths[index]!
      : index === lineCount - 1
      ? finalBarWidthFallback
      : "100%"
  );
}

function buildManualTextState(args: {
  barHeight: ResponsiveTextBarHeight | undefined;
  barWidth?: ResponsiveTextBarWidth;
  lineHeight: ResponsiveTextLineHeight;
  lines?: ResponsiveTextLineCount;
  lastBarWidth?: ResponsiveTextLastBarWidth;
  minWidth: number;
  breakpointMap: BreakpointMap;
}): TextSkeletonResolvedState {
  const lineCount = resolveResponsiveTextLineCount(
    args.lines,
    1,
    args.minWidth,
    args.breakpointMap
  );
  const resolvedBarHeight = resolveResponsiveTextBarHeight(
    args.barHeight,
    typeof args.barHeight === "number" ? args.barHeight : 0,
    args.minWidth,
    args.breakpointMap
  );
  const resolvedLineHeight = resolveResponsiveTextLineHeight(
    args.lineHeight,
    typeof args.lineHeight === "number" ? args.lineHeight : 1,
    args.minWidth,
    args.breakpointMap
  );
  const lastBarWidth = resolveResponsiveTextLastBarWidth(
    args.lastBarWidth,
    TEXT_SKELETON_LAST_BAR_WIDTH,
    args.minWidth,
    args.breakpointMap
  );
  const resolvedBarWidth = resolveResponsiveTextBarWidth(
    args.barWidth,
    "100%",
    args.minWidth,
    args.breakpointMap
  );
  const barWidths =
    args.barWidth == null
      ? Array.from({ length: lineCount }, (_, index) =>
          index === lineCount - 1 ? lastBarWidth : "100%"
        )
      : Array.isArray(resolvedBarWidth)
      ? resolvedBarWidth
      : Array.from({ length: lineCount }, () => resolvedBarWidth);

  return {
    lineCount,
    barWidths: normalizeResolvedBarWidths({
      barWidths,
      lineCount,
      finalBarWidthFallback:
        args.barWidth == null ? lastBarWidth : "100%",
    }),
    metrics: getTextSkeletonMetrics({
      barHeight: resolvedBarHeight,
      lineHeight: resolvedLineHeight,
      lines: lineCount,
    }),
  };
}

function sameResolvedTextState(
  a: TextSkeletonResolvedState,
  b: TextSkeletonResolvedState
): boolean {
  return (
    a.lineCount === b.lineCount &&
    a.metrics.totalHeight === b.metrics.totalHeight &&
    a.metrics.barHeight === b.metrics.barHeight &&
    a.metrics.paddingBlock === b.metrics.paddingBlock &&
    a.metrics.rowGap === b.metrics.rowGap &&
    a.barWidths.length === b.barWidths.length &&
    a.barWidths.every((width, index) => width === b.barWidths[index])
  );
}

export function hasResponsiveTextLineCount(
  value: ResponsiveTextLineCount | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): value is Record<string, number> {
  return isResponsiveTextRecord(value, breakpointMap);
}

export function hasResponsiveTextBarHeight(
  value: ResponsiveTextBarHeight | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): value is Record<string, number> {
  return isResponsiveTextRecord(value, breakpointMap);
}

export function hasResponsiveTextLineHeight(
  value: ResponsiveTextLineHeight | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): value is Record<string, number> {
  return isResponsiveTextRecord(value, breakpointMap);
}

export function hasResponsiveTextBarWidth(
  value: ResponsiveTextBarWidth | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): value is Record<string, TextBarWidths> {
  return isResponsiveTextRecord(value, breakpointMap);
}

export function hasResponsiveTextLastBarWidth(
  value: ResponsiveTextLastBarWidth | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): value is Record<string, number | string> {
  return isResponsiveTextRecord(value, breakpointMap);
}

export function normalizeResponsiveTextLineCountRules(
  value: ResponsiveTextLineCount | undefined,
  fallback = 1,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): Array<{ minWidth: number; lines: number }> {
  if (!hasResponsiveTextLineCount(value, breakpointMap)) {
    return [
      {
        minWidth: 0,
        lines: clampTextLines(
          typeof value === "number" ? value : undefined,
          fallback
        ),
      },
    ];
  }

  const entries = Object.entries(value)
    .map(([key, raw]) => {
      const minWidth = parseResponsiveMinWidth(key, breakpointMap);
      if (minWidth == null) return null;

      return {
        minWidth,
        lines: clampTextLines(
          typeof raw === "number" ? raw : Number(raw),
          fallback
        ),
      };
    })
    .filter((entry): entry is { minWidth: number; lines: number } => !!entry)
    .sort((a, b) => a.minWidth - b.minWidth)
    .reduce<Array<{ minWidth: number; lines: number }>>((acc, entry) => {
      const last = acc[acc.length - 1];
      if (last && last.minWidth === entry.minWidth) {
        last.lines = entry.lines;
      } else {
        acc.push(entry);
      }
      return acc;
    }, []);

  if (entries.length === 0) {
    return [{ minWidth: 0, lines: clampTextLines(undefined, fallback) }];
  }

  if (entries[0].minWidth > 0) {
    entries.unshift({
      minWidth: 0,
      lines: clampTextLines(undefined, fallback),
    });
  }

  return entries;
}

export function normalizeResponsiveTextBarHeightRules(
  value: ResponsiveTextBarHeight | undefined,
  fallback = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): Array<{ minWidth: number; barHeight: number }> {
  if (!hasResponsiveTextBarHeight(value, breakpointMap)) {
    return [
      {
        minWidth: 0,
        barHeight: clampTextBarHeight(
          typeof value === "number" ? value : undefined,
          fallback
        ),
      },
    ];
  }

  const entries = Object.entries(value)
    .map(([key, raw]) => {
      const minWidth = parseResponsiveMinWidth(key, breakpointMap);
      if (minWidth == null) return null;

      return {
        minWidth,
        barHeight: clampTextBarHeight(
          typeof raw === "number" ? raw : Number(raw),
          fallback
        ),
      };
    })
    .filter(
      (entry): entry is { minWidth: number; barHeight: number } => !!entry
    )
    .sort((a, b) => a.minWidth - b.minWidth)
    .reduce<Array<{ minWidth: number; barHeight: number }>>((acc, entry) => {
      const last = acc[acc.length - 1];
      if (last && last.minWidth === entry.minWidth) {
        last.barHeight = entry.barHeight;
      } else {
        acc.push(entry);
      }
      return acc;
    }, []);

  if (entries.length === 0) {
    return [{ minWidth: 0, barHeight: clampTextBarHeight(undefined, fallback) }];
  }

  if (entries[0].minWidth > 0) {
    entries.unshift({
      minWidth: 0,
      barHeight: entries[0].barHeight,
    });
  }

  return entries;
}

export function normalizeResponsiveTextLineHeightRules(
  value: ResponsiveTextLineHeight | undefined,
  fallback = 1,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): Array<{ minWidth: number; lineHeight: number }> {
  if (!hasResponsiveTextLineHeight(value, breakpointMap)) {
    return [
      {
        minWidth: 0,
        lineHeight: clampTextLineHeight(
          typeof value === "number" ? value : undefined,
          fallback
        ),
      },
    ];
  }

  const entries = Object.entries(value)
    .map(([key, raw]) => {
      const minWidth = parseResponsiveMinWidth(key, breakpointMap);
      if (minWidth == null) return null;

      return {
        minWidth,
        lineHeight: clampTextLineHeight(
          typeof raw === "number" ? raw : Number(raw),
          fallback
        ),
      };
    })
    .filter(
      (entry): entry is { minWidth: number; lineHeight: number } => !!entry
    )
    .sort((a, b) => a.minWidth - b.minWidth)
    .reduce<Array<{ minWidth: number; lineHeight: number }>>((acc, entry) => {
      const last = acc[acc.length - 1];
      if (last && last.minWidth === entry.minWidth) {
        last.lineHeight = entry.lineHeight;
      } else {
        acc.push(entry);
      }
      return acc;
    }, []);

  if (entries.length === 0) {
    return [{ minWidth: 0, lineHeight: clampTextLineHeight(undefined, fallback) }];
  }

  if (entries[0].minWidth > 0) {
    entries.unshift({
      minWidth: 0,
      lineHeight: entries[0].lineHeight,
    });
  }

  return entries;
}

export function resolveResponsiveTextLineCount(
  value: ResponsiveTextLineCount | undefined,
  fallback = 1,
  minWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number {
  const rules = normalizeResponsiveTextLineCountRules(
    value,
    fallback,
    breakpointMap
  );
  let resolved = rules[0]?.lines ?? clampTextLines(undefined, fallback);

  for (const rule of rules) {
    if (minWidth >= rule.minWidth) {
      resolved = rule.lines;
    }
  }

  return resolved;
}

export function resolveResponsiveTextBarHeight(
  value: ResponsiveTextBarHeight | undefined,
  fallback = 0,
  minWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number {
  const rules = normalizeResponsiveTextBarHeightRules(
    value,
    fallback,
    breakpointMap
  );
  let resolved = rules[0]?.barHeight ?? clampTextBarHeight(undefined, fallback);

  for (const rule of rules) {
    if (minWidth >= rule.minWidth) {
      resolved = rule.barHeight;
    }
  }

  return resolved;
}

export function resolveResponsiveTextLineHeight(
  value: ResponsiveTextLineHeight | undefined,
  fallback = 1,
  minWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number {
  const rules = normalizeResponsiveTextLineHeightRules(
    value,
    fallback,
    breakpointMap
  );
  let resolved =
    rules[0]?.lineHeight ?? clampTextLineHeight(undefined, fallback);

  for (const rule of rules) {
    if (minWidth >= rule.minWidth) {
      resolved = rule.lineHeight;
    }
  }

  return resolved;
}

export function resolveResponsiveTextBarWidth(
  value: ResponsiveTextBarWidth | undefined,
  fallback: TextBarWidths = "100%",
  minWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string | string[] {
  const rules = normalizeResponsiveTextBarWidthRules(
    value,
    fallback,
    breakpointMap
  );
  let resolved = rules[0]?.barWidth ?? toCssTextBarWidths(fallback);

  for (const rule of rules) {
    if (minWidth >= rule.minWidth) {
      resolved = rule.barWidth;
    }
  }

  return resolved;
}

export function maxResponsiveTextLineCount(
  value: ResponsiveTextLineCount | undefined,
  fallback = 1,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number {
  return normalizeResponsiveTextLineCountRules(
    value,
    fallback,
    breakpointMap
  ).reduce(
    (max, rule) => Math.max(max, rule.lines),
    clampTextLines(undefined, fallback)
  );
}

export function normalizeResponsiveTextBarWidthRules(
  value: ResponsiveTextBarWidth | undefined,
  fallback: TextBarWidths = "100%",
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): Array<{ minWidth: number; barWidth: string | string[] }> {
  if (!hasResponsiveTextBarWidth(value, breakpointMap)) {
    return [
      {
        minWidth: 0,
        barWidth: toCssTextBarWidths(value == null ? fallback : value),
      },
    ];
  }

  const entries = Object.entries(value)
    .map(([key, raw]) => {
      const minWidth = parseResponsiveMinWidth(key, breakpointMap);
      if (minWidth == null || raw == null) return null;

      return {
        minWidth,
        barWidth: toCssTextBarWidths(raw),
      };
    })
    .filter(
      (entry): entry is { minWidth: number; barWidth: string | string[] } =>
        !!entry
    )
    .sort((a, b) => a.minWidth - b.minWidth)
    .reduce<Array<{ minWidth: number; barWidth: string | string[] }>>(
      (acc, entry) => {
        const last = acc[acc.length - 1];
        if (last && last.minWidth === entry.minWidth) {
          last.barWidth = entry.barWidth;
        } else {
          acc.push(entry);
        }
        return acc;
      },
      []
    );

  if (entries.length === 0) {
    return [{ minWidth: 0, barWidth: toCssTextBarWidths(fallback) }];
  }

  if (entries[0].minWidth > 0) {
    entries.unshift({ minWidth: 0, barWidth: toCssTextBarWidths(fallback) });
  }

  return entries;
}

export function normalizeResponsiveTextLastBarWidthRules(
  value: ResponsiveTextLastBarWidth | undefined,
  fallback = TEXT_SKELETON_LAST_BAR_WIDTH,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): Array<{ minWidth: number; lastBarWidth: string }> {
  if (!hasResponsiveTextLastBarWidth(value, breakpointMap)) {
    return [
      {
        minWidth: 0,
        lastBarWidth: toCssLength(
          value == null ? fallback : (value as number | string)
        ),
      },
    ];
  }

  const entries = Object.entries(value)
    .map(([key, raw]) => {
      const minWidth = parseResponsiveMinWidth(key, breakpointMap);
      if (minWidth == null || raw == null) return null;

      return {
        minWidth,
        lastBarWidth: toCssLength(raw),
      };
    })
    .filter(
      (entry): entry is { minWidth: number; lastBarWidth: string } => !!entry
    )
    .sort((a, b) => a.minWidth - b.minWidth)
    .reduce<Array<{ minWidth: number; lastBarWidth: string }>>((acc, entry) => {
      const last = acc[acc.length - 1];
      if (last && last.minWidth === entry.minWidth) {
        last.lastBarWidth = entry.lastBarWidth;
      } else {
        acc.push(entry);
      }
      return acc;
    }, []);

  if (entries.length === 0) {
    return [{ minWidth: 0, lastBarWidth: toCssLength(fallback) }];
  }

  if (entries[0].minWidth > 0) {
    entries.unshift({ minWidth: 0, lastBarWidth: toCssLength(fallback) });
  }

  return entries;
}

export function resolveResponsiveTextLastBarWidth(
  value: ResponsiveTextLastBarWidth | undefined,
  fallback = TEXT_SKELETON_LAST_BAR_WIDTH,
  minWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string {
  const rules = normalizeResponsiveTextLastBarWidthRules(
    value,
    fallback,
    breakpointMap
  );
  let resolved = rules[0]?.lastBarWidth ?? toCssLength(fallback);

  for (const rule of rules) {
    if (minWidth >= rule.minWidth) {
      resolved = rule.lastBarWidth;
    }
  }

  return resolved;
}

export function collectResponsiveTextBreakpoints(args: {
  barHeight: ResponsiveTextBarHeight | undefined;
  barWidth?: ResponsiveTextBarWidth;
  lineHeight: ResponsiveTextLineHeight;
  lines?: ResponsiveTextLineCount;
  lastBarWidth?: ResponsiveTextLastBarWidth;
  breakpointMap?: BreakpointMap;
}): number[] {
  const minWidths = new Set<number>();
  const breakpointMap = args.breakpointMap ?? BREAKPOINT_MAP;

  for (const rule of normalizeResponsiveTextBarHeightRules(
    args.barHeight,
    typeof args.barHeight === "number" ? args.barHeight : 0,
    breakpointMap
  )) {
    minWidths.add(rule.minWidth);
  }

  for (const rule of normalizeResponsiveTextLineCountRules(
    args.lines,
    1,
    breakpointMap
  )) {
    minWidths.add(rule.minWidth);
  }

  for (const rule of normalizeResponsiveTextLineHeightRules(
    args.lineHeight,
    typeof args.lineHeight === "number" ? args.lineHeight : 1,
    breakpointMap
  )) {
    minWidths.add(rule.minWidth);
  }

  const barWidthRules =
    args.barWidth != null
      ? normalizeResponsiveTextBarWidthRules(args.barWidth, "100%", breakpointMap)
      : normalizeResponsiveTextLastBarWidthRules(
          args.lastBarWidth,
          TEXT_SKELETON_LAST_BAR_WIDTH,
          breakpointMap
        );

  for (const rule of barWidthRules) {
    minWidths.add(rule.minWidth);
  }

  return Array.from(minWidths).sort((a, b) => a - b);
}

export function getResponsiveTextRenderState(args: {
  barHeight: ResponsiveTextBarHeight | undefined;
  barWidth?: ResponsiveTextBarWidth;
  lineHeight: ResponsiveTextLineHeight;
  lines?: ResponsiveTextLineCount;
  lastBarWidth?: ResponsiveTextLastBarWidth;
  responsiveBy?: TextSkeletonResponsiveBy;
  breakpointMap?: BreakpointMap;
}): ResponsiveTextRenderState {
  const breakpointMap = args.breakpointMap ?? BREAKPOINT_MAP;
  const responsiveBy = args.responsiveBy ?? "viewport";
  const breakpoints = collectResponsiveTextBreakpoints({
    barHeight: args.barHeight,
    barWidth: args.barWidth,
    lineHeight: args.lineHeight,
    lines: args.lines,
    lastBarWidth: args.lastBarWidth,
    breakpointMap,
  });

  const states = breakpoints.reduce<ResponsiveTextStateRule[]>((acc, minWidth) => {
    const nextState = buildManualTextState({
      barHeight: args.barHeight,
      barWidth: args.barWidth,
      lineHeight: args.lineHeight,
      lines: args.lines,
      lastBarWidth: args.lastBarWidth,
      minWidth,
      breakpointMap,
    });

    const last = acc[acc.length - 1];
    if (last && sameResolvedTextState(last.state, nextState)) {
      return acc;
    }

    acc.push({
      minWidth,
      state: nextState,
    });
    return acc;
  }, []);

  const baseState =
    states[0]?.state ??
    buildManualTextState({
      barHeight: args.barHeight,
      barWidth: args.barWidth,
      lineHeight: args.lineHeight,
      lines: args.lines,
      lastBarWidth: args.lastBarWidth,
      minWidth: 0,
      breakpointMap,
    });
  const maxLines = states.reduce(
    (max, rule) => Math.max(max, rule.state.lineCount),
    baseState.lineCount
  );

  return {
    baseState,
    states: states.length ? states : [{ minWidth: 0, state: baseState }],
    maxLines,
    usesResponsiveBarCss: states.length > 1,
    baseLines: baseState.lineCount,
    baseLastBarWidth:
      baseState.barWidths[baseState.lineCount - 1] ??
      TEXT_SKELETON_LAST_BAR_WIDTH,
    metrics: baseState.metrics,
    responsiveBy,
  };
}

export function buildResponsiveTextCssRules(
  args:
    | {
        renderState: ResponsiveTextRenderState;
        selectorPlaceholder?: string;
        fitContent?: boolean;
      }
    | {
        barHeight: ResponsiveTextBarHeight | undefined;
        barWidth?: ResponsiveTextBarWidth;
        lineHeight: ResponsiveTextLineHeight;
        lines?: ResponsiveTextLineCount;
        lastBarWidth?: ResponsiveTextLastBarWidth;
        responsiveBy?: TextSkeletonResponsiveBy;
        breakpointMap?: BreakpointMap;
        selectorPlaceholder?: string;
        fitContent?: boolean;
      }
): Array<{
  minWidth: number;
  css: string;
  query?: TextSkeletonResponsiveBy;
}> {
  const renderState =
    "renderState" in args
      ? args.renderState
      : getResponsiveTextRenderState({
          barHeight: args.barHeight,
          barWidth: args.barWidth,
          lineHeight: args.lineHeight,
          lines: args.lines,
          lastBarWidth: args.lastBarWidth,
          responsiveBy: args.responsiveBy,
          breakpointMap: args.breakpointMap,
        });

  if (!renderState.usesResponsiveBarCss) {
    return [];
  }

  const selector =
    args.selectorPlaceholder ?? TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER;
  const fitContent = args.fitContent === true;

  return renderState.states.map(({ minWidth, state }) => {
    const lineSelector = `${selector} [data-rmg-skel-text-line="true"]`;
    const visibleLineSelector = `${lineSelector}:nth-child(-n+${state.lineCount})`;
    const hiddenLineSelector =
      state.lineCount < renderState.maxLines
        ? `${lineSelector}:nth-child(n+${state.lineCount + 1})`
        : null;
    const widthFragments = state.barWidths.map(
      (barWidth, index) =>
        fitContent
          ? `${lineSelector}:nth-child(${index + 1}){width:${barWidth} !important;max-width:${barWidth} !important;}`
          : `${lineSelector}:nth-child(${index + 1}){max-width:${barWidth} !important;}`
    );
    const visibleLineCss = fitContent
      ? `${visibleLineSelector}{display:block !important;max-width:100% !important;}`
      : `${visibleLineSelector}{display:block !important;width:100% !important;max-width:100% !important;}`;

    const safariMetrics = getSafariTextSkeletonMetricsFromMetrics(state.metrics);

    return {
      minWidth,
      query: renderState.responsiveBy,
      css: [
        `${selector}{height:${state.metrics.totalHeight}px !important;padding-block:${state.metrics.paddingBlock}px !important;row-gap:${state.metrics.rowGap}px !important;}`,
        `@supports ${SAFARI_TEXT_SKELETON_SUPPORTS}{${selector}{height:${safariMetrics.totalHeight}px !important;padding-block:${safariMetrics.paddingBlock}px !important;row-gap:${safariMetrics.rowGap}px !important;}}`,
        `${lineSelector}{display:none !important;height:${state.metrics.barHeight}px !important;}`,
        visibleLineCss,
        ...(hiddenLineSelector
          ? [`${hiddenLineSelector}{display:none !important;}`]
          : []),
        ...widthFragments,
      ].join(""),
    };
  });
}
