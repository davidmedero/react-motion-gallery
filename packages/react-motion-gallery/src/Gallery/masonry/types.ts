import { ResponsiveNumber } from "../shared/responsive";
import { MasonrySkeletonSpec } from "./MasonrySkeleton";

export type LoadingOptions = {
  enabled?: boolean;
  force?: boolean;
  renderLoading?: (args: { count: number }) => React.ReactNode;
  skeleton?: MasonrySkeletonSpec;
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

export type MasonryOptions = {
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  placement?: "balanced" | "roundRobin";
  estimatedItemHeight?: number;
  as?: React.ElementType;
  rootRef?: React.Ref<HTMLDivElement>;
  classNames?: {
    root?: string;
    column?: string;
    item?: string;
  };
  loading?: LoadingOptions;
  intro?: IntroOptions;
};