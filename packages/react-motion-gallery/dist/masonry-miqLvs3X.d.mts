import * as React from 'react';
import { b as EntriesMediaContainerRender } from './index-CCmwUMAS.mjs';
import { j as SliderOptions, k as SliderHandle } from './types-D9WBOrx6.mjs';
import { n as GridSkeletonSpec, o as RevealOptions } from './types-DcUQOXvS.mjs';
import { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
import { d as MasonrySkeletonSpec, R as RevealOptions$1 } from './types-L2pRy8k4.mjs';

type EntriesSliderMediaOptions = {
    sliderObject?: SliderOptions;
    gap?: number;
    initialHeight?: number | string;
    columns?: number;
    sliderImagesReady?: any;
    renderFsCaption?: any;
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
};
declare function createEntriesSliderMedia(opts?: EntriesSliderMediaOptions): EntriesMediaContainerRender;

type EntriesGridLoadingOptions = {
    enabled?: boolean;
    force?: SkeletonForceOptions;
    skeleton?: GridSkeletonSpec;
    timing?: SkeletonTimingOptions;
};
declare function createEntriesGridMedia(args: {
    gridObject?: any;
    gridLoading?: EntriesGridLoadingOptions;
    gridReveal?: RevealOptions;
}): EntriesMediaContainerRender;

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
    masonryReveal?: RevealOptions$1;
}): EntriesMediaContainerRender;

export { createEntriesGridMedia as a, createEntriesMasonryMedia as b, createEntriesSliderMedia as c };
