import * as React from 'react';
import { q as SliderIndexChannel, I as IndexMode } from './types-CfvTYIyd.mjs';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { f as ThumbnailsOptions, h as ThumbnailSelectMeta } from './types-DP7ogmr4.mjs';
export { R as ResponsivePosition, j as ThumbnailContainerLayout, e as ThumbnailIntroOptions, i as ThumbnailLayout, a as ThumbnailLoadingElements, c as ThumbnailLoadingOptions, b as ThumbnailLoadingRenderArgs, T as ThumbnailPosition, d as ThumbnailSkeletonMode, p as ThumbnailsControls, l as ThumbnailsElements, k as ThumbnailsLayout, n as ThumbnailsMotion, o as ThumbnailsRipple, m as ThumbnailsScroll, q as ThumbnailsTransitions } from './types-DP7ogmr4.mjs';
import './force-C5m1QpdF.mjs';
import './media.mjs';
import './transitions-DU3ftmIq.mjs';

type Props = {
    options?: ThumbnailsOptions;
    children?: React.ReactNode;
    indexChannel?: SliderIndexChannel;
    breakpoints?: BreakpointMap;
    onThumbnailClick?: (index: number, meta?: ThumbnailSelectMeta) => void;
    onReadyChange?: (ready: boolean) => void;
    direction?: "ltr" | "rtl";
};
declare const ThumbnailSlider: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>>;

type SliderIndexEventMeta = {
    source?: "thumbnail" | "external";
    transition?: "scroll" | "crossfade";
    crossfade?: {
        durationMs?: number;
        easing?: string;
    };
};
type SliderIndexEvent = {
    type: "set";
    index: number;
    mode: IndexMode;
    meta?: SliderIndexEventMeta;
} | {
    type: "bump";
    delta: number;
    mode: IndexMode;
    meta?: SliderIndexEventMeta;
};
type SliderIndexChannelLike = {
    get: () => {
        index: number;
        mode: IndexMode;
    };
    set: (index: number, mode?: IndexMode, opts?: {
        silent?: boolean;
        meta?: SliderIndexEventMeta;
    }) => void;
    bump: (delta: number, mode?: IndexMode, opts?: {
        silent?: boolean;
        meta?: SliderIndexEventMeta;
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
    publishThumbnailClick: (index: number, mode?: IndexMode, meta?: SliderIndexEventMeta) => void;
};
declare function createThumbnailSyncBridge(args: CreateThumbnailSyncBridgeArgs): ThumbnailSyncBridge;

export { ThumbnailSlider, type ThumbnailSyncBridge, ThumbnailsOptions, createThumbnailSyncBridge, ThumbnailSlider as default };
