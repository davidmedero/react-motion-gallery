/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

import styles from "./MasonrySkeleton.module.css";
import {
  BREAKPOINT_MAP,
  DEFAULT_SERVER_VIEWPORT_WIDTH,
} from "../shared/responsive";
import type { BreakpointMap, ResponsiveNumber } from "../shared/responsive";
import sharedSkeletonStyles from "../shared/skeleton/layout.module.css";
import {
  applySkeletonTextSnapshot,
  type SkeletonBaseStyle,
  type SkeletonBaseStyleResponsive,
  type SkeletonContainerStyle,
  type SkeletonContainerStyleResponsive,
  type SkeletonLayoutRoot,
  type SkeletonLength,
  type SkeletonNode as SharedSkeletonNode,
  type SkeletonShimmer,
  type SkeletonWrapStyle,
  SkeletonLayoutNode,
  applyBoxMargins,
  cssLen,
  escapeAttrValue,
  resolveResponsiveBaseStyleAtMinWidth,
  resolveResponsiveContainerStyleAtMinWidth,
  shimmerStyleVars,
  wrapStyleVars,
} from "../shared/skeleton/layout";
import { SAFARI_TEXT_SKELETON_SUPPORTS } from "../shared/skeleton/text";
import { getResponsiveTextRenderState } from "../shared/skeleton/text";
import { buildStableScopeId } from "../shared/stableScope";
import type { MasonryClassNames } from "../masonry/Masonry";
import {
  resolveActiveMasonryPredictionVariant,
  buildMasonrySkeletonPrediction,
  resolveActiveFlexStateKey,
} from "../masonry/prediction";
import type { ResponsiveMasonrySpan } from "../masonry/types";
import type { SkeletonCacheSnapshot } from "./cache";

export type {
  SkeletonBaseStyle,
  SkeletonBaseStyleResponsive,
  SkeletonContainerStyle,
  SkeletonContainerStyleResponsive,
  SkeletonLength,
  SkeletonShimmer,
} from "../shared/skeleton/layout";
export { resolveActiveFlexStateKey } from "../masonry/prediction";

export type MasonryPlacement = "balanced" | "roundRobin" | "horizontalOrder";
export type MasonrySkeletonWrapStyle = SkeletonWrapStyle;
export type SkeletonNode = SharedSkeletonNode;
export type MasonrySkeletonSlot = {
  item?: SkeletonNode;
  itemWrapStyle?: MasonrySkeletonWrapStyle;
  ratio?: number;
  heightPx?: number;
  span?: ResponsiveMasonrySpan;
};

export type MasonrySkeletonLayoutNode = SkeletonLayoutRoot<"masonry"> & {
  slots?: MasonrySkeletonSlot[];
};

export type MasonrySkeletonNode =
  | MasonrySkeletonLayoutNode
  | SharedSkeletonNode;

export type MasonrySkeletonSpec = {
  className?: string;
  layout?: MasonrySkeletonNode;
  ratios?: number[];
  heightsPx?: number[];
  backgroundColor?: string;
  highlightColor?: string;
  radius?: SkeletonLength;
  shimmer?: SkeletonShimmer;
};

export type MasonrySkeletonCardProps = {
  count: number;
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  breakpoints?: BreakpointMap;
  classNames?: MasonryClassNames;
  ratios?: number[];
  heightsPx?: number[];
  spans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
  placement?: MasonryPlacement;
  spec?: MasonrySkeletonSpec;
  viewportWidth?: number;
  layoutWidthPx?: number;
  disableShimmer?: boolean;
  cacheSnapshot?: SkeletonCacheSnapshot | null;
};

function buildFlexVariantVisibilityCss(
  scopeId: string,
  states: Array<{ key: string; minWidth: number }>,
) {
  const scopeSel = `[data-rmg-mskel-scope="${escapeAttrValue(scopeId)}"]`;
  const lines: string[] = [];

  lines.push(`${scopeSel} [data-rmg-mskel-variant]{display:none !important;}`);

  const base = states[0];
  if (base) {
    lines.push(
      `${scopeSel} [data-rmg-mskel-variant="${base.key}"]{display:block !important;}`,
    );
  }

  for (const state of states) {
    if (state.minWidth <= 0) continue;

    lines.push(
      `@media (min-width:${state.minWidth}px){` +
        `${scopeSel} [data-rmg-mskel-variant]{display:none !important;}` +
        `${scopeSel} [data-rmg-mskel-variant="${escapeAttrValue(state.key)}"]{display:block !important;}` +
        `}`,
    );
  }

  return lines.join("\n");
}

