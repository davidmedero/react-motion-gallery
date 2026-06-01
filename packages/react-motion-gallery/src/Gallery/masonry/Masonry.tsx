"use client";

import * as React from "react";
import styles from "./Masonry.module.css";
import type { BreakpointMap, ResponsiveNumber } from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import { usePrefersReducedMotion } from "../shared/hooks/usePrefersReducedMotion";
import {
  BREAKPOINT_MAP,
  parseNumberLike,
  resolveNumberFromResponsive,
} from "../shared/responsive";
import {
  useAbsoluteVirtualRange,
  type DataVirtualizationOptions,
} from "../shared/dataPlugins";
import { resolveLoadingForceOptions } from "../shared/loading/force";
import { useSkeletonRevealGate } from "../shared/loading/skeletonRevealGate";
import {
  useDoublePaintReady,
  useElementInViewOnce,
  waitForElementMediaReady,
} from "../shared/itemLifecycle";
import { useItemRevealScheduler } from "../shared/itemRevealScheduler";
import {
  buildMasonryColumnLayout,
  buildMasonryColumnWidthCssExpr,
  buildMasonryItemLeftCssExpr,
  buildMasonryItemWidthCssExpr,
  buildMasonryPositionedLayout,
} from "./prediction";
import { resolveMasonrySpanAtWidth } from "./item";
import type {
  MasonryLoadingOptions,
  MasonryPlugin,
  ResponsiveMasonrySpan,
  RevealOptions,
} from "./types";

export type MasonryClassNames = {
  root?: string;
  column?: string;
  item?: string;
};

export type MasonryPlacement = "balanced" | "roundRobin" | "horizontalOrder";

export type MasonryProps = {
  items: React.ReactNode[];
  masonrySpans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
  masonryColumns?: ResponsiveNumber;
  masonryGap?: ResponsiveNumber;
  masonryPlacement?: MasonryPlacement;
  masonryInitialHeights?: ReadonlyArray<number | undefined>;
  masonryClassNames?: MasonryClassNames;
  masonryStyle?: React.CSSProperties;
  masonryAs?: React.ElementType;
  masonryRootRef?: React.Ref<any>;
  breakpoints?: BreakpointMap;
  masonryPlugins?: MasonryPlugin[];
  masonryItemIndices?: ReadonlyArray<number | undefined>;
  masonryItemRevealKeys?: ReadonlyArray<React.Key | undefined>;
  masonryItemPlaceholders?: ReadonlyArray<boolean | undefined>;
  masonryVirtualization?: DataVirtualizationOptions;
  masonryLoading?: MasonryLoadingOptions;
  masonryReveal?: RevealOptions;
  masonryRevealReady?: boolean;
  responsiveViewportWidth?: number;
  onVisibleIndex?: (index: number) => void;
  onLayoutMeasured?: (measured: boolean) => void;
  measurementKey?: string;
  revealedIndicesRef?: React.RefObject<Set<number>>;
  masonryLayoutSeedScopeId?: string;
};

export { buildMasonryColumnLayout } from "./prediction";

export function resolveMasonrySeedHeight(args: {
  index: number;
  previousHeight?: number;
  initialHeights?: ReadonlyArray<number | undefined>;
  preferPreviousHeight?: boolean;
}) {
  if (
    args.preferPreviousHeight &&
    Number.isFinite(args.previousHeight) &&
    Number(args.previousHeight) >= 0
  ) {
    return Number(args.previousHeight);
  }

  const predicted = args.initialHeights?.[args.index];
  if (Number.isFinite(predicted) && Number(predicted) > 0) {
    return Number(predicted);
  }

  return args.previousHeight ?? 0;
}

export function seedUnmeasuredMasonryHeights(args: {
  itemCount: number;
  previousHeights: number[];
  measuredIndices: Set<number>;
  initialHeights?: ReadonlyArray<number | undefined>;
  preferPreviousHeights?: boolean;
}) {
  const next = args.previousHeights.slice(0, args.itemCount);
  let changed = next.length !== args.previousHeights.length;

  for (let index = 0; index < args.itemCount; index++) {
    if (args.measuredIndices.has(index) && Number.isFinite(next[index])) {
      continue;
    }

    const seededHeight = resolveMasonrySeedHeight({
      index,
      previousHeight: next[index],
      initialHeights: args.initialHeights,
      preferPreviousHeight: args.preferPreviousHeights,
    });

    if (next[index] !== seededHeight) {
      next[index] = seededHeight;
      changed = true;
    }
  }

  return changed ? next : args.previousHeights;
}

