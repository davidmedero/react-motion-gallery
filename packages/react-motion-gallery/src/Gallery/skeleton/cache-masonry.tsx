"use client";

import * as React from "react";

import {
  MasonrySkeleton,
  type MasonrySkeletonProps,
} from "./masonry";
import type { SkeletonCacheOptions } from "./cache";

export type CachedMasonrySkeletonProps = MasonrySkeletonProps & {
  cache?: SkeletonCacheOptions;
};

export function CachedMasonrySkeleton({
  cache: _cache,
  ...props
}: CachedMasonrySkeletonProps) {
  return <MasonrySkeleton {...props} />;
}

export { CachedMasonrySkeleton as MasonrySkeleton, CachedMasonrySkeleton as Skeleton };
export default CachedMasonrySkeleton;
