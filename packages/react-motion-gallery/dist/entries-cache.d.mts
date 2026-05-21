import * as react_jsx_runtime from 'react/jsx-runtime';
import { a as EntriesProps } from './index-UIEUdQ2q.mjs';
export { b as EntriesMediaContainerRender, f as flattenEntries } from './index-UIEUdQ2q.mjs';
import { E as EntriesOptions } from './responsive-CxGNsJyB.mjs';
export { C as EntriesLoadingOptions, u as EntryCardRenderArgs, v as EntryItem, w as EntryMediaLayout, x as EntryMediaRenderArgs, y as EntryOverlayRenderArgs, z as EntryOverlayStyle, A as EntrySkeletonRenderArgs, B as EntrySkeletonResolverArgs, I as IntroOptions, M as MediaEntryLink, S as SlideOwner } from './responsive-CxGNsJyB.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
export { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
export { a as createEntriesGridMedia, b as createEntriesMasonryMedia, c as createEntriesSliderMedia } from './masonry-DcweEtFL.mjs';
import 'react';
import './media.mjs';
import './types-BiXSaEk7.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './types-DXFoG8LC.mjs';
import './transitions-DU3ftmIq.mjs';
import './plyrTypes-DhzgHNfX.mjs';
import 'plyr';
import './types-Dhh8xfHo.mjs';
import './text-BBcRGVzn.mjs';
import 'plyr-react';
import './types-DNd5jSkS.mjs';
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
