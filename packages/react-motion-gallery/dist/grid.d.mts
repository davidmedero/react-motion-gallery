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
type SkeletonBaseStyle = {
    width?: SkeletonLength;
    maxWidth?: SkeletonLength;
    height?: SkeletonLength;
    maxHeight?: SkeletonLength;
    backgroundColor?: string;
    borderRadius?: SkeletonLength;
    marginTop?: SkeletonLength;
    marginRight?: SkeletonLength;
    marginBottom?: SkeletonLength;
    marginLeft?: SkeletonLength;
    alignSelf?: React$1.CSSProperties["alignSelf"];
    aspectRatio?: SkeletonLength;
};
type SkeletonContainerStyle = {
    gap?: SkeletonLength;
    padding?: SkeletonLength;
    align?: React$1.CSSProperties["alignItems"];
    justify?: React$1.CSSProperties["justifyContent"];
    wrap?: boolean;
    width?: SkeletonLength;
    maxWidth?: SkeletonLength;
};
type SkeletonContainerStyleResponsive = SkeletonContainerStyle | Record<string, SkeletonContainerStyle>;
type GridSkeletonNode = {
    kind: "grid";
    style?: SkeletonContainerStyleResponsive;
    count?: number;
    item: SkeletonNode;
    itemWrapStyle?: SkeletonBaseStyle;
} | SkeletonNode;
type SkeletonNode = {
    kind: "stack" | "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    children: SkeletonNode[];
} | {
    kind: "rect" | "square" | "circle";
    style?: SkeletonBaseStyle;
    shimmer?: SkeletonShimmer;
} | {
    kind: "media";
    count: number;
    direction?: "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    tile?: {
        shape?: "rect" | "square" | "circle";
        style?: SkeletonBaseStyle;
        shimmer?: SkeletonShimmer;
    };
} | {
    kind: "text";
    fontSize: number;
    lineHeight: number;
    lines?: number;
    style?: SkeletonBaseStyle;
    shimmer?: SkeletonShimmer;
};
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
type FullscreenTrigger = 'item' | 'media';
type GridLazyLoadOptions = GalleryLazyLoadOptions;
type GridOptions = {
    columns?: ResponsiveNumber;
    minColumnWidth?: number | string;
    gap?: ResponsiveNumber;
    rootClassName?: string;
    itemClassName?: string;
    fullscreenTrigger?: FullscreenTrigger;
    lazyLoad?: GridLazyLoadOptions;
    loading?: LoadingOptions;
    intro?: IntroOptions;
};

type Props = GridOptions & {
    children?: React$1.ReactNode;
    breakpoints?: BreakpointMap;
    gridItemBaseClass?: string;
    renderMode?: "wrap" | "passthrough";
};
declare function GridLayoutRuntime(props: Props): react_jsx_runtime.JSX.Element;

declare const DEFAULT_GRID: Required<Pick<GridOptions, "minColumnWidth" | "gap">>;

export { DEFAULT_GRID, GridLayoutRuntime as Grid, type GridLazyLoadOptions, type GridOptions, GridLayoutRuntime as default };
