import * as React from 'react';
import styles from './Masonry.module.css';
import {
  DEFAULT_SERVER_VIEWPORT_WIDTH,
  type BreakpointMap,
  type ResponsiveNumber,
} from '../shared/responsive';
import { useInViewOnce } from '../shared/hooks/useInViewOnce';
import { useMediaReady } from '../shared/hooks/useMediaReady';
import { useSkeletonRevealGate } from '../shared/loading/skeletonRevealGate';
import { useOptionalGalleryCore } from '../core';
import { MasonryCore } from './Masonry';
import { useMasonryLayoutSeed } from './MasonryLayoutSeedContext';
import type {
  FullscreenTrigger,
  RevealOptions,
  MasonryHandle,
  MasonryPlugin,
} from './types';
import type { ResponsiveMasonrySpan } from './types';

type MasonryOptions = {
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  placement?: 'balanced' | 'roundRobin' | 'horizontalOrder';
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
};

export type MasonryLayoutProps = {
  items: React.ReactNode[];
  itemSpans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
  masonry: MasonryOptions;
  breakpoints?: BreakpointMap;
  reveal: RevealOptions;
  revealReady?: boolean;
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === 'function') ref(value);
  else (ref as any).current = value;
}

function getMasonryItemNodes(root: HTMLElement | null) {
  if (!root) return [];

  return Array.from(root.children).filter(
    (node): node is HTMLElement =>
      node instanceof HTMLElement && node.hasAttribute('data-rmg-idx')
  );
}

function isMasonryPlugin(value: unknown): value is MasonryPlugin {
  return (
    typeof value === 'object' &&
    value != null &&
    (value as MasonryPlugin).__rmgMasonryPlugin === true
  );
}

export const MasonryLayout = React.forwardRef<MasonryHandle, MasonryLayoutProps>(
  function MasonryLayout(
    {
      items,
      itemSpans,
      masonry,
      breakpoints,
      reveal,
      revealReady = true,
    },
    forwardedRef
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
      DEFAULT_SERVER_VIEWPORT_WIDTH
    );
    const [layoutMeasured, setLayoutMeasured] = React.useState(items.length === 0);
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

      window.addEventListener('resize', readWidth);
      window.visualViewport?.addEventListener('resize', readWidth);

      return () => {
        window.removeEventListener('resize', readWidth);
        window.visualViewport?.removeEventListener('resize', readWidth);
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
      [masonry.plugins]
    );
    const pluginBlocksMediaReady = React.useMemo(
      () => pluginEntries.some((plugin) => plugin.blocksReady),
      [pluginEntries]
    );

    useMediaReady(!pluginBlocksMediaReady, localRootRef as any, setMediaReady);
    useInViewOnce(true, localRootRef as any, () => setInView(true));

    const viewportReady = stableViewportWidth > 0;
    const masonryCanMount = viewportReady;

    const baseContentReady = pluginBlocksMediaReady
      ? clientReady && masonryCanMount
      : masonryCanMount && mediaReady;
    const contentReady = baseContentReady && layoutMeasured;

    const getItemNodes = React.useCallback(
      () => getMasonryItemNodes(localRootRef.current),
      []
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
      [getItemNodes]
    );

    React.useEffect(() => {
      readyRef.current = contentReady;
      if (!contentReady) return;

      const nodes = getItemNodes();
      readySubsRef.current.forEach((fn) => fn(nodes));
    }, [contentReady, getItemNodes]);

    const onVisibleIndex = React.useCallback(
      (index: number) => {
        if (visibleSeenRef.current.has(index)) return;
        visibleSeenRef.current.add(index);
        core?.notifyBaseVisibleIndex(index);
      },
      [core]
    );

    const measurementKey = React.useMemo(
      () =>
        JSON.stringify({
          itemCount: items.length,
          viewportWidth: stableViewportWidth,
          columns: masonry.columns ?? null,
          gap: masonry.gap ?? null,
          placement: masonry.placement ?? 'balanced',
          spans: itemSpans ?? [],
        }),
      [
        items.length,
        stableViewportWidth,
        masonry.columns,
        masonry.gap,
        masonry.placement,
        itemSpans,
      ]
    );

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

    const revealActive = clientReady && inView && revealReady && (skeletonRevealGate ?? true);
    const masonryRootClassName = [
      styles.masonryRoot,
      styles.revealContainer,
      revealActive ? styles.revealActive : '',
      masonry.classNames?.root || '',
    ]
      .filter(Boolean)
      .join(' ');

    const mergedRootRef = React.useCallback(
      (node: HTMLElement | null) => {
        localRootRef.current = node;
        assignRef(masonry.rootRef as any, node as any);
      },
      [masonry.rootRef]
    );

    return (
      <div ref={shellRef} className={styles.masonryShellFrame}>
        <div
          data-rmg-masonry-content-ready={contentReady ? 'true' : 'false'}
          style={{ containerType: 'inline-size' }}
        >
          {layoutSeed?.responsiveCss && firstPaintSeedActive ? (
            <style dangerouslySetInnerHTML={{ __html: layoutSeed.responsiveCss }} />
          ) : null}
          <MasonryCore
            items={items}
            masonrySpans={itemSpans}
            masonryColumns={masonry.columns}
            masonryGap={masonry.gap}
            masonryPlacement={masonry.placement ?? 'balanced'}
            masonryClassNames={{
              root: masonryRootClassName,
              column: [styles.masonryCol, masonry.classNames?.column].filter(Boolean).join(' '),
              item: [styles.masonryItem, masonry.classNames?.item].filter(Boolean).join(' '),
            }}
            masonryStyle={{
              ['--rmg-reveal-stagger' as any]: `${reveal.staggerMs}ms`,
              ['--rmg-reveal-duration' as any]: `${reveal.durationMs}ms`,
              ['--rmg-reveal-easing' as any]: reveal.easing,
            }}
            masonryAs={masonry.as ?? 'div'}
            masonryRootRef={mergedRootRef}
            breakpoints={breakpoints}
            masonryPlugins={pluginEntries}
            masonryInitialHeights={layoutSeed?.initialHeights}
            responsiveViewportWidth={stableViewportWidth}
            onVisibleIndex={onVisibleIndex}
            onLayoutMeasured={setLayoutMeasured}
            measurementKey={measurementKey}
            revealedIndicesRef={revealedIndicesRef}
            masonryLayoutSeedScopeId={layoutSeed?.scopeId}
          />
        </div>
      </div>
    );
  }
);
