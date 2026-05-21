"use client";

import * as React from "react";

import { BREAKPOINT_MAP } from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import { buildStableScopeId } from "../shared/stableScope";
import { collectSkeletonTextIds } from "../shared/skeleton/layout";
import {
  SkeletonCore,
  type SkeletonProps,
} from "./base";
import type { SkeletonCacheOptions } from "./cache";
import { validateSkeletonCacheSnapshot } from "./cache";
import {
  resolveSkeletonCacheOptions,
  useSkeletonCacheContext,
  useSkeletonCacheRenderSnapshot,
} from "./cache-context";
import { useSkeletonCacheWriter } from "./cache-writer";

export type CachedSkeletonProps = SkeletonProps & {
  cache?: SkeletonCacheOptions;
};

export function CachedSkeleton({
  cache,
  ...props
}: CachedSkeletonProps) {
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
      }),
    [
      props.layout,
      effectiveBreakpoints,
      props.backgroundColor,
      props.radius,
      props.shimmer,
      props.disableShimmer,
    ]
  );
  const cacheContext = useSkeletonCacheContext();
  const effectiveCache = resolveSkeletonCacheOptions(cache, cacheContext);
  const renderCacheSnapshot = useSkeletonCacheRenderSnapshot(effectiveCache);
  const clientViewportWidth = useViewportWidth();
  const textIds = React.useMemo(
    () => Array.from(collectSkeletonTextIds(props.layout, "__standalone__")),
    [props.layout]
  );
  const validCacheSnapshot = validateSkeletonCacheSnapshot(renderCacheSnapshot, {
    key: effectiveCache?.key,
    scopeId,
    kind: "skeleton",
    routeKey: effectiveCache?.routeKey,
    ttlMs: effectiveCache?.ttlMs,
    viewportWidth: clientViewportWidth || undefined,
    textIds,
  });
  const skeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  useSkeletonCacheWriter({
    cache: effectiveCache,
    kind: "skeleton",
    scopeId,
    textIds,
    skeletonRootRef,
    shellRef,
  });

  return (
    <SkeletonCore
      {...props}
      cacheSnapshot={validCacheSnapshot}
      scopeId={scopeId}
      skeletonRootRef={skeletonRootRef}
      shellRef={shellRef}
    />
  );
}

export default CachedSkeleton;

