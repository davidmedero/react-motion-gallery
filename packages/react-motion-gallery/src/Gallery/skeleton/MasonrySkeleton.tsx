/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

import styles from "./MasonrySkeleton.module.css";
import { BREAKPOINT_MAP } from "../shared/responsive";
import type {
  BreakpointMap,
  ResponsiveNumber,
} from "../shared/responsive";
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
  shimmerStyleVars,
  wrapStyleVars,
} from "../shared/skeleton/layout";
import { SAFARI_TEXT_SKELETON_SUPPORTS } from "../shared/skeleton/text";
import { buildStableScopeId } from "../shared/stableScope";
import type { MasonryClassNames } from "../masonry/Masonry";
import {
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

export type MasonrySkeletonNode = MasonrySkeletonLayoutNode | SharedSkeletonNode;

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
  states: Array<{ key: string; minWidth: number }>
) {
  const scopeSel = `[data-rmg-mskel-scope="${escapeAttrValue(scopeId)}"]`;
  const lines: string[] = [];

  lines.push(`${scopeSel} [data-rmg-mskel-variant]{display:none !important;}`);

  const base = states[0];
  if (base) {
    lines.push(
      `${scopeSel} [data-rmg-mskel-variant="${base.key}"]{display:block !important;}`
    );
  }

  for (const state of states) {
    if (state.minWidth <= 0) continue;
    lines.push(
      `@media (min-width:${state.minWidth}px){` +
        `${scopeSel} [data-rmg-mskel-variant]{display:none !important;}` +
        `${scopeSel} [data-rmg-mskel-variant="${state.key}"]{display:block !important;}` +
        `}`
    );
  }

  return lines.join("\n");
}

function importantDecl(name: string, value: string | number) {
  return `${name}:${value} !important;`;
}

