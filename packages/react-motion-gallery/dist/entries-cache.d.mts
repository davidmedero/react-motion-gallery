import * as react_jsx_runtime from 'react/jsx-runtime';
import { a as EntriesProps } from './index-C-bgM_aR.mjs';
export { b as EntriesMediaContainerRender, f as flattenEntries } from './index-C-bgM_aR.mjs';
import { E as EntriesOptions } from './responsive-DTXfqDUt.mjs';
export { C as EntriesLoadingOptions, u as EntryCardRenderArgs, v as EntryItem, w as EntryMediaLayout, x as EntryMediaRenderArgs, y as EntryOverlayRenderArgs, z as EntryOverlayStyle, A as EntrySkeletonRenderArgs, B as EntrySkeletonResolverArgs, M as MediaEntryLink, D as RevealOptions, S as SlideOwner } from './responsive-DTXfqDUt.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
export { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
export { a as createEntriesGridMedia, b as createEntriesMasonryMedia, c as createEntriesSliderMedia } from './masonry-Bapgkuum.mjs';
import 'react';
import './media.mjs';
import './types-D9WBOrx6.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './types-CYTSYIwL.mjs';
import './transitions-DU3ftmIq.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import './types-Skhqh1RQ.mjs';
import 'react-dom/client';
import './types-ap0Mfoo0.mjs';
import './GridSkeleton-BmMxvXie.mjs';
import './layout-BSjd7pwQ.mjs';
import './skeleton-base.mjs';
import './types-plwyER1z.mjs';
import './MasonrySkeleton-Dju7PDw7.mjs';

type CachedEntriesLoadingOptions = NonNullable<EntriesOptions["loading"]> & {
    cache?: SkeletonCacheOptions;
};
type CachedEntriesOptions = Omit<EntriesOptions, "loading"> & {
    loading?: CachedEntriesLoadingOptions;
};
type CachedEntriesProps = Omit<EntriesProps, "entries"> & {
    entries: CachedEntriesOptions;
};
declare function CachedEntries(props: CachedEntriesProps): react_jsx_runtime.JSX.Element;

export { CachedEntries, type CachedEntriesOptions, type CachedEntriesProps, CachedEntries as Entries, EntriesOptions, EntriesProps, SkeletonCacheOptions, CachedEntries as default };
