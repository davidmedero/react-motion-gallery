import { ResponsiveNumber } from "../responsive";

export type LoadingOptions = {
  isLoading?: boolean;
  skeletonCount?: ResponsiveNumber;
  renderLoading?: (args: {
    layout: "slider" | "grid" | "masonry" | "entries";
    count: number;
  }) => React.ReactNode;
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