import type { SkeletonCacheOptions } from "react-motion-gallery/skeleton/cache";

type DemoSkeletonCacheOptions = Omit<SkeletonCacheOptions, "key">;

export function demoSkeletonCache(
  demoId: string,
  options: DemoSkeletonCacheOptions = {}
): SkeletonCacheOptions {
  return {
    ...options,
    key: demoId,
    routeKey: options.routeKey ?? `/demos?demo=${demoId}`,
  };
}
