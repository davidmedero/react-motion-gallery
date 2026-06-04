import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { Skeleton } from "../../skeleton-base";
import { GridSkeleton } from "../../skeleton-grid";
import { MasonrySkeleton } from "../../skeleton-masonry";
import { SliderSkeleton } from "../../skeleton-slider";

function expectNoDefaultCacheOrRestoreMarkers(markup: string) {
  expect(markup).not.toContain("rmg_skel_cache");
  expect(markup).not.toContain("data-rmg-slider-restore");
  expect(markup).not.toContain("data-rmg-entry-skeleton-cache-scope");
}

describe("default skeleton import surface", () => {
  test("renders default skeleton components without cache or restore markers", () => {
    const base = renderToStaticMarkup(
      <Skeleton
        layout={{
          kind: "rect",
          style: { width: "100%", height: 80 },
        }}
      />
    );

    const slider = renderToStaticMarkup(
      <SliderSkeleton
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
      <MasonrySkeleton items={[{ width: 100, height: 160 }]} />
    );

    expectNoDefaultCacheOrRestoreMarkers([base, slider, grid, masonry].join(""));
  });

  test("lets wrapped GridSkeleton own layout while loading", () => {
    const layout = {
      kind: "grid" as const,
      item: {
        kind: "rect" as const,
        style: { width: "100%", height: 120 },
      },
    };
    const loading = renderToStaticMarkup(
      <GridSkeleton layout={layout} ready={false}>
        <div>grid content</div>
      </GridSkeleton>
    );
    const ready = renderToStaticMarkup(
      <GridSkeleton layout={layout} ready>
        <div>grid content</div>
      </GridSkeleton>
    );

    expect(loading).toContain('data-rmg-skeleton-layout-owner="skeleton"');
    expect(ready).toContain('data-rmg-skeleton-layout-owner="content"');
  });
});
