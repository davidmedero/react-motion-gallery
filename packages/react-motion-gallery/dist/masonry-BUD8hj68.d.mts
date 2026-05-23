import * as React from 'react';
import { b as EntriesMediaContainerRender } from './index-BnQMZBQd.mjs';
import { j as SliderOptions, k as SliderHandle } from './types-D9WBOrx6.mjs';
import { R as RevealOptions } from './types-ap0Mfoo0.mjs';
import { b as GridSkeletonSpec } from './GridSkeleton-BmMxvXie.mjs';
import { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
import { f as RevealOptions$1 } from './types-plwyER1z.mjs';
import { c as MasonrySkeletonSpec } from './MasonrySkeleton-Dju7PDw7.mjs';

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
    force?: SkeletonForceOptions;
    skeleton?: MasonrySkeletonSpec;
    timing?: SkeletonTimingOptions;
};
declare function createEntriesMasonryMedia(args: {
    masonryObject?: any;
    masonryLoading?: EntriesMasonryLoadingOptions;
    masonryReveal?: RevealOptions$1;
}): EntriesMediaContainerRender;

export { createEntriesGridMedia as a, createEntriesMasonryMedia as b, createEntriesSliderMedia as c };
