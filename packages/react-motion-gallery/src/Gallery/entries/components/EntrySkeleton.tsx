import * as React from "react";
import styles from "../Entries.module.css";
import { BREAKPOINT_MAP, type BreakpointMap } from "../../shared/responsive";
import {
  buildResponsiveBaseStyleCssRules,
  buildResponsiveContainerStyleCssRules,
  buildResponsiveTextStyleCssRules,
  resolveInlineResponsiveBaseStyle,
  resolveInlineResponsiveContainerStyle,
} from "../../shared/skeleton/layout";
import {
  TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER,
  buildResponsiveTextCssRules,
  getResponsiveTextRenderState,
  resolveResponsiveTextBarHeight,
  resolveResponsiveTextLineHeight,
  type ResponsiveTextBarHeight,
  type ResponsiveTextBarWidth,
  type ResponsiveTextLineHeight,
  type ResponsiveTextLineCount,
  type ResponsiveTextLastBarWidth,
  type TextSkeletonResponsiveBy,
} from "../../shared/skeleton/text";
import { shimmerStyleVars } from "../../shared/skeleton/layout";
import { buildStableScopeId } from "../../shared/stableScope";
import type {
  SkeletonCacheSnapshot,
  SkeletonCacheTextRecord,
} from "../../skeleton/cache";

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
  aspectRatio?: number | string;
};

export type SkeletonBaseStyleResponsive =
  | SkeletonBaseStyle
  | Record<string, SkeletonBaseStyle>;

export type SkeletonContainerStyle = {
  display?: React.CSSProperties["display"];
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
      textId?: string;
      barHeight: ResponsiveTextBarHeight;
      barWidth?: ResponsiveTextBarWidth;
      lineHeight: ResponsiveTextLineHeight;
      lines?: ResponsiveTextLineCount;
      lastBarWidth?: ResponsiveTextLastBarWidth;
      responsiveBy?: TextSkeletonResponsiveBy;
      style?: SkeletonBaseStyleResponsive;
      shimmer?: SkeletonShimmer;
    };

export type EntrySkeletonSpec = {
  layout?: SkeletonNode;
  variant?: "solid";
  minHeight?: SkeletonLength;
  defaults?: {
    backgroundColor?: string;
    highlightColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
  };
};

export type EntrySkeletonCardProps = {
  spec?: EntrySkeletonSpec;
  className?: string;
  breakpoints?: BreakpointMap;
  cacheSnapshot?: SkeletonCacheSnapshot | null;
};

function defaultSpec(): EntrySkeletonSpec {
  return { variant: "solid", minHeight: 260 };
}

