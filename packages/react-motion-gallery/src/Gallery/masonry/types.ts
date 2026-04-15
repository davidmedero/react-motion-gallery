import { ResponsiveNumber } from "../shared/responsive";
import type { GalleryLazyLoadOptions } from "../shared/types/lazy";
import type { LoadingTimingOptions } from "../shared/types/transitions";
import { MasonrySkeletonSpec } from "./MasonrySkeleton";

export type LoadingOptions = {
  enabled?: boolean;
  force?: boolean;
  renderLoading?: (args: { count: number }) => React.ReactNode;
  skeleton?: MasonrySkeletonSpec;
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

export type FullscreenTrigger = "item" | "media";

export type MasonryLazyLoadOptions = GalleryLazyLoadOptions;

export type MasonryOptions = {
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  placement?: "balanced" | "roundRobin";
  fullscreenTrigger?: FullscreenTrigger;
  estimatedItemHeight?: number;
  itemWrapClassName?: string;
  itemWrapStyle?: React.CSSProperties;
  as?: React.ElementType;
  rootRef?: React.Ref<HTMLDivElement>;
  classNames?: {
    root?: string;
    column?: string;
    item?: string;
  };
  lazyLoad?: MasonryLazyLoadOptions;
  loading?: LoadingOptions;
  intro?: IntroOptions;
};
