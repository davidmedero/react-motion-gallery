"use client";

import * as React from "react";

import {
  BREAKPOINT_MAP,
  DEFAULT_SERVER_VIEWPORT_WIDTH,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsive";
import {
  applySkeletonTextSnapshot,
  cssLen,
  shimmerStyleVars,
  type SkeletonLength,
  type SkeletonNode,
  type SkeletonShimmer,
} from "../shared/skeleton/layout";
import { buildStableScopeId } from "../shared/stableScope";
import { MasonryLayoutSeedProvider } from "../masonry/MasonryLayoutSeedContext";
import {
  buildMasonryFirstPaintLayoutCss,
  buildMasonryShellReserveCss,
  buildMasonrySkeletonPrediction,
  resolveActiveMasonryPredictionVariant,
} from "../masonry/prediction";
import type { ResponsiveMasonrySpan } from "../masonry/types";
import {
  MasonrySkeletonCard,
  type MasonryPlacement,
  type MasonrySkeletonCardProps,
  type MasonrySkeletonLayoutNode,
  type MasonrySkeletonSpec,
} from "./MasonrySkeleton";
import {
  SkeletonFrame,
  type SkeletonForceOptions,
  type SkeletonTimingOptions,
} from "./base";
import type { SkeletonCacheSnapshot } from "./cache";

export type SkeletonMasonryOptions = {
  count?: number;
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  ratios?: number[];
  heightsPx?: number[];
  spans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
  placement?: MasonryPlacement;
  viewportWidth?: number;
  layoutWidthPx?: number;
};

export type SkeletonMasonryLayout = MasonrySkeletonLayoutNode & {
  className?: string;
  backgroundColor?: string;
  radius?: SkeletonLength;
  shimmer?: SkeletonShimmer;
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  ratios?: number[];
  heightsPx?: number[];
  spans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
  placement?: MasonryPlacement;
  viewportWidth?: number;
  layoutWidthPx?: number;
};

export type MasonrySkeletonProps = {
  layout: SkeletonMasonryLayout | MasonrySkeletonSpec;
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
  masonry?: SkeletonMasonryOptions;
};

export type MasonrySkeletonGeometrySnapshot = {
  widthBucketMin: number;
  viewportWidth?: number;
  layoutWidthPx?: number;
  masonry?: {
    variantKey: string;
    shellHeightPx?: number;
    itemHeightsPx?: number[];
  };
};

export type MasonrySkeletonCoreProps = MasonrySkeletonProps & {
  cacheSnapshot?: SkeletonCacheSnapshot | null;
  scopeId?: string;
  skeletonRootRef?: React.RefObject<HTMLDivElement | null>;
  shellRef?: React.RefObject<HTMLDivElement | null>;
  geometrySnapshotRef?: React.MutableRefObject<
    (() => MasonrySkeletonGeometrySnapshot | null) | null
  >;
};

function isMasonryLayoutSpec(
  layout: MasonrySkeletonProps["layout"],
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
  layout: MasonrySkeletonProps["layout"],
): layout is SkeletonMasonryLayout {
  return (
    !!layout &&
    typeof layout === "object" &&
    "kind" in layout &&
    layout.kind === "masonry"
  );
}

function toMasonrySkeletonSpec(
  layout: SkeletonMasonryLayout | MasonrySkeletonSpec,
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
    layout: masonryLayout as MasonrySkeletonLayoutNode,
  };
}

function roundPx(value: number) {
  return Math.round(value * 1000) / 1000;
}

function getVisibleElement<T extends HTMLElement>(nodes: NodeListOf<T> | T[]) {
  for (const node of Array.from(nodes)) {
    const style = window.getComputedStyle(node);
    if (style.display !== "none" && style.visibility !== "hidden") {
      return node;
    }
  }
  return null;
}

function readIndexedHeights(root: ParentNode, selector: string) {
  const byIndex = new Map<number, number>();
  root.querySelectorAll<HTMLElement>(selector).forEach((node) => {
    const index = Number(
      node.getAttribute("data-rmg-mskel-index") ??
        node.getAttribute("data-rmg-idx"),
    );
    if (!Number.isInteger(index) || index < 0) return;
    byIndex.set(index, roundPx(node.getBoundingClientRect().height));
  });
  return Array.from(byIndex.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, height]) => height);
}

