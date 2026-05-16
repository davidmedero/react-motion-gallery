/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CSSProperties } from "react";

import {
  BREAKPOINT_MAP,
  resolveResponsiveNumberRuleValue,
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
  escapeAttrValue,
  resolveInlineResponsiveContainerStyle,
  resolveResponsiveBaseStyleAtMinWidth,
  resolveResponsiveContainerStyleAtMinWidth,
} from "../shared/skeleton/layout";
import {
  SAFARI_TEXT_SKELETON_SUPPORTS,
  collectResponsiveTextBreakpoints,
  getResponsiveTextRenderState,
  getSafariTextSkeletonMetricsFromMetrics,
  getTextSkeletonMetrics,
  resolveResponsiveTextBarHeight,
  resolveResponsiveTextLineHeight,
  resolveResponsiveTextLineCount,
} from "../shared/skeleton/text";
import {
  normalizeResponsiveMasonrySpanRules,
  resolveMasonrySpanAtWidth,
} from "./item";

import type {
  MasonrySkeletonLayoutNode,
  MasonrySkeletonSpec,
  MasonrySkeletonWrapStyle,
  SkeletonNode,
} from "../skeleton/MasonrySkeleton";
import type { ResponsiveMasonrySpan } from "./types";

type Rule = { minWidth: number; value: number };
type TextMetricsMode = "default" | "safari";

const DEFAULT_MASONRY_REFERENCE_WIDTH_PX = 240;
const DEFAULT_MASONRY_SKELETON_RATIOS = [55, 90, 130, 75];

function normalizeLayoutWidthRules(value: number | undefined): Rule[] {
  return value != null && Number.isFinite(value) ? [{ minWidth: 0, value }] : [];
}

function resolveLayoutWidthPx(value: number | undefined): number | undefined {
  return value != null && Number.isFinite(value) ? value : undefined;
}

export type MasonryPlacement = "balanced" | "roundRobin" | "horizontalOrder";

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
  span?: ResponsiveMasonrySpan;
};

export type MasonryPredictionVariantItem = {
  index: number;
  height: number;
  columnIndex: number;
  columnStart: number;
  span: number;
  top: number;
  topCssExpr?: string;
  leftPx: number;
  leftCssExpr: string;
  widthPx: number;
  widthCssExpr: string;
  slot: MasonryResolvedSkeletonSlot | null;
  heightCssExpr: string;
  safariHeight: number;
  safariTop: number;
  safariTopCssExpr?: string;
  safariHeightCssExpr: string;
};

export type MasonryPredictionVariant = {
  state: MasonryPredictionFlexState;
  shellHeightCssExpr?: string;
  positionedCssVars?: Record<string, string>;
  containerCssRules?: MasonryPredictionContainerCssRule[];
  safariShellHeightCssExpr?: string;
  safariPositionedCssVars?: Record<string, string>;
  safariContainerCssRules?: MasonryPredictionContainerCssRule[];
  items: MasonryPredictionVariantItem[];
};

