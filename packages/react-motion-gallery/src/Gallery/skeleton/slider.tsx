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
import {
  cssLen,
  shimmerStyleVars,
  type SkeletonLength,
  type SkeletonShimmer,
} from "../shared/skeleton/layout";
import { buildStableScopeId } from "../shared/stableScope";
import {
  DEFAULT_SLIDER_RESTORE_TTL_MS,
  buildSliderRestoreScript,
  getSliderRestoreVisibleSlots,
  readSliderRestoreStateFromWindow,
  writeSliderRestoreStateToWindow,
  type SliderRestoreRuntimeOptions,
} from "../slider/SliderRestore";
import {
  SliderSkeletonCard,
  applySliderSkeletonTextSnapshot,
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
  type SliderSkeletonNode,
  type SliderSkeletonSliderNode,
  type SliderSkeletonSpec,
} from "../slider/SliderSkeleton";
import type { SliderHandle } from "../slider/types";
import {
  SkeletonFrame,
  type SkeletonForceOptions,
  type SkeletonTimingOptions,
} from "./base";
import type { SkeletonCacheOptions } from "./cache";
import { validateSkeletonCacheSnapshot } from "./cache";
import {
  resolveSkeletonCacheOptions,
  useSkeletonCacheContext,
} from "./cache-context";
import { useSkeletonCacheWriter } from "./cache-writer";

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
    .querySelectorAll<HTMLStyleElement>("style[data-rmg-slider-restore-style]")
    .forEach((style) => {
      if (style.getAttribute("data-rmg-slider-restore-style") === scopeId) {
        style.remove();
      }
    });
}

function buildScopedRestoredSliderHeightCss(scopeId: string, heightPx: number | null) {
  if (heightPx == null || !Number.isFinite(heightPx) || heightPx <= 0) return "";

  const h = Math.round((heightPx + Number.EPSILON) * 1000) / 1000;
  return `${buildSliderShellScopeSelector(scopeId)}{--rmg-slider-initial-height:${h}px!important;--rmg-slider-row-height:${h}px!important;}`;
}

