"use client";

import * as React from "react";

import { BREAKPOINT_MAP, type BreakpointMap } from "../shared/responsive";
import { useLoadingLayerState } from "../shared/hooks/useLoadingLayerState";
import { usePrefersReducedMotion } from "../shared/hooks/usePrefersReducedMotion";
import {
  resolveCompareLoadingLayerStyle,
  resolveCompareLoadingLayerVisualState,
  resolveLoadingForceOptions,
  type LoadingForceOptions,
} from "../shared/loading/force";
import { resolveLoadingTiming } from "../shared/loading/timing";
import { SkeletonRevealGateProvider } from "../shared/loading/skeletonRevealGate";
import type { LoadingTimingOptions } from "../shared/types/transitions";
import { buildStableScopeId } from "../shared/stableScope";
import {
  applySkeletonTextSnapshot,
  SkeletonLayoutNode,
  buildResponsiveCssText,
  collectResponsiveCss,
  cssLen,
  shimmerStyleVars,
  type SkeletonLength,
  type SkeletonNode,
  type SkeletonResponsiveCssEntry,
  type SkeletonShimmer,
} from "../shared/skeleton/layout";
import styles from "./Skeleton.module.css";
import type { SkeletonCacheSnapshot } from "./cache";

export type SkeletonForceOptions = LoadingForceOptions;
export type SkeletonTimingOptions = LoadingTimingOptions;

export type SkeletonFrameProps = {
  skeletonNode: React.ReactNode;
  children?: React.ReactNode;
  ready?: boolean;
  enabled?: boolean;
  force?: SkeletonForceOptions;
  timing?: SkeletonTimingOptions;
  shellClassName?: string;
  shellStyle?: React.CSSProperties;
  loadingShellStyle?: React.CSSProperties | null;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  contentOwnsWrapperLayout?: boolean;
  lockContentLayoutWhileLoading?: boolean;
  loadingLayerFirst?: boolean;
  contentWrapper?: (children: React.ReactNode) => React.ReactNode;
  shellDataAttributes?: Record<string, string | boolean | undefined>;
  loadingShellDataAttributes?: Record<string, string | boolean | undefined>;
  shellRef?: React.Ref<HTMLDivElement>;
};

export type SkeletonProps = {
  layout: SkeletonNode;
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
};

