import * as React from "react";
import styles from "./Slider.module.css";
import {
  BREAKPOINT_MAP,
  normalizeResponsiveNumberRules,
  resolveResponsiveNumberRuleValue,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsive";
import {
  TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER,
  buildResponsiveTextCssRules,
  collectResponsiveTextBreakpoints,
  getTextSkeletonMetrics,
  getResponsiveTextRenderState,
  resolveResponsiveTextBarHeight,
  resolveResponsiveTextLineHeight,
  resolveResponsiveTextLineCount,
  type ResponsiveTextBarHeight,
  type ResponsiveTextBarWidth,
  type ResponsiveTextLineHeight,
  type ResponsiveTextLineCount,
  type ResponsiveTextLastBarWidth,
} from "../shared/skeleton/text";
import {
  buildResponsiveBaseStyleCssRules,
  buildResponsiveContainerStyleCssRules,
  buildResponsiveTextStyleCssRules,
  collectResponsiveStyleBreakpoints,
  resolveInlineResponsiveBaseStyle,
  resolveInlineResponsiveContainerStyle,
  resolveResponsiveBaseStyleAtMinWidth,
  resolveResponsiveContainerStyleAtMinWidth,
  shimmerStyleVars,
} from "../shared/skeleton/layout";
import { buildStableScopeId } from "../shared/stableScope";

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
  margin?: SkeletonLength;
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

export type SliderSkeletonWrapStyle = SkeletonBaseStyle & {
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
  gap?: SkeletonLength;
  padding?: SkeletonLength;
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
  wrap?: boolean;
  width?: SkeletonLength;
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

export type SliderSkeletonSlot = {
  item?: SkeletonNode;
  itemWrapStyle?: SliderSkeletonWrapStyle;
};

export type SliderSkeletonSliderNode = {
  kind: "slider";
  style?: SkeletonContainerStyleResponsive;
  count?: number;
  item: SkeletonNode;
  itemWrapStyle?: SliderSkeletonWrapStyle;
  itemStretch?: boolean;
  initialHeightSlot?: number;
  rowHeightCompensation?: ResponsiveNumber;
  slots?: SliderSkeletonSlot[];
  direction?: "row" | "col";
  children?: SkeletonNode[];
  overlays?: SkeletonNode[];
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
      kind: "sliderDots";
      count: number;
      style?: SkeletonContainerStyleResponsive;
      dotStyle?: SkeletonBaseStyleResponsive;
      activeStyle?: SkeletonBaseStyleResponsive;
      inactiveStyle?: SkeletonBaseStyleResponsive;
      shimmer?: SkeletonShimmer;
    }
  | { 
      kind: "text";
      barHeight: ResponsiveTextBarHeight;
      barWidth?: ResponsiveTextBarWidth;
      lineHeight: ResponsiveTextLineHeight;
      lines?: ResponsiveTextLineCount;
      lastBarWidth?: ResponsiveTextLastBarWidth;
      style?: SkeletonBaseStyleResponsive;
      shimmer?: SkeletonShimmer
    };

export type SliderSkeletonSpec = {
  mode?: "fit" | "peek";
  centering?: "first";
  visibleCount?: ResponsiveNumber;
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
  activeDotIndex?: number;
  rowStyle?: React.CSSProperties;
  spec?: SliderSkeletonSpec;
  breakpoints?: BreakpointMap;
  centerFirst?: boolean;
  hasLeadingSpacer?: boolean;
  responsiveCssScopeSelector?: string;
};

function cssLen(v: SkeletonLength | undefined): string | undefined {
  if (v == null) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

function applyBoxMargins(style: SkeletonBaseStyle | undefined): React.CSSProperties {
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

function mergeWrapStyles(
  base: SliderSkeletonWrapStyle | undefined,
  override: SliderSkeletonWrapStyle | undefined
): SliderSkeletonWrapStyle | undefined {
  if (!base && !override) return undefined;
  return {
    ...(base || {}),
    ...(override || {}),
  };
}

function resolveSliderSlot(
  slider: SliderSkeletonSliderNode,
  slotIndex: number
): { item: SkeletonNode; itemWrapStyle: SliderSkeletonWrapStyle | undefined } {
  const slot = slider.slots?.[slotIndex];
  return {
    item: slot?.item ?? slider.item,
    itemWrapStyle: mergeWrapStyles(slider.itemWrapStyle, slot?.itemWrapStyle),
  };
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
  if (base?.overflow != null) s.overflow = base.overflow;
  if (base?.alignSelf) s.alignSelf = base.alignSelf;
  if (base?.scale != null) s.transform = `scale(${base.scale})`;
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

function wrapStyleVars(base: SliderSkeletonWrapStyle | undefined): React.CSSProperties {
  const s = nodeStyleVars(base, undefined);
  delete (s as any)["--rmg-skel-bg"];
  if (base?.backgroundColor != null) s.backgroundColor = base.backgroundColor;
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

function splitSliderItemWrapStyles(itemWrapStyle: SliderSkeletonWrapStyle | undefined): {
  outerStyle: React.CSSProperties | undefined;
  innerStyle: React.CSSProperties | undefined;
} {
  if (!itemWrapStyle) {
    return {
      outerStyle: undefined,
      innerStyle: undefined,
    };
  }

  const innerStyle = wrapStyleVars(itemWrapStyle);
  const outerStyle: React.CSSProperties = {};

  if (innerStyle.boxShadow != null) {
    (outerStyle as any)["--rmg-slider-skel-wrap-shadow"] = innerStyle.boxShadow;
    delete innerStyle.boxShadow;
  }

  if (innerStyle.borderRadius != null) {
    (outerStyle as any)["--rmg-slider-skel-wrap-shadow-radius"] = innerStyle.borderRadius;
  }

  return {
    outerStyle: Object.keys(outerStyle).length ? outerStyle : undefined,
    innerStyle,
  };
}

function containerStylesPlain(style?: SkeletonContainerStyle): React.CSSProperties {
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
  if (style.gap != null) (s as any).gap = cssLen(style.gap);
  if (style.padding != null) (s as any).padding = cssLen(style.padding);
  if (style.align) s.alignItems = style.align;
  if (style.justify) s.justifyContent = style.justify;
  if (style.wrap) s.flexWrap = "wrap";

  if (style.width != null) s.width = cssLen(style.width);
  if (style.maxWidth != null) s.maxWidth = cssLen(style.maxWidth);
  if (style.height != null) s.height = cssLen(style.height);
  if (style.minHeight != null) s.minHeight = cssLen(style.minHeight);
  if (style.maxHeight != null) s.maxHeight = cssLen(style.maxHeight);
  if (style.backgroundColor != null) s.backgroundColor = style.backgroundColor;
  if (style.borderRadius != null) s.borderRadius = cssLen(style.borderRadius);
  if (style.border != null) s.border = style.border;
  if (style.boxShadow != null) s.boxShadow = style.boxShadow;
  if (style.margin != null) s.margin = cssLen(style.margin);
  if (style.marginTop != null) s.marginTop = cssLen(style.marginTop);
  if (style.marginRight != null) s.marginRight = cssLen(style.marginRight);
  if (style.marginBottom != null) s.marginBottom = cssLen(style.marginBottom);
  if (style.marginLeft != null) s.marginLeft = cssLen(style.marginLeft);
  if (style.flex != null) s.flex = style.flex;
  if (style.flexGrow != null) s.flexGrow = style.flexGrow;
  if (style.flexShrink != null) s.flexShrink = style.flexShrink;
  if (style.flexBasis != null) s.flexBasis = cssLen(style.flexBasis);
  if (style.order != null) s.order = style.order;
  if (style.alignSelf != null) s.alignSelf = style.alignSelf;
  if (style.overflow != null) s.overflow = style.overflow;
  if (style.transform != null) s.transform = style.transform;
  if (style.pointerEvents != null) s.pointerEvents = style.pointerEvents;
  if (style.opacity != null) s.opacity = style.opacity;

  return s;
}

function baseStylesPlain(style?: SkeletonBaseStyle): React.CSSProperties {
  const s = nodeStyleVars(style, undefined);
  delete (s as any)["--rmg-skel-bg"];
  if (style?.backgroundColor != null) s.backgroundColor = style.backgroundColor;
  if (style?.borderRadius != null) s.borderRadius = cssLen(style.borderRadius);
  if (style?.overflow != null) s.overflow = style.overflow;
  return {
    ...s,
    ...applyBoxMargins(style),
  };
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
  node: SliderSkeletonNode,
  allocId: () => string,
  out: Array<{ nodeId: string; rules: ResponsiveCssRule[] }>,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SliderSkeletonNode {
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
          fitContent: styleUsesMaxContentWidth(node.style),
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

    case "sliderDots": {
      const rules = [
        ...buildResponsiveContainerStyleCssRules({
          style: node.style,
          breakpointMap,
        }),
        ...buildResponsiveBaseStyleCssRules({
          style: node.dotStyle,
          breakpointMap,
          selector: `${TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER} [data-rmg-skel-slider-dot]`,
        }),
        ...buildResponsiveBaseStyleCssRules({
          style: node.activeStyle,
          breakpointMap,
          selector: `${TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER} [data-rmg-skel-dot-active="true"]`,
        }),
        ...buildResponsiveBaseStyleCssRules({
          style: node.inactiveStyle,
          breakpointMap,
          selector: `${TEXT_SKELETON_NODE_SELECTOR_PLACEHOLDER} [data-rmg-skel-dot-active="false"]`,
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
      ) as any;
      return { ...(node as any), ...(id ? { __rmgNodeId: id } : null), children };
    }

    case "slider": {
      const rules = buildResponsiveContainerStyleCssRules({
        style: node.style,
        breakpointMap,
      });
      const id = rules.length ? allocId() : undefined;

      if (id && rules.length) out.push({ nodeId: id, rules });

      const item = collectResponsiveCss(node.item, allocId, out, breakpointMap) as SkeletonNode;
      const children = node.children?.map((child) =>
        collectResponsiveCss(child, allocId, out, breakpointMap) as SkeletonNode
      );
      const overlays = node.overlays?.map((child) =>
        collectResponsiveCss(child, allocId, out, breakpointMap) as SkeletonNode
      );
      const slots = node.slots?.map((slot) => ({
        ...slot,
        item: slot.item
          ? (collectResponsiveCss(slot.item, allocId, out, breakpointMap) as SkeletonNode)
          : undefined,
      }));
      return { ...(node as any), ...(id ? { __rmgNodeId: id } : null), item, children, overlays, slots };
    }

    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

function buildResponsiveCssText(
  scopeSelector: string,
  rules: Array<{ nodeId: string; rules: ResponsiveCssRule[] }>
) {
  if (!rules.length) return "";

  const lines: string[] = [];

  for (const nodeRule of rules) {
    const nodeSel = `${scopeSelector} [data-rmg-skel-node="${escapeAttrValue(nodeRule.nodeId)}"]`;
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
  const extra: React.CSSProperties = {};
  const inlineStyle = resolveInlineResponsiveBaseStyle(style, breakpointMap);
  const nodeId = (props as any).__rmgNodeId as string | undefined;

  if (kind === "circle") extra.borderRadius = "9999px";
  if (kind === "square") {
    if (inlineStyle?.aspectRatio == null) (extra as any).aspectRatio = "1";
  }

  if (inlineStyle?.aspectRatio != null && inlineStyle?.height == null) {
    (extra as any).height = "auto";
  }

  return (
    <div
      data-rmg-skel-node={nodeId}
      data-rmg-skel-media-tile={mediaTile ? "true" : undefined}
      className={styles.sliderSkeleton}
      style={{
        ...nodeStyleVars(inlineStyle, shimmer),
        ...applyBoxMargins(inlineStyle),
        ...extra,
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
    breakpointMap,
  });
  const inlineStyle = resolveInlineResponsiveBaseStyle(
    node.style,
    breakpointMap
  );
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
    inlineStyle,
    usesResponsiveTextLayoutCss ? undefined : renderState.metrics.totalHeight
  );

  const lineStyle: SkeletonBaseStyle = {
    height: renderState.metrics.barHeight,
    backgroundColor: inlineStyle?.backgroundColor,
    borderRadius: inlineStyle?.borderRadius,
  };
  const fitContent = isMaxContentWidth(inlineStyle?.width);

  return (
    <div
      data-rmg-skel-node={nodeId}
      data-rmg-skel-text="true"
      className={styles.sliderSkeletonText}
      style={{
        ...wrapperStyle,
        ...applyBoxMargins(inlineStyle),
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
            styles.sliderSkeleton,
            styles.sliderSkeletonTextLine,
          ].join(" ")}
          style={{
            ...nodeStyleVars(lineStyle, node.shimmer),
            ...(usesResponsiveBarWidthCss
              ? null
              : {
                  display:
                    index >= renderState.baseLines ? "none" : undefined,
                  width: fitContent
                    ? renderState.baseState.barWidths[index] ?? "100%"
                    : "100%",
                  maxWidth: renderState.baseState.barWidths[index] ?? "100%",
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
  activeDotIndex,
}: {
  node: SkeletonNode;
  breakpointMap: BreakpointMap;
  activeDotIndex?: number;
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
          className={styles.sliderSkeletonGroup}
          style={{
            display: "flex",
            flexDirection: dir === "row" ? "row" : "column",
            ...(plainStyle || {}),
          }}
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

    case "sliderDots": {
      const count = Math.max(0, node.count | 0);
      const nodeId = (node as any).__rmgNodeId as string | undefined;
      const plainStyle = containerStylesPlain(
        resolveInlineResponsiveContainerStyle(
          node.style,
          breakpointMap
        )
      );
      const dotStyle = baseStylesPlain(
        resolveInlineResponsiveBaseStyle(node.dotStyle, breakpointMap)
      );
      const activeStyle = baseStylesPlain(
        resolveInlineResponsiveBaseStyle(node.activeStyle, breakpointMap)
      );
      const inactiveStyle = baseStylesPlain(
        resolveInlineResponsiveBaseStyle(node.inactiveStyle, breakpointMap)
      );
      const activeIndex =
        typeof activeDotIndex === "number" && Number.isFinite(activeDotIndex)
          ? Math.max(0, Math.min(count - 1, Math.floor(activeDotIndex)))
          : 0;

      return (
        <div
          data-rmg-skel-node={nodeId}
          data-rmg-skel-slider-dots="true"
          data-rmg-skel-dot-active-style={JSON.stringify(activeStyle)}
          data-rmg-skel-dot-inactive-style={JSON.stringify(inactiveStyle)}
          className={styles.sliderSkeletonGroup}
          style={{
            display: "flex",
            flexDirection: "row",
            ...(plainStyle || {}),
          }}
        >
          {Array.from({ length: count }).map((_, i) => {
            const active = i === activeIndex;
            return (
              <div
                key={i}
                data-rmg-skel-slider-dot={i}
                data-rmg-skel-dot-active={active ? "true" : "false"}
                className={styles.sliderSkeleton}
                style={{
                  ...shimmerStyleVars(node.shimmer),
                  ...dotStyle,
                  ...(active ? activeStyle : inactiveStyle),
                }}
              />
            );
          })}
        </div>
      );
    }

    case "stack":
    case "row":
    case "col": {
      const dir = node.kind === "row" ? "row" : "column";

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
          className={styles.sliderSkeletonGroup}
          style={{
            display: "flex",
            flexDirection: dir,
            ...(plainStyle || {}),
          }}
        >
          {node.children.map((child, i) => (
            <LayoutNode
              key={i}
              node={child}
              breakpointMap={breakpointMap}
              activeDotIndex={activeDotIndex}
            />
          ))}
        </div>
      );
    }

    case "text": {
      return <TextNode node={node} breakpointMap={breakpointMap} />;
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

function parseSimpleCssLengthToken(token: string): { value: number; unit: string } | null {
  const trimmed = token.trim();
  if (!trimmed.length) return null;
  if (trimmed === "0") return { value: 0, unit: "px" };

  const m = trimmed.match(/^(\d+(?:\.\d+)?|\.\d+)([a-zA-Z]+)$/);
  if (!m) return null;

  const value = Number(m[1]);
  if (!Number.isFinite(value) || value < 0) return null;

  return {
    value,
    unit: m[2],
  };
}

function tokenizeTopLevelCssValue(value: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let depth = 0;

  for (const ch of value.trim()) {
    if (/\s/.test(ch) && depth === 0) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
    if (ch === "(") depth += 1;
    else if (ch === ")") depth = Math.max(0, depth - 1);
  }

  if (current) tokens.push(current);
  return tokens;
}

function normalizeBorderWidthToken(token: string): string | null {
  const trimmed = token.trim();
  if (!trimmed.length) return null;
  if (trimmed === "0") return "0px";
  if (/^(?:var|calc|min|max|clamp)\(.+\)$/i.test(trimmed)) return trimmed;
  return parseSimpleCssLengthToken(trimmed) ? trimmed : null;
}

function extractBorderWidthExpr(border: SliderSkeletonWrapStyle["border"] | undefined): string | null {
  if (border == null) return null;

  if (typeof border === "number") {
    return Number.isFinite(border) && border >= 0 ? (border === 0 ? "0px" : `${border}px`) : null;
  }

  for (const token of tokenizeTopLevelCssValue(String(border))) {
    const width = normalizeBorderWidthToken(token);
    if (width) return width;
  }

  return null;
}

function toCssLen(v: SkeletonLength | undefined): string | null {
  if (v == null) return null;
  return typeof v === "number" ? `${v}px` : String(v);
}

function scaleExpr(value: string | null, factor: number): string | null {
  if (!value) return null;
  if (factor === 0) return "0px";
  if (value === "0px") return value;

  const parsed = parseSimpleCssLengthToken(value);
  if (parsed) return `${parsed.value * factor}${parsed.unit}`;

  return `calc(${value} * ${factor})`;
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
  const raw = parts.filter((p): p is string => !!p && p.trim().length > 0);
  if (!raw.length) return null;

  const xs = raw.filter((p) => {
    const trimmed = p.trim();
    return trimmed !== "0" && trimmed !== "0px";
  });

  if (!xs.length) return "0px";
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
  if (a.trim() === "0" || a.trim() === "0px") return "0px";
  if (b.trim() === "0" || b.trim() === "0px") return "0px";
  if (b.trim() === "1") return a;

  const factor = Number(b);
  if (Number.isFinite(factor)) {
    return scaleExpr(a, factor) ?? `calc(${a} * ${b})`;
  }

  return `calc(${a} * ${b})`;
}

function divExpr(a: string, b: string): string {
  if (b.trim() === "1") return a;
  return `calc(${a} / ${b})`;
}

function subExpr(a: string, b: string): string {
  if (b.trim() === "0" || b.trim() === "0px") return a;
  return `calc(${a} - ${b})`;
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
  const margin = toCssLen(style?.margin);
  const mt = toCssLen(style?.marginTop);
  const mb = toCssLen(style?.marginBottom);
  if (margin && !mt && !mb) return scaleExpr(margin, 2);
  if (!margin && !mt && !mb) return null;
  return sumExpr([mt ?? margin ?? "0px", mb ?? margin ?? "0px"]);
}

function parsePaddingShorthand(
  padding: SkeletonLength | undefined
): { top: string; right: string; bottom: string; left: string } | null {
  if (padding == null) return null;

  const raw = typeof padding === "number" ? `${padding}px` : String(padding).trim();
  if (!raw.length) return null;

  const parts = tokenizeTopLevelCssValue(raw);
  if (!parts.length || parts.length > 4) return null;

  const [a, b, c, d] = parts;

  if (parts.length === 1) {
    return { top: a, right: a, bottom: a, left: a };
  }

  if (parts.length === 2) {
    return { top: a, right: b, bottom: a, left: b };
  }

  if (parts.length === 3) {
    return { top: a, right: b, bottom: c, left: b };
  }

  return {
    top: a,
    right: b,
    bottom: c,
    left: d,
  };
}

function wrapBorderWidthExpr(style?: SliderSkeletonWrapStyle): string | null {
  return extractBorderWidthExpr(style?.border);
}

function wrapBorderInlineExpr(style?: SliderSkeletonWrapStyle): string | null {
  return scaleExpr(wrapBorderWidthExpr(style), 2);
}

function wrapBorderBlockExpr(style?: SliderSkeletonWrapStyle): string | null {
  return scaleExpr(wrapBorderWidthExpr(style), 2);
}

function containerPaddingYExpr(style?: SkeletonContainerStyle): string | null {
  const padding = parsePaddingShorthand(style?.padding);
  if (!padding) return null;
  return sumExpr([padding.top, padding.bottom]);
}

function containerPaddingXExpr(style?: SkeletonContainerStyle): string | null {
  const padding = parsePaddingShorthand(style?.padding);
  if (!padding) return null;
  return sumExpr([padding.left, padding.right]);
}

function gapExpr(style?: SkeletonContainerStyle): string | null {
  return toCssLen(style?.gap);
}

function containerContentWidthExpr(
  outerWidthExpr: string,
  style?: SkeletonContainerStyle
): string {
  const padX = containerPaddingXExpr(style);
  if (!padX || padX === "0px") return outerWidthExpr;
  return subExpr(outerWidthExpr, padX);
}

function resolveContainerStyleAtMinWidth(
  style: SkeletonContainerStyleResponsive | undefined,
  responsiveMinWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): SkeletonContainerStyle | undefined {
  return resolveResponsiveContainerStyleAtMinWidth(
    style,
    responsiveMinWidth,
    breakpointMap
  );
}

function buildSliderSlotWidthExpr(
  slider: SliderSkeletonSliderNode,
  visibleCount: number,
  slotIndex: number,
  mode: "fit" | "peek",
  responsiveMinWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string {
  const stylePlain = resolveContainerStyleAtMinWidth(
    slider.style,
    responsiveMinWidth,
    breakpointMap
  );
  const gap = gapExpr(stylePlain) ?? "0px";
  const padX = containerPaddingXExpr(stylePlain) ?? "0px";
  const count = Math.max(1, visibleCount | 0);
  const gapsExpr = count > 1 ? mulExpr(gap, String(count - 1)) : "0px";
  const avail = `calc(100cqw - ${padX} - ${gapsExpr})`;
  const { itemWrapStyle } = resolveSliderSlot(slider, slotIndex);
  const itemWrapW = itemWrapStyle?.width ? toCssLen(itemWrapStyle.width) : null;

  let tileWExpr: string;
  if (mode === "peek" && itemWrapW && !isPercent(itemWrapW)) {
    tileWExpr = itemWrapW;
  } else {
    tileWExpr = divExpr(avail, String(count));
  }

  return clampMaxSizeExpr(tileWExpr, itemWrapStyle?.maxWidth) ?? tileWExpr;
}

function buildSliderSlotContentWidthExpr(
  slider: SliderSkeletonSliderNode,
  visibleCount: number,
  slotIndex: number,
  mode: "fit" | "peek",
  responsiveMinWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string {
  const outerWidthExpr = buildSliderSlotWidthExpr(
    slider,
    visibleCount,
    slotIndex,
    mode,
    responsiveMinWidth,
    breakpointMap
  );
  const { itemWrapStyle } = resolveSliderSlot(slider, slotIndex);
  const borderX = wrapBorderInlineExpr(itemWrapStyle);

  if (!borderX || borderX === "0px") return outerWidthExpr;
  return subExpr(outerWidthExpr, borderX);
}

function resolveSliderRowHeightCompensationExpr(
  slider: SliderSkeletonSliderNode,
  responsiveMinWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string | null {
  const value = resolveResponsiveNumberRuleValue(
    normalizeResponsiveNumberRules(slider.rowHeightCompensation, breakpointMap),
    responsiveMinWidth
  );

  if (value == null || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return `${value}px`;
}

function sliderRowHeightExpr(
  slider: SliderSkeletonSliderNode,
  visibleCount: number,
  mode: "fit" | "peek",
  responsiveMinWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string | null {
  const stylePlain = resolveContainerStyleAtMinWidth(
    slider.style,
    responsiveMinWidth,
    breakpointMap
  );

  const gap = gapExpr(stylePlain) ?? "0px";
  const padY = containerPaddingYExpr(stylePlain) ?? "0px";
  const compensation = resolveSliderRowHeightCompensationExpr(
    slider,
    responsiveMinWidth,
    breakpointMap
  );
  const count = Math.max(1, visibleCount | 0);
  const dir = slider.direction ?? "row";

  const slotHeights = Array.from({ length: count }, (_, slotIndex) => {
    const { item, itemWrapStyle } = resolveSliderSlot(slider, slotIndex);
    const wrapOuterWExpr = buildSliderSlotWidthExpr(
      slider,
      count,
      slotIndex,
      mode,
      responsiveMinWidth,
      breakpointMap
    );
    const itemContentWExpr = buildSliderSlotContentWidthExpr(
      slider,
      count,
      slotIndex,
      mode,
      responsiveMinWidth,
      breakpointMap
    );

    const itemH = nodeHeightExpr(
      item,
      itemContentWExpr,
      responsiveMinWidth,
      breakpointMap
    );
    const borderY = wrapBorderBlockExpr(itemWrapStyle);
    const marginsY = marginsTBExpr(itemWrapStyle);
    const wrapBaseH = sumExpr([borderY, marginsY]);
    let wrapH: string | null = null;
    let itemOuterH: string | null = null;

    if (itemH && !isPercent(itemH)) {
      itemOuterH = sumExpr([itemH, borderY, marginsY]);
    }

    if (itemWrapStyle) {
      const h = toCssLen(itemWrapStyle.height);
      if (h) wrapH = sumExpr([h, marginsY]);
      else {
        const ar = parseAspectRatio(itemWrapStyle.aspectRatio);
        if (ar) wrapH = sumExpr([divExpr(wrapOuterWExpr, String(ar)), marginsY]);
        else wrapH = wrapBaseH;
      }
    }

    if (!itemH) return wrapH;
    if (!wrapH) return itemH;
    if (isPercent(itemH)) return wrapH;
    return maxExpr([wrapH, itemOuterH ?? itemH]);
  });

  const rowH =
    dir === "row"
      ? (() => {
          const heightSlot = slider.initialHeightSlot;
          if (heightSlot == null) return maxExpr(slotHeights);

          const slotIndex = Math.min(
            Math.max(0, Math.trunc(heightSlot)),
            Math.max(0, count - 1)
          );
          return slotHeights[slotIndex] ?? maxExpr(slotHeights);
        })()
      : sumExpr([
          sumExpr(slotHeights),
          count > 1 ? mulExpr(gap, String(count - 1)) : "0px",
        ]);

  return sumExpr([rowH, padY, compensation]);
}

function sliderChildrenHeightExpr(
  slider: SliderSkeletonSliderNode,
  responsiveMinWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string | null {
  return sumExpr(
    (slider.children ?? []).map((child) =>
      nodeHeightExpr(child, "100cqw", responsiveMinWidth, breakpointMap)
    )
  );
}

function nodeHeightExpr(
  node: SkeletonNode,
  tileWidthExpr: string,
  responsiveMinWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string | null {
  if (node.kind === "rect" || node.kind === "square" || node.kind === "circle") {
    const style = resolveResponsiveBaseStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const h = toCssLen(style?.height);
    const ar = parseAspectRatio(style?.aspectRatio);

    if (h) {
      return sumExpr([h, marginsTBExpr(style)]);
    }

    if (ar) {
      const w = toCssLen(style?.width);
      const baseW =
        w && !isPercent(w) ? w
        : tileWidthExpr;
      const constrainedW = clampMaxSizeExpr(baseW, style?.maxWidth) ?? baseW;

      const arExpr = String(ar);
      const arH = divExpr(constrainedW, arExpr);
      return sumExpr([arH, marginsTBExpr(style)]);
    }

    return marginsTBExpr(style) ?? null;
  }

  if (node.kind === "media") {
    const dir = node.direction ?? "row";
    const plain = resolveContainerStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const gap = gapExpr(plain) ?? "0px";
    const count = Math.max(0, node.count | 0);
    const contentWidthExpr = containerContentWidthExpr(tileWidthExpr, plain);

    const tile = node.tile
      ? ({ kind: node.tile.shape ?? "rect", style: node.tile.style, shimmer: node.tile.shimmer } as any as SkeletonNode)
      : ({ kind: "rect", style: { width: "100%", height: "100%" } } as any as SkeletonNode);

    const tileH = nodeHeightExpr(
      tile,
      contentWidthExpr,
      responsiveMinWidth,
      breakpointMap
    );
    if (!tileH) return null;

    if (dir === "row") {
      return sumExpr([tileH, containerPaddingYExpr(plain)]);
    } else {
      if (count <= 1) return sumExpr([tileH, containerPaddingYExpr(plain)]);
      return sumExpr([mulExpr(tileH, String(count)), mulExpr(gap, String(count - 1)), containerPaddingYExpr(plain)]);
    }
  }

  if (node.kind === "sliderDots") {
    const plain = resolveContainerStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const dot = resolveResponsiveBaseStyleAtMinWidth(
      node.dotStyle,
      responsiveMinWidth,
      breakpointMap
    );
    const active = resolveResponsiveBaseStyleAtMinWidth(
      node.activeStyle,
      responsiveMinWidth,
      breakpointMap
    );
    const inactive = resolveResponsiveBaseStyleAtMinWidth(
      node.inactiveStyle,
      responsiveMinWidth,
      breakpointMap
    );
    const heights = [dot, active, inactive]
      .map((style) => sumExpr([toCssLen(style?.height), marginsTBExpr(style)]))
      .filter((height): height is string => !!height);
    const dotH = maxExpr(heights);
    if (!dotH) return containerPaddingYExpr(plain);
    return sumExpr([dotH, containerPaddingYExpr(plain)]);
  }

  if (node.kind === "row" || node.kind === "col" || node.kind === "stack") {
    const dir = node.kind === "row" ? "row" : "col";
    const plain = resolveContainerStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const gap = gapExpr(plain) ?? "0px";
    const padY = containerPaddingYExpr(plain) ?? "0px";
    const contentWidthExpr = containerContentWidthExpr(tileWidthExpr, plain);

    const childHeights = node.children.map((c) =>
      nodeHeightExpr(c, contentWidthExpr, responsiveMinWidth, breakpointMap)
    );

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
    const style = resolveResponsiveBaseStyleAtMinWidth(
      node.style,
      responsiveMinWidth,
      breakpointMap
    );
    const metrics = getTextSkeletonMetrics({
      barHeight: resolveResponsiveTextBarHeight(
        node.barHeight,
        typeof node.barHeight === "number" ? node.barHeight : 0,
        responsiveMinWidth,
        breakpointMap
      ),
      lineHeight: resolveResponsiveTextLineHeight(
        node.lineHeight,
        typeof node.lineHeight === "number" ? node.lineHeight : 1,
        responsiveMinWidth,
        breakpointMap
      ),
      lines: resolveResponsiveTextLineCount(
        node.lines,
        1,
        responsiveMinWidth,
        breakpointMap
      ),
    });
    return sumExpr([`${metrics.totalHeight}px`, marginsTBExpr(style)]);
  }

  return null;
}

export function buildInitialHeightFromSkeletonSpecCssExpr(
  layout: SliderSkeletonNode,
  visibleCount: number,
  mode: "fit" | "peek",
  responsiveMinWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string | null {
  const slider = (layout as any).kind === "slider"
    ? (layout as SliderSkeletonSliderNode)
    : null;

  if (!slider) {
    return nodeHeightExpr(
      layout as SkeletonNode,
      "100cqw",
      responsiveMinWidth,
      breakpointMap
    );
  }

  const rowH = sliderRowHeightExpr(
    slider,
    visibleCount,
    mode,
    responsiveMinWidth,
    breakpointMap
  );
  const childrenH = sliderChildrenHeightExpr(
    slider,
    responsiveMinWidth,
    breakpointMap
  );

  return sumExpr([rowH, childrenH]);
}

export function buildExtrasHeightFromSkeletonSpecCssExpr(
  layout: SliderSkeletonNode,
  responsiveMinWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string | null {
  const slider = (layout as any).kind === "slider"
    ? (layout as SliderSkeletonSliderNode)
    : null;

  if (!slider) return null;

  return sliderChildrenHeightExpr(slider, responsiveMinWidth, breakpointMap);
}

export function buildCenterFirstSpacerWidthFromSkeletonSpecCssExpr(
  layout: SliderSkeletonNode,
  visibleCount: number,
  mode: "fit" | "peek",
  responsiveMinWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string | null {
  const slider = (layout as any).kind === "slider"
    ? (layout as SliderSkeletonSliderNode)
    : null;

  if (!slider || mode !== "peek") return null;

  const count = Math.max(1, visibleCount | 0);
  if (count <= 1) return null;

  const stylePlain = resolveContainerStyleAtMinWidth(
    slider.style,
    responsiveMinWidth,
    breakpointMap
  );
  const gap = gapExpr(stylePlain) ?? "0px";
  const trailingWidths = Array.from({ length: count - 1 }, (_, i) =>
    buildSliderSlotWidthExpr(
      slider,
      count,
      i + 1,
      mode,
      responsiveMinWidth,
      breakpointMap
    )
  );
  const trailingGaps = count > 2 ? mulExpr(gap, String(count - 2)) : null;

  return sumExpr([...trailingWidths, trailingGaps]);
}

export function buildRowHeightFromSkeletonSpecCssExpr(
  layout: SliderSkeletonNode,
  visibleCount: number,
  mode: "fit" | "peek",
  responsiveMinWidth = 0,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): string | null {
  const slider = (layout as any).kind === "slider"
    ? (layout as SliderSkeletonSliderNode)
    : null;

  if (!slider) {
    return nodeHeightExpr(
      layout as SkeletonNode,
      "100cqw",
      responsiveMinWidth,
      breakpointMap
    );
  }

  return sliderRowHeightExpr(
    slider,
    visibleCount,
    mode,
    responsiveMinWidth,
    breakpointMap
  );
}

function collectSliderTextBreakpointsInto(
  node: SliderSkeletonNode,
  out: Set<number>,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
) {
  switch (node.kind) {
    case "rect":
    case "square":
    case "circle":
    case "media":
    case "sliderDots":
      return;

    case "text":
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

    case "stack":
    case "row":
    case "col":
      for (const child of node.children) {
        collectSliderTextBreakpointsInto(child, out, breakpointMap);
      }
      return;

    case "slider":
      collectSliderTextBreakpointsInto(node.item, out, breakpointMap);
      for (const child of node.children ?? []) {
        collectSliderTextBreakpointsInto(child, out, breakpointMap);
      }
      for (const child of node.overlays ?? []) {
        collectSliderTextBreakpointsInto(child, out, breakpointMap);
      }
      for (const slot of node.slots ?? []) {
        if (slot.item) collectSliderTextBreakpointsInto(slot.item, out, breakpointMap);
      }
      return;

    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

function collectSliderBaseStyleBreakpointsInto(
  node: SliderSkeletonNode,
  out: Set<number>,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
) {
  switch (node.kind) {
    case "rect":
    case "square":
    case "circle":
      collectResponsiveStyleBreakpoints(node.style, out, breakpointMap);
      return;

    case "media":
      collectResponsiveStyleBreakpoints(node.tile?.style, out, breakpointMap);
      return;

    case "sliderDots":
      collectResponsiveStyleBreakpoints(node.dotStyle, out, breakpointMap);
      collectResponsiveStyleBreakpoints(node.activeStyle, out, breakpointMap);
      collectResponsiveStyleBreakpoints(node.inactiveStyle, out, breakpointMap);
      return;

    case "text":
      collectResponsiveStyleBreakpoints(node.style, out, breakpointMap);
      return;

    case "stack":
    case "row":
    case "col":
      for (const child of node.children) {
        collectSliderBaseStyleBreakpointsInto(child, out, breakpointMap);
      }
      return;

    case "slider":
      collectSliderBaseStyleBreakpointsInto(node.item, out, breakpointMap);
      for (const child of node.children ?? []) {
        collectSliderBaseStyleBreakpointsInto(child, out, breakpointMap);
      }
      for (const child of node.overlays ?? []) {
        collectSliderBaseStyleBreakpointsInto(child, out, breakpointMap);
      }
      for (const slot of node.slots ?? []) {
        if (slot.item) collectSliderBaseStyleBreakpointsInto(slot.item, out, breakpointMap);
      }
      return;

    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

function collectResponsiveContainerBreakpoints(
  style: SkeletonContainerStyleResponsive | undefined,
  out: Set<number>,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
) {
  collectResponsiveStyleBreakpoints(style, out, breakpointMap);
}

function collectSliderContainerBreakpointsInto(
  node: SliderSkeletonNode,
  out: Set<number>,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
) {
  switch (node.kind) {
    case "rect":
    case "square":
    case "circle":
    case "text":
      return;

    case "media":
      collectResponsiveContainerBreakpoints(node.style, out, breakpointMap);
      return;

    case "sliderDots":
      collectResponsiveContainerBreakpoints(node.style, out, breakpointMap);
      return;

    case "stack":
    case "row":
    case "col":
      collectResponsiveContainerBreakpoints(node.style, out, breakpointMap);
      for (const child of node.children) {
        collectSliderContainerBreakpointsInto(child, out, breakpointMap);
      }
      return;

    case "slider":
      collectResponsiveContainerBreakpoints(node.style, out, breakpointMap);
      collectSliderContainerBreakpointsInto(node.item, out, breakpointMap);
      for (const child of node.children ?? []) {
        collectSliderContainerBreakpointsInto(child, out, breakpointMap);
      }
      for (const child of node.overlays ?? []) {
        collectSliderContainerBreakpointsInto(child, out, breakpointMap);
      }
      for (const slot of node.slots ?? []) {
        if (slot.item) collectSliderContainerBreakpointsInto(slot.item, out, breakpointMap);
      }
      return;

    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

function collectSliderCompensationBreakpointsInto(
  node: SliderSkeletonNode,
  out: Set<number>,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
) {
  switch (node.kind) {
    case "rect":
    case "square":
    case "circle":
    case "media":
    case "sliderDots":
    case "text":
      return;

    case "stack":
    case "row":
    case "col":
      for (const child of node.children) {
        collectSliderCompensationBreakpointsInto(child, out, breakpointMap);
      }
      return;

    case "slider":
      for (const rule of normalizeResponsiveNumberRules(
        node.rowHeightCompensation,
        breakpointMap
      )) {
        out.add(rule.minWidth);
      }
      collectSliderCompensationBreakpointsInto(node.item, out, breakpointMap);
      for (const child of node.children ?? []) {
        collectSliderCompensationBreakpointsInto(child, out, breakpointMap);
      }
      for (const child of node.overlays ?? []) {
        collectSliderCompensationBreakpointsInto(child, out, breakpointMap);
      }
      for (const slot of node.slots ?? []) {
        if (slot.item) {
          collectSliderCompensationBreakpointsInto(slot.item, out, breakpointMap);
        }
      }
      return;

    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

export function collectResponsiveSliderTextLineBreakpoints(
  layout: SliderSkeletonNode,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number[] {
  const out = new Set<number>();
  collectSliderTextBreakpointsInto(layout, out, breakpointMap);
  return Array.from(out)
    .filter((minWidth) => minWidth > 0)
    .sort((a, b) => a - b);
}

export function collectResponsiveSliderContainerBreakpoints(
  layout: SliderSkeletonNode,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number[] {
  const out = new Set<number>();
  collectSliderContainerBreakpointsInto(layout, out, breakpointMap);
  return Array.from(out)
    .filter((minWidth) => minWidth > 0)
    .sort((a, b) => a - b);
}

export function collectResponsiveSliderBaseStyleBreakpoints(
  layout: SliderSkeletonNode,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number[] {
  const out = new Set<number>();
  collectSliderBaseStyleBreakpointsInto(layout, out, breakpointMap);
  return Array.from(out)
    .filter((minWidth) => minWidth > 0)
    .sort((a, b) => a - b);
}

export function collectResponsiveSliderCompensationBreakpoints(
  layout: SliderSkeletonNode,
  breakpointMap: BreakpointMap = BREAKPOINT_MAP
): number[] {
  const out = new Set<number>();
  collectSliderCompensationBreakpointsInto(layout, out, breakpointMap);
  return Array.from(out)
    .filter((minWidth) => minWidth > 0)
    .sort((a, b) => a - b);
}

export function SliderSkeletonCard({
  count,
  maxSlots,
  activeDotIndex,
  rowStyle,
  spec,
  breakpoints,
  centerFirst = false,
  hasLeadingSpacer = false,
  responsiveCssScopeSelector,
}: SliderSkeletonCardProps) {
  const s = spec ?? defaultSliderSpec();
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints]
  );

  const layoutIn: SliderSkeletonNode = s.layout ?? (defaultSliderSpec().layout as SliderSkeletonNode);
  const internalScopeId = React.useMemo(
    () =>
      buildStableScopeId("ssk_", {
        breakpoints: effectiveBreakpoints,
        centerFirst,
        count,
        hasLeadingSpacer,
        maxSlots,
        rowStyle,
        spec: s,
      }),
    [centerFirst, count, effectiveBreakpoints, hasLeadingSpacer, maxSlots, rowStyle, s]
  );
  const internalScopeSelector = React.useMemo(
    () => `[data-rmg-slider-skel-scope="${escapeAttrValue(internalScopeId)}"]`,
    [internalScopeId]
  );
  const scopeSelector = responsiveCssScopeSelector ?? internalScopeSelector;

  const rootStyle: React.CSSProperties = {
    ...(rowStyle || {}),
    ...shimmerStyleVars(s.shimmer),
  };

  if (s.backgroundColor) (rootStyle as any)["--rmg-skel-bg"] = s.backgroundColor;
  if (s.radius != null) (rootStyle as any)["--rmg-skel-radius"] = cssLen(s.radius);

  const { layout, responsiveCss } = React.useMemo(() => {
    let n = 0;
    const allocId = () => `n${++n}`;
    const collected: Array<{ nodeId: string; rules: Array<{ minWidth: number; css: string }> }> = [];

    const withIds = collectResponsiveCss(
      layoutIn,
      allocId,
      collected,
      effectiveBreakpoints
    );
    const cssText = buildResponsiveCssText(scopeSelector, collected);
    return { layout: withIds, responsiveCss: cssText };
  }, [layoutIn, scopeSelector, effectiveBreakpoints]);

  const sliderNode = layout as SliderSkeletonSliderNode;

  const sliderNodeId = (sliderNode as any).__rmgNodeId as string | undefined;
  const plainSliderStyle = containerStylesPlain(
    resolveInlineResponsiveContainerStyle(
      sliderNode.style,
      effectiveBreakpoints
    )
  );

  const slotCount = sliderNode.count != null ? Math.max(0, sliderNode.count | 0) : Math.max(0, count | 0);
  const dir = sliderNode.direction ?? "row";
  const footerChildren = sliderNode.children ?? [];
  const overlayChildren = sliderNode.overlays ?? [];
  const forceCenterRow = centerFirst && dir === "row";
  const renderLeadingSpacer = hasLeadingSpacer && dir === "row";
  const stretchItems = sliderNode.itemStretch ?? true;

  const slotsToRender = Math.max(0, maxSlots | 0);

  const mode = s.mode ?? "fit";

  return (
    <div
      data-rmg-slider-skel-scope={responsiveCssScopeSelector ? undefined : internalScopeId}
      data-rmg-skel-mode={mode}
      data-rmg-skel-has-extras={footerChildren.length ? "true" : undefined}
      className={[styles.sliderSkeletonOverlay, s.className].filter(Boolean).join(" ")}
      style={s.style}
      data-rmg-skel-part="overlay"
    >
      {responsiveCss ? <style dangerouslySetInnerHTML={{ __html: responsiveCss }} /> : null}

      <div
        className={styles.sliderSkeletonLayout}
        data-rmg-skel-part="layout"
        data-rmg-skel-has-extras={footerChildren.length ? "true" : undefined}
      >
        <div
          data-rmg-skel-node={sliderNodeId}
          className={styles.sliderSkeletonRow}
          data-rmg-skel-part="row"
          style={{
            ...rootStyle,
            ...(plainSliderStyle || {}),
            display: "flex",
            flexDirection: dir === "row" ? "row" : "column",
            ...(forceCenterRow ? { justifyContent: "center" } : null),
          }}
        >
          {Array.from({ length: slotsToRender }).map((_, i) => {
            const isSpacer = renderLeadingSpacer && i === 0;
            const realSlotIndex = renderLeadingSpacer ? i - 1 : i;
            const slot = isSpacer
              ? {
                  item: {
                    kind: "rect" as const,
                    style: {
                      width: "100%",
                      height: "100%",
                      backgroundColor: "transparent",
                    },
                    shimmer: {
                      enabled: false,
                    },
                  },
                  itemWrapStyle: {
                    width: "var(--rmg-slider-center-first-spacer-width, 0px)",
                    height: 0,
                  },
                }
              : resolveSliderSlot(sliderNode, realSlotIndex);
            const itemWrap = slot.itemWrapStyle;
            const { outerStyle, innerStyle } = splitSliderItemWrapStyles(itemWrap);

            return (
              <div
                key={`rmg-slider-skel-${i}`}
                className={styles.sliderSkeletonItem}
                data-rmg-skel-slot={i + 1}
                data-rmg-skel-visible-count={slotCount}
                data-rmg-skel-center-first-spacer={isSpacer ? "true" : undefined}
                style={{
                  boxSizing: "border-box",
                  ...(itemWrap ? applyBoxMargins(itemWrap) : null),
                  ...(outerStyle ?? null),
                  ...(dir === "col"
                    ? {
                        flex: "0 0 auto",
                        height: "auto",
                      }
                    : stretchItems
                      ? {
                          height: "100%",
                        }
                    : {
                        alignSelf: "flex-start",
                        height: "auto",
                      }),
                  minWidth: 0,
                  minHeight: 0,
                }}
              >
                <div
                  className={styles.sliderSkeletonItemInner}
                  style={{
                    ...(innerStyle ?? null),
                    ...(dir === "row" && !stretchItems ? { height: "auto" } : null),
                  }}
                >
                  <LayoutNode
                    node={slot.item}
                    breakpointMap={effectiveBreakpoints}
                    activeDotIndex={activeDotIndex}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {footerChildren.length ? (
          <div className={styles.sliderSkeletonExtras} data-rmg-skel-part="extras">
            {footerChildren.map((child, i) => (
              <LayoutNode
                key={`rmg-slider-skel-extra-${i}`}
                node={child}
                breakpointMap={effectiveBreakpoints}
                activeDotIndex={activeDotIndex}
              />
            ))}
          </div>
        ) : null}
      </div>

      {overlayChildren.length ? (
        <div className={styles.sliderSkeletonOverlays} data-rmg-skel-part="overlays">
          {overlayChildren.map((child, i) => (
            <LayoutNode
              key={`rmg-slider-skel-overlay-${i}`}
              node={child}
              breakpointMap={effectiveBreakpoints}
              activeDotIndex={activeDotIndex}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
