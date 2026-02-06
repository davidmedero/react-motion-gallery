import { ResponsiveNumber } from "../shared/responsive";

export type LoadingOptions = {
  isLoading?: boolean;
  renderLoading?: () => React.ReactNode;
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
  ratios?: number[];
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