import * as React from "react";

import { BREAKPOINT_MAP, type BreakpointMap } from "../responsive";
import styles from "./layout.module.css";
import {
  TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER,
  buildResponsiveTextCssRules,
  getResponsiveTextRenderState,
  type ResponsiveTextBarHeight,
  type ResponsiveTextBarWidth,
  type ResponsiveTextLineHeight,
  type ResponsiveTextLineCount,
  type ResponsiveTextLastBarWidth,
  type TextSkeletonResponsiveBy,
} from "./text";

export type SkeletonLength = number | string;

export type SkeletonShimmer = {
  enabled?: boolean;
  durationMs?: number;
  angleDeg?: number;
  opacity?: number;
  blurPx?: number;
  timing?: string;
  c1?: string;
  c2?: string;
  c3?: string;
};

export type SkeletonBaseStyle = {
  width?: SkeletonLength;
  minWidth?: SkeletonLength;
  maxWidth?: SkeletonLength;
  height?: SkeletonLength;
  minHeight?: SkeletonLength;
  maxHeight?: SkeletonLength;
  backgroundColor?: string;
  borderRadius?: SkeletonLength;
  overflow?: React.CSSProperties["overflow"];
  margin?: SkeletonLength;
  marginTop?: SkeletonLength;
  marginRight?: SkeletonLength;
  marginBottom?: SkeletonLength;
  marginLeft?: SkeletonLength;
  boxSizing?: React.CSSProperties["boxSizing"];
  flex?: React.CSSProperties["flex"];
  flexGrow?: React.CSSProperties["flexGrow"];
  flexShrink?: React.CSSProperties["flexShrink"];
  flexBasis?: SkeletonLength;
  order?: React.CSSProperties["order"];
  alignSelf?: React.CSSProperties["alignSelf"];
  aspectRatio?: SkeletonLength;
  scale?: number;
};

export type SkeletonBaseStyleResponsive =
  | SkeletonBaseStyle
  | Record<string, SkeletonBaseStyle>;

export type SkeletonWrapStyle = SkeletonBaseStyle & {
  padding?: SkeletonLength;
  border?: React.CSSProperties["border"];
  boxShadow?: React.CSSProperties["boxShadow"];
};

export type SkeletonContainerStyle = {
  position?: React.CSSProperties["position"];
  inset?: SkeletonLength;
  insetBlock?: SkeletonLength;
  insetInline?: SkeletonLength;
  top?: SkeletonLength;
  right?: SkeletonLength;
  bottom?: SkeletonLength;
  left?: SkeletonLength;
  zIndex?: React.CSSProperties["zIndex"];
  display?: React.CSSProperties["display"];
  flexDirection?: React.CSSProperties["flexDirection"];
  aspectRatio?: SkeletonLength;
  gap?: SkeletonLength;
  rowGap?: SkeletonLength;
  columnGap?: SkeletonLength;
  padding?: SkeletonLength;
  align?: React.CSSProperties["alignItems"];
  alignItems?: React.CSSProperties["alignItems"];
  alignContent?: React.CSSProperties["alignContent"];
  justify?: React.CSSProperties["justifyContent"];
  justifyContent?: React.CSSProperties["justifyContent"];
  wrap?: boolean;
  flexWrap?: React.CSSProperties["flexWrap"];
  width?: SkeletonLength;
  minWidth?: SkeletonLength;
  maxWidth?: SkeletonLength;
  height?: SkeletonLength;
  minHeight?: SkeletonLength;
  maxHeight?: SkeletonLength;
  backgroundColor?: string;
  borderRadius?: SkeletonLength;
  border?: React.CSSProperties["border"];
  boxShadow?: React.CSSProperties["boxShadow"];
  margin?: SkeletonLength;
  marginTop?: SkeletonLength;
  marginRight?: SkeletonLength;
  marginBottom?: SkeletonLength;
  marginLeft?: SkeletonLength;
  boxSizing?: React.CSSProperties["boxSizing"];
  flex?: React.CSSProperties["flex"];
  flexGrow?: React.CSSProperties["flexGrow"];
  flexShrink?: React.CSSProperties["flexShrink"];
  flexBasis?: SkeletonLength;
  order?: React.CSSProperties["order"];
  alignSelf?: React.CSSProperties["alignSelf"];
  overflow?: React.CSSProperties["overflow"];
  transform?: React.CSSProperties["transform"];
  pointerEvents?: React.CSSProperties["pointerEvents"];
  opacity?: React.CSSProperties["opacity"];
};

export type SkeletonContainerStyleResponsive =
  | SkeletonContainerStyle
  | Record<string, SkeletonContainerStyle>;

type SkeletonTextNode = {
  kind: "text";
  barHeight: ResponsiveTextBarHeight;
  barWidth?: ResponsiveTextBarWidth;
  lineHeight: ResponsiveTextLineHeight;
  lines?: ResponsiveTextLineCount;
  lastBarWidth?: ResponsiveTextLastBarWidth;
  responsiveBy?: TextSkeletonResponsiveBy;
  style?: SkeletonBaseStyleResponsive;
  shimmer?: SkeletonShimmer;
};

export type SkeletonNode =
  | {
      kind: "stack" | "row" | "col";
      style?: SkeletonContainerStyleResponsive;
      children: SkeletonNode[];
    }
  | {
      kind: "rect" | "square" | "circle";
      style?: SkeletonBaseStyleResponsive;
      shimmer?: SkeletonShimmer;
    }
  | {
      kind: "media";
      count: number;
      direction?: "row" | "col";
      style?: SkeletonContainerStyleResponsive;
      tile?: {
        shape?: "rect" | "square" | "circle";
        style?: SkeletonBaseStyleResponsive;
        shimmer?: SkeletonShimmer;
      };
    }
  | SkeletonTextNode;

