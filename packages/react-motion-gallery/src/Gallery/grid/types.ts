import type { ResponsiveNumber } from "../shared/responsive";
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

type FullscreenTrigger = 'item' | 'media';

export type GridLazyLoadOptions = GalleryLazyLoadOptions;
export type GridSpan = number | "full";
export type ResponsiveGridSpan = GridSpan | Record<string, GridSpan>;
export type ResponsiveGridTemplate = string | Record<string, string>;

export type GridItemProps = {
  span?: ResponsiveGridSpan;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export type GridHandle = {
  getRootNode: () => HTMLElement | null;
  getItemNodes: () => HTMLElement[];
  isReady: () => boolean;
  onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};

export type GridOptions = {
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
  fullscreenTrigger?: FullscreenTrigger;
  lazyLoad?: GridLazyLoadOptions;
  intro?: IntroOptions;
};
