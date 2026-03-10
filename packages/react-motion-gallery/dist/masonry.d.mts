import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React$1 from 'react';
import { R as ResponsiveNumber, a as BreakpointMap } from './responsive-CvE5dTnP.mjs';
import { G as GalleryLazyLoadOptions } from './lazy-dGoYpcRa.mjs';

type SkeletonLength = number | string;
type SkeletonShimmer = {
    enabled?: boolean;
    durationMs?: number;
    angleDeg?: number;
    opacity?: number;
    blurPx?: number;
    timing?: string;
    c1?: string;
    c2?: string;
    c3?: string;
};
type MasonrySkeletonSpec = {
    className?: string;
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
};
type IntroOptions = {
    renderIntro?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    transform?: string;
    durationMs?: number;
    easing?: string;
    staggerLimit?: number;
};
type MasonryLazyLoadOptions = GalleryLazyLoadOptions;
type MasonryOptions = {
    columns?: ResponsiveNumber;
    gap?: ResponsiveNumber;
    placement?: "balanced" | "roundRobin";
    estimatedItemHeight?: number;
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

type Props = MasonryOptions & {
    children?: React$1.ReactNode;
    breakpoints?: BreakpointMap;
};
declare function Masonry(props: Props): react_jsx_runtime.JSX.Element;

declare const DEFAULT_MASONRY: Required<Pick<MasonryOptions, "placement">>;

export { DEFAULT_MASONRY, Masonry, type MasonryLazyLoadOptions, type MasonryOptions, Masonry as default };
