import * as React from 'react';
import styles from '../index.module.css';
import type { BreakpointMap, ResponsiveNumber } from '../shared/responsive';
import { parseNumberLike, resolveNumberFromResponsive } from '../shared/responsive';

import { useInViewOnce } from '../shared/hooks/useInViewOnce';
import { useMediaReady } from '../shared/hooks/useMediaReady';

import { Masonry, DefaultMasonrySkeleton } from './Masonry';

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
};

type IntroNormalized = {
  renderIntro?: any;
  staggerMs: number;
  transform: string;
  durationMs: number;
  easing: string;
};

type LoadingNormalized = {
  isLoading?: boolean;
  renderLoading?: (args: { layout: 'masonry'; count: number }) => React.ReactNode;
};

export type MasonryLayoutProps = {
  items: React.ReactNode[];
  masonry: MasonryOptions;
  breakpoints: BreakpointMap;
  viewportWidth: number;
  loading: LoadingNormalized;
  intro: IntroNormalized;
  skeletonCount: number;
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (!ref) return;
  if (typeof ref === 'function') ref(value);
  else (ref as any).current = value;
}

export function MasonryLayout({
  items,
  masonry,
  breakpoints,
  viewportWidth,
  loading,
  intro,
  skeletonCount,
}: MasonryLayoutProps) {
  const localRootRef = React.useRef<HTMLDivElement | null>(null);

  const [inView, setInView] = React.useState(false);
  const [mediaReady, setMediaReady] = React.useState(false);

  // observe whichever node is actually mounted
  useInViewOnce(true, localRootRef as any, () => setInView(true));
  useMediaReady(true, localRootRef as any, setMediaReady);

  const isLoading = loading.isLoading ?? !mediaReady;
  const introActive = !isLoading && inView;

  const DEFAULT_MASONRY_COLUMNS = 4;
  const DEFAULT_MASONRY_GAP_PX = 8;

  const masonryColumnCount = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonry.columns,
      DEFAULT_MASONRY_COLUMNS,
      viewportWidth,
      breakpoints
    );
    return Math.max(1, (raw as any) | 0);
  }, [masonry.columns, viewportWidth, breakpoints]);

  const masonryGapPx = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonry.gap,
      DEFAULT_MASONRY_GAP_PX,
      viewportWidth,
      breakpoints
    );
    return Math.max(0, parseNumberLike(raw as any, DEFAULT_MASONRY_GAP_PX));
  }, [masonry.gap, viewportWidth, breakpoints]);

  const defaultMasonrySkeleton = (
    <div className={styles.gridSkeletonOverlay}>
      <DefaultMasonrySkeleton
        count={skeletonCount}
        columnCount={masonryColumnCount}
        gapPx={masonryGapPx}
        classNames={{
          root: styles.gridSkeletonMasonryRoot,
          column: styles.gridSkeletonMasonryCol,
          item: styles.gridSkeletonItem,
        }}
      />
    </div>
  );

  const loadingNode = isLoading
    ? loading.renderLoading
      ? loading.renderLoading({ layout: 'masonry', count: skeletonCount })
      : defaultMasonrySkeleton
    : null;

  const masonryRootClassName = [
    styles.masonryRoot,
    styles.introContainer,
    introActive ? styles.introActive : '',
    masonry.classNames?.root || '',
  ]
    .filter(Boolean)
    .join(' ');

  // merged ref so both localRootRef + user rootRef get the node
  const mergedRootRef = React.useCallback((node: HTMLDivElement | null) => {
    localRootRef.current = node;
    assignRef(masonry.rootRef as any, node);
  }, [masonry.rootRef]);

  return (
    <>
      {loadingNode}
      <Masonry
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
      />
    </>
  );
}