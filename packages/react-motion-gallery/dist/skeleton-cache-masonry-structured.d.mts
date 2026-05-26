import * as react_jsx_runtime from 'react/jsx-runtime';
import { MasonrySkeletonProps } from './skeleton-masonry-structured.mjs';
export { SkeletonMasonryLayout, SkeletonMasonryOptions } from './skeleton-masonry-structured.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
export { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
export { M as MasonryPlacement, a as MasonrySkeletonNode, b as MasonrySkeletonSlot, c as MasonrySkeletonSpec } from './MasonrySkeleton-C7WkAbFh.mjs';
export { S as SkeletonNode } from './layout-BSjd7pwQ.mjs';
import 'react';
import './responsiveNumber-CouEMJ9O.mjs';
import './types-Cc37Drgz.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-DU3ftmIq.mjs';
import './text-BBcRGVzn.mjs';

type CachedMasonrySkeletonProps = MasonrySkeletonProps & {
    cache?: SkeletonCacheOptions;
};
declare function CachedMasonrySkeleton({ cache, ...props }: CachedMasonrySkeletonProps): react_jsx_runtime.JSX.Element;

export { CachedMasonrySkeleton, type CachedMasonrySkeletonProps, CachedMasonrySkeleton as MasonrySkeleton, CachedMasonrySkeleton as Skeleton, CachedMasonrySkeleton as default };
