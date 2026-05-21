"use client";

import * as React from "react";

import {
  BREAKPOINT_MAP,
  normalizeResponsiveToMinWidthRules,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsive";
import {
  buildScopedSkeletonCountCss,
} from "../shared/skeleton/buildScopedSkeletonCountCss";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import {
  cssLen,
  shimmerStyleVars,
  type SkeletonLength,
  type SkeletonShimmer,
} from "../shared/skeleton/layout";
import { SAFARI_TEXT_SKELETON_SUPPORTS } from "../shared/skeleton/text";
import { buildStableScopeId } from "../shared/stableScope";
import {
  DEFAULT_SLIDER_RESTORE_TTL_MS,
  buildSliderRestoreCss,
  buildSliderRestoreScript,
  createSliderRestoreStateForWindow,
  getSliderRestoreVisibleSlots,
  isMeaningfulSliderRestoreState,
  readSliderRestoreStateFromCache,
  readSliderRestoreStateFromWindow,
  validateSliderRestoreState,
  writeSliderRestoreStateToWindow,
  type SliderRestoreRuntimeOptions,
} from "../slider/SliderRestore";
import {
  SliderSkeletonCard,
  buildCenterFirstSpacerWidthFromSkeletonSpecCssExpr,
  buildExtrasHeightFromSkeletonSpecCssExpr,
  buildInitialHeightFromSkeletonSpecCssExpr,
  buildRowHeightFromSkeletonSpecCssExpr,
  collectSliderSkeletonTextIds,
  collectResponsiveSliderBaseStyleBreakpoints,
  collectResponsiveSliderCompensationBreakpoints,
  collectResponsiveSliderContainerBreakpoints,
  collectResponsiveSliderTextLineBreakpoints,
  type SkeletonLength as SliderSkeletonLength,
  type SliderSkeletonSliderNode,
  type SliderSkeletonSpec,
} from "../slider/SliderSkeleton";
import type { SliderHandle } from "../slider/types";
import {
  SkeletonFrame,
  type SkeletonForceOptions,
  type SkeletonTimingOptions,
} from "./base";
import type { SkeletonCacheOptions, SkeletonCacheSnapshot } from "./cache";
import { validateSkeletonCacheSnapshot } from "./cache";
import {
  resolveSkeletonCacheOptions,
  useSkeletonCacheRenderSnapshot,
  useSkeletonCacheContext,
} from "./cache-context";
import {
  updateSkeletonCacheSliderRestoreCookie,
  useSkeletonCacheWriter,
} from "./cache-writer";

export type SkeletonSliderLayout = SliderSkeletonSliderNode & {
  mode?: SliderSkeletonSpec["mode"];
  centering?: SliderSkeletonSpec["centering"];
  className?: string;
  visibleCount?: ResponsiveNumber;
  backgroundColor?: string;
  radius?: SliderSkeletonLength;
  shimmer?: SliderSkeletonSpec["shimmer"];
};

export type SkeletonSliderReadyHandle = {
  handleRef: React.RefObject<SliderHandle | null>;
};

export type SkeletonSliderRestoreOptions = {
  kind: "slider";
  enabled?: boolean;
  key?: string;
  ttlMs?: number;
  slider?: SkeletonSliderReadyHandle;
  itemCount: number;
  visibleCount?: ResponsiveNumber;
  loop?: boolean;
  activeSlotOffset?: number;
};

export type SliderSkeletonProps = {
  layout: SkeletonSliderLayout | SliderSkeletonSpec;
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
  restore?: SkeletonSliderRestoreOptions;
  cache?: SkeletonCacheOptions;
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

function serializableRestoreStyle(style: unknown): Record<string, unknown> {
  if (!style || typeof style !== "object" || Array.isArray(style)) return {};

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(style)) {
    if (value == null) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      out[key] = value;
    }
  }
  return out;
}

