"use client";

import * as React from "react";

import {
  BREAKPOINT_MAP,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsive";
import {
  cssLen,
  shimmerStyleVars,
  type SkeletonLength,
  type SkeletonNode,
  type SkeletonShimmer,
} from "../shared/skeleton/layout";
import { buildStableScopeId } from "../shared/stableScope";
import type { ResponsiveGridSpan, ResponsiveGridTemplate } from "../grid/types";
import {
  GridSkeletonCard,
  type GridSkeletonCardProps,
  type GridSkeletonLayoutNode,
  type GridSkeletonSpec,
} from "./GridSkeleton";
import {
  SkeletonFrame,
  type SkeletonForceOptions,
  type SkeletonTimingOptions,
} from "./base";
import type { SkeletonCacheSnapshot } from "./cache";

export type SkeletonGridOptions = {
  count?: number;
  style?: React.CSSProperties;
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  items?: Array<{
    id: string;
    span?: ResponsiveGridSpan;
  }>;
  allowItemSpans?: boolean;
};

export type SkeletonGridLayout = GridSkeletonLayoutNode & {
  className?: string;
  backgroundColor?: string;
  radius?: SkeletonLength;
  shimmer?: SkeletonShimmer;
  gridStyle?: React.CSSProperties;
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  items?: SkeletonGridOptions["items"];
  allowItemSpans?: boolean;
};

export type GridSkeletonProps = {
  layout: SkeletonGridLayout | GridSkeletonSpec;
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
  className?: string;
  style?: React.CSSProperties;
  shellClassName?: string;
  shellStyle?: React.CSSProperties;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  backgroundColor?: string;
  radius?: SkeletonLength;
  shimmer?: SkeletonShimmer;
  disableShimmer?: boolean;
  ariaLabel?: string;
  ready?: boolean;
  enabled?: boolean;
  force?: SkeletonForceOptions;
  timing?: SkeletonTimingOptions;
  grid?: SkeletonGridOptions;
};

export type GridSkeletonCoreProps = GridSkeletonProps & {
  cacheSnapshot?: SkeletonCacheSnapshot | null;
  scopeId?: string;
  skeletonRootRef?: React.RefObject<HTMLDivElement | null>;
  shellRef?: React.Ref<HTMLDivElement>;
};

function isGridLayoutSpec(
  layout: GridSkeletonProps["layout"]
): layout is GridSkeletonSpec {
  return (
    !!layout &&
    typeof layout === "object" &&
    !("kind" in layout) &&
    "layout" in layout &&
    (layout as GridSkeletonSpec).layout?.kind === "grid"
  );
}

function isGridLayout(
  layout: GridSkeletonProps["layout"]
): layout is SkeletonGridLayout {
  return !!layout && typeof layout === "object" && "kind" in layout && layout.kind === "grid";
}

function toGridSkeletonSpec(
  layout: SkeletonGridLayout | GridSkeletonSpec
): GridSkeletonSpec {
  if (isGridLayoutSpec(layout)) return layout;

  const {
    className,
    backgroundColor,
    radius,
    shimmer,
    gridStyle: _gridStyle,
    columns: _columns,
    templateColumns: _templateColumns,
    minColumnWidth: _minColumnWidth,
    gap: _gap,
    items: _items,
    allowItemSpans: _allowItemSpans,
    ...gridLayout
  } = layout;

  return {
    className,
    backgroundColor,
    radius,
    shimmer,
    layout: gridLayout as GridSkeletonLayoutNode,
  };
}

export function GridSkeletonCore({
  layout,
  children,
  breakpoints,
  className,
  style,
  shellClassName,
  shellStyle,
  contentClassName,
  contentStyle,
  backgroundColor,
  radius,
  shimmer,
  disableShimmer,
  ariaLabel,
  ready,
  enabled,
  force,
  timing,
  grid,
  cacheSnapshot,
  scopeId: providedScopeId,
  skeletonRootRef: providedSkeletonRootRef,
  shellRef: providedShellRef,
}: GridSkeletonCoreProps) {
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints]
  );
  const generatedScopeId = React.useMemo(
    () =>
      buildStableScopeId("skel_", {
        layout,
        breakpoints: effectiveBreakpoints,
        backgroundColor,
        radius,
        shimmer,
        disableShimmer,
        grid,
      }),
    [
      layout,
      effectiveBreakpoints,
      backgroundColor,
      radius,
      shimmer,
      disableShimmer,
      grid,
    ]
  );
  const scopeId = providedScopeId ?? generatedScopeId;
  const gridSpec = React.useMemo(() => {
    if (isGridLayout(layout) || isGridLayoutSpec(layout)) {
      return toGridSkeletonSpec(layout);
    }
    return null;
  }, [layout]);
  const localSkeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const skeletonRootRef = providedSkeletonRootRef ?? localSkeletonRootRef;
  const gridLayout = gridSpec?.layout?.kind === "grid"
    ? (gridSpec.layout as GridSkeletonLayoutNode)
    : null;
  const gridSourceLayout = isGridLayout(layout) ? layout : null;
  const gridRenderOptions: Omit<GridSkeletonCardProps, "breakpoints" | "spec"> | null =
    gridSpec
      ? {
          count:
            grid?.count ??
            (typeof gridLayout?.count === "number"
              ? Math.max(0, gridLayout.count | 0)
              : 1),
          gridStyle: grid?.style ?? gridSourceLayout?.gridStyle,
          columns: grid?.columns ?? gridSourceLayout?.columns,
          templateColumns: grid?.templateColumns ?? gridSourceLayout?.templateColumns,
          minColumnWidth: grid?.minColumnWidth ?? gridSourceLayout?.minColumnWidth,
          gap: grid?.gap ?? gridSourceLayout?.gap,
          items: grid?.items ?? gridSourceLayout?.items,
          allowItemSpans: grid?.allowItemSpans ?? gridSourceLayout?.allowItemSpans,
          disableShimmer,
        }
      : null;
  const rootStyle: React.CSSProperties = {
    ...style,
    ...(backgroundColor
      ? ({ ["--rmg-skel-bg" as any]: backgroundColor } as React.CSSProperties)
      : null),
    ...(radius != null
      ? ({ ["--rmg-skel-radius" as any]: cssLen(radius) } as React.CSSProperties)
      : null),
    ...(disableShimmer ? null : (shimmerStyleVars(shimmer) as React.CSSProperties)),
  };
  const gridSkeletonNode =
    gridSpec && gridRenderOptions ? (
      <div
        data-rmg-skeleton-scope={scopeId}
        ref={skeletonRootRef}
        className={className}
        style={rootStyle}
        aria-hidden={ariaLabel ? undefined : true}
        aria-label={ariaLabel}
        role={ariaLabel ? "status" : undefined}
        aria-live={ariaLabel ? "polite" : undefined}
      >
        <GridSkeletonCard
          {...gridRenderOptions}
          spec={gridSpec}
          breakpoints={effectiveBreakpoints}
          cacheSnapshot={cacheSnapshot}
        />
      </div>
    ) : null;

  if (!gridSkeletonNode) return null;

  return (
    <SkeletonFrame
      skeletonNode={gridSkeletonNode}
      ready={ready}
      enabled={enabled}
      force={force}
      timing={timing}
      shellClassName={shellClassName}
      shellStyle={shellStyle}
      contentClassName={contentClassName}
      contentStyle={contentStyle}
      contentOwnsWrapperLayout={children !== undefined}
      shellRef={providedShellRef}
    >
      {children}
    </SkeletonFrame>
  );
}

export function GridSkeleton(props: GridSkeletonProps) {
  return <GridSkeletonCore {...props} />;
}

export default GridSkeleton;

export type {
  GridSkeletonNode,
  GridSkeletonSlot,
  GridSkeletonSpec,
} from "./GridSkeleton";

export type { SkeletonNode };
