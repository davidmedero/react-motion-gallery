import * as React from "react";

import { BREAKPOINT_MAP, type BreakpointMap } from "../shared/responsive";
import styles from "./Grid.module.css";
import sharedSkeletonStyles from "../shared/skeleton/layout.module.css";
import {
  type SkeletonBaseStyle,
  type SkeletonBaseStyleResponsive,
  type SkeletonContainerStyle,
  type SkeletonContainerStyleResponsive,
  type SkeletonLayoutRoot,
  type SkeletonLength,
  type SkeletonNode as SharedSkeletonNode,
  type SkeletonResponsiveCssEntry,
  type SkeletonShimmer,
  type SkeletonWrapStyle,
  SkeletonLayoutNode,
  applyBoxMargins,
  buildResponsiveCssText,
  collectResponsiveCss,
  containerStylesPlain,
  cssLen,
  resolveInlineResponsiveContainerStyle,
  shimmerStyleVars,
  wrapStyleVars,
} from "../shared/skeleton/layout";
import { buildStableScopeId } from "../shared/stableScope";
import { resolveInlineGridItemSpanStyle } from "./item";
import type { ResponsiveGridSpan } from "./types";

export type {
  SkeletonBaseStyle,
  SkeletonBaseStyleResponsive,
  SkeletonContainerStyle,
  SkeletonContainerStyleResponsive,
  SkeletonLength,
  SkeletonShimmer,
} from "../shared/skeleton/layout";

export type GridSkeletonWrapStyle = SkeletonWrapStyle;
export type SkeletonNode = SharedSkeletonNode;
export type GridSkeletonSlot = {
  item?: SkeletonNode;
  itemWrapStyle?: GridSkeletonWrapStyle;
};
export type GridSkeletonLayoutNode = SkeletonLayoutRoot<"grid"> & {
  slots?: GridSkeletonSlot[];
};
export type GridSkeletonNode = GridSkeletonLayoutNode | SharedSkeletonNode;

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
  breakpoints?: BreakpointMap;
  items?: Array<{
    id: string;
    span?: ResponsiveGridSpan;
  }>;
  allowItemSpans?: boolean;
};

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

function mergeWrapStyles(
  base: GridSkeletonWrapStyle | undefined,
  override: GridSkeletonWrapStyle | undefined
): GridSkeletonWrapStyle | undefined {
  if (!base && !override) return undefined;
  return {
    ...(base || {}),
    ...(override || {}),
  };
}

function resolveGridSlot(
  grid: GridSkeletonLayoutNode,
  slotIndex: number
): { item: SkeletonNode; itemWrapStyle: GridSkeletonWrapStyle | undefined } {
  const slot = grid.slots?.[slotIndex];
  return {
    item: slot?.item ?? grid.item,
    itemWrapStyle: mergeWrapStyles(grid.itemWrapStyle, slot?.itemWrapStyle),
  };
}

export function GridSkeletonCard({
  count,
  gridStyle,
  spec,
  breakpoints,
  items,
  allowItemSpans,
}: GridSkeletonCardProps) {
  const s = spec ?? defaultGridSpec();
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints]
  );

  const layoutIn: GridSkeletonNode =
    s.layout ?? (defaultGridSpec().layout as GridSkeletonNode);
  const scopeId = React.useMemo(() => {
    return buildStableScopeId("gskel_", {
      count,
      breakpoints: effectiveBreakpoints,
      gridStyle,
      spec,
    });
  }, [count, effectiveBreakpoints, gridStyle, spec]);

  const rootStyle: React.CSSProperties = {
    ...(gridStyle || {}),
    ...shimmerStyleVars(s.shimmer, {
      enabledVarName: "--rmg-skel-card-shimmer-enabled",
    }),
  };

  if (s.backgroundColor) (rootStyle as any)["--rmg-skel-bg"] = s.backgroundColor;
  if (s.radius != null) (rootStyle as any)["--rmg-skel-radius"] = cssLen(s.radius);

  const { layout, responsiveCss } = React.useMemo(() => {
    let n = 0;
    const allocId = () => `n${++n}`;
    const collected: SkeletonResponsiveCssEntry[] = [];

    const withIds = collectResponsiveCss(
      layoutIn,
      allocId,
      collected,
      "grid",
      effectiveBreakpoints
    );
    const cssText = buildResponsiveCssText({
      scopeAttr: "data-rmg-grid-skel-scope",
      scopeId,
      rules: collected,
    });

    return { layout: withIds, responsiveCss: cssText };
  }, [layoutIn, scopeId, effectiveBreakpoints]);

  const gridNode = layout as GridSkeletonLayoutNode;
  const gridNodeId = (gridNode as any).__rmgNodeId as string | undefined;
  const plainGridStyle = containerStylesPlain(
    resolveInlineResponsiveContainerStyle(
      gridNode.style,
      effectiveBreakpoints
    )
  );
  const cellCount =
    gridNode.count != null ? Math.max(0, gridNode.count | 0) : Math.max(0, count | 0);
  const itemLayouts = items ?? [];

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
        {Array.from({ length: cellCount }).map((_, index) => {
          const itemLayout = itemLayouts[index];
          const { item, itemWrapStyle } = resolveGridSlot(gridNode, index);

          return (
            <div
              key={`rmg-grid-skel-${index}`}
              data-rmg-grid-item-key={itemLayout?.id}
              className={[styles.gridSkeletonItem, sharedSkeletonStyles.skelCardShimmer]
                .filter(Boolean)
                .join(" ")}
              style={{
                ...(resolveInlineGridItemSpanStyle({
                  span: itemLayout?.span,
                  allowSpan: !!allowItemSpans,
                }) || {}),
                ...(itemWrapStyle ? wrapStyleVars(itemWrapStyle) : null),
                ...(itemWrapStyle ? applyBoxMargins(itemWrapStyle) : null),
              }}
            >
              <SkeletonLayoutNode
                node={item}
                disableShimmer
                breakpointMap={effectiveBreakpoints}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
