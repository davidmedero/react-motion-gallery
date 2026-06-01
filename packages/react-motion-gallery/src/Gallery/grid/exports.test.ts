import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as gridEntry from "../../grid";
import * as gridReadyEntry from "../../grid-ready";
import * as gridLazyLoadEntry from "../../grid-lazy-load";
import * as gridFullscreenEntry from "../../grid-fullscreen";
import * as gridPaginationEntry from "../../grid-pagination";
import * as gridLoadMoreEntry from "../../grid-load-more";
import * as gridInfiniteScrollEntry from "../../grid-infinite-scroll";
import * as gridVirtualizationEntry from "../../grid-virtualization";
import type {
  GridLoadingOptions,
  GridLoadingSkeletonArgs,
} from "../../grid";

type Expect<T extends true> = T;
type GridLoadingOptionsExported = Expect<
  GridLoadingOptions extends { skeleton?: unknown } ? true : false
>;
type GridLoadingSkeletonArgsExported = Expect<
  GridLoadingSkeletonArgs extends { ready: boolean } ? true : false
>;

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("grid public entries", () => {
  test("exports grid readiness through the grid entry and dedicated subpath", () => {
    expect(gridEntry.Grid).toBeDefined();
    expect(gridEntry.default).toBe(gridEntry.Grid);
    expect(gridEntry.useGridReady).toBeTypeOf("function");
    expect(packageJson.exports["./grid/ready"]).toBeDefined();
    expect(gridReadyEntry.useGridReady).toBe(gridEntry.useGridReady);
  });

  test("exports grid lazy-load as a dedicated plugin subpath", () => {
    expect(packageJson.exports["./grid/lazy-load"]).toBeDefined();
    expect(gridLazyLoadEntry.gridLazyLoad).toBeTypeOf("function");
    expect(gridLazyLoadEntry.gridLazyLoad()).toMatchObject({
      __rmgGridPlugin: true,
      kind: "lazy-load",
      blocksReady: true,
    });
    expect(gridLazyLoadEntry.gridLazyLoad({ enabled: false })).toMatchObject({
      __rmgGridPlugin: true,
      kind: "lazy-load",
      blocksReady: false,
    });
  });

  test("does not export the removed grid item reveal plugin subpath", () => {
    expect(packageJson.exports["./grid/item-reveal"]).toBeUndefined();
  });

  test("exports grid fullscreen as a dedicated plugin subpath", () => {
    expect(packageJson.exports["./grid/fullscreen"]).toBeDefined();
    expect(gridFullscreenEntry.gridFullscreen).toBeTypeOf("function");
    expect(gridFullscreenEntry.resolveGridFullscreenClick).toBeTypeOf("function");
    expect(gridFullscreenEntry.gridFullscreen()).toMatchObject({
      __rmgGridPlugin: true,
      kind: "fullscreen",
    });
  });

  test("exports grid data plugins as dedicated subpaths", () => {
    expect(packageJson.exports["./grid/pagination"]).toBeDefined();
    expect(packageJson.exports["./grid/load-more"]).toBeDefined();
    expect(packageJson.exports["./grid/infinite-scroll"]).toBeDefined();
    expect(packageJson.exports["./grid/virtualization"]).toBeDefined();
    expect(gridPaginationEntry.gridPagination({ pageIndex: 0, pageSize: 2 })).toMatchObject({
      __rmgGridPlugin: true,
      kind: "pagination",
    });
    expect(gridPaginationEntry.useGridPagination).toBeTypeOf("function");
    expect(gridPaginationEntry.GridPaginationControls).toBeTypeOf("function");
    expect(gridLoadMoreEntry.gridLoadMore({ visibleCount: 2 })).toMatchObject({
      __rmgGridPlugin: true,
      kind: "load-more",
    });
    expect(gridLoadMoreEntry.useGridLoadMore).toBeTypeOf("function");
    expect(gridInfiniteScrollEntry.gridInfiniteScroll()).toMatchObject({
      __rmgGridPlugin: true,
      kind: "infinite-scroll",
    });
    expect(gridInfiniteScrollEntry.useGridInfiniteScroll).toBeTypeOf("function");
    expect(gridVirtualizationEntry.gridVirtualization()).toMatchObject({
      __rmgGridPlugin: true,
      kind: "virtualization",
    });
    expect(gridVirtualizationEntry.useGridVirtualizer).toBeTypeOf("function");
  });
});
