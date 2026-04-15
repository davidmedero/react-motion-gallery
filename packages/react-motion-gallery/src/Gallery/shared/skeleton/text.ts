import { BREAKPOINT_MAP, type BreakpointMap } from "../responsive";

export const TEXT_SKELETON_LAST_LINE_WIDTH = "68%";
export const TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER = "__NODE_SEL__";

export type ResponsiveTextLineCount = number | Record<string, number>;
export type ResponsiveTextLineWidth =
  | number
  | string
  | Record<string, number | string>;

export type TextSkeletonMetrics = {
  lines: number;
  lineBoxHeight: number;
  lineBarHeight: number;
  leading: number;
  paddingBlock: number;
  rowGap: number;
  totalHeight: number;
};

export type ResponsiveTextRenderState = {
  baseLines: number;
  maxLines: number;
  baseLineWidth: string;
  metrics: TextSkeletonMetrics;
};

export function getTextSkeletonMetrics(args: {
  fontSize: number;
  lineHeight: number;
  lines?: number;
}): TextSkeletonMetrics {
  const lines = Math.max(1, Math.trunc(args.lines ?? 1));
  const lineBoxHeight = Math.max(0, args.fontSize * args.lineHeight);
  const lineBarHeight = Math.min(Math.max(0, args.fontSize), lineBoxHeight);
  const leading = Math.max(lineBoxHeight - lineBarHeight, 0);

  return {
    lines,
    lineBoxHeight,
    lineBarHeight,
    leading,
    paddingBlock: leading / 2,
    rowGap: leading,
    totalHeight: lineBoxHeight * lines,
  };
}

function isResponsiveTextRecord(
  value: unknown,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): value is Record<string, number | string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.keys(value).some(
    (key) => parseResponsiveMinWidth(key, breakpointMap) != null
  );
}

function clampTextLines(value: number | undefined, fallback: number): number {
  const n = Number.isFinite(value) ? Math.trunc(value as number) : fallback;
  return Math.max(1, n);
}

function parseResponsiveMinWidth(
  key: string,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number | null {
  const named = breakpointMap[key];
  if (Number.isFinite(named)) return Math.max(0, named);

  const n = Number(key);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, n);
}

