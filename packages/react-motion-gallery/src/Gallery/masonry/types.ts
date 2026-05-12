import { type ResponsiveNumber } from "../shared/responsive";
import type { GalleryLazyLoadOptions } from "../shared/types/lazy";

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
export type MasonrySpan = number | "full";
export type ResponsiveMasonrySpan = MasonrySpan | Record<string, MasonrySpan>;

export type MasonryItemProps = {
  span?: ResponsiveMasonrySpan;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export type MasonryHandle = {
  getRootNode: () => HTMLElement | null;
  getItemNodes: () => HTMLElement[];
  isReady: () => boolean;
  onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};

export type MasonryOptions = {
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  placement?: "balanced" | "roundRobin" | "horizontalOrder";
  fullscreenTrigger?: FullscreenTrigger;
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
  intro?: IntroOptions;
};
