import * as React from 'react';
import styles from './Masonry.module.css';
import type { BreakpointMap, ResponsiveNumber } from '../shared/responsive';
import { useInViewOnce } from '../shared/hooks/useInViewOnce';
import { useMediaReady } from '../shared/hooks/useMediaReady';
import { usePrefersReducedMotion } from '../shared/hooks/usePrefersReducedMotion';
import { normalizeLazyLoad } from '../shared/lazy/LazyItemHost';
import { useOptionalGalleryCore } from '../core';
import { MasonryCore } from './Masonry';
import { MasonrySkeletonCard } from './MasonrySkeleton';
import { IntroOptions, LoadingOptions, MasonryLazyLoadOptions } from './types';

type MasonryOptions = {
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  placement?: 'balanced' | 'roundRobin';
  estimatedItemHeight?: number;
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
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (!ref) return;
  if (typeof ref === 'function') ref(value);
  else (ref as any).current = value;
}

const SKELETON_EXIT_MS = 220;
const INTRO_OVERLAP_MS = 220;

export function MasonryLayout({
  items,
  masonry,
  breakpoints,
  loading,
  intro,
  skeletonCount,
}: MasonryLayoutProps) {
  const core = useOptionalGalleryCore();
  const localRootRef = React.useRef<HTMLDivElement | null>(null);

  const [inView, setInView] = React.useState(false);
  const [mediaReady, setMediaReady] = React.useState(false);
  const visibleSeenRef = React.useRef(new Set<number>());
  const prefersReducedMotion = usePrefersReducedMotion();

  const normalizedLazy = React.useMemo(() => normalizeLazyLoad(masonry.lazyLoad), [masonry.lazyLoad]);
  const lazyEnabled = normalizedLazy.enabled;

  useInViewOnce(true, localRootRef as any, () => setInView(true));
  useMediaReady(!lazyEnabled, localRootRef as any, setMediaReady);

  const [clientReady, setClientReady] = React.useState(false);
  
  React.useEffect(() => {
    setClientReady(true);
  }, []);

  const loadingEnabledFlag = loading.enabled ?? true;
  const loadingForced = loading.force ?? false;
  const contentReady = lazyEnabled ? clientReady : mediaReady;
  const loadingActive = loadingEnabledFlag && (loadingForced || !contentReady);
  const resolvedSkeletonExitMs = prefersReducedMotion ? 0 : SKELETON_EXIT_MS;
  const introUnlockDelayMs = Math.max(0, resolvedSkeletonExitMs - INTRO_OVERLAP_MS);
  const [showLoadingLayer, setShowLoadingLayer] = React.useState(() => loadingActive);
  const [loadingExiting, setLoadingExiting] = React.useState(false);
  const [introUnlocked, setIntroUnlocked] = React.useState(() => !loadingActive);
  const introActive = contentReady && inView && introUnlocked;

  React.useEffect(() => {
    if (loadingActive) {
      setShowLoadingLayer(true);
      setLoadingExiting(false);
      setIntroUnlocked(false);
      return;
    }

    if (!showLoadingLayer) {
      setIntroUnlocked(true);
      return;
    }

    if (resolvedSkeletonExitMs === 0) {
      setLoadingExiting(false);
      setShowLoadingLayer(false);
      setIntroUnlocked(true);
      return;
    }

    setLoadingExiting(true);
    const introTimeoutId = window.setTimeout(() => {
      setIntroUnlocked(true);
    }, introUnlockDelayMs);

    const exitTimeoutId = window.setTimeout(() => {
      setShowLoadingLayer(false);
      setLoadingExiting(false);
    }, resolvedSkeletonExitMs);

    return () => {
      window.clearTimeout(introTimeoutId);
      window.clearTimeout(exitTimeoutId);
    };
  }, [introUnlockDelayMs, loadingActive, resolvedSkeletonExitMs, showLoadingLayer]);

  React.useEffect(() => {
    visibleSeenRef.current.clear();
  }, [items.length]);

  const onVisibleIndex = React.useCallback(
    (index: number) => {
      if (visibleSeenRef.current.has(index)) return;
      visibleSeenRef.current.add(index);
      core?.notifyBaseVisibleIndex(index);
    },
    [core]
  );

  const masonrySkeletonNode = (
    <div className={styles.masonrySkeletonOverlay}>
      <MasonrySkeletonCard
        count={skeletonCount}
        columns={masonry.columns}
        gap={masonry.gap}
        breakpoints={breakpoints}
        ratios={loading.skeleton?.ratios}
        heightsPx={loading.skeleton?.heightsPx}
        placement={masonry.placement}
        spec={loading.skeleton}
        classNames={{
          root: styles.masonrySkeletonRoot,
          column: styles.masonrySkeletonCol,
          item: styles.masonrySkeletonItem,
        }}
      />
    </div>
  );

  const loadingNode = loadingEnabledFlag && showLoadingLayer
    ? loading.renderLoading
      ? loading.renderLoading({ count: skeletonCount })
      : masonrySkeletonNode
    : null;

  const masonryRootClassName = [
    styles.masonryRoot,
    styles.introContainer,
    introActive ? styles.introActive : '',
    masonry.classNames?.root || '',
  ]
    .filter(Boolean)
    .join(' ');

  const mergedRootRef = React.useCallback((node: HTMLDivElement | null) => {
    localRootRef.current = node;
    assignRef(masonry.rootRef as any, node);
  }, [masonry.rootRef]);


  return (
    <div className={styles.masonryShell}>
      <div
        className={[
          styles.masonryContentLayer,
          showLoadingLayer ? styles.masonryContentBlocked : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <MasonryCore
          items={items}
          masonryColumns={masonry.columns}
          masonryGap={masonry.gap}
          masonryPlacement={masonry.placement ?? 'balanced'}
          masonryEstimatedItemHeight={masonry.estimatedItemHeight}
          masonryClassNames={{
            root: masonryRootClassName,
            column: [styles.masonryCol, masonry.classNames?.column].filter(Boolean).join(' '),
            item: [styles.masonryItem, masonry.classNames?.item].filter(Boolean).join(' '),
          }}
          masonryStyle={{
            ['--rmg-intro-stagger' as any]: `${intro.staggerMs}ms`,
            ['--rmg-intro-transform' as any]: intro.transform,
            ['--rmg-intro-duration' as any]: `${intro.durationMs}ms`,
            ['--rmg-intro-easing' as any]: intro.easing,
          }}
          masonryAs={masonry.as ?? 'div'}
          masonryRootRef={mergedRootRef}
          breakpoints={breakpoints}
          masonryLazyLoad={masonry.lazyLoad}
          onVisibleIndex={onVisibleIndex}
        />
      </div>
      {showLoadingLayer && loadingNode ? (
        <div
          className={[
            styles.masonryLoadingLayer,
            loadingExiting ? styles.masonryLoadingLayerExit : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        >
          {loadingNode}
        </div>
      ) : null}
    </div>
  );
}
