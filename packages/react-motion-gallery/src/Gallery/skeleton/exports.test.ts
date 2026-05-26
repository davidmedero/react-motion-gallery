import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as skeletonBaseEntry from "../../skeleton-base";
import * as skeletonCacheBaseEntry from "../../skeleton-cache-base";
import * as skeletonCacheGridEntry from "../../skeleton-cache-grid";
import * as skeletonCacheMasonryEntry from "../../skeleton-cache-masonry";
import * as skeletonCacheMasonryStructuredEntry from "../../skeleton-cache-masonry-structured";
import * as skeletonCacheEntry from "../../skeleton-cache";
import * as skeletonCacheProviderEntry from "../../skeleton-cache-provider";
import * as skeletonCacheSliderEntry from "../../skeleton-cache-slider";
import * as skeletonGridEntry from "../../skeleton-grid";
import * as skeletonMasonryEntry from "../../skeleton-masonry";
import * as skeletonMasonryStructuredEntry from "../../skeleton-masonry-structured";
import * as skeletonSliderEntry from "../../skeleton-slider";
import * as skeletonSliderRestoreEntry from "../../skeleton-slider-restore";

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("skeleton public entries", () => {
  test("exports the standalone base skeleton subpath", () => {
    expect(packageJson.exports["./skeleton/base"]).toBeDefined();
    expect(packageJson.exports["./skeleton/cache"]).toBeDefined();
    expect(packageJson.exports["./skeleton/cache/provider"]).toBeDefined();
    expect(packageJson.exports["./skeleton/cache/base"]).toBeDefined();
    expect(skeletonBaseEntry.Skeleton).toBeTypeOf("function");
    expect(skeletonBaseEntry.default).toBe(skeletonBaseEntry.Skeleton);
    expect(skeletonCacheEntry.getSkeletonCacheCookieName).toBeTypeOf("function");
    expect("SkeletonCacheProvider" in skeletonCacheEntry).toBe(false);
    expect(skeletonCacheProviderEntry.SkeletonCacheProvider).toBeTypeOf("function");
    expect(skeletonCacheBaseEntry.CachedSkeleton).toBeTypeOf("function");
    expect(skeletonCacheBaseEntry.Skeleton).toBe(skeletonCacheBaseEntry.CachedSkeleton);
    expect(skeletonCacheBaseEntry.default).toBe(skeletonCacheBaseEntry.CachedSkeleton);
  });

  test("exports gallery-specific skeleton subpaths", () => {
    expect(packageJson.exports["./skeleton/slider"]).toBeDefined();
    expect(packageJson.exports["./skeleton/cache/slider"]).toBeDefined();
    expect(packageJson.exports["./skeleton/slider/restore"]).toBeDefined();
    expect(packageJson.exports["./skeleton/grid"]).toBeDefined();
    expect(packageJson.exports["./skeleton/cache/grid"]).toBeDefined();
    expect(packageJson.exports["./skeleton/masonry"]).toBeDefined();
    expect(packageJson.exports["./skeleton/cache/masonry"]).toBeDefined();
    expect(packageJson.exports["./skeleton/masonry/structured"]).toBeDefined();
    expect(packageJson.exports["./skeleton/cache/masonry/structured"]).toBeDefined();

    expect(skeletonSliderEntry.SliderSkeleton).toBeTypeOf("function");
    expect(skeletonSliderEntry.Skeleton).toBe(skeletonSliderEntry.SliderSkeleton);
    expect(skeletonSliderEntry.default).toBe(skeletonSliderEntry.SliderSkeleton);
    expect(skeletonCacheSliderEntry.CachedSliderSkeleton).toBeTypeOf("function");
    expect(skeletonCacheSliderEntry.SliderSkeleton).toBe(
      skeletonCacheSliderEntry.CachedSliderSkeleton
    );
    expect(skeletonSliderRestoreEntry.RestoredSliderSkeleton).toBeTypeOf("function");
    expect(skeletonSliderRestoreEntry.SliderSkeleton).toBe(
      skeletonSliderRestoreEntry.RestoredSliderSkeleton
    );

    expect(skeletonGridEntry.GridSkeleton).toBeTypeOf("function");
    expect(skeletonGridEntry.Skeleton).toBe(skeletonGridEntry.GridSkeleton);
    expect(skeletonGridEntry.default).toBe(skeletonGridEntry.GridSkeleton);
    expect(skeletonCacheGridEntry.CachedGridSkeleton).toBeTypeOf("function");
    expect(skeletonCacheGridEntry.GridSkeleton).toBe(skeletonCacheGridEntry.CachedGridSkeleton);

    expect(skeletonMasonryEntry.MasonrySkeleton).toBeTypeOf("function");
    expect(skeletonMasonryEntry.Skeleton).toBe(skeletonMasonryEntry.MasonrySkeleton);
    expect(skeletonMasonryEntry.default).toBe(skeletonMasonryEntry.MasonrySkeleton);
    expect(skeletonCacheMasonryEntry.CachedMasonrySkeleton).toBeTypeOf("function");
    expect(skeletonCacheMasonryEntry.MasonrySkeleton).toBe(
      skeletonCacheMasonryEntry.CachedMasonrySkeleton
    );
    expect(skeletonMasonryStructuredEntry.MasonrySkeleton).toBeTypeOf("function");
    expect(skeletonCacheMasonryStructuredEntry.CachedMasonrySkeleton).toBeTypeOf("function");
  });
});
