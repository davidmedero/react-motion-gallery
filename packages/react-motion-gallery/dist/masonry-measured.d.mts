import * as React from 'react';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { e as MasonryItemProps, f as MasonryOptions, g as MasonryHandle } from './types-L2pRy8k4.mjs';
export { h as MasonryLoadingOptions, i as MasonryLoadingSkeletonArgs, M as MasonryPlugin, j as MasonryPluginHost, k as MasonryPluginKind, l as MasonryPluginRuntimeProps, m as MasonrySpan, n as ResponsiveMasonrySpan, R as RevealOptions } from './types-L2pRy8k4.mjs';
export { MasonryReadyController, useMasonryReady } from './masonry-ready.mjs';
export { MasonryPaginationControlsProps, MasonryPaginationOptions, UseMasonryPaginationOptions } from './masonry-pagination.mjs';
export { MasonryLoadMoreOptions, UseMasonryLoadMoreOptions } from './masonry-load-more.mjs';
export { MasonryInfiniteScrollOptions, UseMasonryInfiniteScrollOptions } from './masonry-infinite-scroll.mjs';
export { MasonryVirtualizationOptions, UseMasonryVirtualizerOptions } from './masonry-virtualization.mjs';
import './force-C5m1QpdF.mjs';
import './skeleton-cache.mjs';
import './layout-BSjd7pwQ.mjs';
import './text-BBcRGVzn.mjs';
import './dataPlugins-DzaWlM6f.mjs';
import './types-qMg7LB37.mjs';

type MasonryItemComponent = React.FC<MasonryItemProps> & {
    __rmgMasonryItem: true;
};
declare const MasonryItem: MasonryItemComponent;

type Props = MasonryOptions & {
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
};
type MasonryComponent = React.ForwardRefExoticComponent<Props & React.RefAttributes<MasonryHandle>> & {
    Item: typeof MasonryItem;
};
declare const Masonry: MasonryComponent;

export { Masonry, MasonryHandle, MasonryItemProps, MasonryOptions, Masonry as default };