function cssLen(v: SkeletonLength | undefined): string | undefined {
  if (v == null) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

function applyBoxMargins(style: SkeletonBaseStyle | undefined): React.CSSProperties {
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

function nodeStyleVars(
  base: SkeletonBaseStyle | undefined,
  shimmer: SkeletonShimmer | undefined
): React.CSSProperties {
  const s: React.CSSProperties = {};

  if (base?.aspectRatio != null) (s as any).aspectRatio = base.aspectRatio;

  if (base?.width != null) s.width = cssLen(base.width);
  if (base?.maxWidth != null) s.maxWidth = cssLen(base.maxWidth);
  if (base?.height != null) s.height = cssLen(base.height);
  if (base?.maxHeight != null) s.maxHeight = cssLen(base.maxHeight);

  if (base?.aspectRatio != null && base?.height == null) {
    s.height = "auto";
  }

  if (base?.aspectRatio != null && base?.width == null && base?.height == null) {
    s.width = "100%";
  }

  if (base?.backgroundColor) (s as any)["--rmg-skel-bg"] = base.backgroundColor;
  if (base?.borderRadius != null) (s as any)["--rmg-skel-radius"] = cssLen(base.borderRadius);
  if (base?.overflow != null) s.overflow = base.overflow;
  if (base?.alignSelf) s.alignSelf = base.alignSelf;
  Object.assign(s, shimmerStyleVars(shimmer));

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
    s.width = w;
  }

  if (mw != null) {
    s.maxWidth = mw;
  }

  if (base?.alignSelf) s.alignSelf = base.alignSelf;

  return s;
}

function containerStylesPlain(style?: SkeletonContainerStyle): React.CSSProperties {
  const s: React.CSSProperties = {};
  if (!style) return s;

  if (style.display != null) s.display = style.display;
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

function escapeAttrValue(v: string) {
  return v.replace(/"/g, '\\"');
}

type ResponsiveCssRule = {
  minWidth: number;
  css: string;
  query?: "viewport" | "container";
  raw?: boolean;
};

function collectResponsiveCss(
  node: SkeletonNode,
  allocId: () => string,
  out: Array<{ nodeId: string; rules: ResponsiveCssRule[] }>,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SkeletonNode {
  switch (node.kind) {
    case "rect":
    case "square":
    case "circle": {
      const rules = buildResponsiveBaseStyleCssRules({
        style: node.style,
        breakpointMap,
      });
      if (!rules.length) return node;

      const id = allocId();
      out.push({ nodeId: id, rules });
      return { ...(node as any), __rmgNodeId: id };
    }

    case "text": {
      const rules = [
        ...buildResponsiveTextCssRules({
          barHeight: node.barHeight,
          barWidth: node.barWidth,
          lineHeight: node.lineHeight,
          lines: node.lines,
          lastBarWidth: node.lastBarWidth,
          responsiveBy: node.responsiveBy,
          breakpointMap,
        }).map((rule) => ({ ...rule, raw: true })),
        ...buildResponsiveTextStyleCssRules({
          style: node.style,
          breakpointMap,
        }),
      ];

      if (!rules.length) return node;

      const id = allocId();
      out.push({ nodeId: id, rules });
      return { ...(node as any), __rmgNodeId: id };
    }

    case "media": {
      const rules = [
        ...buildResponsiveContainerStyleCssRules({
          style: node.style,
          breakpointMap,
        }),
        ...buildResponsiveBaseStyleCssRules({
          style: node.tile?.style,
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
      const rules = buildResponsiveContainerStyleCssRules({
        style: node.style,
        breakpointMap,
      });
      const id = rules.length ? allocId() : undefined;

      if (id && rules.length) out.push({ nodeId: id, rules });

      const children = node.children.map((c) =>
        collectResponsiveCss(c, allocId, out, breakpointMap)
      );
      return { ...(node as any), ...(id ? { __rmgNodeId: id } : null), children };
    }

    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

function buildResponsiveCssText(
  scopeId: string,
  rules: Array<{ nodeId: string; rules: ResponsiveCssRule[] }>
) {
  if (!rules.length) return "";

  const scopeSel = `[data-rmg-entry-skel-scope="${escapeAttrValue(scopeId)}"]`;
  const lines: string[] = [];

  for (const nodeRule of rules) {
    const nodeSel = `${scopeSel} [data-rmg-skel-node="${escapeAttrValue(nodeRule.nodeId)}"]`;

    for (const r of nodeRule.rules) {
      const cssText = r.raw
        ? r.css.split("__NODE_SEL__").join(nodeSel)
        : `${nodeSel}{${r.css}}`;

      if (r.minWidth <= 0) {
        lines.push(cssText);
      } else if (r.query === "container") {
        lines.push(`@container (min-width:${r.minWidth}px){${cssText}}`);
      } else {
        lines.push(`@media (min-width:${r.minWidth}px){${cssText}}`);
      }
    }
  }

  return lines.join("\n");
}

function toSnapshotBarWidths(record: SkeletonCacheTextRecord) {
  if (record.barWidths?.length) return record.barWidths;
  if (record.lineWidthsPx?.length) {
    return record.lineWidthsPx.map((width) => `${Math.max(0, width)}px`);
  }
  return undefined;
}

function normalizeSnapshotLines(value: number) {
  return Math.max(1, Math.min(64, Math.trunc(value)));
}

export function applyEntrySkeletonTextSnapshot(
  node: SkeletonNode,
  snapshot: Record<string, SkeletonCacheTextRecord> | undefined,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SkeletonNode {
  if (!snapshot) return node;

  if (node.kind === "text") {
    const record = node.textId ? snapshot[node.textId] : undefined;
    if (!record) return node;

    const lines = normalizeSnapshotLines(record.lines);
    const barWidth = toSnapshotBarWidths(record);
    const barHeight =
      typeof record.barHeight === "number" && Number.isFinite(record.barHeight)
        ? record.barHeight
        : typeof node.barHeight === "number"
        ? node.barHeight
        : resolveResponsiveTextBarHeight(node.barHeight, 0, 0, breakpointMap);
    const lineHeight =
      typeof record.lineHeight === "number" && Number.isFinite(record.lineHeight)
        ? record.lineHeight
        : typeof node.lineHeight === "number"
        ? node.lineHeight
        : resolveResponsiveTextLineHeight(node.lineHeight, 1, 0, breakpointMap);

    return {
      ...node,
      barHeight,
      lineHeight,
      lines,
      ...(barWidth?.length ? { barWidth } : null),
      lastBarWidth: barWidth?.[Math.min(lines, barWidth.length) - 1] ?? node.lastBarWidth,
      responsiveBy: undefined,
    };
  }

  if (node.kind === "media") return node;

  if (node.kind === "stack" || node.kind === "row" || node.kind === "col") {
    return {
      ...node,
      children: node.children.map((child: SkeletonNode) =>
        applyEntrySkeletonTextSnapshot(child, snapshot, breakpointMap)
      ),
    };
  }

  return node;
}

export function collectEntrySkeletonTextIds(
  node: SkeletonNode | undefined,
  out: Set<string> = new Set()
) {
  if (!node) return out;

  if (node.kind === "text") {
    if (node.textId) out.add(node.textId);
    return out;
  }

  if (node.kind === "media") return out;

  if (node.kind === "stack" || node.kind === "row" || node.kind === "col") {
    node.children.forEach((child: SkeletonNode) =>
      collectEntrySkeletonTextIds(child, out)
    );
  }
  return out;
}

function ShapeNode(
  props: Extract<SkeletonNode, { kind: "rect" | "square" | "circle" }> & {
    breakpointMap: BreakpointMap;
    mediaTile?: boolean;
  }
) {
  const { kind, style, shimmer, breakpointMap, mediaTile } = props;
  const cls =
    kind === "circle"
      ? styles.entrySkelCircle
      : kind === "square"
      ? styles.entrySkelSquare
      : styles.entrySkelRect;
  const inlineStyle = resolveInlineResponsiveBaseStyle(style, breakpointMap);
  const nodeId = (props as any).__rmgNodeId as string | undefined;

  return (
    <div
      data-rmg-skel-node={nodeId}
      data-rmg-skel-media-tile={mediaTile ? "true" : undefined}
      className={[styles.entrySkelTile, cls].join(" ")}
      style={{
        ...nodeStyleVars(inlineStyle, shimmer),
        ...applyBoxMargins(inlineStyle),
      }}
    />
  );
}

function TextNode({
  node,
  breakpointMap,
}: {
  node: Extract<SkeletonNode, { kind: "text" }>;
  breakpointMap: BreakpointMap;
}) {
  const renderState = getResponsiveTextRenderState({
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
  const usesContainerQueries =
    renderState.responsiveBy === "container" && renderState.usesResponsiveBarCss;
  const usesResponsiveTextLayoutCss = renderState.states.some(
    ({ state }) =>
      state.lineCount !== renderState.baseState.lineCount ||
      state.metrics.totalHeight !== renderState.baseState.metrics.totalHeight ||
      state.metrics.barHeight !== renderState.baseState.metrics.barHeight ||
      state.metrics.paddingBlock !== renderState.baseState.metrics.paddingBlock ||
      state.metrics.rowGap !== renderState.baseState.metrics.rowGap
  );
  const usesResponsiveBarWidthCss = renderState.states.some(
    ({ state }) =>
      state.lineCount !== renderState.baseState.lineCount ||
      state.barWidths.length !== renderState.baseState.barWidths.length ||
      state.barWidths.some(
        (barWidth, index) => barWidth !== renderState.baseState.barWidths[index]
      )
  );
  const nodeId = (node as any).__rmgNodeId as string | undefined;
  const wrapperStyle = textWrapperStyleVars(
    usesContainerQueries ? undefined : inlineStyle,
    usesResponsiveTextLayoutCss ? undefined : renderState.metrics.totalHeight
  );

  const lineStyle: SkeletonBaseStyle = {
    height: renderState.metrics.barHeight,
    backgroundColor: inlineStyle?.backgroundColor,
    borderRadius: inlineStyle?.borderRadius,
  };

  const textNode = (
    <div
      data-rmg-skel-node={nodeId}
      data-rmg-skel-text="true"
      data-rmg-skel-text-id={node.textId}
      className={styles.entrySkelText}
      style={{
        ...wrapperStyle,
        ...(usesContainerQueries ? null : applyBoxMargins(inlineStyle)),
        ...(usesResponsiveTextLayoutCss
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
            styles.entrySkelTile,
            styles.entrySkelTextLine,
          ].join(" ")}
          style={{
            ...nodeStyleVars(lineStyle, node.shimmer),
            ...(usesResponsiveBarWidthCss
              ? null
              : {
                  display:
                    index >= renderState.baseLines ? "none" : undefined,
                  width: "100%",
                  maxWidth: renderState.baseState.barWidths[index] ?? "100%",
                }),
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
        ...applyBoxMargins(inlineStyle),
        containerType: "inline-size",
      }}
    >
      {textNode}
    </div>
  );
}

function LayoutNode({
  node,
  breakpointMap,
}: {
  node: SkeletonNode;
  breakpointMap: BreakpointMap;
}) {
  switch (node.kind) {
    case "rect":
    case "square":
    case "circle":
      return <ShapeNode {...node} breakpointMap={breakpointMap} />;

    case "media": {
      const count = Math.max(0, node.count | 0);
      const dir = node.direction ?? "row";
      const tileShape = node.tile?.shape ?? "rect";

      const nodeId = (node as any).__rmgNodeId as string | undefined;
      const plainStyle = containerStylesPlain(
        resolveInlineResponsiveContainerStyle(
          node.style,
          breakpointMap
        )
      );

      return (
        <div
          data-rmg-skel-node={nodeId}
          className={[
            styles.entrySkelGroup,
            dir === "row" ? styles.entrySkelRow : styles.entrySkelCol,
          ].join(" ")}
          style={plainStyle}
        >
          {Array.from({ length: count }).map((_, i) => (
            <ShapeNode
              key={i}
              kind={tileShape}
              style={node.tile?.style}
              shimmer={node.tile?.shimmer}
              breakpointMap={breakpointMap}
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
          ? styles.entrySkelRow
          : node.kind === "col"
          ? styles.entrySkelCol
          : styles.entrySkelStack;

      const nodeId = (node as any).__rmgNodeId as string | undefined;
      const plainStyle = containerStylesPlain(
        resolveInlineResponsiveContainerStyle(
          node.style,
          breakpointMap
        )
      );

      return (
        <div
          data-rmg-skel-node={nodeId}
          className={[styles.entrySkelGroup, dirCls].join(" ")}
          style={plainStyle}
        >
          {node.children.map((child, i) => (
            <LayoutNode key={i} node={child} breakpointMap={breakpointMap} />
          ))}
        </div>
      );
    }

    case "text": {
      return <TextNode node={node} breakpointMap={breakpointMap} />;
    }

    default: {
      const _exhaustive: never = node;
      return null;
    }
  }
}

export function EntrySkeletonCard({
  spec,
  className,
  breakpoints,
  cacheSnapshot,
}: EntrySkeletonCardProps) {
  const s = spec ?? defaultSpec();
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints]
  );

  const rootStyle: React.CSSProperties = {
    ...(s.minHeight != null ? { minHeight: cssLen(s.minHeight) } : null),
    ...shimmerStyleVars(s.defaults?.shimmer),
  };

  if (s.defaults?.backgroundColor) (rootStyle as any)["--rmg-skel-bg"] = s.defaults.backgroundColor;
  if (s.defaults?.radius != null) (rootStyle as any)["--rmg-skel-radius"] = cssLen(s.defaults.radius);

  if (s.variant === "solid" && !s.layout) {
    return (
      <div
        className={[styles.entrySkelRoot, styles.entrySkelTile, className]
          .filter(Boolean)
          .join(" ")}
        style={rootStyle}
      />
    );
  }

  const defaultLayout = React.useMemo<SkeletonNode>(() => ({
    kind: "stack",
    style: { gap: 12 },
    children: [
      { kind: "rect", style: { height: 18, width: "60%" } },
      { kind: "rect", style: { height: 14, width: "90%" } },
      { kind: "media", count: 2, direction: "row", style: { gap: 10, wrap: true } },
    ],
  }), []);

  const layoutIn = React.useMemo(() => {
    const source = s.layout ?? defaultLayout;
    return cacheSnapshot?.text
      ? applyEntrySkeletonTextSnapshot(
          source,
          cacheSnapshot.text,
          effectiveBreakpoints
        )
      : source;
  }, [cacheSnapshot, defaultLayout, effectiveBreakpoints, s.layout]);
  const scopeId = React.useMemo(
    () =>
      buildStableScopeId("skel_", {
        breakpoints: effectiveBreakpoints,
        className,
        layout: layoutIn,
        minHeight: s.minHeight,
        variant: s.variant,
      }),
    [className, effectiveBreakpoints, layoutIn, s.minHeight, s.variant]
  );

  const { layout, responsiveCss } = React.useMemo(() => {
    let n = 0;
    const allocId = () => `n${++n}`;
    const collected: Array<{ nodeId: string; rules: Array<{ minWidth: number; css: string }> }> = [];

    const withIds = collectResponsiveCss(
      layoutIn as SkeletonNode,
      allocId,
      collected,
      effectiveBreakpoints
    );
    const cssText = buildResponsiveCssText(scopeId, collected);

    return { layout: withIds, responsiveCss: cssText };
  }, [layoutIn, scopeId, effectiveBreakpoints]);

  return (
    <div
      data-rmg-entry-skel-scope={scopeId}
      className={[styles.entrySkelRoot, className].filter(Boolean).join(" ")}
      style={rootStyle}
    >
      {responsiveCss ? <style dangerouslySetInnerHTML={{ __html: responsiveCss }} /> : null}
      <LayoutNode node={layout} breakpointMap={effectiveBreakpoints} />
    </div>
  );
}
