import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { k as SliderHandle } from './types-D9WBOrx6.mjs';
import { SkeletonCacheOptions, SkeletonCacheSnapshot } from './skeleton-cache.mjs';
import { e as SkeletonLength$1, f as SkeletonShimmer$1 } from './layout-BSjd7pwQ.mjs';
import { R as ResponsiveTextBarHeight, a as ResponsiveTextBarWidth, b as ResponsiveTextLineHeight, c as ResponsiveTextLineCount, d as ResponsiveTextLastBarWidth, T as TextSkeletonResponsiveBy } from './text-BBcRGVzn.mjs';
import { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
import './force-C5m1QpdF.mjs';
import './media.mjs';
import './transitions-DU3ftmIq.mjs';

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
    overflow?: React.CSSProperties["overflow"];
    margin?: SkeletonLength;
    marginTop?: SkeletonLength;
    marginRight?: SkeletonLength;
    marginBottom?: SkeletonLength;
    marginLeft?: SkeletonLength;
    alignSelf?: React.CSSProperties["alignSelf"];
    aspectRatio?: SkeletonLength;
    scale?: number;
};
type SkeletonBaseStyleResponsive = SkeletonBaseStyle | Record<string, SkeletonBaseStyle>;
type SliderSkeletonWrapStyle = SkeletonBaseStyle & {
    border?: React.CSSProperties["border"];
    boxShadow?: React.CSSProperties["boxShadow"];
};
type SkeletonContainerStyle = {
    position?: React.CSSProperties["position"];
    inset?: SkeletonLength;
    insetBlock?: SkeletonLength;
    insetInline?: SkeletonLength;
    top?: SkeletonLength;
    right?: SkeletonLength;
    bottom?: SkeletonLength;
    left?: SkeletonLength;
    zIndex?: React.CSSProperties["zIndex"];
    gap?: SkeletonLength;
    padding?: SkeletonLength;
    align?: React.CSSProperties["alignItems"];
    justify?: React.CSSProperties["justifyContent"];
    wrap?: boolean;
    width?: SkeletonLength;
    maxWidth?: SkeletonLength;
    height?: SkeletonLength;
    minHeight?: SkeletonLength;
    maxHeight?: SkeletonLength;
    backgroundColor?: string;
    borderRadius?: SkeletonLength;
    border?: React.CSSProperties["border"];
    boxShadow?: React.CSSProperties["boxShadow"];
    margin?: SkeletonLength;
    marginTop?: SkeletonLength;
    marginRight?: SkeletonLength;
    marginBottom?: SkeletonLength;
    marginLeft?: SkeletonLength;
    flex?: React.CSSProperties["flex"];
    flexGrow?: React.CSSProperties["flexGrow"];
    flexShrink?: React.CSSProperties["flexShrink"];
    flexBasis?: SkeletonLength;
    order?: React.CSSProperties["order"];
    alignSelf?: React.CSSProperties["alignSelf"];
    overflow?: React.CSSProperties["overflow"];
    transform?: React.CSSProperties["transform"];
    pointerEvents?: React.CSSProperties["pointerEvents"];
    opacity?: React.CSSProperties["opacity"];
};
type SkeletonContainerStyleResponsive = SkeletonContainerStyle | Record<string, SkeletonContainerStyle>;
type SliderSkeletonSlot = {
    item?: SkeletonNode;
    itemWrapStyle?: SliderSkeletonWrapStyle;
};
type SliderSkeletonSliderNode = {
    kind: "slider";
    style?: SkeletonContainerStyleResponsive;
    count?: number;
    item: SkeletonNode;
    itemWrapStyle?: SliderSkeletonWrapStyle;
    itemStretch?: boolean;
    initialHeightSlot?: number;
    rowHeightCompensation?: ResponsiveNumber;
    slots?: SliderSkeletonSlot[];
    direction?: "row" | "col";
    children?: SkeletonNode[];
    overlays?: SkeletonNode[];
};
type SliderSkeletonNode = SliderSkeletonSliderNode | SkeletonNode;
type SkeletonNode = {
    kind: "stack" | "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    children: SkeletonNode[];
} | {
    kind: "rect" | "square" | "circle";
    style?: SkeletonBaseStyleResponsive;
    shimmer?: SkeletonShimmer;
} | {
    kind: "media";
    count: number;
    direction?: "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    tile?: {
        shape?: "rect" | "square" | "circle";
        style?: SkeletonBaseStyleResponsive;
        shimmer?: SkeletonShimmer;
    };
} | {
    kind: "sliderDots";
    count: number;
    style?: SkeletonContainerStyleResponsive;
    dotStyle?: SkeletonBaseStyleResponsive;
    activeStyle?: SkeletonBaseStyleResponsive;
    inactiveStyle?: SkeletonBaseStyleResponsive;
    shimmer?: SkeletonShimmer;
} | {
    kind: "text";
    textId?: string;
    barHeight: ResponsiveTextBarHeight;
    barWidth?: ResponsiveTextBarWidth;
    lineHeight: ResponsiveTextLineHeight;
    lines?: ResponsiveTextLineCount;
    lastBarWidth?: ResponsiveTextLastBarWidth;
    responsiveBy?: TextSkeletonResponsiveBy;
    style?: SkeletonBaseStyleResponsive;
    shimmer?: SkeletonShimmer;
};
type SliderSkeletonSpec = {
    mode?: "fit" | "peek";
    centering?: "first";
    visibleCount?: ResponsiveNumber;
    className?: string;
    style?: React.CSSProperties;
    layout?: SliderSkeletonNode;
    backgroundColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
};