export type SkeletonCoreProps = SkeletonProps & {
  cacheSnapshot?: SkeletonCacheSnapshot | null;
  scopeId?: string;
  skeletonRootRef?: React.RefObject<HTMLDivElement | null>;
  shellRef?: React.Ref<HTMLDivElement>;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function SkeletonFrame({
  skeletonNode,
  children,
  ready,
  enabled = true,
  force,
  timing,
  shellClassName,
  shellStyle,
  loadingShellStyle,
  contentClassName,
  contentStyle,
  contentOwnsWrapperLayout,
  lockContentLayoutWhileLoading,
  loadingLayerFirst,
  contentWrapper,
  shellDataAttributes,
  loadingShellDataAttributes,
  shellRef,
}: SkeletonFrameProps) {
  const wrapperMode = children !== undefined;
  const prefersReducedMotion = usePrefersReducedMotion();
  const contentReady = ready === true;
  const loadingForce = resolveLoadingForceOptions(force);
  const loadingActive =
    wrapperMode && enabled && (loadingForce.enabled || !contentReady);
  const loadingTiming = React.useMemo(
    () =>
      resolveLoadingTiming({
        prefersReducedMotion,
        timing,
      }),
    [prefersReducedMotion, timing],
  );
  const { showLoadingLayer, loadingExiting, revealUnlocked } =
    useLoadingLayerState({
      loadingActive,
      exitMs: loadingTiming.exitMs,
      minVisibleMs: loadingTiming.minVisibleMs,
    });
  const loadingVisualState = React.useMemo(
    () =>
      resolveCompareLoadingLayerVisualState({
        loadingActive,
        loadingForced: force,
        contentReady,
      }),
    [contentReady, force, loadingActive],
  );
  const loadingLayerStyle = React.useMemo(
    () =>
      resolveCompareLoadingLayerStyle({
        enterMs: loadingTiming.enterMs,
        exitMs: loadingTiming.exitMs,
        compareMode: loadingVisualState.compareMode,
        loadingLayerOpacity: loadingVisualState.loadingLayerOpacity,
        opacityVarName: "--rmg-standalone-skeleton-opacity",
      }),
    [
      loadingTiming.enterMs,
      loadingTiming.exitMs,
      loadingVisualState.compareMode,
      loadingVisualState.loadingLayerOpacity,
    ],
  );

  if (!wrapperMode) return <>{skeletonNode}</>;

  const shouldShowLoadingLayer = enabled && showLoadingLayer;
  const contentLayoutLocked =
    enabled &&
    !!lockContentLayoutWhileLoading &&
    shouldShowLoadingLayer &&
    !loadingVisualState.compareMode;
  const contentVisible =
    !enabled ||
    loadingVisualState.compareMode ||
    loadingExiting ||
    !shouldShowLoadingLayer;
  const contentBlocked =
    enabled &&
    loadingVisualState.contentBlocked &&
    !loadingExiting &&
    !contentOwnsWrapperLayout;
  const renderedContent = contentWrapper ? contentWrapper(children) : children;
  const loadingLayerNode = shouldShowLoadingLayer ? (
    <div
      className={cx(
        styles.loadingLayer,
        contentLayoutLocked && styles.loadingLayerLayoutOwner,
        contentOwnsWrapperLayout &&
          !contentLayoutLocked &&
          styles.loadingLayerOverlay,
        loadingVisualState.compareMode && styles.loadingLayerCompare,
        loadingExiting && styles.loadingLayerExit,
      )}
      style={loadingLayerStyle}
      data-rmg-skeleton-loading-layer="true"
    >
      {skeletonNode}
    </div>
  ) : null;
  const revealGateUnlocked = revealUnlocked || loadingVisualState.compareMode;

  return (
    <div
      ref={shellRef}
      className={cx(styles.shell, shellClassName)}
      style={{
        ...(shouldShowLoadingLayer ? loadingShellStyle : null),
        ...shellStyle,
      }}
      aria-busy={loadingActive ? true : undefined}
      data-rmg-skeleton-wrapper="true"
      data-rmg-skeleton-ready={contentReady ? "true" : "false"}
      data-rmg-skeleton-compare={
        loadingVisualState.compareMode ? "true" : "false"
      }
      data-rmg-skeleton-layout-owner={
        contentLayoutLocked || !contentOwnsWrapperLayout
          ? "skeleton"
          : "content"
      }
      {...shellDataAttributes}
      {...(shouldShowLoadingLayer ? loadingShellDataAttributes : undefined)}
    >
      {loadingLayerFirst ? loadingLayerNode : null}
      <div
        className={cx(
          styles.contentLayer,
          contentVisible && styles.contentLayerVisible,
          contentBlocked && styles.contentLayerBlocked,
          contentLayoutLocked && styles.contentLayerLayoutLocked,
          contentClassName,
        )}
        style={{
          ["--rmg-loading-fade-duration" as any]: `${loadingTiming.exitMs}ms`,
          ["--rmg-loading-fade-enter-duration" as any]: `${loadingTiming.enterMs}ms`,
          ["--rmg-loading-fade-exit-duration" as any]: `${loadingTiming.exitMs}ms`,
          ...contentStyle,
        }}
        aria-hidden={contentVisible ? undefined : true}
        data-rmg-skeleton-content-layer="true"
      >
        <SkeletonRevealGateProvider value={revealGateUnlocked}>
          {renderedContent}
        </SkeletonRevealGateProvider>
      </div>
      {loadingLayerFirst ? null : loadingLayerNode}
    </div>
  );
}

export function SkeletonCore({
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
}: SkeletonCoreProps) {
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
      }),
    [
      layout,
      effectiveBreakpoints,
      backgroundColor,
      radius,
      shimmer,
      disableShimmer,
    ],
  );
  const scopeId = providedScopeId ?? generatedScopeId;
  const localSkeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const skeletonRootRef = providedSkeletonRootRef ?? localSkeletonRootRef;
  const { layout: preparedLayout, responsiveCss } = React.useMemo(() => {
    let n = 0;
    const allocId = () => `n${++n}`;
    const collected: SkeletonResponsiveCssEntry[] = [];
    const cachedLayout = cacheSnapshot
      ? (applySkeletonTextSnapshot(
          layout,
          cacheSnapshot.text,
          "__standalone__",
          effectiveBreakpoints,
        ) as SkeletonNode)
      : layout;
    const withIds = collectResponsiveCss(
      cachedLayout,
      allocId,
      collected,
      "__standalone__",
      effectiveBreakpoints,
    ) as SkeletonNode;

    return {
      layout: withIds,
      responsiveCss: buildResponsiveCssText({
        scopeAttr: "data-rmg-skeleton-scope",
        scopeId,
        rules: collected,
      }),
    };
  }, [layout, scopeId, effectiveBreakpoints, cacheSnapshot]);
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
  const skeletonNode = (
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
      {responsiveCss ? (
        <style
          dangerouslySetInnerHTML={{
            __html: responsiveCss,
          }}
        />
      ) : null}
      <SkeletonLayoutNode
        node={preparedLayout}
        disableShimmer={disableShimmer}
        breakpointMap={effectiveBreakpoints}
      />
    </div>
  );

  return (
    <SkeletonFrame
      skeletonNode={skeletonNode}
      ready={ready}
      enabled={enabled}
      force={force}
      timing={timing}
      shellClassName={shellClassName}
      shellStyle={shellStyle}
      contentClassName={contentClassName}
      contentStyle={contentStyle}
      shellRef={providedShellRef}
    >
      {children}
    </SkeletonFrame>
  );
}

export function Skeleton(props: SkeletonProps) {
  return <SkeletonCore {...props} />;
}

export default Skeleton;

export type {
  ResponsiveTextBarHeight,
  ResponsiveTextBarWidth,
  ResponsiveTextLastBarWidth,
  ResponsiveTextLineCount,
  ResponsiveTextLineHeight,
  TextSkeletonResponsiveBy,
} from "../shared/skeleton/text";

export type {
  SkeletonBaseStyle,
  SkeletonBaseStyleResponsive,
  SkeletonContainerStyle,
  SkeletonContainerStyleResponsive,
  SkeletonLength,
  SkeletonNode,
  SkeletonShimmer,
} from "../shared/skeleton/layout";
