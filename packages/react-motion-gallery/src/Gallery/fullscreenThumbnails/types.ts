import type * as React from 'react';
import type { BreakpointMap } from '../shared/responsive';
import type { ThumbnailCrossfadeOptions, ThumbnailPosition } from '../thumbnails/types';
import type { FullscreenSliderSub } from '../fullscreen/fullscreenSliderSub';

type ArrowRenderArgs = {
  ref: React.RefObject<HTMLDivElement | null>;
  onClick: () => void;
  hidden: boolean;
  disabled: boolean;
  createRipple: (el: HTMLElement) => void;
  className?: string;
};

export type FSItem = {
  thumbSrc: string;
  alt?: string;
};

export type FullscreenThumbnailSlotLayout = {
  position: ThumbnailPosition;
  className?: string;
  style?: React.CSSProperties;
  fadeDurationMs?: number;
  fadeEasing?: string;
};

export type FullscreenThumbnailBridge = {
  mountEl: HTMLDivElement | null;
  fsSub: FullscreenSliderSub;
  visible: boolean;
  invisible: boolean;
  direction: 'ltr' | 'rtl';
  registerLayout: (layout: FullscreenThumbnailSlotLayout) => void;
  clearLayout: () => void;
};

export type FullscreenThumbnailSliderProps = {
  bridge: FullscreenThumbnailBridge;
  items: FSItem[];
  position: ThumbnailPosition;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  thumbnailWidth?: number | string;
  thumbnailHeight?: number | string;
  thumbnailsCenter?: boolean;
  thumbnailsContainerWidth?: number | string;
  thumbnailsContainerHeight?: number | string;
  fadeDurationMs?: number;
  fadeEasing?: string;
  thumbnailItemClassName?: string;
  thumbnailItemStyle?: React.CSSProperties;
  gap?: number;
  freeScroll?: boolean;
  groupCells?: boolean;
  loop?: boolean;
  axis?: 'x' | 'y';
  skipSnaps?: boolean;
  centerActiveThumb?: boolean;
  selectDuration?: number;
  freeScrollDuration?: number;
  sliderFriction?: number;
  breakpointMap?: BreakpointMap;
  rippleEnabled?: boolean;
  rippleClassName?: string;
  showArrows?: boolean;
  arrowStyles?: React.CSSProperties;
  arrowClassName?: string;
  prevArrowStyles?: React.CSSProperties;
  prevArrowClassName?: string;
  nextArrowStyles?: React.CSSProperties;
  nextArrowClassName?: string;
  renderArrows?: (args: ArrowRenderArgs & { dir: 'prev' | 'next' }) => React.ReactNode;
  renderPrevArrow?: (args: ArrowRenderArgs) => React.ReactNode;
  renderNextArrow?: (args: ArrowRenderArgs) => React.ReactNode;
  thumbnailCrossfade?: ThumbnailCrossfadeOptions;
};
