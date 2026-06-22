import { k as SliderHandle, w as EntriesOptions, M as MediaEntryLink, B as SlideOwner, s as EntriesHandle, ah as EntryItem } from './responsive-DRmZH1Q2.mjs';
import * as React from 'react';
import { MediaItem } from './media.mjs';

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
    entryListRef?: React.RefObject<HTMLDivElement | null>;
};
declare const EntriesCore: React.ForwardRefExoticComponent<EntriesProps & {
    entryListRef?: React.RefObject<HTMLDivElement | null>;
} & React.RefAttributes<EntriesHandle>>;
declare const Entries: React.ForwardRefExoticComponent<EntriesProps & React.RefAttributes<EntriesHandle>>;

export { Entries as E, type EntriesMediaContainerRender as a, type EntriesProps as b, type EntriesCoreProps as c, EntriesCore as d, flattenEntries as f, nodeFromMediaDefault as n };
