import type * as React from "react";
import { MediaItem } from "../shared/types/media";
import { ElementStyle } from "../shared/types/elements";
import {
  BreakpointMap,
  ResponsiveCaptionPlacement,
  ResponsiveLength,
  ResponsiveNumber,
} from "../shared/responsive";
import { SliderHandle } from "../slider/types";
import { EntriesOptions, MediaEntryLink, SlideOwner } from "../entries";
import { PlyrOptionsBuilder, PlyrSourceBuilder } from "../video/plyrTypes";
import type { ZoomPanOptions } from "../zoomPan/types";
import { FullscreenOpenMethod } from "../api/types";
import type { CrossFade } from "../slider/types";
import type { FullscreenRuntimeProps } from "./FullscreenRuntime";

export type FsCounterArgs = { index: number; count: number };
export type FsCaptionPlacement = "top" | "right" | "bottom" | "left";

export type FullscreenBridge = {
  layout: "slider" | "grid" | "masonry" | "entries";
  normalizedItems: MediaItem[];
  entriesObject: EntriesOptions;
  entryMapRef: React.RefObject<MediaEntryLink[] | null>;
  getOwnerSliderHandle: (fsIndex: number) => SliderHandle | null;
  syncEntrySliderBeforeOpen?: (gridIndex: number) => void;
  effectiveBreakpoints: BreakpointMap;
  entrySliderRefs: React.RefObject<(SliderHandle | null)[]>;
  fsOwnersRef: React.RefObject<SlideOwner[]>;
  sliderApiRef: React.RefObject<SliderHandle | null>;
};

export type FsIntroRequest = null | {
  originalImage: HTMLImageElement | null;
  index: number;
  method: FullscreenOpenMethod;
  closestSelector?: string;
};

export type FSImageRender = (args: {
  item: Extract<MediaItem, { kind: "image" }>;
  index: number;
  isZoomed: boolean;
  className: string;
  baseStyle: React.CSSProperties;
}) => React.ReactNode;

export type FullscreenArrows = {
  enabled?: boolean;
  arrow?: ElementStyle;
  prev?: ElementStyle;
  next?: ElementStyle;
  render?: (args: { dir: "prev" | "next" }) => React.ReactNode;
  renderPrev?: () => React.ReactNode;
  renderNext?: () => React.ReactNode;
};

export type FullscreenClose = {
  enabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  render?: () => React.ReactNode;
};

export type FullscreenCounter = {
  enabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  render?: (args: FsCounterArgs) => React.ReactNode;
};

export type FullscreenControlsOptions = {
  close?: FullscreenClose;
  arrows?: FullscreenArrows;
  counter?: FullscreenCounter;
};

export type FsCaptionRenderArgs = {
  item: MediaItem;
  index: number;
  isZoomed: boolean;
};

export type FullscreenCaptionOptions = {
  className?: string;
  style?: React.CSSProperties;
  width?: ResponsiveLength;
  height?: ResponsiveLength;
  placement?: ResponsiveCaptionPlacement;
  breakpoint?: number;
  render?: (args: FsCaptionRenderArgs) => React.ReactNode;
  layout?: "overlay" | "slide";
  overlayCrossfadeTarget?: "content" | "overlay";
  overlayCrossfadeDurationMs?: number;
  overlayCrossfadeEasing?: string;
  zoomFade?: boolean;
  zoomFadeDurationMs?: number;
  zoomFadeEasing?: string;
  zoomInTransform?: string;
  zoomOutTransform?: string;
};

export type FullscreenCrossfadeOptions = CrossFade;

export type FullscreenEffectsOptions = {
  introDuration?: number;
  introEasing?: string;
  introFade?: boolean;
  introStickyNavSelector?: string;
  crossfade?: FullscreenCrossfadeOptions;
};

export type FullscreenSliderOptions = {
  gap?: ResponsiveNumber;
  duration?: number;
  friction?: number;
  direction?: "ltr" | "rtl";
};

export type FullscreenZoomPanOptions = ZoomPanOptions;

export type FullscreenVideoOptions = {
  source?: PlyrSourceBuilder;
  options?: PlyrOptionsBuilder;
  playOnOpen?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

export type FullscreenLazyLoadKind = "image" | "video";

export type FullscreenLazyLoadArgs = {
  kind: FullscreenLazyLoadKind;
  isClone?: boolean;
};

export type FullscreenLazyLoadConfig = {
  enabled?: boolean;
  spinner?: boolean | React.ReactNode | ((args: FullscreenLazyLoadArgs) => React.ReactNode);
  spinnerClassName?: string;
  spinnerStyle?: React.CSSProperties;
};

export type FullscreenLazyLoadOptions = {
  images?: FullscreenLazyLoadConfig;
  videos?: FullscreenLazyLoadConfig;
};

export type FullscreenOptions = {
  enabled?: boolean;
  items?: MediaItem[] | string[];
  renderImage?: FSImageRender;
  video?: FullscreenVideoOptions;
  controls?: FullscreenControlsOptions;
  caption?: FullscreenCaptionOptions;
  slider?: FullscreenSliderOptions;
  zoom?: FullscreenZoomPanOptions;
  effects?: FullscreenEffectsOptions;
  lazyLoad?: FullscreenLazyLoadOptions;
};

export type FullscreenPluginKind =
  | "slider"
  | "controls"
  | "captions"
  | "zoom-pan"
  | "video"
  | "lazy-load"
  | "crossfade"
  | "thumbnails";

export type FullscreenPluginOptions = Partial<FullscreenOptions>;

export type FullscreenRuntimeFeatures = {
  useZoomPanRuntime?: (args: any) => {
    isPinching: React.RefObject<boolean>;
    isTouchPinching: React.RefObject<boolean>;
    entryOverlayZoomMotion?: unknown;
    captionZoomMotion?: unknown;
    handlePanPointerStart: (
      e: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => void;
    handleZoomToggle: (
      e: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => void;
    resetAllZoomDom: (args?: { disableImageTransition?: boolean }) => void;
    resetForSlideNavigation: () => void;
    forceResetZoom?: () => void;
  };
  usePlyrProps?: (args: {
    items: MediaItem[];
    source?: FullscreenVideoOptions["source"];
    options?: FullscreenVideoOptions["options"];
  }) => unknown[];
  defaultPlayerStyle?: React.CSSProperties;
  createVideoSnapshotStore?: () => unknown;
  renderSlides?: (args: any) => React.ReactNode[];
  renderCrossfadeSlides?: (args: any) => React.ReactNode[];
};

export type FullscreenPlugin = {
  readonly __rmgFullscreenPlugin: true;
  readonly kind: FullscreenPluginKind;
  readonly options?: FullscreenPluginOptions;
  readonly runtime?: FullscreenRuntimeFeatures;
  readonly RuntimeHost?: React.ComponentType<FullscreenRuntimeProps>;
  readonly preload?: () => void;
};
