import {
  BREAKPOINT_MAP,
  normalizeResponsiveNumberRules,
  resolveNumberFromResponsive,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../../../Gallery/shared/responsive";
import type { GridSpan, ResponsiveGridSpan, ResponsiveGridTemplate } from "../../../Gallery/grid/types";
import type { MasonrySpan, ResponsiveMasonrySpan } from "../../../Gallery/masonry/types";
import {
  SkeletonTextAnalyzerError,
  type LayoutWidthResolver,
} from "../types";

export function mergeBreakpointMap(
  breakpointMap?: BreakpointMap
): BreakpointMap {
  return {
    ...BREAKPOINT_MAP,
    ...(breakpointMap ?? {}),
  };
}

export function uniqueSorted(values: Iterable<number>): number[] {
  return Array.from(new Set(values))
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((a, b) => a - b);
}

export function collectResponsiveNumberBreakpoints(
  value: ResponsiveNumber | undefined,
  breakpointMap: BreakpointMap,
  out: Set<number>
) {
  for (const rule of normalizeResponsiveNumberRules(value, breakpointMap)) {
    if (rule.minWidth > 0) out.add(rule.minWidth);
  }
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function collectLayoutWidthResolverBreakpoints(
  resolver: LayoutWidthResolver | undefined,
  out: Set<number>
) {
  if (!resolver) return;

  switch (resolver.kind) {
    case "demoCanvasShell": {
      if (resolver.shellMarginBreakpointPx > 0) {
        out.add(resolver.shellMarginBreakpointPx);
      }
      if (resolver.stackBreakpointPx > 0) {
        out.add(resolver.stackBreakpointPx);
      }

      const ratio = resolver.canvasPaddingViewportRatio;
      if (ratio > 0) {
        const minBreakpoint = Math.ceil(resolver.canvasPaddingMinPx / ratio);
        const maxBreakpoint = Math.ceil(resolver.canvasPaddingMaxPx / ratio);

        if (Number.isFinite(minBreakpoint) && minBreakpoint > 0) {
          out.add(minBreakpoint);
        }
        if (Number.isFinite(maxBreakpoint) && maxBreakpoint > 0) {
          out.add(maxBreakpoint);
        }
      }

      const desktopCapBreakpoint =
        resolver.shellMaxWidthPx + resolver.shellMarginDesktopPx;
      const compactCapBreakpoint =
        resolver.shellMaxWidthPx + resolver.shellMarginCompactPx;

      if (desktopCapBreakpoint > 0) {
        out.add(desktopCapBreakpoint);
      }
      if (compactCapBreakpoint > 0) {
        out.add(compactCapBreakpoint);
      }
      return;
    }
    default: {
      const exhaustive: never = resolver;
      return exhaustive;
    }
  }
}

export function resolveLayoutWidthAtViewport(args: {
  viewportWidth: number;
  layoutWidthPx?: number;
  layoutWidthResolver?: LayoutWidthResolver;
}): number {
  if (args.layoutWidthPx != null) {
    return Math.max(1, args.layoutWidthPx);
  }

  const resolver = args.layoutWidthResolver;
  if (!resolver) return Math.max(1, args.viewportWidth);

  switch (resolver.kind) {
    case "demoCanvasShell": {
      const shellOuterMargin =
        args.viewportWidth <= resolver.shellMarginBreakpointPx
          ? resolver.shellMarginCompactPx
          : resolver.shellMarginDesktopPx;
      const shellWidth = Math.min(
        resolver.shellMaxWidthPx,
        Math.max(1, args.viewportWidth - shellOuterMargin)
      );
      const mainWidth =
        args.viewportWidth <= resolver.stackBreakpointPx
          ? shellWidth
          : Math.max(
              1,
              shellWidth - resolver.sidebarWidthPx - resolver.layoutGapPx
            );
      const canvasPadding = clampNumber(
        args.viewportWidth * resolver.canvasPaddingViewportRatio,
        resolver.canvasPaddingMinPx,
        resolver.canvasPaddingMaxPx
      );
      const canvasBorder = Math.max(0, resolver.canvasBorderWidthPx ?? 0);

      return Math.max(
        1,
        mainWidth - canvasPadding * 2 - canvasBorder * 2
      );
    }
    default: {
      const exhaustive: never = resolver;
      return exhaustive;
    }
  }
}

function parsePositiveNumber(value: string, detail: Record<string, unknown>): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new SkeletonTextAnalyzerError(
      "UNSUPPORTED_TEMPLATE_COLUMNS",
      "Encountered an unsupported numeric token while parsing templateColumns.",
      detail
    );
  }
  return parsed;
}

