import type * as React from "react";
import type { BreakpointMap, ResponsiveNumber } from "../shared/responsive";
import type { LoadingForceOptions } from "../shared/loading/force";
import type { ArrowRenderArgs } from "../shared/types/controls";
import { ElementStyle } from "../shared/types/elements";
import type { LoadingTimingOptions } from "../shared/types/transitions";
import type { SliderVirtualizationOptions } from "../shared/virtualTrack";

export type ThumbnailPosition = "top" | "right" | "bottom" | "left";

export type ResponsivePosition =
  | ThumbnailPosition
  | Array<ThumbnailPosition>
  | Record<string, ThumbnailPosition>;

export type ThumbnailLoadingElements = {
  container?: ElementStyle;
  row?: ElementStyle;
  thumbnail?: ElementStyle;
};

export type ThumbnailSkeletonMode = "fit" | "peek";

export type ThumbnailLoadingRenderArgs = {
  count: number;
};

export type ThumbnailLoadingOptions = {
  enabled?: boolean;
  force?: LoadingForceOptions;
  skeletonCount?: ResponsiveNumber;
  mode?: ThumbnailSkeletonMode;
  renderLoading?: (args: ThumbnailLoadingRenderArgs) => React.ReactNode;
  elements?: ThumbnailLoadingElements;
  timing?: LoadingTimingOptions;
};

export type ThumbnailRevealOptions = {
  renderReveal?: (
    args: { active: boolean; containerProps: React.HTMLAttributes<HTMLDivElement> },
    inner: React.ReactNode
  ) => React.ReactNode;
  staggerMs?: number;
  durationMs?: number;
  easing?: string;
};

export type ThumbnailLayout = {
  width?: number | string;
  height?: number | string;
};

export type ThumbnailContainerLayout = {
  width?: number | string;
  height?: number | string;
};

export type ThumbnailsLayout = {
  position?: ResponsivePosition;
  gap?: number;
  center?: boolean;
  thumbnail?: ThumbnailLayout;
  container?: ThumbnailContainerLayout;
};

export type ThumbnailsElements = {
  container?: ElementStyle;
  thumbnail?: ElementStyle;
};

export type ThumbnailFadeOnSyncOptions = {
  enabled?: boolean;
  minDistance?: number;
  durationMs?: number;
  easing?: string;
};

export type ThumbnailsScroll = {
  freeScroll?: boolean;
  groupCells?: boolean;
  loop?: boolean;
  skipSnaps?: boolean;
  centerActiveThumb?: boolean;
  fadeOnSync?: boolean | ThumbnailFadeOnSyncOptions;
};

export type ThumbnailsMotion = {
  selectDuration?: number;
  freeScrollDuration?: number;
  friction?: number;
};

export type ThumbnailsRipple = {
  enabled?: boolean;
  className?: string;
};

export type ThumbnailsControls = {
  enabled?: boolean;
  arrow?: ElementStyle;
  prev?: ElementStyle;
  next?: ElementStyle;
  render?: (args: ArrowRenderArgs & { dir: "prev" | "next" }) => React.ReactNode;
  renderPrev?: (args: ArrowRenderArgs) => React.ReactNode;
  renderNext?: (args: ArrowRenderArgs) => React.ReactNode;
  ripple?: ThumbnailsRipple;
};

export type ThumbnailCrossfadeOptions = {
  enabled?: boolean;
  minDistance?: number;
  durationMs?: number;
  easing?: string;
};

export type ThumbnailSelectMeta = {
  transition: "scroll" | "crossfade";
  crossfade?: ThumbnailCrossfadeOptions;
};

export type ThumbnailsTransitions = {
  loading?: ThumbnailLoadingOptions;
  crossfade?: ThumbnailCrossfadeOptions;
};

export type ThumbnailRenderItemArgs<T = unknown> = {
  item: T;
  index: number;
  active: boolean;
  virtualIndex?: number;
};

export type ThumbnailRenderItem<T = unknown> = (
  args: ThumbnailRenderItemArgs<T>
) => React.ReactNode;

export type ThumbnailItemKey<T = unknown> = (
  item: T,
  index: number
) => React.Key;

export type ThumbnailsOptions<T = unknown> = {
  children?: React.ReactNode;
  items?: readonly T[];
  renderItem?: ThumbnailRenderItem<T>;
  getItemKey?: ThumbnailItemKey<T>;
  layout?: ThumbnailsLayout;
  elements?: ThumbnailsElements;
  scroll?: ThumbnailsScroll;
  controls?: ThumbnailsControls;
  motion?: ThumbnailsMotion;
  virtualization?: SliderVirtualizationOptions;
  reveal?: ThumbnailRevealOptions;
  transitions?: ThumbnailsTransitions;
  breakpointMap?: BreakpointMap;
};

export type { SliderVirtualizationOptions };
