import {
  BREAKPOINT_MAP,
  DEFAULT_SERVER_VIEWPORT_WIDTH,
  parseNumberLike,
  resolveNumberFromResponsive,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../../shared/responsive";

export type MasonryPlacement = "balanced" | "roundRobin" | "horizontalOrder";
export type MasonrySpan = number | "full";
export type ResponsiveMasonrySpan = MasonrySpan | Record<string, MasonrySpan>;

export type MasonryDimensionItem = {
  width: number;
  height: number;
  heightOffsetPx?: MasonryHeightOffsetPx;
  span?: ResponsiveMasonrySpan;
};

export type MasonryHeightOffsetRule = {
  value: number;
  viewportMinWidth?: number;
  containerMinWidth?: number;
};

export type MasonryHeightOffsetPx =
  | number
  | ResponsiveNumber
  | {
      rules: ReadonlyArray<MasonryHeightOffsetRule>;
      fallback?: number;
    };

export type MasonryPositionedItem = {
  index: number;
  span: number;
  columnStart: number;
  top: number;
  left: number;
  width: number;
  height: number;
};

export type MasonryPositionedLayout = {
  items: MasonryPositionedItem[];
  height: number;
  columnWidth: number;
};

export type MasonryFluidPositionedItem = {
  index: number;
  span: number;
  columnStart: number;
  top: string;
  left: string;
  width: string;
  height: string;
};

export type MasonryFluidPositionedLayout = {
  items: MasonryFluidPositionedItem[];
  height: string;
};

function addResponsiveMinWidth(
  value: ResponsiveNumber | ResponsiveMasonrySpan | undefined,
  minWidths: Set<number>,
  breakpointMap: BreakpointMap
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;

  for (const key of Object.keys(value)) {
    const minWidth = parseBreakpointMinWidth(key, breakpointMap);
    if (Number.isFinite(minWidth) && minWidth >= 0) minWidths.add(minWidth);
  }
}

function isHeightOffsetRuleSet(
  value: MasonryHeightOffsetPx | undefined
): value is { rules: ReadonlyArray<MasonryHeightOffsetRule>; fallback?: number } {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray((value as { rules?: unknown }).rules)
  );
}

function addResponsiveHeightOffsetMinWidths(
  value: MasonryHeightOffsetPx | undefined,
  viewportMinWidths: Set<number>,
  containerMinWidths: Set<number>,
  breakpointMap: BreakpointMap
) {
  if (isHeightOffsetRuleSet(value)) {
    for (const rule of value.rules) {
      const viewportMinWidth = Number(rule.viewportMinWidth ?? 0);
      const containerMinWidth = Number(rule.containerMinWidth ?? 0);
      if (Number.isFinite(viewportMinWidth) && viewportMinWidth >= 0) {
        viewportMinWidths.add(viewportMinWidth);
      }
      if (Number.isFinite(containerMinWidth) && containerMinWidth >= 0) {
        containerMinWidths.add(containerMinWidth);
      }
    }
    return;
  }

  addResponsiveMinWidth(value, viewportMinWidths, breakpointMap);
}

function parseBreakpointMinWidth(key: string, breakpointMap: BreakpointMap) {
  const mapped = breakpointMap[key];
  if (typeof mapped === "number" && Number.isFinite(mapped)) return mapped;

  const parsed = Number(key);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function collectMasonryResponsiveMinWidths(args: {
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  items?: ReadonlyArray<MasonryDimensionItem>;
  breakpointMap?: BreakpointMap;
}) {
  const breakpointMap = args.breakpointMap ?? BREAKPOINT_MAP;
  const minWidths = new Set<number>([0]);

  addResponsiveMinWidth(args.columns, minWidths, breakpointMap);
  addResponsiveMinWidth(args.gap, minWidths, breakpointMap);

  for (const item of args.items ?? []) {
    addResponsiveMinWidth(item.span, minWidths, breakpointMap);
    addResponsiveHeightOffsetMinWidths(
      item.heightOffsetPx,
      minWidths,
      new Set<number>(),
      breakpointMap
    );
  }

  return Array.from(minWidths).sort((a, b) => a - b);
}

export function collectMasonryResponsiveContainerMinWidths(args: {
  items?: ReadonlyArray<MasonryDimensionItem>;
  breakpointMap?: BreakpointMap;
}) {
  const breakpointMap = args.breakpointMap ?? BREAKPOINT_MAP;
  const minWidths = new Set<number>([0]);

  for (const item of args.items ?? []) {
    addResponsiveHeightOffsetMinWidths(
      item.heightOffsetPx,
      new Set<number>(),
      minWidths,
      breakpointMap
    );
  }

  return Array.from(minWidths).sort((a, b) => a - b);
}

function normalizeSpanValue(value: MasonrySpan | undefined) {
  if (value === "full") return value;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(1, value | 0);
}

function normalizeSpanRules(
  value: ResponsiveMasonrySpan | undefined,
  breakpointMap: BreakpointMap
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const span = normalizeSpanValue(value as MasonrySpan | undefined);
    return span == null ? [] : [{ minWidth: 0, span }];
  }

  const entries = Object.entries(value)
    .map(([key, raw]) => ({
      minWidth: parseBreakpointMinWidth(key, breakpointMap),
      span: normalizeSpanValue(raw),
    }))
    .filter((entry): entry is { minWidth: number; span: MasonrySpan } => entry.span != null)
    .sort((a, b) => a.minWidth - b.minWidth);

  if (!entries.length) return [];
  if (entries[0]!.minWidth > 0) entries.unshift({ minWidth: 0, span: entries[0]!.span });
  return entries;
}

