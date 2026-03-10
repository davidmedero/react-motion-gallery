import * as React from 'react';
import { R as ResponsiveNumber, a as BreakpointMap } from './responsive-CvE5dTnP.mjs';
import { E as ElementStyle, A as ArrowRenderArgs } from './elements-Bd1vm4Uk.mjs';

type ThumbnailPosition = "top" | "right" | "bottom" | "left";
type ResponsivePosition = ThumbnailPosition | Array<ThumbnailPosition> | Record<string, ThumbnailPosition>;
type ThumbnailLoadingOptions = {
    enabled?: boolean;
    force?: boolean;
    skeletonCount?: ResponsiveNumber;
    renderLoading?: () => React.ReactNode;
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

export type { ResponsivePosition as R, ThumbnailPosition as T, ThumbnailsOptions as a, ThumbnailLoadingOptions as b, ThumbnailIntroOptions as c, ThumbnailLayout as d, ThumbnailContainerLayout as e, ThumbnailsLayout as f, ThumbnailsElements as g, ThumbnailsScroll as h, ThumbnailsMotion as i, ThumbnailsRipple as j, ThumbnailsControls as k, ThumbnailsTransitions as l };
