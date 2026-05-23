export { E as Entries, d as EntriesCore, c as EntriesCoreProps, b as EntriesMediaContainerRender, a as EntriesProps, E as default, f as flattenEntries, n as nodeFromMediaDefault } from './index-C-bgM_aR.mjs';
export { a as createEntriesGridMedia, b as createEntriesMasonryMedia, c as createEntriesSliderMedia } from './masonry-Bapgkuum.mjs';
import { E as EntriesOptions } from './responsive-DTXfqDUt.mjs';
export { C as EntriesLoadingOptions, u as EntryCardRenderArgs, v as EntryItem, w as EntryMediaLayout, x as EntryMediaRenderArgs, y as EntryOverlayRenderArgs, z as EntryOverlayStyle, A as EntrySkeletonRenderArgs, B as EntrySkeletonResolverArgs, M as MediaEntryLink, D as RevealOptions, S as SlideOwner } from './responsive-DTXfqDUt.mjs';
import * as React from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { MediaItem } from './media.mjs';
import { k as SliderHandle } from './types-D9WBOrx6.mjs';
import { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
import './types-ap0Mfoo0.mjs';
import './GridSkeleton-BmMxvXie.mjs';
import './layout-BSjd7pwQ.mjs';
import './text-BBcRGVzn.mjs';
import './skeleton-base.mjs';
import './transitions-DU3ftmIq.mjs';
import './types-plwyER1z.mjs';
import './MasonrySkeleton-Dju7PDw7.mjs';
import './types-CYTSYIwL.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './types-Skhqh1RQ.mjs';
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
declare function EntryList({ enabled, entries, fsEnabled, openFullscreenAt, entryFlatIndexRef, nodeFromMedia, renderMediaContainer, breakpoints, registerExpandableImage, entrySliderRefs, cacheSnapshot, listRef: providedListRef, skeletonCacheScopeId, }: Props): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | react_jsx_runtime.JSX.Element | null | undefined;

export { EntriesOptions, EntryList, type UseEntryInViewOpts, resolveEntryLoadingVisualState, useEntryDecodeReady, useEntryInView, useNormalizedEntriesLoading, useNormalizedEntriesReveal };