export type SkeletonLayoutRoot<TKind extends string> = {
  kind: TKind;
  style?: SkeletonContainerStyleResponsive;
  count?: number;
  item: SkeletonNode;
  itemWrapStyle?: SkeletonWrapStyle;
};

export type ResponsiveCssRule = {
  minWidth: number;
  css: string;
  query?: "viewport" | "container";
  raw?: boolean;
};

export type SkeletonResponsiveCssEntry = {
  nodeId: string;
  rules: ResponsiveCssRule[];
};

type ResponsiveStyleValue<T extends object> = T | Record<string, T>;

type ResponsiveStyleRule<T extends object> = {
  minWidth: number;
  style: T;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function parseResponsiveStyleMinWidth(
  key: string,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number | null {
  const named = breakpointMap[key];
  if (Number.isFinite(named)) return Math.max(0, named);

  const numeric = Number(key);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, numeric);
}

function splitResponsiveStyle<T extends object>(
  value: ResponsiveStyleValue<T> | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): {
  baseStyle: T | undefined;
  rules: ResponsiveStyleRule<T>[];
} {
  if (!isPlainObject(value)) {
    return {
      baseStyle: value as T | undefined,
      rules: [],
    };
  }

  const baseStyle: Record<string, unknown> = {};
  const rulesMap = new Map<number, Record<string, unknown>>();

  for (const [key, raw] of Object.entries(value)) {
    const minWidth = parseResponsiveStyleMinWidth(key, breakpointMap);
    if (minWidth != null && isPlainObject(raw)) {
      rulesMap.set(minWidth, {
        ...(rulesMap.get(minWidth) ?? {}),
        ...raw,
      });
      continue;
    }

    baseStyle[key] = raw;
  }

  return {
    baseStyle: Object.keys(baseStyle).length ? (baseStyle as T) : undefined,
    rules: Array.from(rulesMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([minWidth, style]) => ({
        minWidth,
        style: style as T,
      })),
  };
}

function mergeResolvedStyle<T extends object>(
  value: ResponsiveStyleValue<T> | undefined,
  minWidth: number,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): T | undefined {
  const { baseStyle, rules } = splitResponsiveStyle(value, breakpointMap);
  const resolved: Record<string, unknown> = {
    ...(baseStyle ?? {}),
  };

  for (const rule of rules) {
    if (rule.minWidth > minWidth) break;
    Object.assign(resolved, rule.style);
  }

  return Object.keys(resolved).length ? (resolved as T) : undefined;
}

function extractInlineStyle<T extends object>(
  value: ResponsiveStyleValue<T> | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): T | undefined {
  const { baseStyle, rules } = splitResponsiveStyle(value, breakpointMap);
  if (!baseStyle) return undefined;
  if (!rules.length) return baseStyle;

  const overriddenKeys = new Set<string>();
  for (const rule of rules) {
    for (const key of Object.keys(rule.style)) {
      overriddenKeys.add(key);
    }
  }

  const inlineStyle: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(baseStyle)) {
    if (!overriddenKeys.has(key)) {
      inlineStyle[key] = raw;
    }
  }

  return Object.keys(inlineStyle).length ? (inlineStyle as T) : undefined;
}

function collectStyleBreakpoints<T extends object>(
  value: ResponsiveStyleValue<T> | undefined,
  out: Set<number>,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
) {
  const { rules } = splitResponsiveStyle(value, breakpointMap);
  for (const rule of rules) {
    if (rule.minWidth > 0) out.add(rule.minWidth);
  }
}

function buildResponsiveStyleRules<T extends object>(args: {
  value: ResponsiveStyleValue<T> | undefined;
  breakpointMap?: BreakpointMap;
  serialize: (style: T) => string;
  selector?: string;
}): ResponsiveCssRule[] {
  const breakpointMap = args.breakpointMap ?? BREAKPOINT_MAP;
  const selector =
    args.selector ?? TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER;
  const out: ResponsiveCssRule[] = [];
  const { rules } = splitResponsiveStyle(args.value, breakpointMap);
  if (!rules.length) return [];

  const breakpoints = new Set<number>([0]);
  for (const rule of rules) {
    breakpoints.add(rule.minWidth);
  }

  for (const minWidth of Array.from(breakpoints).sort((a, b) => a - b)) {
    const resolved = mergeResolvedStyle(args.value, minWidth, breakpointMap);
    const css = resolved ? args.serialize(resolved) : "";

    if (!css) continue;

    out.push({
      minWidth,
      css: `${selector}{${css}}`,
      raw: true,
    });
  }

  return out;
}

