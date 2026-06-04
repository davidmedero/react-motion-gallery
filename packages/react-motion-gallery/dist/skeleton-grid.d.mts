import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { a as SkeletonLength, b as SkeletonShimmer } from './layout-BOy4geKv.mjs';
export { S as SkeletonNode } from './layout-BOy4geKv.mjs';
import { n as GridSkeletonLayoutNode, k as ResponsiveGridTemplate, R as ResponsiveGridSpan, l as GridSkeletonSpec } from './types-BmnPcuoM.mjs';
export { o as GridSkeletonNode, p as GridSkeletonSlot } from './types-BmnPcuoM.mjs';
import { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
import './text-BBcRGVzn.mjs';
import './force-C5m1QpdF.mjs';
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
