import * as React from "react";
import styles from "./Grid.module.css";

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
  marginTop?: SkeletonLength;
  marginRight?: SkeletonLength;
  marginBottom?: SkeletonLength;
  marginLeft?: SkeletonLength;
  alignSelf?: React.CSSProperties["alignSelf"];
  aspectRatio?: SkeletonLength;
};

export type SkeletonContainerStyle = {
  gap?: SkeletonLength;
  padding?: SkeletonLength;
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
  wrap?: boolean;
  width?: SkeletonLength;
  maxWidth?: SkeletonLength;
};

export type SkeletonContainerStyleResponsive =
  | SkeletonContainerStyle
  | Record<string, SkeletonContainerStyle>;

export type GridSkeletonNode =
  | {
      kind: "grid";
      style?: SkeletonContainerStyleResponsive;
      count?: number;
      item: SkeletonNode;
      itemWrapStyle?: SkeletonBaseStyle;
    }
  | SkeletonNode;

export type SkeletonNode =
  | {
      kind: "stack" | "row" | "col";
      style?: SkeletonContainerStyleResponsive;
      children: SkeletonNode[];
    }
  | {
      kind: "rect" | "square" | "circle";
      style?: SkeletonBaseStyle;
      shimmer?: SkeletonShimmer;
    }
  | {
      kind: "media";
      count: number;
      direction?: "row" | "col";
      style?: SkeletonContainerStyleResponsive;
      tile?: {
        shape?: "rect" | "square" | "circle";
        style?: SkeletonBaseStyle;
        shimmer?: SkeletonShimmer;
      };
    }
  | {
      kind: "text";
      fontSize: number;
      lineHeight: number;
      lines?: number;
      style?: SkeletonBaseStyle;
      shimmer?: SkeletonShimmer;
    };

export type GridSkeletonSpec = {
  className?: string;
  layout?: GridSkeletonNode;
  backgroundColor?: string;
  radius?: SkeletonLength;
  shimmer?: SkeletonShimmer;
};

export type GridSkeletonCardProps = {
  count: number;
  gridStyle?: React.CSSProperties;
  spec?: GridSkeletonSpec;
};

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

  if (base?.aspectRatio != null) (s as any).aspectRatio = base.aspectRatio as any;
  if (base?.width != null) (s as any).inlineSize = cssLen(base.width);
  if (base?.maxWidth != null) (s as any).maxInlineSize = cssLen(base.maxWidth);
  if (base?.height != null) s.height = cssLen(base.height);
  if (base?.maxHeight != null) s.maxHeight = cssLen(base.maxHeight);
  if (base?.backgroundColor) (s as any)["--rmg-skel-bg"] = base.backgroundColor;
  if (base?.borderRadius != null) (s as any)["--rmg-skel-radius"] = cssLen(base.borderRadius);
  if (base?.alignSelf) s.alignSelf = base.alignSelf;
  
  if (shimmer?.enabled === false) {
    (s as any)["--rmg-skel-shimmer-enabled"] = "0";
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

  return s;
}

function isResponsiveContainerStyle(
  style: SkeletonContainerStyleResponsive | undefined
): style is Record<string, SkeletonContainerStyle> {
  if (!style) return false;
  return Object.keys(style).some((k) => String(+k) === k);
}

