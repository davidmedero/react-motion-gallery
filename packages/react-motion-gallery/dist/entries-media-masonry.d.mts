import { a as EntriesMediaContainerRender } from './index-DUT57ncN.mjs';
import { R as ResponsiveMasonrySpan, a as RevealOptions } from './types-Bg0qLhxl.mjs';
import { c as SkeletonLayoutRoot, S as SkeletonNode$1, d as SkeletonWrapStyle, a as SkeletonLength, b as SkeletonShimmer } from './layout-BOy4geKv.mjs';
import { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
import './responsive-BgOmwHgG.mjs';
import './types-uhDRb0mo.mjs';
import 'react';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './types-D9WBOrx6.mjs';
import './media.mjs';
import './transitions-ChhEdSB6.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import './types-bZ-lDlKM.mjs';
import 'react-dom/client';
import 'react/jsx-runtime';

type MasonrySkeletonWrapStyle = SkeletonWrapStyle;
type SkeletonNode = SkeletonNode$1;
type MasonrySkeletonSlot = {
    item?: SkeletonNode;
    itemWrapStyle?: MasonrySkeletonWrapStyle;
    ratio?: number;
    heightPx?: number;
    span?: ResponsiveMasonrySpan;
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

type EntriesMasonryLoadingOptions = {
    enabled?: boolean;
    active?: boolean;
    count?: number;
    force?: SkeletonForceOptions;
    skeleton?: MasonrySkeletonSpec;
    timing?: SkeletonTimingOptions;
    animate?: boolean;
    waitForMedia?: boolean;
    decodeTimeoutMs?: number;
    rootMargin?: string;
    threshold?: number;
    keepSkeletonMounted?: boolean;
    rememberRevealed?: boolean;
};
declare function createEntriesMasonryMedia(args: {
    masonryObject?: any;
    masonryLoading?: EntriesMasonryLoadingOptions;
    masonryReveal?: RevealOptions;
}): EntriesMediaContainerRender;

export { createEntriesMasonryMedia };