export function resolveMasonrySpanAtWidth(args: {
  span?: ResponsiveMasonrySpan;
  columnCount: number;
  width: number;
  breakpointMap?: BreakpointMap;
}) {
  const safeColumnCount = Math.max(1, args.columnCount | 0);
  const rules = normalizeSpanRules(args.span, args.breakpointMap ?? BREAKPOINT_MAP);
  if (!rules.length) return 1;

  let resolved = rules[0]!.span;
  for (const rule of rules) {
    if (args.width >= rule.minWidth) resolved = rule.span;
    else break;
  }

  if (resolved === "full") return safeColumnCount;
  return Math.max(1, Math.min(safeColumnCount, resolved | 0));
}

export function resolveMasonryColumns(args: {
  columns?: ResponsiveNumber;
  viewportWidth: number;
  breakpointMap?: BreakpointMap;
  fallback?: number;
}) {
  const raw = resolveNumberFromResponsive(
    args.columns,
    args.fallback ?? 4,
    args.viewportWidth,
    args.breakpointMap ?? BREAKPOINT_MAP
  );
  return Math.max(1, raw | 0);
}

export function resolveMasonryGap(args: {
  gap?: ResponsiveNumber;
  viewportWidth: number;
  breakpointMap?: BreakpointMap;
  fallback?: number;
}) {
  const raw = resolveNumberFromResponsive(
    args.gap,
    args.fallback ?? 8,
    args.viewportWidth,
    args.breakpointMap ?? BREAKPOINT_MAP
  );
  return Math.max(0, parseNumberLike(raw as any, args.fallback ?? 8));
}

function maxRange(values: number[], start: number, span: number) {
  let max = 0;
  for (let index = start; index < start + span; index++) {
    max = Math.max(max, values[index] ?? 0);
  }
  return max;
}

