import { ResponsiveNumber } from "../responsive";

export type LoadingOptions = {
  isLoading?: boolean;
  skeletonCount?: ResponsiveNumber;
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