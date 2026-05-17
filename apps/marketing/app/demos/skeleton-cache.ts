import type { SkeletonCacheOptions } from "react-motion-gallery/skeleton/cache";

export function demoSkeletonCache(demoId: string): SkeletonCacheOptions {
  return {
    key: demoId,
    routeKey: `/demos?demo=${demoId}`,
  };
}
