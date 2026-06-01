import * as React from "react";
import styles from "./Masonry.module.css";
import {
  DEFAULT_SERVER_VIEWPORT_WIDTH,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsive";
import { useInViewOnce } from "../shared/hooks/useInViewOnce";
import { useMediaReady } from "../shared/hooks/useMediaReady";
import { useSkeletonRevealGate } from "../shared/loading/skeletonRevealGate";
import { resolveLoadingForceOptions } from "../shared/loading/force";
import { useOptionalGalleryCore } from "../core";
import {
  getDataPluginOptions,
  normalizeDataVirtualizationOptions,
  type DataVirtualizationOptions,
} from "../shared/dataPlugins";
import { MasonryCore } from "./Masonry";
import { useMasonryLayoutSeed } from "./MasonryLayoutSeedContext";
import type {
  FullscreenTrigger,
  RevealOptions,
  MasonryHandle,
  MasonryLoadingOptions,
  MasonryPlugin,
} from "./types";
import type { ResponsiveMasonrySpan } from "./types";

type MasonryOptions = {
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  initialHeights?: ReadonlyArray<number | undefined>;
  placement?: "balanced" | "roundRobin" | "horizontalOrder";
  fullscreenTrigger?: FullscreenTrigger;
  itemWrapClassName?: string;
  itemWrapStyle?: React.CSSProperties;
  as?: React.ElementType;
  rootRef?: React.Ref<HTMLDivElement>;
  classNames?: {
    root?: string;
    column?: string;
    item?: string;
  };
  plugins?: MasonryPlugin[];
  loading?: MasonryLoadingOptions;
};

export type MasonryLayoutProps = {
  items: React.ReactNode[];
  itemIndices?: ReadonlyArray<number | undefined>;
  itemRevealKeys?: ReadonlyArray<React.Key | undefined>;
  itemPlaceholders?: ReadonlyArray<boolean | undefined>;
  itemSpans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
  masonry: MasonryOptions;
  breakpoints?: BreakpointMap;
  reveal: RevealOptions;
  revealReady?: boolean;
  onLoadingReadyChange?: (ready: boolean) => void;
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as any).current = value;
}

function getMasonryItemNodes(root: HTMLElement | null) {
  if (!root) return [];

  return Array.from(root.children).filter(
    (node): node is HTMLElement =>
      node instanceof HTMLElement && node.hasAttribute("data-rmg-idx"),
  );
}

function isMasonryPlugin(value: unknown): value is MasonryPlugin {
  return (
    typeof value === "object" &&
    value != null &&
    (value as MasonryPlugin).__rmgMasonryPlugin === true
  );
}

export const MasonryLayout = React.forwardRef<
  MasonryHandle,
  MasonryLayoutProps