function buildVariantContainerCss(
  scopeId: string,
  variants: ReturnType<typeof buildMasonrySkeletonPrediction>["variants"]
) {
  const scopeSel = `[data-rmg-mskel-scope="${escapeAttrValue(scopeId)}"]`;
  const lines: string[] = [];

  for (const variant of variants) {
    const usesPositionedSkeleton = variant.items.some((item) => item.span > 1);

    const variantSel = `${scopeSel} [data-rmg-mskel-variant="${escapeAttrValue(
      variant.state.key
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
        `@container (min-width:${rule.minWidth}px){${rootCss}${itemCss}}`
      );
    }
  }

  return lines.join("\n");
}

function buildVariantSafariCss(
  scopeId: string,
  variants: ReturnType<typeof buildMasonrySkeletonPrediction>["variants"]
) {
  const scopeSel = `[data-rmg-mskel-scope="${escapeAttrValue(scopeId)}"]`;
  const lines: string[] = [];

  for (const variant of variants) {
    const usesPositionedSkeleton = variant.items.some((item) => item.span > 1);
    const variantSel = `${scopeSel} [data-rmg-mskel-variant="${escapeAttrValue(
      variant.state.key
    )}"]`;
    const fallbackShellHeight = variant.items.length
      ? Math.max(
          0,
          ...variant.items.map((item) => item.safariTop + item.safariHeight)
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
                item.safariTopCssExpr ?? `${item.safariTop}px`
              ),
            ]
          : [importantDecl("height", item.safariHeightCssExpr)];

        return `${itemSel}{` + decls.join("") + `}`;
      })
      .join("");
    const containerCss = (variant.safariContainerCssRules ?? [])
      .map((rule) => {
        const containerRootDecls = Object.entries(rule.rootDecls).filter(
          ([name]) => usesPositionedSkeleton || name !== "height"
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

function splitMasonryItemWrapStyles(itemWrapStyle: MasonrySkeletonWrapStyle | undefined): {
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
    (outerStyle as any)["--rmg-masonry-skel-wrap-shadow"] = innerStyle.boxShadow;
    (outerStyle as any)["--rmg-masonry-skel-wrap-shadow-opacity"] = 0;
    delete innerStyle.boxShadow;
  }

  if (innerStyle.borderRadius != null) {
    outerStyle.borderRadius = innerStyle.borderRadius;
    (outerStyle as any)["--rmg-masonry-skel-wrap-shadow-radius"] = innerStyle.borderRadius;
  }

  return {
    outerStyle: Object.keys(outerStyle).length ? outerStyle : undefined,
    innerStyle,
  };
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
  const initialLayoutWidthPxRef = React.useRef<number | undefined>(layoutWidthPx);
  const frozenLayoutWidthPx =
    initialLayoutWidthPxRef.current !== undefined
      ? initialLayoutWidthPxRef.current
      : layoutWidthPx;
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints]
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
      ? ({ ["--rmg-skel-shimmer-c2" as any]: spec?.shimmer?.c2 ?? spec?.highlightColor } as any)
      : null),
  };

  const prediction = React.useMemo(
    () => {
      const cachedSpec =
        cacheSnapshot?.text && spec
          ? {
              ...spec,
              layout: spec.layout
                ? applySkeletonTextSnapshot(
                    spec.layout,
                    cacheSnapshot.text,
                    "masonry",
                    effectiveBreakpoints
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
    },
    [
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
    ]
  );

  const jsControlled = viewportWidth !== undefined;
  const cacheVariant = cacheSnapshot?.masonry?.variantKey
    ? prediction.variants.find(
        (variant) =>
          variant.state.key === cacheSnapshot.masonry?.variantKey &&
          variant.state.minWidth === cacheSnapshot.widthBucketMin
      ) ?? null
    : null;
  const cacheControlled = !!cacheVariant;
  const activeKey = cacheControlled
    ? cacheVariant.state.key
    : jsControlled
    ? resolveActiveFlexStateKey(prediction.states, viewportWidth)
    : null;

  const visibilityCss = React.useMemo(
    () =>
      cacheControlled || jsControlled
        ? null
        : buildFlexVariantVisibilityCss(scopeId, prediction.states),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheControlled, jsControlled, scopeId, prediction.variants]
  );
  const variantContainerCss = React.useMemo(
    () =>
      cacheControlled
        ? ""
        : buildVariantContainerCss(scopeId, prediction.variants),
    [cacheControlled, scopeId, prediction.variants]
  );
  const variantSafariCss = React.useMemo(
    () => {
      const variantsForCss =
        cacheControlled && cacheVariant ? [cacheVariant] : prediction.variants;
      return buildVariantSafariCss(scopeId, variantsForCss);
    },
    [cacheControlled, cacheVariant, scopeId, prediction.variants]
  );
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
    const cardShimmerClass = disableShimmer ? null : sharedSkeletonStyles.skelCardShimmer;
    const variantsToRender = cacheVariant ? [cacheVariant] : prediction.variants;

    return variantsToRender.map((variant) => {
      const usesPositionedSkeleton = variant.items.some((item) => item.span > 1);
      const shellHeight = Math.max(
        0,
        ...variant.items.map((item) => item.top + item.height)
      );
      const cachedShellHeight = cacheVariant
        ? cacheSnapshot?.masonry?.shellHeightPx
        : undefined;
      const itemHeight = (index: number, fallback: number) => {
        const height = cacheVariant
          ? cacheSnapshot?.masonry?.itemHeightsPx?.[index]
          : undefined;
        return typeof height === "number" && Number.isFinite(height) && height >= 0
          ? height
          : fallback;
      };

      if (!usesPositionedSkeleton) {
        const cols: Array<typeof variant.items> = Array.from(
          { length: variant.state.columns },
          () => []
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
              display: cacheControlled || jsControlled
                ? variant.state.key === activeKey ? "block" : "none"
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
                    const { outerStyle, innerStyle } = splitMasonryItemWrapStyles(
                      item.slot?.itemWrapStyle
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
                          style={innerStyle}
                        >
                          <div style={{ width: "100%" }}>
                            <SkeletonLayoutNode
                              node={item.slot?.item ?? structuredLayout.item}
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
            display: cacheControlled || jsControlled
              ? variant.state.key === activeKey ? "block" : "none"
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
              item.slot?.itemWrapStyle
            );

            return (
              <div
                key={`rmg-mskel-${variant.state.key}-${item.index}`}
                data-rmg-mskel-index={item.index}
                className={itemClassName}
                style={{
                  ...(item.slot?.itemWrapStyle ? applyBoxMargins(item.slot.itemWrapStyle) : null),
                  ...(outerStyle ?? null),
                  position: "absolute",
                  top:
                    canUseNumericPositioning
                      ? `${item.top}px`
                      : (item.topCssExpr ?? `${item.top}px`),
                  left:
                    canUseNumericPositioning
                      ? `${item.leftPx}px`
                      : item.leftCssExpr,
                  width:
                    canUseNumericPositioning
                      ? `${item.widthPx}px`
                      : item.widthCssExpr,
                  height:
                    cacheVariant
                      ? `${itemHeight(item.index, item.height)}px`
                      : canUseNumericPositioning
                      ? `${item.height}px`
                      : item.heightCssExpr,
                  minWidth: 0,
                }}
              >
                <div
                  className={[styles.masonrySkeletonLayoutItemInner, cardShimmerClass]
                    .filter(Boolean)
                    .join(" ")}
                  style={innerStyle}
                >
                  <div style={{ width: "100%" }}>
                    <SkeletonLayoutNode
                      node={item.slot?.item ?? structuredLayout.item}
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
      {visibilityCss ? <style dangerouslySetInnerHTML={{ __html: visibilityCss }} /> : null}
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