function importantDecl(name: string, value: string | number) {
  return `${name}:${value} !important;`;
}

function buildVariantContainerCss(
  scopeId: string,
  variants: ReturnType<typeof buildMasonrySkeletonPrediction>["variants"],
) {
  const scopeSel = `[data-rmg-mskel-scope="${escapeAttrValue(scopeId)}"]`;
  const lines: string[] = [];

  for (const variant of variants) {
    const usesPositionedSkeleton = variant.items.some((item) => item.span > 1);

    const variantSel = `${scopeSel} [data-rmg-mskel-variant="${escapeAttrValue(
      variant.state.key,
    )}"]`;

    for (const rule of variant.containerCssRules ?? []) {
      const rootCss =
        `${variantSel}{` +
        Object.entries(rule.rootDecls)
          .map(([name, value]) => importantDecl(name, value))
          .join("") +
        `}`;
      const itemCss = usesPositionedSkeleton
        ? rule.items
            .map((item) => {
              const itemSel = `${variantSel} > [data-rmg-mskel-index="${item.index}"]`;
              return (
                `${itemSel}{` +
                [
                  importantDecl("top", item.topCssExpr ?? "0px"),
                  importantDecl("left", item.leftCssExpr),
                  importantDecl("width", item.widthCssExpr),
                ].join("") +
                `}`
              );
            })
            .join("")
        : "";

      lines.push(
        `@container (min-width:${rule.minWidth}px){${rootCss}${itemCss}}`,
      );
    }
  }

  return lines.join("\n");
}

function buildVariantSafariCss(
  scopeId: string,
  variants: ReturnType<typeof buildMasonrySkeletonPrediction>["variants"],
) {
  const scopeSel = `[data-rmg-mskel-scope="${escapeAttrValue(scopeId)}"]`;
  const lines: string[] = [];

  for (const variant of variants) {
    const usesPositionedSkeleton = variant.items.some((item) => item.span > 1);
    const variantSel = `${scopeSel} [data-rmg-mskel-variant="${escapeAttrValue(
      variant.state.key,
    )}"]`;
    const fallbackShellHeight = variant.items.length
      ? Math.max(
          0,
          ...variant.items.map((item) => item.safariTop + item.safariHeight),
        )
      : 0;
    const rootDecls = [
      [
        "height",
        variant.safariShellHeightCssExpr ??
          variant.shellHeightCssExpr ??
          `${fallbackShellHeight}px`,
      ],
      ["--rmg-cols", variant.state.columns],
      ["--rmg-gap", `${variant.state.gapPx}px`],
      ...Object.entries(variant.safariPositionedCssVars ?? {}),
    ] as Array<[string, string | number]>;
    const effectiveRootDecls = usesPositionedSkeleton
      ? rootDecls
      : rootDecls.filter(([name]) => name !== "height");
    const rootCss =
      `${variantSel}{` +
      effectiveRootDecls
        .map(([name, value]) => importantDecl(name, value))
        .join("") +
      `}`;
    const itemCss = variant.items
      .map((item) => {
        const itemSel = `${variantSel} [data-rmg-mskel-index="${item.index}"]`;
        const decls = usesPositionedSkeleton
          ? [
              importantDecl("height", item.safariHeightCssExpr),
              importantDecl(
                "top",
                item.safariTopCssExpr ?? `${item.safariTop}px`,
              ),
            ]
          : [importantDecl("height", item.safariHeightCssExpr)];

        return `${itemSel}{` + decls.join("") + `}`;
      })
      .join("");
    const containerCss = (variant.safariContainerCssRules ?? [])
      .map((rule) => {
        const containerRootDecls = Object.entries(rule.rootDecls).filter(
          ([name]) => usesPositionedSkeleton || name !== "height",
        );
        const containerRootCss =
          `${variantSel}{` +
          containerRootDecls
            .map(([name, value]) => importantDecl(name, value))
            .join("") +
          `}`;
        const containerItemCss = usesPositionedSkeleton
          ? rule.items
              .map((item) => {
                const itemSel = `${variantSel} [data-rmg-mskel-index="${item.index}"]`;
                return (
                  `${itemSel}{` +
                  [
                    importantDecl("top", item.topCssExpr ?? "0px"),
                    importantDecl("left", item.leftCssExpr),
                    importantDecl("width", item.widthCssExpr),
                  ].join("") +
                  `}`
                );
              })
              .join("")
          : "";

        return `@container (min-width:${rule.minWidth}px){${containerRootCss}${containerItemCss}}`;
      })
      .join("");

    lines.push(`${rootCss}${itemCss}${containerCss}`);
  }

  return lines.length
    ? `@supports ${SAFARI_TEXT_SKELETON_SUPPORTS}{${lines.join("")}}`
    : "";
}

