"use client";

import * as React from "react";

import { BREAKPOINT_MAP } from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import { buildStableScopeId } from "../shared/stableScope";
import { collectSliderSkeletonTextIds } from "../slider/SliderSkeleton";
import {
  SliderSkeletonCore,
  type SliderSkeletonProps,
} from "./slider-core";
import type { SkeletonCacheOptions } from "./cache";
import { validateSkeletonCacheSnapshot } from "./cache";
import {
  resolveSkeletonCacheOptions,
  useSkeletonCacheContext,
  useSkeletonCacheRenderSnapshot,
} from "./cache-context";
import { useSkeletonCacheWriter } from "./cache-writer";

export type CachedSliderSkeletonProps = SliderSkeletonProps & {
  cache?: SkeletonCacheOptions;
};

function getSliderSpecLayout(layout: SliderSkeletonProps["layout"]) {
  if (!layout || typeof layout !== "object") return undefined;
  if ("kind" in layout && layout.kind === "slider") return layout;
  if (!("kind" in layout) && "layout" in layout) return layout.layout;
  return undefined;
}

export function CachedSliderSkeleton({
  cache,
  ...props
}: CachedSliderSkeletonProps) {
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
  const textRoot = React.useMemo(
    () => getSliderSpecLayout(props.layout),
    [props.layout]
  );
  const textIds = React.useMemo(
    () => Array.from(collectSliderSkeletonTextIds(textRoot)),
    [textRoot]
  );
  const validCacheSnapshot = validateSkeletonCacheSnapshot(renderCacheSnapshot, {
    key: effectiveCache?.key,
    scopeId,
    kind: "slider",
    routeKey: effectiveCache?.routeKey,
    ttlMs: effectiveCache?.ttlMs,
    viewportWidth: clientViewportWidth || undefined,
    textIds,
  });
  const skeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  useSkeletonCacheWriter({
    cache: effectiveCache,
    kind: "slider",
    scopeId,
    textIds: props.ready === true ? textIds : [],
    skeletonRootRef,
    shellRef,
  });

  return (
    <SliderSkeletonCore
      {...props}
      cacheSnapshot={validCacheSnapshot}
      scopeId={scopeId}
      skeletonRootRef={skeletonRootRef}
      shellRef={shellRef}
    />
  );
}

export default CachedSliderSkeleton;