function collectSliderDotRestoreStyles(
  node: any,
  out: Array<{
    activeStyle?: Record<string, unknown>;
    inactiveStyle?: Record<string, unknown>;
  }> = []
) {
  if (!node || typeof node !== "object") return out;

  if (node.kind === "sliderDots") {
    out.push({
      activeStyle: serializableRestoreStyle(node.activeStyle),
      inactiveStyle: serializableRestoreStyle(node.inactiveStyle),
    });
    return out;
  }

  if (node.kind === "slider") {
    collectSliderDotRestoreStyles(node.item, out);
    node.children?.forEach?.((child: unknown) =>
      collectSliderDotRestoreStyles(child, out)
    );
    node.overlays?.forEach?.((child: unknown) =>
      collectSliderDotRestoreStyles(child, out)
    );
    node.slots?.forEach?.((slot: { item?: unknown }) =>
      collectSliderDotRestoreStyles(slot.item, out)
    );
    return out;
  }

  node.children?.forEach?.((child: unknown) =>
    collectSliderDotRestoreStyles(child, out)
  );

  return out;
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

function removeSliderRestoreStyle(scopeId: string) {
  if (typeof document === "undefined") return;

  document
    .querySelectorAll<HTMLStyleElement>(
      "style[data-rmg-slider-restore-style],style[data-rmg-slider-restore-static]"
    )
    .forEach((style) => {
      if (
        style.getAttribute("data-rmg-slider-restore-style") === scopeId ||
        style.getAttribute("data-rmg-slider-restore-static") === scopeId
      ) {
        style.remove();
      }
    });
}

function buildScopedRestoredSliderHeightCss(scopeId: string, heightPx: number | null) {
  if (heightPx == null || !Number.isFinite(heightPx) || heightPx <= 0) return "";

  const h = Math.round((heightPx + Number.EPSILON) * 1000) / 1000;
  return `${buildSliderShellScopeSelector(scopeId)}{--rmg-slider-initial-height:${h}px!important;--rmg-slider-row-height:${h}px!important;}`;
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

export function SliderSkeleton({
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
  restore,
  cache,
}: SliderSkeletonProps) {
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
  const sliderSpec = React.useMemo(() => {
    if (isSliderLayout(layout) || isSliderLayoutSpec(layout)) {
      return toSliderSkeletonSpec(layout);
    }
    return null;
  }, [layout]);
  const cacheContext = useSkeletonCacheContext();
  const effectiveCache = resolveSkeletonCacheOptions(cache, cacheContext);
  const renderCacheSnapshot = useSkeletonCacheRenderSnapshot(effectiveCache);
  const clientViewportWidth = useViewportWidth();
  const textIds = React.useMemo(
    () => Array.from(collectSliderSkeletonTextIds(sliderSpec?.layout)),
    [sliderSpec]
  );
  const validCacheSnapshot = validateSkeletonCacheSnapshot(
    renderCacheSnapshot,
    {
      key: effectiveCache?.key,
      scopeId,
      kind: "slider",
      routeKey: effectiveCache?.routeKey,
      ttlMs: effectiveCache?.ttlMs,
      viewportWidth: clientViewportWidth || undefined,
      textIds,
    }
  );
  const sliderLayout = sliderSpec?.layout?.kind === "slider"
    ? (sliderSpec.layout as SliderSkeletonSliderNode)
    : null;
  const skeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const sliderRestore = restore?.kind === "slider" ? restore : null;
  const sliderRestoreHandleRef = sliderRestore?.slider?.handleRef ?? null;
  const hasSliderLayout = !!sliderLayout;
  const sliderVisibleCount =
    sliderRestore?.visibleCount ??
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
          sliderRestore?.itemCount ?? 0,
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
  const sliderRestoreRuntime: SliderRestoreRuntimeOptions | null = React.useMemo(() => {
    if (!sliderRestore || sliderRestore.enabled === false || !hasSliderLayout) return null;
    const itemCount = Math.max(0, Math.floor(sliderRestore.itemCount));
    if (itemCount <= 0 || sliderSlotCount <= 0) return null;

    return {
      enabled: true,
      storageKeyId:
        typeof sliderRestore.key === "string" && sliderRestore.key.trim()
          ? sliderRestore.key.trim()
          : scopeId,
      ttlMs:
        typeof sliderRestore.ttlMs === "number" && Number.isFinite(sliderRestore.ttlMs)
          ? Math.max(0, sliderRestore.ttlMs)
          : DEFAULT_SLIDER_RESTORE_TTL_MS,
      slideCount: itemCount,
      skeletonSlotCount: Math.max(itemCount, sliderSlotCount),
      scopeId,
      routeKey: effectiveCache?.routeKey,
    };
  }, [
    effectiveCache?.routeKey,
    hasSliderLayout,
    scopeId,
    sliderRestore?.enabled,
    sliderRestore?.itemCount,
    sliderRestore?.key,
    sliderRestore?.ttlMs,
    sliderSlotCount,
  ]);
  const cachedSliderRestoreState = React.useMemo(() => {
    if (!validCacheSnapshot?.slider?.restore || !sliderRestoreRuntime?.enabled) {
      return null;
    }

    const state = validateSliderRestoreState(validCacheSnapshot.slider.restore, {
      ttlMs: sliderRestoreRuntime.ttlMs,
      slideCount: sliderRestoreRuntime.slideCount,
      skeletonSlotCount: sliderRestoreRuntime.skeletonSlotCount,
      storageKeyId: sliderRestoreRuntime.storageKeyId,
      routeKey: validCacheSnapshot.routeKey,
      scopeId: validCacheSnapshot.scopeId,
    });
    return isMeaningfulSliderRestoreState(state) ? state : null;
  }, [sliderRestoreRuntime, validCacheSnapshot]);
  const shouldUseCacheInitialRestore =
    !!effectiveCache?.key && !!cachedSliderRestoreState;
  const canSeedCacheInitialRestore =
    shouldUseCacheInitialRestore &&
    React.isValidElement(children) &&
    typeof children.type !== "string" &&
    children.type !== React.Fragment &&
    (children.props as { initialIndex?: unknown }).initialIndex == null;
  const shouldApplySliderRestoreEffect =
    !!sliderRestoreRuntime?.enabled &&
    (!shouldUseCacheInitialRestore || !canSeedCacheInitialRestore);
  const shouldGateSliderRestore =
    !!sliderRestoreHandleRef &&
    shouldApplySliderRestoreEffect &&
    (!effectiveCache?.key || !!cachedSliderRestoreState);
  const sliderRestoreGateKey = shouldGateSliderRestore
    ? [
        sliderRestoreRuntime?.storageKeyId ?? "",
        sliderRestoreRuntime?.slideCount ?? "",
        sliderRestoreRuntime?.skeletonSlotCount ?? "",
        JSON.stringify(sliderRestore?.visibleCount ?? null),
        sliderRestore?.loop === true ? "loop" : "no-loop",
        sliderRestore?.activeSlotOffset ?? "",
        cachedSliderRestoreState
          ? [
              cachedSliderRestoreState.routeKey ?? "",
              cachedSliderRestoreState.index,
              cachedSliderRestoreState.heightPx ?? "",
              cachedSliderRestoreState.wasAtBottom ? "bottom" : "",
            ].join("/")
          : "standalone",
      ].join(":")
    : "";
  const cachedSliderRestoreIndex = cachedSliderRestoreState?.index ?? null;
  const cachedSliderRestoreHeightPx = cachedSliderRestoreState?.heightPx ?? null;
  const [sliderRestoreIndex, setSliderRestoreIndex] = React.useState<number | null>(
    () => cachedSliderRestoreIndex
  );
  const [sliderRestoreHeightPx, setSliderRestoreHeightPx] = React.useState<number | null>(
    () => cachedSliderRestoreHeightPx
  );
  const [sliderRestoreSettled, setSliderRestoreSettled] = React.useState(
    () => !shouldGateSliderRestore
  );
  const sliderRestoreIndexRef = React.useRef(sliderRestoreIndex);
  const sliderRestoreHeightPxRef = React.useRef(sliderRestoreHeightPx);
  const sliderRestoreSettledRef = React.useRef(sliderRestoreSettled);
  const setSliderRestoreIndexIfChanged = React.useCallback((next: number | null) => {
    if (Object.is(sliderRestoreIndexRef.current, next)) return;
    sliderRestoreIndexRef.current = next;
    setSliderRestoreIndex(next);
  }, []);
  const setSliderRestoreHeightPxIfChanged = React.useCallback(
    (next: number | null) => {
      if (Object.is(sliderRestoreHeightPxRef.current, next)) return;
      sliderRestoreHeightPxRef.current = next;
      setSliderRestoreHeightPx(next);
    },
    []
  );
  const setSliderRestoreSettledIfChanged = React.useCallback((next: boolean) => {
    if (sliderRestoreSettledRef.current === next) return;
    sliderRestoreSettledRef.current = next;
    setSliderRestoreSettled(next);
  }, []);
  const contentReady =
    ready === true && (!shouldGateSliderRestore || sliderRestoreSettled);
  const sliderRestoreCache = React.useMemo<SkeletonCacheOptions | null>(() => {
    if (!effectiveCache?.key) return null;

    const cookie = effectiveCache.cookie
      ? {
          ...(effectiveCache.cookie.path != null
            ? { path: effectiveCache.cookie.path }
            : null),
          ...(effectiveCache.cookie.sameSite != null
            ? { sameSite: effectiveCache.cookie.sameSite }
            : null),
          ...(effectiveCache.cookie.secure != null
            ? { secure: effectiveCache.cookie.secure }
            : null),
          ...(effectiveCache.cookie.maxCookieBytes != null
            ? { maxCookieBytes: effectiveCache.cookie.maxCookieBytes }
            : null),
          ...(effectiveCache.cookie.maxTotalCookieBytes != null
            ? { maxTotalCookieBytes: effectiveCache.cookie.maxTotalCookieBytes }
            : null),
        }
      : undefined;

    return {
      key: effectiveCache.key,
      ...(effectiveCache.ttlMs != null ? { ttlMs: effectiveCache.ttlMs } : null),
      ...(effectiveCache.debounceMs != null
        ? { debounceMs: effectiveCache.debounceMs }
        : null),
      ...(effectiveCache.routeKey != null
        ? { routeKey: effectiveCache.routeKey }
        : null),
      ...(cookie ? { cookie } : null),
    };
  }, [
    effectiveCache?.cookie?.maxCookieBytes,
    effectiveCache?.cookie?.maxTotalCookieBytes,
    effectiveCache?.cookie?.path,
    effectiveCache?.cookie?.sameSite,
    effectiveCache?.cookie?.secure,
    effectiveCache?.debounceMs,
    effectiveCache?.key,
    effectiveCache?.routeKey,
    effectiveCache?.ttlMs,
  ]);
  const getSliderRestoreSnapshot = React.useCallback(() => {
    if (!sliderRestoreRuntime?.enabled || !sliderRestoreHandleRef) return null;
    if (typeof window === "undefined") return null;

    const handle = sliderRestoreHandleRef.current;
    if (!handle || !handle.isReady()) return null;

    const viewport = handle.getViewportNode();
    const heightPx = viewport?.getBoundingClientRect().height;
    if (!Number.isFinite(heightPx) || (heightPx ?? 0) <= 0) return null;

    return createSliderRestoreStateForWindow(
      sliderRestoreRuntime,
      {
        index: handle.getIndex(),
        slideCount: sliderRestoreRuntime.slideCount,
        skeletonSlotCount: sliderRestoreRuntime.skeletonSlotCount,
        heightPx,
      },
      window
    );
  }, [sliderRestoreHandleRef, sliderRestoreRuntime]);
  const writeSliderRestoreSnapshot = React.useCallback((restoreSnapshot = getSliderRestoreSnapshot()) => {
    if (!sliderRestoreRuntime?.enabled) return false;
    if (!restoreSnapshot) return false;

    if (sliderRestoreCache?.key) {
      return updateSkeletonCacheSliderRestoreCookie({
        cache: sliderRestoreCache,
        kind: "slider",
        scopeId,
        restore: restoreSnapshot,
      });
    }

    writeSliderRestoreStateToWindow(sliderRestoreRuntime, restoreSnapshot);
    return true;
  }, [
    getSliderRestoreSnapshot,
    scopeId,
    sliderRestoreCache,
    sliderRestoreRuntime,
  ]);
  useSkeletonCacheWriter({
    cache: effectiveCache,
    kind: "slider",
    scopeId,
    textIds: contentReady ? textIds : [],
    skeletonRootRef,
    shellRef,
    getSliderRestoreSnapshot,
  });
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
      slotOrderForCount:
        sliderRestoreIndex == null || !sliderRestoreRuntime?.enabled || !sliderRestore
          ? undefined
          : (count) =>
              getSliderRestoreVisibleSlots({
                activeIndex: sliderRestoreIndex,
                visibleCount: count,
                slotCount: sliderRestoreRuntime.skeletonSlotCount,
                loop: sliderRestore.loop === true,
                activeSlotOffset:
                  sliderRestore.activeSlotOffset ??
                  (typeof sliderLayout.initialHeightSlot === "number"
                    ? sliderLayout.initialHeightSlot
                    : 0),
              }),
    });
  }, [
    effectiveBreakpoints,
    scopeId,
    sliderCenterFirstSpacer,
    sliderFallbackCount,
    sliderLayout,
    sliderMaxSlots,
    sliderRestore,
    sliderRestoreIndex,
    sliderRestoreRuntime,
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
      cacheSnapshot: validCacheSnapshot,
    });
  }, [
    effectiveBreakpoints,
    scopeId,
    sliderCenterFirstSpacer,
    sliderCountCss.ssrBaseCount,
    sliderLayout,
    sliderSpec,
    validCacheSnapshot,
    sliderVisibleCount,
  ]);
  const sliderRestoreStaticCss = React.useMemo(() => {
    if (!cachedSliderRestoreState || !sliderRestoreRuntime?.enabled || !sliderRestore || !sliderLayout) {
      return "";
    }
    if (canSeedCacheInitialRestore) return "";

    return buildSliderRestoreCss({
      scopeId,
      storageKeyId: sliderRestoreRuntime.storageKeyId,
      ttlMs: sliderRestoreRuntime.ttlMs,
      slideCount: sliderRestoreRuntime.slideCount,
      skeletonSlotCount: sliderRestoreRuntime.skeletonSlotCount,
      maxSlots: sliderMaxSlots,
      loop: sliderRestore.loop === true,
      activeSlotOffset:
        sliderRestore.activeSlotOffset ??
        (typeof sliderLayout.initialHeightSlot === "number"
          ? sliderLayout.initialHeightSlot
          : 0),
      responsiveCount: sliderVisibleCount,
      fallbackCount: sliderCountCss.ssrBaseCount,
      breakpointMap: effectiveBreakpoints,
      state: cachedSliderRestoreState,
      dotStyles: collectSliderDotRestoreStyles(sliderLayout),
    });
  }, [
    cachedSliderRestoreState,
    canSeedCacheInitialRestore,
    effectiveBreakpoints,
    scopeId,
    sliderCountCss.ssrBaseCount,
    sliderLayout,
    sliderMaxSlots,
    sliderRestore?.activeSlotOffset,
    sliderRestore?.enabled,
    sliderRestore?.loop,
    sliderRestoreRuntime,
    sliderVisibleCount,
  ]);
  const sliderRestoreScript = React.useMemo(() => {
    if (!sliderRestoreRuntime?.enabled || !sliderRestore || !sliderLayout) return "";
    if (canSeedCacheInitialRestore) return "";
    if (effectiveCache?.key && !cachedSliderRestoreState) return "";
    return buildSliderRestoreScript({
      scopeId,
      storageKeyId: sliderRestoreRuntime.storageKeyId,
      ttlMs: sliderRestoreRuntime.ttlMs,
      slideCount: sliderRestoreRuntime.slideCount,
      skeletonSlotCount: sliderRestoreRuntime.skeletonSlotCount,
      maxSlots: sliderMaxSlots,
      loop: sliderRestore.loop === true,
      activeSlotOffset:
        sliderRestore.activeSlotOffset ??
        (typeof sliderLayout.initialHeightSlot === "number"
          ? sliderLayout.initialHeightSlot
          : 0),
      responsiveCount: sliderVisibleCount,
      fallbackCount: sliderCountCss.ssrBaseCount,
      breakpointMap: effectiveBreakpoints,
      dotStyles: collectSliderDotRestoreStyles(sliderLayout),
      state: cachedSliderRestoreState,
    });
  }, [
    cachedSliderRestoreState,
    canSeedCacheInitialRestore,
    effectiveCache?.key,
    effectiveBreakpoints,
    scopeId,
    sliderCountCss.ssrBaseCount,
    sliderLayout,
    sliderMaxSlots,
    sliderRestore?.activeSlotOffset,
    sliderRestore?.enabled,
    sliderRestore?.loop,
    sliderRestoreRuntime,
    sliderVisibleCount,
  ]);
  const sliderRestoreHeightCss = React.useMemo(
    () => buildScopedRestoredSliderHeightCss(scopeId, sliderRestoreHeightPx),
    [scopeId, sliderRestoreHeightPx]
  );

  const appliedSliderRestoreKeyRef = React.useRef<string | null>(null);

  React.useLayoutEffect(() => {
    setSliderRestoreSettledIfChanged(!shouldGateSliderRestore);
    setSliderRestoreIndexIfChanged(cachedSliderRestoreIndex);
    setSliderRestoreHeightPxIfChanged(cachedSliderRestoreHeightPx);
  }, [
    cachedSliderRestoreHeightPx,
    cachedSliderRestoreIndex,
    shouldGateSliderRestore,
    sliderRestoreGateKey,
    setSliderRestoreHeightPxIfChanged,
    setSliderRestoreIndexIfChanged,
    setSliderRestoreSettledIfChanged,
  ]);

  React.useLayoutEffect(() => {
    if (!shouldApplySliderRestoreEffect) return;
    if (!sliderRestoreRuntime?.enabled || !sliderRestoreHandleRef) return;
    if (typeof window === "undefined") return;

    let rafId: number | null = null;
    let cancelled = false;

    const settleRestore = () => {
      removeSliderRestoreStyle(scopeId);
      setSliderRestoreSettledIfChanged(true);
    };

    const tryApply = () => {
      if (cancelled) return;

      const handle = sliderRestoreHandleRef.current;
      if (!handle) {
        rafId = window.requestAnimationFrame(tryApply);
        return;
      }

      const state = validCacheSnapshot
        ? readSliderRestoreStateFromCache(
            validCacheSnapshot,
            sliderRestoreRuntime,
            window
          )
        : readSliderRestoreStateFromWindow(sliderRestoreRuntime, window);
      if (!state) {
        removeSliderRestoreStyle(scopeId);
        setSliderRestoreIndexIfChanged(null);
        setSliderRestoreHeightPxIfChanged(null);
        setSliderRestoreSettledIfChanged(true);
        return;
      }
      setSliderRestoreIndexIfChanged(state.index);
      setSliderRestoreHeightPxIfChanged(state.heightPx ?? null);

      const restoreKey = [
        sliderRestoreRuntime.storageKeyId,
        state.routeKey ?? "",
        state.index,
        state.heightPx ?? "",
        state.viewportWidth,
        state.slideCount,
        state.skeletonSlotCount,
        state.wasAtBottom ? "bottom" : "",
      ].join(":");

      if (appliedSliderRestoreKeyRef.current !== restoreKey) {
        handle.setIndex(state.index, "instant");
      }

      if (appliedSliderRestoreKeyRef.current === restoreKey) {
        settleRestore();
        return;
      }

      if (!handle.isReady()) {
        rafId = window.requestAnimationFrame(tryApply);
        return;
      }

      const latestHandle = sliderRestoreHandleRef.current;
      if (!latestHandle?.isReady()) {
        rafId = window.requestAnimationFrame(tryApply);
        return;
      }

      appliedSliderRestoreKeyRef.current = restoreKey;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        if (cancelled) return;
        sliderRestoreHandleRef.current?.setIndex(state.index, "instant");
        rafId = window.requestAnimationFrame(() => {
          rafId = null;
          if (cancelled) return;
          rafId = window.requestAnimationFrame(() => {
            rafId = null;
            if (!cancelled) settleRestore();
          });
        });
      });
    };

    tryApply();

    return () => {
      cancelled = true;
      if (rafId != null) window.cancelAnimationFrame(rafId);
      removeSliderRestoreStyle(scopeId);
    };
  }, [
    shouldApplySliderRestoreEffect,
    scopeId,
    setSliderRestoreHeightPxIfChanged,
    setSliderRestoreIndexIfChanged,
    setSliderRestoreSettledIfChanged,
    sliderRestoreHandleRef,
    sliderRestoreRuntime,
    validCacheSnapshot,
  ]);

  React.useEffect(() => {
    if (!sliderRestoreRuntime?.enabled || !sliderRestoreHandleRef) return;
    if (typeof window === "undefined") return;

    const write = () => {
      writeSliderRestoreSnapshot();
    };

    window.addEventListener("pagehide", write);
    window.addEventListener("beforeunload", write);
    return () => {
      write();
      window.removeEventListener("pagehide", write);
      window.removeEventListener("beforeunload", write);
    };
  }, [
    sliderRestoreHandleRef,
    sliderRestoreRuntime,
    writeSliderRestoreSnapshot,
  ]);

  React.useEffect(() => {
    if (!contentReady || !sliderRestoreRuntime?.enabled || !sliderRestoreHandleRef) {
      return;
    }
    if (typeof window === "undefined") return;

    const restoreHandleRef = sliderRestoreHandleRef;
    let rafId = 0;
    let timeoutId = 0;
    let intervalId = 0;
    let disposed = false;
    let attachedHandle: SliderHandle | null = null;
    let attachedViewport: HTMLElement | null = null;
    let offIndex: (() => void) | null = null;
    let offReady: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let lastWrittenKey: string | null = null;

    const cancelPending = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = 0;
      }
    };
    function cleanupHandleListeners() {
      offIndex?.();
      offIndex = null;
      offReady?.();
      offReady = null;
      attachedViewport?.removeEventListener("transitionend", onTransitionEnd);
      attachedViewport = null;
      resizeObserver?.disconnect();
      resizeObserver = null;
      attachedHandle = null;
    }
    const snapshotKey = (snapshot: NonNullable<ReturnType<typeof getSliderRestoreSnapshot>>) =>
      [
        snapshot.index,
        snapshot.heightPx == null
          ? ""
          : Math.round((snapshot.heightPx + Number.EPSILON) * 1000) / 1000,
        snapshot.viewportWidth,
      ].join(":");
    const writeIfChanged = (
      snapshot: NonNullable<ReturnType<typeof getSliderRestoreSnapshot>>
    ) => {
      const key = snapshotKey(snapshot);
      if (key === lastWrittenKey) return;
      if (writeSliderRestoreSnapshot(snapshot)) lastWrittenKey = key;
    };

    function attachHandleListeners() {
      const handle = restoreHandleRef.current;
      if (!handle || handle === attachedHandle) return;

      cleanupHandleListeners();
      attachedHandle = handle;
      attachedViewport = handle.getViewportNode();
      offIndex = handle.onIndexChange(() => {
        scheduleStableWrite();
      });
      offReady = handle.onReady(() => {
        scheduleStableWrite();
      });
      attachedViewport?.addEventListener("transitionend", onTransitionEnd);

      if (attachedViewport && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          scheduleStableWrite();
        });
        resizeObserver.observe(attachedViewport);
      }
    }

    function scheduleStableWrite(delayMs = 0) {
      attachHandleListeners();
      cancelPending();

      timeoutId = window.setTimeout(() => {
        timeoutId = 0;
        const startedAt = window.performance?.now?.() ?? Date.now();
        let lastHeight: number | null = null;
        let stableFrames = 0;

        const sample = () => {
          rafId = 0;
          if (disposed) return;

          attachHandleListeners();
          const snapshot = getSliderRestoreSnapshot();
          const height = snapshot?.heightPx ?? 0;
          if (Number.isFinite(height) && height > 0) {
            if (lastHeight != null && Math.abs(height - lastHeight) < 0.25) {
              stableFrames += 1;
            } else {
              stableFrames = 0;
            }
            lastHeight = height;
          }

          const now = window.performance?.now?.() ?? Date.now();
          if (stableFrames >= 2 || now - startedAt > 1200) {
            if (snapshot) writeIfChanged(snapshot);
            return;
          }

          rafId = window.requestAnimationFrame(sample);
        };

        rafId = window.requestAnimationFrame(sample);
      }, delayMs);
    }

    function onTransitionEnd(event: TransitionEvent) {
      if (event.propertyName && event.propertyName !== "height") return;
      scheduleStableWrite();
    }

    attachHandleListeners();
    scheduleStableWrite();
    intervalId = window.setInterval(() => {
      attachHandleListeners();
      scheduleStableWrite();
    }, 250);

    return () => {
      disposed = true;
      cancelPending();
      if (intervalId) window.clearInterval(intervalId);
      cleanupHandleListeners();
    };
  }, [
    contentReady,
    getSliderRestoreSnapshot,
    sliderRestoreHandleRef,
    sliderRestoreRuntime,
    writeSliderRestoreSnapshot,
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
        {sliderCountCss.cssText ||
        sliderInitialHeightCss ||
        sliderRestoreHeightCss ? (
          <style
            dangerouslySetInnerHTML={{
              __html: [
                sliderCountCss.cssText,
                sliderInitialHeightCss,
                sliderRestoreHeightCss,
              ]
                .filter(Boolean)
                .join("\n"),
            }}
          />
        ) : null}
        {sliderRestoreStaticCss ? (
          <style
            media="not all"
            data-rmg-slider-restore-static={scopeId}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: sliderRestoreStaticCss }}
          />
        ) : null}
        {sliderRestoreScript ? (
          <script dangerouslySetInnerHTML={{ __html: sliderRestoreScript }} />
        ) : null}
        <SliderSkeletonCard
          count={sliderCountCss.ssrBaseCount}
          maxSlots={sliderMaxSlots}
          activeDotIndex={sliderRestoreIndex ?? undefined}
          spec={sliderSpec}
          breakpoints={effectiveBreakpoints}
          centerFirst={sliderCenterFirst}
          hasLeadingSpacer={sliderCenterFirstSpacer}
          responsiveCssScopeSelector={`[data-rmg-scope="${scopeId}"]`}
          cacheSnapshot={validCacheSnapshot}
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
  const renderedChildren = React.useMemo(() => {
    if (!canSeedCacheInitialRestore || !cachedSliderRestoreState) {
      return children;
    }
    if (!React.isValidElement(children)) return children;

    return React.cloneElement(children, {
      initialIndex: cachedSliderRestoreState.index,
    } as Record<string, unknown>);
  }, [cachedSliderRestoreState, canSeedCacheInitialRestore, children]);

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
        ready={contentReady}
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
        shellRef={shellRef}
      >
        {renderedChildren}
      </SkeletonFrame>
    </div>
  );
}

export default SliderSkeleton;

export type {
  SliderSkeletonNode,
  SliderSkeletonSlot,
  SliderSkeletonSpec,
  SkeletonNode,
} from "../slider/SliderSkeleton";
