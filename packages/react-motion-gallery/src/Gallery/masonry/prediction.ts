/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CSSProperties } from "react";

import {
  BREAKPOINT_MAP,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsive";
import { parseNumberLike } from "../shared/responsive";
import {
  type SkeletonBaseStyle,
  type SkeletonContainerStyle,
  type SkeletonContainerStyleResponsive,
  type SkeletonLength,
  type SkeletonResponsiveCssEntry,
  buildResponsiveCssText,
  collectResponsiveStyleBreakpoints,
  collectResponsiveCss,
  containerStylesPlain,
  resolveInlineResponsiveContainerStyle,
  resolveResponsiveBaseStyleAtMinWidth,
  resolveResponsiveContainerStyleAtMinWidth,
} from "../shared/skeleton/layout";
import {
  getTextSkeletonMetrics,
  normalizeResponsiveTextLineCountRules,
  resolveResponsiveTextLineCount,
} from "../shared/skeleton/text";

import type {
  MasonrySkeletonLayoutNode,
  MasonrySkeletonSpec,
  MasonrySkeletonWrapStyle,
  SkeletonNode,
} from "./MasonrySkeleton";

type Rule = { minWidth: number; value: number };

const DEFAULT_MASONRY_REFERENCE_WIDTH_PX = 240;
const DEFAULT_MASONRY_SKELETON_RATIOS = [55, 90, 130, 75];

export type MasonryPlacement = "balanced" | "roundRobin";

export type MasonryPredictionFlexState = {
  minWidth: number;
  columns: number;
  gapPx: number;
  key: string;
};

export type MasonryResolvedSkeletonSlot = {
  item: SkeletonNode;
  itemWrapStyle: MasonrySkeletonWrapStyle | undefined;
  ratio: number | null;
  heightPx: number | null;
};

export type MasonryPredictionVariantItem = {
  index: number;
  height: number;
  columnIndex: number;
  slot: MasonryResolvedSkeletonSlot | null;
  heightCssExpr: string;
};

export type MasonryPredictionVariant = {
  state: MasonryPredictionFlexState;
  items: MasonryPredictionVariantItem[];
};

export type MasonrySkeletonPrediction = {
  itemCount: number;
  states: MasonryPredictionFlexState[];
  variants: MasonryPredictionVariant[];
  structuredLayout: MasonrySkeletonLayoutNode | null;
  structuredNodeId?: string;
  plainStructuredStyle?: CSSProperties;
  responsiveCss: string;
};

type BuildMasonrySkeletonPredictionArgs = {
  count: number;
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  breakpoints?: BreakpointMap;
  ratios?: number[];
  heightsPx?: number[];
  placement?: MasonryPlacement;
  estimatedItemHeight?: number;
  spec?: MasonrySkeletonSpec;
  scopeId?: string;
  respectLayoutCount?: boolean;
};

function defaultMasonrySpec(): MasonrySkeletonSpec {
  return {
    ratios: [...DEFAULT_MASONRY_SKELETON_RATIOS],
    radius: 12,
  };
}

function cssPx(value: number) {
  return `${Math.max(0, value)}px`;
}

function cssCalc(expr: string) {
  return `calc(${expr})`;
}

function cssAdd(parts: Array<string | null | undefined>) {
  const valid = parts.filter(Boolean) as string[];
  if (!valid.length) return "0px";
  if (valid.length === 1) return valid[0]!;
  return cssCalc(valid.join(" + "));
}

function cssSub(a: string, b: string) {
  return cssCalc(`${a} - ${b}`);
}

function cssMul(expr: string, factor: number) {
  return cssCalc(`${expr} * ${factor}`);
}

function cssDiv(expr: string, divisor: number) {
  return cssCalc(`${expr} / ${divisor}`);
}

function cssMax(parts: Array<string | null | undefined>) {
  const valid = parts.filter(Boolean) as string[];
  if (!valid.length) return "0px";
  if (valid.length === 1) return valid[0]!;
  return `max(${valid.join(", ")})`;
}

function normalizeRulesFromResponsiveNumber(
  val: ResponsiveNumber | undefined,
  breakpoints?: BreakpointMap
): Rule[] {
  if (!val) return [];
  if (typeof val === "number") return [];
  if (typeof val === "string") return [];
  if (typeof val !== "object") return [];

  const rules: Rule[] = [];

  for (const [key, raw] of Object.entries(val as Record<string, any>)) {
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;

    if (String(+key) === key) {
      const minWidth = +key;
      if (Number.isFinite(minWidth) && minWidth >= 0) {
        rules.push({ minWidth, value });
      }
      continue;
    }

    const bp = breakpoints?.[key as keyof BreakpointMap];
    if (typeof bp === "number" && Number.isFinite(bp)) {
      rules.push({ minWidth: bp, value });
    }
  }

  rules.sort((a, b) => a.minWidth - b.minWidth);

  const out: Rule[] = [];
  for (const rule of rules) {
    const last = out[out.length - 1];
    if (last && last.minWidth === rule.minWidth) {
      last.value = rule.value;
    } else {
      out.push(rule);
    }
  }

  return out;
}

function resolveBaseNumberFromResponsive(
  val: ResponsiveNumber | undefined,
  rules: Rule[],
  fallback: number
): number {
  if (val == null) return fallback;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  }
  if (rules.length) return rules[0]!.value;
  return fallback;
}

function valueAtMinWidth(rules: Rule[], minWidth: number, base: number) {
  let out = base;
  for (const rule of rules) {
    if (rule.minWidth <= minWidth) out = rule.value;
    else break;
  }
  return out;
}

