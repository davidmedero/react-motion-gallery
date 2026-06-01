import * as react_jsx_runtime from 'react/jsx-runtime';
import { SkeletonProps } from './skeleton-base.mjs';
export { SkeletonForceOptions, SkeletonFrameProps, SkeletonTimingOptions } from './skeleton-base.mjs';
import { SkeletonCacheOptions } from './skeleton-cache.mjs';
export { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
export { a as SkeletonBaseStyle, b as SkeletonBaseStyleResponsive, c as SkeletonContainerStyle, d as SkeletonContainerStyleResponsive, e as SkeletonLength, S as SkeletonNode, f as SkeletonShimmer } from './layout-BSjd7pwQ.mjs';
export { T as TextSkeletonResponsiveBy } from './text-BBcRGVzn.mjs';
import 'react';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-ChhEdSB6.mjs';

type CachedSkeletonProps = SkeletonProps & {
    cache?: SkeletonCacheOptions;
};
declare function CachedSkeleton({ cache, ...props }: CachedSkeletonProps): react_jsx_runtime.JSX.Element;

export { CachedSkeleton, type CachedSkeletonProps, CachedSkeleton as Skeleton, SkeletonCacheOptions, SkeletonProps, CachedSkeleton as default };
