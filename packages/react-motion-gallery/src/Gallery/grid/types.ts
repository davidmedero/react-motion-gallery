import { ResponsiveNumber } from "../shared/responsive";
import type { GridSkeletonSpec } from "./GridSkeleton";

export type LoadingOptions = {
  isLoading?: boolean;
  renderLoading?: (args: { count: number }) => React.ReactNode;
  skeleton?: GridSkeletonSpec;
  shimmer?: {
    paddingBottom?: string;
    radius?: number | string;
    c1?: string;
    c2?: string;
    c3?: string;
    size?: string;
    duration?: string;
    timing?: string;
  };
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

export type GridOptions = {
  columns?: ResponsiveNumber;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
  loading?: LoadingOptions;
  intro?: IntroOptions;
};