function parseBreakpointMinWidth(key: string, breakpointMap: BreakpointMap): number {
  const mapped = breakpointMap[key];
  if (typeof mapped === "number" && Number.isFinite(mapped)) return mapped;

  const parsed = parseFloat(key);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeGridSpanValue(value: GridSpan | undefined): GridSpan | undefined {
  if (value === "full") return value;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(1, value | 0);
}

function normalizeResponsiveGridSpanRules(
  value: ResponsiveGridSpan | undefined,
  breakpointMap: BreakpointMap
): Array<{ minWidth: number; span: GridSpan }> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const span = normalizeGridSpanValue(value);
    return span == null ? [] : [{ minWidth: 0, span }];
  }

  const entries = Object.entries(value)
    .map(([key, rawSpan]) => ({
      minWidth: parseBreakpointMinWidth(key, breakpointMap),
      span: normalizeGridSpanValue(rawSpan),
    }))
    .filter((entry): entry is { minWidth: number; span: GridSpan } => entry.span != null)
    .sort((a, b) => a.minWidth - b.minWidth);

  if (!entries.length) return [];

  if (entries[0]!.minWidth > 0) {
    entries.unshift({ minWidth: 0, span: entries[0]!.span });
  } else if (entries[0]!.minWidth < 0) {
    entries[0] = { ...entries[0]!, minWidth: 0 };
  }

  return entries;
}

function normalizeMasonrySpanValue(value: MasonrySpan | undefined): MasonrySpan | undefined {
  if (value === "full") return value;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(1, value | 0);
}

function normalizeResponsiveMasonrySpanRules(
  value: ResponsiveMasonrySpan | undefined,
  breakpointMap: BreakpointMap
): Array<{ minWidth: number; span: MasonrySpan }> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const span = normalizeMasonrySpanValue(value);
    return span == null ? [] : [{ minWidth: 0, span }];
  }

  const entries = Object.entries(value)
    .map(([key, rawSpan]) => ({
      minWidth: parseBreakpointMinWidth(key, breakpointMap),
      span: normalizeMasonrySpanValue(rawSpan),
    }))
    .filter((entry): entry is { minWidth: number; span: MasonrySpan } => entry.span != null)
    .sort((a, b) => a.minWidth - b.minWidth);

  if (!entries.length) return [];

  if (entries[0]!.minWidth > 0) {
    entries.unshift({ minWidth: 0, span: entries[0]!.span });
  } else if (entries[0]!.minWidth < 0) {
    entries[0] = { ...entries[0]!, minWidth: 0 };
  }

  return entries;
}

function resolveResponsiveTemplateColumnsValue(
  value: ResponsiveGridTemplate | undefined,
  viewportWidth: number,
  breakpointMap: BreakpointMap
): string | undefined {
  if (!value || typeof value === "string") {
    return value;
  }

  let resolved: string | undefined;
  const entries = Object.entries(value)
    .map(([key, raw]) => ({
      minWidth: breakpointMap[key] ?? Number(key),
      value: raw,
    }))
    .filter((entry) => Number.isFinite(entry.minWidth))
    .sort((a, b) => a.minWidth - b.minWidth);

  for (const entry of entries) {
    if (viewportWidth >= entry.minWidth) resolved = entry.value;
    else break;
  }

  return resolved;
}

function splitTemplateColumns(template: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of template.trim()) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);

    if (/\s/.test(char) && depth === 0) {
      if (current) {
        parts.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current) parts.push(current);
  return parts;
}

function splitTopLevelArgs(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);

    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function expandTemplateColumns(template: string): string[] {
  const parts = splitTemplateColumns(template);
  const expanded: string[] = [];

  for (const part of parts) {
    const repeatMatch = part.match(/^repeat\(\s*(\d+)\s*,(.*)\)$/i);
    if (!repeatMatch) {
      expanded.push(part);
      continue;
    }

    const count = parsePositiveNumber(repeatMatch[1]!, {
      templateColumns: template,
      token: part,
    });
    const inner = repeatMatch[2]!.trim();
    const innerParts = expandTemplateColumns(inner);

    for (let index = 0; index < count; index += 1) {
      expanded.push(...innerParts);
    }
  }

  return expanded;
}

type GridTrackDefinition = {
  minPx: number;
  flexFr: number;
  fixedPx: number | null;
};

