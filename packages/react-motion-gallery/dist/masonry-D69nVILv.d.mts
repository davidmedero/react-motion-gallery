import * as React from 'react';
import { b as EntriesMediaContainerRender } from './index-DsnXXVxA.mjs';
import { i as SliderOptions, j as SliderHandle } from './types-CE76Zotl.mjs';
import { I as IntroOptions } from './types-Do4Pq-Td.mjs';
import { b as GridSkeletonSpec } from './GridSkeleton-B-EyBBVX.mjs';
import { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
import { I as IntroOptions$1 } from './types-Br27DWP7.mjs';
import { c as MasonrySkeletonSpec } from './MasonrySkeleton-bp_Cp0OB.mjs';

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
    gridIntro?: IntroOptions;
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
    masonryIntro?: IntroOptions$1;
}): EntriesMediaContainerRender;

export { createEntriesGridMedia as a, createEntriesMasonryMedia as b, createEntriesSliderMedia as c };
