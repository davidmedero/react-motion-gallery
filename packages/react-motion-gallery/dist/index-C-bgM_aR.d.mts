import * as react_jsx_runtime from 'react/jsx-runtime';
import { E as EntriesOptions, M as MediaEntryLink, S as SlideOwner, v as EntryItem } from './responsive-DTXfqDUt.mjs';
import * as React from 'react';
import { MediaItem } from './media.mjs';
import { k as SliderHandle } from './types-D9WBOrx6.mjs';
import { SkeletonCacheSnapshot } from './skeleton-cache.mjs';

type EntriesMediaContainerRender = (args: {
    entryIndex: number;
    entryInView?: boolean;
    mediaNodes: React.ReactNode[];
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
}) => React.ReactNode;
type FullscreenItemsInput = MediaItem[] | string[];
declare function nodeFromMediaDefault(m: MediaItem): React.ReactNode;
declare function flattenEntries(items: EntryItem[] | undefined): {
    flattenedMedia: MediaItem[];
    flattenedMap: MediaEntryLink[];
    entryFlatIndex: number[][] | null;
    owners: SlideOwner[];
};
type EntriesProps = {
    enabled?: boolean;
    entries: EntriesOptions;
    fullscreen?: {
        enabled?: boolean;
        items?: FullscreenItemsInput;
    };
    renderMediaContainer: EntriesMediaContainerRender;
    nodeFromMedia?: (m: MediaItem) => React.ReactNode;
    entryFlatIndexRef?: React.RefObject<number[][] | null>;
    entryMapRef?: React.RefObject<MediaEntryLink[] | null>;
    fsOwnersRef?: React.RefObject<SlideOwner[]>;
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
};
type EntriesCoreProps = EntriesProps & {
    entryListCacheSnapshot?: SkeletonCacheSnapshot | null;
    entryListCacheScopeId?: string;
    entryListRef?: React.RefObject<HTMLDivElement | null>;
};
declare function EntriesCore(props: EntriesCoreProps): react_jsx_runtime.JSX.Element;
declare function Entries(props: EntriesProps): react_jsx_runtime.JSX.Element;

export { Entries as E, type EntriesProps as a, type EntriesMediaContainerRender as b, type EntriesCoreProps as c, EntriesCore as d, flattenEntries as f, nodeFromMediaDefault as n };