function parseTrackLengthToken(
  token: string,
  detail: Record<string, unknown>
): { kind: "px"; value: number } | { kind: "fr"; value: number } {
  const trimmed = token.trim();
  if (trimmed === "0") return { kind: "px", value: 0 };

  const pxMatch = trimmed.match(/^(-?\d*\.?\d+)px$/i);
  if (pxMatch) {
    return { kind: "px", value: parsePositiveNumber(pxMatch[1]!, detail) };
  }

  const frMatch = trimmed.match(/^(-?\d*\.?\d+)fr$/i);
  if (frMatch) {
    return { kind: "fr", value: parsePositiveNumber(frMatch[1]!, detail) };
  }

  throw new SkeletonTextAnalyzerError(
    "UNSUPPORTED_TEMPLATE_COLUMNS",
    "Only px, fr, repeat(), and minmax(px|0, px|fr) template columns are supported by the development text analyzer.",
    {
      ...detail,
      token: trimmed,
    }
  );
}

function parseGridTrackDefinition(token: string, templateColumns: string): GridTrackDefinition {
  const trimmed = token.trim();
  const detail = { templateColumns, token: trimmed };

  if (/^minmax\(/i.test(trimmed)) {
    const inner = trimmed.replace(/^minmax\(/i, "").replace(/\)$/, "");
    const [minToken, maxToken] = splitTopLevelArgs(inner);

    if (!minToken || !maxToken) {
      throw new SkeletonTextAnalyzerError(
        "UNSUPPORTED_TEMPLATE_COLUMNS",
        "minmax() tracks must include both min and max values.",
        detail
      );
    }

    const min = parseTrackLengthToken(minToken, detail);
    const max = parseTrackLengthToken(maxToken, detail);

    if (min.kind === "fr") {
      throw new SkeletonTextAnalyzerError(
        "UNSUPPORTED_TEMPLATE_COLUMNS",
        "minmax() minimums must resolve to px or 0 for the development text analyzer.",
        detail
      );
    }

    if (max.kind === "px") {
      return {
        minPx: min.value,
        flexFr: 0,
        fixedPx: Math.max(min.value, max.value),
      };
    }

    return {
      minPx: min.value,
      flexFr: max.value,
      fixedPx: null,
    };
  }

  const length = parseTrackLengthToken(trimmed, detail);
  if (length.kind === "px") {
    return {
      minPx: length.value,
      flexFr: 0,
      fixedPx: length.value,
    };
  }

  return {
    minPx: 0,
    flexFr: length.value,
    fixedPx: null,
  };
}

export function parseTemplateColumnCount(
  template: string | undefined
): number | null {
  if (!template) return null;

  const parts = expandTemplateColumns(template);
  return parts.length > 0 ? parts.length : null;
}

export function resolveGridColumnCount(args: {
  columns: ResponsiveNumber | undefined;
  templateColumns?: ResponsiveGridTemplate;
  viewportWidth: number;
  breakpointMap: BreakpointMap;
}): number {
  if (args.columns != null) {
    return Math.max(
      1,
      Math.round(resolveNumberFromResponsive(args.columns, 1, args.viewportWidth, args.breakpointMap))
    );
  }

  const template = resolveResponsiveTemplateColumnsValue(
    args.templateColumns,
    args.viewportWidth,
    args.breakpointMap
  );
  const parsed = parseTemplateColumnCount(template);
  if (parsed != null) return Math.max(1, parsed);

  throw new SkeletonTextAnalyzerError(
    "UNSUPPORTED_TEMPLATE_COLUMNS",
    "Grid text analysis requires either numeric columns or a simple templateColumns value with a determinable column count.",
    {
      templateColumns: template,
      viewportWidth: args.viewportWidth,
    }
  );
}

export function collectResponsiveTemplateColumnBreakpoints(
  value: ResponsiveGridTemplate | undefined,
  breakpointMap: BreakpointMap,
  out: Set<number>
) {
  if (!value || typeof value === "string") return;

  for (const key of Object.keys(value)) {
    const minWidth = breakpointMap[key] ?? Number(key);
    if (Number.isFinite(minWidth) && minWidth > 0) out.add(minWidth);
  }
}

export function resolveGridTemplateTrackWidths(args: {
  templateColumns: ResponsiveGridTemplate;
  layoutWidth: number;
  gap: number;
  viewportWidth: number;
  breakpointMap: BreakpointMap;
}): number[] {
  const resolvedTemplate = resolveResponsiveTemplateColumnsValue(
    args.templateColumns,
    args.viewportWidth,
    args.breakpointMap
  );

  if (!resolvedTemplate) {
    throw new SkeletonTextAnalyzerError(
      "UNSUPPORTED_TEMPLATE_COLUMNS",
      "templateColumns must resolve to a concrete string at the requested viewport width.",
      {
        viewportWidth: args.viewportWidth,
        templateColumns: args.templateColumns,
      }
    );
  }

  const tracks = expandTemplateColumns(resolvedTemplate).map((token) =>
    parseGridTrackDefinition(token, resolvedTemplate)
  );
  const totalGap = Math.max(0, tracks.length - 1) * args.gap;
  const available = Math.max(0, args.layoutWidth - totalGap);
  const widths = new Array<number>(tracks.length).fill(0);
  let remaining = available;

  const unresolved = new Set<number>();

  tracks.forEach((track, index) => {
    if (track.fixedPx != null) {
      widths[index] = track.fixedPx;
      remaining -= track.fixedPx;
    } else {
      unresolved.add(index);
    }
  });

  while (unresolved.size > 0) {
    const flexTotal = Array.from(unresolved).reduce(
      (sum, index) => sum + tracks[index]!.flexFr,
      0
    );

    if (flexTotal <= 0) {
      for (const index of unresolved) {
        widths[index] = tracks[index]!.minPx;
      }
      break;
    }

    const unit = Math.max(0, remaining) / flexTotal;
    let frozeTrack = false;

    for (const index of Array.from(unresolved)) {
      const track = tracks[index]!;
      const candidate = track.flexFr * unit;

      if (candidate < track.minPx) {
        widths[index] = track.minPx;
        remaining -= track.minPx;
        unresolved.delete(index);
        frozeTrack = true;
      }
    }

    if (frozeTrack) {
      continue;
    }

    for (const index of unresolved) {
      const track = tracks[index]!;
      widths[index] = track.flexFr * unit;
    }
    break;
  }

  return widths;
}

export function resolveGridColumnStartAtViewport(args: {
  columnStart: ResponsiveNumber | undefined;
  viewportWidth: number;
  breakpointMap: BreakpointMap;
  columnCount: number;
}): number {
  const resolved = Math.round(
    resolveNumberFromResponsive(args.columnStart, 1, args.viewportWidth, args.breakpointMap)
  );
  return Math.max(1, Math.min(args.columnCount, resolved));
}

export function resolveGridSpanAtViewport(args: {
  span: ResponsiveGridSpan | undefined;
  columnCount: number;
  viewportWidth: number;
  breakpointMap: BreakpointMap;
}): number {
  const rules = normalizeResponsiveGridSpanRules(args.span, args.breakpointMap);
  if (!rules.length) return 1;

  let resolved = rules[0]!.span;
  for (const rule of rules) {
    if (args.viewportWidth >= rule.minWidth) resolved = rule.span;
    else break;
  }

  if (resolved === "full") return args.columnCount;
  if (typeof resolved !== "number" || !Number.isFinite(resolved)) return 1;
  return Math.max(1, Math.min(args.columnCount, Math.round(resolved)));
}

export function collectResponsiveGridSpanBreakpoints(
  value: ResponsiveGridSpan | undefined,
  breakpointMap: BreakpointMap,
  out: Set<number>
) {
  for (const rule of normalizeResponsiveGridSpanRules(value, breakpointMap)) {
    if (rule.minWidth > 0) out.add(rule.minWidth);
  }
}

export function resolveMasonrySpanAtViewport(args: {
  span: ResponsiveMasonrySpan | undefined;
  columnCount: number;
  viewportWidth: number;
  breakpointMap: BreakpointMap;
}): number {
  const rules = normalizeResponsiveMasonrySpanRules(args.span, args.breakpointMap);
  if (!rules.length) return 1;

  let resolved = rules[0]!.span;
  for (const rule of rules) {
    if (args.viewportWidth >= rule.minWidth) resolved = rule.span;
    else break;
  }

  if (resolved === "full") return Math.max(1, args.columnCount | 0);
  if (typeof resolved !== "number" || !Number.isFinite(resolved)) return 1;
  return Math.max(1, Math.min(args.columnCount, resolved | 0));
}

export function collectResponsiveMasonrySpanBreakpoints(
  value: ResponsiveMasonrySpan | undefined,
  breakpointMap: BreakpointMap,
  out: Set<number>
) {
  for (const rule of normalizeResponsiveMasonrySpanRules(value, breakpointMap)) {
    if (rule.minWidth > 0) out.add(rule.minWidth);
  }
}