function stableMasonryInitialHeightsKey(
  heights: ReadonlyArray<number | undefined> | undefined,
) {
  if (!heights?.length) return "";

  return heights
    .map((height) =>
      Number.isFinite(height) ? Math.round(Number(height) * 1000) / 1000 : "",
    )
    .join(",");
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else if (typeof ref === "object") (ref as any).current = value;
}

export const MasonryCore: React.FC<MasonryProps> = ({
  items,
  masonrySpans,
  masonryColumns,
  masonryGap,
  masonryPlacement = "balanced",
  masonryInitialHeights,
  masonryClassNames,
  masonryStyle,
  masonryAs: RootComponent = "div",
  masonryRootRef,
  breakpoints,
  masonryPlugins,
  masonryItemIndices,
  masonryItemRevealKeys,
  masonryItemPlaceholders,
  masonryVirtualization,
  masonryLoading,
  masonryReveal,
  masonryRevealReady,
  responsiveViewportWidth,
  onVisibleIndex,
  onLayoutMeasured,
  measurementKey,
  revealedIndicesRef,
  masonryLayoutSeedScopeId,
}) => {
  const DEFAULT_MASONRY_COLUMNS = 4;
  const DEFAULT_MASONRY_GAP_PX = 8;
  const liveViewportWidth = useViewportWidth();
  const viewportWidth = responsiveViewportWidth ?? liveViewportWidth;
  const localRootRef = React.useRef<HTMLElement | null>(null);
  const measuredIndicesRef = React.useRef<Set<number>>(new Set());
  const didRunSeedResetRef = React.useRef(false);
  const previousSeedResetKeyRef = React.useRef<string | undefined>(
    measurementKey,
  );
  const masonryInitialHeightsKey = stableMasonryInitialHeightsKey(
    masonryInitialHeights,
  );
  const masonryInitialHeightsRef = React.useRef(masonryInitialHeights);
  const previousMasonryInitialHeightsKeyRef = React.useRef(
    masonryInitialHeightsKey,
  );
  if (
    previousMasonryInitialHeightsKeyRef.current !== masonryInitialHeightsKey
  ) {
    previousMasonryInitialHeightsKeyRef.current = masonryInitialHeightsKey;
    masonryInitialHeightsRef.current = masonryInitialHeights;
  }
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints],
  );

  const [heights, setHeights] = React.useState<number[]>(() =>
    seedUnmeasuredMasonryHeights({
      itemCount: items.length,
      previousHeights: [],
      measuredIndices: new Set(),
      initialHeights: masonryInitialHeights,
    }),
  );
  const heightsRef = React.useRef(heights);

  React.useLayoutEffect(() => {
    heightsRef.current = heights;
  }, [heights]);

  React.useLayoutEffect(() => {
    const previousHeights = heightsRef.current;
    const previousSeedResetKey = previousSeedResetKeyRef.current;
    const seedResetKeyChanged = previousSeedResetKey !== measurementKey;
    previousSeedResetKeyRef.current = measurementKey;
    const hasPreservedHeights =
      items.length > 0 &&
      previousHeights.length >= items.length &&
      previousHeights
        .slice(0, items.length)
        .every((height) => Number.isFinite(height) && height >= 0);

    if (!didRunSeedResetRef.current) {
      didRunSeedResetRef.current = true;
      onLayoutMeasured?.(items.length === 0);
      return;
    }

    if (seedResetKeyChanged) {
      measuredIndicesRef.current.clear();
    }

    onLayoutMeasured?.(items.length === 0 || hasPreservedHeights);

    setHeights(() => {
      const next = seedUnmeasuredMasonryHeights({
        itemCount: items.length,
        previousHeights,
        measuredIndices: measuredIndicesRef.current,
        initialHeights: masonryInitialHeightsRef.current,
        preferPreviousHeights: seedResetKeyChanged && hasPreservedHeights,
      });
      heightsRef.current = next;
      return next;
    });
  }, [
    items.length,
    masonryInitialHeightsKey,
    measurementKey,
    onLayoutMeasured,
  ]);

  const columnCount = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonryColumns,
      DEFAULT_MASONRY_COLUMNS,
      viewportWidth,
      effectiveBreakpoints,
    );
    return Math.max(1, raw | 0);
  }, [masonryColumns, viewportWidth, effectiveBreakpoints]);

  const gapPx = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonryGap,
      DEFAULT_MASONRY_GAP_PX,
      viewportWidth,
      effectiveBreakpoints,
    );
    return Math.max(0, parseNumberLike(raw as any, DEFAULT_MASONRY_GAP_PX));
  }, [masonryGap, viewportWidth, effectiveBreakpoints]);

  const resolvedSpans = React.useMemo(
    () =>
      items.map((_, index) =>
        resolveMasonrySpanAtWidth({
          span: masonrySpans?.[index],
          columnCount,
          width: viewportWidth,
          breakpointMap: effectiveBreakpoints,
        }),
      ),
    [items, masonrySpans, columnCount, viewportWidth, effectiveBreakpoints],
  );

  const columnWidthCssExpr = React.useMemo(
    () => buildMasonryColumnWidthCssExpr({ containerWidthCss: "100%" }),
    [],
  );

  const positionedLayout = React.useMemo(() => {
    const layout = buildMasonryPositionedLayout({
      itemCount: items.length,
      columnCount,
      placement: masonryPlacement,
      heights,
      gapPx,
      spans: resolvedSpans,
    });

    return {
      height: layout.height,
      items: layout.items.map((item) => ({
        ...item,
        leftCssExpr: buildMasonryItemLeftCssExpr({
          columnStart: item.columnStart,
          columnWidthCssExpr,
        }),
        widthCssExpr: buildMasonryItemWidthCssExpr({
          span: item.span,
          columnWidthCssExpr,
        }),
      })),
    };
  }, [
    items.length,
    columnCount,
    masonryPlacement,
    heights,
    gapPx,
    resolvedSpans,
    columnWidthCssExpr,
  ]);

  const notifyLayoutMeasured = React.useCallback(() => {
    if (!onLayoutMeasured) return;
    if (items.length === 0) {
      onLayoutMeasured(true);
      return;
    }

    for (let index = 0; index < items.length; index++) {
      if (!measuredIndicesRef.current.has(index)) {
        onLayoutMeasured(false);
        return;
      }
    }

    onLayoutMeasured(true);
  }, [items.length, onLayoutMeasured]);

  const handleHeight = React.useCallback(
    (index: number, height: number) => {
      if (!Number.isFinite(height)) return;
      if (height >= 0) {
        measuredIndicesRef.current.add(index);
      }

      notifyLayoutMeasured();

      setHeights((prev) => {
        const old = prev[index];
        if (old === height) return prev;
        const next = prev.slice();
        next[index] = height;
        heightsRef.current = next;
        return next;
      });
    },
    [notifyLayoutMeasured],
  );

  React.useLayoutEffect(() => {
    notifyLayoutMeasured();
  }, [heights, notifyLayoutMeasured]);

  const virtualItems = React.useMemo(() => {
    return positionedLayout.items.map((item) => ({
      top: item.top,
      height: heights[item.index] ?? 0,
    }));
  }, [heights, positionedLayout.items]);
  const virtualRange = useAbsoluteVirtualRange(
    virtualItems,
    localRootRef,
    masonryVirtualization,
  );
  const revealedKeysRef = React.useRef(new Set<React.Key>());
  const itemLifecycleEnabled =
    masonryLoading != null &&
    masonryLoading.enabled !== false &&
    masonryReveal?.disabled !== true &&
    !!masonryLoading.skeleton;
  const { clearRevealScheduler, pruneRevealQueue, scheduleReveal } =
    useItemRevealScheduler({
      staggerMs: masonryReveal?.staggerMs ?? 160,
      revealedKeysRef,
    });
  const renderItemRevealKeys = React.useMemo(
    () =>
      items.map(
        (_, index) =>
          masonryItemRevealKeys?.[index] ??
          masonryItemIndices?.[index] ??
          index,
      ),
    [items, masonryItemIndices, masonryItemRevealKeys],
  );

  React.useEffect(() => {
    if (masonryLoading?.rememberRevealed ?? true) return;

    const currentKeys = new Set(renderItemRevealKeys);
    revealedKeysRef.current.forEach((key) => {
      if (!currentKeys.has(key)) {
        revealedKeysRef.current.delete(key);
      }
    });
    pruneRevealQueue(currentKeys);
  }, [
    masonryLoading?.rememberRevealed,
    pruneRevealQueue,
    renderItemRevealKeys,
  ]);

  React.useEffect(() => {
    if (!itemLifecycleEnabled) {
      clearRevealScheduler();
    }
  }, [clearRevealScheduler, itemLifecycleEnabled]);

  const mergedRootRef = React.useCallback(
    (node: HTMLElement | null) => {
      localRootRef.current = node;
      assignRef(masonryRootRef as React.Ref<HTMLElement>, node);
    },
    [masonryRootRef],
  );

  const renderedPositionedChildren = React.useMemo(() => {
    return items.map((child, index) => {
      const position = positionedLayout.items[index];
      if (!position) return null;
      if (index < virtualRange.start || index >= virtualRange.end) return null;
      const itemIndex = masonryItemIndices?.[index] ?? index;
      const itemRevealKey = masonryItemRevealKeys?.[index] ?? itemIndex;

      return (
        <MasonryItem
          key={index}
          index={index}
          itemIndex={itemIndex}
          onHeight={handleHeight}
          className={masonryClassNames?.item}
          masonryPlugins={masonryPlugins}
          loading={masonryLoading}
          reveal={masonryReveal}
          revealReady={masonryRevealReady}
          revealKey={itemRevealKey}
          placeholder={masonryItemPlaceholders?.[index] === true}
          scheduleReveal={scheduleReveal}
          revealedKeysRef={revealedKeysRef}
          onVisibleIndex={onVisibleIndex}
          revealedIndicesRef={revealedIndicesRef}
          measurementKey={measurementKey}
          top={position.top}
          left={position.leftCssExpr}
          width={position.widthCssExpr}
        >
          {child}
        </MasonryItem>
      );
    });
  }, [
    items,
    positionedLayout.items,
    virtualRange.start,
    virtualRange.end,
    masonryItemIndices,
    masonryItemRevealKeys,
    handleHeight,
    masonryPlugins,
    masonryLoading,
    masonryReveal,
    masonryRevealReady,
    masonryItemPlaceholders,
    masonryClassNames?.item,
    onVisibleIndex,
    measurementKey,
    revealedIndicesRef,
    scheduleReveal,
  ]);

  return (
    <RootComponent
      ref={mergedRootRef as any}
      className={masonryClassNames?.root}
      data-rmg-masonry-layout-seed={masonryLayoutSeedScopeId}
      style={{
        position: "relative",
        width: "100%",
        height: `${positionedLayout.height}px`,
        ["--rmg-cols" as any]: columnCount,
        ["--rmg-gap" as any]: `${gapPx}px`,
        ...(masonryStyle || {}),
      }}
    >
      {renderedPositionedChildren}
    </RootComponent>
  );
};

