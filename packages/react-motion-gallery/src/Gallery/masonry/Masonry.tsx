'use client';

import * as React from 'react';
import type { BreakpointMap, ResponsiveNumber } from '../shared/responsive';
import { LazyItemHost } from '../shared/lazy/LazyItemHost';
import { useViewportWidth } from '../shared/hooks/useViewportWidth';
import { parseNumberLike, resolveNumberFromResponsive } from '../shared/responsive';
import type { MasonryLazyLoadOptions } from './types';
import { buildMasonryColumnLayout } from './prediction';

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
  masonryInitialHeights?: ReadonlyArray<number | undefined>;
  masonryClassNames?: MasonryClassNames;
  masonryStyle?: React.CSSProperties;
  masonryAs?: React.ElementType;
  masonryRootRef?: React.Ref<any>;
  breakpoints?: BreakpointMap;
  masonryLazyLoad?: MasonryLazyLoadOptions;
  responsiveViewportWidth?: number;
  onVisibleIndex?: (index: number) => void;
  revealedIndicesRef?: React.RefObject<Set<number>>;
};

export { buildMasonryColumnLayout } from './prediction';

export function resolveMasonrySeedHeight(args: {
  index: number;
  previousHeight?: number;
  initialHeights?: ReadonlyArray<number | undefined>;
  estimatedItemHeight: number;
}) {
  const predicted = args.initialHeights?.[args.index];
  if (Number.isFinite(predicted) && Number(predicted) > 0) {
    return Number(predicted);
  }

  if (Number.isFinite(args.estimatedItemHeight) && args.estimatedItemHeight > 0) {
    return args.estimatedItemHeight;
  }

  return args.previousHeight ?? 0;
}

export function seedUnmeasuredMasonryHeights(args: {
  itemCount: number;
  previousHeights: number[];
  measuredIndices: Set<number>;
  initialHeights?: ReadonlyArray<number | undefined>;
  estimatedItemHeight: number;
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
      estimatedItemHeight: args.estimatedItemHeight,
    });

    if (next[index] !== seededHeight) {
      next[index] = seededHeight;
      changed = true;
    }
  }

  return changed ? next : args.previousHeights;
}

export const MasonryCore: React.FC<MasonryProps> = ({
  items,
  masonryColumns,
  masonryGap,
  masonryPlacement = 'balanced',
  masonryEstimatedItemHeight = 0,
  masonryInitialHeights,
  masonryClassNames,
  masonryStyle,
  masonryAs: RootComponent = 'div',
  masonryRootRef,
  breakpoints,
  masonryLazyLoad,
  responsiveViewportWidth,
  onVisibleIndex,
  revealedIndicesRef,
}) => {
  const DEFAULT_MASONRY_COLUMNS = 4;
  const DEFAULT_MASONRY_GAP_PX = 8;
  const liveViewportWidth = useViewportWidth();
  const viewportWidth = responsiveViewportWidth ?? liveViewportWidth;
  const measuredIndicesRef = React.useRef<Set<number>>(new Set());

  const [heights, setHeights] = React.useState<number[]>(
    () =>
      seedUnmeasuredMasonryHeights({
        itemCount: items.length,
        previousHeights: [],
        measuredIndices: new Set(),
        initialHeights: masonryInitialHeights,
        estimatedItemHeight: masonryEstimatedItemHeight,
      })
  );

  React.useEffect(() => {
    for (const index of Array.from(measuredIndicesRef.current)) {
      if (index >= items.length) {
        measuredIndicesRef.current.delete(index);
      }
    }

    setHeights((prev) =>
      seedUnmeasuredMasonryHeights({
        itemCount: items.length,
        previousHeights: prev,
        measuredIndices: measuredIndicesRef.current,
        initialHeights: masonryInitialHeights,
        estimatedItemHeight: masonryEstimatedItemHeight,
      })
    );
  }, [items.length, masonryEstimatedItemHeight, masonryInitialHeights]);

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

  const colIndex = React.useMemo(
    () =>
      buildMasonryColumnLayout({
        itemCount: items.length,
        columnCount,
        placement: masonryPlacement,
        heights,
        estimatedItemHeight: masonryEstimatedItemHeight,
        gapPx,
      }),
    [
      items.length,
      heights,
      columnCount,
      masonryPlacement,
      gapPx,
      masonryEstimatedItemHeight,
    ]
  );

  const handleHeight = React.useCallback((index: number, height: number) => {
    if (!Number.isFinite(height)) return;
    if (height > 0) {
      measuredIndicesRef.current.add(index);
    }

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
          revealedIndicesRef={revealedIndicesRef}
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
    revealedIndicesRef,
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
  revealedIndicesRef?: React.RefObject<Set<number>>;
  children: React.ReactNode;
};

const MasonryItem: React.FC<MasonryItemProps> = ({
  index,
  onHeight,
  className,
  gapPx,
  lazyLoad,
  onVisibleIndex,
  revealedIndicesRef,
  children,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => onHeight(index, el.getBoundingClientRect().height);
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
      revealedIndicesRef={revealedIndicesRef}
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