function mergeWrapStyles(
  base: MasonrySkeletonWrapStyle | undefined,
  override: MasonrySkeletonWrapStyle | undefined
): MasonrySkeletonWrapStyle | undefined {
  if (!base && !override) return undefined;
  return {
    ...(base || {}),
    ...(override || {}),
  };
}

function parseSkeletonLengthPx(
  value: SkeletonLength | undefined,
  relativeToPx?: number
): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.endsWith("%")) {
    const percent = Number(trimmed.slice(0, -1));
    if (!Number.isFinite(percent) || relativeToPx == null) return null;
    return (relativeToPx * percent) / 100;
  }

  const parsed = parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseSkeletonLengthCssExpr(
  value: SkeletonLength | undefined,
  relativeExpr?: string
): string | null {
  if (value == null) return null;
  if (typeof value === "number") return cssPx(value);

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.endsWith("%")) {
    const percent = Number(trimmed.slice(0, -1));
    if (!Number.isFinite(percent) || !relativeExpr) return null;
    return cssCalc(`${relativeExpr} * ${percent / 100}`);
  }

  return trimmed;
}

function parseAspectRatio(value: SkeletonLength | undefined): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  const normalized = value.replace(/\s+/g, "");
  if (!normalized) return null;

  if (normalized.includes("/")) {
    const [wRaw, hRaw] = normalized.split("/");
    const w = Number(wRaw);
    const h = Number(hRaw);
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      return w / h;
    }
    return null;
  }

  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseInsetPx(
  value: SkeletonLength | undefined,
  axis: "block" | "inline",
  relativeToPx?: number
): number {
  if (value == null) return 0;

  const parts = value
    .toString()
    .trim()
    .split(/\s+/)
    .map((part) => parseSkeletonLengthPx(part, relativeToPx))
    .filter((part) => Number.isFinite(part));

  if (!parts.length) return 0;
  if (parts.length === 1) return parts[0]! * 2;
  if (parts.length === 2) {
    return axis === "block" ? parts[0]! * 2 : parts[1]! * 2;
  }
  if (parts.length === 3) {
    return axis === "block" ? parts[0]! + parts[2]! : parts[1]! * 2;
  }
  return axis === "block" ? parts[0]! + parts[2]! : parts[1]! + parts[3]!;
}

function parseInsetCssExpr(
  value: SkeletonLength | undefined,
  axis: "block" | "inline",
  relativeExpr?: string
): string | null {
  if (value == null) return null;

  const parts = value
    .toString()
    .trim()
    .split(/\s+/)
    .map((part) => parseSkeletonLengthCssExpr(part, relativeExpr))
    .filter(Boolean) as string[];

  if (!parts.length) return null;
  if (parts.length === 1) return cssMul(parts[0]!, 2);
  if (parts.length === 2) {
    return axis === "block" ? cssMul(parts[0]!, 2) : cssMul(parts[1]!, 2);
  }
  if (parts.length === 3) {
    return axis === "block"
      ? cssAdd([parts[0]!, parts[2]!])
      : cssMul(parts[1]!, 2);
  }
  return axis === "block"
    ? cssAdd([parts[0]!, parts[2]!])
    : cssAdd([parts[1]!, parts[3]!]);
}

function parseBorderBlockPx(border: CSSProperties["border"] | undefined): number {
  if (typeof border !== "string") return 0;
  const first = border.trim().split(/\s+/)[0];
  const width = parseSkeletonLengthPx(first);
  return width != null ? width * 2 : 0;
}

function parseBorderInlinePx(border: CSSProperties["border"] | undefined): number {
  return parseBorderBlockPx(border);
}

function parseBorderBlockCssExpr(border: CSSProperties["border"] | undefined): string | null {
  if (typeof border !== "string") return null;
  const first = border.trim().split(/\s+/)[0];
  const width = parseSkeletonLengthCssExpr(first);
  return width ? cssMul(width, 2) : null;
}

function parseBorderInlineCssExpr(border: CSSProperties["border"] | undefined): string | null {
  return parseBorderBlockCssExpr(border);
}

function boxMarginsBlockPx(
  style: SkeletonBaseStyle | undefined,
  relativeToPx?: number
): number {
  return (
    (parseSkeletonLengthPx(style?.marginTop, relativeToPx) ?? 0) +
    (parseSkeletonLengthPx(style?.marginBottom, relativeToPx) ?? 0)
  );
}

function boxMarginsBlockCssExpr(
  style: SkeletonBaseStyle | undefined,
  relativeExpr?: string
): string | null {
  const top = parseSkeletonLengthCssExpr(style?.marginTop, relativeExpr);
  const bottom = parseSkeletonLengthCssExpr(style?.marginBottom, relativeExpr);
  if (!top && !bottom) return null;
  return cssAdd([top ?? "0px", bottom ?? "0px"]);
}

function wrapExtrasBlockPx(
  style: MasonrySkeletonWrapStyle | undefined,
  relativeToPx?: number
): number {
  if (!style) return 0;
  return (
    boxMarginsBlockPx(style, relativeToPx) +
    parseInsetPx(style.padding, "block", relativeToPx) +
    parseBorderBlockPx(style.border)
  );
}

function wrapExtrasBlockCssExpr(
  style: MasonrySkeletonWrapStyle | undefined,
  relativeExpr?: string
): string | null {
  if (!style) return null;
  return cssAdd([
    boxMarginsBlockCssExpr(style, relativeExpr) ?? "0px",
    parseInsetCssExpr(style.padding, "block", relativeExpr) ?? "0px",
    parseBorderBlockCssExpr(style.border) ?? "0px",
  ]);
}

