'use client';

import * as React from 'react';
import type { BreakpointMap, ResponsiveNumber } from '../shared/responsive';
import { LazyItemHost } from '../shared/lazy/LazyItemHost';
import { parseNumberLike, resolveNumberFromResponsive } from '../shared/responsive';
import type { MasonryLazyLoadOptions } from './types';

export type MasonryClassNames = {
  root?: string;
  column?: string;
  item?: string;
};

export type MasonryPlacement = 'balanced' | 'roundRobin';

export type MasonryProps = {
  items: React.ReactNode[];
  masonryColumns?: ResponsiveNumber;
  masonryGap?: ResponsiveNumber;
  masonryPlacement?: MasonryPlacement;
  masonryEstimatedItemHeight?: number;
  masonryClassNames?: MasonryClassNames;
  masonryStyle?: React.CSSProperties;
  masonryAs?: React.ElementType;
  masonryRootRef?: React.Ref<any>;
  breakpoints?: BreakpointMap;
  masonryLazyLoad?: MasonryLazyLoadOptions;
  onVisibleIndex?: (index: number) => void;
};

export const MasonryCore: React.FC<MasonryProps> = ({
  items,
  masonryColumns,
  masonryGap,
  masonryPlacement = 'balanced',
  masonryEstimatedItemHeight = 0,
  masonryClassNames,
  masonryStyle,
  masonryAs: RootComponent = 'div',
  masonryRootRef,
  breakpoints,
  masonryLazyLoad,
  onVisibleIndex,
}) => {
  const DEFAULT_MASONRY_COLUMNS = 4;
  const DEFAULT_MASONRY_GAP_PX = 8;

  const [viewportWidth, setViewportWidth] = React.useState(() => {
    if (typeof window === 'undefined') return 0;
    return window.innerWidth;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [heights, setHeights] = React.useState<number[]>(
    () => items.map(() => masonryEstimatedItemHeight)
  );

  React.useEffect(() => {
    setHeights((prev) => {
      const next: number[] = [];
      for (let i = 0; i < items.length; i++) {
        next[i] = prev[i] ?? masonryEstimatedItemHeight;
      }
      return next;
    });
  }, [items.length, masonryEstimatedItemHeight]);

  const columnCount = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonryColumns,
      DEFAULT_MASONRY_COLUMNS,
      viewportWidth,
      breakpoints
    );
    return Math.max(1, raw | 0);
  }, [masonryColumns, viewportWidth, breakpoints]);

  const gapPx = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonryGap,
      DEFAULT_MASONRY_GAP_PX,
      viewportWidth,
      breakpoints
    );
    return Math.max(0, parseNumberLike(raw as any, DEFAULT_MASONRY_GAP_PX));
  }, [masonryGap, viewportWidth, breakpoints]);

  const [colIndex, setColIndex] = React.useState<number[]>(
    () =>
      items.map((_, i) =>
        masonryPlacement === 'roundRobin' ? i % Math.max(1, columnCount) : 0
      )
  );

  React.useEffect(() => {
    const layout: number[] = new Array(items.length);

    if (masonryPlacement === 'roundRobin') {
      for (let i = 0; i < items.length; i++) {
        layout[i] = i % columnCount;
      }
    } else {
      const colHeights = new Array(columnCount).fill(0);

      for (let i = 0; i < items.length; i++) {
        const h = heights[i] ?? masonryEstimatedItemHeight;

        let minCol = 0;
        let minVal = colHeights[0];

        for (let c = 1; c < columnCount; c++) {
          if (colHeights[c] < minVal) {
            minVal = colHeights[c];
            minCol = c;
          }
        }

        layout[i] = minCol;
        colHeights[minCol] += h + gapPx;
      }
    }

    setColIndex(layout);
  }, [
    items.length,
    heights,
    columnCount,
    masonryPlacement,
    gapPx,
    masonryEstimatedItemHeight,
  ]);

  const handleHeight = React.useCallback((index: number, height: number) => {
    setHeights((prev) => {
      const old = prev[index];
      if (old === height) return prev;
      const next = prev.slice();
      next[index] = height;
      return next;
    });
  }, []);

  const columnsChildren: React.ReactNode[][] = React.useMemo(() => {
    const cols: React.ReactNode[][] = Array.from({ length: columnCount }, () => []);

    items.forEach((child, index) => {
      let c = colIndex[index];

      if (c == null || c < 0 || c >= columnCount) {
        c = masonryPlacement === 'roundRobin' ? index % columnCount : 0;
      }

      cols[c].push(
        <MasonryItem
          key={index}
          index={index}
          onHeight={handleHeight}
          className={masonryClassNames?.item}
          gapPx={gapPx}
          lazyLoad={masonryLazyLoad}
          onVisibleIndex={onVisibleIndex}
        >
          {child}
        </MasonryItem>
      );
    });

    return cols;
  }, [
    items,
    colIndex,
    columnCount,
    masonryPlacement,
    handleHeight,
    gapPx,
    masonryLazyLoad,
    masonryClassNames?.item,
    onVisibleIndex,
  ]);

  return (
    <RootComponent
      ref={masonryRootRef as any}
      className={masonryClassNames?.root}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        columnGap: gapPx,
        rowGap: 0,
        width: '100%',
        ...(masonryStyle || {}),
      }}
    >
      {columnsChildren.map((colChildren, i) => (
        <div
          key={i}
          className={masonryClassNames?.column}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {colChildren}
        </div>
      ))}
    </RootComponent>
  );
};

type MasonryItemProps = {
  index: number;
  onHeight: (index: number, height: number) => void;
  className?: string;
  gapPx: number;
  lazyLoad?: MasonryLazyLoadOptions;
  onVisibleIndex?: (index: number) => void;
  children: React.ReactNode;
};

const MasonryItem: React.FC<MasonryItemProps> = ({
  index,
  onHeight,
  className,
  gapPx,
  lazyLoad,
  onVisibleIndex,
  children,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => onHeight(index, el.offsetHeight);
    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onHeight(index, entry.contentRect.height);
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }

    return;
  }, [index, onHeight]);

  return (
    <LazyItemHost
      ref={ref}
      index={index}
      lazyLoad={lazyLoad}
      onVisibleIndex={onVisibleIndex}
      className={className}
      data-rmg-idx={index}
      style={{
        marginBottom: gapPx,
        ['--rmg-intro-index' as any]: index,
      }}
    >
      {children}
    </LazyItemHost>
  );
};
