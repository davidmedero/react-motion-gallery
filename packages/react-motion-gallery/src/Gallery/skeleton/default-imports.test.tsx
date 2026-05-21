import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { Entries } from "../../entries";
import { Skeleton } from "../../skeleton-base";
import { GridSkeleton } from "../../skeleton-grid";
import { MasonrySkeleton } from "../../skeleton-masonry";
import { SliderSkeleton } from "../../skeleton-slider";

const ignoredCache = {
  key: "ignored",
  snapshot: {
    version: 1,
    key: "ignored",
    scopeId: "ignored-scope",
    kind: "slider",
    createdAt: Date.now(),
    widthBucketMin: 0,
    viewportWidth: 1024,
    text: {},
  },
};

function expectNoDefaultCacheOrRestoreMarkers(markup: string) {
  expect(markup).not.toContain("rmg_skel_cache");
  expect(markup).not.toContain("data-rmg-slider-restore");
  expect(markup).not.toContain("data-rmg-entry-skeleton-cache-scope");
}

describe("default skeleton import surface", () => {
  test("ignores legacy cache and restore props on default skeleton components", () => {
    const base = renderToStaticMarkup(
      <Skeleton
        {...({ cache: ignoredCache } as any)}
        layout={{
          kind: "rect",
          style: { width: "100%", height: 80 },
        }}
      />
    );

    const slider = renderToStaticMarkup(
      <SliderSkeleton
        {...({ cache: ignoredCache, restore: { key: "ignored" } } as any)}
        layout={{
          kind: "slider",
          item: {
            kind: "rect",
            style: { width: "100%", height: 140 },
          },
        }}
      />
    );

    const grid = renderToStaticMarkup(
      <GridSkeleton
        {...({ cache: ignoredCache } as any)}
        layout={{
          kind: "grid",
          item: {
            kind: "rect",
            style: { width: "100%", height: 120 },
          },
        }}
      />
    );

    const masonry = renderToStaticMarkup(
      <MasonrySkeleton
        {...({ cache: ignoredCache } as any)}
        layout={{
          kind: "masonry",
          item: {
            kind: "rect",
            style: { width: "100%", height: 160 },
          },
        }}
      />
    );

    expectNoDefaultCacheOrRestoreMarkers([base, slider, grid, masonry].join(""));
  });

  test("ignores entries.loading.cache on default Entries", () => {
    const markup = renderToStaticMarkup(
      <Entries
        entries={
          {
            items: [{ id: "one", media: [] }],
            loading: {
              enabled: true,
              cache: ignoredCache,
            },
          } as any
        }
        renderMediaContainer={() => null}
      />
    );

    expectNoDefaultCacheOrRestoreMarkers(markup);
  });
});
