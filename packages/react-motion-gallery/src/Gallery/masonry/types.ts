import { ResponsiveNumber } from "../shared/responsive";
import { IntroOptions, LoadingOptions } from "../shared/types/transitions";

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