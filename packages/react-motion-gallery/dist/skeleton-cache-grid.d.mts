import * as react_jsx_runtime from 'react/jsx-runtime';
import { GridSkeletonProps } from './skeleton-grid.mjs';
export { SkeletonGridLayout, SkeletonGridOptions } from './skeleton-grid.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
export { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
export { l as GridSkeletonNode, m as GridSkeletonSlot, n as GridSkeletonSpec } from './types-DcUQOXvS.mjs';
export { S as SkeletonNode } from './layout-BSjd7pwQ.mjs';
import 'react';
import './responsiveNumber-CouEMJ9O.mjs';
import './skeleton-base.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-ChhEdSB6.mjs';
import './text-BBcRGVzn.mjs';

type CachedGridSkeletonProps = GridSkeletonProps & {
    cache?: SkeletonCacheOptions;
};
declare function CachedGridSkeleton({ cache, ...props }: CachedGridSkeletonProps): react_jsx_runtime.JSX.Element;

export { CachedGridSkeleton, type CachedGridSkeletonProps, CachedGridSkeleton as GridSkeleton, CachedGridSkeleton as Skeleton, SkeletonCacheOptions, CachedGridSkeleton as default };
