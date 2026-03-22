import * as React from 'react';
import { S as SliderIndexChannel } from './sliderSub-DDPjywVp.mjs';
import { a as BreakpointMap } from './responsive-CvE5dTnP.mjs';
import { f as ThumbnailsOptions } from './types-9g3BgMxk.mjs';
export { R as ResponsivePosition, h as ThumbnailContainerLayout, e as ThumbnailIntroOptions, g as ThumbnailLayout, a as ThumbnailLoadingElements, c as ThumbnailLoadingOptions, b as ThumbnailLoadingRenderArgs, T as ThumbnailPosition, d as ThumbnailSkeletonMode, n as ThumbnailsControls, j as ThumbnailsElements, i as ThumbnailsLayout, l as ThumbnailsMotion, m as ThumbnailsRipple, k as ThumbnailsScroll, o as ThumbnailsTransitions } from './types-9g3BgMxk.mjs';
import { I as IndexMode } from './types-tb9Qf2Mj.mjs';
import './elements-24CTbRWj.mjs';

type Props = {
    options?: ThumbnailsOptions;
    children?: React.ReactNode;
    indexChannel?: SliderIndexChannel;
    breakpoints?: BreakpointMap;
    onThumbnailClick?: (index: number) => void;
    onReadyChange?: (ready: boolean) => void;
    direction?: "ltr" | "rtl";
};
declare const ThumbnailSlider: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>>;

type SliderIndexEvent = {
    type: "set";
    index: number;
    mode: IndexMode;
} | {
    type: "bump";
    delta: number;
    mode: IndexMode;
};
type SliderIndexChannelLike = {
    get: () => {
        index: number;
        mode: IndexMode;
    };
    set: (index: number, mode?: IndexMode, opts?: {
        silent?: boolean;
    }) => void;
    bump: (delta: number, mode?: IndexMode, opts?: {
        silent?: boolean;
    }) => void;
    onEvent?: (fn: (event: SliderIndexEvent) => void) => () => void;
    subscribe?: (fn: () => void) => () => void;
    onBasePointerDown?: (fn: () => void) => () => void;
    emitBasePointerDown?: () => void;
};
type CreateThumbnailSyncBridgeArgs = {
    localChannel: SliderIndexChannelLike;
    externalChannel?: SliderIndexChannelLike | null;
    clampIndex?: (index: number) => number;
};
type ThumbnailSyncBridge = {
    start: () => () => void;
    stop: () => void;
    publishThumbnailClick: (index: number, mode?: IndexMode) => void;
};
declare function createThumbnailSyncBridge(args: CreateThumbnailSyncBridgeArgs): ThumbnailSyncBridge;

declare const DEFAULT_THUMBNAILS: Required<Pick<ThumbnailsOptions, "layout" | "scroll" | "motion">>;

export { DEFAULT_THUMBNAILS, ThumbnailSlider, type ThumbnailSyncBridge, ThumbnailsOptions, createThumbnailSyncBridge, ThumbnailSlider as default };
