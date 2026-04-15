/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

import { BREAKPOINT_MAP } from "../shared/responsive";
import type { BreakpointMap, ResponsiveNumber } from "../shared/responsive";
import sharedSkeletonStyles from "../shared/skeleton/layout.module.css";
import {
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
import { buildStableScopeId } from "../shared/stableScope";
import type { MasonryClassNames } from "./Masonry";
import {
  type MasonryPredictionFlexState,
  buildMasonrySkeletonPrediction,
  resolveActiveFlexStateKey,
} from "./prediction";

export type {
  SkeletonBaseStyle,
  SkeletonBaseStyleResponsive,
  SkeletonContainerStyle,
  SkeletonContainerStyleResponsive,
  SkeletonLength,
  SkeletonShimmer,
} from "../shared/skeleton/layout";
export { resolveActiveFlexStateKey } from "./prediction";

export type MasonryPlacement = "balanced" | "roundRobin";
export type MasonrySkeletonWrapStyle = SkeletonWrapStyle;
export type SkeletonNode = SharedSkeletonNode;
export type MasonrySkeletonSlot = {
  item?: SkeletonNode;
  itemWrapStyle?: MasonrySkeletonWrapStyle;
  ratio?: number;
  heightPx?: number;
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
  placement?: MasonryPlacement;
  estimatedItemHeight?: number;
  spec?: MasonrySkeletonSpec;
  viewportWidth?: number;
};

function buildFlexVariantVisibilityCss(
  scopeId: string,
  states: MasonryPredictionFlexState[]
) {
  const scopeSel = `[data-rmg-mskel-scope="${escapeAttrValue(scopeId)}"]`;
  const lines: string[] = [];

  lines.push(
    `${scopeSel} [data-rmg-mskel-variant]{` +
      `width:100%;` +
      `align-items:flex-start;` +
      `}`
  );

  lines.push(
    `${scopeSel} [data-rmg-mskel-variant][style]{` +
      `column-gap: inherit;` +
      `}`
  );

  lines.push(`${scopeSel} [data-rmg-mskel-variant]{display:none !important;}`);

  const base = states[0];
  if (base) {
    lines.push(
      `${scopeSel} [data-rmg-mskel-variant="${base.key}"]{display:flex !important;}`
    );
  }

  for (const state of states) {
    if (state.minWidth <= 0) continue;
    lines.push(
      `@media (min-width:${state.minWidth}px){` +
        `${scopeSel} [data-rmg-mskel-variant]{display:none !important;}` +
        `${scopeSel} [data-rmg-mskel-variant="${state.key}"]{display:flex !important;}` +
        `}`
    );
  }

  return lines.join("\n");
}

export function MasonrySkeletonCard(props: MasonrySkeletonCardProps) {
  const { count, columns, gap, breakpoints, classNames, ratios, placement, spec, viewportWidth } = props;
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
      placement,
      estimatedItemHeight: props.estimatedItemHeight,
      spec,
    });
  }, [
    count,
    columns,
    gap,
    effectiveBreakpoints,
    ratios,
    props.heightsPx,
    placement,
    props.estimatedItemHeight,
    spec,
  ]);

  const rootStyle: React.CSSProperties = {
    ...(spec?.backgroundColor
      ? ({ ["--rmg-skel-bg" as any]: spec.backgroundColor } as any)
      : null),
    ...(spec?.radius != null
      ? ({ ["--rmg-skel-radius" as any]: cssLen(spec.radius) } as any)
      : null),
    ...(shimmerStyleVars(spec?.shimmer, {
      enabledVarName: "--rmg-skel-card-shimmer-enabled",
    }) as any),
    ...((spec?.shimmer?.c2 ?? spec?.highlightColor) != null
      ? ({ ["--rmg-skel-shimmer-c2" as any]: spec?.shimmer?.c2 ?? spec?.highlightColor } as any)
      : null),
  };

  const prediction = React.useMemo(
    () =>
      buildMasonrySkeletonPrediction({
        count,
        columns,
        gap,
        breakpoints: effectiveBreakpoints,
        ratios,
        heightsPx: props.heightsPx,
        placement,
        estimatedItemHeight: props.estimatedItemHeight,
        spec,
        scopeId,
      }),
    [
      count,
      columns,
      gap,
      effectiveBreakpoints,
      ratios,
      props.heightsPx,
      placement,
      props.estimatedItemHeight,
      spec,
      scopeId,
    ]
  );

  const jsControlled = viewportWidth !== undefined;
  const activeKey = jsControlled
    ? resolveActiveFlexStateKey(prediction.states, viewportWidth)
    : null;

  const visibilityCss = React.useMemo(
    () => jsControlled ? null : buildFlexVariantVisibilityCss(scopeId, prediction.states),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jsControlled, scopeId, prediction.states]
  );

  const structuredLayout = prediction.structuredLayout;

  const variants = React.useMemo(() => {
    return prediction.variants.map((variant) => {
      const cols: React.ReactNode[][] = Array.from(
        { length: variant.state.columns },
        () => []
      );

      for (const item of variant.items) {
        if (!structuredLayout) {
          cols[item.columnIndex]!.push(
            <div
              key={`rmg-mskel-${variant.state.key}-${item.index}`}
              className={[classNames?.item, sharedSkeletonStyles.skelCardShimmer]
                .filter(Boolean)
                .join(" ")}
              style={{
                height: `${item.height}px`,
                marginBottom: `${variant.state.gapPx}px`,
              }}
            />
          );
          continue;
        }

        cols[item.columnIndex]!.push(
          <div
            key={`rmg-mskel-${variant.state.key}-${item.index}`}
            className={[classNames?.item, sharedSkeletonStyles.skelCardShimmer]
              .filter(Boolean)
              .join(" ")}
            style={{
              ...(item.slot?.itemWrapStyle ? wrapStyleVars(item.slot.itemWrapStyle) : null),
              ...(item.slot?.itemWrapStyle ? applyBoxMargins(item.slot.itemWrapStyle) : null),
              width: "100%",
              minHeight: item.heightCssExpr,
              marginBottom: `${variant.state.gapPx}px`,
            }}
          >
            <div style={{ width: "100%" }}>
              <SkeletonLayoutNode
                node={item.slot?.item ?? structuredLayout.item}
                disableShimmer
                breakpointMap={effectiveBreakpoints}
              />
            </div>
          </div>
        );
      }

      return (
        <div
          key={variant.state.key}
          data-rmg-mskel-variant={variant.state.key}
          style={{
            width: "100%",
            display: jsControlled
              ? variant.state.key === activeKey ? "flex" : "none"
              : "flex",
            alignItems: "flex-start",
            columnGap: `${variant.state.gapPx}px`,
          }}
        >
          {cols.map((children, columnIndex) => (
            <div
              key={columnIndex}
              className={classNames?.column}
              style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
            >
              {children}
            </div>
          ))}
        </div>
      );
    });
  }, [
    classNames?.column,
    classNames?.item,
    prediction.variants,
    structuredLayout,
    effectiveBreakpoints,
  ]);

  return (
    <div
      data-rmg-mskel-scope={scopeId}
      data-rmg-skel-node={prediction.structuredNodeId}
      className={[classNames?.root, spec?.className].filter(Boolean).join(" ")}
      style={{
        ...rootStyle,
        ...(prediction.plainStructuredStyle || {}),
        width: "100%",
      }}
    >
      {visibilityCss ? <style dangerouslySetInnerHTML={{ __html: visibilityCss }} /> : null}
      {prediction.responsiveCss ? (
        <style dangerouslySetInnerHTML={{ __html: prediction.responsiveCss }} />
      ) : null}
      {variants}
    </div>
  );
}