>(function MasonryLayout(
  {
    items,
    itemIndices,
    itemRevealKeys,
    itemPlaceholders,
    itemSpans,
    masonry,
    breakpoints,
    reveal,
    revealReady = true,
    onLoadingReadyChange,
  },
  forwardedRef,
) {
  const core = useOptionalGalleryCore();
  const skeletonRevealGate = useSkeletonRevealGate();
  const layoutSeed = useMasonryLayoutSeed();
  const localRootRef = React.useRef<HTMLElement | null>(null);
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const visibleSeenRef = React.useRef(new Set<number>());
  const revealedIndicesRef = React.useRef(new Set<number>());
  const readySubsRef = React.useRef(new Set<(nodes: HTMLElement[]) => void>());
  const readyRef = React.useRef(false);
  const hasMeasuredLayoutRef = React.useRef(items.length === 0);
  const previousItemCountRef = React.useRef(items.length);

  const [stableViewportWidth, setStableViewportWidth] = React.useState(
    DEFAULT_SERVER_VIEWPORT_WIDTH,
  );
  const [layoutMeasured, setLayoutMeasured] = React.useState(
    items.length === 0,
  );
  const [mediaReady, setMediaReady] = React.useState(false);
  const [clientReady, setClientReady] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const [firstPaintSeedActive, setFirstPaintSeedActive] = React.useState(true);

  React.useLayoutEffect(() => {
    const readWidth = () => {
      const next =
        window.innerWidth ??
        document.documentElement.clientWidth ??
        window.visualViewport?.width ??
        0;

      if (next <= 0) return;
      setStableViewportWidth((prev) => (prev === next ? prev : next));
    };

    readWidth();

    window.addEventListener("resize", readWidth);
    window.visualViewport?.addEventListener("resize", readWidth);

    return () => {
      window.removeEventListener("resize", readWidth);
      window.visualViewport?.removeEventListener("resize", readWidth);
    };
  }, []);

  React.useLayoutEffect(() => {
    setFirstPaintSeedActive(false);
  }, []);

  React.useEffect(() => {
    setClientReady(true);
  }, []);

  React.useEffect(() => {
    visibleSeenRef.current.clear();
    revealedIndicesRef.current.clear();
  }, [items.length]);

  const pluginEntries = React.useMemo(
    () => (masonry.plugins ?? []).filter(isMasonryPlugin),
    [masonry.plugins],
  );
  const loading = masonry.loading;
  const loadingEnabled = loading != null && loading.enabled !== false;
  const loadingForce = React.useMemo(
    () => resolveLoadingForceOptions(loading?.force),
    [loading?.force],
  );
  const loadingSkeletonActive = loadingEnabled && !!loading?.skeleton;
  const rememberLoadingReveal = loading?.rememberRevealed ?? true;
  const rememberedLoadingReadyRef = React.useRef(false);
  const previousLoadingRevealSignatureRef = React.useRef<string | null>(null);
  const pluginBlocksMediaReady = React.useMemo(
    () => pluginEntries.some((plugin) => plugin.blocksReady),
    [pluginEntries],
  );
  const pluginsLoading = React.useMemo(
    () => pluginEntries.some((plugin) => !!(plugin.options as any)?.loading),
    [pluginEntries],
  );

  useMediaReady(!pluginBlocksMediaReady, localRootRef as any, setMediaReady);
  useInViewOnce(true, localRootRef as any, () => setInView(true));

  const viewportReady = stableViewportWidth > 0;
  const masonryCanMount = viewportReady;

  const baseContentReady = pluginBlocksMediaReady
    ? clientReady && masonryCanMount
    : masonryCanMount && mediaReady;
  const measuredReady = baseContentReady && layoutMeasured && !pluginsLoading;
  const measuredContentReady = measuredReady && !loading?.active;
  const measuredSkeletonReady =
    measuredReady && (!loading?.active || loadingForce.enabled);
  const loadingRevealSignature = React.useMemo(() => {
    const keys = Array.from({ length: items.length }, (_, index) =>
      String(itemRevealKeys?.[index] ?? itemIndices?.[index] ?? index),
    );
    return JSON.stringify([items.length, keys]);
  }, [itemIndices, itemRevealKeys, items.length]);

  if (previousLoadingRevealSignatureRef.current !== loadingRevealSignature) {
    previousLoadingRevealSignatureRef.current = loadingRevealSignature;
    rememberedLoadingReadyRef.current = false;
  }
  if (!loadingSkeletonActive || !rememberLoadingReveal) {
    rememberedLoadingReadyRef.current = false;
  }

  const rememberedLoadingReady =
    loadingSkeletonActive &&
    rememberLoadingReveal &&
    !loading?.active &&
    rememberedLoadingReadyRef.current;
  const contentReady = measuredContentReady || rememberedLoadingReady;
  const skeletonReady = measuredSkeletonReady || rememberedLoadingReady;

  React.useEffect(() => {
    onLoadingReadyChange?.(skeletonReady);
  }, [onLoadingReadyChange, skeletonReady]);

  React.useEffect(() => {
    if (!loadingSkeletonActive || !rememberLoadingReveal) {
      rememberedLoadingReadyRef.current = false;
      return;
    }

    if (measuredSkeletonReady && !loading?.active) {
      rememberedLoadingReadyRef.current = true;
    }
  }, [
    loading?.active,
    loadingSkeletonActive,
    measuredSkeletonReady,
    rememberLoadingReveal,
  ]);

  const getItemNodes = React.useCallback(
    () => getMasonryItemNodes(localRootRef.current),
    [],
  );

  React.useImperativeHandle(
    forwardedRef,
    () => ({
      getRootNode: () => localRootRef.current,
      getItemNodes,
      isReady: () => readyRef.current,
      onReady: (callback) => {
        readySubsRef.current.add(callback);
        return () => {
          readySubsRef.current.delete(callback);
        };
      },
    }),
    [getItemNodes],
  );

  const onVisibleIndex = React.useCallback(
    (index: number) => {
      if (visibleSeenRef.current.has(index)) return;
      visibleSeenRef.current.add(index);
      core?.notifyBaseVisibleIndex(index);
    },
    [core],
  );

  const measurementKey = React.useMemo(
    () =>
      JSON.stringify({
        itemCount: items.length,
        viewportWidth: stableViewportWidth,
        columns: masonry.columns ?? null,
        gap: masonry.gap ?? null,
        placement: masonry.placement ?? "balanced",
        spans: itemSpans ?? [],
        indices: itemIndices ?? [],
        revealKeys: itemRevealKeys ?? [],
        placeholders: itemPlaceholders ?? [],
      }),
    [
      items.length,
      stableViewportWidth,
      masonry.columns,
      masonry.gap,
      masonry.placement,
      itemSpans,
      itemIndices,
      itemRevealKeys,
      itemPlaceholders,
    ],
  );
  React.useEffect(() => {
    readyRef.current = contentReady;
    if (!contentReady) return;

    const nodes = getItemNodes();
    readySubsRef.current.forEach((fn) => fn(nodes));
  }, [contentReady, getItemNodes]);

  React.useEffect(() => {
    if (layoutMeasured) {
      hasMeasuredLayoutRef.current = true;
    }
  }, [layoutMeasured]);

  React.useLayoutEffect(() => {
    const itemCountChanged = previousItemCountRef.current !== items.length;
    previousItemCountRef.current = items.length;

    if (items.length === 0) {
      hasMeasuredLayoutRef.current = true;
      setLayoutMeasured(true);
      return;
    }

    if (itemCountChanged || !hasMeasuredLayoutRef.current) {
      hasMeasuredLayoutRef.current = false;
      setLayoutMeasured(false);
    }
  }, [items.length, measurementKey]);

  const revealDisabled = reveal.disabled === true || loadingSkeletonActive;
  const revealActive =
    revealDisabled ||
    (clientReady && inView && revealReady && (skeletonRevealGate ?? true));
  const masonryRootClassName = [
    styles.masonryRoot,
    !revealDisabled ? styles.revealContainer : "",
    !revealDisabled && revealActive ? styles.revealActive : "",
    masonry.classNames?.root || "",
  ]
    .filter(Boolean)
    .join(" ");

  const mergedRootRef = React.useCallback(
    (node: HTMLElement | null) => {
      localRootRef.current = node;
      assignRef(masonry.rootRef as any, node as any);
    },
    [masonry.rootRef],
  );
  const virtualOptions = getDataPluginOptions<DataVirtualizationOptions>(
    pluginEntries,
    "virtualization",
  );
  const virtualInitialHeights = React.useMemo(() => {
    const initialHeights = masonry.initialHeights ?? layoutSeed?.initialHeights;

    if (!virtualOptions || virtualOptions.enabled === false) {
      return initialHeights;
    }

    const resolvedVirtual = normalizeDataVirtualizationOptions(virtualOptions);
    return Array.from({ length: items.length }, (_, index) => {
      const seeded = initialHeights?.[index];
      return Number.isFinite(seeded) && Number(seeded) > 0
        ? seeded
        : resolvedVirtual.estimateSize;
    });
  }, [
    items.length,
    layoutSeed?.initialHeights,
    masonry.initialHeights,
    virtualOptions,
  ]);

  const masonryNode = (
    <>
      {layoutSeed?.responsiveCss && firstPaintSeedActive ? (
        <style dangerouslySetInnerHTML={{ __html: layoutSeed.responsiveCss }} />
      ) : null}
      <MasonryCore
        items={items}
        masonrySpans={itemSpans}
        masonryColumns={masonry.columns}
        masonryGap={masonry.gap}
        masonryPlacement={masonry.placement ?? "balanced"}
        masonryClassNames={{
          root: masonryRootClassName,
          column: [styles.masonryCol, masonry.classNames?.column]
            .filter(Boolean)
            .join(" "),
          item: [styles.masonryItem, masonry.classNames?.item]
            .filter(Boolean)
            .join(" "),
        }}
        masonryStyle={{
          ["--rmg-reveal-stagger" as any]: `${reveal.staggerMs}ms`,
          ["--rmg-reveal-duration" as any]: `${reveal.durationMs}ms`,
          ["--rmg-reveal-easing" as any]: reveal.easing,
        }}
        masonryAs={masonry.as ?? "div"}
        masonryRootRef={mergedRootRef}
        breakpoints={breakpoints}
        masonryPlugins={pluginEntries}
        masonryInitialHeights={virtualInitialHeights}
        masonryItemIndices={itemIndices}
        masonryItemRevealKeys={itemRevealKeys}
        masonryItemPlaceholders={itemPlaceholders}
        masonryVirtualization={virtualOptions}
        masonryLoading={loading}
        masonryReveal={reveal}
        masonryRevealReady={revealReady}
        responsiveViewportWidth={stableViewportWidth}
        onVisibleIndex={onVisibleIndex}
        onLayoutMeasured={setLayoutMeasured}
        measurementKey={measurementKey}
        revealedIndicesRef={revealedIndicesRef}
        masonryLayoutSeedScopeId={layoutSeed?.scopeId}
      />
    </>
  );

  return (
    <div ref={shellRef} className={styles.masonryShellFrame}>
      <div
        data-rmg-masonry-content-ready={contentReady ? "true" : "false"}
        style={{ containerType: "inline-size" }}
      >
        {masonryNode}
        {pluginEntries.map((plugin, index) => {
          const Runtime = plugin.Runtime;
          return Runtime ? (
            <Runtime
              key={`${plugin.kind}-${index}`}
              host={{
                handle: {
                  getRootNode: () => localRootRef.current,
                  getItemNodes,
                  isReady: () => readyRef.current,
                  onReady: (callback) => {
                    readySubsRef.current.add(callback);
                    return () => {
                      readySubsRef.current.delete(callback);
                    };
                  },
                },
                itemCount: items.length,
                ready: contentReady,
              }}
              options={plugin.options}
            />
          ) : null;
        })}
      </div>
    </div>
  );
});
