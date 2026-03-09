import * as React from 'react';
import styles from './Grid.module.css';
import type { BreakpointMap, ResponsiveNumber } from '../shared/responsive';
import { resolveNumberFromResponsive } from '../shared/responsive';
import { useInViewOnce } from '../shared/hooks/useInViewOnce';
import { useMediaReady } from '../shared/hooks/useMediaReady';
import { usePrefersReducedMotion } from '../shared/hooks/usePrefersReducedMotion';
import { LazyItemHost, normalizeLazyLoad } from '../shared/lazy/LazyItemHost';
import { GridSkeletonCard } from './GridSkeleton';
import { useOptionalGalleryCore } from '../core';
import { GridLazyLoadOptions, IntroOptions, LoadingOptions } from './types';

type FullscreenTrigger = 'item' | 'media';

type GridOptions = {
  columns?: ResponsiveNumber;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
  fullscreenTrigger?: FullscreenTrigger;
  lazyLoad?: GridLazyLoadOptions;
};

export type GridLayoutProps = {
  cells: Array<{ id: string; node: React.ReactNode }>;
  grid: GridOptions;
  breakpoints?: BreakpointMap;
  viewportWidth: number;
  loading: LoadingOptions;
  intro: IntroOptions;
  enableFullscreen: boolean;
  onOpen: (index: number, originEl?: HTMLElement | null) => void;
  registerExpandableImage: (index: number, node: HTMLImageElement | HTMLVideoElement | null) => void;
  gridItemBaseClass?: string;
  renderMode?: 'wrap' | 'passthrough';
};

function isImgEl(el: unknown): el is HTMLImageElement {
  return el instanceof HTMLImageElement;
}

function findImgInside(host: HTMLElement | null): HTMLImageElement | null {
  if (!host) return null;
  if (isImgEl(host)) return host;

  const el = host.querySelector('img');
  return isImgEl(el) ? el : null;
}

function findImgFromClickTarget(target: EventTarget | null): HTMLImageElement | null {
  if (!(target instanceof HTMLElement)) return null;

  const el = target.closest('img');
  return isImgEl(el) ? el : null;
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(node);
      else if (typeof ref === 'object') (ref as any).current = node;
    }
  };
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const SKELETON_EXIT_MS = 220;
const INTRO_OVERLAP_MS = 220;

