import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as skeletonBaseEntry from "../../skeleton-base";
import * as skeletonCacheEntry from "../../skeleton-cache";
import * as skeletonCacheProviderEntry from "../../skeleton-cache-provider";
import * as skeletonGridEntry from "../../skeleton-grid";
import * as skeletonMasonryEntry from "../../skeleton-masonry";
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
    expect(packageJson.exports["./skeleton/cache/base"]).toBeUndefined();
    expect(skeletonBaseEntry.Skeleton).toBeTypeOf("function");
    expect(skeletonBaseEntry.default).toBe(skeletonBaseEntry.Skeleton);
    expect(skeletonCacheEntry.getSkeletonCacheCookieName).toBeTypeOf("function");
    expect("SkeletonCacheProvider" in skeletonCacheEntry).toBe(false);
    expect(skeletonCacheProviderEntry.SkeletonCacheProvider).toBeTypeOf("function");
  });

  test("exports gallery-specific skeleton subpaths", () => {
    expect(packageJson.exports["./skeleton/slider"]).toBeDefined();
    expect(packageJson.exports["./skeleton/cache/slider"]).toBeUndefined();
    expect(packageJson.exports["./skeleton/slider/restore"]).toBeDefined();
    expect(packageJson.exports["./skeleton/grid"]).toBeDefined();
    expect(packageJson.exports["./skeleton/cache/grid"]).toBeUndefined();
    expect(packageJson.exports["./skeleton/masonry"]).toBeDefined();
    expect(packageJson.exports["./skeleton/cache/masonry"]).toBeUndefined();
    expect(packageJson.exports["./skeleton/masonry/structured"]).toBeUndefined();
    expect(packageJson.exports["./skeleton/cache/masonry/structured"]).toBeUndefined();

    expect(skeletonSliderEntry.SliderSkeleton).toBeTypeOf("function");
    expect(skeletonSliderEntry.Skeleton).toBe(skeletonSliderEntry.SliderSkeleton);
    expect(skeletonSliderEntry.default).toBe(skeletonSliderEntry.SliderSkeleton);
    expect(skeletonSliderRestoreEntry.RestoredSliderSkeleton).toBeTypeOf("function");
    expect(skeletonSliderRestoreEntry.SliderSkeleton).toBe(
      skeletonSliderRestoreEntry.RestoredSliderSkeleton
    );

    expect(skeletonGridEntry.GridSkeleton).toBeTypeOf("function");
    expect(skeletonGridEntry.Skeleton).toBe(skeletonGridEntry.GridSkeleton);
    expect(skeletonGridEntry.default).toBe(skeletonGridEntry.GridSkeleton);

    expect(skeletonMasonryEntry.MasonrySkeleton).toBeTypeOf("function");
    expect(skeletonMasonryEntry.Skeleton).toBe(skeletonMasonryEntry.MasonrySkeleton);
    expect(skeletonMasonryEntry.default).toBe(skeletonMasonryEntry.MasonrySkeleton);
  });
});