function sumRange(values: number[], start: number, span: number) {
  let total = 0;
  for (let index = start; index < start + span; index++) {
    total += values[index] ?? 0;
  }
  return total;
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normalizeHeightOffsetPx(
  value: MasonryHeightOffsetPx | undefined,
  viewportWidth: number,
  containerWidth: number,
  breakpointMap: BreakpointMap
) {
  if (isHeightOffsetRuleSet(value)) {
    const fallback = Math.max(0, Number(value.fallback ?? 0) || 0);
    let resolved = fallback;

    value.rules
      .slice()
      .sort(
        (a, b) =>
          (a.viewportMinWidth ?? 0) - (b.viewportMinWidth ?? 0) ||
          (a.containerMinWidth ?? 0) - (b.containerMinWidth ?? 0)
      )
      .forEach((rule) => {
        const ruleViewportWidth = Number(rule.viewportMinWidth ?? 0);
        const ruleContainerWidth = Number(rule.containerMinWidth ?? 0);

        if (
          viewportWidth >= ruleViewportWidth &&
          containerWidth >= ruleContainerWidth
        ) {
          const offset = Number(rule.value);
          if (Number.isFinite(offset)) resolved = Math.max(0, offset);
        }
      });

    return resolved;
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Math.max(
      0,
      resolveNumberFromResponsive(value, 0, viewportWidth, breakpointMap)
    );
  }

  const offset = Number(value);
  return Number.isFinite(offset) ? Math.max(0, offset) : 0;
}

type FluidTerm = {
  cqw: number;
  px: number;
};

function roundTerm(value: number) {
  const rounded = round(value);
  return Math.abs(rounded) < 0.001 ? 0 : rounded;
}

function addTerms(a: FluidTerm, b: FluidTerm): FluidTerm {
  return {
    cqw: a.cqw + b.cqw,
    px: a.px + b.px,
  };
}

function scaleTerm(term: FluidTerm, scale: number): FluidTerm {
  return {
    cqw: term.cqw * scale,
    px: term.px * scale,
  };
}

function termAtWidth(term: FluidTerm, width: number) {
  return (term.cqw * width) / 100 + term.px;
}

function maxTermRange(values: FluidTerm[], start: number, span: number, width: number) {
  let max = values[start] ?? { cqw: 0, px: 0 };
  let maxValue = termAtWidth(max, width);

  for (let index = start + 1; index < start + span; index++) {
    const next = values[index] ?? { cqw: 0, px: 0 };
    const nextValue = termAtWidth(next, width);
    if (nextValue > maxValue) {
      max = next;
      maxValue = nextValue;
    }
  }

  return max;
}

function cssTerm(term: FluidTerm) {
  const cqw = roundTerm(term.cqw);
  const px = roundTerm(term.px);

  if (cqw === 0) return `${px}px`;
  if (px === 0) return `${cqw}cqw`;
  return `calc(${cqw}cqw ${px > 0 ? "+" : "-"} ${Math.abs(px)}px)`;
}

export function buildDimensionedMasonryLayout(args: {
  items: ReadonlyArray<MasonryDimensionItem>;
  columnCount: number;
  gapPx: number;
  containerWidth: number;
  placement?: MasonryPlacement;
  viewportWidth?: number;
  breakpointMap?: BreakpointMap;
}): MasonryPositionedLayout {
  const safeColumnCount = Math.max(1, args.columnCount | 0);
  const gapPx = Math.max(0, args.gapPx);
  const containerWidth = Math.max(0, args.containerWidth);
  const columnWidth =
    safeColumnCount <= 1
      ? containerWidth
      : Math.max(0, (containerWidth - gapPx * (safeColumnCount - 1)) / safeColumnCount);
  const colHeights = Array.from({ length: safeColumnCount }, () => 0);
  const colCounts = Array.from({ length: safeColumnCount }, () => 0);
  const positioned: MasonryPositionedItem[] = [];
  const placement = args.placement ?? "balanced";
  const viewportWidth = args.viewportWidth ?? containerWidth;
  let layoutHeight = 0;
  let roundRobinCursor = 0;
  let horizontalCursor = 0;

  args.items.forEach((item, index) => {
    const span = resolveMasonrySpanAtWidth({
      span: item.span,
      columnCount: safeColumnCount,
      width: viewportWidth,
      breakpointMap: args.breakpointMap,
    });
    const maxStart = Math.max(0, safeColumnCount - span);
    const itemWidth = columnWidth * span + gapPx * Math.max(0, span - 1);
    const intrinsicWidth = Number(item.width);
    const intrinsicHeight = Number(item.height);
    const heightOffsetPx = normalizeHeightOffsetPx(
      item.heightOffsetPx,
      viewportWidth,
      containerWidth,
      args.breakpointMap ?? BREAKPOINT_MAP
    );
    const ratioHeight =
      intrinsicWidth > 0 && intrinsicHeight > 0
        ? itemWidth * (intrinsicHeight / intrinsicWidth)
        : 0;
    const itemHeight = ratioHeight + heightOffsetPx;

    let columnStart = 0;
    let top = 0;

    if (placement === "roundRobin") {
      columnStart = roundRobinCursor % Math.max(1, safeColumnCount - span + 1);
      top = maxRange(colHeights, columnStart, span);
      roundRobinCursor += 1;
    } else if (placement === "horizontalOrder") {
      columnStart = horizontalCursor % safeColumnCount;
      if (columnStart + span > safeColumnCount) columnStart = 0;
      top = maxRange(colHeights, columnStart, span);
      horizontalCursor = columnStart + span;
    } else {
      let bestStart = 0;
      let bestTop = Number.POSITIVE_INFINITY;
      let bestCount = Number.POSITIVE_INFINITY;

      for (let start = 0; start <= maxStart; start++) {
        const nextTop = maxRange(colHeights, start, span);
        const nextCount = sumRange(colCounts, start, span);
        if (
          nextTop < bestTop ||
          (nextTop === bestTop && nextCount < bestCount) ||
          (nextTop === bestTop && nextCount === bestCount && start < bestStart)
        ) {
          bestStart = start;
          bestTop = nextTop;
          bestCount = nextCount;
        }
      }

      columnStart = bestStart;
      top = Number.isFinite(bestTop) ? bestTop : 0;
    }

    const nextHeight = top + itemHeight + gapPx;
    for (let track = columnStart; track < columnStart + span; track++) {
      colHeights[track] = nextHeight;
      colCounts[track] = (colCounts[track] ?? 0) + 1;
    }

    layoutHeight = Math.max(layoutHeight, top + itemHeight);

    positioned.push({
      index,
      span,
      columnStart,
      top: round(top),
      left: round(columnStart * (columnWidth + gapPx)),
      width: round(itemWidth),
      height: round(itemHeight),
    });
  });

  return {
    items: positioned,
    height: round(layoutHeight),
    columnWidth: round(columnWidth),
  };
}

export function buildDimensionedMasonryFluidLayout(args: {
  items: ReadonlyArray<MasonryDimensionItem>;
  columnCount: number;
  gapPx: number;
  placement?: MasonryPlacement;
  viewportWidth?: number;
  containerWidth?: number;
  breakpointMap?: BreakpointMap;
}): MasonryFluidPositionedLayout {
  const safeColumnCount = Math.max(1, args.columnCount | 0);
  const gapPx = Math.max(0, args.gapPx);
  const colHeights = Array.from(
    { length: safeColumnCount },
    (): FluidTerm => ({ cqw: 0, px: 0 })
  );
  const colCounts = Array.from({ length: safeColumnCount }, () => 0);
  const positioned: MasonryFluidPositionedItem[] = [];
  const placement = args.placement ?? "balanced";
  const viewportWidth = args.viewportWidth ?? DEFAULT_SERVER_VIEWPORT_WIDTH;
  const containerWidth = args.containerWidth ?? viewportWidth;
  let layoutHeight: FluidTerm = { cqw: 0, px: 0 };
  let roundRobinCursor = 0;
  let horizontalCursor = 0;

  args.items.forEach((item, index) => {
    const span = resolveMasonrySpanAtWidth({
      span: item.span,
      columnCount: safeColumnCount,
      width: viewportWidth,
      breakpointMap: args.breakpointMap,
    });
    const maxStart = Math.max(0, safeColumnCount - span);
    const itemWidth: FluidTerm = {
      cqw: (100 * span) / safeColumnCount,
      px: gapPx * (span / safeColumnCount - 1),
    };
    const intrinsicWidth = Number(item.width);
    const intrinsicHeight = Number(item.height);
    const heightOffsetPx = normalizeHeightOffsetPx(
      item.heightOffsetPx,
      viewportWidth,
      containerWidth,
      args.breakpointMap ?? BREAKPOINT_MAP
    );
    const ratioHeight =
      intrinsicWidth > 0 && intrinsicHeight > 0
        ? scaleTerm(itemWidth, intrinsicHeight / intrinsicWidth)
        : { cqw: 0, px: 0 };
    const itemHeight = addTerms(ratioHeight, { cqw: 0, px: heightOffsetPx });

    let columnStart = 0;
    let top: FluidTerm = { cqw: 0, px: 0 };

    if (placement === "roundRobin") {
      columnStart = roundRobinCursor % Math.max(1, safeColumnCount - span + 1);
      top = maxTermRange(colHeights, columnStart, span, viewportWidth);
      roundRobinCursor += 1;
    } else if (placement === "horizontalOrder") {
      columnStart = horizontalCursor % safeColumnCount;
      if (columnStart + span > safeColumnCount) columnStart = 0;
      top = maxTermRange(colHeights, columnStart, span, viewportWidth);
      horizontalCursor = columnStart + span;
    } else {
      let bestStart = 0;
      let bestTop = Number.POSITIVE_INFINITY;
      let bestCount = Number.POSITIVE_INFINITY;

      for (let start = 0; start <= maxStart; start++) {
        const nextTopTerm = maxTermRange(colHeights, start, span, viewportWidth);
        const nextTop = termAtWidth(nextTopTerm, viewportWidth);
        const nextCount = sumRange(colCounts, start, span);
        if (
          nextTop < bestTop ||
          (nextTop === bestTop && nextCount < bestCount) ||
          (nextTop === bestTop && nextCount === bestCount && start < bestStart)
        ) {
          bestStart = start;
          bestTop = nextTop;
          bestCount = nextCount;
        }
      }

      columnStart = bestStart;
      top = Number.isFinite(bestTop)
        ? maxTermRange(colHeights, bestStart, span, viewportWidth)
        : { cqw: 0, px: 0 };
    }

    const itemBottom = addTerms(top, itemHeight);
    const nextHeight = addTerms(itemBottom, { cqw: 0, px: gapPx });
    for (let track = columnStart; track < columnStart + span; track++) {
      colHeights[track] = nextHeight;
      colCounts[track] = (colCounts[track] ?? 0) + 1;
    }

    if (termAtWidth(itemBottom, viewportWidth) > termAtWidth(layoutHeight, viewportWidth)) {
      layoutHeight = itemBottom;
    }

    positioned.push({
      index,
      span,
      columnStart,
      top: cssTerm(top),
      left: cssTerm({
        cqw: (100 * columnStart) / safeColumnCount,
        px: (gapPx * columnStart) / safeColumnCount,
      }),
      width: cssTerm(itemWidth),
      height: cssTerm(itemHeight),
    });
  });

  return {
    items: positioned,
    height: cssTerm(layoutHeight),
  };
}
