import { readFileSync } from "node:fs";
import type * as React from "react";
import { describe, expect, test } from "vitest";

import * as masonryEntry from "../../masonry";
import * as masonryReadyEntry from "../../masonry-ready";
import * as masonryMeasuredEntry from "../../masonry-measured";
import * as masonryMeasuredReadyEntry from "../../masonry-measured-ready";
import * as masonryFullscreenEntry from "../../masonry-fullscreen";
import * as masonryLazyLoadEntry from "../../masonry-lazy-load";
import * as masonryPaginationEntry from "../../masonry-pagination";
import * as masonryLoadMoreEntry from "../../masonry-load-more";
import * as masonryInfiniteScrollEntry from "../../masonry-infinite-scroll";
import * as masonryVirtualizationEntry from "../../masonry-virtualization";
import type {
  MasonryItemProps,
  MasonryLoadingOptions,
  MasonryLoadingSkeletonArgs,
  MasonryRevealOptions,
} from "../../masonry";
import type {
  MasonryItemProps as MeasuredMasonryItemProps,
  MasonryLoadingOptions as MeasuredMasonryLoadingOptions,
  MasonryLoadingSkeletonArgs as MeasuredMasonryLoadingSkeletonArgs,
  RevealOptions as MeasuredMasonryRevealOptions,
} from "../../masonry-measured";

type Expect<T extends true> = T;
type MasonryLoadingOptionsExported = Expect<
  MasonryLoadingOptions extends { skeleton?: unknown } ? true : false
>;
type MasonryLoadingSkeletonArgsExported = Expect<
  MasonryLoadingSkeletonArgs extends { ready: boolean; revealKey?: React.Key }
    ? true
    : false
>;
type MasonryRevealStaggerLimitExported = Expect<
  MasonryRevealOptions extends { staggerLimit?: number } ? true : false
>;
type MasonryItemRevealKeyExported = Expect<
  MasonryItemProps extends { revealKey?: React.Key } ? true : false
>;
type MasonryItemPlaceholderExported = Expect<
  MasonryItemProps extends { placeholder?: boolean } ? true : false
>;
type MeasuredMasonryLoadingOptionsExported = Expect<
  MeasuredMasonryLoadingOptions extends { skeleton?: unknown } ? true : false
>;
type MeasuredMasonryLoadingSkeletonArgsExported = Expect<
  MeasuredMasonryLoadingSkeletonArgs extends { ready: boolean; revealKey?: React.Key }
    ? true
    : false
>;
type MeasuredMasonryRevealStaggerLimitExported = Expect<
  MeasuredMasonryRevealOptions extends { staggerLimit?: number } ? true : false
>;
type MeasuredMasonryItemRevealKeyExported = Expect<
  MeasuredMasonryItemProps extends { revealKey?: React.Key } ? true : false
>;
type MeasuredMasonryItemPlaceholderExported = Expect<
  MeasuredMasonryItemProps extends { placeholder?: boolean } ? true : false
>;

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("masonry public entries", () => {
  test("exports masonry readiness through the masonry entry and dedicated subpath", () => {
    expect(masonryEntry.Masonry).toBeDefined();
    expect(masonryEntry.default).toBe(masonryEntry.Masonry);
    expect(masonryEntry.useMasonryReady).toBeTypeOf("function");
    expect(packageJson.exports["./masonry/ready"]).toBeDefined();
    expect(masonryReadyEntry.useMasonryReady).toBe(masonryEntry.useMasonryReady);
    expect(packageJson.exports["./masonry/measured"]).toBeDefined();
    expect(packageJson.exports["./masonry/measured/ready"]).toBeDefined();
    expect(masonryMeasuredEntry.Masonry).toBeDefined();
    expect(masonryMeasuredEntry.useMasonryReady).toBe(masonryMeasuredReadyEntry.useMasonryReady);
  });

  test("exports masonry lazy-load as a dedicated plugin subpath", () => {
    expect(packageJson.exports["./masonry/lazy-load"]).toBeDefined();
    expect(masonryLazyLoadEntry.masonryLazyLoad).toBeTypeOf("function");
    expect(masonryLazyLoadEntry.masonryLazyLoad()).toMatchObject({
      __rmgMasonryPlugin: true,
      __rmgLightMasonryPlugin: true,
      kind: "lazy-load",
      blocksReady: true,
    });
    expect(masonryLazyLoadEntry.masonryLazyLoad({ enabled: false })).toMatchObject({
      __rmgMasonryPlugin: true,
      __rmgLightMasonryPlugin: true,
      kind: "lazy-load",
      blocksReady: false,
    });
  });

  test("exports masonry fullscreen as a dedicated light plugin subpath", () => {
    expect(packageJson.exports["./masonry/fullscreen"]).toBeDefined();
    expect(masonryFullscreenEntry.masonryFullscreen).toBeTypeOf("function");
    expect(masonryFullscreenEntry.resolveMasonryFullscreenClick).toBeTypeOf("function");
    expect(masonryFullscreenEntry.masonryFullscreen()).toMatchObject({
      __rmgLightMasonryPlugin: true,
      kind: "fullscreen",
    });
  });

  test("exports masonry data plugins as dedicated cross-surface subpaths", () => {
    expect(packageJson.exports["./masonry/pagination"]).toBeDefined();
    expect(packageJson.exports["./masonry/load-more"]).toBeDefined();
    expect(packageJson.exports["./masonry/infinite-scroll"]).toBeDefined();
    expect(packageJson.exports["./masonry/virtualization"]).toBeDefined();
    expect(masonryPaginationEntry.masonryPagination({ pageIndex: 0, pageSize: 2 })).toMatchObject({
      __rmgMasonryPlugin: true,
      __rmgLightMasonryPlugin: true,
      kind: "pagination",
    });
    expect(masonryPaginationEntry.useMasonryPagination).toBeTypeOf("function");
    expect(masonryPaginationEntry.MasonryPaginationControls).toBeTypeOf("function");
    expect(masonryLoadMoreEntry.masonryLoadMore({ visibleCount: 2 })).toMatchObject({
      __rmgMasonryPlugin: true,
      __rmgLightMasonryPlugin: true,
      kind: "load-more",
    });
    expect(masonryLoadMoreEntry.useMasonryLoadMore).toBeTypeOf("function");
    expect(masonryInfiniteScrollEntry.masonryInfiniteScroll()).toMatchObject({
      __rmgMasonryPlugin: true,
      __rmgLightMasonryPlugin: true,
      kind: "infinite-scroll",
    });
    expect(masonryInfiniteScrollEntry.useMasonryInfiniteScroll).toBeTypeOf("function");
    expect(masonryVirtualizationEntry.masonryVirtualization()).toMatchObject({
      __rmgMasonryPlugin: true,
      __rmgLightMasonryPlugin: true,
      kind: "virtualization",
    });
    expect(masonryVirtualizationEntry.useMasonryVirtualizer).toBeTypeOf("function");
  });
});
