import * as React from 'react';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { E as ElementStyle, A as ArrowRenderArgs } from './types-BiXSaEk7.mjs';
import { L as LoadingTimingOptions } from './transitions-DU3ftmIq.mjs';

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
type ThumbnailIntroOptions = {
    renderIntro?: (args: {
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
type ThumbnailsScroll = {
    freeScroll?: boolean;
    groupCells?: boolean;
    loop?: boolean;
    skipSnaps?: boolean;
    centerActiveThumb?: boolean;
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
    durationMs?: number;
    easing?: string;
};
type ThumbnailSelectMeta = {
    transition: "scroll" | "crossfade";
    crossfade?: ThumbnailCrossfadeOptions;
};
type ThumbnailsTransitions = {
    loading?: ThumbnailLoadingOptions;
    intro?: ThumbnailIntroOptions;
    crossfade?: ThumbnailCrossfadeOptions;
};
type ThumbnailsOptions = {
    children?: React.ReactNode;
    layout?: ThumbnailsLayout;
    elements?: ThumbnailsElements;
    scroll?: ThumbnailsScroll;
    controls?: ThumbnailsControls;
    motion?: ThumbnailsMotion;
    transitions?: ThumbnailsTransitions;
    breakpointMap?: BreakpointMap;
};

export type { ResponsivePosition as R, ThumbnailPosition as T, ThumbnailLoadingElements as a, ThumbnailLoadingRenderArgs as b, ThumbnailLoadingOptions as c, ThumbnailSkeletonMode as d, ThumbnailIntroOptions as e, ThumbnailsOptions as f, ThumbnailCrossfadeOptions as g, ThumbnailSelectMeta as h, ThumbnailLayout as i, ThumbnailContainerLayout as j, ThumbnailsLayout as k, ThumbnailsElements as l, ThumbnailsScroll as m, ThumbnailsMotion as n, ThumbnailsRipple as o, ThumbnailsControls as p, ThumbnailsTransitions as q };
