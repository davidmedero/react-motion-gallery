import * as React from 'react';
import { ad as ThumbnailsOptions, r as SliderIndexChannel, aL as ThumbnailSelectMeta, I as IndexMode } from './responsive-DRmZH1Q2.mjs';
export { a7 as ResponsivePosition, aN as ThumbnailContainerLayout, aM as ThumbnailLayout, a8 as ThumbnailLoadingElements, aa as ThumbnailLoadingOptions, a9 as ThumbnailLoadingRenderArgs, a6 as ThumbnailPosition, ac as ThumbnailRevealOptions, ab as ThumbnailSkeletonMode, aT as ThumbnailsControls, aP as ThumbnailsElements, aO as ThumbnailsLayout, aR as ThumbnailsMotion, aS as ThumbnailsRipple, aQ as ThumbnailsScroll, aU as ThumbnailsTransitions } from './responsive-DRmZH1Q2.mjs';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-ChhEdSB6.mjs';
import './media.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import 'react-dom/client';

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
