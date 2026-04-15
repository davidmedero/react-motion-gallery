import { a as EntriesMediaContainerRender } from './index-CwwxTQKa.mjs';
export { D as DEFAULT_ENTRIES, E as Entries, b as EntriesProps, E as default, f as flattenEntries, n as nodeFromMediaDefault } from './index-CwwxTQKa.mjs';
import * as React from 'react';
import { a as SliderHandle, S as SliderOptions } from './types-DY058l5M.mjs';
import { L as LoadingOptions, I as IntroOptions } from './types-XEr8LRal.mjs';
import { L as LoadingOptions$1, I as IntroOptions$1 } from './types-VULXzSa2.mjs';
import { E as EntriesOptions } from './types-_1D0QtfD.mjs';
export { h as EntriesLoadingOptions, f as EntryCardRenderArgs, a as EntryItem, e as EntryMediaLayout, b as EntryMediaRenderArgs, c as EntryOverlayRenderArgs, d as EntryOverlayStyle, i as EntrySkeletonRenderArgs, g as EntrySkeletonResolverArgs, I as IntroOptions, M as MediaEntryLink, S as SlideOwner } from './types-_1D0QtfD.mjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { c as BreakpointMap } from './responsive-D_xhZmVI.mjs';
import { M as MediaItem } from './plyrTypes-Cq4C3ul5.mjs';
import './controls-SpWg1Kgt.mjs';
import './text-Cl2tR8oO.mjs';
import './sliderSub-Bo6Y8as_.mjs';
import './layout-CR6f2aPH.mjs';
import './types-Dhh8xfHo.mjs';
import 'plyr';

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
        mediaNodes: React.ReactNode[];
        entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
    }) => React.ReactNode;
    breakpoints: BreakpointMap;
    registerExpandableImage?: (globalIndex: number, node: HTMLImageElement | HTMLVideoElement | null) => void;
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
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

declare function createEntriesGridMedia(args: {
    gridObject?: any;
    gridLoading?: LoadingOptions;
    gridIntro?: IntroOptions;
}): EntriesMediaContainerRender;

declare function createEntriesMasonryMedia(args: {
    masonryObject?: any;
    masonryLoading?: LoadingOptions$1;
    masonryIntro?: IntroOptions$1;
}): EntriesMediaContainerRender;

export { EntriesMediaContainerRender, EntriesOptions, EntryList, type UseEntryInViewOpts, createEntriesGridMedia, createEntriesMasonryMedia, createEntriesSliderMedia, useEntryDecodeReady, useEntryInView, useNormalizedEntriesIntro, useNormalizedEntriesLoading };