export function GridLayout({
  cells,
  grid,
  breakpoints,
  viewportWidth,
  loading,
  intro,
  enableFullscreen,
  onOpen,
  registerExpandableImage,
  gridItemBaseClass = 'rmg__grid-item',
  renderMode,
}: GridLayoutProps) {
  const core = useOptionalGalleryCore();
  const gridRootRef = React.useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = React.useState(false);
  const [mediaReady, setMediaReady] = React.useState(false);
  const visibleSeenRef = React.useRef(new Set<number>());
  const prefersReducedMotion = usePrefersReducedMotion();

  const normalizedLazy = React.useMemo(() => normalizeLazyLoad(grid.lazyLoad), [grid.lazyLoad]);
  const lazyEnabled = normalizedLazy.enabled;

  useInViewOnce(true, gridRootRef as any, () => setInView(true));
  useMediaReady(!lazyEnabled, gridRootRef as any, setMediaReady);

  const renderModeProp = renderMode ?? 'wrap';

  const fullscreenTrigger: FullscreenTrigger = grid.fullscreenTrigger ?? 'media';

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
  }, [cells.length]);

  const minWidth =
    typeof grid.minColumnWidth === 'number'
      ? `${grid.minColumnWidth}px`
      : grid.minColumnWidth ?? '160px';

  const gapVal = React.useMemo(() => {
    if (typeof grid.gap === 'string' && Number.isNaN(parseFloat(grid.gap))) return grid.gap;

    const raw = resolveNumberFromResponsive(
      grid.gap,
      typeof grid.gap === 'number' ? grid.gap : 8,
      viewportWidth,
      breakpoints
    );

    return `${Math.max(0, raw | 0)}px`;
  }, [grid.gap, viewportWidth, breakpoints]);

  const resolvedGridColumnCount = React.useMemo(() => {
    if (grid.columns == null) return undefined;
    const raw = resolveNumberFromResponsive(grid.columns, 1, viewportWidth, breakpoints);
    return Math.max(1, raw | 0);
  }, [grid.columns, viewportWidth, breakpoints]);

  const gridStyle: React.CSSProperties = React.useMemo(() => {
    const style: React.CSSProperties = {
      ['--rmg-grid-min' as any]: minWidth,
      ['--rmg-grid-gap' as any]: gapVal,
    };

    if (resolvedGridColumnCount && resolvedGridColumnCount > 0) {
      style.gridTemplateColumns = `repeat(${resolvedGridColumnCount}, minmax(0, 1fr))`;
    }

    return style;
  }, [minWidth, gapVal, resolvedGridColumnCount]);

  const skeletonCount = cells.length;

  const loadingNode = React.useMemo(() => {
    if (!loadingEnabledFlag || !showLoadingLayer) return null;
    if (loading.renderLoading) return loading.renderLoading({ count: skeletonCount });

    return (
      <GridSkeletonCard count={skeletonCount} gridStyle={gridStyle} spec={loading.skeleton} />
    );
  }, [loadingEnabledFlag, showLoadingLayer, loading.renderLoading, loading.skeleton, skeletonCount, gridStyle]);

  const openFromEvent = React.useCallback(
    (index: number, host: HTMLElement, e: React.SyntheticEvent) => {
      if (!enableFullscreen) return;

      const img =
        fullscreenTrigger === 'media'
          ? findImgFromClickTarget(e.target)
          : findImgInside(host);

      if (!img) return;

      onOpen(index, img);
    },
    [enableFullscreen, fullscreenTrigger, onOpen]
  );

  const onItemClick = React.useCallback(
    (index: number) =>
      (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        openFromEvent(index, e.currentTarget, e);
      },
    [openFromEvent]
  );

  const onItemKeyDown = React.useCallback(
    (index: number) =>
      (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        openFromEvent(index, e.currentTarget, e);
      },
    [openFromEvent]
  );

  const registerFromHostRef = React.useCallback(
    (index: number) =>
      (node: HTMLElement | null) => {
        registerExpandableImage(index, findImgInside(node));
      },
    [registerExpandableImage]
  );

  const onVisibleIndex = React.useCallback(
    (index: number) => {
      if (visibleSeenRef.current.has(index)) return;
      visibleSeenRef.current.add(index);
      core?.notifyBaseVisibleIndex(index);
    },
    [core]
  );

  const baseItemClassName = React.useMemo(
    () => cx(gridItemBaseClass, styles.gridItem, styles.introItem, grid.itemClassName),
    [gridItemBaseClass, grid.itemClassName]
  );

  const gridChildren = React.useMemo(() => {
    return cells.map((cell, index) => {
      const original = cell.node;

      const introStyle: React.CSSProperties & Record<string, any> = {
        ['--rmg-intro-index' as any]: index,
      };

      if (lazyEnabled) {
        const originalEl = React.isValidElement(original)
          ? (original as React.ReactElement<any>)
          : null;

        const origProps = (originalEl?.props ?? {}) as {
          onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
          tabIndex?: number;
          ['aria-label']?: string;
        };

        const mergedOnClick: React.MouseEventHandler<HTMLElement> | undefined = enableFullscreen
          ? (e) => {
              if (e.defaultPrevented) return;
              onItemClick(index)(e);
            }
          : undefined;

        const mergedOnKeyDown: React.KeyboardEventHandler<HTMLElement> | undefined = enableFullscreen
          ? (e) => {
              origProps.onKeyDown?.(e);
              if ((e as any).defaultPrevented) return;
              onItemKeyDown(index)(e);
            }
          : undefined;

        return (
          <LazyItemHost
            key={cell.id}
            index={index}
            data-rmg-idx={index}
            className={baseItemClassName}
            style={introStyle}
            lazyLoad={grid.lazyLoad}
            onVisibleIndex={onVisibleIndex}
            registerExpandableImage={registerExpandableImage as any}
            onClick={mergedOnClick}
            onKeyDown={mergedOnKeyDown}
            tabIndex={enableFullscreen ? (origProps.tabIndex ?? 0) : undefined}
            aria-label={
              enableFullscreen
                ? (origProps['aria-label'] ?? `View image ${index + 1}`)
                : undefined
            }
          >
            {original as any}
          </LazyItemHost>
        );
      }

      if (renderModeProp === 'passthrough') {
        return (
          <div
            key={cell.id}
            data-rmg-idx={index}
            className={baseItemClassName}
            style={introStyle}
          >
            {original as any}
          </div>
        );
      }

      if (!React.isValidElement(original) || typeof (original as any).type !== 'string') {
        return (
          <div
            key={cell.id}
            data-rmg-idx={index}
            className={baseItemClassName}
            style={introStyle}
            onClick={onItemClick(index)}
            onKeyDown={onItemKeyDown(index)}
            tabIndex={0}
            aria-label={`View image ${index + 1}`}
            ref={registerFromHostRef(index) as any}
          >
            {original as any}
          </div>
        );
      }

      const originalEl = original as React.ReactElement<any>;

      const origProps = (originalEl.props ?? {}) as {
        onClick?: React.MouseEventHandler<HTMLElement>;
        onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
        className?: string;
        style?: React.CSSProperties;
      };

      const origRef = (originalEl as any).ref as React.Ref<HTMLElement> | undefined;

      const mergedOnClick: React.MouseEventHandler<HTMLElement> = (e) => {
        origProps.onClick?.(e);
        if (e.defaultPrevented) return;
        onItemClick(index)(e);
      };

      const mergedOnKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
        origProps.onKeyDown?.(e);
        if ((e as any).defaultPrevented) return;
        onItemKeyDown(index)(e);
      };

      const mergedRef = mergeRefs<HTMLElement>(origRef, registerFromHostRef(index));

      return React.cloneElement(originalEl, {
        key: cell.id,
        ref: mergedRef,
        'data-rmg-idx': index,
        className: cx(baseItemClassName, origProps.className),
        style: { ...(origProps.style || {}), ...introStyle },
        onClick: mergedOnClick,
        onKeyDown: mergedOnKeyDown,
        tabIndex: originalEl.props?.tabIndex ?? 0,
        'aria-label': originalEl.props?.['aria-label'] ?? `View image ${index + 1}`,
      });
    });
  }, [
    cells,
    lazyEnabled,
    grid.lazyLoad,
    renderModeProp,
    baseItemClassName,
    enableFullscreen,
    onItemClick,
    onItemKeyDown,
    onVisibleIndex,
    registerExpandableImage,
    registerFromHostRef,
  ]);

  React.useLayoutEffect(() => {
    if (renderModeProp !== 'passthrough' || lazyEnabled) return;

    const root = gridRootRef.current;
    if (!root) return;

    for (let i = 0; i < cells.length; i++) {
      const host = root.querySelector(`[data-rmg-idx="${i}"]`) as HTMLElement | null;
      registerExpandableImage(i, findImgInside(host));
    }

    return () => {
      for (let i = 0; i < cells.length; i++) registerExpandableImage(i, null);
    };
  }, [renderModeProp, lazyEnabled, cells.length, registerExpandableImage]);

  const containerProps: React.HTMLAttributes<HTMLDivElement> = React.useMemo(
    () => ({
      className: cx(
        styles.gridRoot,
        styles.introContainer,
        introActive && styles.introActive,
        grid.rootClassName
      ),
      style: {
        ...gridStyle,
        ['--rmg-intro-stagger' as any]: `${intro.staggerMs}ms`,
        ['--rmg-intro-transform' as any]: intro.transform,
        ['--rmg-intro-duration' as any]: `${intro.durationMs}ms`,
        ['--rmg-intro-easing' as any]: intro.easing,
      },
      'aria-busy': showLoadingLayer ? true : undefined,
    }),
    [
      grid.rootClassName,
      gridStyle,
      intro.staggerMs,
      intro.transform,
      intro.durationMs,
      intro.easing,
      introActive,
      showLoadingLayer,
    ]
  );

  const inner = (
    <div ref={gridRootRef} {...containerProps}>
      {gridChildren}
    </div>
  );

  const introWrapped = intro.renderIntro
    ? intro.renderIntro({ active: introActive, containerProps }, inner)
    : inner;

  return (
    <div className={styles.gridShell}>
      <div className={cx(styles.gridContentLayer, showLoadingLayer && styles.gridContentBlocked)}>
        {introWrapped}
      </div>
      {showLoadingLayer && loadingNode ? (
        <div
          className={cx(styles.gridLoadingLayer, loadingExiting && styles.gridLoadingLayerExit)}
          aria-hidden="true"
        >
          {loadingNode}
        </div>
      ) : null}
    </div>
  );
}
