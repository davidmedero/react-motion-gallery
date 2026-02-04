'use client';

import * as React from 'react';
import type { BreakpointMap, ResponsiveNumber } from '../shared/responsive';
import { parseNumberLike, resolveNumberFromResponsive } from '../shared/responsive';

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
};

export const Masonry: React.FC<MasonryProps> = ({
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
      // balanced
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
    masonryClassNames?.item,
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
  children: React.ReactNode;
};

const MasonryItem: React.FC<MasonryItemProps> = ({
  index,
  onHeight,
  className,
  gapPx,
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
    <div
      ref={ref}
      className={className}
      data-rmg-idx={index}
      style={{
        marginBottom: gapPx,
        ['--rmg-intro-index' as any]: index,
      }}
    >
      {children}
    </div>
  );
};

export type DefaultMasonrySkeletonProps = {
  count: number;
  columnCount: number;
  gapPx: number;
  classNames?: MasonryClassNames;
  ratios?: number[];
};

export const DefaultMasonrySkeleton: React.FC<DefaultMasonrySkeletonProps> = ({
  count,
  columnCount,
  gapPx,
  classNames,
  ratios
}) => {
  const cols: React.ReactNode[][] = Array.from(
    { length: Math.max(1, columnCount | 0) },
    () => []
  );

  const DEFAULT_RATIOS = [55, 90, 130, 75];
  const MIN_RATIO = 25;
  const MAX_RATIO = 220;

  const safeRatios =
    Array.isArray(ratios) && ratios.length
      ? ratios
          .map((r) => Number(r))
          .filter((r) => Number.isFinite(r))
          .map((r) => Math.max(MIN_RATIO, Math.min(MAX_RATIO, r)))
      : DEFAULT_RATIOS;

  for (let i = 0; i < count; i++) {
    const pb = safeRatios[i % safeRatios.length];
    const colIdx = i % cols.length;

    cols[colIdx].push(
      <div
        key={`rmg-mskel-${i}`}
        className={classNames?.item}
        style={{
          paddingBottom: `${pb}%`,
          marginBottom: gapPx,
        }}
      />
    );
  }

  return (
    <div
      className={classNames?.root}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        columnGap: gapPx,
        rowGap: 0,
        width: '100%',
      }}
    >
      {cols.map((children, i) => (
        <div
          key={i}
          className={classNames?.column}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
};