import * as React from 'react';
import styles from './Masonry.module.css';
import {
  DEFAULT_SERVER_VIEWPORT_WIDTH,
  type BreakpointMap,
  type ResponsiveNumber,
} from '../shared/responsive';
import { useInViewOnce } from '../shared/hooks/useInViewOnce';
import { useLoadingLayerState } from '../shared/hooks/useLoadingLayerState';
import { useMediaReady } from '../shared/hooks/useMediaReady';
import { usePrefersReducedMotion } from '../shared/hooks/usePrefersReducedMotion';
import { normalizeLazyLoad } from '../shared/lazy/LazyItemHost';
import {
  DEFAULT_SKELETON_MIN_VISIBLE_MS,
  getRemainingLoadingVisibleMs,
  resolveLoadingTiming,
  scheduleLoadingExit,
} from '../shared/loading/timing';
import { useOptionalGalleryCore } from '../core';
import { MasonryCore } from './Masonry';
import { MasonrySkeletonCard } from './MasonrySkeleton';
import { buildActiveMasonrySeedHeights } from './prediction';
import {
  FullscreenTrigger,
  IntroOptions,
  LoadingOptions,
  MasonryLazyLoadOptions,
} from './types';

type MasonryOptions = {
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  placement?: 'balanced' | 'roundRobin';
  fullscreenTrigger?: FullscreenTrigger;
  estimatedItemHeight?: number;
  itemWrapClassName?: string;
  itemWrapStyle?: React.CSSProperties;
  as?: React.ElementType;
  rootRef?: React.Ref<HTMLDivElement>;
  classNames?: {
    root?: string;
    column?: string;
    item?: string;
  };
  lazyLoad?: MasonryLazyLoadOptions;
};

export type MasonryLayoutProps = {
  items: React.ReactNode[];
  masonry: MasonryOptions;
  breakpoints?: BreakpointMap;
  loading: LoadingOptions;
  intro: IntroOptions;
  skeletonCount: number;
  contentLayerMode?: 'overlay' | 'flow';
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (!ref) return;
  if (typeof ref === 'function') ref(value);
  else (ref as any).current = value;
}

export const SKELETON_MIN_VISIBLE_MS = DEFAULT_SKELETON_MIN_VISIBLE_MS;
export const getRemainingSkeletonVisibleMs = getRemainingLoadingVisibleMs;
export const scheduleMasonryLoadingExit = scheduleLoadingExit;

export function resolveMasonryLoadingVisualState(args: {
  showLoadingLayer: boolean;
  loadingExiting: boolean;
}) {
  return {
    scaffoldVisible: args.showLoadingLayer && !args.loadingExiting,
    contentVisible: args.loadingExiting || !args.showLoadingLayer,
    contentInteractive: !args.showLoadingLayer,
  };
}

