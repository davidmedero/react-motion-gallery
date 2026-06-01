export { E as Entries, d as EntriesCore, c as EntriesCoreProps, b as EntriesMediaContainerRender, a as EntriesProps, E as default, f as flattenEntries, n as nodeFromMediaDefault } from './index-CCmwUMAS.mjs';
export { a as createEntriesGridMedia, b as createEntriesMasonryMedia, c as createEntriesSliderMedia } from './masonry-miqLvs3X.mjs';
import { d as EntriesOptions, E as EntriesHandle } from './responsive-Bw0ub6Hv.mjs';
export { Q as EntriesDataMode, a as EntriesInfiniteScrollOptions, b as EntriesLayout, c as EntriesLoadMoreOptions, N as EntriesLoadingOptions, e as EntriesPaginationOptions, f as EntriesPlugin, g as EntriesPluginKind, T as EntriesPluginOptionsByKind, h as EntriesVirtualizationOptions, C as EntryCardRenderArgs, D as EntryItem, G as EntryMediaLayout, H as EntryMediaRenderArgs, I as EntryOverlayRenderArgs, J as EntryOverlayStyle, K as EntrySkeletonRenderArgs, L as EntrySkeletonResolverArgs, M as MediaEntryLink, O as RevealOptions, S as SlideOwner } from './responsive-Bw0ub6Hv.mjs';
export { EntriesItemsPerPageOption, EntriesPageControlItem, EntriesPageItemsOptions, EntriesPageRangeItem, EntriesPageRangeOptions, EntriesPaginationController, EntriesPaginationControls, EntriesPaginationControlsProps, EntriesPaginationRippleOptions, EntriesPaginationRippleProp, EntriesPaginationSessionStorageOptions, EntriesPaginationUrlSyncOptions, UseEntriesPaginationOptions, entriesPagination, getEntriesPageItems, getEntriesPageRange, useEntriesPagination } from './entries-pagination.mjs';
export { EntriesLoadMoreController, UseEntriesLoadMoreOptions, entriesLoadMore, useEntriesLoadMore } from './entries-load-more.mjs';
export { UseEntriesInfiniteScrollOptions, entriesInfiniteScroll, useEntriesInfiniteScroll } from './entries-infinite-scroll.mjs';
export { UseEntriesVirtualizerOptions, entriesVirtualization, useEntriesVirtualizer } from './entries-virtualization.mjs';
export { EntriesReadyController, UseEntriesReadyOptions, useEntriesReady } from './entries-ready.mjs';
import * as React from 'react';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { MediaItem } from './media.mjs';
import { k as SliderHandle } from './types-D9WBOrx6.mjs';
import { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
import './types-DcUQOXvS.mjs';
import './layout-BSjd7pwQ.mjs';
import './text-BBcRGVzn.mjs';
import './skeleton-base.mjs';
import 'react/jsx-runtime';
import './transitions-ChhEdSB6.mjs';
import './types-L2pRy8k4.mjs';
import './types-uhDRb0mo.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './types-bZ-lDlKM.mjs';
import 'react-dom/client';
import './dataPlugins-DzaWlM6f.mjs';

type UseEntryInViewOpts = IntersectionObserverInit & {
    nearMargin?: string;
    viewMargin?: string;
    keys?: readonly string[];
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
type DecodePriority = "all" | "first";
type UseEntryDecodeReadyOptions = {
    timeoutMs?: number;
    priority?: DecodePriority;
};
declare function useEntryDecodeReady(enabled: boolean, entries: EntryLike[] | undefined, inView: boolean[], opts?: UseEntryDecodeReadyOptions): {
    decodedReady: boolean[];
    entriesKey: string;
};

declare const DEFAULT_ENTRIES_SKELETON_EXIT_MS = 220;
declare function useNormalizedEntriesLoading(entries: EntriesOptions): {
    enabled: any;
    force: any;
    skeleton: any;
    minHeight: string;
    enterMs: number;
    exitMs: number;
    nearMargin: any;
    viewMargin: any;
    threshold: any;
    waitForDecode: boolean;
    decodeTimeoutMs: any;
    skeletonWrap: any;
    rememberRevealed: any;
};
declare function useNormalizedEntriesReveal(entries: EntriesOptions): {
    renderReveal: ((args: {
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
    entryFlatIndex: number[][] | null;
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
    cacheSnapshot?: SkeletonCacheSnapshot | null;
    listRef?: React.RefObject<HTMLDivElement | null>;
    skeletonCacheScopeId?: string;
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
declare const EntryList: React.ForwardRefExoticComponent<Props & React.RefAttributes<EntriesHandle>>;

export { DEFAULT_ENTRIES_SKELETON_EXIT_MS, EntriesHandle, EntriesOptions, EntryList, type UseEntryInViewOpts, resolveEntryLoadingVisualState, useEntryDecodeReady, useEntryInView, useNormalizedEntriesLoading, useNormalizedEntriesReveal };
