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
  hasResponsiveTextLineCount,
  hasResponsiveTextLineWidth,
  type ResponsiveTextLineCount,
  type ResponsiveTextLineWidth,
} from "../../shared/skeleton/text";
import { shimmerStyleVars } from "../../shared/skeleton/layout";
import { buildStableScopeId } from "../../shared/stableScope";

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
          fontSize: node.fontSize,
          lineHeight: node.lineHeight,
          lines: node.lines,
          lineWidth: node.lineWidth,
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
      } else {
        lines.push(`@media (min-width:${r.minWidth}px){${cssText}}`);
      }
    }
  }

  return lines.join("\n");
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
      className={styles.entrySkelText}
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
            styles.entrySkelTile,
            styles.entrySkelTextLine,
          ].join(" ")}
          style={{
            ...nodeStyleVars(lineStyle, node.shimmer),
            ...(usesResponsiveLineCss
              ? null
              : {
                  display:
                    index >= renderState.baseLines ? "none" : undefined,
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
        className={[styles.entrySkelTile, className]
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

  const layoutIn = s.layout ?? defaultLayout;
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
