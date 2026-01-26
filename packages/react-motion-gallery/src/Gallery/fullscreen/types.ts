import type * as React from "react";
import { MediaItem } from "../shared/types/media";
import { ElementStyle } from "../shared/types/elements";
import { ThumbnailsOptions } from "../slider/thumbnails/types";

export type FsCounterArgs = { index: number; count: number };
export type FsCaptionPlacement = "top" | "right" | "bottom" | "left";

export type FSImageRender = (args: {
  item: Extract<MediaItem, { kind: "image" }>;
  index: number;
  isZoomed: boolean;
  className: string;
  baseStyle: React.CSSProperties;
}) => React.ReactNode;

export type PlyrSourceBuilder = (item: MediaItem, index: number) => Plyr.SourceInfo;
export type PlyrOptionsResolver =
  | Plyr.Options
  | ((item: MediaItem, index: number) => Plyr.Options);

export type FullscreenArrows = {
  enabled?: boolean;
  arrow?: ElementStyle;
  prev?: ElementStyle;
  next?: ElementStyle;
  render?: (args: { dir: "prev" | "next" }) => HTMLElement | null;
  renderPrev?: () => HTMLElement | null;
  renderNext?: () => HTMLElement | null;
};

export type FullscreenClose = {
  enabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  render?: () => HTMLElement | null;
};

export type FullscreenCounter = {
  enabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  render?: (args: FsCounterArgs) => HTMLElement | null;
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
  thumbnailsFadeDuration?: number;
  thumbnailsFadeEasing?: string;
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
  options?: PlyrOptionsResolver;
  style?: React.CSSProperties;
  className?: string;
};

export type FullscreenOptions = {
  enabled?: boolean;
  items?: MediaItem[] | string[];
  renderImage?: FSImageRender;
  video?: FullscreenVideoOptions;
  thumbnails?: ThumbnailsOptions;
  controls?: FullscreenControlsOptions;
  caption?: FullscreenCaptionOptions;
  slider?: FullscreenSliderOptions;
  zoom?: FullscreenZoomPanOptions;
  effects?: FullscreenEffectsOptions;
};