export function MasonryLayout({
  items,
  masonry,
  breakpoints,
  loading,
  intro,
  skeletonCount,
  contentLayerMode = 'overlay',
}: MasonryLayoutProps) {
  const core = useOptionalGalleryCore();
  const localRootRef = React.useRef<HTMLDivElement | null>(null);
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const visibleSeenRef = React.useRef(new Set<number>());
  const revealedIndicesRef = React.useRef(new Set<number>());

  const [stableViewportWidth, setStableViewportWidth] = React.useState(
    DEFAULT_SERVER_VIEWPORT_WIDTH
  );
  const [inView, setInView] = React.useState(false);
  const [mediaReady, setMediaReady] = React.useState(false);
  const [clientReady, setClientReady] = React.useState(false);

  const prefersReducedMotion = usePrefersReducedMotion();

  React.useLayoutEffect(() => {
    const readWidth = () => {
      const next =
        window.visualViewport?.width ??
        window.innerWidth ??
        document.documentElement.clientWidth ??
        0;

      if (next <= 0) return;
      setStableViewportWidth((prev) => (prev === next ? prev : next));
    };

    readWidth();

    window.addEventListener('resize', readWidth);
    window.visualViewport?.addEventListener('resize', readWidth);

    return () => {
      window.removeEventListener('resize', readWidth);
      window.visualViewport?.removeEventListener('resize', readWidth);
    };
  }, []);

  React.useEffect(() => {
    setClientReady(true);
  }, []);

  React.useEffect(() => {
    visibleSeenRef.current.clear();
    revealedIndicesRef.current.clear();
  }, [items.length]);

  const normalizedLazy = React.useMemo(
    () => normalizeLazyLoad(masonry.lazyLoad),
    [masonry.lazyLoad]
  );

  const lazyEnabled = normalizedLazy.enabled;

  useInViewOnce(true, localRootRef as any, () => setInView(true));
  useMediaReady(!lazyEnabled, localRootRef as any, setMediaReady);

  const loadingEnabled = loading.enabled ?? true;
  const loadingForced = loading.force ?? false;
  const viewportReady = stableViewportWidth > 0;
  const masonryCanMount = viewportReady;

  const contentReady = lazyEnabled
    ? clientReady && masonryCanMount
    : masonryCanMount && (mediaReady || clientReady);

  const loadingActive = loadingEnabled && (loadingForced || !contentReady);

  const loadingTiming = React.useMemo(
    () =>
      resolveLoadingTiming({
        prefersReducedMotion,
        timing: loading.timing,
      }),
    [loading.timing, prefersReducedMotion]
  );

  const { showLoadingLayer, loadingExiting, introUnlocked } = useLoadingLayerState({
    loadingActive,
    exitMs: loadingTiming.exitMs,
    minVisibleMs: loadingTiming.minVisibleMs,
  });

  const { scaffoldVisible, contentVisible, contentInteractive } = React.useMemo(
    () =>
      resolveMasonryLoadingVisualState({
        showLoadingLayer,
        loadingExiting,
      }),
    [loadingExiting, showLoadingLayer]
  );

  const introActive = contentReady && inView && introUnlocked;

  const onVisibleIndex = React.useCallback(
    (index: number) => {
      if (visibleSeenRef.current.has(index)) return;
      visibleSeenRef.current.add(index);
      core?.notifyBaseVisibleIndex(index);
    },
    [core]
  );

  const masonryInitialHeights = React.useMemo(
    () =>
      loading.skeleton
        ? buildActiveMasonrySeedHeights({
            viewportWidth: stableViewportWidth,
            count: items.length,
            columns: masonry.columns,
            gap: masonry.gap,
            breakpoints,
            placement: masonry.placement ?? 'balanced',
            estimatedItemHeight: masonry.estimatedItemHeight,
            ratios: loading.skeleton.ratios,
            heightsPx: loading.skeleton.heightsPx,
            spec: loading.skeleton,
          })
        : undefined,
    [
      stableViewportWidth,
      items.length,
      masonry.columns,
      masonry.gap,
      breakpoints,
      masonry.placement,
      masonry.estimatedItemHeight,
      loading.skeleton,
    ]
  );

  const masonryRootClassName = [
    styles.masonryRoot,
    styles.introContainer,
    introActive ? styles.introActive : '',
    masonry.classNames?.root || '',
  ]
    .filter(Boolean)
    .join(' ');

  const mergedRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      localRootRef.current = node;
      assignRef(masonry.rootRef as any, node);
    },
    [masonry.rootRef]
  );

  const contentLayerStyle: React.CSSProperties =
    contentLayerMode === 'flow'
      ? {
          position: 'relative',
          minWidth: 0,
          zIndex: 2,
          pointerEvents: 'none',
          height: 'auto',
        }
      : {
          position: 'absolute',
          inset: 0,
          minWidth: 0,
          zIndex: 2,
          pointerEvents: 'none',
          height: 0,
        };

  // Persistent scaffold: always mounted, only visuals fade out.
  const scaffoldLayerStyle: React.CSSProperties = {
    opacity: scaffoldVisible ? 1 : 0,
    pointerEvents: 'none',
    transition:
      loadingTiming.exitMs > 0 ? `opacity ${loadingTiming.exitMs}ms ease` : undefined,
  };

  // Real masonry fades in visually while remaining layout-inert.
  const contentVisualStyle: React.CSSProperties = {
    opacity: contentVisible ? 1 : 0,
    pointerEvents: contentInteractive ? 'auto' : 'none',
    transition:
      loadingTiming.exitMs > 0 ? `opacity 600ms ease` : undefined,
  };

  const defaultLoadingNode = (
    <div className={styles.masonrySkeletonOverlay}>
      <MasonrySkeletonCard
        count={skeletonCount}
        columns={masonry.columns}
        gap={masonry.gap}
        breakpoints={breakpoints}
        ratios={loading.skeleton?.ratios}
        heightsPx={loading.skeleton?.heightsPx}
        placement={masonry.placement}
        estimatedItemHeight={masonry.estimatedItemHeight}
        spec={loading.skeleton}
        classNames={{
          root: styles.masonrySkeletonRoot,
          column: styles.masonrySkeletonCol,
          item: loading.skeleton?.layout
            ? styles.masonrySkeletonLayoutItem
            : styles.masonrySkeletonItem,
        }}
      />
    </div>
  );

  const scaffoldNode = loadingEnabled
    ? loading.renderLoading
      ? loading.renderLoading({ count: skeletonCount })
      : defaultLoadingNode
    : null;

  return (
    <div ref={shellRef} className={styles.masonryShell}>
      {scaffoldNode ? (
        <div
          className={styles.masonryLoadingLayer}
          aria-hidden="true"
          style={scaffoldLayerStyle}
        >
          {scaffoldNode}
        </div>
      ) : null}

      <div
        className={styles.masonryContentLayer}
        style={contentLayerStyle}
      >
        <div style={contentVisualStyle}>
          <MasonryCore
            items={items}
            masonryColumns={masonry.columns}
            masonryGap={masonry.gap}
            masonryPlacement={masonry.placement ?? 'balanced'}
            masonryEstimatedItemHeight={masonry.estimatedItemHeight}
            masonryInitialHeights={masonryInitialHeights}
            masonryClassNames={{
              root: masonryRootClassName,
              column: [styles.masonryCol, masonry.classNames?.column].filter(Boolean).join(' '),
              item: [styles.masonryItem, masonry.classNames?.item].filter(Boolean).join(' '),
            }}
            masonryStyle={{
              ['--rmg-intro-stagger' as any]: `${intro.staggerMs}ms`,
              ['--rmg-intro-duration' as any]: `${intro.durationMs}ms`,
              ['--rmg-intro-easing' as any]: intro.easing,
            }}
            masonryAs={masonry.as ?? 'div'}
            masonryRootRef={mergedRootRef}
            breakpoints={breakpoints}
            masonryLazyLoad={masonry.lazyLoad}
            responsiveViewportWidth={stableViewportWidth}
            onVisibleIndex={onVisibleIndex}
            revealedIndicesRef={revealedIndicesRef}
          />
        </div>
      </div>
    </div>
  );
}
