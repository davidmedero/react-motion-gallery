export { E as Entries, d as EntriesCore, c as EntriesCoreProps, a as EntriesMediaContainerRender, b as EntriesProps, E as default, f as flattenEntries, n as nodeFromMediaDefault } from './index--Rr6axdJ.mjs';
import { d as EntriesOptions, E as EntriesHandle } from './responsive-Bq9VSmbl.mjs';
export { X as EntriesDataMode, a as EntriesInfiniteScrollOptions, b as EntriesLayout, c as EntriesLoadMoreOptions, U as EntriesLoadingOptions, e as EntriesPaginationOptions, f as EntriesPlugin, g as EntriesPluginKind, Y as EntriesPluginOptionsByKind, h as EntriesVirtualizationOptions, Q as EntryCardRenderArgs, J as EntryItem, O as EntryMediaLayout, K as EntryMediaRenderArgs, L as EntryOverlayRenderArgs, N as EntryOverlayStyle, W as EntrySkeletonRenderArgs, T as EntrySkeletonResolverArgs, M as MediaEntryLink, V as RevealOptions, S as SlideOwner } from './responsive-Bq9VSmbl.mjs';
export { EntriesItemsPerPageOption, EntriesPageControlItem, EntriesPageItemsOptions, EntriesPageRangeItem, EntriesPageRangeOptions, EntriesPaginationController, EntriesPaginationControls, EntriesPaginationControlsProps, EntriesPaginationRippleOptions, EntriesPaginationRippleProp, EntriesPaginationSessionStorageOptions, EntriesPaginationUrlSyncOptions, UseEntriesPaginationOptions, entriesPagination, getEntriesPageItems, getEntriesPageRange, useEntriesPagination } from './entries-pagination.mjs';
export { EntriesLoadMoreController, UseEntriesLoadMoreOptions, entriesLoadMore, useEntriesLoadMore } from './entries-load-more.mjs';
export { UseEntriesInfiniteScrollOptions, entriesInfiniteScroll, useEntriesInfiniteScroll } from './entries-infinite-scroll.mjs';
export { UseEntriesVirtualizerOptions, entriesVirtualization, useEntriesVirtualizer } from './entries-virtualization.mjs';
export { EntriesReadyController, UseEntriesReadyOptions, useEntriesReady } from './entries-ready.mjs';
import * as React from 'react';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { MediaItem } from './media.mjs';
import { m as SliderHandle } from './types-CGPPAn9i.mjs';
import './types-DTSXOwzF.mjs';
import './transitions-ChhEdSB6.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import './infiniteScrollTrigger-BluBDW9o.mjs';
import './types-BtQK91-K.mjs';
import 'react-dom/client';
import './dataPlugins-CsUwdsuu.mjs';

type UseEntryInViewOpts = IntersectionObserverInit & {
    nearMargin?: string;
    viewMargin?: string;
    keys?: readonly string[];
};
declare function useEntryInView(len: number, opts?: UseEntryInViewOpts): {
    nearView: boolean[];
    inView: boolean[];
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
    waitForMedia: any;
    decodeTimeoutMs: any;
    skeletonWrap: any;
    rememberRevealed: any;
};
declare function useNormalizedEntriesReveal(entries: EntriesOptions): {
    renderReveal: ((args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode) | undefined;
    durationMs: number;
    easing: string;
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
        mediaReadyKey?: React.Key;
        mediaReadyTimeoutMs?: number;
        onMediaReadyChange?: (ready: boolean) => void;
    }) => React.ReactNode;
    breakpoints: BreakpointMap;
    registerExpandableImage?: (globalIndex: number, node: HTMLImageElement | HTMLVideoElement | null) => void;
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
    listRef?: React.RefObject<HTMLDivElement | null>;
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