export type MasonryPredictionContainerCssRule = {
  minWidth: number;
  rootDecls: Record<string, string | number>;
  items: Array<{
    index: number;
    topCssExpr?: string;
    leftCssExpr: string;
    widthCssExpr: string;
  }>;
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
  spans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
  placement?: MasonryPlacement;
  spec?: MasonrySkeletonSpec;
  scopeId?: string;
  respectLayoutCount?: boolean;
  viewportWidth?: number;
  layoutWidthPx?: number;
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

function unwrapOuterParens(expr: string) {
  let trimmed = expr.trim();

  while (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    let depth = 0;
    let isWholeGroup = true;

    for (let index = 0; index < trimmed.length; index++) {
      const char = trimmed[index];
      if (char === "(") depth += 1;
      if (char === ")") depth -= 1;

      if (depth === 0 && index < trimmed.length - 1) {
        isWholeGroup = false;
        break;
      }

      if (depth < 0) {
        isWholeGroup = false;
        break;
      }
    }

    if (!isWholeGroup || depth !== 0) break;
    trimmed = trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function unwrapCalc(expr: string) {
  const trimmed = unwrapOuterParens(expr);
  if (trimmed.startsWith("calc(") && trimmed.endsWith(")")) {
    return unwrapOuterParens(trimmed.slice(5, -1).trim());
  }
  return trimmed;
}

function wrapCalcOperand(expr: string) {
  return `(${unwrapCalc(expr)})`;
}

type CssConstant = {
  value: number;
  unit: string | null;
};

function parseCssConstant(expr: string): CssConstant | null {
  const normalized = unwrapCalc(expr);
  if (!normalized) return null;

  const match = normalized.match(/^(-?\d*\.?\d+)([a-zA-Z%]+)?$/);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;

  return {
    value,
    unit: match[2] ?? null,
  };
}

function isZeroConstant(expr: string) {
  const constant = parseCssConstant(expr);
  return constant != null && constant.value === 0;
}

function formatCssConstant(
  value: number,
  unit: string | null,
  options?: { preferPxForZero?: boolean }
) {
  if (!Number.isFinite(value)) return unit ? `0${unit}` : "0";
  if (value === 0 && options?.preferPxForZero) return "0px";
  if (!unit) return `${value}`;
  return `${value}${unit}`;
}

function cssAdd(parts: Array<string | null | undefined>) {
  const valid = parts.filter(Boolean) as string[];
  if (!valid.length) return "0px";

  const dynamic: string[] = [];
  let pxTotal = 0;

  for (const part of valid) {
    const constant = parseCssConstant(part);
    if (!constant) {
      dynamic.push(part);
      continue;
    }

    if (constant.unit === "px" || (constant.unit == null && constant.value === 0)) {
      pxTotal += constant.value;
      continue;
    }

    dynamic.push(part);
  }

  if (pxTotal !== 0 || (!dynamic.length && pxTotal === 0)) {
    dynamic.push(formatCssConstant(pxTotal, "px", { preferPxForZero: true }));
  }

  if (dynamic.length === 1) return dynamic[0]!;
  return cssCalc(dynamic.map(wrapCalcOperand).join(" + "));
}

function cssSub(a: string, b: string) {
  if (isZeroConstant(b)) return a;

  const aConst = parseCssConstant(a);
  const bConst = parseCssConstant(b);
  if (
    aConst &&
    bConst &&
    ((aConst.unit === bConst.unit && aConst.unit != null) ||
      (aConst.unit === "px" && bConst.unit == null && bConst.value === 0) ||
      (bConst.unit === "px" && aConst.unit == null && aConst.value === 0) ||
      (aConst.unit == null && bConst.unit == null))
  ) {
    return formatCssConstant(
      aConst.value - bConst.value,
      aConst.unit ?? bConst.unit,
      { preferPxForZero: (aConst.unit ?? bConst.unit) === "px" }
    );
  }

  return cssCalc(`${wrapCalcOperand(a)} - ${wrapCalcOperand(b)}`);
}

function cssMul(expr: string, factor: number) {
  if (!Number.isFinite(factor)) return cssCalc(`${wrapCalcOperand(expr)} * ${factor}`);
  if (factor === 0) return "0px";
  if (factor === 1) return expr;

  const constant = parseCssConstant(expr);
  if (constant) {
    return formatCssConstant(constant.value * factor, constant.unit, {
      preferPxForZero: constant.unit === "px",
    });
  }

  return cssCalc(`${wrapCalcOperand(expr)} * ${factor}`);
}

function cssDiv(expr: string, divisor: number) {
  if (!Number.isFinite(divisor) || divisor === 0) {
    return cssCalc(`${wrapCalcOperand(expr)} / ${divisor}`);
  }
  if (divisor === 1) return expr;

  const constant = parseCssConstant(expr);
  if (constant) {
    return formatCssConstant(constant.value / divisor, constant.unit, {
      preferPxForZero: constant.unit === "px",
    });
  }

  return cssCalc(`${wrapCalcOperand(expr)} / ${divisor}`);
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
    return cssMul(relativeExpr, percent / 100);
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

type LinearWidth = {
  slope: number;
  intercept: number;
};

function linearScale(width: LinearWidth, factor: number): LinearWidth {
  return {
    slope: width.slope * factor,
    intercept: width.intercept * factor,
  };
}

function linearSubPx(width: LinearWidth, value: number): LinearWidth {
  return {
    slope: width.slope,
    intercept: width.intercept - value,
  };
}

function parseSkeletonLengthLinear(
  value: SkeletonLength | undefined,
  relative: LinearWidth
): LinearWidth | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? { slope: 0, intercept: value } : null;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.endsWith("%")) {
    const percent = Number(trimmed.slice(0, -1));
    return Number.isFinite(percent) ? linearScale(relative, percent / 100) : null;
  }

  const parsed = parseFloat(trimmed);
  return Number.isFinite(parsed) ? { slope: 0, intercept: parsed } : null;
}

function parseInsetLinear(
  value: SkeletonLength | undefined,
  axis: "block" | "inline",
  relative: LinearWidth
): LinearWidth | null {
  if (value == null) return { slope: 0, intercept: 0 };

  const parts = value
    .toString()
    .trim()
    .split(/\s+/)
    .map((part) => parseSkeletonLengthLinear(part, relative));

  if (!parts.length || parts.some((part) => part == null)) return null;

  const add = (a: LinearWidth, b: LinearWidth): LinearWidth => ({
    slope: a.slope + b.slope,
    intercept: a.intercept + b.intercept,
  });
  const scale = (value: LinearWidth, factor: number) => linearScale(value, factor);

  if (parts.length === 1) return scale(parts[0]!, 2);
  if (parts.length === 2) {
    return axis === "block" ? scale(parts[0]!, 2) : scale(parts[1]!, 2);
  }
  if (parts.length === 3) {
    return axis === "block" ? add(parts[0]!, parts[2]!) : scale(parts[1]!, 2);
  }
  return axis === "block"
    ? add(parts[0]!, parts[2]!)
    : add(parts[1]!, parts[3]!);
}

function resolveOuterWidthLinear(
  style: SkeletonBaseStyle | undefined,
  fallback: LinearWidth
): LinearWidth | null {
  const width = parseSkeletonLengthLinear(style?.width, fallback) ?? fallback;
  if (style?.maxWidth == null) return width;

  // min(width, max-width) is piecewise. Keep the exact container-query seed
  // path for linear width chains and let numeric measurement handle max-width.
  return null;
}

function wrapContentWidthLinear(
  outerWidth: LinearWidth,
  style: MasonrySkeletonWrapStyle | undefined
): LinearWidth | null {
  const inlinePadding = parseInsetLinear(style?.padding, "inline", outerWidth);
  if (!inlinePadding) return null;

  return linearSubPx(
    {
      slope: outerWidth.slope - inlinePadding.slope,
      intercept: outerWidth.intercept - inlinePadding.intercept,
    },
    parseBorderInlinePx(style?.border)
  );
}

function containerContentWidthLinear(
  outerWidth: LinearWidth,
  style: SkeletonContainerStyle | undefined
): LinearWidth | null {
  const inlinePadding = parseInsetLinear(style?.padding, "inline", outerWidth);
  if (!inlinePadding) return null;

  return {
    slope: outerWidth.slope - inlinePadding.slope,
    intercept: outerWidth.intercept - inlinePadding.intercept,
  };
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

function resolveTextNodeMetricsAtMinWidth(args: {
  node: Extract<SkeletonNode, { kind: "text" }>;
  responsiveMinWidth: number;
  availableWidthPx?: number | null;
  breakpointMap: BreakpointMap;
  conservativeContainerText?: boolean;
  textMetricsMode?: TextMetricsMode;
}): {
  style: SkeletonBaseStyle | undefined;
  metrics: ReturnType<typeof getTextSkeletonMetrics>;
} {
  // When the text node opts into container-keyed responsive maps, the DOM
  // honors `@container (min-width:...)` rules driven by the available width
  // at this node's depth, not the viewport state's minWidth. Resolve
  // lines/barHeight/lineHeight against the container width so the predicted
  // text height matches what the @container rules will actually render.
  const responsiveKey =
    args.node.responsiveBy === "container" &&
    args.availableWidthPx != null &&
    Number.isFinite(args.availableWidthPx) &&
    args.availableWidthPx > 0
      ? args.availableWidthPx
      : args.responsiveMinWidth;

  const style = resolveResponsiveBaseStyleAtMinWidth(
    args.node.style,
    args.responsiveMinWidth,
    args.breakpointMap
  );

  if (
    args.conservativeContainerText &&
    args.node.responsiveBy === "container"
  ) {
    const renderState: ReturnType<typeof getResponsiveTextRenderState> =
      (args.node as any).__rmgTextRenderState ??
      getResponsiveTextRenderState({
        barHeight: args.node.barHeight,
        barWidth: args.node.barWidth,
        lineHeight: args.node.lineHeight,
        lines: args.node.lines,
        lastBarWidth: args.node.lastBarWidth,
        responsiveBy: args.node.responsiveBy,
        breakpointMap: args.breakpointMap,
      });
    const maxState = renderState.states.reduce(
      (max, rule) =>
        rule.state.metrics.totalHeight > max.metrics.totalHeight
          ? rule.state
          : max,
      renderState.baseState
    );

    return {
      style,
      metrics:
        args.textMetricsMode === "safari"
          ? getSafariTextSkeletonMetricsFromMetrics(maxState.metrics)
          : maxState.metrics,
    };
  }

  const lineCount = resolveResponsiveTextLineCount(
    args.node.lines,
    1,
    responsiveKey,
    args.breakpointMap
  );
  const barHeight = resolveResponsiveTextBarHeight(
    args.node.barHeight,
    typeof args.node.barHeight === "number" ? args.node.barHeight : 0,
    responsiveKey,
    args.breakpointMap
  );

  const metrics = getTextSkeletonMetrics({
    barHeight,
    lineHeight: resolveResponsiveTextLineHeight(
      args.node.lineHeight,
      typeof args.node.lineHeight === "number" ? args.node.lineHeight : 1,
      responsiveKey,
      args.breakpointMap
    ),
    lines: lineCount,
  });

  return {
    style,
    metrics:
      args.textMetricsMode === "safari"
        ? getSafariTextSkeletonMetricsFromMetrics(metrics)
        : metrics,
  };
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
    conservativeContainerText?: boolean;
    textMetricsMode?: TextMetricsMode;
  }
): number | null {
  const responsiveMinWidth = args?.responsiveMinWidth ?? 0;
  const availableWidthPx = args?.availableWidthPx ?? null;
  const breakpointMap = args?.breakpointMap ?? BREAKPOINT_MAP;
  const conservativeContainerText = args?.conservativeContainerText === true;
  const textMetricsMode = args?.textMetricsMode ?? "default";

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
    const { style, metrics } = resolveTextNodeMetricsAtMinWidth({
      node,
      responsiveMinWidth,
      availableWidthPx,
      breakpointMap,
      conservativeContainerText,
      textMetricsMode,
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
      conservativeContainerText,
      textMetricsMode,
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
          conservativeContainerText,
          textMetricsMode,
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
    availableWidthPx?: number | null;
    breakpointMap?: BreakpointMap;
    conservativeContainerText?: boolean;
    textMetricsMode?: TextMetricsMode;
  }
): string | null {
  const responsiveMinWidth = args?.responsiveMinWidth ?? 0;
  const availableWidthExpr = args?.availableWidthExpr ?? null;
  const availableWidthPx = args?.availableWidthPx ?? null;
  const breakpointMap = args?.breakpointMap ?? BREAKPOINT_MAP;
  const conservativeContainerText = args?.conservativeContainerText === true;
  const textMetricsMode = args?.textMetricsMode ?? "default";

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
    const { style, metrics } = resolveTextNodeMetricsAtMinWidth({
      node,
      responsiveMinWidth,
      availableWidthPx,
      breakpointMap,
      conservativeContainerText,
      textMetricsMode,
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
    const contentWidthPx = containerContentWidthPx(availableWidthPx, plain);
    const gapExpr = parseSkeletonLengthCssExpr(plain?.gap, contentWidthExpr ?? undefined) ?? "0px";
    const gapPx = parseSkeletonLengthPx(plain?.gap, contentWidthPx ?? undefined) ?? 0;
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
    const tileWidthPx =
      (node.direction ?? "row") === "row" && count > 1 && contentWidthPx != null
        ? Math.max(0, (contentWidthPx - gapPx * Math.max(0, count - 1)) / count)
        : contentWidthPx;

    const tileHeightExpr = estimateSkeletonNodeHeightCssExpr(tileNode, {
      responsiveMinWidth,
      availableWidthExpr: tileWidthExpr,
      availableWidthPx: tileWidthPx,
      breakpointMap,
      conservativeContainerText,
      textMetricsMode,
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
    const contentWidthPx = containerContentWidthPx(availableWidthPx, plain);
    const gapExpr = parseSkeletonLengthCssExpr(plain?.gap, contentWidthExpr ?? undefined) ?? "0px";
    const paddingExpr = parseInsetCssExpr(plain?.padding, "block", availableWidthExpr ?? undefined) ?? "0px";

    const childExprs = node.children
      .map((child) =>
        estimateSkeletonNodeHeightCssExpr(child, {
          responsiveMinWidth,
          availableWidthExpr: contentWidthExpr,
          availableWidthPx: contentWidthPx,
          breakpointMap,
          conservativeContainerText,
          textMetricsMode,
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
    span: slot?.span,
  };
}

function collectMasonrySpanBreakpoints(
  span: ResponsiveMasonrySpan | undefined,
  out: Set<number>,
  breakpointMap: BreakpointMap
) {
  const rules = normalizeResponsiveMasonrySpanRules(span, breakpointMap);
  for (const rule of rules) {
    out.add(rule.minWidth);
  }
}

function resolveMasonrySpanForState(args: {
  span?: ResponsiveMasonrySpan;
  columnCount: number;
  minWidth: number;
  breakpointMap: BreakpointMap;
}): number {
  return resolveMasonrySpanAtWidth({
    span: args.span,
    columnCount: args.columnCount,
    width: args.minWidth,
    breakpointMap: args.breakpointMap,
  });
}

export function resolveActiveFlexStateKey(
  states: MasonryPredictionFlexState[],
  viewportWidth: number
): string | null {
  const active = resolveActiveFlexState(states, viewportWidth);
  return active?.key ?? null;
}

function resolveActiveFlexState(
  states: MasonryPredictionFlexState[],
  viewportWidth: number
): MasonryPredictionFlexState | null {
  if (!states.length) return null;

  let active = states[0]!;
  for (const state of states) {
    if (viewportWidth >= state.minWidth) {
      active = state;
    } else {
      break;
    }
  }

  return active;
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

function buildContainerWidthPxByStateKey(args: {
  states: MasonryPredictionFlexState[];
  layoutWidthPx?: number;
  viewportWidth?: number;
  breakpointMap: BreakpointMap;
}) {
  const rules = normalizeLayoutWidthRules(args.layoutWidthPx).filter(
    (rule) => rule.value > 0
  );

  if (!rules.length) return undefined;

  if (args.viewportWidth != null) {
    const activeState = resolveActiveFlexState(args.states, args.viewportWidth);
    const activeWidthPx = resolveLayoutWidthPx(args.layoutWidthPx);

    if (!activeState || activeWidthPx == null || activeWidthPx <= 0) {
      return undefined;
    }

    return new Map([[activeState.key, activeWidthPx]]);
  }

  const widthsByStateKey = new Map<string, number>();

  for (const state of args.states) {
    const widthPx = resolveResponsiveNumberRuleValue(rules, state.minWidth);

    if (widthPx != null && widthPx > 0) {
      widthsByStateKey.set(state.key, widthPx);
    }
  }

  return widthsByStateKey.size ? widthsByStateKey : undefined;
}

function predictMasonryContainerWidthPx(state: MasonryPredictionFlexState): number {
  return predictMasonryContainerWidthPxWithOverride(state);
}

function predictMasonryContainerWidthPxWithOverride(
  state: MasonryPredictionFlexState,
  containerWidthPx?: number
): number {
  if (containerWidthPx != null && Number.isFinite(containerWidthPx) && containerWidthPx > 0) {
    return Math.max(containerWidthPx, DEFAULT_MASONRY_REFERENCE_WIDTH_PX);
  }

  return Math.max(
    state.minWidth || DEFAULT_MASONRY_REFERENCE_WIDTH_PX,
    DEFAULT_MASONRY_REFERENCE_WIDTH_PX
  );
}

function predictMasonryColumnWidthPx(
  state: MasonryPredictionFlexState,
  containerWidthPx?: number
): number {
  const resolvedContainerWidthPx = predictMasonryContainerWidthPxWithOverride(
    state,
    containerWidthPx
  );
  return state.columns > 0
    ? (resolvedContainerWidthPx - state.gapPx * (state.columns - 1)) /
        state.columns
    : resolvedContainerWidthPx;
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
      collectMasonrySpanBreakpoints(slot.span, out, breakpointMap);
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
      for (const minWidth of collectResponsiveTextBreakpoints({
        barHeight: node.barHeight,
        barWidth: node.barWidth,
        lineHeight: node.lineHeight,
        lines: node.lines,
        lastBarWidth: node.lastBarWidth,
        breakpointMap,
      })) {
        out.add(minWidth);
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

function normalizeContainerRuleMinWidth(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.round(value * 1000) / 1000);
}

function addContainerTextRootMinWidth(
  textMinWidth: number,
  width: LinearWidth,
  out: Set<number>
) {
  if (textMinWidth <= 0) {
    out.add(0);
    return;
  }

  if (width.slope <= 0) return;

  const rootMinWidth = normalizeContainerRuleMinWidth(
    (textMinWidth - width.intercept) / width.slope
  );
  if (rootMinWidth == null) return;
  out.add(rootMinWidth);
}

function collectContainerTextRootMinWidths(args: {
  node: SkeletonNode | undefined;
  availableWidth: LinearWidth | null;
  responsiveMinWidth: number;
  breakpointMap: BreakpointMap;
  out: Set<number>;
}) {
  const { node, availableWidth, responsiveMinWidth, breakpointMap, out } = args;
  if (!node || !availableWidth) return;

  switch (node.kind) {
    case "rect":
    case "square":
    case "circle":
      return;

    case "text":
      if (node.responsiveBy !== "container") return;
      for (const minWidth of collectResponsiveTextBreakpoints({
        barHeight: node.barHeight,
        barWidth: node.barWidth,
        lineHeight: node.lineHeight,
        lines: node.lines,
        lastBarWidth: node.lastBarWidth,
        breakpointMap,
      })) {
        addContainerTextRootMinWidth(minWidth, availableWidth, out);
      }
      return;

    case "media": {
      const plain = resolveContainerStyleAtMinWidth(
        node.style,
        responsiveMinWidth,
        breakpointMap
      );
      const contentWidth = containerContentWidthLinear(availableWidth, plain);
      if (!contentWidth) return;

      const gapPx = parseSkeletonLengthPx(plain?.gap, 0) ?? 0;
      const count = Math.max(0, node.count | 0);
      const tileWidth =
        (node.direction ?? "row") === "row" && count > 1
          ? linearScale(
              linearSubPx(contentWidth, gapPx * Math.max(0, count - 1)),
              1 / count
            )
          : contentWidth;
      const tileNode: SkeletonNode = {
        kind: node.tile?.shape ?? "rect",
        style: node.tile?.style,
        shimmer: node.tile?.shimmer,
      } as SkeletonNode;

      collectContainerTextRootMinWidths({
        node: tileNode,
        availableWidth: tileWidth,
        responsiveMinWidth,
        breakpointMap,
        out,
      });
      return;
    }

    case "stack":
    case "row":
    case "col": {
      const plain = resolveContainerStyleAtMinWidth(
        node.style,
        responsiveMinWidth,
        breakpointMap
      );
      const contentWidth = containerContentWidthLinear(availableWidth, plain);
      if (!contentWidth) return;

      for (const child of node.children) {
        collectContainerTextRootMinWidths({
          node: child,
          availableWidth: contentWidth,
          responsiveMinWidth,
          breakpointMap,
          out,
        });
      }
      return;
    }
  }
}

function buildMasonryItemWidthLinear(args: {
  state: MasonryPredictionFlexState;
  span: number;
}): LinearWidth {
  const { state, span } = args;
  const columns = Math.max(1, state.columns | 0);
  const columnWidth: LinearWidth = {
    slope: 1 / columns,
    intercept: -(state.gapPx * Math.max(0, columns - 1)) / columns,
  };

  return {
    slope: columnWidth.slope * span,
    intercept: columnWidth.intercept * span + state.gapPx * Math.max(0, span - 1),
  };
}

function collectMasonryVariantContainerRuleMinWidths(args: {
  state: MasonryPredictionFlexState;
  itemCount: number;
  structuredLayout: MasonrySkeletonLayoutNode | null;
  spans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
  breakpointMap: BreakpointMap;
}) {
  const out = new Set<number>([0]);
  const {
    state,
    itemCount,
    structuredLayout,
    spans,
    breakpointMap,
  } = args;

  if (!structuredLayout) return [];

  for (let index = 0; index < itemCount; index++) {
    const slot = resolveMasonrySlot(structuredLayout, index);
    const span = resolveMasonrySpanForState({
      span: slot?.span ?? spans?.[index],
      columnCount: state.columns,
      minWidth: state.minWidth,
      breakpointMap,
    });
    const itemWidth = buildMasonryItemWidthLinear({ state, span });
    const wrapOuterWidth = resolveOuterWidthLinear(slot.itemWrapStyle, itemWidth);
    const contentWidth = wrapOuterWidth
      ? wrapContentWidthLinear(wrapOuterWidth, slot.itemWrapStyle)
      : null;

    collectContainerTextRootMinWidths({
      node: slot.item,
      availableWidth: contentWidth,
      responsiveMinWidth: state.minWidth,
      breakpointMap,
      out,
    });
  }

  return Array.from(out).sort((a, b) => a - b);
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

  const breakpointMap = args.breakpointMap ?? BREAKPOINT_MAP;
  let n = 0;
  const allocId = () => `n${++n}`;
  const collected: SkeletonResponsiveCssEntry[] = [];
  const layout = collectResponsiveCss(
    args.layout,
    allocId,
    collected,
    "masonry",
    breakpointMap
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

export function buildMasonryColumnWidthCssExpr(options?: {
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

export function buildMasonryItemWidthCssExpr(args: {
  span: number;
  columnWidthCssExpr: string;
  gapCssExpr?: string;
}) {
  const { span, columnWidthCssExpr, gapCssExpr = "var(--rmg-gap)" } = args;
  if (span <= 1) return columnWidthCssExpr;

  return cssAdd([
    cssMul(columnWidthCssExpr, span),
    cssMul(gapCssExpr, Math.max(0, span - 1)),
  ]);
}

export function buildMasonryItemLeftCssExpr(args: {
  columnStart: number;
  columnWidthCssExpr: string;
  gapCssExpr?: string;
}) {
  const { columnStart, columnWidthCssExpr, gapCssExpr = "var(--rmg-gap)" } = args;
  if (columnStart <= 0) return "0px";

  return cssAdd([
    cssMul(columnWidthCssExpr, columnStart),
    cssMul(gapCssExpr, columnStart),
  ]);
}

function buildMasonryItemHeightCssExpr(args: {
  index: number;
  slot: MasonryResolvedSkeletonSlot | null;
  state: MasonryPredictionFlexState;
  safeRatios: number[];
  safeHeights: number[] | null;
  itemWidthCssExpr: string;
  itemWidthPx: number;
  breakpointMap: BreakpointMap;
  conservativeContainerText?: boolean;
  textMetricsMode?: TextMetricsMode;
}): string {
  const {
    index,
    slot,
    state,
    safeRatios,
    safeHeights,
    itemWidthCssExpr,
    itemWidthPx,
    breakpointMap,
    conservativeContainerText,
    textMetricsMode = "default",
  } = args;

  if (slot) {
    const wrapOuterWidthCssExpr = resolveOuterWidthCssExpr(
      slot.itemWrapStyle,
      itemWidthCssExpr
    );
    const wrapOuterWidthPx = resolveOuterWidthPx(slot.itemWrapStyle, itemWidthPx);
    const contentWidthExpr = wrapContentWidthCssExpr(
      wrapOuterWidthCssExpr,
      slot.itemWrapStyle
    );
    const contentWidthPx = wrapContentWidthPx(wrapOuterWidthPx, slot.itemWrapStyle);

    const fullExpr = estimateSkeletonNodeHeightCssExpr(slot.item, {
      responsiveMinWidth: state.minWidth,
      availableWidthExpr: contentWidthExpr,
      availableWidthPx: contentWidthPx,
      breakpointMap,
      conservativeContainerText,
      textMetricsMode,
    });

    if (fullExpr) {
      return cssAdd([
        fullExpr,
        wrapExtrasBlockCssExpr(slot.itemWrapStyle, wrapOuterWidthCssExpr) ?? "0px",
      ]);
    }
  }

  const wrapOuterWidthCssExpr = resolveOuterWidthCssExpr(
    slot?.itemWrapStyle,
    itemWidthCssExpr
  );
  const wrapExtrasExpr =
    wrapExtrasBlockCssExpr(slot?.itemWrapStyle, wrapOuterWidthCssExpr) ?? "0px";

  if (slot?.heightPx != null) return cssAdd([cssPx(slot.heightPx), wrapExtrasExpr]);
  if (slot?.ratio != null) {
    return cssAdd([
      cssCalc(`${wrapOuterWidthCssExpr} * ${slot.ratio / 100}`),
      wrapExtrasExpr,
    ]);
  }
  if (safeHeights?.length) {
    return cssAdd([cssPx(safeHeights[index % safeHeights.length]!), wrapExtrasExpr]);
  }
  if (safeRatios.length) {
    return cssAdd([
      cssCalc(
        `${wrapOuterWidthCssExpr} * ${safeRatios[index % safeRatios.length]! / 100}`
      ),
      wrapExtrasExpr,
    ]);
  }

  return cssAdd([wrapOuterWidthCssExpr, wrapExtrasExpr]);
}

function predictMasonryItemHeight(args: {
  index: number;
  slot: MasonryResolvedSkeletonSlot | null;
  state: MasonryPredictionFlexState;
  safeRatios: number[];
  safeHeights: number[] | null;
  itemWidthPx: number;
  breakpointMap: BreakpointMap;
  conservativeContainerText?: boolean;
  textMetricsMode?: TextMetricsMode;
}): number {
  const {
    index,
    slot,
    state,
    safeRatios,
    safeHeights,
    itemWidthPx,
    breakpointMap,
    conservativeContainerText,
    textMetricsMode = "default",
  } = args;

  if (slot) {
    const wrapOuterWidthPx = resolveOuterWidthPx(slot.itemWrapStyle, itemWidthPx);
    const contentWidthPx = wrapContentWidthPx(wrapOuterWidthPx, slot.itemWrapStyle);

    const fullPx = estimateSkeletonNodeHeightPx(slot.item, {
      responsiveMinWidth: state.minWidth,
      availableWidthPx: contentWidthPx,
      breakpointMap,
      conservativeContainerText,
      textMetricsMode,
    });

    if (fullPx != null) {
      return Math.ceil(
        fullPx + wrapExtrasBlockPx(slot.itemWrapStyle, wrapOuterWidthPx)
      );
    }
  }

  const wrapOuterWidthPx = resolveOuterWidthPx(slot?.itemWrapStyle, itemWidthPx);
  const wrapExtrasPx = wrapExtrasBlockPx(slot?.itemWrapStyle, wrapOuterWidthPx);

  const baseHeight =
    slot?.heightPx != null
      ? slot.heightPx
      : slot?.ratio != null
      ? Math.round((slot.ratio / 100) * wrapOuterWidthPx)
      : safeHeights?.length
      ? safeHeights[index % safeHeights.length]!
      : safeRatios.length
      ? Math.round((safeRatios[index % safeRatios.length] / 100) * wrapOuterWidthPx)
      : wrapOuterWidthPx;

  return Math.ceil(baseHeight + wrapExtrasPx);
}

export function buildMasonryColumnLayout(args: {
  itemCount: number;
  columnCount: number;
  placement: MasonryPlacement;
  heights: number[];
  gapPx: number;
  spans?: ReadonlyArray<number | undefined>;
}) {
  return buildMasonryPositionedLayout(args).items.map((item) => item.columnStart);
}

export type MasonryPositionedItem = {
  index: number;
  span: number;
  columnStart: number;
  top: number;
  height: number;
};

export type MasonryPositionedLayout = {
  items: MasonryPositionedItem[];
  height: number;
};

type MasonryCssPositionedLayout = {
  itemTopCssExprs: string[];
  itemHeightCssExprs: string[];
  shellHeightCssExpr: string;
  cssVars: Record<string, string>;
};

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

function resolveRoundRobinColumnStart(args: {
  cursor: number;
  columnCount: number;
  span: number;
}) {
  const availableStarts = Math.max(1, args.columnCount - args.span + 1);
  return args.cursor % availableStarts;
}

export function buildMasonryPositionedLayout(args: {
  itemCount: number;
  columnCount: number;
  placement: MasonryPlacement;
  heights: number[];
  gapPx: number;
  spans?: ReadonlyArray<number | undefined>;
}): MasonryPositionedLayout {
  const {
    itemCount,
    columnCount,
    placement,
    heights,
    gapPx,
    spans,
  } = args;
  const safeColumnCount = Math.max(1, columnCount | 0);
  const colHeights = new Array(safeColumnCount).fill(0);
  const colCounts = new Array(safeColumnCount).fill(0);
  const items: MasonryPositionedItem[] = [];
  let layoutHeight = 0;
  let roundRobinCursor = 0;
  let horizontalCursor = 0;

  for (let index = 0; index < itemCount; index++) {
    const span = Math.max(
      1,
      Math.min(safeColumnCount, Math.round(spans?.[index] ?? 1) || 1)
    );
    const height = heights[index] ?? 0;
    const maxStart = Math.max(0, safeColumnCount - span);

    let columnStart = 0;
    let top = 0;

    if (placement === "roundRobin") {
      columnStart = resolveRoundRobinColumnStart({
        cursor: roundRobinCursor,
        columnCount: safeColumnCount,
        span,
      });
      top = maxRange(colHeights, columnStart, span);
      roundRobinCursor += 1;
    } else if (placement === "horizontalOrder") {
      columnStart = horizontalCursor % safeColumnCount;
      if (columnStart + span > safeColumnCount) {
        columnStart = 0;
      }
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

    const nextColumnHeight = top + height + gapPx;
    for (let track = columnStart; track < columnStart + span; track++) {
      colHeights[track] = nextColumnHeight;
      colCounts[track] = (colCounts[track] ?? 0) + 1;
    }

    layoutHeight = Math.max(layoutHeight, top + height);
    items.push({
      index,
      span,
      columnStart,
      top,
      height,
    });
  }

  return {
    items,
    height: layoutHeight,
  };
}

function buildMasonryCssPositionedLayout(args: {
  columnCount: number;
  gapPx: number;
  items: Array<{
    index: number;
    columnStart: number;
    span: number;
    heightPx: number;
    heightCssExpr: string;
  }>;
}): MasonryCssPositionedLayout {
  if (args.items.length === 0) {
    return {
      itemTopCssExprs: [],
      itemHeightCssExprs: [],
      shellHeightCssExpr: "0px",
      cssVars: {},
    };
  }

  const trackCount = Math.max(1, args.columnCount | 0);
  const colBottomPx = new Array<number>(trackCount).fill(0);
  const colBottomExprs = new Array<string | null>(trackCount).fill(null);
  const itemTopCssExprs: string[] = [];
  const itemHeightCssExprs: string[] = [];
  const cssVars: Record<string, string> = {};

  for (const [index, item] of args.items.entries()) {
    const itemHeightVarName = `--rmg-mskel-height-${item.index}`;
    const itemHeightExpr = `var(${itemHeightVarName})`;
    cssVars[itemHeightVarName] = item.heightCssExpr;
    itemHeightCssExprs.push(itemHeightExpr);

    let maxCoveredPx = 0;
    let maxCoveredExpr: string | null = null;

    for (let track = item.columnStart; track < item.columnStart + item.span; track++) {
      const bottomPx = colBottomPx[track] ?? 0;
      const bottomExpr = colBottomExprs[track] ?? null;

      if (bottomPx > maxCoveredPx || maxCoveredExpr == null) {
        maxCoveredPx = bottomPx;
        maxCoveredExpr = bottomExpr;
      }
    }

    const topCssExpr =
      maxCoveredPx <= 0 || !maxCoveredExpr
        ? "0px"
        : args.gapPx > 0
          ? cssAdd([maxCoveredExpr, cssPx(args.gapPx)])
          : maxCoveredExpr;

    const bottomCssExpr = cssAdd([topCssExpr, itemHeightExpr]);

    itemTopCssExprs.push(topCssExpr);
    const nextBottomPx =
      (maxCoveredPx > 0 ? maxCoveredPx + args.gapPx : 0) + item.heightPx;

    for (let track = item.columnStart; track < item.columnStart + item.span; track++) {
      colBottomPx[track] = nextBottomPx;
      colBottomExprs[track] = bottomCssExpr;
    }
  }

  const shellHeightVarName = "--rmg-mskel-shell-height";
  let shellHeightPx = 0;
  let shellHeightExpr = "0px";

  for (let track = 0; track < trackCount; track++) {
    const bottomPx = colBottomPx[track] ?? 0;
    const bottomExpr = colBottomExprs[track] ?? "0px";
    if (bottomPx >= shellHeightPx) {
      shellHeightPx = bottomPx;
      shellHeightExpr = bottomExpr;
    }
  }

  return {
    itemTopCssExprs,
    itemHeightCssExprs,
    shellHeightCssExpr: shellHeightExpr,
    cssVars,
  };
}

export function buildMasonrySkeletonPrediction(
  args: BuildMasonrySkeletonPredictionArgs
): MasonrySkeletonPrediction {
  const s = args.spec ?? defaultMasonrySpec();
  const effectiveBreakpoints = {
    ...BREAKPOINT_MAP,
    ...(args.breakpoints ?? {}),
  };
  const layoutWidthRules = normalizeLayoutWidthRules(args.layoutWidthPx).filter(
    (rule) => rule.value > 0
  );

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
      for (const span of args.spans ?? []) {
        collectMasonrySpanBreakpoints(span, minWidths, effectiveBreakpoints);
      }
      for (const rule of layoutWidthRules) {
        minWidths.add(rule.minWidth);
      }
      return minWidths;
    })(),
  });
  const containerWidthPxByStateKey = buildContainerWidthPxByStateKey({
    states,
    layoutWidthPx: args.layoutWidthPx,
    viewportWidth: args.viewportWidth,
    breakpointMap: effectiveBreakpoints,
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
  const columnWidthCssVarName = "--rmg-mskel-colw";
  const columnWidthCssExpr = `var(${columnWidthCssVarName})`;
  const columnWidthCssValue = buildMasonryColumnWidthCssExpr();
  const gapCssExpr = "var(--rmg-gap)";

  const variants = states.map((state) => {
    const hasTrustedContainerWidth =
      containerWidthPxByStateKey?.has(state.key) === true;
    const conservativeContainerText = !hasTrustedContainerWidth;
    const columnWidthPx = predictMasonryColumnWidthPx(
      state,
      containerWidthPxByStateKey?.get(state.key)
    );

    const buildItemData = (textMetricsMode: TextMetricsMode) =>
      Array.from({ length: itemCount }, (_, index) => {
        const slot = structuredLayout
          ? resolveMasonrySlot(structuredLayout, index)
          : null;
        const span = resolveMasonrySpanForState({
          span: slot?.span ?? args.spans?.[index],
          columnCount: state.columns,
          minWidth: state.minWidth,
          breakpointMap: effectiveBreakpoints,
        });
        const itemWidthPx =
          columnWidthPx * span + state.gapPx * Math.max(0, span - 1);
        const itemWidthVarName = `--rmg-mskel-width-${index}`;
        const itemWidthCssValue = buildMasonryItemWidthCssExpr({
          span,
          columnWidthCssExpr,
          gapCssExpr,
        });
        const itemWidthCssExpr = `var(${itemWidthVarName})`;

        const height = predictMasonryItemHeight({
          index,
          slot,
          state,
          safeRatios,
          safeHeights,
          itemWidthPx,
          breakpointMap: effectiveBreakpoints,
          conservativeContainerText,
          textMetricsMode,
        });

        const heightCssExpr = buildMasonryItemHeightCssExpr({
          index,
          slot,
          state,
          safeRatios,
          safeHeights,
          itemWidthCssExpr,
          itemWidthPx,
          breakpointMap: effectiveBreakpoints,
          conservativeContainerText,
          textMetricsMode,
        });

        return {
          slot,
          span,
          height,
          heightCssExpr,
          itemWidthPx,
          itemWidthVarName,
          itemWidthCssValue,
          itemWidthCssExpr,
        };
      });

    const itemData = buildItemData("default");
    const safariItemData = buildItemData("safari");

    const positioned = buildMasonryPositionedLayout({
      itemCount,
      columnCount: state.columns,
      placement: effectivePlacement,
      heights: itemData.map((item) => item.height),
      gapPx: state.gapPx,
      spans: itemData.map((item) => item.span),
    });
    const cssPositioned = buildMasonryCssPositionedLayout({
      columnCount: state.columns,
      gapPx: state.gapPx,
      items: positioned.items.map((positionedItem, index) => ({
        index,
        columnStart: positionedItem.columnStart,
        span: positionedItem.span,
        heightPx: positionedItem.height,
        heightCssExpr: itemData[index]?.heightCssExpr ?? cssPx(positionedItem.height),
      })),
    });
    const safariPositioned = buildMasonryPositionedLayout({
      itemCount,
      columnCount: state.columns,
      placement: effectivePlacement,
      heights: safariItemData.map((item) => item.height),
      gapPx: state.gapPx,
      spans: safariItemData.map((item) => item.span),
    });
    const safariCssPositioned = buildMasonryCssPositionedLayout({
      columnCount: state.columns,
      gapPx: state.gapPx,
      items: safariPositioned.items.map((positionedItem, index) => ({
        index,
        columnStart: positionedItem.columnStart,
        span: positionedItem.span,
        heightPx: positionedItem.height,
        heightCssExpr:
          safariItemData[index]?.heightCssExpr ?? cssPx(positionedItem.height),
      })),
    });
    const positionedCssVars: Record<string, string> = {
      [columnWidthCssVarName]: columnWidthCssValue,
    };

    for (const item of itemData) {
      positionedCssVars[item.itemWidthVarName] = item.itemWidthCssValue;
    }

    Object.assign(positionedCssVars, cssPositioned.cssVars);
    const safariPositionedCssVars: Record<string, string> = {
      ...positionedCssVars,
      ...safariCssPositioned.cssVars,
    };

    const buildContainerCssRulesForMode = (textMetricsMode: TextMetricsMode) =>
      !hasTrustedContainerWidth && structuredLayout
        ? collectMasonryVariantContainerRuleMinWidths({
            state,
            itemCount,
            structuredLayout,
            spans: args.spans,
            breakpointMap: effectiveBreakpoints,
          }).map((containerWidthPx) => {
            const ruleColumnWidthPx = predictMasonryColumnWidthPx(
              state,
              containerWidthPx
            );
            const ruleItemData = Array.from({ length: itemCount }, (_, index) => {
              const slot = resolveMasonrySlot(structuredLayout, index);
              const span = resolveMasonrySpanForState({
                span: slot?.span ?? args.spans?.[index],
                columnCount: state.columns,
                minWidth: state.minWidth,
                breakpointMap: effectiveBreakpoints,
              });
              const itemWidthPx =
                ruleColumnWidthPx * span + state.gapPx * Math.max(0, span - 1);
              const itemWidthVarName = `--rmg-mskel-width-${index}`;
              const itemWidthCssExpr = `var(${itemWidthVarName})`;
              const height = predictMasonryItemHeight({
                index,
                slot,
                state,
                safeRatios,
                safeHeights,
                itemWidthPx,
                breakpointMap: effectiveBreakpoints,
                conservativeContainerText: false,
                textMetricsMode,
              });
              const heightCssExpr = buildMasonryItemHeightCssExpr({
                index,
                slot,
                state,
                safeRatios,
                safeHeights,
                itemWidthCssExpr,
                itemWidthPx,
                breakpointMap: effectiveBreakpoints,
                conservativeContainerText: false,
                textMetricsMode,
              });

              return {
                slot,
                span,
                height,
                heightCssExpr,
              };
            });
            const rulePositioned = buildMasonryPositionedLayout({
              itemCount,
              columnCount: state.columns,
              placement: effectivePlacement,
              heights: ruleItemData.map((item) => item.height),
              gapPx: state.gapPx,
              spans: ruleItemData.map((item) => item.span),
            });
            const ruleCssPositioned = buildMasonryCssPositionedLayout({
              columnCount: state.columns,
              gapPx: state.gapPx,
              items: rulePositioned.items.map((positionedItem, index) => ({
                index,
                columnStart: positionedItem.columnStart,
                span: positionedItem.span,
                heightPx: positionedItem.height,
                heightCssExpr:
                  ruleItemData[index]?.heightCssExpr ?? cssPx(positionedItem.height),
              })),
            });

            return {
              minWidth: containerWidthPx,
              rootDecls: {
                height: ruleCssPositioned.shellHeightCssExpr,
                ...ruleCssPositioned.cssVars,
              },
              items: rulePositioned.items.map((positionedItem, index) => ({
                index,
                topCssExpr: ruleCssPositioned.itemTopCssExprs[index],
                leftCssExpr: buildMasonryItemLeftCssExpr({
                  columnStart: positionedItem.columnStart,
                  columnWidthCssExpr,
                  gapCssExpr,
                }),
                widthCssExpr: buildMasonryItemWidthCssExpr({
                  span: positionedItem.span,
                  columnWidthCssExpr,
                  gapCssExpr,
                }),
              })),
            };
          })
        : undefined;

    const containerCssRules = buildContainerCssRulesForMode("default");
    const safariContainerCssRules = buildContainerCssRulesForMode("safari");

    return {
      state,
      shellHeightCssExpr: cssPositioned.shellHeightCssExpr,
      positionedCssVars,
      containerCssRules,
      safariShellHeightCssExpr: safariCssPositioned.shellHeightCssExpr,
      safariPositionedCssVars,
      safariContainerCssRules,
      items: itemData.map((item, index) => {
        const positionedItem = positioned.items[index] ?? {
          index,
          span: item.span,
          columnStart: 0,
          top: 0,
          height: item.height,
        };
        const safariPositionedItem = safariPositioned.items[index] ?? {
          index,
          span: item.span,
          columnStart: positionedItem.columnStart,
          top: positionedItem.top,
          height: safariItemData[index]?.height ?? item.height,
        };

        return {
          index,
          height: item.height,
          columnIndex: positionedItem.columnStart,
          columnStart: positionedItem.columnStart,
          span: positionedItem.span,
          top: positionedItem.top,
          topCssExpr: cssPositioned.itemTopCssExprs[index],
          leftPx:
            positionedItem.columnStart * (columnWidthPx + state.gapPx),
          leftCssExpr: buildMasonryItemLeftCssExpr({
            columnStart: positionedItem.columnStart,
            columnWidthCssExpr,
            gapCssExpr,
          }),
          widthPx: item.itemWidthPx,
          widthCssExpr: item.itemWidthCssExpr,
          slot: item.slot,
          heightCssExpr:
            cssPositioned.itemHeightCssExprs[index] ?? item.heightCssExpr,
          safariHeight: safariItemData[index]?.height ?? item.height,
          safariTop: safariPositionedItem.top,
          safariTopCssExpr: safariCssPositioned.itemTopCssExprs[index],
          safariHeightCssExpr:
            safariCssPositioned.itemHeightCssExprs[index] ??
            safariItemData[index]?.heightCssExpr ??
            item.heightCssExpr,
        };
      }),
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
  return Math.max(0, ...variant.items.map((item) => item.top + item.height));
}

function importantDecl(name: string, value: string | number) {
  return `${name}:${value} !important;`;
}

function buildMasonrySeedRootDecls(
  variant: MasonryPredictionVariant,
  textMetricsMode: TextMetricsMode = "default"
) {
  const shellHeightCssExpr =
    textMetricsMode === "safari"
      ? variant.safariShellHeightCssExpr ?? variant.shellHeightCssExpr
      : variant.shellHeightCssExpr;
  const positionedCssVars =
    textMetricsMode === "safari"
      ? variant.safariPositionedCssVars ?? variant.positionedCssVars
      : variant.positionedCssVars;
  const rootDecls = [
    [
      "height",
      shellHeightCssExpr ?? `${predictMasonryShellHeight(variant)}px`,
    ],
    ["--rmg-cols", variant.state.columns],
    ["--rmg-gap", `${variant.state.gapPx}px`],
  ] as Array<[string, string | number]>;

  for (const [name, value] of Object.entries(positionedCssVars ?? {})) {
    rootDecls.push([name, value]);
  }

  return rootDecls;
}

function toShellReserveDecls(
  rootDecls: Array<[string, string | number]>
): Array<[string, string | number]> {
  return rootDecls.map(([name, value]) =>
    name === "height" ? ["min-height", value] : [name, value]
  );
}

export function buildMasonryFirstPaintLayoutCss(args: {
  scopeId: string;
  prediction: MasonrySkeletonPrediction;
}) {
  if (!args.scopeId || !args.prediction.variants.length) return "";

  const scopeSelector = `[data-rmg-masonry-layout-seed="${escapeAttrValue(args.scopeId)}"]`;

  const buildRuleCss = (
    rootDecls: Array<[string, string | number]>,
    items: Array<{
      index: number;
      topCssExpr?: string;
      leftCssExpr: string;
      widthCssExpr: string;
    }>
  ) => {
    const rootCss =
      `${scopeSelector}{` +
      rootDecls.map(([name, value]) => importantDecl(name, value)).join("") +
      `}`;
    const itemCss = items
      .map((item) => {
        const itemSelector = `${scopeSelector}>[data-rmg-idx="${item.index}"]`;
        return (
          `${itemSelector}{` +
          [
            importantDecl("top", item.topCssExpr ?? "0px"),
            importantDecl("left", item.leftCssExpr),
            importantDecl("width", item.widthCssExpr),
          ].join("") +
          `}`
        );
      })
      .join("");

    return `${rootCss}${itemCss}`;
  };

  const buildVariantCss = (variant: MasonryPredictionVariant) => {
    const rootDecls = buildMasonrySeedRootDecls(variant);

    const baseCss = buildRuleCss(
      rootDecls,
      variant.items.map((item) => ({
        index: item.index,
        topCssExpr: item.topCssExpr ?? `${item.top}px`,
        leftCssExpr: item.leftCssExpr,
        widthCssExpr: item.widthCssExpr,
      }))
    );
    const containerCss = (variant.containerCssRules ?? [])
      .map((rule) =>
        `@container (min-width:${rule.minWidth}px){${buildRuleCss(
          Object.entries(rule.rootDecls),
          rule.items
        )}}`
      )
      .join("");
    const safariCss = buildRuleCss(
      buildMasonrySeedRootDecls(variant, "safari"),
      variant.items.map((item) => ({
        index: item.index,
        topCssExpr: item.safariTopCssExpr ?? item.topCssExpr ?? `${item.safariTop}px`,
        leftCssExpr: item.leftCssExpr,
        widthCssExpr: item.widthCssExpr,
      }))
    );
    const safariContainerCss = (variant.safariContainerCssRules ?? [])
      .map((rule) =>
        `@container (min-width:${rule.minWidth}px){${buildRuleCss(
          Object.entries(rule.rootDecls),
          rule.items
        )}}`
      )
      .join("");

    return `${baseCss}${containerCss}@supports ${SAFARI_TEXT_SKELETON_SUPPORTS}{${safariCss}${safariContainerCss}}`;
  };

  return args.prediction.variants
    .map((variant) => {
      const css = buildVariantCss(variant);
      if (variant.state.minWidth <= 0) return css;
      return `@media (min-width:${variant.state.minWidth}px){${css}}`;
    })
    .join("\n");
}

export function buildMasonryShellReserveCss(args: {
  scopeId: string;
  prediction: MasonrySkeletonPrediction;
}) {
  if (!args.scopeId || !args.prediction.variants.length) return "";

  const scopeSelector = `[data-rmg-masonry-skeleton-shell="${escapeAttrValue(args.scopeId)}"]`;

  const buildRuleCss = (rootDecls: Array<[string, string | number]>) =>
    `${scopeSelector}{` +
    toShellReserveDecls(rootDecls)
      .map(([name, value]) => importantDecl(name, value))
      .join("") +
    `}`;

  const buildVariantCss = (variant: MasonryPredictionVariant) => {
    const baseCss = buildRuleCss(buildMasonrySeedRootDecls(variant));
    const containerCss = (variant.containerCssRules ?? [])
      .map((rule) =>
        `@container (min-width:${rule.minWidth}px){${buildRuleCss(
          Object.entries(rule.rootDecls)
        )}}`
      )
      .join("");

    return `${baseCss}${containerCss}`;
  };

  return args.prediction.variants
    .map((variant) => {
      const css = buildVariantCss(variant);
      if (variant.state.minWidth <= 0) return css;
      return `@media (min-width:${variant.state.minWidth}px){${css}}`;
    })
    .join("\n");
}

export function buildMasonryShellReserveSafariCss(args: {
  scopeId: string;
  prediction: MasonrySkeletonPrediction;
}) {
  if (!args.scopeId || !args.prediction.variants.length) return "";

  const scopeSelector = `[data-rmg-masonry-skeleton-shell="${escapeAttrValue(args.scopeId)}"]`;

  const buildRuleCss = (rootDecls: Array<[string, string | number]>) =>
    `${scopeSelector}{` +
    toShellReserveDecls(rootDecls)
      .map(([name, value]) => importantDecl(name, value))
      .join("") +
    `}`;

  const buildVariantCss = (variant: MasonryPredictionVariant) => {
    const safariCss = buildRuleCss(buildMasonrySeedRootDecls(variant, "safari"));
    const safariContainerCss = (variant.safariContainerCssRules ?? [])
      .map((rule) =>
        `@container (min-width:${rule.minWidth}px){${buildRuleCss(
          Object.entries(rule.rootDecls)
        )}}`
      )
      .join("");

    return `@supports ${SAFARI_TEXT_SKELETON_SUPPORTS}{${safariCss}${safariContainerCss}}`;
  };

  return args.prediction.variants
    .map((variant) => {
      const css = buildVariantCss(variant);
      if (variant.state.minWidth <= 0) return css;
      return `@media (min-width:${variant.state.minWidth}px){${css}}`;
    })
    .join("\n");
}

export function buildActiveMasonrySeedHeights(
  args: BuildMasonrySkeletonPredictionArgs & { viewportWidth: number }
) {
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
