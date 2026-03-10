import * as React from 'react';
import { a as BreakpointMap } from './responsive-CvE5dTnP.mjs';
import { T as ThumbnailPosition } from './types-Bi2iBbyG.mjs';

type JumpMode = 'instant' | 'animated';
type FSRequest = {
    type: 'requestSet';
    index: number;
    mode?: JumpMode;
} | {
    type: 'requestNext';
} | {
    type: 'requestPrev';
} | {
    type: 'center';
};
type FSEvent = {
    type: 'internalIndex';
    index: number;
} | {
    type: 'mounted';
} | {
    type: 'unmounted';
};
type FullscreenSliderSub = {
    get: () => number;
    requestSet: (index: number, mode?: JumpMode) => void;
    requestPrev: () => void;
    requestNext: () => void;
    requestCenter: () => void;
    onEvent: (fn: (evt: FSEvent) => void) => () => void;
    onRequest: (fn: (req: FSRequest) => void) => () => void;
    setLocalIndex: (index: number) => void;
    destroy: () => void;
    onBasePointerDown: (fn: () => void) => () => void;
    emitBasePointerDown: () => void;
};

type ArrowRenderArgs = {
    ref: React.RefObject<HTMLDivElement | null>;
    onClick: () => void;
    hidden: boolean;
    disabled: boolean;
    createRipple: (el: HTMLElement) => void;
    className?: string;
};
type FSItem = {
    thumbSrc: string;
    alt?: string;
};
type FullscreenThumbnailSlotLayout = {
    position: ThumbnailPosition;
    className?: string;
    style?: React.CSSProperties;
    fadeDurationMs?: number;
    fadeEasing?: string;
};
type FullscreenThumbnailBridge = {
    mountEl: HTMLDivElement | null;
    fsSub: FullscreenSliderSub;
    visible: boolean;
    invisible: boolean;
    direction: 'ltr' | 'rtl';
    registerLayout: (layout: FullscreenThumbnailSlotLayout) => void;
    clearLayout: () => void;
};
type FullscreenThumbnailSliderProps = {
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
    renderArrows?: (args: ArrowRenderArgs & {
        dir: 'prev' | 'next';
    }) => React.ReactNode;
    renderPrevArrow?: (args: ArrowRenderArgs) => React.ReactNode;
    renderNextArrow?: (args: ArrowRenderArgs) => React.ReactNode;
};

export type { FSItem as F, FullscreenThumbnailBridge as a, FullscreenThumbnailSliderProps as b, FullscreenThumbnailSlotLayout as c };
