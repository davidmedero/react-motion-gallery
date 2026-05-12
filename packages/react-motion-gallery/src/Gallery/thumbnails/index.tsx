/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import styles from "./Thumbnails.module.css";
import ThumbnailSliderCore from "./ThumbnailSlider";
import { createSliderIndexChannel, SliderIndexChannel } from "../slider/sliderSub";
import { DEFAULT_THUMBNAILS } from "./defaults";
import {
  BREAKPOINT_MAP,
  normalizeResponsiveToMinWidthRules,
  resolvePositionFromResponsive,
} from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import { usePrefersReducedMotion } from "../shared/hooks/usePrefersReducedMotion";
import { useLoadingLayerState } from "../shared/hooks/useLoadingLayerState";
import {
  resolveCompareLoadingLayerStyle,
  resolveCompareLoadingLayerVisualState,
  resolveLoadingForceOptions,
  type LoadingForceOptions,
} from "../shared/loading/force";
import { resolveLoadingTiming } from "../shared/loading/timing";
import { buildScopedSkeletonCountCss } from "../shared/skeleton/buildScopedSkeletonCountCss";
import { buildStableScopeId } from "../shared/stableScope";
import type { BreakpointMap } from "../shared/responsive";
import type { ThumbnailLoadingOptions, ThumbnailSelectMeta, ThumbnailsOptions } from "./types";
import { createThumbnailSyncBridge } from "./syncBridge";

type Props = {
  options?: ThumbnailsOptions;
  children?: React.ReactNode;
  indexChannel?: SliderIndexChannel;
  breakpoints?: BreakpointMap;
  onThumbnailClick?: (index: number, meta?: ThumbnailSelectMeta) => void
  onReadyChange?: (ready: boolean) => void;
  direction?: "ltr" | "rtl";
};

const THUMBNAIL_SKELETON_FALLBACK_COUNT = 6;
type UseScopedSkeletonArgs = {
  enabled: boolean;
  scopeId: string;
  loading: ThumbnailLoadingOptions;
  fallbackCount: number;
  breakpointMap: BreakpointMap;
  maxSlots?: number;
  showLoadingFallback: boolean;
  defaultNode: (maxSlots: number, baseCount: number) => React.ReactNode;
};

export function resolveThumbnailLoadingVisualState(args: {
  loadingActive: boolean;
  loadingForced?: LoadingForceOptions;
  contentReady: boolean;
}) {
  return resolveCompareLoadingLayerVisualState(args);
}

function maxResolvedSkeletonCount(
  responsiveCount: ThumbnailLoadingOptions["skeletonCount"],
  fallbackCount: number,
  breakpointMap: BreakpointMap
) {
  return normalizeResponsiveToMinWidthRules(
    responsiveCount,
    fallbackCount,
    breakpointMap
  ).reduce((max, rule) => Math.max(max, rule.count), 0);
}

