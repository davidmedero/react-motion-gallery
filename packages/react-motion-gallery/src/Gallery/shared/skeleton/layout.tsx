import * as React from "react";

import { BREAKPOINT_MAP, type BreakpointMap } from "../responsive";
import styles from "./layout.module.css";
import {
  TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER,
  buildResponsiveTextCssRules,
  getResponsiveTextRenderState,
  hasResponsiveTextLineCount,
  hasResponsiveTextLineWidth,
  type ResponsiveTextLineCount,
  type ResponsiveTextLineWidth,
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
  maxWidth?: SkeletonLength;
  height?: SkeletonLength;
  maxHeight?: SkeletonLength;
  backgroundColor?: string;
  borderRadius?: SkeletonLength;
  overflow?: React.CSSProperties["overflow"];
  marginTop?: SkeletonLength;
  marginRight?: SkeletonLength;
  marginBottom?: SkeletonLength;
  marginLeft?: SkeletonLength;
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
  gap?: SkeletonLength;
  padding?: SkeletonLength;
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
  wrap?: boolean;
  width?: SkeletonLength;
  maxWidth?: SkeletonLength;
  overflow?: React.CSSProperties["overflow"];
};

export type SkeletonContainerStyleResponsive =
  | SkeletonContainerStyle
  | Record<string, SkeletonContainerStyle>;

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
  | {
      kind: "text";
      fontSize: number;
      lineHeight: number;
      lines?: ResponsiveTextLineCount;
      lineWidth?: ResponsiveTextLineWidth;
      style?: SkeletonBaseStyleResponsive;
      shimmer?: SkeletonShimmer;
    };

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

  const mt = cssLen(style.marginTop);
  const mr = cssLen(style.marginRight);
  const mb = cssLen(style.marginBottom);
  const ml = cssLen(style.marginLeft);

  const out: React.CSSProperties = {};
  if (mt != null) out.marginTop = mt;
  if (mr != null) out.marginRight = mr;
  if (mb != null) out.marginBottom = mb;
  if (ml != null) out.marginLeft = ml;
  return out;
}

export function nodeStyleVars(
  base: SkeletonBaseStyle | undefined,
  shimmer: SkeletonShimmer | undefined
): React.CSSProperties {
  const s: React.CSSProperties = {};

  if (base?.aspectRatio != null) (s as any).aspectRatio = base.aspectRatio as any;

  const w = cssLen(base?.width);
  const mw = cssLen(base?.maxWidth);
  const h = cssLen(base?.height);
  const mh = cssLen(base?.maxHeight);

  if (w != null) {
    (s as any).inlineSize = w;
    (s as any).width = w;
  }

  if (mw != null) {
    (s as any).maxInlineSize = mw;
    (s as any).maxWidth = mw;
  }

  if (h != null) s.height = h;
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
  if (base?.alignSelf) s.alignSelf = base.alignSelf;
  if (base?.scale != null) s.transform = `scale(${base.scale})`;

  Object.assign(s, shimmerStyleVars(shimmer));

  return s;
}

function appendBoxMarginDecls(
  decls: string[],
  style: SkeletonBaseStyle | undefined
) {
  const mt = cssLen(style?.marginTop);
  const mr = cssLen(style?.marginRight);
  const mb = cssLen(style?.marginBottom);
  const ml = cssLen(style?.marginLeft);

  if (mt != null) decls.push(`margin-top:${mt};`);
  if (mr != null) decls.push(`margin-right:${mr};`);
  if (mb != null) decls.push(`margin-bottom:${mb};`);
  if (ml != null) decls.push(`margin-left:${ml};`);
}

