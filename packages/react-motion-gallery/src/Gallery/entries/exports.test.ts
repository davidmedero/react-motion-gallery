import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as entriesEntry from "../../entries";
import * as entriesMediaGridEntry from "../../entries-media-grid";
import * as entriesMediaMasonryEntry from "../../entries-media-masonry";
import * as entriesMediaSliderEntry from "../../entries-media-slider";
import * as entriesInfiniteScrollEntry from "../../entries-infinite-scroll";
import * as entriesLoadMoreEntry from "../../entries-load-more";
import * as entriesPaginationEntry from "../../entries-pagination";
import * as entriesReadyEntry from "../../entries-ready";
import * as entriesVirtualizationEntry from "../../entries-virtualization";

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("entries public entries", () => {
  test("exports default entries subpaths", () => {
    expect(packageJson.exports["./entries"]).toBeDefined();
    expect(packageJson.exports["./entries/media"]).toBeUndefined();
    expect(packageJson.exports["./entries/media/slider"]).toBeDefined();
    expect(packageJson.exports["./entries/media/grid"]).toBeDefined();
    expect(packageJson.exports["./entries/media/masonry"]).toBeDefined();
    expect(packageJson.exports["./entries/cache"]).toBeUndefined();
    expect(packageJson.exports["./entries/ready"]).toBeDefined();

    expect(entriesEntry.Entries).toBeDefined();
    expect(entriesEntry.default).toBe(entriesEntry.Entries);
    expect(entriesEntry.useEntriesReady).toBe(entriesReadyEntry.useEntriesReady);
    expect("createEntriesSliderMedia" in entriesEntry).toBe(false);
    expect("createEntriesGridMedia" in entriesEntry).toBe(false);
    expect("createEntriesMasonryMedia" in entriesEntry).toBe(false);
    expect(entriesMediaSliderEntry.createEntriesSliderMedia).toBeTypeOf("function");
    expect(entriesMediaGridEntry.createEntriesGridMedia).toBeTypeOf("function");
    expect(entriesMediaMasonryEntry.createEntriesMasonryMedia).toBeTypeOf("function");
  });

  test("exports controlled entries data plugins", () => {
    expect(packageJson.exports["./entries/pagination"]).toBeDefined();
    expect(packageJson.exports["./entries/load-more"]).toBeDefined();
    expect(packageJson.exports["./entries/infinite-scroll"]).toBeDefined();
    expect(packageJson.exports["./entries/virtualization"]).toBeDefined();
    expect(packageJson.exports["./entries/rating-stars"]).toBeUndefined();

    expect(entriesPaginationEntry.entriesPagination({ pageIndex: 0, pageSize: 4 })).toMatchObject({
      __rmgEntriesPlugin: true,
      kind: "pagination",
      options: { enabled: true, mode: "client" },
    });
    expect(entriesPaginationEntry.EntriesPaginationControls).toBeDefined();
    expect(entriesLoadMoreEntry.entriesLoadMore({ visibleCount: 4 })).toMatchObject({
      __rmgEntriesPlugin: true,
      kind: "load-more",
      options: { enabled: true, mode: "client" },
    });
    expect(entriesInfiniteScrollEntry.entriesInfiniteScroll()).toMatchObject({
      __rmgEntriesPlugin: true,
      kind: "infinite-scroll",
      options: { enabled: true, hasMore: true },
    });
    expect(entriesVirtualizationEntry.entriesVirtualization()).toMatchObject({
      __rmgEntriesPlugin: true,
      kind: "virtualization",
      options: { enabled: true, estimateSize: 420, gap: 24, overscan: 3 },
    });
  });
});
