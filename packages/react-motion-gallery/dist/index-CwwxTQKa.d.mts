import { E as EntriesOptions, M as MediaEntryLink, S as SlideOwner, a as EntryItem } from './types-_1D0QtfD.mjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { M as MediaItem } from './plyrTypes-Cq4C3ul5.mjs';
import { a as SliderHandle } from './types-DY058l5M.mjs';

declare const DEFAULT_ENTRIES: Required<Pick<EntriesOptions, "mediaLayout">>;

type EntriesMediaContainerRender = (args: {
    entryIndex: number;
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
declare function Entries(props: EntriesProps): react_jsx_runtime.JSX.Element;

export { DEFAULT_ENTRIES as D, Entries as E, type EntriesMediaContainerRender as a, type EntriesProps as b, flattenEntries as f, nodeFromMediaDefault as n };
