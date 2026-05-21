"use client";

import * as React from "react";

import {
  BREAKPOINT_MAP,
  normalizeResponsiveToMinWidthRules,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsive";
import { buildScopedSkeletonCountCss } from "../shared/skeleton/buildScopedSkeletonCountCss";
import {
  cssLen,
  shimmerStyleVars,
  type SkeletonLength,
  type SkeletonShimmer,
} from "../shared/skeleton/layout";
import { SAFARI_TEXT_SKELETON_SUPPORTS } from "../shared/skeleton/text";
import { buildStableScopeId } from "../shared/stableScope";
import {
  SliderSkeletonCard,
  buildCenterFirstSpacerWidthFromSkeletonSpecCssExpr,
  buildExtrasHeightFromSkeletonSpecCssExpr,
  buildInitialHeightFromSkeletonSpecCssExpr,
  buildRowHeightFromSkeletonSpecCssExpr,
  collectResponsiveSliderBaseStyleBreakpoints,
  collectResponsiveSliderCompensationBreakpoints,
  collectResponsiveSliderContainerBreakpoints,
  collectResponsiveSliderTextLineBreakpoints,
  type SliderSkeletonSliderNode,
  type SliderSkeletonSpec,
} from "../slider/SliderSkeleton";
import {
  SkeletonFrame,
  type SkeletonForceOptions,
  type SkeletonTimingOptions,
} from "./base";
import type { SkeletonCacheSnapshot } from "./cache";
import type {
  SkeletonSliderLayout,
  SliderSkeletonProps as RestoredSliderSkeletonProps,
} from "./slider";

export type SliderSkeletonProps = Omit<
  RestoredSliderSkeletonProps,
  "cache" | "restore"
>;

export type SliderSkeletonCoreProps = SliderSkeletonProps & {
  cacheSnapshot?: SkeletonCacheSnapshot | null;
  scopeId?: string;
  skeletonRootRef?: React.RefObject<HTMLDivElement | null>;
  shellRef?: React.Ref<HTMLDivElement>;
};

function isSliderLayoutSpec(
  layout: SliderSkeletonProps["layout"]
): layout is SliderSkeletonSpec {
  return (
    !!layout &&
    typeof layout === "object" &&
    !("kind" in layout) &&
    "layout" in layout &&
    (layout as SliderSkeletonSpec).layout?.kind === "slider"
  );
}

function isSliderLayout(
  layout: SliderSkeletonProps["layout"]
): layout is SkeletonSliderLayout {
  return !!layout && typeof layout === "object" && "kind" in layout && layout.kind === "slider";
}

function toSliderSkeletonSpec(
  layout: SkeletonSliderLayout | SliderSkeletonSpec
): SliderSkeletonSpec {
  if (isSliderLayoutSpec(layout)) return layout;

  const {
    mode,
    centering,
    className,
    visibleCount,
    backgroundColor,
    radius,
    shimmer,
    ...sliderLayout
  } = layout;

  return {
    mode,
    centering,
    className,
    visibleCount,
    backgroundColor,
    radius,
    shimmer,
    layout: sliderLayout as SliderSkeletonSliderNode,
  };
}

function maxResolvedSkeletonCount(
  responsiveCount: ResponsiveNumber | undefined,
  fallbackCount: number,
  breakpointMap: BreakpointMap
) {
  return normalizeResponsiveToMinWidthRules(
    responsiveCount,
    fallbackCount,
    breakpointMap
  ).reduce((max, rule) => Math.max(max, rule.count), 0);
}

function centerFirstVisibleSlotsForCount(count: number, maxSlots: number) {
  const c = Math.max(0, Math.floor(count));
  if (c <= 0) return [];
  if (c === 1) return maxSlots >= 2 ? [2] : [];
  return Array.from({ length: Math.min(maxSlots, c + 1) }, (_, i) => i + 1);
}

function buildSliderShellScopeSelector(scopeId: string) {
  return `[data-rmg-scope="${scopeId}"] > [data-rmg-scope-shell="true"]`;
}

function cacheSnapshotResponsiveMinWidth(
  snapshot: SkeletonCacheSnapshot | null | undefined
) {
  const viewportWidth = Number(snapshot?.viewportWidth);
  if (Number.isFinite(viewportWidth) && viewportWidth >= 0) {
    return viewportWidth;
  }

  const widthBucketMin = Number(snapshot?.widthBucketMin);
  return Number.isFinite(widthBucketMin) && widthBucketMin >= 0
    ? widthBucketMin
    : 0;
}

export function buildScopedInitialHeightCss(args: {
  scopeId: string;
  skeletonSpec: SliderSkeletonSpec;
  responsiveCount: ResponsiveNumber | undefined;
  fallbackCount: number;
  breakpointMap: BreakpointMap;
  centerFirstSpacer?: boolean;
  cacheSnapshot?: SkeletonCacheSnapshot | null;
}) {
  const layout = args.skeletonSpec.layout;
  if (!layout) return "";

  const mode = args.skeletonSpec.mode ?? "fit";
  const shellSel = buildSliderShellScopeSelector(args.scopeId);
  const responsiveCountRules = normalizeResponsiveToMinWidthRules(
    args.responsiveCount,
    args.fallbackCount,
    args.breakpointMap
  );
  const responsiveTextBreakpoints =
    collectResponsiveSliderTextLineBreakpoints(layout, args.breakpointMap);
  const responsiveContainerBreakpoints =
    collectResponsiveSliderContainerBreakpoints(layout, args.breakpointMap);
  const responsiveBaseStyleBreakpoints =
    collectResponsiveSliderBaseStyleBreakpoints(layout, args.breakpointMap);
  const responsiveCompensationBreakpoints =
    collectResponsiveSliderCompensationBreakpoints(layout, args.breakpointMap);

  const resolveCountAtMinWidth = (minWidth: number) => {
    let resolved = args.fallbackCount;
    for (const rule of responsiveCountRules) {
      if (minWidth >= rule.minWidth) resolved = rule.count;
    }
    return Math.max(1, resolved | 0);
  };

  const mkRule = (
    count: number,
    minWidth: number,
    textMetricsMode: "default" | "safari" = "default"
  ) => {
    const totalExpr = buildInitialHeightFromSkeletonSpecCssExpr(
      layout,
      count,
      mode,
      minWidth,
      args.breakpointMap,
      textMetricsMode,
      args.cacheSnapshot
    );
    const rowExpr = buildRowHeightFromSkeletonSpecCssExpr(
      layout,
      count,
      mode,
      minWidth,
      args.breakpointMap,
      textMetricsMode,
      args.cacheSnapshot
    );
    const extrasExpr = buildExtrasHeightFromSkeletonSpecCssExpr(
      layout,
      minWidth,
      args.breakpointMap,
      textMetricsMode,
      args.cacheSnapshot
    );
    const spacerExpr = args.centerFirstSpacer
      ? buildCenterFirstSpacerWidthFromSkeletonSpecCssExpr(
          layout,
          count,
          mode,
          minWidth,
          args.breakpointMap
        )
      : null;

    if (!totalExpr && !rowExpr && !extrasExpr && !spacerExpr) return "";

    const decls = [
      totalExpr ? `--rmg-slider-initial-height:${totalExpr};` : "",
      rowExpr ? `--rmg-slider-row-height:${rowExpr};` : "",
      extrasExpr ? `--rmg-slider-extras-height:${extrasExpr};` : "",
      args.centerFirstSpacer
        ? `--rmg-slider-center-first-spacer-width:${spacerExpr ?? "0px"};`
        : "",
    ].join("");

    return `${shellSel}{${decls}}`;
  };

  if (args.cacheSnapshot) {
    const minWidth = cacheSnapshotResponsiveMinWidth(args.cacheSnapshot);
    const count = resolveCountAtMinWidth(minWidth);
    const rule = mkRule(count, minWidth);
    if (!rule) return "";

    const safariRule = mkRule(count, minWidth, "safari");
    return safariRule && safariRule !== rule
      ? `${rule}@supports ${SAFARI_TEXT_SKELETON_SUPPORTS}{${safariRule}}`
      : rule;
  }

  const allBreakpoints = Array.from(
    new Set<number>([
      ...responsiveCountRules.map((rule) => rule.minWidth),
      ...responsiveBaseStyleBreakpoints,
      ...responsiveContainerBreakpoints,
      ...responsiveTextBreakpoints,
      ...responsiveCompensationBreakpoints,
    ])
  ).sort((a, b) => a - b);

  return allBreakpoints
    .map((minWidth) => {
      const count = resolveCountAtMinWidth(minWidth);
      const rule = mkRule(count, minWidth);
      if (!rule) return "";
      const safariRule = mkRule(count, minWidth, "safari");
      const css =
        safariRule && safariRule !== rule
          ? `${rule}@supports ${SAFARI_TEXT_SKELETON_SUPPORTS}{${safariRule}}`
          : rule;
      return minWidth <= 0 ? css : `@media (min-width:${minWidth}px){${css}}`;
    })
    .filter(Boolean)
    .join("\n");
}

export function SliderSkeletonCore({
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
  cacheSnapshot,
  scopeId: providedScopeId,
  skeletonRootRef: providedSkeletonRootRef,
  shellRef: providedShellRef,
}: SliderSkeletonCoreProps) {
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
      }),
    [
      layout,
      effectiveBreakpoints,
      backgroundColor,
      radius,
      shimmer,
      disableShimmer,
    ]
  );
  const scopeId = providedScopeId ?? generatedScopeId;
  const sliderSpec = React.useMemo(() => {
    if (isSliderLayout(layout) || isSliderLayoutSpec(layout)) {
      return toSliderSkeletonSpec(layout);
    }
    return null;
  }, [layout]);
  const sliderLayout = sliderSpec?.layout?.kind === "slider"
    ? (sliderSpec.layout as SliderSkeletonSliderNode)
    : null;
  const localSkeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const skeletonRootRef = providedSkeletonRootRef ?? localSkeletonRootRef;
  const sliderVisibleCount =
    (isSliderLayout(layout) ? layout.visibleCount : undefined) ??
    (isSliderLayoutSpec(layout) ? layout.visibleCount : undefined) ??
    (typeof sliderLayout?.count === "number" ? sliderLayout.count : undefined);
  const sliderFallbackCount =
    typeof sliderVisibleCount === "number"
      ? Math.max(1, sliderVisibleCount | 0)
      : typeof sliderLayout?.count === "number"
        ? Math.max(1, sliderLayout.count | 0)
        : 1;
  const sliderCenterFirst =
    !!sliderLayout &&
    sliderSpec?.centering === "first" &&
    (sliderSpec?.mode ?? "fit") === "peek";
  const sliderCenterFirstSpacer =
    sliderCenterFirst &&
    maxResolvedSkeletonCount(
      sliderVisibleCount,
      sliderFallbackCount,
      effectiveBreakpoints
    ) > 1;
  const sliderSlotCount =
    Array.isArray(sliderLayout?.slots) && sliderLayout.slots.length > 0
      ? sliderLayout.slots.length
      : Math.max(
          typeof sliderLayout?.count === "number" ? sliderLayout.count : 0,
          sliderFallbackCount
        );
  const sliderMaxSlots = sliderLayout
    ? Math.max(
        12,
        sliderCenterFirstSpacer ? sliderSlotCount + 1 : sliderSlotCount,
        sliderCenterFirstSpacer
          ? maxResolvedSkeletonCount(
              sliderVisibleCount,
              sliderFallbackCount,
              effectiveBreakpoints
            ) + 1
          : maxResolvedSkeletonCount(
              sliderVisibleCount,
              sliderFallbackCount,
              effectiveBreakpoints
            )
      )
    : 0;
  const sliderCountCss = React.useMemo(() => {
    if (!sliderLayout) return { cssText: "", ssrBaseCount: sliderFallbackCount };
    return buildScopedSkeletonCountCss({
      scopeId,
      responsiveCount: sliderVisibleCount,
      fallbackCount: sliderFallbackCount,
      breakpointMap: effectiveBreakpoints,
      maxSlots: sliderMaxSlots,
      visibleSlotsForCount: sliderCenterFirstSpacer
        ? centerFirstVisibleSlotsForCount
        : undefined,
    });
  }, [
    effectiveBreakpoints,
    scopeId,
    sliderCenterFirstSpacer,
    sliderFallbackCount,
    sliderLayout,
    sliderMaxSlots,
    sliderVisibleCount,
  ]);
  const sliderInitialHeightCss = React.useMemo(() => {
    if (!sliderLayout || !sliderSpec) return "";
    return buildScopedInitialHeightCss({
      scopeId,
      skeletonSpec: sliderSpec,
      responsiveCount: sliderVisibleCount,
      fallbackCount: sliderCountCss.ssrBaseCount,
      breakpointMap: effectiveBreakpoints,
      centerFirstSpacer: sliderCenterFirstSpacer,
      cacheSnapshot,
    });
  }, [
    effectiveBreakpoints,
    scopeId,
    sliderCenterFirstSpacer,
    sliderCountCss.ssrBaseCount,
    sliderLayout,
    sliderSpec,
    cacheSnapshot,
    sliderVisibleCount,
  ]);
  const rootStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    minWidth: 0,
    minHeight: "var(--rmg-slider-initial-height, var(--rmg-slider-height, 320px))",
    overflow: "hidden",
    ...style,
    ...(backgroundColor
      ? ({ ["--rmg-skel-bg" as any]: backgroundColor } as React.CSSProperties)
      : null),
    ...(radius != null
      ? ({ ["--rmg-skel-radius" as any]: cssLen(radius) } as React.CSSProperties)
      : null),
    ...(disableShimmer ? null : (shimmerStyleVars(shimmer) as React.CSSProperties)),
  };
  const sliderSkeletonNode =
    sliderLayout && sliderSpec ? (
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
        {sliderCountCss.cssText || sliderInitialHeightCss ? (
          <style
            dangerouslySetInnerHTML={{
              __html: [sliderCountCss.cssText, sliderInitialHeightCss]
                .filter(Boolean)
                .join("\n"),
            }}
          />
        ) : null}
        <SliderSkeletonCard
          count={sliderCountCss.ssrBaseCount}
          maxSlots={sliderMaxSlots}
          spec={sliderSpec}
          breakpoints={effectiveBreakpoints}
          centerFirst={sliderCenterFirst}
          hasLeadingSpacer={sliderCenterFirstSpacer}
          responsiveCssScopeSelector={`[data-rmg-scope="${scopeId}"]`}
          cacheSnapshot={cacheSnapshot}
        />
      </div>
    ) : null;
  const sliderScopeStyle: React.CSSProperties = {
    containerType: "inline-size",
    width: "100%",
  };
  const sliderLoadingHeight =
    "var(--rmg-slider-initial-height, var(--rmg-slider-height, 320px))";
  const loadingShellStyle = sliderLayout
    ? ({
        height: sliderLoadingHeight,
        minHeight: sliderLoadingHeight,
        overflow: "hidden",
      } satisfies React.CSSProperties)
    : null;

  if (!sliderSkeletonNode) return null;

  if (children === undefined) {
    return (
      <div data-rmg-scope={scopeId} style={sliderScopeStyle}>
        <div
          data-rmg-scope-shell="true"
          style={{
            minHeight: "var(--rmg-slider-initial-height, var(--rmg-slider-height, 320px))",
          }}
        >
          {sliderSkeletonNode}
        </div>
      </div>
    );
  }

  return (
    <div data-rmg-scope={scopeId} style={sliderScopeStyle}>
      <SkeletonFrame
        skeletonNode={sliderSkeletonNode}
        ready={ready}
        enabled={enabled}
        force={force}
        timing={timing}
        shellClassName={shellClassName}
        shellStyle={shellStyle}
        loadingShellStyle={loadingShellStyle}
        contentClassName={contentClassName}
        contentStyle={contentStyle}
        contentOwnsWrapperLayout
        shellDataAttributes={{
          "data-rmg-scope-shell": "true",
        }}
        shellRef={providedShellRef}
      >
        {children}
      </SkeletonFrame>
    </div>
  );
}

export function SliderSkeleton(props: SliderSkeletonProps) {
  return <SliderSkeletonCore {...props} />;
}

export default SliderSkeleton;

export type {
  SliderSkeletonNode,
  SliderSkeletonSlot,
  SliderSkeletonSpec,
  SkeletonNode,
} from "../slider/SliderSkeleton";

export type { SkeletonSliderLayout } from "./slider";