export function buildScopedInitialHeightCss(args: {
  scopeId: string;
  skeletonSpec: SliderSkeletonSpec;
  responsiveCount: ResponsiveNumber | undefined;
  fallbackCount: number;
  breakpointMap: BreakpointMap;
  centerFirstSpacer?: boolean;
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

  const mkRule = (count: number, minWidth: number) => {
    const totalExpr = buildInitialHeightFromSkeletonSpecCssExpr(
      layout,
      count,
      mode,
      minWidth,
      args.breakpointMap
    );
    const rowExpr = buildRowHeightFromSkeletonSpecCssExpr(
      layout,
      count,
      mode,
      minWidth,
      args.breakpointMap
    );
    const extrasExpr = buildExtrasHeightFromSkeletonSpecCssExpr(
      layout,
      minWidth,
      args.breakpointMap
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
      const rule = mkRule(resolveCountAtMinWidth(minWidth), minWidth);
      if (!rule) return "";
      return minWidth <= 0 ? rule : `@media (min-width:${minWidth}px){${rule}}`;
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
  const textIds = React.useMemo(
    () => Array.from(collectSliderSkeletonTextIds(sliderSpec?.layout)),
    [sliderSpec]
  );
  const validCacheSnapshot = validateSkeletonCacheSnapshot(
    effectiveCache?.snapshot,
    {
      key: effectiveCache?.key,
      scopeId,
      kind: "slider",
      routeKey: effectiveCache?.routeKey,
      ttlMs: effectiveCache?.ttlMs,
      textIds,
    }
  );
  const effectiveSliderSpec = React.useMemo(() => {
    if (!validCacheSnapshot?.text || !sliderSpec?.layout) return sliderSpec;
    return {
      ...sliderSpec,
      layout: applySliderSkeletonTextSnapshot(
        sliderSpec.layout,
        validCacheSnapshot.text,
        effectiveBreakpoints
      ) as SliderSkeletonNode,
    } as SliderSkeletonSpec;
  }, [effectiveBreakpoints, sliderSpec, validCacheSnapshot]);
  const sliderLayout = effectiveSliderSpec?.layout?.kind === "slider"
    ? (effectiveSliderSpec.layout as SliderSkeletonSliderNode)
    : null;
  const skeletonRootRef = React.useRef<HTMLDivElement | null>(null);
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  useSkeletonCacheWriter({
    cache: effectiveCache,
    kind: "slider",
    scopeId,
    textIds,
    skeletonRootRef,
    shellRef,
  });
  const sliderRestore = restore?.kind === "slider" ? restore : null;
  const sliderRestoreHandleRef = sliderRestore?.slider?.handleRef ?? null;
  const sliderRestoreGateKey =
    sliderRestore &&
    sliderRestore.enabled !== false &&
    sliderRestore.slider?.handleRef
      ? [
          sliderRestore.key ?? "",
          sliderRestore.itemCount,
          JSON.stringify(sliderRestore.visibleCount ?? null),
          sliderRestore.loop === true ? "loop" : "no-loop",
          sliderRestore.activeSlotOffset ?? "",
        ].join(":")
      : "";
  const shouldGateSliderRestore = sliderRestoreGateKey !== "";
  const [sliderRestoreSettled, setSliderRestoreSettled] = React.useState(
    () => !shouldGateSliderRestore
  );
  const [sliderRestoreIndex, setSliderRestoreIndex] = React.useState<number | null>(null);
  const [sliderRestoreHeightPx, setSliderRestoreHeightPx] = React.useState<number | null>(null);
  const contentReady =
    ready === true && (!shouldGateSliderRestore || sliderRestoreSettled);
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
    effectiveSliderSpec?.centering === "first" &&
    (effectiveSliderSpec?.mode ?? "fit") === "peek";
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
    };
  }, [
    hasSliderLayout,
    scopeId,
    sliderRestore?.enabled,
    sliderRestore?.itemCount,
    sliderRestore?.key,
    sliderRestore?.ttlMs,
    sliderSlotCount,
  ]);
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
    if (!sliderLayout || !effectiveSliderSpec) return "";
    return buildScopedInitialHeightCss({
      scopeId,
      skeletonSpec: effectiveSliderSpec,
      responsiveCount: sliderVisibleCount,
      fallbackCount: sliderCountCss.ssrBaseCount,
      breakpointMap: effectiveBreakpoints,
      centerFirstSpacer: sliderCenterFirstSpacer,
    });
  }, [
    effectiveBreakpoints,
    scopeId,
    sliderCenterFirstSpacer,
    sliderCountCss.ssrBaseCount,
    sliderLayout,
    effectiveSliderSpec,
    sliderVisibleCount,
  ]);
  const sliderRestoreScript = React.useMemo(() => {
    if (!sliderRestoreRuntime?.enabled || !sliderRestore || !sliderLayout) return "";
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
    });
  }, [
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
    setSliderRestoreSettled(!shouldGateSliderRestore);
    setSliderRestoreIndex(null);
    setSliderRestoreHeightPx(null);
  }, [shouldGateSliderRestore, sliderRestoreGateKey]);

  React.useLayoutEffect(() => {
    if (!sliderRestoreRuntime?.enabled || !sliderRestoreHandleRef) return;
    if (typeof window === "undefined") return;

    let rafId: number | null = null;
    let cancelled = false;

    const tryApply = () => {
      if (cancelled) return;

      const handle = sliderRestoreHandleRef.current;
      if (!handle) {
        rafId = window.requestAnimationFrame(tryApply);
        return;
      }

      const state = readSliderRestoreStateFromWindow(
        sliderRestoreRuntime,
        window,
        { requireNavigationRestore: false }
      );
      if (!state) {
        removeSliderRestoreStyle(scopeId);
        setSliderRestoreIndex(null);
        setSliderRestoreHeightPx(null);
        setSliderRestoreSettled(true);
        return;
      }
      setSliderRestoreIndex(state.index);
      setSliderRestoreHeightPx(state.heightPx ?? null);
      removeSliderRestoreStyle(scopeId);

      const restoreKey = [
        sliderRestoreRuntime.storageKeyId,
        state.timestamp,
        state.index,
        state.heightPx ?? "",
      ].join(":");

      if (appliedSliderRestoreKeyRef.current !== restoreKey) {
        handle.setIndex(state.index, "instant");
      }

      if (appliedSliderRestoreKeyRef.current === restoreKey) {
        setSliderRestoreSettled(true);
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
            if (!cancelled) setSliderRestoreSettled(true);
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
  }, [scopeId, sliderRestoreHandleRef, sliderRestoreRuntime]);

  React.useEffect(() => {
    if (!sliderRestoreRuntime?.enabled || !sliderRestoreHandleRef) return;
    if (typeof window === "undefined") return;

    const write = () => {
      const handle = sliderRestoreHandleRef.current;
      if (!handle) return;
      const viewport = handle.getViewportNode();
      const heightPx = viewport?.getBoundingClientRect().height;
      writeSliderRestoreStateToWindow(sliderRestoreRuntime, {
        index: handle.getIndex(),
        slideCount: sliderRestoreRuntime.slideCount,
        skeletonSlotCount: sliderRestoreRuntime.skeletonSlotCount,
        heightPx: heightPx && heightPx > 0 ? heightPx : undefined,
      });
    };

    window.addEventListener("pagehide", write);
    window.addEventListener("beforeunload", write);
    return () => {
      write();
      window.removeEventListener("pagehide", write);
      window.removeEventListener("beforeunload", write);
    };
  }, [sliderRestoreHandleRef, sliderRestoreRuntime]);

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
    sliderLayout && effectiveSliderSpec ? (
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
        {sliderCountCss.cssText || sliderInitialHeightCss || sliderRestoreHeightCss ? (
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
        <SliderSkeletonCard
          count={sliderCountCss.ssrBaseCount}
          maxSlots={sliderMaxSlots}
          activeDotIndex={sliderRestoreIndex ?? undefined}
          spec={effectiveSliderSpec}
          breakpoints={effectiveBreakpoints}
          centerFirst={sliderCenterFirst}
          hasLeadingSpacer={sliderCenterFirstSpacer}
          responsiveCssScopeSelector={`[data-rmg-scope="${scopeId}"]`}
          cacheSnapshot={validCacheSnapshot}
        />
        {sliderRestoreScript ? (
          <script dangerouslySetInnerHTML={{ __html: sliderRestoreScript }} />
        ) : null}
      </div>
    ) : null;
  const sliderScopeStyle: React.CSSProperties = {
    containerType: "inline-size",
    width: "100%",
  };
  const loadingShellStyle = sliderLayout
    ? ({
        minHeight: "var(--rmg-slider-initial-height, var(--rmg-slider-height, 320px))",
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
        {children}
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