function baseStyleToCssDecls(style: SkeletonBaseStyle | undefined): string {
  if (!style) return "";

  const decls: string[] = [];
  const w = cssLen(style.width);
  const mw = cssLen(style.maxWidth);
  const h = cssLen(style.height);
  const mh = cssLen(style.maxHeight);

  if (style.aspectRatio != null) {
    decls.push(`aspect-ratio:${String(style.aspectRatio)};`);
  }

  if (w != null) {
    decls.push(`inline-size:${w};`);
    decls.push(`width:${w};`);
  }

  if (mw != null) {
    decls.push(`max-inline-size:${mw};`);
    decls.push(`max-width:${mw};`);
  }

  if (h != null) decls.push(`height:${h};`);
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
  if (style.alignSelf) decls.push(`align-self:${style.alignSelf};`);
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
  const mw = cssLen(style.maxWidth);

  if (w != null) {
    decls.push(`inline-size:${w};`);
    decls.push(`width:${w};`);
  }

  if (mw != null) {
    decls.push(`max-inline-size:${mw};`);
    decls.push(`max-width:${mw};`);
  }

  if (style.alignSelf) decls.push(`align-self:${style.alignSelf};`);
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
  const mw = cssLen(base?.maxWidth);

  if (w != null) {
    (s as any).inlineSize = w;
    (s as any).width = w;
  }

  if (mw != null) {
    (s as any).maxInlineSize = mw;
    (s as any).maxWidth = mw;
  }

  if (base?.alignSelf) s.alignSelf = base.alignSelf;
  if (base?.scale != null) s.transform = `scale(${base.scale})`;

  return s;
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

  if (style.gap != null) (s as any).gap = cssLen(style.gap);
  if (style.padding != null) (s as any).padding = cssLen(style.padding);
  if (style.align) s.alignItems = style.align;
  if (style.justify) s.justifyContent = style.justify;
  if (style.wrap) s.flexWrap = "wrap";

  if (style.width != null) s.width = cssLen(style.width);
  if (style.maxWidth != null) s.maxWidth = cssLen(style.maxWidth);
  if (style.overflow != null) s.overflow = style.overflow;

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
  if (style.gap != null) decls.push(`gap:${cssLen(style.gap)};`);
  if (style.padding != null) decls.push(`padding:${cssLen(style.padding)};`);
  if (style.align) decls.push(`align-items:${style.align};`);
  if (style.justify) decls.push(`justify-content:${style.justify};`);
  if (style.wrap) decls.push(`flex-wrap:wrap;`);
  if (style.width != null) decls.push(`width:${cssLen(style.width)};`);
  if (style.maxWidth != null) decls.push(`max-width:${cssLen(style.maxWidth)};`);
  if (style.overflow != null) decls.push(`overflow:${style.overflow};`);
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
      const rules = [
        ...buildResponsiveTextCssRules({
          fontSize: textNode.fontSize,
          lineHeight: textNode.lineHeight,
          lines: textNode.lines,
          lineWidth: textNode.lineWidth,
          breakpointMap,
        }).map((rule) => ({ ...rule, raw: true })),
        ...buildResponsiveTextStyleCssRules({
          style: textNode.style,
          breakpointMap,
        }),
      ];

      if (!rules.length) return node;

      const id = allocId();
      out.push({ nodeId: id, rules });
      return { ...(textNode as any), __rmgNodeId: id };
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
  const renderState = getResponsiveTextRenderState({
    fontSize: node.fontSize,
    lineHeight: node.lineHeight,
    lines: node.lines,
    lineWidth: node.lineWidth,
    breakpointMap,
  });
  const inlineStyle = resolveInlineResponsiveBaseStyle(
    node.style,
    breakpointMap
  );
  const hasResponsiveLines = hasResponsiveTextLineCount(
    node.lines,
    breakpointMap
  );
  const hasResponsiveLineWidth = hasResponsiveTextLineWidth(
    node.lineWidth,
    breakpointMap
  );
  const usesResponsiveLineCss =
    hasResponsiveLines || hasResponsiveLineWidth;
  const nodeId = (node as any).__rmgNodeId as string | undefined;
  const wrapperStyle = textWrapperStyleVars(
    inlineStyle,
    hasResponsiveLines ? undefined : renderState.metrics.totalHeight
  );

  const lineStyle: SkeletonBaseStyle = {
    height: renderState.metrics.lineBarHeight,
    backgroundColor: inlineStyle?.backgroundColor,
    borderRadius: inlineStyle?.borderRadius,
  };

  return (
    <div
      data-rmg-skel-node={nodeId}
      data-rmg-skel-text="true"
      className={styles.skelText}
      style={{
        ...wrapperStyle,
        ...applyBoxMargins(inlineStyle),
        ...(hasResponsiveLines
          ? null
          : {
              paddingBlock: `${renderState.metrics.paddingBlock}px`,
              rowGap: `${renderState.metrics.rowGap}px`,
            }),
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
            ...(usesResponsiveLineCss
              ? null
              : {
                  display: index >= renderState.baseLines ? "none" : undefined,
                  width:
                    index === renderState.baseLines - 1
                      ? renderState.baseLineWidth
                      : "100%",
                }),
          }}
        />
      ))}
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
