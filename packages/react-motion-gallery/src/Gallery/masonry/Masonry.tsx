'use client';

import * as React from 'react';
import type { BreakpointMap, ResponsiveNumber } from '../shared/responsive';
import { useViewportWidth } from '../shared/hooks/useViewportWidth';
import {
  BREAKPOINT_MAP,
  parseNumberLike,
  resolveNumberFromResponsive,
} from '../shared/responsive';
import {
  buildMasonryColumnLayout,
  buildMasonryColumnWidthCssExpr,
  buildMasonryItemLeftCssExpr,
  buildMasonryItemWidthCssExpr,
  buildMasonryPositionedLayout,
} from './prediction';
import { resolveMasonrySpanAtWidth } from './item';
import type { MasonryPlugin, ResponsiveMasonrySpan } from './types';

export type MasonryClassNames = {
  root?: string;
  column?: string;
  item?: string;
};

export type MasonryPlacement = 'balanced' | 'roundRobin' | 'horizontalOrder';

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
  responsiveViewportWidth?: number;
  onVisibleIndex?: (index: number) => void;
  onLayoutMeasured?: (measured: boolean) => void;
  measurementKey?: string;
  revealedIndicesRef?: React.RefObject<Set<number>>;
  masonryLayoutSeedScopeId?: string;
};

export { buildMasonryColumnLayout } from './prediction';

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
  heights: ReadonlyArray<number | undefined> | undefined
) {
  if (!heights?.length) return "";

  return heights
    .map((height) =>
      Number.isFinite(height) ? Math.round(Number(height) * 1000) / 1000 : ""
    )
    .join(",");
}

export const MasonryCore: React.FC<MasonryProps> = ({
  items,
  masonrySpans,
  masonryColumns,
  masonryGap,
  masonryPlacement = 'balanced',
  masonryInitialHeights,
  masonryClassNames,
  masonryStyle,
  masonryAs: RootComponent = 'div',
  masonryRootRef,
  breakpoints,
  masonryPlugins,
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
  const measuredIndicesRef = React.useRef<Set<number>>(new Set());
  const didRunSeedResetRef = React.useRef(false);
  const previousSeedResetKeyRef = React.useRef<string | undefined>(
    measurementKey
  );
  const masonryInitialHeightsKey = stableMasonryInitialHeightsKey(
    masonryInitialHeights
  );
  const masonryInitialHeightsRef = React.useRef(masonryInitialHeights);
  const previousMasonryInitialHeightsKeyRef = React.useRef(
    masonryInitialHeightsKey
  );
  if (previousMasonryInitialHeightsKeyRef.current !== masonryInitialHeightsKey) {
    previousMasonryInitialHeightsKeyRef.current = masonryInitialHeightsKey;
    masonryInitialHeightsRef.current = masonryInitialHeights;
  }
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints]
  );

  const [heights, setHeights] = React.useState<number[]>(
    () =>
      seedUnmeasuredMasonryHeights({
        itemCount: items.length,
        previousHeights: [],
        measuredIndices: new Set(),
        initialHeights: masonryInitialHeights,
      })
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
      effectiveBreakpoints
    );
    return Math.max(1, raw | 0);
  }, [masonryColumns, viewportWidth, effectiveBreakpoints]);

  const gapPx = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonryGap,
      DEFAULT_MASONRY_GAP_PX,
      viewportWidth,
      effectiveBreakpoints
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
        })
      ),
    [items, masonrySpans, columnCount, viewportWidth, effectiveBreakpoints]
  );

  const columnWidthCssExpr = React.useMemo(
    () => buildMasonryColumnWidthCssExpr({ containerWidthCss: '100%' }),
    []
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
    [notifyLayoutMeasured]
  );

  React.useLayoutEffect(() => {
    notifyLayoutMeasured();
  }, [heights, notifyLayoutMeasured]);

  const positionedChildren = React.useMemo(() => {
    return items.map((child, index) => {
      const position = positionedLayout.items[index];
      if (!position) return null;

      return (
        <MasonryItem
          key={index}
          index={index}
          onHeight={handleHeight}
          className={masonryClassNames?.item}
          masonryPlugins={masonryPlugins}
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
    handleHeight,
    masonryPlugins,
    masonryClassNames?.item,
    onVisibleIndex,
    measurementKey,
    revealedIndicesRef,
  ]);

  return (
    <RootComponent
      ref={masonryRootRef as any}
      className={masonryClassNames?.root}
      data-rmg-masonry-layout-seed={masonryLayoutSeedScopeId}
      style={{
        position: 'relative',
        width: '100%',
        height: `${positionedLayout.height}px`,
        ['--rmg-cols' as any]: columnCount,
        ['--rmg-gap' as any]: `${gapPx}px`,
        ...(masonryStyle || {}),
      }}
    >
      {positionedChildren}
    </RootComponent>
  );
};

type MasonryItemProps = {
  index: number;
  onHeight: (index: number, height: number) => void;
  className?: string;
  top: number;
  left: string;
  width: string;
  masonryPlugins?: MasonryPlugin[];
  onVisibleIndex?: (index: number) => void;
  revealedIndicesRef?: React.RefObject<Set<number>>;
  measurementKey?: string;
  children: React.ReactNode;
};

const MasonryItem: React.FC<MasonryItemProps> = ({
  index,
  onHeight,
  className,
  top,
  left,
  width,
  masonryPlugins,
  onVisibleIndex,
  revealedIndicesRef,
  measurementKey,
  children,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const localRevealedIndicesRef = React.useRef(new Set<number>());
  const resolvedRevealedIndicesRef =
    revealedIndicesRef ?? localRevealedIndicesRef;
  const pluginItemEntry = React.useMemo(
    () => masonryPlugins?.find((plugin) => plugin.renderItem),
    [masonryPlugins]
  );

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
  }, [index, onHeight, measurementKey]);

  React.useEffect(() => {
    if (!onVisibleIndex) return;

    const host = ref.current;
    if (!host) return;

    let sent = false;
    const notify = () => {
      if (sent) return;
      sent = true;
      onVisibleIndex(index);
    };

    if (typeof IntersectionObserver === 'undefined') {
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
      { root, rootMargin: '200px', threshold: 0.15 }
    );

    io.observe(host);
    return () => io.disconnect();
  }, [children, index, onVisibleIndex]);

  const itemProps = {
    className,
    'data-rmg-idx': index,
    style: {
      position: 'absolute',
      top: `${top}px`,
      left,
      width,
      ['--rmg-reveal-index' as any]: index,
    },
  } as React.HTMLAttributes<HTMLDivElement>;

  if (pluginItemEntry?.renderItem) {
    return pluginItemEntry.renderItem(
      {
        index,
        itemRef: ref,
        itemProps,
        children,
        revealedIndicesRef: resolvedRevealedIndicesRef,
      },
      pluginItemEntry.options
    );
  }

  return (
    <div ref={ref} {...itemProps}>
      {children}
    </div>
  );
};