type SkeletonSliderLayout = SliderSkeletonSliderNode & {
    mode?: SliderSkeletonSpec["mode"];
    centering?: SliderSkeletonSpec["centering"];
    className?: string;
    visibleCount?: ResponsiveNumber;
    backgroundColor?: string;
    radius?: SkeletonLength;
    shimmer?: SliderSkeletonSpec["shimmer"];
};
type SkeletonSliderReadyHandle = {
    handleRef: React.RefObject<SliderHandle | null>;
};
type SkeletonSliderRestoreOptions = {
    kind: "slider";
    enabled?: boolean;
    key?: string;
    ttlMs?: number;
    slider?: SkeletonSliderReadyHandle;
    itemCount: number;
    visibleCount?: ResponsiveNumber;
    loop?: boolean;
    activeSlotOffset?: number;
};
type SliderSkeletonProps = {
    layout: SkeletonSliderLayout | SliderSkeletonSpec;
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
    className?: string;
    style?: React.CSSProperties;
    shellClassName?: string;
    shellStyle?: React.CSSProperties;
    contentClassName?: string;
    contentStyle?: React.CSSProperties;
    backgroundColor?: string;
    radius?: SkeletonLength$1;
    shimmer?: SkeletonShimmer$1;
    disableShimmer?: boolean;
    ariaLabel?: string;
    ready?: boolean;
    enabled?: boolean;
    force?: SkeletonForceOptions;
    timing?: SkeletonTimingOptions;
    restore?: SkeletonSliderRestoreOptions;
    cache?: SkeletonCacheOptions;
};
declare function buildScopedInitialHeightCss(args: {
    scopeId: string;
    skeletonSpec: SliderSkeletonSpec;
    responsiveCount: ResponsiveNumber | undefined;
    fallbackCount: number;
    breakpointMap: BreakpointMap;
    centerFirstSpacer?: boolean;
    cacheSnapshot?: SkeletonCacheSnapshot | null;
}): string;
declare function SliderSkeleton({ layout, children, breakpoints, className, style, shellClassName, shellStyle, contentClassName, contentStyle, backgroundColor, radius, shimmer, disableShimmer, ariaLabel, ready, enabled, force, timing, restore, cache, }: SliderSkeletonProps): react_jsx_runtime.JSX.Element | null;

export { SliderSkeleton as RestoredSliderSkeleton, type SliderSkeletonProps as RestoredSliderSkeletonProps, SliderSkeleton as Skeleton, SkeletonCacheOptions, SkeletonCacheSnapshot, type SkeletonNode, type SkeletonSliderLayout, type SkeletonSliderReadyHandle, type SkeletonSliderRestoreOptions, SliderSkeleton, type SliderSkeletonNode, type SliderSkeletonSlot, type SliderSkeletonSpec, buildScopedInitialHeightCss, SliderSkeleton as default };
