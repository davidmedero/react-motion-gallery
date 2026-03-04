import { ResponsiveNumber } from "../shared/responsive";
import type { GridSkeletonSpec } from "./GridSkeleton";

export type LoadingOptions = {
  enabled?: boolean;
  force?: boolean;
  renderLoading?: (args: { count: number }) => React.ReactNode;
  skeleton?: GridSkeletonSpec;
};

export type IntroOptions = {
  renderIntro?: (
    args: { active: boolean; containerProps: React.HTMLAttributes<HTMLDivElement> },
    content: React.ReactNode
  ) => React.ReactNode;
  staggerMs?: number;
  transform?: string;
  durationMs?: number;
  easing?: string;
  staggerLimit?: number;
};

type FullscreenTrigger = 'item' | 'media';

export type GridOptions = {
  columns?: ResponsiveNumber;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
  fullscreenTrigger?: FullscreenTrigger;
  loading?: LoadingOptions;
  intro?: IntroOptions;
};