type MasonryItemProps = {
  index: number;
  itemIndex: number;
  onHeight: (index: number, height: number) => void;
  className?: string;
  top: number;
  left: string;
  width: string;
  masonryPlugins?: MasonryPlugin[];
  loading?: MasonryLoadingOptions;
  reveal?: RevealOptions;
  revealReady?: boolean;
  revealKey?: React.Key;
  placeholder?: boolean;
  scheduleReveal: (
    key: React.Key,
    revealItem: () => void,
    staggerMsOverride?: number,
  ) => () => void;
  revealedKeysRef: React.RefObject<Set<React.Key>>;
  onVisibleIndex?: (index: number) => void;
  revealedIndicesRef?: React.RefObject<Set<number>>;
  measurementKey?: string;
  children: React.ReactNode;
};

const MasonryItem: React.FC<MasonryItemProps> = ({
  index,
  itemIndex,
  onHeight,
  className,
  top,
  left,
  width,
  masonryPlugins,
  loading,
  reveal,
  revealReady: externalRevealReady = true,
  revealKey,
  placeholder = false,
  scheduleReveal,
  revealedKeysRef,
  onVisibleIndex,
  revealedIndicesRef,
  measurementKey,
  children,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const localRevealedIndicesRef = React.useRef(new Set<number>());
  const resolvedRevealedIndicesRef =
    revealedIndicesRef ?? localRevealedIndicesRef;
  const skeletonRevealGate = useSkeletonRevealGate();
  const pluginItemEntry = React.useMemo(
    () => masonryPlugins?.find((plugin) => plugin.renderItem),
    [masonryPlugins],
  );
  const stateKey = revealKey ?? itemIndex;
  const stage =
    loading != null &&
    loading.enabled !== false &&
    reveal?.disabled !== true &&
    !!loading.skeleton;
  const placeholderActive = placeholder === true;
  const rememberRevealed = loading?.rememberRevealed ?? true;
  const wasPreviouslyRevealed =
    stage && rememberRevealed && revealedKeysRef.current.has(stateKey);
  const previousStateKeyRef = React.useRef(stateKey);
  const stateKeyChanged = previousStateKeyRef.current !== stateKey;
  const resettingForStateKey =
    stage && stateKeyChanged && !wasPreviouslyRevealed;
  const [mediaReady, setMediaReady] = React.useState(
    !stage || wasPreviouslyRevealed,
  );
  const [revealed, setRevealed] = React.useState(
    !stage || wasPreviouslyRevealed,
  );
  const [settled, setSettled] = React.useState(!stage || wasPreviouslyRevealed);
  const skeletonMountedAtRef = React.useRef(0);
  const revealTimeoutRef = React.useRef<ReturnType<
    typeof globalThis.setTimeout
  > | null>(null);
  const lifecycleRootMargin = loading?.rootMargin ?? "0px";
  const lifecycleThreshold =
    typeof loading?.threshold === "number" && Number.isFinite(loading.threshold)
      ? loading.threshold
      : 0.01;
  const lifecycleDecodeTimeoutMs =
    typeof loading?.decodeTimeoutMs === "number" &&
    Number.isFinite(loading.decodeTimeoutMs)
      ? Math.max(0, loading.decodeTimeoutMs)
      : 8000;
  const lifecycleMinVisibleMs =
    typeof loading?.timing?.minVisibleMs === "number" &&
    Number.isFinite(loading.timing.minVisibleMs)
      ? Math.max(0, loading.timing.minVisibleMs)
      : 0;
  const lifecycleExitMs =
    prefersReducedMotion || loading?.animate === false
      ? 0
      : typeof loading?.timing?.exitMs === "number" &&
          Number.isFinite(loading.timing.exitMs)
        ? Math.max(0, loading.timing.exitMs)
        : 220;
  const lifecycleEnterMs =
    prefersReducedMotion || loading?.animate === false
      ? 0
      : typeof loading?.timing?.enterMs === "number" &&
          Number.isFinite(loading.timing.enterMs)
        ? Math.max(0, loading.timing.enterMs)
        : lifecycleExitMs;
  const loadingForce = React.useMemo(
    () => resolveLoadingForceOptions(loading?.force),
    [loading?.force],
  );
  const inView = useElementInViewOnce(stage && !wasPreviouslyRevealed, node, {
    rootMargin: lifecycleRootMargin,
    threshold: lifecycleThreshold,
    resetKey: stateKey,
  });
  const painted = useDoublePaintReady(
    stage && !wasPreviouslyRevealed,
    stateKey,
  );
  const effectiveMediaReady = resettingForStateKey ? false : mediaReady;
  const readyPainted = useDoublePaintReady(
    stage && !wasPreviouslyRevealed && effectiveMediaReady,
    `${String(stateKey)}:ready`,
  );
  const effectiveRevealed = resettingForStateKey ? false : revealed;
  const effectiveSettled = resettingForStateKey ? false : settled;
  const loadingBlocksReveal =
    (!!loading?.active || placeholderActive) &&
    (!loadingForce.enabled || !loadingForce.showContent);
  const compareMode =
    !!loading?.active &&
    loadingForce.enabled &&
    loadingForce.showContent &&
    (effectiveRevealed || effectiveSettled || effectiveMediaReady);
  const ready = !stage || effectiveRevealed || effectiveSettled || compareMode;
  const skeleton =
    typeof loading?.skeleton === "function"
      ? loading.skeleton({
          index,
          itemIndex,
          key: stateKey,
          revealKey: stateKey,
          placeholder: placeholderActive,
          ready,
        })
      : null;
  const hasSkeleton = skeleton != null;
  const itemRevealReady =
    !stage ||
    compareMode ||
    (!loadingBlocksReveal &&
      ready &&
      externalRevealReady !== false &&
      (skeletonRevealGate ?? true));
  const shouldMountSkeleton =
    hasSkeleton &&
    (!effectiveSettled ||
      !!loading?.active ||
      placeholderActive ||
      !!loading?.keepSkeletonMounted);

  const mergedRef = React.useCallback((nextNode: HTMLDivElement | null) => {
    ref.current = nextNode;
    setNode(nextNode);
  }, []);

  React.useLayoutEffect(() => {
    if (!hasSkeleton) return;
    skeletonMountedAtRef.current =
      typeof performance === "undefined" ? 0 : performance.now();
  }, [hasSkeleton, stateKey]);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => onHeight(index, el.getBoundingClientRect().height);
    measure();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onHeight(index, entry.contentRect.height);
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }

    return;
  }, [index, onHeight, measurementKey]);

  React.useLayoutEffect(() => {
    const rememberedReveal =
      stage && rememberRevealed && revealedKeysRef.current.has(stateKey);
    previousStateKeyRef.current = stateKey;

    if (!stage || rememberedReveal) {
      setMediaReady(true);
      setRevealed(true);
      setSettled(true);
      return;
    }

    setMediaReady(false);
    setRevealed(false);
    setSettled(false);
  }, [rememberRevealed, revealedKeysRef, stage, stateKey]);

  React.useEffect(() => {
    if (!stage || !loading?.active) return;
    setSettled(false);
  }, [loading?.active, stage, stateKey]);

  React.useEffect(() => {
    if (!stage || !node || !inView || !painted || effectiveMediaReady) return;

    if (loading?.waitForMedia === false) {
      const timeout = globalThis.setTimeout(() => setMediaReady(true), 0);
      return () => globalThis.clearTimeout(timeout);
    }

    let cancelled = false;
    void waitForElementMediaReady(node, {
      timeoutMs: lifecycleDecodeTimeoutMs,
      waitForLazy: true,
    }).then(() => {
      if (!cancelled) setMediaReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [
    inView,
    lifecycleDecodeTimeoutMs,
    loading?.waitForMedia,
    effectiveMediaReady,
    node,
    painted,
    stage,
    stateKey,
  ]);

  const markRevealed = React.useCallback(() => {
    setRevealed(true);
    if (!hasSkeleton || lifecycleExitMs <= 0) {
      setSettled(true);
    }
    resolvedRevealedIndicesRef.current.add(itemIndex);
    revealedKeysRef.current.add(stateKey);
  }, [
    hasSkeleton,
    itemIndex,
    lifecycleExitMs,
    resolvedRevealedIndicesRef,
    revealedKeysRef,
    stateKey,
  ]);

  React.useEffect(() => {
    if (
      !stage ||
      externalRevealReady === false ||
      !(skeletonRevealGate ?? true) ||
      !inView ||
      !painted ||
      !readyPainted ||
      !effectiveMediaReady ||
      loadingBlocksReveal ||
      effectiveRevealed
    ) {
      return;
    }

    if (revealTimeoutRef.current != null) {
      globalThis.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    const elapsed =
      typeof performance === "undefined"
        ? lifecycleMinVisibleMs
        : performance.now() - skeletonMountedAtRef.current;
    const revealDelay = hasSkeleton
      ? Math.max(0, lifecycleMinVisibleMs - elapsed)
      : 0;

    let cancelScheduledReveal: (() => void) | undefined;
    const startReveal = () => {
      revealTimeoutRef.current = null;
      cancelScheduledReveal = scheduleReveal(stateKey, markRevealed);
    };

    revealTimeoutRef.current = globalThis.setTimeout(startReveal, revealDelay);

    return () => {
      if (revealTimeoutRef.current != null) {
        globalThis.clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
      cancelScheduledReveal?.();
    };
  }, [
    externalRevealReady,
    hasSkeleton,
    inView,
    lifecycleMinVisibleMs,
    loadingBlocksReveal,
    markRevealed,
    effectiveMediaReady,
    painted,
    readyPainted,
    effectiveRevealed,
    scheduleReveal,
    skeletonRevealGate,
    stage,
    stateKey,
  ]);

  React.useEffect(() => {
    if (
      !stage ||
      !hasSkeleton ||
      !effectiveRevealed ||
      effectiveSettled ||
      lifecycleExitMs > 0
    )
      return;
    setSettled(true);
  }, [
    effectiveRevealed,
    effectiveSettled,
    hasSkeleton,
    lifecycleExitMs,
    stage,
  ]);

  React.useEffect(() => {
    return () => {
      if (revealTimeoutRef.current != null) {
        globalThis.clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (!onVisibleIndex) return;

    const host = ref.current;
    if (!host) return;

    let sent = false;
    const notify = () => {
      if (sent) return;
      sent = true;
      onVisibleIndex(itemIndex);
    };

    if (typeof IntersectionObserver === "undefined") {
      notify();
      return;
    }

    const root = host.closest('[data-rmg-viewport="true"]') as Element | null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          notify();
          io.disconnect();
          break;
        }
      },
      { root, rootMargin: "200px", threshold: 0.15 },
    );

    io.observe(host);
    return () => io.disconnect();
  }, [children, index, itemIndex, onVisibleIndex]);

  const itemProps = {
    className,
    "data-rmg-idx": itemIndex,
    "data-rmg-masonry-item-stage": stage ? "1" : undefined,
    "data-rmg-masonry-item-reveal": stage
      ? itemRevealReady
        ? "1"
        : "0"
      : undefined,
    "data-rmg-masonry-item-compare": compareMode ? "1" : undefined,
    "data-rmg-masonry-item-reveal-settled": effectiveSettled ? "1" : undefined,
    "data-rmg-masonry-item-placeholder": placeholderActive ? "1" : undefined,
    "aria-hidden": placeholderActive ? true : undefined,
    style: {
      position: "absolute",
      top: `${top}px`,
      left,
      width,
      ["--rmg-reveal-index" as any]: index,
    },
  } as React.HTMLAttributes<HTMLDivElement>;

  const content = (
    <>
      {children}
      {shouldMountSkeleton ? (
        <div
          className={styles.itemSkeleton}
          data-rmg-masonry-item-skeleton="true"
          aria-hidden="true"
          style={{
            ["--rmg-masonry-item-skeleton-enter-duration" as any]:
              `${lifecycleEnterMs}ms`,
            ["--rmg-masonry-item-skeleton-exit-duration" as any]:
              `${lifecycleExitMs}ms`,
            ["--rmg-masonry-item-skeleton-opacity" as any]: compareMode
              ? loadingForce.skeletonOpacity
              : undefined,
          }}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.propertyName !== "opacity") return;
            if (!effectiveRevealed) return;
            setSettled(true);
          }}
        >
          {skeleton}
        </div>
      ) : null}
    </>
  );

  if (pluginItemEntry?.renderItem) {
    const { ref: _ref, ...pluginItemProps } =
      itemProps as React.HTMLAttributes<HTMLDivElement> & {
        ref?: React.Ref<HTMLDivElement>;
      };

    return pluginItemEntry.renderItem(
      {
        index: itemIndex,
        itemIndex,
        itemRef: mergedRef,
        itemProps: pluginItemProps,
        children: content,
        revealedIndicesRef: resolvedRevealedIndicesRef,
      },
      pluginItemEntry.options,
    );
  }

  return (
    <div ref={mergedRef} {...itemProps}>
      {content}
    </div>
  );
};
