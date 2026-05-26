import * as react_jsx_runtime from 'react/jsx-runtime';
import { b as MasonrySkeletonProps } from './masonry-BHq_xi-F.mjs';
export { a as MasonrySkeletonNode, c as MasonrySkeletonSlot, d as MasonrySkeletonSpec, e as SkeletonMasonryLayout, f as SkeletonMasonryOptions, S as SkeletonNode } from './masonry-BHq_xi-F.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
export { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
export { M as MasonryPlacement } from './placement-BWKxkHD8.mjs';
import 'react';
import './responsiveNumber-CouEMJ9O.mjs';

type CachedMasonrySkeletonProps = MasonrySkeletonProps & {
    cache?: SkeletonCacheOptions;
};
declare function CachedMasonrySkeleton({ cache: _cache, ...props }: CachedMasonrySkeletonProps): react_jsx_runtime.JSX.Element;

export { CachedMasonrySkeleton, type CachedMasonrySkeletonProps, CachedMasonrySkeleton as MasonrySkeleton, CachedMasonrySkeleton as Skeleton, SkeletonCacheOptions, CachedMasonrySkeleton as default };
