import * as React from 'react';
import styles from './Masonry.module.css';
import type { BreakpointMap, ResponsiveNumber } from '../shared/responsive';
import { useInViewOnce } from '../shared/hooks/useInViewOnce';
import { useMediaReady } from '../shared/hooks/useMediaReady';
import { MasonryCore } from './Masonry';
import { MasonrySkeletonCard } from './MasonrySkeleton';
import { IntroOptions, LoadingOptions } from './types';

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

export function MasonryLayout({
  items,
  masonry,
  breakpoints,
  loading,
  intro,
  skeletonCount,
}: MasonryLayoutProps) {
  const localRootRef = React.useRef<HTMLDivElement | null>(null);

  const [inView, setInView] = React.useState(false);
  const [mediaReady, setMediaReady] = React.useState(false);

  useInViewOnce(true, localRootRef as any, () => setInView(true));
  useMediaReady(true, localRootRef as any, setMediaReady);

  const loadingEnabledFlag = loading.enabled ?? true;
  const loadingForced = loading.force ?? false;
  const loadingActive = loadingEnabledFlag && (loadingForced || !mediaReady);
  const introActive = mediaReady && inView;

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

  const loadingNode = loadingActive
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
    <>
      {loadingNode}
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
      />
    </>
  );
}