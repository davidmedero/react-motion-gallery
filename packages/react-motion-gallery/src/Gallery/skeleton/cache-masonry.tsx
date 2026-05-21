"use client";

import * as React from "react";

import {
  BREAKPOINT_MAP,
  type BreakpointMap,
} from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import { buildStableScopeId } from "../shared/stableScope";
import { collectSkeletonTextIds, type SkeletonNode } from "../shared/skeleton/layout";
import { buildMasonrySkeletonPrediction } from "../masonry/prediction";
import {
  MasonrySkeletonCore,
  type MasonrySkeletonGeometrySnapshot,
  type MasonrySkeletonProps,
  type MasonrySkeletonSpec,
  type SkeletonMasonryLayout,
} from "./masonry";
import type { SkeletonCacheOptions } from "./cache";
import { validateSkeletonCacheSnapshot } from "./cache";
import {
  resolveSkeletonCacheOptions,
  useSkeletonCacheContext,
  useSkeletonCacheRenderSnapshot,
} from "./cache-context";
import { useSkeletonCacheWriter } from "./cache-writer";

export type CachedMasonrySkeletonProps = MasonrySkeletonProps & {
  cache?: SkeletonCacheOptions;
};

function isMasonryLayoutSpec(
  layout: MasonrySkeletonProps["layout"]
): layout is MasonrySkeletonSpec {
  return (
    !!layout &&
    typeof layout === "object" &&
    !("kind" in layout) &&
    "layout" in layout &&
    (layout as MasonrySkeletonSpec).layout?.kind === "masonry"
  );
}

function isMasonryLayout(
  layout: MasonrySkeletonProps["layout"]
): layout is SkeletonMasonryLayout {
  return !!layout && typeof layout === "object" && "kind" in layout && layout.kind === "masonry";
}

function toMasonrySkeletonSpec(
  layout: SkeletonMasonryLayout | MasonrySkeletonSpec
): MasonrySkeletonSpec {
  if (isMasonryLayoutSpec(layout)) return layout;

  const {
    className,
    backgroundColor,
    radius,
    shimmer,
    columns: _columns,
    gap: _gap,
    ratios: _ratios,
    heightsPx: _heightsPx,
    spans: _spans,
    placement: _placement,
    viewportWidth: _viewportWidth,
    layoutWidthPx: _layoutWidthPx,
    ...masonryLayout
  } = layout;

  return {
    className,
    backgroundColor,
    radius,
    shimmer,
    layout: masonryLayout as MasonrySkeletonSpec["layout"],
  };
}

function getMasonrySkeletonTextRoot(
  layout: MasonrySkeletonProps["layout"]
): SkeletonNode | undefined {
  const spec =
    isMasonryLayout(layout) || isMasonryLayoutSpec(layout)
      ? toMasonrySkeletonSpec(layout)
      : null;
  return spec?.layout as unknown as SkeletonNode | undefined;
}

