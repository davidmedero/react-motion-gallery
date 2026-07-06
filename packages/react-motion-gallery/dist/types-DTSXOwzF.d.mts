import * as React from 'react';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { E as ElementStyle, A as ArrowRenderArgs, k as SliderVirtualizationOptions } from './types-CGPPAn9i.mjs';
import { L as LoadingTimingOptions } from './transitions-ChhEdSB6.mjs';

type ThumbnailPosition = "top" | "right" | "bottom" | "left";
type ResponsivePosition = ThumbnailPosition | Array<ThumbnailPosition> | Record<string, ThumbnailPosition>;
type ThumbnailLoadingElements = {
    container?: ElementStyle;
    row?: ElementStyle;
    thumbnail?: ElementStyle;
};
type ThumbnailSkeletonMode = "fit" | "peek";
type ThumbnailLoadingRenderArgs = {
    count: number;
};
type ThumbnailLoadingOptions = {
    enabled?: boolean;
    force?: LoadingForceOptions;
    skeletonCount?: ResponsiveNumber;
    mode?: ThumbnailSkeletonMode;
    renderLoading?: (args: ThumbnailLoadingRenderArgs) => React.ReactNode;
    elements?: ThumbnailLoadingElements;
    timing?: LoadingTimingOptions;
};
type ThumbnailRevealOptions = {
    renderReveal?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, inner: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
};
type ThumbnailLayout = {
    width?: number | string;
    height?: number | string;
};
type ThumbnailContainerLayout = {
    width?: number | string;
    height?: number | string;
};
type ThumbnailsLayout = {
    position?: ResponsivePosition;
    gap?: number;
    center?: boolean;
    thumbnail?: ThumbnailLayout;
    container?: ThumbnailContainerLayout;
};
type ThumbnailsElements = {
    container?: ElementStyle;
    thumbnail?: ElementStyle;
};
type ThumbnailFadeOnSyncOptions = {
    enabled?: boolean;
    minDistance?: number;
    durationMs?: number;
    easing?: string;
};
type ThumbnailsScroll = {
    freeScroll?: boolean;
    groupCells?: boolean;
    loop?: boolean;
    skipSnaps?: boolean;
    centerActiveThumb?: boolean;
    fadeOnSync?: boolean | ThumbnailFadeOnSyncOptions;
};
type ThumbnailsMotion = {
    selectDuration?: number;
    freeScrollDuration?: number;
    friction?: number;
};
type ThumbnailsRipple = {
    enabled?: boolean;
    className?: string;
};
type ThumbnailsControls = {
    enabled?: boolean;
    arrow?: ElementStyle;
    prev?: ElementStyle;
    next?: ElementStyle;
    render?: (args: ArrowRenderArgs & {
        dir: "prev" | "next";
    }) => React.ReactNode;
    renderPrev?: (args: ArrowRenderArgs) => React.ReactNode;
    renderNext?: (args: ArrowRenderArgs) => React.ReactNode;
    ripple?: ThumbnailsRipple;
};
type ThumbnailCrossfadeOptions = {
    enabled?: boolean;
    minDistance?: number;
    durationMs?: number;
    easing?: string;
};
type ThumbnailSelectMeta = {
    transition: "scroll" | "crossfade";
    crossfade?: ThumbnailCrossfadeOptions;
};
type ThumbnailsTransitions = {
    loading?: ThumbnailLoadingOptions;
    crossfade?: ThumbnailCrossfadeOptions;
};
type ThumbnailRenderItemArgs<T = unknown> = {
    item: T;
    index: number;
    active: boolean;
    virtualIndex?: number;
};
type ThumbnailRenderItem<T = unknown> = (args: ThumbnailRenderItemArgs<T>) => React.ReactNode;
type ThumbnailItemKey<T = unknown> = (item: T, index: number) => React.Key;
type ThumbnailsOptions<T = unknown> = {
    children?: React.ReactNode;
    items?: readonly T[];
    renderItem?: ThumbnailRenderItem<T>;
    getItemKey?: ThumbnailItemKey<T>;
    layout?: ThumbnailsLayout;
    elements?: ThumbnailsElements;
    scroll?: ThumbnailsScroll;
    controls?: ThumbnailsControls;
    motion?: ThumbnailsMotion;
    virtualization?: SliderVirtualizationOptions;
    reveal?: ThumbnailRevealOptions;
    transitions?: ThumbnailsTransitions;
    breakpointMap?: BreakpointMap;
};

export type { ResponsivePosition as R, ThumbnailPosition as T, ThumbnailLoadingElements as a, ThumbnailLoadingRenderArgs as b, ThumbnailLoadingOptions as c, ThumbnailSkeletonMode as d, ThumbnailFadeOnSyncOptions as e, ThumbnailRevealOptions as f, ThumbnailRenderItemArgs as g, ThumbnailRenderItem as h, ThumbnailItemKey as i, ThumbnailsOptions as j, ThumbnailCrossfadeOptions as k, ThumbnailSelectMeta as l, ThumbnailLayout as m, ThumbnailContainerLayout as n, ThumbnailsLayout as o, ThumbnailsElements as p, ThumbnailsScroll as q, ThumbnailsMotion as r, ThumbnailsRipple as s, ThumbnailsControls as t, ThumbnailsTransitions as u };
