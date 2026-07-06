import * as React from 'react';
import { t as SliderIndexChannel, I as IndexMode } from './types-CGPPAn9i.mjs';
export { k as SliderVirtualizationOptions } from './types-CGPPAn9i.mjs';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { j as ThumbnailsOptions, l as ThumbnailSelectMeta } from './types-DTSXOwzF.mjs';
export { R as ResponsivePosition, n as ThumbnailContainerLayout, e as ThumbnailFadeOnSyncOptions, i as ThumbnailItemKey, m as ThumbnailLayout, a as ThumbnailLoadingElements, c as ThumbnailLoadingOptions, b as ThumbnailLoadingRenderArgs, T as ThumbnailPosition, h as ThumbnailRenderItem, g as ThumbnailRenderItemArgs, f as ThumbnailRevealOptions, d as ThumbnailSkeletonMode, t as ThumbnailsControls, p as ThumbnailsElements, o as ThumbnailsLayout, r as ThumbnailsMotion, s as ThumbnailsRipple, q as ThumbnailsScroll, u as ThumbnailsTransitions } from './types-DTSXOwzF.mjs';
import './force-C5m1QpdF.mjs';
import './media.mjs';
import './transitions-ChhEdSB6.mjs';

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