export function CachedMasonrySkeleton({
  cache,
  ...props
}: CachedMasonrySkeletonProps) {
  const effectiveBreakpoints = React.useMemo<BreakpointMap>(
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
        masonry: props.masonry,
      }),
    [
      props.layout,
      effectiveBreakpoints,
      props.backgroundColor,
      props.radius,
      props.shimmer,
      props.disableShimmer,
      props.masonry,
    ]
  );
  const masonrySpec = React.useMemo(() => {
    if (isMasonryLayout(props.layout) || isMasonryLayoutSpec(props.layout)) {
      return toMasonrySkeletonSpec(props.layout);
    }
    return null;
  }, [props.layout]);
  const masonryLayout = masonrySpec?.layout?.kind === "masonry"
    ? masonrySpec.layout
    : null;
  const masonrySourceLayout = isMasonryLayout(props.layout) ? props.layout : null;
  const masonryRenderOptions = masonrySpec
    ? {
        count:
          props.masonry?.count ??
          (typeof masonryLayout?.count === "number"
            ? Math.max(0, masonryLayout.count | 0)
            : 1),
        columns: props.masonry?.columns ?? masonrySourceLayout?.columns,
        gap: props.masonry?.gap ?? masonrySourceLayout?.gap,
        ratios: props.masonry?.ratios ?? masonrySourceLayout?.ratios,
        heightsPx: props.masonry?.heightsPx ?? masonrySourceLayout?.heightsPx,
        spans: props.masonry?.spans ?? masonrySourceLayout?.spans,
        placement: props.masonry?.placement ?? masonrySourceLayout?.placement,
        viewportWidth:
          props.masonry?.viewportWidth ?? masonrySourceLayout?.viewportWidth,
        layoutWidthPx:
          props.masonry?.layoutWidthPx ?? masonrySourceLayout?.layoutWidthPx,
      }
    : null;
  const cacheContext = useSkeletonCacheContext();
  const effectiveCache = resolveSkeletonCacheOptions(cache, cacheContext);
  const renderCacheSnapshot = useSkeletonCacheRenderSnapshot(effectiveCache);
  const clientViewportWidth = useViewportWidth();
  const textRoot = React.useMemo(
    () => getMasonrySkeletonTextRoot(props.layout),
    [props.layout]
  );
  const textIds = React.useMemo(
    () => textRoot ? Array.from(collectSkeletonTextIds(textRoot, "masonry")) : [],
    [textRoot]
  );
  const validCacheSnapshot = React.useMemo(() => {
    const basic = validateSkeletonCacheSnapshot(renderCacheSnapshot, {
      key: effectiveCache?.key,
      scopeId,
      kind: "masonry",
      routeKey: effectiveCache?.routeKey,
      ttlMs: effectiveCache?.ttlMs,
      viewportWidth: clientViewportWidth || undefined,
      textIds,
      itemCount: masonryRenderOptions?.count,
    });
    if (!basic || !masonrySpec || !masonryRenderOptions) return null;

    const validationPrediction = buildMasonrySkeletonPrediction({
      count: masonryRenderOptions.count,
      columns: masonryRenderOptions.columns,
      gap: masonryRenderOptions.gap,
      breakpoints: effectiveBreakpoints,
      ratios: masonryRenderOptions.ratios,
      heightsPx: masonryRenderOptions.heightsPx,
      spans: masonryRenderOptions.spans,
      placement: masonryRenderOptions.placement,
      spec: masonrySpec,
      scopeId: "__rmg_cache_validate__",
      viewportWidth: basic.viewportWidth,
      layoutWidthPx: basic.layoutWidthPx,
    });

    return validationPrediction.variants.some(
      (variant) =>
        variant.state.key === basic.masonry?.variantKey &&
        variant.state.minWidth === basic.widthBucketMin
    )
      ? basic
      : null;
  }, [
    clientViewportWidth,
    effectiveBreakpoints,
    effectiveCache?.key,
    effectiveCache?.routeKey,
    effectiveCache?.ttlMs,
    masonryRenderOptions,
    masonrySpec,
    renderCacheSnapshot,
    scopeId,
    textIds,
  ]);
  const skeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const geometrySnapshotRef = React.useRef<
    (() => MasonrySkeletonGeometrySnapshot | null) | null
  >(null);
  const getGeometrySnapshot = React.useCallback(
    () => geometrySnapshotRef.current?.() ?? null,
    []
  );

  useSkeletonCacheWriter({
    cache: effectiveCache,
    kind: "masonry",
    scopeId,
    textIds,
    skeletonRootRef,
    shellRef,
    getGeometrySnapshot,
  });

  return (
    <MasonrySkeletonCore
      {...props}
      cacheSnapshot={validCacheSnapshot}
      scopeId={scopeId}
      skeletonRootRef={skeletonRootRef}
      shellRef={shellRef}
      geometrySnapshotRef={geometrySnapshotRef}
    />
  );
}

export default CachedMasonrySkeleton;

