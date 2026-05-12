import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { a as SkeletonLength, b as SkeletonShimmer } from './layout-DoYnPD0I.mjs';
export { S as SkeletonNode } from './layout-DoYnPD0I.mjs';
import { e as ResponsiveGridTemplate, R as ResponsiveGridSpan } from './types-BlFwyRVQ.mjs';
import { c as GridSkeletonLayoutNode, b as GridSkeletonSpec } from './GridSkeleton-Dn7N-TEh.mjs';
export { G as GridSkeletonNode, a as GridSkeletonSlot } from './GridSkeleton-Dn7N-TEh.mjs';
import { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
import './text-BBcRGVzn.mjs';
import './lazy-dGoYpcRa.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-DU3ftmIq.mjs';

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
declare function GridSkeleton({ layout, children, breakpoints, className, style, shellClassName, shellStyle, contentClassName, contentStyle, backgroundColor, radius, shimmer, disableShimmer, ariaLabel, ready, enabled, force, timing, grid, }: GridSkeletonProps): react_jsx_runtime.JSX.Element | null;

export { GridSkeleton, type GridSkeletonProps, GridSkeletonSpec, GridSkeleton as Skeleton, SkeletonForceOptions, type SkeletonGridLayout, type SkeletonGridOptions, SkeletonTimingOptions, GridSkeleton as default };
