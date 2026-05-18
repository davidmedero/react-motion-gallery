import { a as EntriesMediaContainerRender } from './index-DAo6ddXK.mjs';
export { E as Entries, b as EntriesProps, E as default, f as flattenEntries, n as nodeFromMediaDefault } from './index-DAo6ddXK.mjs';
import * as React from 'react';
import { j as SliderHandle, i as SliderOptions } from './types-BiXSaEk7.mjs';
import { I as IntroOptions } from './types-Do4Pq-Td.mjs';
import { b as GridSkeletonSpec } from './GridSkeleton-Dpsi5tXc.mjs';
import { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
import { I as IntroOptions$1 } from './types-Br27DWP7.mjs';
import { b as MasonrySkeletonSpec } from './MasonrySkeleton-Cs0x-4yL.mjs';
import { E as EntriesOptions } from './responsive-MOdk42GH.mjs';
export { B as EntriesLoadingOptions, z as EntryCardRenderArgs, u as EntryItem, y as EntryMediaLayout, v as EntryMediaRenderArgs, w as EntryOverlayRenderArgs, x as EntryOverlayStyle, C as EntrySkeletonRenderArgs, A as EntrySkeletonResolverArgs, I as IntroOptions, M as MediaEntryLink, S as SlideOwner } from './responsive-MOdk42GH.mjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { MediaItem } from './media.mjs';
import './layout-BOy4geKv.mjs';
import './text-BBcRGVzn.mjs';
import './transitions-DU3ftmIq.mjs';
import './skeleton-cache.mjs';
import './types-DXFoG8LC.mjs';
import './plyrTypes-DhzgHNfX.mjs';
import 'plyr';
import './types-Dhh8xfHo.mjs';
import 'plyr-react';
import './types-DNd5jSkS.mjs';
import 'react-dom/client';

type UseEntryInViewOpts = IntersectionObserverInit & {
    nearMargin?: string;
    viewMargin?: string;
};
declare function useEntryInView(len: number, opts?: UseEntryInViewOpts): {
    nearView: boolean[];
    everInView: boolean[];
    setEntryRef: (index: number) => (node: HTMLElement | null) => void;
};

type EntryLike = {
    key?: string;
    id?: string;
    media?: Array<{
        kind?: string;
        src?: string;
    }>;
};
declare function useEntryDecodeReady(enabled: boolean, entries: EntryLike[] | undefined, inView: boolean[], opts?: {
    timeoutMs?: number;
}): {
    decodedReady: boolean[];
    entriesKey: string;
};

declare function useNormalizedEntriesLoading(entries: EntriesOptions): {
    enabled: any;
    force: any;
    skeleton: any;
    minHeight: string;
    nearMargin: any;
    viewMargin: any;
    threshold: any;
    waitForDecode: boolean;
    decodeTimeoutMs: any;
    skeletonWrap: any;
};
declare function useNormalizedEntriesIntro(entries: EntriesOptions): {
    renderIntro: ((args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode) | undefined;
    staggerMs: number;
    durationMs: number;
    easing: string;
    staggerLimit: number;
};

type Props = {
    enabled: boolean;
    entries: EntriesOptions;
    fsEnabled: boolean;
    openFullscreenAt: (globalIndex: number, originEl?: HTMLElement | null) => void;
    entryFlatIndexRef: React.RefObject<number[][] | null>;
    nodeFromMedia: (m: MediaItem) => React.ReactNode;
    renderMediaContainer: (args: {
        entryIndex: number;
        entryInView?: boolean;
        mediaNodes: React.ReactNode[];
        entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
    }) => React.ReactNode;
    breakpoints: BreakpointMap;
    registerExpandableImage?: (globalIndex: number, node: HTMLImageElement | HTMLVideoElement | null) => void;
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
};
declare function resolveEntryLoadingVisualState(args: {
    loadingActive: boolean;
    loadingForced?: LoadingForceOptions;
    shouldMountContent: boolean;
    contentReady: boolean;
    defaultReveal: boolean;
}): {
    compareMode: boolean;
    revealContent: boolean;
    loadingLayerOpacity: number;
};
declare function EntryList({ enabled, entries, fsEnabled, openFullscreenAt, entryFlatIndexRef, nodeFromMedia, renderMediaContainer, breakpoints, registerExpandableImage, entrySliderRefs, }: Props): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | react_jsx_runtime.JSX.Element | null | undefined;

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

export { EntriesMediaContainerRender, EntriesOptions, EntryList, type UseEntryInViewOpts, createEntriesGridMedia, createEntriesMasonryMedia, createEntriesSliderMedia, resolveEntryLoadingVisualState, useEntryDecodeReady, useEntryInView, useNormalizedEntriesIntro, useNormalizedEntriesLoading };
