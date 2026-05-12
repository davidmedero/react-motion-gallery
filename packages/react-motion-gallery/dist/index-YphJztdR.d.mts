import * as react_jsx_runtime from 'react/jsx-runtime';
import { E as EntriesOptions, M as MediaEntryLink, S as SlideOwner, n as EntryItem } from './responsive-Ch5b4LC-.mjs';
import * as React from 'react';
import { MediaItem } from './media.mjs';
import { j as SliderHandle } from './types-CfvTYIyd.mjs';

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
declare function Entries(props: EntriesProps): react_jsx_runtime.JSX.Element;

export { Entries as E, type EntriesMediaContainerRender as a, type EntriesProps as b, flattenEntries as f, nodeFromMediaDefault as n };
