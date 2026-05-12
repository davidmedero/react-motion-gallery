import type { ResponsiveNumber } from "../shared/responsive";
import type {
  ArrowRenderArgs,
  DotsRenderArgs,
  ProgressRenderArgs,
  ScrollbarRenderArgs,
} from "../shared/types/controls";
import { ElementStyle } from "../shared/types/elements";
import type { IndexMode } from "../api/types";
import { RefObject } from "react";
import type { SliderIndexChannel } from "./sliderSub";
import type { LoadingForceOptions } from "../shared/loading/force";

export type SliderNodeInput = React.ReactNode | React.ReactNode[];
export type SliderRemoveTarget = number | ((i: number) => boolean);

export interface SliderItemsApi {
  append(nodes: SliderNodeInput): number;
  prepend(nodes: SliderNodeInput): number;
  insert(index: number, nodes: SliderNodeInput): number;
  remove(indexOrPredicate: SliderRemoveTarget): number;
  replace(index: number, node: React.ReactNode): void;
  setItems(nodes: React.ReactNode[]): number;
}

export interface SliderApi extends SliderItemsApi {
  onIndexChange(cb: (i: number, meta: { mode: IndexMode }) => void): () => void;
}

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

export type SliderSkipSnapsOptions = {
  enabled?: boolean;
  threshold?: number;
};

export type SliderSkipSnaps = boolean | SliderSkipSnapsOptions;

