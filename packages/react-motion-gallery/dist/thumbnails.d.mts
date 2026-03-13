import * as React from 'react';
import { S as SliderIndexChannel } from './sliderSub-DDPjywVp.mjs';
import { a as BreakpointMap } from './responsive-CvE5dTnP.mjs';
import { a as ThumbnailsOptions } from './types-Bi2iBbyG.mjs';
export { R as ResponsivePosition, e as ThumbnailContainerLayout, c as ThumbnailIntroOptions, d as ThumbnailLayout, b as ThumbnailLoadingOptions, T as ThumbnailPosition, k as ThumbnailsControls, g as ThumbnailsElements, f as ThumbnailsLayout, i as ThumbnailsMotion, j as ThumbnailsRipple, h as ThumbnailsScroll, l as ThumbnailsTransitions } from './types-Bi2iBbyG.mjs';
import { I as IndexMode } from './types-tb9Qf2Mj.mjs';
import './elements-Bd1vm4Uk.mjs';

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