function toCssLengthValue(value: number | string | undefined): string | undefined {
  if (value == null) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function isPercentCssValue(value: string | undefined) {
  return typeof value === "string" && /%$/.test(value.trim());
}

function splitThumbnailSkeletonStyle(
  style: React.CSSProperties | undefined
): React.CSSProperties | undefined {
  if (!style) return undefined;

  const nextStyle = { ...style } as React.CSSProperties & Record<string, unknown>;

  if (nextStyle.boxShadow != null) {
    nextStyle["--rmg-thumb-skel-shadow"] = nextStyle.boxShadow;
    delete nextStyle.boxShadow;
  }

  if (nextStyle.borderRadius != null) {
    nextStyle["--rmg-thumb-skel-shadow-radius"] = nextStyle.borderRadius;
  }

  return nextStyle;
}

function resolveThumbnailSkeletonGap(
  rowStyle: React.CSSProperties | undefined,
  fallbackGap: number,
  isHorizontal: boolean
) {
  const axisGap = isHorizontal ? rowStyle?.columnGap : rowStyle?.rowGap;
  return toCssLengthValue((axisGap ?? rowStyle?.gap ?? fallbackGap) as number | string | undefined) ?? "0px";
}

function buildThumbnailSkeletonSlotSizeExpr(args: {
  mode: NonNullable<ThumbnailLoadingOptions["mode"]>;
  visibleCount: number;
  gap: string;
  explicitSize: string | undefined;
}) {
  const { mode, visibleCount, gap, explicitSize } = args;
  const safeCount = Math.max(1, visibleCount);
  const countExpr = `var(--rmg-thumb-skel-visible-count, ${safeCount})`;
  const fitExpr = `calc((100% - (${gap} * (${countExpr} - 1))) / ${countExpr})`;

  if (mode === "peek" && explicitSize && !isPercentCssValue(explicitSize)) {
    return explicitSize;
  }

  return fitExpr;
}

function buildScopedThumbnailSkeletonCss(args: {
  scopeId: string;
  responsiveCount: ThumbnailLoadingOptions["skeletonCount"];
  fallbackCount: number;
  breakpointMap: BreakpointMap;
  maxSlots: number;
}) {
  const { scopeId, responsiveCount, fallbackCount, breakpointMap, maxSlots } = args;
  const countCss = buildScopedSkeletonCountCss({
    scopeId,
    responsiveCount,
    fallbackCount,
    breakpointMap,
    maxSlots,
  });
  const responsiveRules = normalizeResponsiveToMinWidthRules(
    responsiveCount,
    fallbackCount,
    breakpointMap
  );
  const rootSel = `[data-rmg-scope="${scopeId}"]`;
  const lines = [
    countCss.cssText,
    `${rootSel}{--rmg-thumb-skel-visible-count:${Math.max(1, countCss.ssrBaseCount)};}`,
  ];

  for (const rule of responsiveRules.slice(1)) {
    lines.push(
      `@media (min-width:${rule.minWidth}px){${rootSel}{--rmg-thumb-skel-visible-count:${Math.max(1, rule.count)};}}`
    );
  }

  return { cssText: lines.join("\n"), ssrBaseCount: countCss.ssrBaseCount };
}

function useScopedSkeleton(args: UseScopedSkeletonArgs) {
  const {
    enabled,
    scopeId,
    loading,
    fallbackCount,
    breakpointMap,
    maxSlots = 12,
    showLoadingFallback,
    defaultNode,
  } = args;

  const loadingEnabled = loading.enabled ?? true;
  const loadingForced = resolveLoadingForceOptions(loading.force);

  const showLoading =
    enabled && loadingEnabled && (loadingForced.enabled || showLoadingFallback);

  const { cssText, ssrBaseCount } = React.useMemo(() => {
    if (!enabled || !loadingEnabled) {
      return { cssText: "", ssrBaseCount: fallbackCount };
    }

    return buildScopedThumbnailSkeletonCss({
      scopeId,
      responsiveCount: loading.skeletonCount,
      fallbackCount,
      breakpointMap,
      maxSlots,
    });
  }, [
    enabled,
    loadingEnabled,
    scopeId,
    loading.skeletonCount,
    fallbackCount,
    breakpointMap,
    maxSlots,
  ]);

  const node = React.useMemo(() => {
    if (!showLoading) return null;

    if (loading.renderLoading) {
      return loading.renderLoading({ count: ssrBaseCount });
    }

    return defaultNode(maxSlots, ssrBaseCount);
  }, [showLoading, loading.renderLoading, defaultNode, maxSlots, ssrBaseCount]);

  return { cssText, ssrBaseCount, node, showLoading };
}

function resolveThumbnailsObject(options?: ThumbnailsOptions): ThumbnailsOptions {
  return {
    ...DEFAULT_THUMBNAILS,
    ...(options ?? {}),
    layout: {
      ...DEFAULT_THUMBNAILS.layout,
      ...(options?.layout ?? {}),
    },
    scroll: {
      ...DEFAULT_THUMBNAILS.scroll,
      ...(options?.scroll ?? {}),
    },
    motion: {
      ...DEFAULT_THUMBNAILS.motion,
      ...(options?.motion ?? {}),
    },
    elements: {
      ...(options?.elements ?? {}),
    },
    controls: {
      ...(options?.controls ?? {}),
    },
    transitions: {
      ...(options?.transitions ?? {}),
    },
  };
}

function normalizeInitialChannelState(
  indexChannel: SliderIndexChannel | undefined,
  clampIndex: (index: number) => number
) {
  const state = indexChannel?.get?.();
  const rawIndex = state?.index;
  const safeIndex = typeof rawIndex === "number" && Number.isFinite(rawIndex)
    ? clampIndex(Math.trunc(rawIndex))
    : 0;
  const safeMode = state?.mode === "instant" ? "instant" : "animated";
  return { index: safeIndex, mode: safeMode } as const;
}

export const ThumbnailSlider = React.forwardRef<HTMLDivElement, Props>(
  function ThumbnailSlider(
    { options, children, indexChannel, breakpoints, onThumbnailClick, onReadyChange, direction },
    forwardedRef
  ) {
    const thumbsObject = React.useMemo(
      () => resolveThumbnailsObject(options),
      [options]
    );

    const effectiveBreakpoints = React.useMemo(
      () => ({ ...BREAKPOINT_MAP, ...(breakpoints || {}) }),
      [breakpoints]
    );

    const vw = useViewportWidth();

    const resolvedThumbPos = React.useMemo(
      () =>
        resolvePositionFromResponsive(
          thumbsObject.layout?.position,
          "bottom",
          vw,
          effectiveBreakpoints
        ),
      [thumbsObject.layout?.position, vw, effectiveBreakpoints]
    );

    const thumbsLoading = React.useMemo(() => {
      const src = thumbsObject.transitions?.loading ?? {};
      return {
        enabled: src.enabled ?? true,
        force: src.force ?? false,
        skeletonCount: src.skeletonCount,
        mode: src.mode ?? "peek",
        renderLoading: src.renderLoading,
        elements: src.elements,
        timing: src.timing,
      } satisfies ThumbnailLoadingOptions;
    }, [thumbsObject.transitions?.loading]);
    const thumbsScope = React.useMemo(
      () =>
        buildStableScopeId("rmg-thumbs-", {
          breakpoints: effectiveBreakpoints,
          direction,
          layout: thumbsObject.layout,
          loadingElements: thumbsLoading.elements,
          loadingMode: thumbsLoading.mode,
          loadingSkeletonCount: thumbsLoading.skeletonCount,
        }),
      [
        effectiveBreakpoints,
        direction,
        thumbsObject.layout,
        thumbsLoading.elements,
        thumbsLoading.mode,
        thumbsLoading.skeletonCount,
      ]
    );

    const [thumbsReady, setThumbsReady] = React.useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();

    const thumbChildren = children ?? thumbsObject.children;
    const thumbChildArray = React.useMemo(
      () => React.Children.toArray(thumbChildren),
      [thumbChildren]
    );

    const contentSignature = React.useMemo(
      () =>
        thumbChildArray
          .map((node, idx) => {
            if (React.isValidElement(node)) {
              return `el:${node.key != null ? String(node.key) : `idx:${idx}`}`;
            }
            if (node == null || typeof node === "boolean") return `nil:${idx}`;
            if (typeof node === "string" || typeof node === "number") {
              return `txt:${idx}:${String(node)}`;
            }
            return `node:${idx}`;
          })
          .join("|"),
      [thumbChildArray]
    );

    React.useEffect(() => {
      setThumbsReady(false);
    }, [contentSignature]);

    const isHorizontalThumbs =
      resolvedThumbPos === "top" || resolvedThumbPos === "bottom";

    const thumbsGap = thumbsObject.layout?.gap ?? 8;
    const thumbW = thumbsObject.layout?.thumbnail?.width ?? 64;
    const thumbH = thumbsObject.layout?.thumbnail?.height ?? 64;
    const thumbsSkeletonMode = thumbsLoading.mode ?? "peek";
    const maxThumbSkeletonSlots = React.useMemo(
      () =>
        Math.max(
          12,
          maxResolvedSkeletonCount(
            thumbsLoading.skeletonCount,
            THUMBNAIL_SKELETON_FALLBACK_COUNT,
            effectiveBreakpoints
          )
        ),
      [thumbsLoading.skeletonCount, effectiveBreakpoints]
    );
    const thumbsSkeletonGap = React.useMemo(
      () =>
        resolveThumbnailSkeletonGap(
          thumbsLoading.elements?.row?.style,
          thumbsGap,
          isHorizontalThumbs
        ),
      [thumbsLoading.elements?.row?.style, thumbsGap, isHorizontalThumbs]
    );

    const thumbsSkeleton = useScopedSkeleton({
      enabled: true,
      scopeId: thumbsScope,
      loading: thumbsLoading,
      fallbackCount: THUMBNAIL_SKELETON_FALLBACK_COUNT,
      breakpointMap: effectiveBreakpoints,
      maxSlots: maxThumbSkeletonSlots,
      showLoadingFallback: !thumbsReady,
      defaultNode: (MAX_SKELETONS, baseCount) => {
        const mainAxisSize = buildThumbnailSkeletonSlotSizeExpr({
          mode: thumbsSkeletonMode,
          visibleCount: baseCount,
          gap: thumbsSkeletonGap,
          explicitSize: toCssLengthValue(isHorizontalThumbs ? thumbW : thumbH),
        });

        return (
          <div
            className={[
              styles.thumbSkeletonOverlay,
              thumbsLoading.elements?.container?.className ?? "",
            ].filter(Boolean).join(" ")}
            data-rmg-skel-mode={thumbsSkeletonMode}
            data-rmg-skel-part="overlay"
            style={{
              height: thumbsObject.layout?.container?.height,
              width: thumbsObject.layout?.container?.width,
              ...(splitThumbnailSkeletonStyle(
                thumbsLoading.elements?.container?.style
              ) ?? {}),
            }}
          >
            <div
              className={[
                styles.thumbSkeletonRow,
                thumbsLoading.elements?.row?.className ?? "",
              ].filter(Boolean).join(" ")}
              data-rmg-skel-part="row"
              style={{
                gap: thumbsGap,
                flexDirection: isHorizontalThumbs ? "row" : "column",
                ...(thumbsLoading.elements?.row?.style ?? {}),
              }}
            >
              {Array.from({ length: MAX_SKELETONS }).map((_, i) => (
                <div
                  key={`rmg-thumb-skel-${i}`}
                  className={[
                    styles.thumbSkeleton,
                    thumbsLoading.elements?.thumbnail?.className ?? "",
                  ].filter(Boolean).join(" ")}
                  data-rmg-skel-part="thumbnail"
                  data-rmg-skel-slot={i + 1}
                  style={{
                    flex: "0 0 auto",
                    width: isHorizontalThumbs ? mainAxisSize : "100%",
                    height: isHorizontalThumbs ? "100%" : mainAxisSize,
                    ...(splitThumbnailSkeletonStyle(
                      thumbsLoading.elements?.thumbnail?.style
                    ) ?? {}),
                  }}
                />
              ))}
            </div>
          </div>
        );
      },
    });

    const childCount = thumbChildArray.filter(Boolean).length;
    const persistedLoadingNodeRef = React.useRef<React.ReactNode>(thumbsSkeleton.node);

    if (thumbsSkeleton.node) {
      persistedLoadingNodeRef.current = thumbsSkeleton.node;
    }

    const loadingTiming = React.useMemo(
      () =>
        resolveLoadingTiming({
          prefersReducedMotion,
          timing: thumbsLoading.timing,
        }),
      [prefersReducedMotion, thumbsLoading.timing]
    );
    const { showLoadingLayer, loadingExiting, introUnlocked } = useLoadingLayerState({
      loadingActive: thumbsSkeleton.showLoading,
      exitMs: loadingTiming.exitMs,
      minVisibleMs: loadingTiming.minVisibleMs,
    });
    const loadingVisualState = React.useMemo(
      () =>
        resolveThumbnailLoadingVisualState({
          loadingActive: thumbsSkeleton.showLoading,
          loadingForced: thumbsLoading.force,
          contentReady: thumbsReady,
        }),
      [thumbsLoading.force, thumbsReady, thumbsSkeleton.showLoading]
    );
    const loadingLayerStyle = React.useMemo(
      () =>
        resolveCompareLoadingLayerStyle({
          exitMs: loadingTiming.exitMs,
          compareMode: loadingVisualState.compareMode,
          loadingLayerOpacity: loadingVisualState.loadingLayerOpacity,
          opacityVarName: "--rmg-thumb-loading-opacity",
        }),
      [
        loadingTiming.exitMs,
        loadingVisualState.compareMode,
        loadingVisualState.loadingLayerOpacity,
      ]
    );

    const clampIndex = React.useCallback(
      (index: number) => {
        if (childCount <= 0) return 0;
        return Math.max(0, Math.min(childCount - 1, index));
      },
      [childCount]
    );

    const localChannelRef = React.useRef<SliderIndexChannel | null>(null);
    if (!localChannelRef.current) {
      const initial = normalizeInitialChannelState(indexChannel, clampIndex);
      localChannelRef.current = createSliderIndexChannel(
        initial.index,
        initial.mode
      );
    }
    const localChannel = localChannelRef.current;

    const bridgeRef = React.useRef(
      createThumbnailSyncBridge({
        localChannel,
        externalChannel: indexChannel,
        clampIndex,
      })
    );

    React.useEffect(() => {
      bridgeRef.current = createThumbnailSyncBridge({
        localChannel,
        externalChannel: indexChannel,
        clampIndex,
      });

      const cleanup = bridgeRef.current.start();
      return () => cleanup();
    }, [indexChannel, clampIndex, localChannel]);

    const thumbsCrossfade = React.useMemo(() => {
      const src = thumbsObject.transitions?.crossfade ?? {};
      return {
        enabled: src.enabled ?? false,
        durationMs: src.durationMs,
        easing: src.easing,
      };
    }, [thumbsObject.transitions?.crossfade]);

    const handleThumbSelect = React.useCallback(
      (index: number, meta?: ThumbnailSelectMeta) => {
        bridgeRef.current.publishThumbnailClick(index, "animated", {
          source: "thumbnail",
          transition: meta?.transition ?? "scroll",
          crossfade:
            meta?.transition === "crossfade"
              ? {
                  durationMs: meta.crossfade?.durationMs,
                  easing: meta.crossfade?.easing,
                }
              : undefined,
        });

        onThumbnailClick?.(index, meta);
      },
      [onThumbnailClick]
    );

    const handleThumbReadyChange = React.useCallback(
      (ready: boolean) => {
        setThumbsReady((prev) => (prev === ready ? prev : ready));
        onReadyChange?.(ready);
      },
      [onReadyChange]
    );

    return (
      <>
        {thumbsSkeleton.cssText && (
          <style dangerouslySetInnerHTML={{ __html: thumbsSkeleton.cssText }} />
        )}

        <div
          id={thumbsScope}
          ref={forwardedRef}
          data-rmg-scope={thumbsScope}
          className={styles.thumbShell}
        >
          <div
            className={[
              styles.thumbContentLayer,
              loadingVisualState.contentBlocked ? styles.thumbContentBlocked : "",
            ].filter(Boolean).join(" ")}
          >
            <ThumbnailSliderCore
              indexChannel={localChannel}
              position={resolvedThumbPos}
              direction={direction}
              thumbnailWidth={thumbsObject.layout?.thumbnail?.width}
              thumbnailHeight={thumbsObject.layout?.thumbnail?.height}
              thumbnailsCenter={thumbsObject.layout?.center}
              thumbnailsContainerWidth={thumbsObject.layout?.container?.width}
              thumbnailsContainerHeight={thumbsObject.layout?.container?.height}
              thumbnailsContainerStyle={thumbsObject.elements?.container?.style}
              thumbnailsContainerClassName={thumbsObject.elements?.container?.className}
              thumbnailItemStyle={thumbsObject.elements?.thumbnail?.style}
              thumbnailItemClassName={thumbsObject.elements?.thumbnail?.className}
              gap={thumbsObject.layout?.gap}
              freeScroll={thumbsObject.scroll?.freeScroll}
              groupCells={thumbsObject.scroll?.groupCells}
              loop={thumbsObject.scroll?.loop}
              skipSnaps={thumbsObject.scroll?.skipSnaps}
              centerActiveThumb={thumbsObject.scroll?.centerActiveThumb}
              selectDuration={thumbsObject.motion?.selectDuration}
              freeScrollDuration={thumbsObject.motion?.freeScrollDuration}
              sliderFriction={thumbsObject.motion?.friction}
              loadingOptions={thumbsLoading}
              introOptions={thumbsObject.transitions?.intro}
              breakpointMap={thumbsObject.breakpointMap ?? effectiveBreakpoints}
              rippleEnabled={thumbsObject.controls?.ripple?.enabled}
              rippleClassName={thumbsObject.controls?.ripple?.className}
              showArrows={thumbsObject.controls?.enabled}
              arrowStyles={thumbsObject.controls?.arrow?.style}
              arrowClassName={thumbsObject.controls?.arrow?.className}
              prevArrowStyles={thumbsObject.controls?.prev?.style}
              prevArrowClassName={thumbsObject.controls?.prev?.className}
              nextArrowStyles={thumbsObject.controls?.next?.style}
              nextArrowClassName={thumbsObject.controls?.next?.className}
              renderArrows={thumbsObject.controls?.render}
              renderPrevArrow={thumbsObject.controls?.renderPrev}
              renderNextArrow={thumbsObject.controls?.renderNext}
              crossfade={thumbsObject.transitions?.crossfade}
              onReadyChange={handleThumbReadyChange}
              onSelectThumb={handleThumbSelect}
              introUnlocked={introUnlocked || loadingVisualState.compareMode}
            >
              {thumbChildren}
            </ThumbnailSliderCore>
          </div>
          {showLoadingLayer && (thumbsSkeleton.node ?? persistedLoadingNodeRef.current) ? (
            <div
              className={[
                styles.thumbLoadingLayer,
                loadingVisualState.compareMode ? styles.thumbLoadingLayerCompare : "",
                loadingExiting ? styles.thumbLoadingLayerExit : "",
              ].filter(Boolean).join(" ")}
              style={loadingLayerStyle}
              aria-hidden="true"
            >
              {thumbsSkeleton.node ?? persistedLoadingNodeRef.current}
            </div>
          ) : null}
        </div>
      </>
    );
  }
);

export default ThumbnailSlider;
