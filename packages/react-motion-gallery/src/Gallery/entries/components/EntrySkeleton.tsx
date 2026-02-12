import * as React from "react";
import styles from "../Entries.module.css";

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
  aspectRatio?: number | string;
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
  if (base?.alignSelf) s.alignSelf = base.alignSelf;

  if (shimmer?.enabled === false) (s as any)["--rmg-skel-shimmer-enabled"] = "0";
  if (shimmer?.durationMs != null)
    (s as any)["--rmg-skel-shimmer-duration"] = `${shimmer.durationMs}ms`;
  if (shimmer?.angleDeg != null) (s as any)["--rmg-skel-shimmer-angle"] = `${shimmer.angleDeg}deg`;

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
  node: SkeletonNode,
  allocId: () => string,
  out: Array<{ nodeId: string; rules: Array<{ minWidth: number; css: string }> }>
): SkeletonNode {
  switch (node.kind) {
    case "rect":
    case "square":
    case "circle":
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
            css: containerStyleToCssDecls(style[minWidth] || {}),
          }))
          .filter((r) => r.css.length > 0);

        if (rules.length) out.push({ nodeId: id, rules });
      }

      const children = node.children.map((c) => collectResponsiveCss(c, allocId, out));
      return { ...(node as any), __rmgNodeId: id, children };
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

  const scopeSel = `[data-rmg-entry-skel-scope="${escapeAttrValue(scopeId)}"]`;
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
  const cls =
    kind === "circle"
      ? styles.entrySkelCircle
      : kind === "square"
      ? styles.entrySkelSquare
      : styles.entrySkelRect;

  return (
    <div
      className={[styles.entrySkelTile, cls].join(" ")}
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
      const plainStyle = isResponsiveContainerStyle(node.style)
        ? undefined
        : containerStylesPlain(node.style as SkeletonContainerStyle | undefined);

      return (
        <div
          data-rmg-skel-node={nodeId}
          className={[styles.entrySkelGroup, dirCls].join(" ")}
          style={plainStyle}
        >
          {node.children.map((child, i) => (
            <LayoutNode key={i} node={child} />
          ))}
        </div>
      );
    }

    default: {
      const _exhaustive: never = node;
      return null;
    }
  }
}

export function EntrySkeletonCard({ spec, className }: EntrySkeletonCardProps) {
  const s = spec ?? defaultSpec();

  const rootStyle: React.CSSProperties = {
    ...(s.minHeight != null ? { minHeight: cssLen(s.minHeight) } : null),
  };

  if (s.defaults?.backgroundColor) (rootStyle as any)["--rmg-skel-bg"] = s.defaults.backgroundColor;
  if (s.defaults?.radius != null) (rootStyle as any)["--rmg-skel-radius"] = cssLen(s.defaults.radius);

  const sh = s.defaults?.shimmer;

  if (sh?.enabled === false) (rootStyle as any)["--rmg-skel-shimmer-enabled"] = "0";

  if (sh?.durationMs != null)
    (rootStyle as any)["--rmg-skel-shimmer-duration"] = `${sh.durationMs}ms`;

  if (sh?.angleDeg != null)
    (rootStyle as any)["--rmg-skel-shimmer-angle"] = `${sh.angleDeg}deg`;

  if (sh?.opacity != null)
    (rootStyle as any)["--rmg-skel-shimmer-opacity"] = String(sh.opacity);

  if (sh?.blurPx != null)
    (rootStyle as any)["--rmg-skel-shimmer-blur"] = `${sh.blurPx}px`;

  if (sh?.timing)
    (rootStyle as any)["--rmg-skel-shimmer-timing"] = sh.timing;

  if (sh?.c1)
    (rootStyle as any)["--rmg-skel-shimmer-c1"] = sh.c1;

  if (sh?.c2)
    (rootStyle as any)["--rmg-skel-shimmer-c2"] = sh.c2;

  if (sh?.c3)
    (rootStyle as any)["--rmg-skel-shimmer-c3"] = sh.c3;

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

  const reactId = React.useId();
  const scopeId = React.useMemo(() => `skel_${sanitizeIdForAttr(reactId)}`, [reactId]);

  const { layout, responsiveCss } = React.useMemo(() => {
    let n = 0;
    const allocId = () => `n${++n}`;
    const collected: Array<{ nodeId: string; rules: Array<{ minWidth: number; css: string }> }> = [];

    const withIds = collectResponsiveCss(layoutIn as SkeletonNode, allocId, collected);
    const cssText = buildResponsiveCssText(scopeId, collected);

    return { layout: withIds, responsiveCss: cssText };
  }, [layoutIn, scopeId]);

  return (
    <div
      data-rmg-entry-skel-scope={scopeId}
      className={[styles.entrySkelRoot, className].filter(Boolean).join(" ")}
      style={rootStyle}
    >
      {responsiveCss ? <style dangerouslySetInnerHTML={{ __html: responsiveCss }} /> : null}
      <LayoutNode node={layout} />
    </div>
  );
}