function toCssLength(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export function hasResponsiveTextLineCount(
  value: ResponsiveTextLineCount | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): value is Record<string, number> {
  return isResponsiveTextRecord(value, breakpointMap);
}

export function hasResponsiveTextLineWidth(
  value: ResponsiveTextLineWidth | undefined,
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
    if (minWidth >= rule.minWidth) resolved = rule.lines;
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

export function normalizeResponsiveTextLineWidthRules(
  value: ResponsiveTextLineWidth | undefined,
  fallback = TEXT_SKELETON_LAST_LINE_WIDTH,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): Array<{ minWidth: number; lineWidth: string }> {
  if (!hasResponsiveTextLineWidth(value, breakpointMap)) {
    return [
      {
        minWidth: 0,
        lineWidth: toCssLength(
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
        lineWidth: toCssLength(raw),
      };
    })
    .filter(
      (entry): entry is { minWidth: number; lineWidth: string } => !!entry
    )
    .sort((a, b) => a.minWidth - b.minWidth)
    .reduce<Array<{ minWidth: number; lineWidth: string }>>((acc, entry) => {
      const last = acc[acc.length - 1];
      if (last && last.minWidth === entry.minWidth) {
        last.lineWidth = entry.lineWidth;
      } else {
        acc.push(entry);
      }
      return acc;
    }, []);

  if (entries.length === 0) {
    return [{ minWidth: 0, lineWidth: toCssLength(fallback) }];
  }

  if (entries[0].minWidth > 0) {
    entries.unshift({ minWidth: 0, lineWidth: toCssLength(fallback) });
  }

  return entries;
}

export function resolveResponsiveTextLineWidth(
  value: ResponsiveTextLineWidth | undefined,
  fallback = TEXT_SKELETON_LAST_LINE_WIDTH,
  minWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string {
  const rules = normalizeResponsiveTextLineWidthRules(
    value,
    fallback,
    breakpointMap
  );
  let resolved = rules[0]?.lineWidth ?? toCssLength(fallback);

  for (const rule of rules) {
    if (minWidth >= rule.minWidth) resolved = rule.lineWidth;
  }

  return resolved;
}

export function collectResponsiveTextBreakpoints(args: {
  lines?: ResponsiveTextLineCount;
  lineWidth?: ResponsiveTextLineWidth;
  breakpointMap?: BreakpointMap;
}): number[] {
  const minWidths = new Set<number>();
  const breakpointMap = args.breakpointMap ?? BREAKPOINT_MAP;

  for (const rule of normalizeResponsiveTextLineCountRules(
    args.lines,
    1,
    breakpointMap
  )) {
    minWidths.add(rule.minWidth);
  }

  for (const rule of normalizeResponsiveTextLineWidthRules(
    args.lineWidth,
    TEXT_SKELETON_LAST_LINE_WIDTH,
    breakpointMap
  )) {
    minWidths.add(rule.minWidth);
  }

  return Array.from(minWidths).sort((a, b) => a - b);
}

export function getResponsiveTextRenderState(args: {
  fontSize: number;
  lineHeight: number;
  lines?: ResponsiveTextLineCount;
  lineWidth?: ResponsiveTextLineWidth;
  breakpointMap?: BreakpointMap;
}): ResponsiveTextRenderState {
  const breakpointMap = args.breakpointMap ?? BREAKPOINT_MAP;
  const baseLines = resolveResponsiveTextLineCount(
    args.lines,
    1,
    0,
    breakpointMap
  );
  const maxLines = maxResponsiveTextLineCount(
    args.lines,
    baseLines,
    breakpointMap
  );
  const baseLineWidth = resolveResponsiveTextLineWidth(
    args.lineWidth,
    TEXT_SKELETON_LAST_LINE_WIDTH,
    0,
    breakpointMap
  );

  return {
    baseLines,
    maxLines,
    baseLineWidth,
    metrics: getTextSkeletonMetrics({
      fontSize: args.fontSize,
      lineHeight: args.lineHeight,
      lines: baseLines,
    }),
  };
}

export function buildResponsiveTextCssRules(args: {
  fontSize: number;
  lineHeight: number;
  lines?: ResponsiveTextLineCount;
  lineWidth?: ResponsiveTextLineWidth;
  selectorPlaceholder?: string;
  breakpointMap?: BreakpointMap;
}): Array<{ minWidth: number; css: string }> {
  const selector =
    args.selectorPlaceholder ?? TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER;
  const breakpointMap = args.breakpointMap ?? BREAKPOINT_MAP;
  const hasResponsiveRules =
    hasResponsiveTextLineCount(args.lines, breakpointMap) ||
    hasResponsiveTextLineWidth(args.lineWidth, breakpointMap);

  if (!hasResponsiveRules) {
    return [];
  }

  const breakpoints = collectResponsiveTextBreakpoints({
    lines: args.lines,
    lineWidth: args.lineWidth,
    breakpointMap,
  });

  const maxLines = maxResponsiveTextLineCount(args.lines, 1, breakpointMap);

  return breakpoints.map((minWidth) => {
    const lines = resolveResponsiveTextLineCount(
      args.lines,
      1,
      minWidth,
      breakpointMap
    );
    const lineWidth = resolveResponsiveTextLineWidth(
      args.lineWidth,
      TEXT_SKELETON_LAST_LINE_WIDTH,
      minWidth,
      breakpointMap
    );
    const metrics = getTextSkeletonMetrics({
      fontSize: args.fontSize,
      lineHeight: args.lineHeight,
      lines,
    });
    const lineSelector = `${selector} [data-rmg-skel-text-line="true"]`;
    const visibleLineSelector = `${lineSelector}:nth-child(-n+${lines})`;
    const fragments = [
      `${selector}{height:${metrics.totalHeight}px;padding-block:${metrics.paddingBlock}px;row-gap:${metrics.rowGap}px;}`,
      `${visibleLineSelector}{display:block;width:100%;}`,
      `${lineSelector}:nth-child(${lines}){width:${lineWidth};}`,
    ];

    if (lines < maxLines) {
      fragments.push(
        `${lineSelector}:nth-child(n+${lines + 1}){display:none;}`
      );
    }

    return {
      minWidth,
      css: fragments.join(""),
    };
  });
}
