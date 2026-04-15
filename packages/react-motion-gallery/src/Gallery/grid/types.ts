import { ResponsiveNumber } from "../shared/responsive";
import type { GalleryLazyLoadOptions } from "../shared/types/lazy";
import type { LoadingTimingOptions } from "../shared/types/transitions";
import type { GridSkeletonSpec } from "./GridSkeleton";

export type LoadingOptions = {
  enabled?: boolean;
  force?: boolean;
  renderLoading?: (args: { count: number }) => React.ReactNode;
  skeleton?: GridSkeletonSpec;
  timing?: LoadingTimingOptions;
};

export type IntroOptions = {
  renderIntro?: (
    args: { active: boolean; containerProps: React.HTMLAttributes<HTMLDivElement> },
    content: React.ReactNode
  ) => React.ReactNode;
  staggerMs?: number;
  durationMs?: number;
  easing?: string;
  staggerLimit?: number;
};

type FullscreenTrigger = 'item' | 'media';

export type GridLazyLoadOptions = GalleryLazyLoadOptions;
export type GridSpan = number | "full";
export type ResponsiveGridSpan = GridSpan | Record<string, GridSpan>;
export type ResponsiveGridTemplate = string | Record<string, string>;

export type GridItemProps = {
  span?: ResponsiveGridSpan;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export type GridOptions = {
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
  fullscreenTrigger?: FullscreenTrigger;
  lazyLoad?: GridLazyLoadOptions;
  loading?: LoadingOptions;
  intro?: IntroOptions;
};
