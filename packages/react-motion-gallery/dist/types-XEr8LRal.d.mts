import { L as LoadingTimingOptions, R as ResponsiveNumber } from './responsive-D_xhZmVI.mjs';
import { S as SkeletonLayoutRoot, a as SkeletonNode$1, b as SkeletonWrapStyle, c as SkeletonLength, d as SkeletonShimmer, G as GalleryLazyLoadOptions } from './layout-CR6f2aPH.mjs';

type GridSkeletonWrapStyle = SkeletonWrapStyle;
type SkeletonNode = SkeletonNode$1;
type GridSkeletonSlot = {
    item?: SkeletonNode;
    itemWrapStyle?: GridSkeletonWrapStyle;
};
type GridSkeletonLayoutNode = SkeletonLayoutRoot<"grid"> & {
    slots?: GridSkeletonSlot[];
};
type GridSkeletonNode = GridSkeletonLayoutNode | SkeletonNode$1;
type GridSkeletonSpec = {
    className?: string;
    layout?: GridSkeletonNode;
    backgroundColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
};

type LoadingOptions = {
    enabled?: boolean;
    force?: boolean;
    renderLoading?: (args: {
        count: number;
    }) => React.ReactNode;
    skeleton?: GridSkeletonSpec;
    timing?: LoadingTimingOptions;
};
type IntroOptions = {
    renderIntro?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
    staggerLimit?: number;
};
type FullscreenTrigger = 'item' | 'media';
type GridLazyLoadOptions = GalleryLazyLoadOptions;
type GridSpan = number | "full";
type ResponsiveGridSpan = GridSpan | Record<string, GridSpan>;
type ResponsiveGridTemplate = string | Record<string, string>;
type GridItemProps = {
    span?: ResponsiveGridSpan;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
};
type GridOptions = {
    columns?: ResponsiveNumber;
    templateColumns?: ResponsiveGridTemplate;
    minColumnWidth?: number | string;
    gap?: ResponsiveNumber;
    rootClassName?: string;
    itemClassName?: string;
    fullscreenTrigger?: FullscreenTrigger;
    lazyLoad?: GridLazyLoadOptions;
    loading?: LoadingOptions;
    intro?: IntroOptions;
};

export type { GridItemProps as G, IntroOptions as I, LoadingOptions as L, ResponsiveGridSpan as R, GridLazyLoadOptions as a, GridOptions as b, GridSpan as c, ResponsiveGridTemplate as d };
