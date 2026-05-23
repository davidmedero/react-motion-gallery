import { ResponsiveNumber } from "../responsive";

export type LoadingTimingOptions = {
  exitMs?: number;
  minVisibleMs?: number;
};

export type LoadingOptions = {
  isLoading?: boolean;
  skeletonCount?: ResponsiveNumber;
  timing?: LoadingTimingOptions;
  renderLoading?: (args: {
    layout: "slider" | "grid" | "masonry" | "entries";
    count: number;
  }) => React.ReactNode;
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

export type RevealOptions = {
  renderReveal?: (
    args: { active: boolean; containerProps: React.HTMLAttributes<HTMLDivElement> },
    content: React.ReactNode
  ) => React.ReactNode;
  staggerMs?: number;
  durationMs?: number;
  easing?: string;
  staggerLimit?: number;
};
