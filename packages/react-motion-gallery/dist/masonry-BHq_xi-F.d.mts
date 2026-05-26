import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { R as ResponsiveMasonrySpan, M as MasonryPlacement } from './placement-BWKxkHD8.mjs';

type SkeletonLength = number | string;
type SkeletonShimmer = {
    durationMs?: number;
    angleDeg?: number;
    opacity?: number;
    blurPx?: number;
    timing?: string;
    c1?: string;
    c2?: string;
    c3?: string;
};
type MasonrySkeletonItem = {
    width: number;
    height: number;
    span?: ResponsiveMasonrySpan;
};
type SkeletonMasonryOptions = {
    count?: number;
    items?: ReadonlyArray<MasonrySkeletonItem>;
    columns?: ResponsiveNumber;
    gap?: ResponsiveNumber;
    ratios?: number[];
    heightsPx?: number[];
    spans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
    placement?: MasonryPlacement;
    viewportWidth?: number;
    layoutWidthPx?: number;
};
type MasonrySkeletonProps = SkeletonMasonryOptions & {
    masonry?: SkeletonMasonryOptions;
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
    className?: string;
    style?: React.CSSProperties;
    shellClassName?: string;
    shellStyle?: React.CSSProperties;
    contentClassName?: string;
    contentStyle?: React.CSSProperties;
    backgroundColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
    disableShimmer?: boolean;
    ariaLabel?: string;
    ready?: boolean;
    enabled?: boolean;
    timing?: MasonrySkeletonTimingOptions;
};
type SkeletonMasonryLayout = {
    kind: "masonry";
    count?: number;
    items?: ReadonlyArray<MasonrySkeletonItem>;
    columns?: ResponsiveNumber;
    gap?: ResponsiveNumber;
    ratios?: number[];
    heightsPx?: number[];
    spans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
    placement?: MasonryPlacement;
    viewportWidth?: number;
    layoutWidthPx?: number;
};
type MasonrySkeletonSlot = MasonrySkeletonItem;
type MasonrySkeletonNode = SkeletonMasonryLayout;
type MasonrySkeletonSpec = SkeletonMasonryOptions;
type SkeletonNode = MasonrySkeletonItem;
type MasonrySkeletonTimingOptions = {
    exitMs?: number;
    minVisibleMs?: number;
};
declare function MasonrySkeleton({ masonry, children, breakpoints, className, style, shellClassName, shellStyle, contentClassName, contentStyle, backgroundColor, radius, shimmer, disableShimmer, ariaLabel, ready, enabled, timing, ...options }: MasonrySkeletonProps): react_jsx_runtime.JSX.Element;

export { MasonrySkeleton as M, type SkeletonNode as S, type MasonrySkeletonNode as a, type MasonrySkeletonProps as b, type MasonrySkeletonSlot as c, type MasonrySkeletonSpec as d, type SkeletonMasonryLayout as e, type SkeletonMasonryOptions as f };