export type SliderScroll = {
  groupCells?: boolean;
  skipSnaps?: SliderSkipSnaps;
  strictSnaps?: boolean;
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

export type SliderScrollbar = {
  enabled?: boolean;
  root?: ElementStyle;
  render?: (args: ScrollbarRenderArgs) => React.ReactNode;
};

export type SliderRipple = {
  enabled?: boolean;
  className?: string;
};

export type SliderControls = {
  arrows?: SliderArrows;
  dots?: SliderDots;
  progress?: SliderProgress;
  scrollbar?: SliderScrollbar;
  ripple?: SliderRipple;
};

export type SliderAutoPlay = {
  enabled?: boolean;
  speedMs?: number;
  pauseMs?: number;
  pauseOnHover?: boolean;
};

export type SliderAutoPlayTimer = {
  active: boolean;
  speedMs: number;
  startedAt: number | null;
  elapsedMs: number;
  remainingMs: number;
  progress: number;
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

export type SliderAutoHeight = {
  enabled?: boolean;
  duration?: string;
  easing?: string;
};

export type SliderLoadingOptions = {
  enabled?: boolean;
  force?: LoadingForceOptions;
  skeletonCount?: ResponsiveNumber;
  renderLoading?: (args: { count: number }) => React.ReactNode;
};

export type SliderIntroOptions = {
  renderIntro?: (
    args: { active: boolean; containerProps: React.HTMLAttributes<HTMLDivElement> },
    content: React.ReactNode
  ) => React.ReactNode;
  inView?: boolean;
  staggerMs?: number;
  durationMs?: number;
  easing?: string;
};

export type SliderTransitions = {
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
  minOpacity?: number;
};

export type CrossFadeWheelOptions = {
  enabled?: boolean;
  sensitivity?: number;
  commitThreshold?: number;
  durationMs?: number;
  sessionGapMs?: number;
};

export type CrossFadeWheel = boolean | CrossFadeWheelOptions;

export type CrossFade = {
  controls?: boolean;
  drag?: boolean;
  wheel?: CrossFadeWheel;
  durationMs?: number;
  easing?: string;
};

export type SliderEffects = {
  parallax?: SliderParallax;
  scale?: SliderScale;
  fade?: SliderFade;
  crossfade?: CrossFade;
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

export type SliderPluginKind =
  | "arrows"
  | "dots"
  | "progress"
  | "scrollbar"
  | "ripple"
  | "auto-play"
  | "auto-scroll"
  | "auto-height"
  | "lazy-load"
  | "parallax"
  | "scale"
  | "fade"
  | "crossfade"
  | "fullscreen"
  | "loading";

export type SliderPluginHost = {
  handle: SliderHandle | null;
  coreReady: boolean;
  index: number;
  slideCount: number;
  cellsInView: number[];
  progress: number;
  axis: "x" | "y";
  dir: "ltr" | "rtl";
  loop: boolean;
  freeScroll: boolean;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  createRipple: (el: HTMLElement) => void;
  hasPlugin: (kind: SliderPluginKind) => boolean;
  setPluginReady: (ready: boolean) => void;
  setAutoPlayTimer: (timer: SliderAutoPlayTimer | null) => void;
};

export type SliderPluginRuntimeProps = {
  host: SliderPluginHost;
};

export type SliderPlugin = {
  readonly __rmgSliderPlugin: true;
  readonly kind: SliderPluginKind;
  readonly options?: unknown;
  readonly blocksReady?: boolean;
  transformChildren?: (children: React.ReactNode, options?: unknown) => React.ReactNode;
  Runtime?: React.ComponentType<SliderPluginRuntimeProps & { options?: unknown }>;
  renderOverlay?: (host: SliderPluginHost, options?: unknown) => React.ReactNode;
};

export type SliderOptions = {
  initialIndex?: number;
  layout?: SliderLayout;
  direction?: SliderDirection;
  align?: "start" | "center";
  scroll?: SliderScroll;
  elements?: SliderElements;
  transitions?: SliderTransitions;
  motion?: SliderMotion;
  indexChannel?: SliderIndexChannel;
  plugins?: SliderPlugin[];
};

export type SliderUiSelectOptions = {
  crossfade?: boolean;
  durationMs?: number;
  easing?: string;
};

export type SliderMotionSnapshot = {
  location: number;
  previous: number;
  offset: number;
  target: number;
  x: number;
};

export type SliderCrossfadeCoreApi = {
  getIndex: () => number;
  getSlideCount: () => number;
  getViewportMainSize: () => number;
  getViewportNode: () => HTMLDivElement | null;
  getSnapLocationForIndex: (index: number) => number;
  readMotionState: () => SliderMotionSnapshot;
  restoreMotionState: (state: SliderMotionSnapshot) => void;
  renderTrackAtLocation: (location: number) => void;
  jumpTrackToIndexInstant: (index: number) => void;
  jumpToIndexInstant: (index: number, mode?: IndexMode) => void;
  commitIndexOnly: (
    index: number,
    mode: IndexMode,
    sourceIndex?: number
  ) => void;
};

export type SliderCrossfadeRuntime = {
  isBusy: () => boolean;
  finish: () => void;
  canUseDrag: () => boolean;
  beginDrag: () => void;
  updateDrag: (delta: number) => boolean;
  settleDrag: (force: number) => boolean;
  canUseWheel: () => boolean;
  updateWheel: (signedWheelDelta: number, now: number) => boolean;
  clearWheelSession: () => void;
  startUi: (
    index: number,
    options?: { durationMs?: number; easing?: string }
  ) => boolean;
};

export interface SliderCoreHandle {
  centerSlider: () => void;
  getIndex: () => number;
  setIndex: (i: number, mode?: IndexMode) => void;
  subscribeIndex: (fn: () => void) => () => void;
  getAutoPlayTimer: () => SliderAutoPlayTimer;
  slideIndexForCell: (cellIndex: number) => number;
  getRootNode(): HTMLElement | null;
  getContainerNode(): HTMLElement | null;
  getSlideNodes(): HTMLElement[];
  getViewportNode: () => HTMLDivElement | null;
  onSlidesBuilt(cb: (nodes: HTMLElement[]) => void): () => void;
  whenSlidesBuilt(): Promise<HTMLElement[]>;
  isSlidesBuilt(): boolean;
  onReady(cb: (nodes: HTMLElement[]) => void): () => void;
  whenReady(): Promise<HTMLElement[]>;
  isReady(): boolean;
  scrollNext: (mode?: IndexMode) => void;
  scrollPrev: (mode?: IndexMode) => void;
  canScrollNext: () => boolean;
  canScrollPrev: () => boolean;
  scrollProgress: () => number;
  cellsInView: () => number[];
  getInternals(): {
    slides: RefObject<{ cells: { element: HTMLElement; index: number }[]; target: number }[]>;
    slider: RefObject<HTMLDivElement | null>;
    sliderWidth: RefObject<number>;
    offsetLocation: RefObject<{ get(): number } | null>;
    visibleImages: RefObject<number>;
    selectedIndex: RefObject<number>;
    sliderX: RefObject<number>;
    sliderVelocity: RefObject<number>;
    isWrapping: RefObject<boolean>;
    getCenterOffsetForIndex: (idx: number) => number;
  };
  _scrollByPixels?: (deltaPx: number) => boolean;
  _scrollToProgressFromUi?: (progress: number) => boolean;
  _usesLegacyEngine?: boolean;
  _getCrossfadeCore?: () => SliderCrossfadeCoreApi;
  _registerCrossfadeRuntime?: (
    runtime: SliderCrossfadeRuntime | null
  ) => () => void;
  setIndexFromUi: (i: number, opts?: SliderUiSelectOptions) => void;
}

export interface SliderHandle extends SliderCoreHandle, SliderApi {}