function wrapContentWidthPx(
  outerWidthPx: number | null,
  style: MasonrySkeletonWrapStyle | undefined
): number | null {
  if (outerWidthPx == null) return null;

  return Math.max(
    0,
    outerWidthPx -
      parseInsetPx(style?.padding, "inline", outerWidthPx) -
      parseBorderInlinePx(style?.border)
  );
}

function wrapContentWidthCssExpr(
  outerWidthExpr: string | null,
  style: MasonrySkeletonWrapStyle | undefined
): string | null {
  if (!outerWidthExpr) return null;

  const inlinePadding = parseInsetCssExpr(style?.padding, "inline", outerWidthExpr);
  const inlineBorder = parseBorderInlineCssExpr(style?.border);

  if (!inlinePadding && !inlineBorder) return outerWidthExpr;

  return cssSub(
    outerWidthExpr,
    cssAdd([inlinePadding ?? "0px", inlineBorder ?? "0px"])
  );
}

function containerContentWidthPx(
  outerWidthPx: number | null,
  style: SkeletonContainerStyle | undefined
): number | null {
  if (outerWidthPx == null) return null;
  return Math.max(0, outerWidthPx - parseInsetPx(style?.padding, "inline", outerWidthPx));
}

function containerContentWidthCssExpr(
  outerWidthExpr: string | null,
  style: SkeletonContainerStyle | undefined
): string | null {
  if (!outerWidthExpr) return null;
  const inlinePadding = parseInsetCssExpr(style?.padding, "inline", outerWidthExpr);
  if (!inlinePadding) return outerWidthExpr;
  return cssSub(outerWidthExpr, inlinePadding);
}

function resolveOuterWidthPx(
  style: SkeletonBaseStyle | undefined,
  fallbackWidthPx: number
): number {
  const widthPx =
    parseSkeletonLengthPx(style?.width, fallbackWidthPx) ?? fallbackWidthPx;
  const maxWidthPx = parseSkeletonLengthPx(style?.maxWidth, fallbackWidthPx);

  if (maxWidthPx == null) return Math.max(0, widthPx);
  return Math.max(0, Math.min(widthPx, maxWidthPx));
}

function resolveOuterWidthCssExpr(
  style: SkeletonBaseStyle | undefined,
  fallbackWidthExpr: string
): string {
  const widthExpr = parseSkeletonLengthCssExpr(style?.width, fallbackWidthExpr) ?? fallbackWidthExpr;
  const maxWidthExpr = parseSkeletonLengthCssExpr(style?.maxWidth, fallbackWidthExpr);

  if (!maxWidthExpr) return widthExpr;
  return cssMax([`min(${widthExpr}, ${maxWidthExpr})`]);
}

