import { L as LoadingTimingOptions, R as ResponsiveNumber } from './responsive-D_xhZmVI.mjs';
import { S as SkeletonLayoutRoot, a as SkeletonNode$1, b as SkeletonWrapStyle, c as SkeletonLength, d as SkeletonShimmer, G as GalleryLazyLoadOptions } from './layout-CR6f2aPH.mjs';

type MasonrySkeletonWrapStyle = SkeletonWrapStyle;
type SkeletonNode = SkeletonNode$1;
type MasonrySkeletonSlot = {
    item?: SkeletonNode;
    itemWrapStyle?: MasonrySkeletonWrapStyle;
    ratio?: number;
    heightPx?: number;
};
type MasonrySkeletonLayoutNode = SkeletonLayoutRoot<"masonry"> & {
    slots?: MasonrySkeletonSlot[];
};
type MasonrySkeletonNode = MasonrySkeletonLayoutNode | SkeletonNode$1;
type MasonrySkeletonSpec = {
    className?: string;
    layout?: MasonrySkeletonNode;
    ratios?: number[];
    heightsPx?: number[];
    backgroundColor?: string;
    highlightColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
};

type LoadingOptions = {
    enabled?: boolean;
    force?: boolean;
    renderLoading?: (args: {
        count: number;
    }) => React.ReactNode;
    skeleton?: MasonrySkeletonSpec;
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
type FullscreenTrigger = "item" | "media";
type MasonryLazyLoadOptions = GalleryLazyLoadOptions;
type MasonryOptions = {
    columns?: ResponsiveNumber;
    gap?: ResponsiveNumber;
    placement?: "balanced" | "roundRobin";
    fullscreenTrigger?: FullscreenTrigger;
    estimatedItemHeight?: number;
    itemWrapClassName?: string;
    itemWrapStyle?: React.CSSProperties;
    as?: React.ElementType;
    rootRef?: React.Ref<HTMLDivElement>;
    classNames?: {
        root?: string;
        column?: string;
        item?: string;
    };
    lazyLoad?: MasonryLazyLoadOptions;
    loading?: LoadingOptions;
    intro?: IntroOptions;
};

export type { IntroOptions as I, LoadingOptions as L, MasonryOptions as M, MasonryLazyLoadOptions as a };
