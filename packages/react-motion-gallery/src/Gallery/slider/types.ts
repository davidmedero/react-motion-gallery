import type { ResponsiveNumber } from "../shared/responsive";
import type {
  ArrowRenderArgs,
  DotsRenderArgs,
  ProgressRenderArgs,
} from "../shared/types/controls";
import { ElementStyle } from "../shared/types/elements";
import { IndexMode } from "../api/types";
import { RefObject } from "react";
import { SliderSkeletonSpec } from "./SliderSkeleton";
import type { SliderIndexChannel } from "./sliderSub";

export type ResponsiveHeightRule = { query: string; height: string };

export type SliderLayout = {
  gap?: number;
  cellsPerSlide?: ResponsiveNumber;
};

export type SliderDirection = {
  dir?: "ltr" | "rtl";
  axis?: "x" | "y";
};

export type SliderElements = {
  viewport?: ElementStyle;
  container?: ElementStyle;
};

export type SliderScroll = {
  groupCells?: boolean;
  skipSnaps?: boolean;
  freeScroll?: boolean;
  loop?: boolean;
};

export type SliderArrows = {
  enabled?: boolean;
  arrow?: ElementStyle;
  prev?: ElementStyle;
  next?: ElementStyle;
  render?: (args: ArrowRenderArgs & { dir: "prev" | "next" }) => React.ReactNode;
  renderPrev?: (args: ArrowRenderArgs) => React.ReactNode;
  renderNext?: (args: ArrowRenderArgs) => React.ReactNode;
};

export type SliderDots = {
  enabled?: boolean;
  root?: ElementStyle;
  dot?: ElementStyle;
  render?: (args: DotsRenderArgs) => React.ReactNode;
};

export type SliderProgress = {
  enabled?: boolean;
  root?: ElementStyle;
  bar?: ElementStyle;
  render?: (args: ProgressRenderArgs) => React.ReactNode;
};

export type SliderRipple = {
  enabled?: boolean;
  className?: string;
};

export type SliderControls = {
  arrows?: SliderArrows;
  dots?: SliderDots;
  progress?: SliderProgress;
  ripple?: SliderRipple;
};

export type SliderAutoPlay = {
  enabled?: boolean;
  speedMs?: number;
  pauseMs?: number;
  pauseOnHover?: boolean;
};

export type SliderAutoScroll = {
  enabled?: boolean;
  speedMs?: number;
  pauseMs?: number;
  pauseOnHover?: boolean;
};

export type SliderAuto = {
  play?: SliderAutoPlay;
  scroll?: SliderAutoScroll;
};

export type SliderLoadingOptions = {
  enabled?: boolean;
  force?: boolean;
  skeletonCount?: ResponsiveNumber;
  renderLoading?: (args: { count: number }) => React.ReactNode;
  skeleton?: SliderSkeletonSpec;
};

export type SliderIntroOptions = {
  renderIntro?: (
    args: { active: boolean; containerProps: React.HTMLAttributes<HTMLDivElement> },
    content: React.ReactNode
  ) => React.ReactNode;
  staggerMs?: number;
  transform?: number | string;
  durationMs?: number;
  easing?: string;
};

export type SliderTransitions = {
  loading?: SliderLoadingOptions;
  intro?: SliderIntroOptions;
};

export type SliderParallax = {
  enabled?: boolean;
  bleedPct?: string;
  borderRadius?: string;
  sideWidth?: string;
};

export type SliderScale = {
  enabled?: boolean;
  amount?: number;
};

export type SliderFade = {
  enabled?: boolean;
};

export type SliderEffects = {
  parallax?: SliderParallax;
  scale?: SliderScale;
  fade?: SliderFade;
};

export type SliderMotion = {
  selectDuration?: number;
  freeScrollDuration?: number;
  friction?: number;
};

export type SliderLazyLoadOptions = {
  enabled?: boolean;
  spinner?: boolean | React.ReactNode | ((args: { kind: "image" | "video"; isClone: boolean }) => React.ReactNode);
  spinnerClassName?: string;
  spinnerStyle?: React.CSSProperties;
};

export type SliderOptions = {
  layout?: SliderLayout;
  direction?: SliderDirection;
  align?: "start" | "center";
  scroll?: SliderScroll;
  elements?: SliderElements;
  lazyLoad?: SliderLazyLoadOptions;
  controls?: SliderControls;
  auto?: SliderAuto;
  transitions?: SliderTransitions;
  motion?: SliderMotion;
  effects?: SliderEffects;
  indexChannel?: SliderIndexChannel;
};

export interface SliderHandle {
  centerSlider: () => void;
  getIndex: () => number;
  setIndex: (i: number, mode?: IndexMode) => void;
  subscribeIndex: (fn: () => void) => () => void;
  slideIndexForCell: (cellIndex: number) => number;
  getRootNode(): HTMLElement | null;
  getContainerNode(): HTMLElement | null;
  getSlideNodes(): HTMLElement[];
  getViewportNode: () => HTMLDivElement | null;
  onSlidesBuilt(cb: (nodes: HTMLElement[]) => void): () => void;
  whenSlidesBuilt(): Promise<HTMLElement[]>;
  isSlidesBuilt(): boolean;
  scrollNext: (mode?: IndexMode) => void;
  scrollPrev: (mode?: IndexMode) => void;
  canScrollNext: () => boolean;
  canScrollPrev: () => boolean;
  scrollProgress: () => number;
  cellsInView: () => number[];
  getInternals(): {
    slides: RefObject<{ cells: { element: HTMLElement; index: number }[]; target: number }[]>;
    slider: RefObject<HTMLDivElement | null>;
    visibleImages: RefObject<number>;
    selectedIndex: RefObject<number>;
    sliderX: RefObject<number>;
    sliderVelocity: RefObject<number>;
    isWrapping: RefObject<boolean>;
  };
}