export function MasonrySkeletonCore({
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
  masonry,
  cacheSnapshot,
  scopeId: providedScopeId,
  skeletonRootRef: providedSkeletonRootRef,
  shellRef: providedShellRef,
  geometrySnapshotRef,
}: MasonrySkeletonCoreProps) {
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints],
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
        masonry,
      }),
    [
      layout,
      effectiveBreakpoints,
      backgroundColor,
      radius,
      shimmer,
      disableShimmer,
      masonry,
    ],
  );
  const scopeId = providedScopeId ?? generatedScopeId;
  const masonrySpec = React.useMemo(() => {
    if (isMasonryLayout(layout) || isMasonryLayoutSpec(layout)) {
      return toMasonrySkeletonSpec(layout);
    }
    return null;
  }, [layout]);
  const masonryLayout =
    masonrySpec?.layout?.kind === "masonry"
      ? (masonrySpec.layout as MasonrySkeletonLayoutNode)
      : null;
  const masonrySourceLayout = isMasonryLayout(layout) ? layout : null;
  const localSkeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const localShellRef = React.useRef<HTMLDivElement | null>(null);
  const skeletonRootRef = providedSkeletonRootRef ?? localSkeletonRootRef;
  const shellRef = providedShellRef ?? localShellRef;
  const explicitLayoutWidthPx =
    masonry?.layoutWidthPx ?? masonrySourceLayout?.layoutWidthPx;
  const [measuredLayoutWidthPx, setMeasuredLayoutWidthPx] = React.useState<
    number | undefined
  >(undefined);
  const effectiveLayoutWidthPx = explicitLayoutWidthPx ?? measuredLayoutWidthPx;
  const wrappedLoading = children !== undefined;
  const visualStabilityRef = React.useRef<{
    key: string;
    layoutWidthPx?: number;
    cacheSnapshot: SkeletonCacheSnapshot | null;
  } | null>(null);
  if (wrappedLoading) {
    if (visualStabilityRef.current?.key !== scopeId) {
      visualStabilityRef.current = {
        key: scopeId,
        layoutWidthPx: effectiveLayoutWidthPx,
        cacheSnapshot: cacheSnapshot ?? null,
      };
    }
  } else if (visualStabilityRef.current !== null) {
    visualStabilityRef.current = null;
  }
  const stableLayoutWidthPx = wrappedLoading
    ? visualStabilityRef.current?.layoutWidthPx
    : effectiveLayoutWidthPx;
  const stableCacheSnapshot = wrappedLoading
    ? (visualStabilityRef.current?.cacheSnapshot ?? null)
    : (cacheSnapshot ?? null);

  React.useLayoutEffect(() => {
    if (explicitLayoutWidthPx !== undefined) {
      setMeasuredLayoutWidthPx((prev) =>
        prev === undefined ? prev : undefined,
      );
      return;
    }

    const node = skeletonRootRef.current;
    if (!node) return;

    const commitWidth = (rawWidth: number | undefined) => {
      const width = Number(rawWidth);
      if (!Number.isFinite(width) || width <= 0) return;

      setMeasuredLayoutWidthPx((prev) =>
        prev != null && Math.abs(prev - width) < 0.5 ? prev : width,
      );
    };

    const readWidth = () => {
      commitWidth(node.getBoundingClientRect().width);
    };

    readWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        commitWidth(entry?.contentRect.width);
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", readWidth);
    return () => window.removeEventListener("resize", readWidth);
  }, [explicitLayoutWidthPx]);

  const masonryRenderOptions: Omit<
    MasonrySkeletonCardProps,
    "breakpoints" | "spec"
  > | null = masonrySpec
    ? {
        count:
          masonry?.count ??
          (typeof masonryLayout?.count === "number"
            ? Math.max(0, masonryLayout.count | 0)
            : 1),
        columns: masonry?.columns ?? masonrySourceLayout?.columns,
        gap: masonry?.gap ?? masonrySourceLayout?.gap,
        ratios: masonry?.ratios ?? masonrySourceLayout?.ratios,
        heightsPx: masonry?.heightsPx ?? masonrySourceLayout?.heightsPx,
        spans: masonry?.spans ?? masonrySourceLayout?.spans,
        placement: masonry?.placement ?? masonrySourceLayout?.placement,
        viewportWidth:
          masonry?.viewportWidth ?? masonrySourceLayout?.viewportWidth,
        layoutWidthPx: stableLayoutWidthPx,
        disableShimmer,
      }
    : null;
  const validCacheSnapshot = stableCacheSnapshot;
  const effectiveMasonrySpec = React.useMemo(() => {
    if (!validCacheSnapshot?.text || !masonrySpec) return masonrySpec;

    return {
      ...masonrySpec,
      layout: masonrySpec.layout
        ? applySkeletonTextSnapshot(
            masonrySpec.layout,
            validCacheSnapshot.text,
            "masonry",
            effectiveBreakpoints,
          )
        : masonrySpec.layout,
    } as MasonrySkeletonSpec;
  }, [effectiveBreakpoints, masonrySpec, validCacheSnapshot]);
  const effectiveMasonryRenderOptions = React.useMemo(() => {
    if (!masonryRenderOptions) return null;
    if (!validCacheSnapshot) return masonryRenderOptions;

    return {
      ...masonryRenderOptions,
      viewportWidth: validCacheSnapshot.viewportWidth,
      layoutWidthPx:
        validCacheSnapshot.layoutWidthPx ?? masonryRenderOptions.layoutWidthPx,
    };
  }, [masonryRenderOptions, validCacheSnapshot]);
  const masonryLayoutSeed = React.useMemo(() => {
    if (!effectiveMasonrySpec || !effectiveMasonryRenderOptions) return null;

    const seedScopeId = buildStableScopeId("mseed_", {
      scopeId,
      breakpoints: effectiveBreakpoints,
      masonry: effectiveMasonryRenderOptions,
      spec: effectiveMasonrySpec,
    });
    const prediction = buildMasonrySkeletonPrediction({
      count: effectiveMasonryRenderOptions.count,
      columns: effectiveMasonryRenderOptions.columns,
      gap: effectiveMasonryRenderOptions.gap,
      breakpoints: effectiveBreakpoints,
      ratios: effectiveMasonryRenderOptions.ratios,
      heightsPx: effectiveMasonryRenderOptions.heightsPx,
      spans: effectiveMasonryRenderOptions.spans,
      placement: effectiveMasonryRenderOptions.placement,
      spec: effectiveMasonrySpec,
      scopeId: seedScopeId,
      respectLayoutCount: false,
      viewportWidth: effectiveMasonryRenderOptions.viewportWidth,
      layoutWidthPx: effectiveMasonryRenderOptions.layoutWidthPx,
    });
    const activeVariant = resolveActiveMasonryPredictionVariant(
      prediction.variants,
      effectiveMasonryRenderOptions.viewportWidth ??
        DEFAULT_SERVER_VIEWPORT_WIDTH,
    );
    const compactPrediction =
      validCacheSnapshot && activeVariant
        ? {
            ...prediction,
            states: [activeVariant.state],
            variants: [activeVariant],
          }
        : prediction;

    return {
      scopeId: seedScopeId,
      prediction,
      initialHeights: activeVariant?.items.map((item) => item.height),
      activeVariantKey: activeVariant?.state.key,
      activeWidthBucketMin: activeVariant?.state.minWidth,
      responsiveCss: buildMasonryFirstPaintLayoutCss({
        scopeId: seedScopeId,
        prediction: compactPrediction,
      }),
      shellReserveCss: buildMasonryShellReserveCss({
        scopeId: seedScopeId,
        prediction: compactPrediction,
      }),
    };
  }, [
    effectiveBreakpoints,
    effectiveMasonryRenderOptions?.columns,
    effectiveMasonryRenderOptions?.count,
    effectiveMasonryRenderOptions?.disableShimmer,
    effectiveMasonryRenderOptions?.gap,
    effectiveMasonryRenderOptions?.heightsPx,
    effectiveMasonryRenderOptions?.layoutWidthPx,
    effectiveMasonryRenderOptions?.placement,
    effectiveMasonryRenderOptions?.ratios,
    effectiveMasonryRenderOptions?.spans,
    effectiveMasonryRenderOptions?.viewportWidth,
    effectiveMasonrySpec,
    scopeId,
    validCacheSnapshot,
  ]);
  const getCacheGeometrySnapshot = React.useCallback(() => {
    const viewportWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      DEFAULT_SERVER_VIEWPORT_WIDTH;
    const prediction = masonryLayoutSeed?.prediction;
    const activeVariant = prediction
      ? resolveActiveMasonryPredictionVariant(
          prediction.variants,
          viewportWidth,
        )
      : null;
    const skeletonRoot = skeletonRootRef.current;
    const shell = shellRef.current;
    const visibleVariant = skeletonRoot
      ? getVisibleElement(
          skeletonRoot.querySelectorAll<HTMLElement>(
            "[data-rmg-mskel-variant]",
          ),
        )
      : null;
    const contentMasonryRoot =
      shell?.querySelector<HTMLElement>("[data-rmg-masonry-layout-seed]") ??
      null;
    const layoutRect =
      contentMasonryRoot?.getBoundingClientRect() ??
      skeletonRoot?.getBoundingClientRect() ??
      null;
    const shellHeightPx =
      visibleVariant?.getBoundingClientRect().height ??
      contentMasonryRoot?.getBoundingClientRect().height ??
      (activeVariant
        ? Math.max(
            0,
            ...activeVariant.items.map((item) => item.top + item.height),
          )
        : undefined);
    const itemHeightsPx = visibleVariant
      ? readIndexedHeights(visibleVariant, "[data-rmg-mskel-index]")
      : contentMasonryRoot
        ? readIndexedHeights(contentMasonryRoot, "[data-rmg-idx]")
        : activeVariant?.items.map((item) => roundPx(item.height));
    const variantKey =
      visibleVariant?.getAttribute("data-rmg-mskel-variant") ??
      activeVariant?.state.key;

    if (!variantKey || !activeVariant) return null;

    return {
      widthBucketMin: activeVariant.state.minWidth,
      viewportWidth,
      ...(layoutRect?.width
        ? { layoutWidthPx: roundPx(layoutRect.width) }
        : null),
      masonry: {
        variantKey,
        ...(shellHeightPx != null && Number.isFinite(shellHeightPx)
          ? { shellHeightPx: roundPx(shellHeightPx) }
          : null),
        ...(itemHeightsPx?.length ? { itemHeightsPx } : null),
      },
    };
  }, [masonryLayoutSeed]);
  if (geometrySnapshotRef) {
    geometrySnapshotRef.current = getCacheGeometrySnapshot;
  }
  const rootStyle: React.CSSProperties = {
    ...style,
    ...(backgroundColor
      ? ({ ["--rmg-skel-bg" as any]: backgroundColor } as React.CSSProperties)
      : null),
    ...(radius != null
      ? ({
          ["--rmg-skel-radius" as any]: cssLen(radius),
        } as React.CSSProperties)
      : null),
    ...(disableShimmer
      ? null
      : (shimmerStyleVars(shimmer) as React.CSSProperties)),
  };
  const masonrySkeletonNode =
    effectiveMasonrySpec && effectiveMasonryRenderOptions ? (
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
        <MasonrySkeletonCard
          {...effectiveMasonryRenderOptions}
          spec={effectiveMasonrySpec}
          breakpoints={effectiveBreakpoints}
          cacheSnapshot={validCacheSnapshot}
        />
      </div>
    ) : null;
  const contentWrapper = React.useCallback(
    (content: React.ReactNode) =>
      masonryLayoutSeed ? (
        <MasonryLayoutSeedProvider value={masonryLayoutSeed}>
          {content}
        </MasonryLayoutSeedProvider>
      ) : (
        content
      ),
    [masonryLayoutSeed],
  );

  if (!masonrySkeletonNode) return null;

  const reserveContainer = children !== undefined && !!masonryLayoutSeed?.scopeId;
  const reserveShell =
    reserveContainer &&
    enabled !== false &&
    !!masonryLayoutSeed?.shellReserveCss;
  const framedSkeleton = (
    <SkeletonFrame
      skeletonNode={masonrySkeletonNode}
      ready={ready}
      enabled={enabled}
      force={force}
      timing={timing}
      shellClassName={shellClassName}
      shellStyle={shellStyle}
      contentClassName={contentClassName}
      contentStyle={contentStyle}
      contentOwnsWrapperLayout={children !== undefined}
      lockContentLayoutWhileLoading={children !== undefined}
      loadingLayerFirst={children !== undefined}
      contentWrapper={contentWrapper}
      loadingShellDataAttributes={
        reserveShell
          ? {
              "data-rmg-masonry-skeleton-shell": masonryLayoutSeed.scopeId,
            }
          : undefined
      }
      shellRef={shellRef}
    >
      {children}
    </SkeletonFrame>
  );

  if (!reserveContainer) return framedSkeleton;

  return (
    <div style={{ containerType: "inline-size", width: "100%" }}>
      {framedSkeleton}
      {reserveShell ? (
        <style
          dangerouslySetInnerHTML={{
            __html: masonryLayoutSeed.shellReserveCss!,
          }}
        />
      ) : null}
    </div>
  );
}

export function MasonrySkeleton(props: MasonrySkeletonProps) {
  return <MasonrySkeletonCore {...props} />;
}

export default MasonrySkeleton;

export type {
  MasonryPlacement,
  MasonrySkeletonNode,
  MasonrySkeletonSlot,
  MasonrySkeletonSpec,
} from "./MasonrySkeleton";

export type { SkeletonNode };