function splitMasonryItemWrapStyles(
  itemWrapStyle: MasonrySkeletonWrapStyle | undefined,
): {
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
    outerStyle.boxShadow = innerStyle.boxShadow;
    (outerStyle as any)["--rmg-masonry-skel-wrap-shadow"] =
      innerStyle.boxShadow;
    (outerStyle as any)["--rmg-masonry-skel-wrap-shadow-opacity"] = 0;
    delete innerStyle.boxShadow;
  }

  if (innerStyle.borderRadius != null) {
    outerStyle.borderRadius = innerStyle.borderRadius;
    (outerStyle as any)["--rmg-masonry-skel-wrap-shadow-radius"] =
      innerStyle.borderRadius;
  }

  return {
    outerStyle: Object.keys(outerStyle).length ? outerStyle : undefined,
    innerStyle,
  };
}

function parseSkeletonCssLengthPx(
  value: SkeletonLength | undefined,
  basisPx: number,
): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const pxMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (pxMatch?.[1] != null) {
    const parsed = Number(pxMatch[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const percentMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (percentMatch?.[1] != null && Number.isFinite(basisPx)) {
    const parsed = Number(percentMatch[1]);
    return Number.isFinite(parsed) ? (basisPx * parsed) / 100 : null;
  }

  return null;
}

function parseInlineInsetPx(
  value: SkeletonLength | undefined,
  basisPx: number,
): number {
  if (value == null) return 0;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value * 2 : 0;
  }

  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 0;

  const parsed = parts.map((part) =>
    parseSkeletonCssLengthPx(part, basisPx) ?? 0,
  );

  if (parsed.length === 1) return (parsed[0] ?? 0) * 2;
  if (parsed.length === 2) return (parsed[1] ?? 0) * 2;
  if (parsed.length === 3) return (parsed[1] ?? 0) * 2;
  return (parsed[1] ?? 0) + (parsed[3] ?? 0);
}

function parseBorderInlinePx(border: React.CSSProperties["border"]): number {
  if (typeof border !== "string") return 0;
  const match = border.match(/(-?\d+(?:\.\d+)?)px/);
  if (!match?.[1]) return 0;

  const width = Number(match[1]);
  return Number.isFinite(width) ? width * 2 : 0;
}

function resolveStyledOuterWidthPx(
  style:
    | Pick<SkeletonBaseStyle, "width" | "minWidth" | "maxWidth">
    | Pick<SkeletonContainerStyle, "width" | "minWidth" | "maxWidth">
    | undefined,
  fallbackPx: number,
): number {
  let width = parseSkeletonCssLengthPx(style?.width, fallbackPx) ?? fallbackPx;
  const minWidth = parseSkeletonCssLengthPx(style?.minWidth, fallbackPx);
  const maxWidth = parseSkeletonCssLengthPx(style?.maxWidth, fallbackPx);

  if (minWidth != null) width = Math.max(width, minWidth);
  if (maxWidth != null) width = Math.min(width, maxWidth);
  return Math.max(0, width);
}

function resolveContainerContentWidthPx(
  style: SkeletonContainerStyle | undefined,
  fallbackPx: number,
): number {
  const outerWidth = resolveStyledOuterWidthPx(style, fallbackPx);
  const paddingInline = parseInlineInsetPx(style?.padding, outerWidth);
  const borderInline = parseBorderInlinePx(style?.border);
  return Math.max(0, outerWidth - paddingInline - borderInline);
}

function resolveWrapContentWidthPx(
  style: MasonrySkeletonWrapStyle | undefined,
  fallbackPx: number,
): number {
  const outerWidth = resolveStyledOuterWidthPx(style, fallbackPx);
  const paddingInline = parseInlineInsetPx(style?.padding, outerWidth);
  const borderInline = parseBorderInlinePx(style?.border);
  return Math.max(0, outerWidth - paddingInline - borderInline);
}

function resolveTextOuterWidthPx(
  style: SkeletonBaseStyle | undefined,
  fallbackPx: number,
): number {
  return resolveStyledOuterWidthPx(style, fallbackPx);
}

function resolveContainerTextFirstPaintNode(
  node: SkeletonNode,
  availableWidthPx: number,
  responsiveMinWidth: number,
  breakpointMap: BreakpointMap,
): SkeletonNode {
  switch (node.kind) {
    case "text": {
      if (node.responsiveBy !== "container") return node;

      const textStyle = resolveResponsiveBaseStyleAtMinWidth(
        node.style,
        responsiveMinWidth,
        breakpointMap,
      );
      const textWidthPx = resolveTextOuterWidthPx(textStyle, availableWidthPx);
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
      const activeState = renderState.states.reduce(
        (
          active: typeof renderState.baseState,
          rule: (typeof renderState.states)[number],
        ) =>
          textWidthPx >= rule.minWidth ? rule.state : active,
        renderState.baseState,
      );

      return {
        ...(node as any),
        __rmgTextRenderState: {
          ...renderState,
          baseState: activeState,
          baseLines: activeState.lineCount,
          baseLastBarWidth:
            activeState.barWidths[activeState.lineCount - 1] ??
            renderState.baseLastBarWidth,
          metrics: activeState.metrics,
        },
      } as SkeletonNode;
    }

    case "stack":
    case "row":
    case "col": {
      const style = resolveResponsiveContainerStyleAtMinWidth(
        node.style,
        responsiveMinWidth,
        breakpointMap,
      );
      const contentWidthPx = resolveContainerContentWidthPx(
        style,
        availableWidthPx,
      );

      return {
        ...(node as any),
        children: node.children.map((child) =>
          resolveContainerTextFirstPaintNode(
            child,
            contentWidthPx,
            responsiveMinWidth,
            breakpointMap,
          ),
        ),
      } as SkeletonNode;
    }

    case "media":
    case "rect":
    case "square":
    case "circle":
      return node;
  }
}

export function MasonrySkeletonCard(props: MasonrySkeletonCardProps) {
  const {
    count,
    columns,
    gap,
    breakpoints,
    classNames,
    ratios,
    placement,
    spec,
    viewportWidth,
    layoutWidthPx,
    disableShimmer,
    cacheSnapshot,
  } = props;
  const initialLayoutWidthPxRef = React.useRef<number | undefined>(
    layoutWidthPx,
  );
  const frozenLayoutWidthPx =
    initialLayoutWidthPxRef.current !== undefined
      ? initialLayoutWidthPxRef.current
      : layoutWidthPx;
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints],
  );

  const scopeId = React.useMemo(() => {
    return buildStableScopeId("mskel_", {
      count,
      columns,
      gap,
      breakpoints: effectiveBreakpoints,
      ratios,
      heightsPx: props.heightsPx,
      spans: props.spans,
      placement,
      spec,
    });
  }, [
    count,
    columns,
    gap,
    effectiveBreakpoints,
    ratios,
    props.heightsPx,
    props.spans,
    placement,
    spec,
  ]);

  const rootStyle: React.CSSProperties = {
    ...(spec?.backgroundColor
      ? ({ ["--rmg-skel-bg" as any]: spec.backgroundColor } as any)
      : null),
    ...(spec?.radius != null
      ? ({ ["--rmg-skel-radius" as any]: cssLen(spec.radius) } as any)
      : null),
    ...(disableShimmer
      ? null
      : (shimmerStyleVars(spec?.shimmer, {
          enabledVarName: "--rmg-skel-card-shimmer-enabled",
        }) as any)),
    ...(!disableShimmer && (spec?.shimmer?.c2 ?? spec?.highlightColor) != null
      ? ({
          ["--rmg-skel-shimmer-c2" as any]:
            spec?.shimmer?.c2 ?? spec?.highlightColor,
        } as any)
      : null),
  };

  const prediction = React.useMemo(() => {
    const cachedSpec =
      cacheSnapshot?.text && spec
        ? {
            ...spec,
            layout: spec.layout
              ? applySkeletonTextSnapshot(
                  spec.layout,
                  cacheSnapshot.text,
                  "masonry",
                  effectiveBreakpoints,
                )
              : spec.layout,
          }
        : spec;

    return buildMasonrySkeletonPrediction({
      count,
      columns,
      gap,
      breakpoints: effectiveBreakpoints,
      ratios,
      heightsPx: props.heightsPx,
      spans: props.spans,
      placement,
      spec: cachedSpec,
      scopeId,
      viewportWidth,
      layoutWidthPx: frozenLayoutWidthPx,
    });
  }, [
    cacheSnapshot,
    count,
    columns,
    gap,
    effectiveBreakpoints,
    ratios,
    props.heightsPx,
    props.spans,
    placement,
    spec,
    scopeId,
    viewportWidth,
    frozenLayoutWidthPx,
  ]);

  const jsControlled = viewportWidth !== undefined;
  const cacheVariant = cacheSnapshot?.masonry?.variantKey
    ? (prediction.variants.find(
        (variant) =>
          variant.state.key === cacheSnapshot.masonry?.variantKey &&
          variant.state.minWidth === cacheSnapshot.widthBucketMin,
      ) ?? null)
    : null;
  const cacheControlled = !!cacheVariant;
  const jsActiveVariant = jsControlled
    ? resolveActiveMasonryPredictionVariant(prediction.variants, viewportWidth)
    : null;
  const activeKey = cacheControlled
    ? cacheVariant.state.key
    : jsControlled
      ? (jsActiveVariant?.state.key ??
        resolveActiveFlexStateKey(prediction.states, viewportWidth))
      : null;

  const visibilityCss = React.useMemo(
    () =>
      cacheControlled || jsControlled
        ? null
        : buildFlexVariantVisibilityCss(scopeId, prediction.states),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheControlled, jsControlled, scopeId, prediction.variants],
  );
  const variantContainerCss = React.useMemo(
    () =>
      cacheControlled
        ? ""
        : buildVariantContainerCss(scopeId, prediction.variants),
    [cacheControlled, scopeId, prediction.variants],
  );
  const variantSafariCss = React.useMemo(() => {
    const variantsForCss =
      cacheControlled && cacheVariant ? [cacheVariant] : prediction.variants;
    return buildVariantSafariCss(scopeId, variantsForCss);
  }, [cacheControlled, cacheVariant, scopeId, prediction.variants]);
  const structuredLayout = prediction.structuredLayout;
  const rootClassName = classNames?.root ?? styles.masonrySkeletonRoot;
  const columnClassName = classNames?.column ?? styles.masonrySkeletonCol;
  const itemClassName =
    classNames?.item ??
    (structuredLayout
      ? styles.masonrySkeletonLayoutItem
      : styles.masonrySkeletonItem);
  const canUseNumericPositioning =
    jsControlled &&
    frozenLayoutWidthPx !== undefined &&
    Number.isFinite(Number(frozenLayoutWidthPx)) &&
    Number(frozenLayoutWidthPx) > 0;

  const variants = React.useMemo(() => {
    const cardShimmerClass = disableShimmer
      ? null
      : sharedSkeletonStyles.skelCardShimmer;
    const serverActiveVariantKey = resolveActiveMasonryPredictionVariant(
      prediction.variants,
      viewportWidth ?? DEFAULT_SERVER_VIEWPORT_WIDTH,
    )?.state.key;
    const serverActiveStateKey = resolveActiveFlexStateKey(
      prediction.states,
      viewportWidth ?? DEFAULT_SERVER_VIEWPORT_WIDTH,
    );
    const widestVariantKey = prediction.variants.reduce<
      (typeof prediction.variants)[number] | null
    >(
      (widest, variant) =>
        !widest || variant.state.minWidth > widest.state.minWidth
          ? variant
          : widest,
      null,
    )?.state.key;
    const baseVariantKey = prediction.states[0]?.key;
    const firstPaintPriority = [
      activeKey,
      widestVariantKey,
      baseVariantKey,
      serverActiveVariantKey,
      serverActiveStateKey,
    ].filter((key): key is string => !!key);
    const priorityFor = (key: string) => {
      const priority = firstPaintPriority.indexOf(key);
      return priority === -1 ? Number.POSITIVE_INFINITY : priority;
    };
    const variantsToRender = cacheVariant
      ? [cacheVariant]
      : [...prediction.variants].sort((a, b) => {
          const priorityDelta =
            priorityFor(a.state.key) - priorityFor(b.state.key);
          if (priorityDelta !== 0) return priorityDelta;
          return a.state.minWidth - b.state.minWidth;
        });

    return variantsToRender.map((variant) => {
      const usesPositionedSkeleton = variant.items.some(
        (item) => item.span > 1,
      );
      const shellHeight = Math.max(
        0,
        ...variant.items.map((item) => item.top + item.height),
      );
      const cachedShellHeight = cacheVariant
        ? cacheSnapshot?.masonry?.shellHeightPx
        : undefined;
      const itemHeight = (index: number, fallback: number) => {
        const height = cacheVariant
          ? cacheSnapshot?.masonry?.itemHeightsPx?.[index]
          : undefined;
        return typeof height === "number" &&
          Number.isFinite(height) &&
          height >= 0
          ? height
          : fallback;
      };

      if (!usesPositionedSkeleton) {
        const cols: Array<typeof variant.items> = Array.from(
          { length: variant.state.columns },
          () => [],
        );

        for (const item of variant.items) {
          cols[item.columnIndex]!.push(item);
        }

        return (
          <div
            key={variant.state.key}
            data-rmg-mskel-variant={variant.state.key}
            style={{
              width: "100%",
              ["--rmg-cols" as any]: variant.state.columns,
              ["--rmg-gap" as any]: `${variant.state.gapPx}px`,
              ...(variant.positionedCssVars ?? {}),
              display:
                cacheControlled || jsControlled
                  ? variant.state.key === activeKey
                    ? "block"
                    : "none"
                  : variant.state.key === prediction.states[0]?.key
                    ? "block"
                    : "none",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                columnGap: `${variant.state.gapPx}px`,
              }}
            >
              {cols.map((columnItems, columnIndex) => (
                <div
                  key={columnIndex}
                  className={columnClassName}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {columnItems.map((item, itemIndex) => {
                    const marginBottom =
                      itemIndex === columnItems.length - 1
                        ? "0px"
                        : `${variant.state.gapPx}px`;

                    if (!structuredLayout) {
                      return (
                        <div
                          key={`rmg-mskel-${variant.state.key}-${item.index}`}
                          data-rmg-mskel-index={item.index}
                          className={[itemClassName, cardShimmerClass]
                            .filter(Boolean)
                            .join(" ")}
                          style={{
                            height: `${itemHeight(item.index, item.height)}px`,
                            marginBottom,
                          }}
                        />
                      );
                    }
                    const { outerStyle, innerStyle } =
                      splitMasonryItemWrapStyles(item.slot?.itemWrapStyle);
                    const firstPaintItemNode = resolveContainerTextFirstPaintNode(
                      item.slot?.item ?? structuredLayout.item,
                      resolveWrapContentWidthPx(
                        item.slot?.itemWrapStyle,
                        item.widthPx,
                      ),
                      variant.state.minWidth,
                      effectiveBreakpoints,
                    );

                    return (
                      <div
                        key={`rmg-mskel-${variant.state.key}-${item.index}`}
                        data-rmg-mskel-index={item.index}
                        className={itemClassName}
                        style={{
                          ...(item.slot?.itemWrapStyle
                            ? applyBoxMargins(item.slot.itemWrapStyle)
                            : null),
                          ...(outerStyle ?? null),
                          width: "100%",
                          height: cacheVariant
                            ? `${itemHeight(item.index, item.height)}px`
                            : item.heightCssExpr,
                          marginBottom,
                        }}
                      >
                        <div
                          className={[
                            styles.masonrySkeletonLayoutItemInner,
                            cardShimmerClass,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={{
                            ...innerStyle,
                          }}
                        >
                          <div style={{ width: "100%" }}>
                            <SkeletonLayoutNode
                              node={firstPaintItemNode}
                              disableShimmer
                              breakpointMap={effectiveBreakpoints}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div
          key={variant.state.key}
          data-rmg-mskel-variant={variant.state.key}
          style={{
            position: "relative",
            width: "100%",
            height:
              cachedShellHeight != null
                ? `${cachedShellHeight}px`
                : structuredLayout && !canUseNumericPositioning
                  ? (variant.shellHeightCssExpr ?? `${shellHeight}px`)
                  : `${shellHeight}px`,
            display:
              cacheControlled || jsControlled
                ? variant.state.key === activeKey
                  ? "block"
                  : "none"
                : variant.state.key === prediction.states[0]?.key
                  ? "block"
                  : "none",
            ["--rmg-cols" as any]: variant.state.columns,
            ["--rmg-gap" as any]: `${variant.state.gapPx}px`,
            ...(variant.positionedCssVars ?? {}),
          }}
        >
          {variant.items.map((item) => {
            if (!structuredLayout) {
              return (
                <div
                  key={`rmg-mskel-${variant.state.key}-${item.index}`}
                  data-rmg-mskel-index={item.index}
                  className={[itemClassName, cardShimmerClass]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    position: "absolute",
                    top: `${item.top}px`,
                    left: item.leftCssExpr,
                    width: item.widthCssExpr,
                    height: `${itemHeight(item.index, item.height)}px`,
                  }}
                />
              );
            }

            const { outerStyle, innerStyle } = splitMasonryItemWrapStyles(
              item.slot?.itemWrapStyle,
            );
            const firstPaintItemNode = resolveContainerTextFirstPaintNode(
              item.slot?.item ?? structuredLayout.item,
              resolveWrapContentWidthPx(item.slot?.itemWrapStyle, item.widthPx),
              variant.state.minWidth,
              effectiveBreakpoints,
            );

            return (
              <div
                key={`rmg-mskel-${variant.state.key}-${item.index}`}
                data-rmg-mskel-index={item.index}
                className={itemClassName}
                style={{
                  ...(item.slot?.itemWrapStyle
                    ? applyBoxMargins(item.slot.itemWrapStyle)
                    : null),
                  ...(outerStyle ?? null),
                  position: "absolute",
                  top: canUseNumericPositioning
                    ? `${item.top}px`
                    : (item.topCssExpr ?? `${item.top}px`),
                  left: canUseNumericPositioning
                    ? `${item.leftPx}px`
                    : item.leftCssExpr,
                  width: canUseNumericPositioning
                    ? `${item.widthPx}px`
                    : item.widthCssExpr,
                  height: cacheVariant
                    ? `${itemHeight(item.index, item.height)}px`
                    : canUseNumericPositioning
                      ? `${item.height}px`
                      : item.heightCssExpr,
                  minWidth: 0,
                }}
              >
                <div
                  className={[
                    styles.masonrySkeletonLayoutItemInner,
                    cardShimmerClass,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    ...innerStyle,
                  }}
                >
                  <div style={{ width: "100%" }}>
                    <SkeletonLayoutNode
                      node={firstPaintItemNode}
                      disableShimmer
                      breakpointMap={effectiveBreakpoints}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  }, [
    itemClassName,
    columnClassName,
    prediction.variants,
    prediction.states,
    structuredLayout,
    effectiveBreakpoints,
    jsControlled,
    canUseNumericPositioning,
    activeKey,
    viewportWidth,
    disableShimmer,
    cacheSnapshot,
    cacheVariant,
  ]);

  return (
    <div
      data-rmg-mskel-scope={scopeId}
      data-rmg-skel-node={prediction.structuredNodeId}
      className={[rootClassName, spec?.className].filter(Boolean).join(" ")}
      style={{
        ...rootStyle,
        ...(prediction.plainStructuredStyle || {}),
        containerType: "inline-size",
        width: "100%",
      }}
    >
      {visibilityCss ? (
        <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />
      ) : null}
      {prediction.responsiveCss ? (
        <style dangerouslySetInnerHTML={{ __html: prediction.responsiveCss }} />
      ) : null}
      {variantContainerCss ? (
        <style dangerouslySetInnerHTML={{ __html: variantContainerCss }} />
      ) : null}
      {variants}
      {variantSafariCss ? (
        <style dangerouslySetInnerHTML={{ __html: variantSafariCss }} />
      ) : null}
    </div>
  );
}