export function cssLen(v: SkeletonLength | undefined): string | undefined {
  if (v == null) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

export function applyBoxMargins(
  style: SkeletonBaseStyle | undefined
): React.CSSProperties {
  if (!style) return {};

  const margin = cssLen(style.margin);
  const mt = cssLen(style.marginTop);
  const mr = cssLen(style.marginRight);
  const mb = cssLen(style.marginBottom);
  const ml = cssLen(style.marginLeft);

  const out: React.CSSProperties = {};
  if (margin != null) out.margin = margin;
  if (mt != null) out.marginTop = mt;
  if (mr != null) out.marginRight = mr;
  if (mb != null) out.marginBottom = mb;
  if (ml != null) out.marginLeft = ml;
  return out;
}

function applyFlexItemStyleVars(
  out: React.CSSProperties,
  style: Pick<
    SkeletonBaseStyle,
    "flex" | "flexGrow" | "flexShrink" | "flexBasis" | "order" | "alignSelf" | "boxSizing"
  > | undefined
) {
  if (!style) return;

  if (style.flex != null) out.flex = style.flex;
  if (style.flexGrow != null) out.flexGrow = style.flexGrow;
  if (style.flexShrink != null) out.flexShrink = style.flexShrink;
  if (style.flexBasis != null) out.flexBasis = cssLen(style.flexBasis);
  if (style.order != null) out.order = style.order;
  if (style.alignSelf) out.alignSelf = style.alignSelf;
  if (style.boxSizing != null) out.boxSizing = style.boxSizing;
}

function appendFlexItemDecls(
  decls: string[],
  style: Pick<
    SkeletonBaseStyle,
    "flex" | "flexGrow" | "flexShrink" | "flexBasis" | "order" | "alignSelf" | "boxSizing"
  > | undefined
) {
  if (!style) return;

  if (style.flex != null) decls.push(`flex:${style.flex};`);
  if (style.flexGrow != null) decls.push(`flex-grow:${style.flexGrow};`);
  if (style.flexShrink != null) decls.push(`flex-shrink:${style.flexShrink};`);
  if (style.flexBasis != null) decls.push(`flex-basis:${cssLen(style.flexBasis)};`);
  if (style.order != null) decls.push(`order:${style.order};`);
  if (style.alignSelf) decls.push(`align-self:${style.alignSelf};`);
  if (style.boxSizing != null) decls.push(`box-sizing:${style.boxSizing};`);
}

export function nodeStyleVars(
  base: SkeletonBaseStyle | undefined,
  shimmer: SkeletonShimmer | undefined
): React.CSSProperties {
  const s: React.CSSProperties = {};

  if (base?.aspectRatio != null) (s as any).aspectRatio = base.aspectRatio as any;

  const w = cssLen(base?.width);
  const minW = cssLen(base?.minWidth);
  const mw = cssLen(base?.maxWidth);
  const h = cssLen(base?.height);
  const minH = cssLen(base?.minHeight);
  const mh = cssLen(base?.maxHeight);

  if (w != null) {
    (s as any).inlineSize = w;
    (s as any).width = w;
  }

  if (minW != null) {
    (s as any).minInlineSize = minW;
    (s as any).minWidth = minW;
  }

  if (mw != null) {
    (s as any).maxInlineSize = mw;
    (s as any).maxWidth = mw;
  }

  if (h != null) s.height = h;
  if (minH != null) s.minHeight = minH;
  if (mh != null) s.maxHeight = mh;

  if (base?.aspectRatio != null && base?.height == null) {
    (s as any).height = "auto";
  }

  if (base?.aspectRatio != null && base?.width == null && base?.height == null) {
    (s as any).inlineSize = "100%";
    (s as any).width = "100%";
    (s as any).height = "auto";
  }

  if (base?.backgroundColor) (s as any)["--rmg-skel-bg"] = base.backgroundColor;
  if (base?.borderRadius != null) (s as any)["--rmg-skel-radius"] = cssLen(base.borderRadius);
  if (base?.overflow != null) s.overflow = base.overflow;
  applyFlexItemStyleVars(s, base);
  if (base?.scale != null) s.transform = `scale(${base.scale})`;

  Object.assign(s, shimmerStyleVars(shimmer));

  return s;
}

function appendBoxMarginDecls(
  decls: string[],
  style: SkeletonBaseStyle | undefined
) {
  const margin = cssLen(style?.margin);
  const mt = cssLen(style?.marginTop);
  const mr = cssLen(style?.marginRight);
  const mb = cssLen(style?.marginBottom);
  const ml = cssLen(style?.marginLeft);

  if (margin != null) decls.push(`margin:${margin};`);
  if (mt != null) decls.push(`margin-top:${mt};`);
  if (mr != null) decls.push(`margin-right:${mr};`);
  if (mb != null) decls.push(`margin-bottom:${mb};`);
  if (ml != null) decls.push(`margin-left:${ml};`);
}

function baseStyleToCssDecls(style: SkeletonBaseStyle | undefined): string {
  if (!style) return "";

  const decls: string[] = [];
  const w = cssLen(style.width);
  const minW = cssLen(style.minWidth);
  const mw = cssLen(style.maxWidth);
  const h = cssLen(style.height);
  const minH = cssLen(style.minHeight);
  const mh = cssLen(style.maxHeight);

  if (style.aspectRatio != null) {
    decls.push(`aspect-ratio:${String(style.aspectRatio)};`);
  }

  if (w != null) {
    decls.push(`inline-size:${w};`);
    decls.push(`width:${w};`);
  }

  if (minW != null) {
    decls.push(`min-inline-size:${minW};`);
    decls.push(`min-width:${minW};`);
  }

  if (mw != null) {
    decls.push(`max-inline-size:${mw};`);
    decls.push(`max-width:${mw};`);
  }

  if (h != null) decls.push(`height:${h};`);
  if (minH != null) decls.push(`min-height:${minH};`);
  if (mh != null) decls.push(`max-height:${mh};`);

  if (style.aspectRatio != null && style.height == null) {
    decls.push("height:auto;");
  }

  if (
    style.aspectRatio != null &&
    style.width == null &&
    style.height == null
  ) {
    decls.push("inline-size:100%;");
    decls.push("width:100%;");
    decls.push("height:auto;");
  }

  if (style.backgroundColor) decls.push(`--rmg-skel-bg:${style.backgroundColor};`);
  if (style.borderRadius != null) {
    decls.push(`--rmg-skel-radius:${cssLen(style.borderRadius)};`);
  }
  if (style.overflow != null) decls.push(`overflow:${style.overflow};`);
  appendFlexItemDecls(decls, style);
  if (style.scale != null) decls.push(`transform:scale(${style.scale});`);

  appendBoxMarginDecls(decls, style);
  return decls.join("");
}

function textWrapperStyleToCssDecls(
  style: SkeletonBaseStyle | undefined
): string {
  if (!style) return "";

  const decls: string[] = [];
  const w = cssLen(style.width);
  const minW = cssLen(style.minWidth);
  const mw = cssLen(style.maxWidth);

  if (w != null) {
    decls.push(`inline-size:${w};`);
    decls.push(`width:${w};`);
  }

  if (minW != null) {
    decls.push(`min-inline-size:${minW};`);
    decls.push(`min-width:${minW};`);
  }

  if (mw != null) {
    decls.push(`max-inline-size:${mw};`);
    decls.push(`max-width:${mw};`);
  }

  appendFlexItemDecls(decls, style);
  if (style.scale != null) decls.push(`transform:scale(${style.scale});`);

  appendBoxMarginDecls(decls, style);
  return decls.join("");
}

function textLineStyleToCssDecls(style: SkeletonBaseStyle | undefined): string {
  if (!style) return "";

  const decls: string[] = [];
  if (style.backgroundColor) decls.push(`--rmg-skel-bg:${style.backgroundColor};`);
  if (style.borderRadius != null) {
    decls.push(`--rmg-skel-radius:${cssLen(style.borderRadius)};`);
  }
  return decls.join("");
}

export function shimmerStyleVars(
  shimmer: SkeletonShimmer | undefined,
  options?: {
    enabledVarName?: string;
  }
): React.CSSProperties {
  const s: React.CSSProperties = {};
  const enabledVarName = options?.enabledVarName ?? "--rmg-skel-shimmer-enabled";

  if (shimmer?.enabled === false) {
    (s as any)[enabledVarName] = "0";
  }

  if (shimmer?.durationMs != null) {
    (s as any)["--rmg-skel-shimmer-duration"] = `${shimmer.durationMs}ms`;
  }

  if (shimmer?.angleDeg != null) {
    (s as any)["--rmg-skel-shimmer-angle"] = `${shimmer.angleDeg}deg`;
  }

  if (shimmer?.opacity != null) {
    (s as any)["--rmg-skel-shimmer-opacity"] = String(shimmer.opacity);
  }

  if (shimmer?.blurPx != null) {
    (s as any)["--rmg-skel-shimmer-blur"] = `${shimmer.blurPx}px`;
    (s as any)["--rmg-skel-shimmer-filter"] =
      shimmer.blurPx > 0 ? `blur(${shimmer.blurPx}px)` : "none";
  }

  if (shimmer?.timing) {
    (s as any)["--rmg-skel-shimmer-timing"] = shimmer.timing;
  }

  if (shimmer?.c1) {
    (s as any)["--rmg-skel-shimmer-c1"] = shimmer.c1;
  }

  if (shimmer?.c2) {
    (s as any)["--rmg-skel-shimmer-c2"] = shimmer.c2;
  }

  if (shimmer?.c3) {
    (s as any)["--rmg-skel-shimmer-c3"] = shimmer.c3;
  }

  return s;
}

function textWrapperStyleVars(
  base: SkeletonBaseStyle | undefined,
  height?: number
): React.CSSProperties {
  const s: React.CSSProperties = {};
  if (height != null) {
    s.height = `${height}px`;
  }

  const w = cssLen(base?.width);
  const minW = cssLen(base?.minWidth);
  const mw = cssLen(base?.maxWidth);

  if (w != null) {
    (s as any).inlineSize = w;
    (s as any).width = w;
  }

  if (minW != null) {
    (s as any).minInlineSize = minW;
    (s as any).minWidth = minW;
  }

  if (mw != null) {
    (s as any).maxInlineSize = mw;
    (s as any).maxWidth = mw;
  }

  applyFlexItemStyleVars(s, base);
  if (base?.scale != null) s.transform = `scale(${base.scale})`;

  return s;
}

function isMaxContentWidth(value: unknown): boolean {
  return typeof value === "string" && value.trim() === "max-content";
}

function styleUsesMaxContentWidth(style: unknown): boolean {
  if (!style || typeof style !== "object") return false;

  const plain = style as { width?: unknown };
  if (isMaxContentWidth(plain.width)) return true;

  return Object.values(style as Record<string, unknown>).some(
    (value) =>
      !!value &&
      typeof value === "object" &&
      isMaxContentWidth((value as { width?: unknown }).width)
  );
}

export function wrapStyleVars(
  base: SkeletonWrapStyle | undefined
): React.CSSProperties {
  const s = nodeStyleVars(base, undefined);
  delete (s as any)["--rmg-skel-bg"];
  if (base?.backgroundColor != null) s.backgroundColor = base.backgroundColor;
  if (base?.padding != null) s.padding = cssLen(base.padding);
  if (base?.border != null) s.border = base.border;
  if (base?.boxShadow != null) s.boxShadow = base.boxShadow;
  if (base?.borderRadius != null) {
    s.borderRadius = cssLen(base.borderRadius);
    s.overflow = base?.overflow ?? "hidden";
  } else if (base?.overflow != null) {
    s.overflow = base.overflow;
  }
  s.boxSizing = "border-box";
  return s;
}

export function containerStylesPlain(
  style?: SkeletonContainerStyle
): React.CSSProperties {
  const s: React.CSSProperties = {};
  if (!style) return s;

  if (style.position != null) s.position = style.position;
  if (style.inset != null) (s as any).inset = cssLen(style.inset);
  if (style.insetBlock != null) (s as any).insetBlock = cssLen(style.insetBlock);
  if (style.insetInline != null) (s as any).insetInline = cssLen(style.insetInline);
  if (style.top != null) s.top = cssLen(style.top);
  if (style.right != null) s.right = cssLen(style.right);
  if (style.bottom != null) s.bottom = cssLen(style.bottom);
  if (style.left != null) s.left = cssLen(style.left);
  if (style.zIndex != null) s.zIndex = style.zIndex;
  if (style.display != null) s.display = style.display;
  if (style.flexDirection != null) s.flexDirection = style.flexDirection;
  if (style.gap != null) (s as any).gap = cssLen(style.gap);
  if (style.rowGap != null) (s as any).rowGap = cssLen(style.rowGap);
  if (style.columnGap != null) (s as any).columnGap = cssLen(style.columnGap);
  if (style.padding != null) (s as any).padding = cssLen(style.padding);
  if (style.align ?? style.alignItems) s.alignItems = style.alignItems ?? style.align;
  if (style.alignContent != null) s.alignContent = style.alignContent;
  if (style.justify ?? style.justifyContent) {
    s.justifyContent = style.justifyContent ?? style.justify;
  }
  if (style.aspectRatio != null) (s as any).aspectRatio = style.aspectRatio as any;
  if (style.flexWrap != null) {
    s.flexWrap = style.flexWrap;
  } else if (style.wrap) {
    s.flexWrap = "wrap";
  }

  if (style.width != null) s.width = cssLen(style.width);
  if (style.minWidth != null) s.minWidth = cssLen(style.minWidth);
  if (style.maxWidth != null) s.maxWidth = cssLen(style.maxWidth);
  if (style.height != null) s.height = cssLen(style.height);
  if (style.minHeight != null) s.minHeight = cssLen(style.minHeight);
  if (style.maxHeight != null) s.maxHeight = cssLen(style.maxHeight);
  if (style.aspectRatio != null && style.height == null) s.height = "auto";
  if (style.backgroundColor != null) s.backgroundColor = style.backgroundColor;
  if (style.borderRadius != null) s.borderRadius = cssLen(style.borderRadius);
  if (style.border != null) s.border = style.border;
  if (style.boxShadow != null) s.boxShadow = style.boxShadow;
  if (style.margin != null) s.margin = cssLen(style.margin);
  if (style.marginTop != null) s.marginTop = cssLen(style.marginTop);
  if (style.marginRight != null) s.marginRight = cssLen(style.marginRight);
  if (style.marginBottom != null) s.marginBottom = cssLen(style.marginBottom);
  if (style.marginLeft != null) s.marginLeft = cssLen(style.marginLeft);
  applyFlexItemStyleVars(s, style as SkeletonBaseStyle);
  if (style.overflow != null) s.overflow = style.overflow;
  if (style.transform != null) s.transform = style.transform;
  if (style.pointerEvents != null) s.pointerEvents = style.pointerEvents;
  if (style.opacity != null) s.opacity = style.opacity;

  return s;
}

export function isResponsiveContainerStyle(
  style: SkeletonContainerStyleResponsive | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): style is Record<string, SkeletonContainerStyle> {
  return splitResponsiveStyle(style, breakpointMap).rules.length > 0;
}

export function isResponsiveBaseStyle(
  style: SkeletonBaseStyleResponsive | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): style is Record<string, SkeletonBaseStyle> {
  return splitResponsiveStyle(style, breakpointMap).rules.length > 0;
}

export function resolveResponsiveBaseStyleAtMinWidth(
  style: SkeletonBaseStyleResponsive | undefined,
  minWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SkeletonBaseStyle | undefined {
  return mergeResolvedStyle(style, minWidth, breakpointMap);
}

export function resolveResponsiveContainerStyleAtMinWidth(
  style: SkeletonContainerStyleResponsive | undefined,
  minWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SkeletonContainerStyle | undefined {
  return mergeResolvedStyle(style, minWidth, breakpointMap);
}

export function resolveInlineResponsiveBaseStyle(
  style: SkeletonBaseStyleResponsive | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SkeletonBaseStyle | undefined {
  return extractInlineStyle(style, breakpointMap);
}

export function resolveInlineResponsiveContainerStyle(
  style: SkeletonContainerStyleResponsive | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SkeletonContainerStyle | undefined {
  return extractInlineStyle(style, breakpointMap);
}

export function collectResponsiveStyleBreakpoints(
  style:
    | SkeletonBaseStyleResponsive
    | SkeletonContainerStyleResponsive
    | undefined,
  out: Set<number>,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
) {
  collectStyleBreakpoints(style as ResponsiveStyleValue<Record<string, unknown>> | undefined, out, breakpointMap);
}

export function escapeAttrValue(v: string) {
  return v.replace(/"/g, '\\"');
}

export function sanitizeIdForAttr(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function containerStyleToCssDecls(style: SkeletonContainerStyle): string {
  const decls: string[] = [];
  if (style.position != null) decls.push(`position:${style.position};`);
  if (style.inset != null) decls.push(`inset:${cssLen(style.inset)};`);
  if (style.insetBlock != null) decls.push(`inset-block:${cssLen(style.insetBlock)};`);
  if (style.insetInline != null) decls.push(`inset-inline:${cssLen(style.insetInline)};`);
  if (style.top != null) decls.push(`top:${cssLen(style.top)};`);
  if (style.right != null) decls.push(`right:${cssLen(style.right)};`);
  if (style.bottom != null) decls.push(`bottom:${cssLen(style.bottom)};`);
  if (style.left != null) decls.push(`left:${cssLen(style.left)};`);
  if (style.zIndex != null) decls.push(`z-index:${style.zIndex};`);
  if (style.display != null) decls.push(`display:${style.display};`);
  if (style.flexDirection != null) decls.push(`flex-direction:${style.flexDirection};`);
  if (style.gap != null) decls.push(`gap:${cssLen(style.gap)};`);
  if (style.rowGap != null) decls.push(`row-gap:${cssLen(style.rowGap)};`);
  if (style.columnGap != null) decls.push(`column-gap:${cssLen(style.columnGap)};`);
  if (style.padding != null) decls.push(`padding:${cssLen(style.padding)};`);
  if (style.align ?? style.alignItems) {
    decls.push(`align-items:${style.alignItems ?? style.align};`);
  }
  if (style.alignContent != null) decls.push(`align-content:${style.alignContent};`);
  if (style.justify ?? style.justifyContent) {
    decls.push(`justify-content:${style.justifyContent ?? style.justify};`);
  }
  if (style.aspectRatio != null) {
    decls.push(`aspect-ratio:${String(style.aspectRatio)};`);
  }
  if (style.flexWrap != null) {
    decls.push(`flex-wrap:${style.flexWrap};`);
  } else if (style.wrap) {
    decls.push(`flex-wrap:wrap;`);
  }
  if (style.width != null) decls.push(`width:${cssLen(style.width)};`);
  if (style.minWidth != null) decls.push(`min-width:${cssLen(style.minWidth)};`);
  if (style.maxWidth != null) decls.push(`max-width:${cssLen(style.maxWidth)};`);
  if (style.height != null) decls.push(`height:${cssLen(style.height)};`);
  if (style.minHeight != null) decls.push(`min-height:${cssLen(style.minHeight)};`);
  if (style.maxHeight != null) decls.push(`max-height:${cssLen(style.maxHeight)};`);
  if (style.aspectRatio != null && style.height == null) decls.push("height:auto;");
  if (style.backgroundColor != null) decls.push(`background-color:${style.backgroundColor};`);
  if (style.borderRadius != null) decls.push(`border-radius:${cssLen(style.borderRadius)};`);
  if (style.border != null) decls.push(`border:${style.border};`);
  if (style.boxShadow != null) decls.push(`box-shadow:${style.boxShadow};`);
  appendBoxMarginDecls(decls, style as SkeletonBaseStyle);
  appendFlexItemDecls(decls, style as SkeletonBaseStyle);
  if (style.overflow != null) decls.push(`overflow:${style.overflow};`);
  if (style.transform != null) decls.push(`transform:${style.transform};`);
  if (style.pointerEvents != null) decls.push(`pointer-events:${style.pointerEvents};`);
  if (style.opacity != null) decls.push(`opacity:${style.opacity};`);
  return decls.join("");
}

export function buildResponsiveContainerStyleCssRules(args: {
  style: SkeletonContainerStyleResponsive | undefined;
  breakpointMap?: BreakpointMap;
  selector?: string;
}): ResponsiveCssRule[] {
  return buildResponsiveStyleRules({
    value: args.style,
    breakpointMap: args.breakpointMap,
    selector: args.selector,
    serialize: containerStyleToCssDecls,
  });
}

export function buildResponsiveBaseStyleCssRules(args: {
  style: SkeletonBaseStyleResponsive | undefined;
  breakpointMap?: BreakpointMap;
  selector?: string;
}): ResponsiveCssRule[] {
  return buildResponsiveStyleRules({
    value: args.style,
    breakpointMap: args.breakpointMap,
    selector: args.selector,
    serialize: baseStyleToCssDecls,
  });
}

export function buildResponsiveTextStyleCssRules(args: {
  style: SkeletonBaseStyleResponsive | undefined;
  breakpointMap?: BreakpointMap;
  selector?: string;
}): ResponsiveCssRule[] {
  const breakpointMap = args.breakpointMap ?? BREAKPOINT_MAP;
  if (!isResponsiveBaseStyle(args.style, breakpointMap)) return [];

  const selector =
    args.selector ?? TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER;
  const out: ResponsiveCssRule[] = [];
  const breakpoints = new Set<number>([0]);

  collectStyleBreakpoints(args.style, breakpoints, breakpointMap);

  for (const minWidth of Array.from(breakpoints).sort((a, b) => a - b)) {
    const resolved = resolveResponsiveBaseStyleAtMinWidth(
      args.style,
      minWidth,
      breakpointMap
    );
    const wrapperCss = textWrapperStyleToCssDecls(resolved);
    const lineCss = textLineStyleToCssDecls(resolved);
    const css = [
      wrapperCss ? `${selector}{${wrapperCss}}` : "",
      lineCss
        ? `${selector} [data-rmg-skel-text-line="true"]{${lineCss}}`
        : "",
    ]
      .filter(Boolean)
      .join("");

    if (!css) continue;
    out.push({
      minWidth,
      css,
      raw: true,
    });
  }

  return out;
}

export function collectResponsiveCss<TKind extends string>(
  node: SkeletonLayoutRoot<TKind> | SkeletonNode,
  allocId: () => string,
  out: SkeletonResponsiveCssEntry[],
  rootKind: TKind,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SkeletonLayoutRoot<TKind> | SkeletonNode {
  if ((node as any).kind === rootKind) {
    const rootNode = node as SkeletonLayoutRoot<TKind>;
    const rules = buildResponsiveContainerStyleCssRules({
      style: rootNode.style,
      breakpointMap,
    });
    const id = rules.length ? allocId() : undefined;

    if (id && rules.length) out.push({ nodeId: id, rules });

    const item = collectResponsiveCss(
      rootNode.item,
      allocId,
      out,
      rootKind,
      breakpointMap
    ) as SkeletonNode;
    const slots = Array.isArray((rootNode as any).slots)
      ? (rootNode as any).slots.map((slot: any) => ({
          ...slot,
          item: slot?.item
            ? (collectResponsiveCss(
                slot.item,
                allocId,
                out,
                rootKind,
                breakpointMap
              ) as SkeletonNode)
            : slot?.item,
        }))
      : undefined;

    return {
      ...(rootNode as any),
      ...(id ? { __rmgNodeId: id } : null),
      item,
      ...(slots ? { slots } : null),
    };
  }

  switch (node.kind) {
    case "rect":
    case "square":
    case "circle": {
      const shapeNode = node as Extract<
        SkeletonNode,
        { kind: "rect" | "square" | "circle" }
      >;
      const rules = buildResponsiveBaseStyleCssRules({
        style: shapeNode.style,
        breakpointMap,
      });
      if (!rules.length) return node;

      const id = allocId();
      out.push({ nodeId: id, rules });
      return { ...(shapeNode as any), __rmgNodeId: id };
    }

    case "text": {
      const textNode = node as Extract<SkeletonNode, { kind: "text" }>;
      const renderState =
        (textNode as any).__rmgTextRenderState ??
        getResponsiveTextRenderState({
          barHeight: textNode.barHeight,
          barWidth: textNode.barWidth,
          lineHeight: textNode.lineHeight,
          lines: textNode.lines,
          lastBarWidth: textNode.lastBarWidth,
          responsiveBy: textNode.responsiveBy,
          breakpointMap,
        });
      const rules = [
        ...buildResponsiveTextCssRules({
          renderState,
          fitContent: styleUsesMaxContentWidth(textNode.style),
        }).map((rule) => ({ ...rule, raw: true })),
        ...buildResponsiveTextStyleCssRules({
          style: textNode.style,
          breakpointMap,
        }),
      ];

      if (!rules.length && !(textNode as any).__rmgTextRenderState) {
        return node;
      }

      const id = rules.length ? allocId() : undefined;
      if (id && rules.length) out.push({ nodeId: id, rules });

      return {
        ...(textNode as any),
        ...(id ? { __rmgNodeId: id } : null),
        __rmgTextRenderState: renderState,
      };
    }

    case "media": {
      const mediaNode = node as Extract<SkeletonNode, { kind: "media" }>;
      const rules = [
        ...buildResponsiveContainerStyleCssRules({
          style: mediaNode.style,
          breakpointMap,
        }),
        ...buildResponsiveBaseStyleCssRules({
          style: mediaNode.tile?.style,
          breakpointMap,
          selector: `${TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER} [data-rmg-skel-media-tile="true"]`,
        }),
      ];

      if (!rules.length) return node;

      const id = allocId();
      out.push({ nodeId: id, rules });
      return { ...(node as any), __rmgNodeId: id };
    }

    case "stack":
    case "row":
    case "col": {
      const groupNode = node as Extract<SkeletonNode, { kind: "stack" | "row" | "col" }>;
      const rules = buildResponsiveContainerStyleCssRules({
        style: groupNode.style,
        breakpointMap,
      });
      const id = rules.length ? allocId() : undefined;

      if (id && rules.length) out.push({ nodeId: id, rules });

      const children = groupNode.children.map((child: SkeletonNode) =>
        collectResponsiveCss(child, allocId, out, rootKind, breakpointMap)
      ) as SkeletonNode[];

      return {
        ...(groupNode as any),
        ...(id ? { __rmgNodeId: id } : null),
        children,
      };
    }

    default:
      return node;
  }
}

export function buildResponsiveCssText(args: {
  scopeAttr: string;
  scopeId: string;
  rules: SkeletonResponsiveCssEntry[];
}) {
  if (!args.rules.length) return "";

  const scopeSel = `[${args.scopeAttr}="${escapeAttrValue(args.scopeId)}"]`;
  const lines: string[] = [];

  for (const nodeRule of args.rules) {
    const nodeSel = `${scopeSel} [data-rmg-skel-node="${escapeAttrValue(nodeRule.nodeId)}"]`;
    for (const rule of nodeRule.rules) {
      const cssText = rule.raw
        ? rule.css.split("__NODE_SEL__").join(nodeSel)
        : `${nodeSel}{${rule.css}}`;

      if (rule.minWidth <= 0) {
        lines.push(cssText);
      } else if (rule.query === "container") {
        lines.push(`@container (min-width:${rule.minWidth}px){${cssText}}`);
      } else {
        lines.push(`@media (min-width:${rule.minWidth}px){${cssText}}`);
      }
    }
  }

  return lines.join("\n");
}

function renderNodeStyleVars(
  base: SkeletonBaseStyle | undefined,
  shimmer: SkeletonShimmer | undefined,
  disableShimmer?: boolean
): React.CSSProperties {
  return nodeStyleVars(
    base,
    disableShimmer ? undefined : shimmer
  );
}

type SkeletonRenderOptions = {
  disableShimmer?: boolean;
};

function ShapeNode(
  props: Extract<SkeletonNode, { kind: "rect" | "square" | "circle" }> &
    SkeletonRenderOptions & {
      breakpointMap: BreakpointMap;
      mediaTile?: boolean;
    }
) {
  const { kind, style, shimmer, disableShimmer, breakpointMap, mediaTile } = props;
  const shapeCls =
    kind === "circle"
      ? styles.skelCircle
      : kind === "square"
      ? styles.skelSquare
      : styles.skelRect;
  const inlineStyle = resolveInlineResponsiveBaseStyle(style, breakpointMap);
  const nodeId = (props as any).__rmgNodeId as string | undefined;

  return (
    <div
      data-rmg-skel-node={nodeId}
      data-rmg-skel-media-tile={mediaTile ? "true" : undefined}
      className={[styles.skelTile, shapeCls, disableShimmer ? null : styles.skelShimmer]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...renderNodeStyleVars(inlineStyle, shimmer, disableShimmer),
        ...applyBoxMargins(inlineStyle),
      }}
    />
  );
}

function TextNode({
  node,
  disableShimmer,
  breakpointMap,
}: {
  node: Extract<SkeletonNode, { kind: "text" }>;
  breakpointMap: BreakpointMap;
} & SkeletonRenderOptions) {
  const renderState =
    (node as any).__rmgTextRenderState ??
    getResponsiveTextRenderState({
      barHeight: node.barHeight,
      barWidth: node.barWidth,
      lineHeight: node.lineHeight,
      lines: node.lines,
      lastBarWidth: node.lastBarWidth,
      responsiveBy: node.responsiveBy,
      breakpointMap,
    });
  const inlineStyle = resolveInlineResponsiveBaseStyle(
    node.style,
    breakpointMap
  );
  const nodeId = (node as any).__rmgNodeId as string | undefined;
  const usesContainerQueries =
    renderState.responsiveBy === "container" && renderState.usesResponsiveBarCss;
  const wrapperStyle = textWrapperStyleVars(
    usesContainerQueries ? undefined : inlineStyle,
    renderState.baseState.metrics.totalHeight
  );
  const marginStyle = applyBoxMargins(inlineStyle);

  const lineStyle: SkeletonBaseStyle = {
    height: renderState.baseState.metrics.barHeight,
    backgroundColor: inlineStyle?.backgroundColor,
    borderRadius: inlineStyle?.borderRadius,
  };
  const fitContent = isMaxContentWidth(inlineStyle?.width);

  const textNode = (
    <div
      data-rmg-skel-node={nodeId}
      data-rmg-skel-text="true"
      className={styles.skelText}
      style={{
        ...wrapperStyle,
        ...(usesContainerQueries ? null : marginStyle),
        paddingBlock: `${renderState.baseState.metrics.paddingBlock}px`,
        rowGap: `${renderState.baseState.metrics.rowGap}px`,
      }}
    >
      {Array.from({ length: renderState.maxLines }).map((_, index) => (
        <div
          key={index}
          data-rmg-skel-text-line="true"
          className={[
            styles.skelTile,
            disableShimmer ? null : styles.skelShimmer,
            styles.skelTextLine,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            ...renderNodeStyleVars(lineStyle, node.shimmer, disableShimmer),
            display:
              index >= renderState.baseState.lineCount ? "none" : undefined,
            width: fitContent
              ? renderState.baseState.barWidths[index] ?? "100%"
              : "100%",
            maxWidth: renderState.baseState.barWidths[index] ?? "100%",
          }}
        />
      ))}
    </div>
  );

  if (!usesContainerQueries) return textNode;

  return (
    <div
      data-rmg-skel-text-container="true"
      style={{
        ...textWrapperStyleVars(inlineStyle),
        ...marginStyle,
        containerType: "inline-size",
      }}
    >
      {textNode}
    </div>
  );
}

export function SkeletonLayoutNode({
  node,
  disableShimmer,
  breakpointMap,
}: {
  node: SkeletonNode;
  breakpointMap?: BreakpointMap;
} & SkeletonRenderOptions) {
  const effectiveBreakpoints = breakpointMap ?? BREAKPOINT_MAP;

  switch (node.kind) {
    case "rect":
    case "square":
    case "circle":
      return (
        <ShapeNode
          {...node}
          disableShimmer={disableShimmer}
          breakpointMap={effectiveBreakpoints}
        />
      );

    case "media": {
      const count = Math.max(0, node.count | 0);
      const direction = node.direction ?? "row";
      const tileShape = node.tile?.shape ?? "rect";
      const nodeId = (node as any).__rmgNodeId as string | undefined;
      const plainStyle = containerStylesPlain(
        resolveInlineResponsiveContainerStyle(
          node.style,
          effectiveBreakpoints
        )
      );

      return (
        <div
          data-rmg-skel-node={nodeId}
          className={[
            styles.skelGroup,
            direction === "row" ? styles.skelRow : styles.skelCol,
          ].join(" ")}
          style={plainStyle}
        >
          {Array.from({ length: count }).map((_, index) => (
            <ShapeNode
              key={index}
              kind={tileShape}
              style={node.tile?.style}
              shimmer={node.tile?.shimmer}
              disableShimmer={disableShimmer}
              breakpointMap={effectiveBreakpoints}
              mediaTile
            />
          ))}
        </div>
      );
    }

    case "stack":
    case "row":
    case "col": {
      const dirCls =
        node.kind === "row"
          ? styles.skelRow
          : node.kind === "col"
          ? styles.skelCol
          : styles.skelStack;

      const nodeId = (node as any).__rmgNodeId as string | undefined;
      const plainStyle = containerStylesPlain(
        resolveInlineResponsiveContainerStyle(
          node.style,
          effectiveBreakpoints
        )
      );

      return (
        <div
          data-rmg-skel-node={nodeId}
          className={[styles.skelGroup, dirCls].join(" ")}
          style={plainStyle}
        >
          {node.children.map((child, index) => (
            <SkeletonLayoutNode
              key={index}
              node={child}
              disableShimmer={disableShimmer}
              breakpointMap={effectiveBreakpoints}
            />
          ))}
        </div>
      );
    }

    case "text":
      return (
        <TextNode
          node={node}
          disableShimmer={disableShimmer}
          breakpointMap={effectiveBreakpoints}
        />
      );

    default:
      return null;
  }
}
