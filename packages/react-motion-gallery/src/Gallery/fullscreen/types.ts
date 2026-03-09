import type * as React from "react";
import { MediaItem } from "../shared/types/media";
import { ElementStyle } from "../shared/types/elements";
import { BreakpointMap } from "../shared/responsive";
import { SliderHandle } from "../slider/types";
import { EntriesOptions, MediaEntryLink, SlideOwner } from "../entries";
import { PlyrOptionsBuilder, PlyrSourceBuilder } from "../video/plyrTypes";
import { FullscreenOpenMethod } from "../api/types";

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

/**
 * Custom fullscreen image renderers must output a real DOM `<img>` somewhere in
 * the returned tree so zoom, pinch, pan, and close transitions can resolve the
 * primary active image element. Wrapped renderers such as `next/image` are
 * supported, but the wrapper should act as layout scaffolding instead of
 * shrinking the fullscreen media surface on both axes or forcing the inner
 * image itself to behave like a full-bleed fill box.
 *
 * When this callback is provided and `fullscreen.lazyLoad.images.enabled` is
 * `false`, the renderer owns loading, placeholders, and image optimization
 * behavior exactly as usual.
 *
 * When this callback is provided and `fullscreen.lazyLoad.images.enabled` is
 * `true`, the built-in fullscreen lazy/decode/spinner pipeline waits on the
 * primary descendant DOM `<img>`. Custom placeholders or spinners inside the
 * renderer may still be visible beneath the built-in fullscreen spinner once
 * the renderer mounts.
 */
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
  placement?: FsCaptionPlacement;
  width?: number;
  height?: number;
  breakpoint?: number;
  render?: (args: FsCaptionRenderArgs) => React.ReactNode;
};

export type FullscreenEffectsOptions = {
  introDuration?: number;
  introEasing?: string;
  introFade?: boolean;
  slideFade?: boolean;
  slideFadeDuration?: number;
  slideFadeEasing?: string;
};

export type FullscreenSliderOptions = {
  duration?: number;
  friction?: number;
};

export type FullscreenZoomPanOptions = {
  clickZoomLevel?: number;
  maxZoomLevel?: number;
  panDuration?: number;
  panFriction?: number;
};

export type FullscreenVideoOptions = {
  source?: PlyrSourceBuilder;
  options?: PlyrOptionsBuilder;
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
