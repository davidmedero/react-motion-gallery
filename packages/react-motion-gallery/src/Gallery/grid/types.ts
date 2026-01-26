import { ResponsiveNumber } from "../shared/responsive";
import { IntroOptions, LoadingOptions } from "../shared/types/transitions";

export type GridOptions = {
  columns?: ResponsiveNumber;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
  loading?: LoadingOptions;
  intro?: IntroOptions;
};