function escapeAttrValue(v: string) {
  return v.replace(/"/g, '\\"');
}

function sanitizeIdForAttr(id: string) {
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
  return decls.join("");
}

function collectResponsiveCss(
  node: GridSkeletonNode,
  allocId: () => string,
  out: Array<{ nodeId: string; rules: Array<{ minWidth: number; css: string }> }>
): GridSkeletonNode {
  switch (node.kind) {
    case "rect":
    case "square":
    case "circle":
    case "text":
      return node;

    case "media": {
      const id = allocId();
      const style = node.style;

      if (isResponsiveContainerStyle(style)) {
        const rs = style;
        const rules = Object.keys(style)
          .map((k) => +k)
          .filter((n) => Number.isFinite(n) && n >= 0)
          .sort((a, b) => a - b)
          .map((minWidth) => ({
            minWidth,
            css: containerStyleToCssDecls(rs[String(minWidth)] || {}),
          }))
          .filter((r) => r.css.length > 0);

        if (rules.length) out.push({ nodeId: id, rules });
      }

      return { ...(node as any), __rmgNodeId: id };
    }

    case "stack":
    case "row":
    case "col": {
      const id = allocId();
      const style = node.style;

      if (isResponsiveContainerStyle(style)) {
        const rules = Object.keys(style)
          .map((k) => +k)
          .filter((n) => Number.isFinite(n) && n >= 0)
          .sort((a, b) => a - b)
          .map((minWidth) => ({
            minWidth,
            css: containerStyleToCssDecls((style as any)[String(minWidth)] || {}),
          }))
          .filter((r) => r.css.length > 0);

        if (rules.length) out.push({ nodeId: id, rules });
      }

      const children = node.children.map((c) => collectResponsiveCss(c, allocId, out)) as any;
      return { ...(node as any), __rmgNodeId: id, children };
    }

    case "grid": {
      const id = allocId();
      const style = node.style;

      if (isResponsiveContainerStyle(style)) {
        const rules = Object.keys(style)
          .map((k) => +k)
          .filter((n) => Number.isFinite(n) && n >= 0)
          .sort((a, b) => a - b)
          .map((minWidth) => ({
            minWidth,
            css: containerStyleToCssDecls((style as any)[String(minWidth)] || {}),
          }))
          .filter((r) => r.css.length > 0);

        if (rules.length) out.push({ nodeId: id, rules });
      }

      const item = collectResponsiveCss(node.item, allocId, out) as SkeletonNode;
      return { ...(node as any), __rmgNodeId: id, item };
    }

    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

function buildResponsiveCssText(
  scopeId: string,
  rules: Array<{ nodeId: string; rules: Array<{ minWidth: number; css: string }> }>
) {
  if (!rules.length) return "";

  const scopeSel = `[data-rmg-grid-skel-scope="${escapeAttrValue(scopeId)}"]`;
  const lines: string[] = [];

  for (const nodeRule of rules) {
    const nodeSel = `${scopeSel} [data-rmg-skel-node="${escapeAttrValue(nodeRule.nodeId)}"]`;
    for (const r of nodeRule.rules) {
      lines.push(`@media (min-width:${r.minWidth}px){${nodeSel}{${r.css}}}`);
    }
  }

  return lines.join("\n");
}

function ShapeNode({
  kind,
  style,
  shimmer,
}: Extract<SkeletonNode, { kind: "rect" | "square" | "circle" }>) {
  const shapeCls =
    kind === "circle"
      ? styles.gridSkelCircle
      : kind === "square"
      ? styles.gridSkelSquare
      : styles.gridSkelRect;

  return (
    <div
      className={[
        styles.gridSkelTile,
        shapeCls,
        styles.gridSkelShimmer,
      ].join(" ")}
      style={{
        ...nodeStyleVars(style, shimmer),
        ...applyBoxMargins(style),
      }}
    />
  );
}

function LayoutNode({ node }: { node: SkeletonNode }) {
  switch (node.kind) {
    case "rect":
    case "square":
    case "circle":
      return <ShapeNode {...node} />;

    case "media": {
      const count = Math.max(0, node.count | 0);
      const dir = node.direction ?? "row";
      const tileShape = node.tile?.shape ?? "rect";

      const nodeId = (node as any).__rmgNodeId as string | undefined;
      const plainStyle = isResponsiveContainerStyle(node.style)
        ? undefined
        : containerStylesPlain(node.style as SkeletonContainerStyle | undefined);

      return (
        <div
          data-rmg-skel-node={nodeId}
          className={[
            styles.gridSkelGroup,
            dir === "row" ? styles.gridSkelRow : styles.gridSkelCol,
          ].join(" ")}
          style={plainStyle}
        >
          {Array.from({ length: count }).map((_, i) => (
            <ShapeNode
              key={i}
              kind={tileShape}
              style={node.tile?.style}
              shimmer={node.tile?.shimmer}
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
          ? styles.gridSkelRow
          : node.kind === "col"
          ? styles.gridSkelCol
          : styles.gridSkelStack;

      const nodeId = (node as any).__rmgNodeId as string | undefined;
      const plainStyle = isResponsiveContainerStyle(node.style)
        ? undefined
        : containerStylesPlain(node.style as SkeletonContainerStyle | undefined);

      return (
        <div
          data-rmg-skel-node={nodeId}
          className={[styles.gridSkelGroup, dirCls].join(" ")}
          style={plainStyle}
        >
          {node.children.map((child, i) => (
            <LayoutNode key={i} node={child} />
          ))}
        </div>
      );
    }

    case "text": {
      const lines = Math.max(1, node.lines ?? 1);
      const h = node.fontSize * node.lineHeight * lines;

      return (
        <ShapeNode
          kind="rect"
          style={{ ...(node.style || {}), height: h }}
          shimmer={node.shimmer}
        />
      );
    }

    default:
      return null;
  }
}

function defaultGridSpec(): GridSkeletonSpec {
  const item: SkeletonNode = {
    kind: "rect",
    style: { width: "100%", aspectRatio: 1, borderRadius: 12 },
  };

  return {
    layout: {
      kind: "grid",
      item,
      itemWrapStyle: undefined,
    },
    radius: 12,
  };
}

export function GridSkeletonCard({ count, gridStyle, spec }: GridSkeletonCardProps) {
  const s = spec ?? defaultGridSpec();

  const layoutIn: GridSkeletonNode =
    s.layout ?? (defaultGridSpec().layout as GridSkeletonNode);

  const reactId = React.useId();
  const scopeId = React.useMemo(() => `gskel_${sanitizeIdForAttr(reactId)}`, [reactId]);

  const rootStyle: React.CSSProperties = {
    ...(gridStyle || {}),
  };

  if (s.backgroundColor) (rootStyle as any)["--rmg-skel-bg"] = s.backgroundColor;
  if (s.radius != null) (rootStyle as any)["--rmg-skel-radius"] = cssLen(s.radius);

  const sh = s.shimmer;

  if (sh?.enabled === false) (rootStyle as any)["--rmg-skel-shimmer-enabled"] = "0";
  if (sh?.durationMs != null) (rootStyle as any)["--rmg-skel-shimmer-duration"] = `${sh.durationMs}ms`;
  if (sh?.angleDeg != null) (rootStyle as any)["--rmg-skel-shimmer-angle"] = `${sh.angleDeg}deg`;
  if ((sh as any)?.timing)
    (rootStyle as any)["--rmg-skel-shimmer-timing"] = (sh as any).timing;
  if ((sh as any)?.opacity != null)
    (rootStyle as any)["--rmg-skel-shimmer-opacity"] = String((sh as any).opacity);
  if ((sh as any)?.blur != null)
    (rootStyle as any)["--rmg-skel-shimmer-blur"] = cssLen((sh as any).blur);
  if ((sh as any)?.c1) (rootStyle as any)["--rmg-skel-shimmer-c1"] = (sh as any).c1;
  if ((sh as any)?.c2) (rootStyle as any)["--rmg-skel-shimmer-c2"] = (sh as any).c2;
  if ((sh as any)?.c3) (rootStyle as any)["--rmg-skel-shimmer-c3"] = (sh as any).c3;

  const { layout, responsiveCss } = React.useMemo(() => {
    let n = 0;
    const allocId = () => `n${++n}`;
    const collected: Array<{ nodeId: string; rules: Array<{ minWidth: number; css: string }> }> = [];

    const withIds = collectResponsiveCss(layoutIn, allocId, collected);
    const cssText = buildResponsiveCssText(scopeId, collected);
    return { layout: withIds, responsiveCss: cssText };
  }, [layoutIn, scopeId]);

  const gridNode = layout as Extract<GridSkeletonNode, { kind: "grid" }>;

  const gridNodeId = (gridNode as any).__rmgNodeId as string | undefined;
  const plainGridStyle = isResponsiveContainerStyle(gridNode.style)
    ? undefined
    : containerStylesPlain(gridNode.style as SkeletonContainerStyle | undefined);

  const cellCount = gridNode.count != null ? Math.max(0, gridNode.count | 0) : Math.max(0, count | 0);

  const itemWrap = gridNode.itemWrapStyle;

  return (
    <div
      data-rmg-grid-skel-scope={scopeId}
      className={[styles.gridSkeletonOverlay, s.className].filter(Boolean).join(" ")}
    >
      {responsiveCss ? <style dangerouslySetInnerHTML={{ __html: responsiveCss }} /> : null}

      <div
        data-rmg-skel-node={gridNodeId}
        className={styles.gridSkeletonGrid}
        style={{
          ...rootStyle,
          ...(plainGridStyle || {}),
          display: "grid",
        }}
      >
        {Array.from({ length: cellCount }).map((_, i) => (
          <div
            key={`rmg-grid-skel-${i}`}
            className={styles.gridSkeletonItem}
            style={{
              ...(itemWrap ? nodeStyleVars(itemWrap, undefined) : null),
              ...(itemWrap ? applyBoxMargins(itemWrap) : null),
            }}
          >
            <LayoutNode node={gridNode.item} />
          </div>
        ))}
      </div>
    </div>
  );
}
