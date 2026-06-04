import * as React from 'react';
import { S as SkeletonNode } from './layout-BOy4geKv.mjs';
import { R as ResponsiveMasonrySpan, b as MasonryHeightOffsetPx } from './placement-DyqA2MX3.mjs';
import './text-BBcRGVzn.mjs';
import './responsiveNumber-CouEMJ9O.mjs';

type MasonryTextWrapResponsiveNumber = number | Record<string | number, number>;
type MasonryTextWrapTextState = {
    lines: MasonryTextWrapResponsiveNumber;
    barHeight?: MasonryTextWrapResponsiveNumber;
    lineHeight?: MasonryTextWrapResponsiveNumber;
    responsiveBy?: "viewport" | "container";
};
type MasonryTextWrapTextEntry = {
    badge: MasonryTextWrapTextState;
    title: MasonryTextWrapTextState;
    body: MasonryTextWrapTextState;
};
type MasonryTextWrapChromeMetrics = {
    cardPaddingBlockPx: number;
    cardPaddingInlinePx: number;
    cardGapPx: number;
    metaGapPx: number;
    metaPaddingInlinePx: number;
    borderBlockPx?: number;
    borderInlinePx?: number;
    textGapCount?: number;
};
type MasonryTextWrapLayoutOptions = {
    columns: MasonryTextWrapResponsiveNumber;
    gap: MasonryTextWrapResponsiveNumber;
    metrics: MasonryTextWrapChromeMetrics;
};
type MasonryTextWrapItemGeometryOptions = {
    ratio: string;
    span?: ResponsiveMasonrySpan;
    skeletonText?: MasonryTextWrapTextEntry;
    textStates?: readonly MasonryTextWrapTextState[];
};
type MasonryTextWrapItemGeometry = {
    width: number;
    height: number;
    heightOffsetPx: MasonryHeightOffsetPx;
};
type MasonryTextWrapLayoutController = {
    rootRef: React.RefCallback<HTMLElement>;
    getItemGeometry: (args: MasonryTextWrapItemGeometryOptions) => MasonryTextWrapItemGeometry;
};
declare function createMasonryTextWrapSkeletonLayout(args: {
    item: SkeletonNode;
    itemWrapStyle: React.CSSProperties;
}): SkeletonNode;
declare function useMasonryTextWrapLayout({ columns, gap, metrics, }: MasonryTextWrapLayoutOptions): MasonryTextWrapLayoutController;

export { type MasonryTextWrapChromeMetrics, type MasonryTextWrapItemGeometry, type MasonryTextWrapItemGeometryOptions, type MasonryTextWrapLayoutController, type MasonryTextWrapLayoutOptions, type MasonryTextWrapResponsiveNumber, type MasonryTextWrapTextEntry, type MasonryTextWrapTextState, createMasonryTextWrapSkeletonLayout, useMasonryTextWrapLayout };
