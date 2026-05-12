"use client";

import * as React from "react";

import {
  BREAKPOINT_MAP,
  DEFAULT_SERVER_VIEWPORT_WIDTH,
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
    layout: masonryLayout as MasonrySkeletonLayoutNode,
  };
}

export function MasonrySkeleton({
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
}: MasonrySkeletonProps) {
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints]
  );
  const scopeId = React.useMemo(
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
    ]
  );
  const masonrySpec = React.useMemo(() => {
    if (isMasonryLayout(layout) || isMasonryLayoutSpec(layout)) {
      return toMasonrySkeletonSpec(layout);
    }
    return null;
  }, [layout]);
  const masonryLayout = masonrySpec?.layout?.kind === "masonry"
    ? (masonrySpec.layout as MasonrySkeletonLayoutNode)
    : null;
  const masonrySourceLayout = isMasonryLayout(layout) ? layout : null;
  const skeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const explicitLayoutWidthPx =
    masonry?.layoutWidthPx ?? masonrySourceLayout?.layoutWidthPx;
  const [measuredLayoutWidthPx, setMeasuredLayoutWidthPx] = React.useState<
    number | undefined
  >(undefined);
  const effectiveLayoutWidthPx = explicitLayoutWidthPx ?? measuredLayoutWidthPx;

  React.useLayoutEffect(() => {
    if (explicitLayoutWidthPx !== undefined) {
      setMeasuredLayoutWidthPx((prev) => (prev === undefined ? prev : undefined));
      return;
    }

    const node = skeletonRootRef.current;
    if (!node) return;

    const commitWidth = (rawWidth: number | undefined) => {
      const width = Number(rawWidth);
      if (!Number.isFinite(width) || width <= 0) return;

      setMeasuredLayoutWidthPx((prev) =>
        prev != null && Math.abs(prev - width) < 0.5 ? prev : width
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
  > | null =
    masonrySpec
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
          viewportWidth: masonry?.viewportWidth ?? masonrySourceLayout?.viewportWidth,
          layoutWidthPx: effectiveLayoutWidthPx,
          disableShimmer,
        }
      : null;
  const masonryLayoutSeed = React.useMemo(() => {
    if (!masonrySpec || !masonryRenderOptions) return null;

    const seedScopeId = buildStableScopeId("mseed_", {
      scopeId,
      breakpoints: effectiveBreakpoints,
      masonry: masonryRenderOptions,
      spec: masonrySpec,
    });
    const prediction = buildMasonrySkeletonPrediction({
      count: masonryRenderOptions.count,
      columns: masonryRenderOptions.columns,
      gap: masonryRenderOptions.gap,
      breakpoints: effectiveBreakpoints,
      ratios: masonryRenderOptions.ratios,
      heightsPx: masonryRenderOptions.heightsPx,
      spans: masonryRenderOptions.spans,
      placement: masonryRenderOptions.placement,
      spec: masonrySpec,
      scopeId: seedScopeId,
      respectLayoutCount: false,
      viewportWidth: masonryRenderOptions.viewportWidth,
      layoutWidthPx: masonryRenderOptions.layoutWidthPx,
    });
    const activeVariant = resolveActiveMasonryPredictionVariant(
      prediction.variants,
      masonryRenderOptions.viewportWidth ?? DEFAULT_SERVER_VIEWPORT_WIDTH
    );

    return {
      scopeId: seedScopeId,
      initialHeights: activeVariant?.items.map((item) => item.height),
      responsiveCss: buildMasonryFirstPaintLayoutCss({
        scopeId: seedScopeId,
        prediction,
      }),
      shellReserveCss: buildMasonryShellReserveCss({
        scopeId: seedScopeId,
        prediction,
      }),
    };
  }, [
    effectiveBreakpoints,
    masonryRenderOptions?.columns,
    masonryRenderOptions?.count,
    masonryRenderOptions?.disableShimmer,
    masonryRenderOptions?.gap,
    masonryRenderOptions?.heightsPx,
    masonryRenderOptions?.layoutWidthPx,
    masonryRenderOptions?.placement,
    masonryRenderOptions?.ratios,
    masonryRenderOptions?.spans,
    masonryRenderOptions?.viewportWidth,
    masonrySpec,
    scopeId,
  ]);
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
  const masonrySkeletonNode =
    masonrySpec && masonryRenderOptions ? (
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
          {...masonryRenderOptions}
          spec={masonrySpec}
          breakpoints={effectiveBreakpoints}
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
    [masonryLayoutSeed]
  );

  if (!masonrySkeletonNode) return null;

  const reserveContainer = children !== undefined && !!masonryLayoutSeed?.scopeId;
  const reserveShell =
    reserveContainer &&
    enabled !== false &&
    ready !== true &&
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
      loadingLayerFirst={children !== undefined}
      contentWrapper={contentWrapper}
      shellDataAttributes={
        reserveShell
          ? {
              "data-rmg-masonry-skeleton-shell": masonryLayoutSeed.scopeId,
            }
          : undefined
      }
    >
      {children}
    </SkeletonFrame>
  );

  if (!reserveContainer) return framedSkeleton;

  return (
    <div style={{ containerType: "inline-size", width: "100%" }}>
      {reserveShell ? (
        <style
          dangerouslySetInnerHTML={{
            __html: masonryLayoutSeed.shellReserveCss!,
          }}
        />
      ) : null}
      {framedSkeleton}
    </div>
  );
}

export default MasonrySkeleton;

export type {
  MasonryPlacement,
  MasonrySkeletonNode,
  MasonrySkeletonSlot,
  MasonrySkeletonSpec,
} from "./MasonrySkeleton";

export type { SkeletonNode };
