import * as React from 'react';
import { R as ResponsiveNumber, a as BreakpointMap } from './responsive-CvE5dTnP.mjs';
import { E as ElementStyle, A as ArrowRenderArgs } from './elements-24CTbRWj.mjs';

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
    force?: boolean;
    skeletonCount?: ResponsiveNumber;
    mode?: ThumbnailSkeletonMode;
    renderLoading?: (args: ThumbnailLoadingRenderArgs) => React.ReactNode;
    elements?: ThumbnailLoadingElements;
};
type ThumbnailIntroOptions = {
    renderIntro?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, inner: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    transform?: string;
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
type ThumbnailsTransitions = {
    loading?: ThumbnailLoadingOptions;
    intro?: ThumbnailIntroOptions;
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

export type { ResponsivePosition as R, ThumbnailPosition as T, ThumbnailLoadingElements as a, ThumbnailLoadingRenderArgs as b, ThumbnailLoadingOptions as c, ThumbnailSkeletonMode as d, ThumbnailIntroOptions as e, ThumbnailsOptions as f, ThumbnailLayout as g, ThumbnailContainerLayout as h, ThumbnailsLayout as i, ThumbnailsElements as j, ThumbnailsScroll as k, ThumbnailsMotion as l, ThumbnailsRipple as m, ThumbnailsControls as n, ThumbnailsTransitions as o };