function resolveContainerStyleAtMinWidth(
  style: SkeletonContainerStyleResponsive | undefined,
  minWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SkeletonContainerStyle | undefined {
  return resolveResponsiveContainerStyleAtMinWidth(
    style,
    minWidth,
    breakpointMap
  );
}

function estimateSkeletonNodeHeightPx(
  node: SkeletonNode,
  args?: {
    responsiveMinWidth?: number;
    availableWidthPx?: number | null;
    breakpointMap?: BreakpointMap;
  }
): number | null {
  const responsiveMinWidth = args?.responsiveMinWidth ?? 0;
  const availableWidthPx = args?.availableWidthPx ?? null;
  const breakpointMap = args?.breakpointMap ?? BREAKPOINT_MAP;

  if (node.kind === "rect" || node.kind === "square" || node.kind === "circle") {
    const style = resolveResponsiveBaseStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const explicitHeight = parseSkeletonLengthPx(style?.height, availableWidthPx ?? undefined);
    if (explicitHeight != null) {
      return explicitHeight + boxMarginsBlockPx(style, availableWidthPx ?? undefined);
    }

    const explicitWidth = resolveOuterWidthPx(
      style,
      availableWidthPx ?? DEFAULT_MASONRY_REFERENCE_WIDTH_PX
    );
    if (node.kind === "square" && explicitWidth != null) {
      return explicitWidth + boxMarginsBlockPx(style, availableWidthPx ?? undefined);
    }

    const aspectRatio = parseAspectRatio(style?.aspectRatio);
    if (aspectRatio != null && explicitWidth != null && explicitWidth > 0) {
      return (
        explicitWidth / aspectRatio +
        boxMarginsBlockPx(style, availableWidthPx ?? undefined)
      );
    }

    const margins = boxMarginsBlockPx(style, availableWidthPx ?? undefined);
    return margins > 0 ? margins : null;
  }

  if (node.kind === "text") {
    const style = resolveResponsiveBaseStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const lineCount = resolveResponsiveTextLineCount(
      node.lines,
      1,
      responsiveMinWidth,
      breakpointMap
    );
    const metrics = getTextSkeletonMetrics({
      fontSize: node.fontSize,
      lineHeight: node.lineHeight,
      lines: lineCount,
    });
    return metrics.totalHeight + boxMarginsBlockPx(style, availableWidthPx ?? undefined);
  }

  if (node.kind === "media") {
    const plain = resolveContainerStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const contentWidthPx = containerContentWidthPx(availableWidthPx, plain);
    const gapPx = parseSkeletonLengthPx(plain?.gap, contentWidthPx ?? undefined) ?? 0;
    const paddingPx = parseInsetPx(plain?.padding, "block", availableWidthPx ?? undefined);
    const count = Math.max(0, node.count | 0);

    const tileNode: SkeletonNode = {
      kind: node.tile?.shape ?? "rect",
      style: node.tile?.style,
      shimmer: node.tile?.shimmer,
    } as SkeletonNode;

    const tileWidthPx =
      (node.direction ?? "row") === "row" && count > 1 && contentWidthPx != null
        ? Math.max(0, (contentWidthPx - gapPx * Math.max(0, count - 1)) / count)
        : contentWidthPx;

    const tileHeight = estimateSkeletonNodeHeightPx(tileNode, {
      responsiveMinWidth,
      availableWidthPx: tileWidthPx,
      breakpointMap,
    });
    if (tileHeight == null) return paddingPx || null;

    if ((node.direction ?? "row") === "row" || count <= 1) {
      return tileHeight + paddingPx;
    }

    return tileHeight * count + gapPx * Math.max(0, count - 1) + paddingPx;
  }

  if (node.kind === "row" || node.kind === "col" || node.kind === "stack") {
    const plain = resolveContainerStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const contentWidthPx = containerContentWidthPx(availableWidthPx, plain);
    const gapPx = parseSkeletonLengthPx(plain?.gap, contentWidthPx ?? undefined) ?? 0;
    const paddingPx = parseInsetPx(plain?.padding, "block", availableWidthPx ?? undefined);
    const childHeights = node.children
      .map((child) =>
        estimateSkeletonNodeHeightPx(child, {
          responsiveMinWidth,
          availableWidthPx: contentWidthPx,
          breakpointMap,
        })
      )
      .filter((value): value is number => value != null);

    if (!childHeights.length) return paddingPx || null;

    if (node.kind === "row") {
      return Math.max(...childHeights) + paddingPx;
    }

    return (
      childHeights.reduce((sum, value) => sum + value, 0) +
      gapPx * Math.max(0, childHeights.length - 1) +
      paddingPx
    );
  }

  return null;
}

function estimateSkeletonNodeHeightCssExpr(
  node: SkeletonNode,
  args?: {
    responsiveMinWidth?: number;
    availableWidthExpr?: string | null;
    breakpointMap?: BreakpointMap;
  }
): string | null {
  const responsiveMinWidth = args?.responsiveMinWidth ?? 0;
  const availableWidthExpr = args?.availableWidthExpr ?? null;
  const breakpointMap = args?.breakpointMap ?? BREAKPOINT_MAP;

  if (node.kind === "rect" || node.kind === "square" || node.kind === "circle") {
    const style = resolveResponsiveBaseStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const explicitHeight = parseSkeletonLengthCssExpr(style?.height, availableWidthExpr ?? undefined);
    if (explicitHeight != null) {
      return cssAdd([
        explicitHeight,
        boxMarginsBlockCssExpr(style, availableWidthExpr ?? undefined) ?? "0px",
      ]);
    }

    const explicitWidth = resolveOuterWidthCssExpr(
      style,
      availableWidthExpr ?? cssPx(DEFAULT_MASONRY_REFERENCE_WIDTH_PX)
    );
    if (node.kind === "square") {
      return cssAdd([
        explicitWidth,
        boxMarginsBlockCssExpr(style, availableWidthExpr ?? undefined) ?? "0px",
      ]);
    }

    const aspectRatio = parseAspectRatio(style?.aspectRatio);
    if (aspectRatio != null) {
      return cssAdd([
        cssDiv(explicitWidth, aspectRatio),
        boxMarginsBlockCssExpr(style, availableWidthExpr ?? undefined) ?? "0px",
      ]);
    }

    const margins = boxMarginsBlockCssExpr(style, availableWidthExpr ?? undefined);
    return margins ?? null;
  }

  if (node.kind === "text") {
    const style = resolveResponsiveBaseStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const lineCount = resolveResponsiveTextLineCount(
      node.lines,
      1,
      responsiveMinWidth,
      breakpointMap
    );
    const metrics = getTextSkeletonMetrics({
      fontSize: node.fontSize,
      lineHeight: node.lineHeight,
      lines: lineCount,
    });
    return cssAdd([
      cssPx(metrics.totalHeight),
      boxMarginsBlockCssExpr(style, availableWidthExpr ?? undefined) ?? "0px",
    ]);
  }

  if (node.kind === "media") {
    const plain = resolveContainerStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const contentWidthExpr = containerContentWidthCssExpr(availableWidthExpr, plain);
    const gapExpr = parseSkeletonLengthCssExpr(plain?.gap, contentWidthExpr ?? undefined) ?? "0px";
    const paddingExpr = parseInsetCssExpr(plain?.padding, "block", availableWidthExpr ?? undefined) ?? "0px";
    const count = Math.max(0, node.count | 0);

    const tileNode: SkeletonNode = {
      kind: node.tile?.shape ?? "rect",
      style: node.tile?.style,
      shimmer: node.tile?.shimmer,
    } as SkeletonNode;

    const tileWidthExpr =
      (node.direction ?? "row") === "row" && count > 1 && contentWidthExpr != null
        ? cssDiv(
            cssSub(contentWidthExpr, cssMul(gapExpr, Math.max(0, count - 1))),
            count
          )
        : contentWidthExpr;

    const tileHeightExpr = estimateSkeletonNodeHeightCssExpr(tileNode, {
      responsiveMinWidth,
      availableWidthExpr: tileWidthExpr,
      breakpointMap,
    });

    if (tileHeightExpr == null) return paddingExpr || null;

    if ((node.direction ?? "row") === "row" || count <= 1) {
      return cssAdd([tileHeightExpr, paddingExpr]);
    }

    return cssAdd([
      cssMul(tileHeightExpr, count),
      cssMul(gapExpr, Math.max(0, count - 1)),
      paddingExpr,
    ]);
  }

  if (node.kind === "row" || node.kind === "col" || node.kind === "stack") {
    const plain = resolveContainerStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const contentWidthExpr = containerContentWidthCssExpr(availableWidthExpr, plain);
    const gapExpr = parseSkeletonLengthCssExpr(plain?.gap, contentWidthExpr ?? undefined) ?? "0px";
    const paddingExpr = parseInsetCssExpr(plain?.padding, "block", availableWidthExpr ?? undefined) ?? "0px";

    const childExprs = node.children
      .map((child) =>
        estimateSkeletonNodeHeightCssExpr(child, {
          responsiveMinWidth,
          availableWidthExpr: contentWidthExpr,
          breakpointMap,
        })
      )
      .filter((value): value is string => !!value);

    if (!childExprs.length) return paddingExpr || null;

    if (node.kind === "row") {
      return cssAdd([cssMax(childExprs), paddingExpr]);
    }

    return cssAdd([
      ...childExprs.flatMap((expr, index) =>
        index > 0 ? [gapExpr, expr] : [expr]
      ),
      paddingExpr,
    ]);
  }

  return null;
}

function isLeadVisualNode(node: SkeletonNode): boolean {
  return (
    node.kind === "rect" ||
    node.kind === "square" ||
    node.kind === "circle" ||
    node.kind === "media"
  );
}

function getSupplementalNodeForMasonryItem(
  node: SkeletonNode
): { lead: SkeletonNode | null; supplemental: SkeletonNode | null } {
  if ((node.kind === "col" || node.kind === "stack") && node.children.length > 0) {
    const [first, ...rest] = node.children;

    if (first && isLeadVisualNode(first)) {
      if (rest.length === 0) {
        return { lead: first, supplemental: null };
      }

      return {
        lead: first,
        supplemental: {
          kind: node.kind,
          style: node.style,
          children: rest,
        },
      };
    }
  }

  return { lead: null, supplemental: null };
}

function estimateMasonrySupplementalHeightPx(args: {
  slot: MasonryResolvedSkeletonSlot | null;
  state: MasonryPredictionFlexState;
  wrapOuterWidthPx: number;
  breakpointMap: BreakpointMap;
}): { leadPx: number | null; supplementalPx: number } {
  const { slot, state, wrapOuterWidthPx, breakpointMap } = args;
  if (!slot) return { leadPx: null, supplementalPx: 0 };

  const contentWidthPx = wrapContentWidthPx(wrapOuterWidthPx, slot.itemWrapStyle);
  const split = getSupplementalNodeForMasonryItem(slot.item);

  if (!split.lead) {
    return { leadPx: null, supplementalPx: 0 };
  }

  const leadPx = estimateSkeletonNodeHeightPx(split.lead, {
    responsiveMinWidth: state.minWidth,
    availableWidthPx: contentWidthPx,
    breakpointMap,
  });

  if (!split.supplemental) {
    return { leadPx, supplementalPx: 0 };
  }

  const fullPx = estimateSkeletonNodeHeightPx(slot.item, {
    responsiveMinWidth: state.minWidth,
    availableWidthPx: contentWidthPx,
    breakpointMap,
  });

  if (fullPx == null || leadPx == null) {
    return { leadPx, supplementalPx: 0 };
  }

  return {
    leadPx,
    supplementalPx: Math.max(0, fullPx - leadPx),
  };
}

function estimateMasonrySupplementalHeightCssExpr(args: {
  slot: MasonryResolvedSkeletonSlot | null;
  state: MasonryPredictionFlexState;
  wrapOuterWidthCssExpr: string;
  breakpointMap: BreakpointMap;
}): { leadExpr: string | null; supplementalExpr: string | null } {
  const { slot, state, wrapOuterWidthCssExpr, breakpointMap } = args;
  if (!slot) return { leadExpr: null, supplementalExpr: null };

  const contentWidthExpr = wrapContentWidthCssExpr(
    wrapOuterWidthCssExpr,
    slot.itemWrapStyle
  );

  const split = getSupplementalNodeForMasonryItem(slot.item);

  if (!split.lead) {
    return { leadExpr: null, supplementalExpr: null };
  }

  const leadExpr = estimateSkeletonNodeHeightCssExpr(split.lead, {
    responsiveMinWidth: state.minWidth,
    availableWidthExpr: contentWidthExpr,
    breakpointMap,
  });

  if (!split.supplemental) {
    return { leadExpr, supplementalExpr: null };
  }

  const fullExpr = estimateSkeletonNodeHeightCssExpr(slot.item, {
    responsiveMinWidth: state.minWidth,
    availableWidthExpr: contentWidthExpr,
    breakpointMap,
  });

  if (!fullExpr || !leadExpr) {
    return { leadExpr, supplementalExpr: null };
  }

  return {
    leadExpr,
    supplementalExpr: cssSub(fullExpr, leadExpr),
  };
}

function normalizeSlotRatio(value: number | undefined): number | null {
  if (value == null) return null;
  const ratio = Number(value);
  return Number.isFinite(ratio) ? Math.max(25, Math.min(260, ratio)) : null;
}

function normalizeSlotHeight(value: number | undefined): number | null {
  if (value == null) return null;
  const height = Number(value);
  return Number.isFinite(height) && height > 0 ? height : null;
}

function resolveMasonrySlot(
  layout: MasonrySkeletonLayoutNode,
  slotIndex: number
): MasonryResolvedSkeletonSlot {
  const slot = layout.slots?.[slotIndex];
  return {
    item: slot?.item ?? layout.item,
    itemWrapStyle: mergeWrapStyles(layout.itemWrapStyle, slot?.itemWrapStyle),
    ratio: normalizeSlotRatio(slot?.ratio),
    heightPx: normalizeSlotHeight(slot?.heightPx),
  };
}

export function resolveActiveFlexStateKey(
  states: MasonryPredictionFlexState[],
  viewportWidth: number
): string | null {
  if (!states.length) return null;

  let active = states[0]!;
  for (const state of states) {
    if (viewportWidth >= state.minWidth) {
      active = state;
    } else {
      break;
    }
  }

  return active.key;
}

function buildFlexStates(args: {
  columnsRules: Rule[];
  gapRules: Rule[];
  baseColumns: number;
  baseGapPx: number;
  extraMinWidths?: Iterable<number>;
}) {
  const { columnsRules, gapRules, baseColumns, baseGapPx, extraMinWidths } = args;

  const mins = new Set<number>([0]);
  const extraMins = new Set<number>();
  for (const rule of columnsRules) mins.add(rule.minWidth);
  for (const rule of gapRules) mins.add(rule.minWidth);
  if (extraMinWidths) {
    for (const minWidth of extraMinWidths) {
      const normalized = Math.max(0, minWidth | 0);
      mins.add(normalized);
      extraMins.add(normalized);
    }
  }

  const sorted = Array.from(mins).sort((a, b) => a - b);

  const states: MasonryPredictionFlexState[] = [];
  let prevRawKey = "";

  for (const minWidth of sorted) {
    const colsRaw = valueAtMinWidth(columnsRules, minWidth, baseColumns);
    const gapRaw = valueAtMinWidth(gapRules, minWidth, baseGapPx);

    const columns = Math.max(1, colsRaw | 0);
    const gapPx = Math.max(0, parseNumberLike(gapRaw as any, baseGapPx));
    const rawKey = `c${columns}_g${gapPx}`;

    if (rawKey === prevRawKey && !extraMins.has(minWidth)) continue;

    states.push({
      minWidth,
      columns,
      gapPx,
      key: rawKey === prevRawKey ? `${rawKey}_m${minWidth}` : rawKey,
    });
    prevRawKey = rawKey;
  }

  return states.length
    ? states
    : [
        {
          minWidth: 0,
          columns: baseColumns,
          gapPx: baseGapPx,
          key: `c${baseColumns}_g${baseGapPx}`,
        },
      ];
}

function collectStructuredLayoutBreakpoints(
  node: MasonrySkeletonSpec["layout"] | SkeletonNode | undefined,
  out: Set<number>,
  breakpointMap: BreakpointMap
) {
  if (!node) return;

  if (node.kind === "masonry") {
    collectResponsiveStyleBreakpoints(node.style, out, breakpointMap);
    collectStructuredLayoutBreakpoints(node.item, out, breakpointMap);
    for (const slot of node.slots ?? []) {
      collectStructuredLayoutBreakpoints(slot.item, out, breakpointMap);
    }
    return;
  }

  switch (node.kind) {
    case "rect":
    case "square":
    case "circle":
      collectResponsiveStyleBreakpoints(node.style, out, breakpointMap);
      return;

    case "text":
      collectResponsiveStyleBreakpoints(node.style, out, breakpointMap);
      for (const rule of normalizeResponsiveTextLineCountRules(
        node.lines,
        1,
        breakpointMap
      )) {
        out.add(rule.minWidth);
      }
      return;

    case "media":
      collectResponsiveStyleBreakpoints(node.style, out, breakpointMap);
      collectResponsiveStyleBreakpoints(node.tile?.style, out, breakpointMap);
      return;

    case "stack":
    case "row":
    case "col":
      collectResponsiveStyleBreakpoints(node.style, out, breakpointMap);
      for (const child of node.children) {
        collectStructuredLayoutBreakpoints(child, out, breakpointMap);
      }
      return;
  }
}

function buildStructuredLayout(args: {
  layout?: MasonrySkeletonSpec["layout"];
  scopeId?: string;
  breakpointMap?: BreakpointMap;
}) {
  if (!args.layout) {
    return {
      structuredLayout: null,
      responsiveCss: "",
    };
  }

  let n = 0;
  const allocId = () => `n${++n}`;
  const collected: SkeletonResponsiveCssEntry[] = [];
  const layout = collectResponsiveCss(
    args.layout,
    allocId,
    collected,
    "masonry",
    args.breakpointMap ?? BREAKPOINT_MAP
  );
  const responsiveCss = args.scopeId
    ? buildResponsiveCssText({
        scopeAttr: "data-rmg-mskel-scope",
        scopeId: args.scopeId,
        rules: collected,
      })
    : "";

  return {
    structuredLayout: layout as MasonrySkeletonLayoutNode,
    responsiveCss,
  };
}

function buildMasonryColumnWidthCssExpr(options?: {
  colsCssVar?: string;
  gapCssVar?: string;
  containerWidthCss?: string;
}) {
  const colsCssVar = options?.colsCssVar ?? "--rmg-cols";
  const gapCssVar = options?.gapCssVar ?? "--rmg-gap";
  const containerWidthCss = options?.containerWidthCss ?? "100cqw";

  return cssCalc(
    `(${containerWidthCss} - ((var(${colsCssVar}) - 1) * var(${gapCssVar}))) / var(${colsCssVar})`
  );
}

function buildMasonryItemHeightCssExpr(args: {
  index: number;
  slot: MasonryResolvedSkeletonSlot | null;
  state: MasonryPredictionFlexState;
  safeRatios: number[];
  safeHeights: number[] | null;
  estimatedItemHeight: number;
  columnWidthCssExpr: string;
  breakpointMap: BreakpointMap;
}): string {
  const {
    index,
    slot,
    state,
    safeRatios,
    safeHeights,
    estimatedItemHeight,
    columnWidthCssExpr,
    breakpointMap,
  } = args;

  if (slot) {
    const wrapOuterWidthCssExpr = resolveOuterWidthCssExpr(
      slot.itemWrapStyle,
      columnWidthCssExpr
    );
    const contentWidthExpr = wrapContentWidthCssExpr(
      wrapOuterWidthCssExpr,
      slot.itemWrapStyle
    );

    const fullExpr = estimateSkeletonNodeHeightCssExpr(slot.item, {
      responsiveMinWidth: state.minWidth,
      availableWidthExpr: contentWidthExpr,
      breakpointMap,
    });

    if (fullExpr) {
      return fullExpr;
    }
  }

  const wrapOuterWidthCssExpr = resolveOuterWidthCssExpr(
    slot?.itemWrapStyle,
    columnWidthCssExpr
  );

  if (slot?.heightPx != null) return cssPx(slot.heightPx);
  if (slot?.ratio != null) return cssCalc(`${wrapOuterWidthCssExpr} * ${slot.ratio / 100}`);
  if (safeHeights?.length) return cssPx(safeHeights[index % safeHeights.length]!);
  if (safeRatios.length) {
    return cssCalc(
      `${wrapOuterWidthCssExpr} * ${safeRatios[index % safeRatios.length]! / 100}`
    );
  }
  if (estimatedItemHeight > 0) return cssPx(estimatedItemHeight);

  return wrapOuterWidthCssExpr;
}

function predictMasonryItemHeight(args: {
  index: number;
  slot: MasonryResolvedSkeletonSlot | null;
  state: MasonryPredictionFlexState;
  safeRatios: number[];
  safeHeights: number[] | null;
  estimatedItemHeight: number;
  columnWidthPx: number;
  breakpointMap: BreakpointMap;
}): number {
  const {
    index,
    slot,
    state,
    safeRatios,
    safeHeights,
    estimatedItemHeight,
    columnWidthPx,
    breakpointMap,
  } = args;

  if (slot) {
    const wrapOuterWidthPx = resolveOuterWidthPx(slot.itemWrapStyle, columnWidthPx);
    const contentWidthPx = wrapContentWidthPx(wrapOuterWidthPx, slot.itemWrapStyle);

    const fullPx = estimateSkeletonNodeHeightPx(slot.item, {
      responsiveMinWidth: state.minWidth,
      availableWidthPx: contentWidthPx,
      breakpointMap,
    });

    if (fullPx != null) {
      return Math.ceil(fullPx);
    }
  }

  const wrapOuterWidthPx = resolveOuterWidthPx(slot?.itemWrapStyle, columnWidthPx);

  const baseHeight =
    slot?.heightPx != null
      ? slot.heightPx
      : slot?.ratio != null
      ? Math.round((slot.ratio / 100) * wrapOuterWidthPx)
      : safeHeights?.length
      ? safeHeights[index % safeHeights.length]!
      : safeRatios.length
      ? Math.round((safeRatios[index % safeRatios.length] / 100) * wrapOuterWidthPx)
      : estimatedItemHeight || wrapOuterWidthPx;

  return Math.ceil(baseHeight);
}

export function buildMasonryColumnLayout(args: {
  itemCount: number;
  columnCount: number;
  placement: MasonryPlacement;
  heights: number[];
  estimatedItemHeight: number;
  gapPx: number;
}) {
  const { itemCount, columnCount, placement, heights, estimatedItemHeight, gapPx } = args;
  const layout: number[] = new Array(itemCount);

  if (placement === "roundRobin") {
    for (let i = 0; i < itemCount; i++) {
      layout[i] = i % columnCount;
    }
    return layout;
  }

  const colHeights = new Array(columnCount).fill(0);
  const colCounts = new Array(columnCount).fill(0);

  for (let i = 0; i < itemCount; i++) {
    const h = heights[i] ?? estimatedItemHeight;

    let minCol = 0;
    let minHeight = colHeights[0] ?? 0;
    let minCount = colCounts[0] ?? 0;

    for (let c = 1; c < columnCount; c++) {
      const nextHeight = colHeights[c] ?? 0;
      const nextCount = colCounts[c] ?? 0;

      if (
        nextHeight < minHeight ||
        (nextHeight === minHeight && nextCount < minCount)
      ) {
        minHeight = nextHeight;
        minCount = nextCount;
        minCol = c;
      }
    }

    layout[i] = minCol;
    colHeights[minCol] += h + gapPx;
    colCounts[minCol] += 1;
  }

  return layout;
}

export function buildMasonrySkeletonPrediction(
  args: BuildMasonrySkeletonPredictionArgs
): MasonrySkeletonPrediction {
  const s = args.spec ?? defaultMasonrySpec();
  const effectiveBreakpoints = {
    ...BREAKPOINT_MAP,
    ...(args.breakpoints ?? {}),
  };

  const defaultRatios = (s.ratios ?? DEFAULT_MASONRY_SKELETON_RATIOS) as number[];
  const safeRatios =
    (Array.isArray(args.ratios) && args.ratios.length
      ? args.ratios
      : Array.isArray(s.ratios) && s.ratios.length
      ? s.ratios
      : defaultRatios)
      .map((ratio) => Number(ratio))
      .filter((ratio) => Number.isFinite(ratio))
      .map((ratio) => Math.max(25, Math.min(220, ratio)));

  const safeHeights =
    (Array.isArray(args.heightsPx) && args.heightsPx.length
      ? args.heightsPx
      : Array.isArray(s.heightsPx) && s.heightsPx.length
      ? s.heightsPx
      : null)
      ?.map((height) => Number(height))
      .filter((height) => Number.isFinite(height) && height > 0) ?? null;

  const estimatedItemHeight = Math.max(0, (args.estimatedItemHeight ?? 0) | 0);

  const columnsRules = normalizeRulesFromResponsiveNumber(
    args.columns,
    effectiveBreakpoints
  );
  const gapRules = normalizeRulesFromResponsiveNumber(
    args.gap,
    effectiveBreakpoints
  );

  const baseColumnsRaw = resolveBaseNumberFromResponsive(args.columns, columnsRules, 4);
  const baseGapRaw = resolveBaseNumberFromResponsive(args.gap, gapRules, 8);

  const baseColumns = Math.max(1, baseColumnsRaw | 0);
  const baseGapPx = Math.max(0, parseNumberLike(baseGapRaw as any, 8));

  const states = buildFlexStates({
    columnsRules,
    gapRules,
    baseColumns,
    baseGapPx,
    extraMinWidths: (() => {
      const minWidths = new Set<number>();
      collectStructuredLayoutBreakpoints(s.layout, minWidths, effectiveBreakpoints);
      return minWidths;
    })(),
  });

  const { structuredLayout, responsiveCss } = buildStructuredLayout({
    layout: s.layout,
    scopeId: args.scopeId,
    breakpointMap: effectiveBreakpoints,
  });

  const itemCount =
    args.respectLayoutCount === false
      ? Math.max(0, args.count | 0)
      : structuredLayout?.count != null
      ? Math.max(0, structuredLayout.count | 0)
      : Math.max(0, args.count | 0);

  const effectivePlacement: MasonryPlacement = args.placement ?? "balanced";
  const columnWidthCssExpr = buildMasonryColumnWidthCssExpr();

  const variants = states.map((state) => {
    const containerWidthPx = Math.max(state.minWidth || DEFAULT_MASONRY_REFERENCE_WIDTH_PX, DEFAULT_MASONRY_REFERENCE_WIDTH_PX);

    const columnWidthPx =
      state.columns > 0
        ? (containerWidthPx - state.gapPx * (state.columns - 1)) / state.columns
        : containerWidthPx;

    const itemData = Array.from({ length: itemCount }, (_, index) => {
      const slot = structuredLayout ? resolveMasonrySlot(structuredLayout, index) : null;

      const height = predictMasonryItemHeight({
        index,
        slot,
        state,
        safeRatios,
        safeHeights,
        estimatedItemHeight,
        columnWidthPx,
        breakpointMap: effectiveBreakpoints,
      });

      const heightCssExpr = buildMasonryItemHeightCssExpr({
        index,
        slot,
        state,
        safeRatios,
        safeHeights,
        estimatedItemHeight,
        columnWidthCssExpr,
        breakpointMap: effectiveBreakpoints,
      });

      return {
        slot,
        height,
        heightCssExpr,
      };
    });

    const predictedHeights = itemData.map((item) => item.height);

    const columnIndices = buildMasonryColumnLayout({
      itemCount,
      columnCount: state.columns,
      placement: effectivePlacement,
      heights: predictedHeights,
      estimatedItemHeight,
      gapPx: state.gapPx,
    });

    return {
      state,
      items: itemData.map((item, index) => ({
        index,
        height: item.height,
        columnIndex: columnIndices[index] ?? 0,
        slot: item.slot,
        heightCssExpr: item.heightCssExpr,
      })),
    };
  });

  return {
    itemCount,
    states,
    variants,
    structuredLayout,
    structuredNodeId: (structuredLayout as any)?.__rmgNodeId as string | undefined,
    plainStructuredStyle:
      structuredLayout
        ? containerStylesPlain(
            resolveInlineResponsiveContainerStyle(
              structuredLayout.style,
              effectiveBreakpoints
            )
          )
        : undefined,
    responsiveCss,
  };
}

export function resolveActiveMasonryPredictionVariant(
  variants: MasonryPredictionVariant[],
  viewportWidth: number
): MasonryPredictionVariant | null {
  if (!variants.length) return null;

  let active = variants[0]!;
  for (const variant of variants) {
    if (viewportWidth >= variant.state.minWidth) {
      active = variant;
    } else {
      break;
    }
  }

  return active;
}

export function predictMasonryShellHeight(
  variant: MasonryPredictionVariant
): number {
  if (!variant.items.length) return 0;
  const colHeights = new Map<number, number>();

  for (const item of variant.items) {
    const prev = colHeights.get(item.columnIndex) ?? 0;
    const next =
      prev === 0 ? item.height : prev + variant.state.gapPx + item.height;
    colHeights.set(item.columnIndex, next);
  }

  return Math.max(0, ...colHeights.values());
}

export function buildActiveMasonrySeedHeights(
  args: BuildMasonrySkeletonPredictionArgs & { viewportWidth: number }
) {
  const placement = args.placement ?? "balanced";
  if (placement !== "balanced") return undefined;

  const prediction = buildMasonrySkeletonPrediction({
    ...args,
    respectLayoutCount: false,
  });
  const activeVariant = resolveActiveMasonryPredictionVariant(
    prediction.variants,
    args.viewportWidth
  );

  return activeVariant?.items.map((item) => item.height);
}
