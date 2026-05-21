"use client";

import * as React from "react";

import { BREAKPOINT_MAP } from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import { buildStableScopeId } from "../shared/stableScope";
import { collectSkeletonTextIds, type SkeletonNode } from "../shared/skeleton/layout";
import {
  GridSkeletonCore,
  type GridSkeletonProps,
  type GridSkeletonSpec,
  type SkeletonGridLayout,
} from "./grid";
import type { SkeletonCacheOptions } from "./cache";
import { validateSkeletonCacheSnapshot } from "./cache";
import {
  resolveSkeletonCacheOptions,
  useSkeletonCacheContext,
  useSkeletonCacheRenderSnapshot,
} from "./cache-context";
import { useSkeletonCacheWriter } from "./cache-writer";

export type CachedGridSkeletonProps = GridSkeletonProps & {
  cache?: SkeletonCacheOptions;
};

function getGridSkeletonTextRoot(
  layout: GridSkeletonProps["layout"]
): SkeletonNode | undefined {
  if (!layout || typeof layout !== "object") return undefined;
  if ("kind" in layout && layout.kind === "grid") {
    return layout as unknown as SkeletonNode;
  }
  if (!("kind" in layout) && "layout" in layout) {
    return (layout as GridSkeletonSpec).layout as unknown as SkeletonNode | undefined;
  }
  return undefined;
}

export function CachedGridSkeleton({
  cache,
  ...props
}: CachedGridSkeletonProps) {
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(props.breakpoints ?? {}) }),
    [props.breakpoints]
  );
  const scopeId = React.useMemo(
    () =>
      buildStableScopeId("skel_", {
        layout: props.layout,
        breakpoints: effectiveBreakpoints,
        backgroundColor: props.backgroundColor,
        radius: props.radius,
        shimmer: props.shimmer,
        disableShimmer: props.disableShimmer,
        grid: props.grid,
      }),
    [
      props.layout,
      effectiveBreakpoints,
      props.backgroundColor,
      props.radius,
      props.shimmer,
      props.disableShimmer,
      props.grid,
    ]
  );
  const cacheContext = useSkeletonCacheContext();
  const effectiveCache = resolveSkeletonCacheOptions(cache, cacheContext);
  const renderCacheSnapshot = useSkeletonCacheRenderSnapshot(effectiveCache);
  const clientViewportWidth = useViewportWidth();
  const textRoot = React.useMemo(
    () => getGridSkeletonTextRoot(props.layout),
    [props.layout]
  );
  const textIds = React.useMemo(
    () => textRoot ? Array.from(collectSkeletonTextIds(textRoot, "grid")) : [],
    [textRoot]
  );
  const validCacheSnapshot = validateSkeletonCacheSnapshot(renderCacheSnapshot, {
    key: effectiveCache?.key,
    scopeId,
    kind: "grid",
    routeKey: effectiveCache?.routeKey,
    ttlMs: effectiveCache?.ttlMs,
    viewportWidth: clientViewportWidth || undefined,
    textIds,
  });
  const skeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  useSkeletonCacheWriter({
    cache: effectiveCache,
    kind: "grid",
    scopeId,
    textIds,
    skeletonRootRef,
    shellRef,
  });

  return (
    <GridSkeletonCore
      {...props}
      cacheSnapshot={validCacheSnapshot}
      scopeId={scopeId}
      skeletonRootRef={skeletonRootRef}
      shellRef={shellRef}
    />
  );
}

export default CachedGridSkeleton;

export type { SkeletonGridLayout };

