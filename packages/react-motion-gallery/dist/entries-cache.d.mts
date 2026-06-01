import * as React from 'react';
import { a as EntriesProps } from './index-CCmwUMAS.mjs';
export { b as EntriesMediaContainerRender, f as flattenEntries } from './index-CCmwUMAS.mjs';
import { d as EntriesOptions, E as EntriesHandle } from './responsive-Bw0ub6Hv.mjs';
export { a as EntriesInfiniteScrollOptions, c as EntriesLoadMoreOptions, N as EntriesLoadingOptions, e as EntriesPaginationOptions, f as EntriesPlugin, g as EntriesPluginKind, h as EntriesVirtualizationOptions, C as EntryCardRenderArgs, D as EntryItem, G as EntryMediaLayout, H as EntryMediaRenderArgs, I as EntryOverlayRenderArgs, J as EntryOverlayStyle, K as EntrySkeletonRenderArgs, L as EntrySkeletonResolverArgs, M as MediaEntryLink, O as RevealOptions, S as SlideOwner } from './responsive-Bw0ub6Hv.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
export { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
export { useEntriesReady } from './entries-ready.mjs';
export { EntriesItemsPerPageOption, EntriesPageControlItem, EntriesPageItemsOptions, EntriesPageRangeItem, EntriesPageRangeOptions, EntriesPaginationController, EntriesPaginationControlsProps, EntriesPaginationRippleOptions, EntriesPaginationRippleProp, EntriesPaginationSessionStorageOptions, EntriesPaginationUrlSyncOptions, UseEntriesPaginationOptions, entriesPagination, useEntriesPagination } from './entries-pagination.mjs';
export { entriesLoadMore, useEntriesLoadMore } from './entries-load-more.mjs';
export { entriesInfiniteScroll, useEntriesInfiniteScroll } from './entries-infinite-scroll.mjs';
export { entriesVirtualization, useEntriesVirtualizer } from './entries-virtualization.mjs';
export { a as createEntriesGridMedia, b as createEntriesMasonryMedia, c as createEntriesSliderMedia } from './masonry-miqLvs3X.mjs';
import './media.mjs';
import './types-D9WBOrx6.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './types-uhDRb0mo.mjs';
import './transitions-ChhEdSB6.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import './types-bZ-lDlKM.mjs';
import 'react-dom/client';
import './dataPlugins-DzaWlM6f.mjs';
import './types-DcUQOXvS.mjs';
import './layout-BSjd7pwQ.mjs';
import './skeleton-base.mjs';
import 'react/jsx-runtime';
import './types-L2pRy8k4.mjs';

type CachedEntriesLoadingOptions = NonNullable<EntriesOptions["loading"]> & {
    cache?: SkeletonCacheOptions;
};
type CachedEntriesOptions = Omit<EntriesOptions, "loading"> & {
    loading?: CachedEntriesLoadingOptions;
};
type CachedEntriesProps = Omit<EntriesProps, "entries"> & {
    entries: CachedEntriesOptions;
};
declare const CachedEntries: React.ForwardRefExoticComponent<Omit<EntriesProps, "entries"> & {
    entries: CachedEntriesOptions;
} & React.RefAttributes<EntriesHandle>>;

export { CachedEntries, type CachedEntriesOptions, type CachedEntriesProps, CachedEntries as Entries, EntriesHandle, EntriesOptions, EntriesProps, SkeletonCacheOptions, CachedEntries as default };
