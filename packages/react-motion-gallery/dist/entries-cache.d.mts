import * as react_jsx_runtime from 'react/jsx-runtime';
import { a as EntriesProps } from './index-DsnXXVxA.mjs';
export { b as EntriesMediaContainerRender, f as flattenEntries } from './index-DsnXXVxA.mjs';
import { E as EntriesOptions } from './responsive-BVaw9kXW.mjs';
export { C as EntriesLoadingOptions, u as EntryCardRenderArgs, v as EntryItem, w as EntryMediaLayout, x as EntryMediaRenderArgs, y as EntryOverlayRenderArgs, z as EntryOverlayStyle, A as EntrySkeletonRenderArgs, B as EntrySkeletonResolverArgs, I as IntroOptions, M as MediaEntryLink, S as SlideOwner } from './responsive-BVaw9kXW.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
export { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
export { a as createEntriesGridMedia, b as createEntriesMasonryMedia, c as createEntriesSliderMedia } from './masonry-D69nVILv.mjs';
import 'react';
import './media.mjs';
import './types-CE76Zotl.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './types-CUhbDSjd.mjs';
import './transitions-DU3ftmIq.mjs';
import './plyrTypes-DhzgHNfX.mjs';
import 'plyr';
import './types-Dhh8xfHo.mjs';
import './text-BBcRGVzn.mjs';
import 'plyr-react';
import './types-B7u7aVW2.mjs';
import 'react-dom/client';
import './types-Do4Pq-Td.mjs';
import './GridSkeleton-B-EyBBVX.mjs';
import './layout-BSjd7pwQ.mjs';
import './skeleton-base.mjs';
import './types-Br27DWP7.mjs';
import './MasonrySkeleton-bp_Cp0OB.mjs';

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
