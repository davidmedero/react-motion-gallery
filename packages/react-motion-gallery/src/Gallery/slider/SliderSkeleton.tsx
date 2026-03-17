import * as React from "react";
import styles from "./Slider.module.css";

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

export type SliderSkeletonSliderNode = {
  kind: "slider";
  style?: SkeletonContainerStyleResponsive;
  count?: number;
  item: SkeletonNode;
  itemWrapStyle?: SkeletonBaseStyle;
  direction?: "row" | "col";
  children?: SkeletonNode[];
};

export type SliderSkeletonNode = SliderSkeletonSliderNode | SkeletonNode;

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
      shimmer?: SkeletonShimmer
    };

export type SliderSkeletonSpec = {
  mode?: "fit" | "peek";
  className?: string;
  style?: React.CSSProperties;
  layout?: SliderSkeletonNode;
  backgroundColor?: string;
  radius?: SkeletonLength;
  shimmer?: SkeletonShimmer;
};

export type SliderSkeletonCardProps = {
  count: number;
  maxSlots: number;
  rowStyle?: React.CSSProperties;
  spec?: SliderSkeletonSpec;
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
  node: SliderSkeletonNode,
  allocId: () => string,
  out: Array<{ nodeId: string; rules: Array<{ minWidth: number; css: string }> }>
): SliderSkeletonNode {
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

    case "slider": {
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
      const children = node.children?.map((child) => collectResponsiveCss(child, allocId, out) as SkeletonNode);
      return { ...(node as any), __rmgNodeId: id, item, children };
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

  const scopeSel = `[data-rmg-slider-skel-scope="${escapeAttrValue(scopeId)}"]`;
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
  const extra: React.CSSProperties = {};

  if (kind === "circle") extra.borderRadius = "9999px";
  if (kind === "square") {
    if (style?.aspectRatio == null) (extra as any).aspectRatio = "1";
  }

  if (style?.aspectRatio != null && style?.height == null) {
    (extra as any).height = "auto";
  }

  return (
    <div
      className={styles.sliderSkeleton}
      style={{
        ...nodeStyleVars(style, shimmer),
        ...applyBoxMargins(style),
        ...extra,
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
          className={styles.sliderSkeletonGroup}
          style={{
            display: "flex",
            flexDirection: dir === "row" ? "row" : "column",
            ...(plainStyle || {}),
          }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <ShapeNode key={i} kind={tileShape} style={node.tile?.style} shimmer={node.tile?.shimmer} />
          ))}
        </div>
      );
    }

    case "stack":
    case "row":
    case "col": {
      const dir = node.kind === "row" ? "row" : "column";

      const nodeId = (node as any).__rmgNodeId as string | undefined;
      const plainStyle = isResponsiveContainerStyle(node.style)
        ? undefined
        : containerStylesPlain(node.style as SkeletonContainerStyle | undefined);

      return (
        <div
          data-rmg-skel-node={nodeId}
          className={styles.sliderSkeletonGroup}
          style={{
            display: "flex",
            flexDirection: dir,
            ...(plainStyle || {}),
          }}
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

function defaultSliderSpec(): SliderSkeletonSpec {
  const item: SkeletonNode = {
    kind: "rect",
    style: { width: "100%", height: "100%", borderRadius: 2 },
  };

  return {
    layout: {
      kind: "slider",
      direction: "row",
      item,
      itemWrapStyle: undefined,
    },
    radius: 12,
  };
}

function isPercent(v: string) {
  return /%$/.test(v.trim());
}

function toCssLen(v: SkeletonLength | undefined): string | null {
  if (v == null) return null;
  return typeof v === "number" ? `${v}px` : String(v);
}

function parseAspectRatio(ar: SkeletonLength | undefined): number | null {
  if (ar == null) return null;
  if (typeof ar === "number") return ar > 0 ? ar : null;

  const s = String(ar).trim();

  const m = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a > 0 && b > 0) return a / b;
    return null;
  }

  const n = Number(s);
  if (Number.isFinite(n) && n > 0) return n;

  return null;
}

function sumExpr(parts: Array<string | null | undefined>): string | null {
  const xs = parts.filter((p): p is string => !!p && p.trim().length > 0);
  if (!xs.length) return null;
  if (xs.length === 1) return xs[0];
  return `calc(${xs.join(" + ")})`;
}

function maxExpr(parts: Array<string | null | undefined>): string | null {
  const xs = parts.filter((p): p is string => !!p && p.trim().length > 0);
  if (!xs.length) return null;
  if (xs.length === 1) return xs[0];
  return `max(${xs.join(", ")})`;
}

function minExpr(parts: Array<string | null | undefined>): string | null {
  const xs = parts.filter((p): p is string => !!p && p.trim().length > 0);
  if (!xs.length) return null;
  if (xs.length === 1) return xs[0];
  return `min(${xs.join(", ")})`;
}

function mulExpr(a: string, b: string): string {
  return `calc(${a} * ${b})`;
}

function divExpr(a: string, b: string): string {
  return `calc(${a} / ${b})`;
}

function clampMaxSizeExpr(
  value: string | null,
  maxSize: SkeletonLength | undefined
): string | null {
  const max = toCssLen(maxSize);
  if (!value || !max) return value;
  return minExpr([value, max]);
}

function marginsTBExpr(style?: SkeletonBaseStyle): string | null {
  const mt = toCssLen(style?.marginTop);
  const mb = toCssLen(style?.marginBottom);
  if (!mt && !mb) return null;
  return sumExpr([mt ?? "0px", mb ?? "0px"]);
}

function containerPaddingYExpr(style?: SkeletonContainerStyle): string | null {
  const p = toCssLen(style?.padding);
  if (!p) return null;
  return mulExpr(p, "2");
}

function containerPaddingXExpr(style?: SkeletonContainerStyle): string | null {
  const p = toCssLen(style?.padding);
  if (!p) return null;
  return mulExpr(p, "2");
}

function gapExpr(style?: SkeletonContainerStyle): string | null {
  return toCssLen(style?.gap);
}

function pickPlainStyle(style: SkeletonContainerStyleResponsive | undefined): SkeletonContainerStyle | undefined {
  if (!style) return undefined;
  if (isResponsiveContainerStyle(style)) return undefined;
  return style as SkeletonContainerStyle;
}

function sliderRowHeightExpr(
  slider: SliderSkeletonSliderNode,
  visibleCount: number,
  mode: "fit" | "peek"
): string | null {
  const stylePlain = pickPlainStyle(slider.style);

  const gap = gapExpr(stylePlain) ?? "0px";
  const padX = containerPaddingXExpr(stylePlain) ?? "0px";
  const padY = containerPaddingYExpr(stylePlain) ?? "0px";

  const itemWrapW = slider.itemWrapStyle?.width ? toCssLen(slider.itemWrapStyle.width) : null;

  let tileWExpr: string;
  if (mode === "peek" && itemWrapW && !isPercent(itemWrapW)) {
    tileWExpr = itemWrapW;
  } else {
    const count = Math.max(1, visibleCount | 0);
    const gapsExpr = count > 1 ? mulExpr(gap, String(count - 1)) : "0px";
    const avail = `calc(100cqw - ${padX} - ${gapsExpr})`;
    tileWExpr = divExpr(avail, String(count));
  }

  tileWExpr = clampMaxSizeExpr(tileWExpr, slider.itemWrapStyle?.maxWidth) ?? tileWExpr;

  const itemH = nodeHeightExpr(slider.item, tileWExpr);
  if (!itemH) return null;

  const wrap = slider.itemWrapStyle;
  let wrapH: string | null = null;
  if (wrap) {
    const h = toCssLen(wrap.height);
    if (h) wrapH = sumExpr([h, marginsTBExpr(wrap)]);
    else {
      const ar = parseAspectRatio(wrap.aspectRatio);
      if (ar) wrapH = sumExpr([divExpr(tileWExpr, String(ar)), marginsTBExpr(wrap)]);
      else wrapH = marginsTBExpr(wrap);
    }
  }

  const tileH = wrapH ? maxExpr([wrapH, itemH]) : itemH;
  return sumExpr([tileH, padY]);
}

function sliderChildrenHeightExpr(slider: SliderSkeletonSliderNode): string | null {
  return sumExpr(
    (slider.children ?? []).map((child) => nodeHeightExpr(child, "100cqw"))
  );
}

function nodeHeightExpr(node: SkeletonNode, tileWidthExpr: string): string | null {
  if (node.kind === "rect" || node.kind === "square" || node.kind === "circle") {
    const h = toCssLen(node.style?.height);
    const ar = parseAspectRatio(node.style?.aspectRatio);

    if (h) {
      return sumExpr([h, marginsTBExpr(node.style)]);
    }

    if (ar) {
      const w = toCssLen(node.style?.width);
      const baseW =
        w && !isPercent(w) ? w
        : tileWidthExpr;
      const constrainedW = clampMaxSizeExpr(baseW, node.style?.maxWidth) ?? baseW;

      const arExpr = String(ar);
      const arH = divExpr(constrainedW, arExpr);
      return sumExpr([arH, marginsTBExpr(node.style)]);
    }

    return marginsTBExpr(node.style) ?? null;
  }

  if (node.kind === "media") {
    const dir = node.direction ?? "row";
    const gap = gapExpr(pickPlainStyle(node.style)) ?? "0px";
    const count = Math.max(0, node.count | 0);

    const tile = node.tile
      ? ({ kind: node.tile.shape ?? "rect", style: node.tile.style, shimmer: node.tile.shimmer } as any as SkeletonNode)
      : ({ kind: "rect", style: { width: "100%", height: "100%" } } as any as SkeletonNode);

    const tileH = nodeHeightExpr(tile, tileWidthExpr);
    if (!tileH) return null;

    if (dir === "row") {
      return tileH;
    } else {
      if (count <= 1) return tileH;
      return sumExpr([mulExpr(tileH, String(count)), mulExpr(gap, String(count - 1))]);
    }
  }

  if (node.kind === "row" || node.kind === "col" || node.kind === "stack") {
    const dir = node.kind === "row" ? "row" : "col";
    const plain = pickPlainStyle(node.style);
    const gap = gapExpr(plain) ?? "0px";
    const padY = containerPaddingYExpr(plain) ?? "0px";

    const childHeights = node.children.map((c) => nodeHeightExpr(c, tileWidthExpr));

    if (dir === "row") {
      const m = maxExpr(childHeights);
      if (!m) return null;
      return sumExpr([m, padY]);
    } else {
      const hs = childHeights.filter((x): x is string => !!x);
      if (!hs.length) return padY;

      const gaps = hs.length > 1 ? mulExpr(gap, String(hs.length - 1)) : "0px";
      return sumExpr([sumExpr(hs) ?? null, gaps, padY]);
    }
  }

  if (node.kind === "text") {
    const lines = Math.max(1, node.lines ?? 1);
    const hPx = node.fontSize * node.lineHeight * lines;
    return sumExpr([`${hPx}px`, marginsTBExpr(node.style)]);
  }

  return null;
}

export function buildInitialHeightFromSkeletonSpecCssExpr(
  layout: SliderSkeletonNode,
  visibleCount: number,
  mode: "fit" | "peek"
): string | null {
  const slider = (layout as any).kind === "slider"
    ? (layout as SliderSkeletonSliderNode)
    : null;

  if (!slider) {
    return nodeHeightExpr(layout as SkeletonNode, "100cqw");
  }

  const rowH = sliderRowHeightExpr(slider, visibleCount, mode);
  const childrenH = sliderChildrenHeightExpr(slider);

  return sumExpr([rowH, childrenH]);
}

export function buildRowHeightFromSkeletonSpecCssExpr(
  layout: SliderSkeletonNode,
  visibleCount: number,
  mode: "fit" | "peek"
): string | null {
  const slider = (layout as any).kind === "slider"
    ? (layout as SliderSkeletonSliderNode)
    : null;

  if (!slider) {
    return nodeHeightExpr(layout as SkeletonNode, "100cqw");
  }

  return sliderRowHeightExpr(slider, visibleCount, mode);
}

export function SliderSkeletonCard({ count, maxSlots, rowStyle, spec }: SliderSkeletonCardProps) {
  const s = spec ?? defaultSliderSpec();

  const layoutIn: SliderSkeletonNode = s.layout ?? (defaultSliderSpec().layout as SliderSkeletonNode);

  const reactId = React.useId();
  const scopeId = React.useMemo(() => `ssk_${sanitizeIdForAttr(reactId)}`, [reactId]);

  const rootStyle: React.CSSProperties = {
    ...(rowStyle || {}),
  };

  if (s.backgroundColor) (rootStyle as any)["--rmg-skel-bg"] = s.backgroundColor;
  if (s.radius != null) (rootStyle as any)["--rmg-skel-radius"] = cssLen(s.radius);

  const sh = s.shimmer;

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

  const { layout, responsiveCss } = React.useMemo(() => {
    let n = 0;
    const allocId = () => `n${++n}`;
    const collected: Array<{ nodeId: string; rules: Array<{ minWidth: number; css: string }> }> = [];

    const withIds = collectResponsiveCss(layoutIn, allocId, collected);
    const cssText = buildResponsiveCssText(scopeId, collected);
    return { layout: withIds, responsiveCss: cssText };
  }, [layoutIn, scopeId]);

  const sliderNode = layout as SliderSkeletonSliderNode;

  const sliderNodeId = (sliderNode as any).__rmgNodeId as string | undefined;
  const plainSliderStyle = isResponsiveContainerStyle(sliderNode.style)
    ? undefined
    : containerStylesPlain(sliderNode.style as SkeletonContainerStyle | undefined);

  const slotCount = sliderNode.count != null ? Math.max(0, sliderNode.count | 0) : Math.max(0, count | 0);
  const dir = sliderNode.direction ?? "row";
  const itemWrap = sliderNode.itemWrapStyle;
  const footerChildren = sliderNode.children ?? [];

  const slotsToRender = Math.max(0, maxSlots | 0);

  const mode = s.mode ?? "fit";

  return (
    <div
      data-rmg-slider-skel-scope={scopeId}
      data-rmg-skel-mode={mode}
      className={[styles.sliderSkeletonOverlay, s.className].filter(Boolean).join(" ")}
      style={s.style}
      data-rmg-skel-part="overlay"
    >
      {responsiveCss ? <style dangerouslySetInnerHTML={{ __html: responsiveCss }} /> : null}

      <div className={styles.sliderSkeletonLayout} data-rmg-skel-part="layout">
        <div
          data-rmg-skel-node={sliderNodeId}
          className={styles.sliderSkeletonRow}
          data-rmg-skel-part="row"
          style={{
            ...rootStyle,
            ...(plainSliderStyle || {}),
            display: "flex",
            flexDirection: dir === "row" ? "row" : "column",
          }}
        >
          {Array.from({ length: slotsToRender }).map((_, i) => (
            <div
              key={`rmg-slider-skel-${i}`}
              className={styles.sliderSkeletonItem}
              data-rmg-skel-slot={i + 1}
              data-rmg-skel-visible-count={slotCount}
              style={{
                ...(itemWrap ? nodeStyleVars(itemWrap, undefined) : null),
                ...(itemWrap ? applyBoxMargins(itemWrap) : null),
                minWidth: 0,
                minHeight: 0,
              }}
            >
              <LayoutNode node={sliderNode.item} />
            </div>
          ))}
        </div>

        {footerChildren.length ? (
          <div className={styles.sliderSkeletonExtras} data-rmg-skel-part="extras">
            {footerChildren.map((child, i) => (
              <LayoutNode key={`rmg-slider-skel-extra-${i}`} node={child} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
