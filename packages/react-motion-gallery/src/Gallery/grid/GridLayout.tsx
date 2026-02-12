import * as React from 'react';
import styles from './Grid.module.css';
import type { BreakpointMap, ResponsiveNumber } from '../shared/responsive';
import { resolveNumberFromResponsive } from '../shared/responsive';
import { useInViewOnce } from '../shared/hooks/useInViewOnce';
import { useMediaReady } from '../shared/hooks/useMediaReady';
import { GridSkeletonCard, GridSkeletonSpec } from './GridSkeleton';
import { IntroOptions, LoadingOptions } from './types';

type GridOptions = {
  columns?: ResponsiveNumber;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
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
  registerExpandableImg: (index: number, node: HTMLElement | null) => void;
  gridItemBaseClass?: string;
  renderMode?: 'wrap' | 'passthrough';
};

export function GridLayout({
  cells,
  grid,
  breakpoints,
  viewportWidth,
  loading,
  intro,
  enableFullscreen,
  onOpen,
  registerExpandableImg,
  gridItemBaseClass = 'rmg__grid-item',
  renderMode,
}: GridLayoutProps) {
  const gridRootRef = React.useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = React.useState(false);
  const [mediaReady, setMediaReady] = React.useState(false);

  useInViewOnce(true, gridRootRef as any, () => setInView(true));
  useMediaReady(true, gridRootRef as any, setMediaReady);

  const loadingEnabledFlag = loading.enabled ?? true;
  const loadingForced = loading.force ?? false;
  const loadingActive = loadingEnabledFlag && (loadingForced || !mediaReady);
  const introActive = mediaReady && inView;

  const minWidth =
    typeof grid.minColumnWidth === 'number'
      ? `${grid.minColumnWidth}px`
      : grid.minColumnWidth ?? '160px';

  const gapVal = React.useMemo(() => {
    if (typeof grid.gap === 'string' && Number.isNaN(parseFloat(grid.gap)))
      return grid.gap;

    const raw = resolveNumberFromResponsive(
      grid.gap,
      typeof grid.gap === 'number' ? grid.gap : 8,
      viewportWidth,
      breakpoints
    );

    const px = Math.max(0, raw | 0);
    return `${px}px`;
  }, [grid.gap, viewportWidth, breakpoints]);

  const resolvedGridColumnCount = React.useMemo(() => {
    if (grid.columns == null) return undefined;
    const raw = resolveNumberFromResponsive(grid.columns, 1, viewportWidth, breakpoints);
    return Math.max(1, raw | 0);
  }, [grid.columns, viewportWidth, breakpoints]);

  const gridStyle: React.CSSProperties = {
    ['--rmg-grid-min' as any]: minWidth,
    ['--rmg-grid-gap' as any]: gapVal,
  };

  if (resolvedGridColumnCount && resolvedGridColumnCount > 0) {
    gridStyle.gridTemplateColumns = `repeat(${resolvedGridColumnCount}, minmax(0, 1fr))`;
  }

  const skeletonCount = cells.length;

  const defaultGridSkeleton = (
    <GridSkeletonCard
      count={skeletonCount}
      gridStyle={gridStyle}
      spec={loading.skeleton}
    />
  );

  const loadingNode = loadingActive
    ? loading.renderLoading
      ? loading.renderLoading({ count: skeletonCount })
      : defaultGridSkeleton
    : null;

  const renderModeProp = renderMode ?? 'wrap';

  const getOriginImg = (host: HTMLElement | null, fallback?: EventTarget | null) => {
    const img = host?.querySelector("img") as HTMLImageElement | null;
    if (img) return img;
    return (fallback instanceof HTMLImageElement ? fallback : null);
  };

  const gridChildren = React.useMemo(() => {
    return cells.map((cell, index) => {
      const original = cell.node;

      const introStyle: React.CSSProperties & Record<string, any> = {
        ['--rmg-intro-index' as any]: index,
      };

      const baseClassName = [
        gridItemBaseClass,
        styles.gridItem,
        styles.introItem,
        grid.itemClassName || '',
      ]
        .filter(Boolean)
        .join(' ');

      if (renderModeProp === 'passthrough') {
        return (
          <div
            key={cell.id}
            data-rmg-idx={index}
            className={baseClassName}
            style={introStyle}
          >
            {original as any}
          </div>
        );
      }

      if (!React.isValidElement(original)) {
        return (
          <button
            key={cell.id}
            type="button"
            data-rmg-idx={index}
            className={baseClassName}
            style={introStyle}
            onClick={(e) => {
              e.preventDefault();
              const host = e.currentTarget as HTMLElement;
              const img = getOriginImg(host, e.target);
              if (!enableFullscreen || !img) return;
              onOpen(index, img);
            }}
            ref={(node) => {
              const img = getOriginImg(node, null);
              registerExpandableImg(index, img ?? node);
            }}
          >
            {original as any}
          </button>
        );
      }

      const originalEl = original as React.ReactElement<any, any>;

      const isDomElement = typeof originalEl.type === 'string';

      if (!isDomElement) {
        return (
          <button
            key={cell.id}
            type="button"
            data-rmg-idx={index}
            className={baseClassName}
            style={introStyle}
            onClick={(e) => {
              e.preventDefault();
              const host = e.currentTarget as HTMLElement;
              const img = getOriginImg(host, e.target);
              if (!enableFullscreen || !img) return;
              onOpen(index, img);
            }}
            ref={(node) => {
              const img = getOriginImg(node, null);
              registerExpandableImg(index, img ?? node);
            }}
          >
            {originalEl}
          </button>
        );
      }

      const origProps = (originalEl.props ?? {}) as {
        onClick?: React.MouseEventHandler<HTMLElement>;
        className?: string;
        style?: React.CSSProperties;
      };
      const origRef = (originalEl as any).ref as React.Ref<HTMLElement> | undefined;

      const mergedRef: React.RefCallback<HTMLElement> = (node) => {
        if (typeof origRef === 'function') origRef(node);
        else if (origRef && typeof origRef === 'object') (origRef as any).current = node;
        const img = getOriginImg(node, null);
        registerExpandableImg(index, img ?? node);
      };

      const mergedOnClick: React.MouseEventHandler<HTMLElement> = (e) => {
        origProps.onClick?.(e);
        if (e.defaultPrevented) return;
        if (!enableFullscreen) return;
        const host = e.currentTarget as HTMLElement;
        const img = getOriginImg(host, e.target);
        if (!enableFullscreen || !img) return;
        onOpen(index, img);
      };

      return React.cloneElement(originalEl, {
        key: cell.id,
        ref: mergedRef,
        onClick: mergedOnClick,
        'data-rmg-idx': index,
        className: [baseClassName, origProps.className || ''].filter(Boolean).join(' '),
        style: { ...(origProps.style || {}), ...introStyle },
      });
    });
  }, [
    cells,
    enableFullscreen,
    onOpen,
    registerExpandableImg,
    grid.itemClassName,
    gridItemBaseClass,
    renderModeProp,
  ]);

  React.useLayoutEffect(() => {
    if (renderModeProp !== 'passthrough') return;

    const root = gridRootRef.current;
    if (!root) return;

    for (let i = 0; i < cells.length; i++) {
      const host = root.querySelector(`[data-rmg-idx="${i}"]`) as HTMLElement | null;
      if (!host) {
        registerExpandableImg(i, null);
        continue;
      }

      const img = host.querySelector('img') as HTMLImageElement | null;
      registerExpandableImg(i, img ?? host);
    }

    return () => {
      for (let i = 0; i < cells.length; i++) registerExpandableImg(i, null);
    };
  }, [renderModeProp, cells.length, registerExpandableImg]);

  const containerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: [
      styles.gridRoot,
      styles.introContainer,
      introActive ? styles.introActive : '',
      grid.rootClassName || '',
    ]
      .filter(Boolean)
      .join(' '),
    style: {
      ...gridStyle,
      ['--rmg-intro-stagger' as any]: `${intro.staggerMs}ms`,
      ['--rmg-intro-transform' as any]: intro.transform,
      ['--rmg-intro-duration' as any]: `${intro.durationMs}ms`,
      ['--rmg-intro-easing' as any]: intro.easing,
    },
    'aria-busy': loadingActive ? true : undefined,
  };

  const inner = (
    <div ref={gridRootRef} {...containerProps}>
      {gridChildren}
    </div>
  );

  const introWrapped = intro.renderIntro
    ? intro.renderIntro({ active: introActive, containerProps }, inner)
    : inner;

  return (
    <>
      {loadingNode}
      {introWrapped}
    </>
  );
}