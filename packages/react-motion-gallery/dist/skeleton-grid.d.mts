import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { e as SkeletonLength, f as SkeletonShimmer } from './layout-BSjd7pwQ.mjs';
export { S as SkeletonNode } from './layout-BSjd7pwQ.mjs';
import { p as GridSkeletonLayoutNode, k as ResponsiveGridTemplate, R as ResponsiveGridSpan, n as GridSkeletonSpec } from './types-DcUQOXvS.mjs';
export { l as GridSkeletonNode, m as GridSkeletonSlot } from './types-DcUQOXvS.mjs';
import { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
import './text-BBcRGVzn.mjs';
import './force-C5m1QpdF.mjs';
import './skeleton-cache.mjs';
import './transitions-ChhEdSB6.mjs';

type SkeletonGridOptions = {
    count?: number;
    style?: React.CSSProperties;
    columns?: ResponsiveNumber;
    templateColumns?: ResponsiveGridTemplate;
    minColumnWidth?: number | string;
    gap?: ResponsiveNumber;
    items?: Array<{
        id: string;
        span?: ResponsiveGridSpan;
    }>;
    allowItemSpans?: boolean;
};
type SkeletonGridLayout = GridSkeletonLayoutNode & {
    className?: string;
    backgroundColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
    gridStyle?: React.CSSProperties;
    columns?: ResponsiveNumber;
    templateColumns?: ResponsiveGridTemplate;
    minColumnWidth?: number | string;
    gap?: ResponsiveNumber;
    items?: SkeletonGridOptions["items"];
    allowItemSpans?: boolean;
};
type GridSkeletonProps = {
    layout: SkeletonGridLayout | GridSkeletonSpec;
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
    force?: SkeletonForceOptions;
    timing?: SkeletonTimingOptions;
    grid?: SkeletonGridOptions;
};
declare function GridSkeleton(props: GridSkeletonProps): react_jsx_runtime.JSX.Element;

export { GridSkeleton, type GridSkeletonProps, GridSkeletonSpec, GridSkeleton as Skeleton, SkeletonForceOptions, type SkeletonGridLayout, type SkeletonGridOptions, SkeletonTimingOptions, GridSkeleton as default };
