import * as React from 'react';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { L as LoadingForceOptions } from './force-C5m1QpdF.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
import { M as MasonryPlacement, d as MasonrySkeletonProps, R as ResponsiveMasonrySpan } from './masonry-BOnLW8R5.mjs';
export { a as MasonrySpan } from './masonry-BOnLW8R5.mjs';
import { M as MasonryPlugin } from './types-qMg7LB37.mjs';
export { a as MasonryPluginHost, b as MasonryPluginKind, c as MasonryPluginRuntimeProps } from './types-qMg7LB37.mjs';
export { MasonryReadyController, useMasonryReady } from './masonry-ready.mjs';
export { MasonryItemsPerPageOption, MasonryPaginationControlsProps, MasonryPaginationOptions, MasonryPaginationRippleOptions, MasonryPaginationRippleProp, MasonryPaginationSessionStorageOptions, UseMasonryPaginationOptions } from './masonry-pagination.mjs';
export { MasonryLoadMoreOptions, UseMasonryLoadMoreOptions } from './masonry-load-more.mjs';
export { MasonryInfiniteScrollOptions, UseMasonryInfiniteScrollOptions } from './masonry-infinite-scroll.mjs';
export { MasonryVirtualizationOptions, UseMasonryVirtualizerOptions } from './masonry-virtualization.mjs';
import 'react/jsx-runtime';
import './types-L2pRy8k4.mjs';
import './layout-BSjd7pwQ.mjs';
import './text-BBcRGVzn.mjs';
import './dataPlugins-DzaWlM6f.mjs';

type MasonryClassNames = {
    root?: string;
    item?: string;
};
type MasonryRevealOptions = {
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
    disabled?: boolean;
    staggerLimit?: number;
};
type MasonryLoadingSkeletonArgs = {
    index: number;
    itemIndex?: number;
    key: React.Key;
    revealKey?: React.Key;
    placeholder: boolean;
    ready: boolean;
    span?: ResponsiveMasonrySpan;
    width?: number;
    height?: number;
};
type MasonryLoadingOptions = {
    enabled?: boolean;
    active?: boolean;
    count?: number;
    skeleton?: MasonrySkeletonProps | ((args: MasonryLoadingSkeletonArgs) => React.ReactNode);
    cache?: SkeletonCacheOptions;
    force?: LoadingForceOptions;
    timing?: {
        enterMs?: number;
        minVisibleMs?: number;
        exitMs?: number;
    };
    animate?: boolean;
    waitForMedia?: boolean;
    decodeTimeoutMs?: number;
    rootMargin?: string;
    threshold?: number;
    keepSkeletonMounted?: boolean;
    rememberRevealed?: boolean;
};
type MasonryItemProps = {
    width: number;
    height: number;
    span?: ResponsiveMasonrySpan;
    revealKey?: React.Key;
    placeholder?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
};
type MasonryHandle = {
    getRootNode: () => HTMLElement | null;
    getItemNodes: () => HTMLElement[];
    isReady: () => boolean;
    onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};
type MasonryOptions = {
    columns?: ResponsiveNumber;
    gap?: ResponsiveNumber;
    placement?: MasonryPlacement;
    plugins?: MasonryPlugin[];
    as?: React.ElementType;
    rootRef?: React.Ref<HTMLElement>;
    classNames?: MasonryClassNames;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
    reveal?: MasonryRevealOptions;
    revealReady?: boolean;
    loading?: MasonryLoadingOptions;
};
type MasonryItemComponent = React.FC<MasonryItemProps> & {
    __rmgLightMasonryItem: true;
};
type MasonryComponent = React.ForwardRefExoticComponent<MasonryOptions & React.RefAttributes<MasonryHandle>> & {
    Item: MasonryItemComponent;
};
declare const MasonryItem: MasonryItemComponent;
declare const Masonry: MasonryComponent;

export { Masonry, type MasonryHandle, MasonryItem, type MasonryItemProps, type MasonryLoadingOptions, type MasonryLoadingSkeletonArgs, type MasonryOptions, MasonryPlacement, MasonryPlugin, type MasonryRevealOptions, ResponsiveMasonrySpan, Masonry as default };
