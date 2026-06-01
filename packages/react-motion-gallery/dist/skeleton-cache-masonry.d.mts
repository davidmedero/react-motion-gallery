import * as react_jsx_runtime from 'react/jsx-runtime';
import { d as MasonrySkeletonProps } from './masonry-BOnLW8R5.mjs';
export { M as MasonryPlacement, c as MasonrySkeletonNode, e as MasonrySkeletonSlot, f as MasonrySkeletonSpec, g as SkeletonMasonryLayout, h as SkeletonMasonryOptions, S as SkeletonNode } from './masonry-BOnLW8R5.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
export { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
import 'react';
import './responsiveNumber-CouEMJ9O.mjs';

type CachedMasonrySkeletonProps = MasonrySkeletonProps & {
    cache?: SkeletonCacheOptions;
};
declare function CachedMasonrySkeleton({ cache: _cache, ...props }: CachedMasonrySkeletonProps): react_jsx_runtime.JSX.Element;

export { CachedMasonrySkeleton, type CachedMasonrySkeletonProps, CachedMasonrySkeleton as MasonrySkeleton, CachedMasonrySkeleton as Skeleton, SkeletonCacheOptions, CachedMasonrySkeleton as default };
