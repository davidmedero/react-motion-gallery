export { E as Entries, d as EntriesCore, c as EntriesCoreProps, b as EntriesMediaContainerRender, a as EntriesProps, E as default, f as flattenEntries, n as nodeFromMediaDefault } from './index-DsnXXVxA.mjs';
export { a as createEntriesGridMedia, b as createEntriesMasonryMedia, c as createEntriesSliderMedia } from './masonry-D69nVILv.mjs';
import { E as EntriesOptions } from './responsive-BVaw9kXW.mjs';
export { C as EntriesLoadingOptions, u as EntryCardRenderArgs, v as EntryItem, w as EntryMediaLayout, x as EntryMediaRenderArgs, y as EntryOverlayRenderArgs, z as EntryOverlayStyle, A as EntrySkeletonRenderArgs, B as EntrySkeletonResolverArgs, I as IntroOptions, M as MediaEntryLink, S as SlideOwner } from './responsive-BVaw9kXW.mjs';
import * as React from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { MediaItem } from './media.mjs';
import { j as SliderHandle } from './types-CE76Zotl.mjs';
import { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
import './types-Do4Pq-Td.mjs';
import './GridSkeleton-B-EyBBVX.mjs';
import './layout-BSjd7pwQ.mjs';
import './text-BBcRGVzn.mjs';
import './skeleton-base.mjs';
import './transitions-DU3ftmIq.mjs';
import './types-Br27DWP7.mjs';
import './MasonrySkeleton-bp_Cp0OB.mjs';
import './types-CUhbDSjd.mjs';
import './plyrTypes-DhzgHNfX.mjs';
import 'plyr';
import './types-Dhh8xfHo.mjs';
import 'plyr-react';
import './types-B7u7aVW2.mjs';
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

export { EntriesOptions, EntryList, type UseEntryInViewOpts, resolveEntryLoadingVisualState, useEntryDecodeReady, useEntryInView, useNormalizedEntriesIntro, useNormalizedEntriesLoading };
