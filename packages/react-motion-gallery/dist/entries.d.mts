export { D as DEFAULT_ENTRIES, E as Entries, a as EntriesMediaContainerRender, b as EntriesProps, E as default, f as flattenEntries, n as nodeFromMediaDefault } from './index-C0AqfaC3.mjs';
import { E as EntriesOptions } from './types-ChjyCquV.mjs';
export { g as EntriesLoadingOptions, e as EntryCardRenderArgs, a as EntryItem, d as EntryMediaLayout, b as EntryMediaRenderArgs, c as EntryOverlayRenderArgs, h as EntrySkeletonRenderArgs, f as EntrySkeletonResolverArgs, I as IntroOptions, M as MediaEntryLink, S as SlideOwner } from './types-ChjyCquV.mjs';
import * as React from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { M as MediaItem } from './media-moIXOhT1.mjs';
import { a as SliderHandle } from './types-9fvdyhuG.mjs';
import './elements-Bd1vm4Uk.mjs';
import './responsive-CvE5dTnP.mjs';
import './types-tb9Qf2Mj.mjs';
import './sliderSub-DDPjywVp.mjs';

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
    registerExpandableImage?: (globalIndex: number, node: HTMLImageElement | HTMLVideoElement | null) => void;
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
};
declare function EntryList({ enabled, entries, fsEnabled, openFullscreenAt, entryFlatIndexRef, nodeFromMedia, renderMediaContainer, registerExpandableImage, entrySliderRefs, }: Props): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | react_jsx_runtime.JSX.Element | null | undefined;

export { EntriesOptions, EntryList, type UseEntryInViewOpts, useEntryDecodeReady, useEntryInView, useNormalizedEntriesIntro, useNormalizedEntriesLoading };
