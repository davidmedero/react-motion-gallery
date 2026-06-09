import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";

import Grid from "./index";
import sharedSkeletonStyles from "../shared/skeleton/layout.module.css";
import { GridSkeleton as Skeleton } from "../skeleton/grid";
import { gridLazyLoad } from "../../grid-lazy-load";
import type { GridSkeletonSpec } from "../skeleton/grid";

function FancyCard(props: { label: string }) {
  return <article>{props.label}</article>;
}

describe("Grid item spans and template columns", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("exposes Grid.Item and applies item host props for cloned and wrapped children", () => {
    const markup = renderToStaticMarkup(
      <Grid columns={12}>
        <Grid.Item span={6} className="feature-shell" style={{ padding: "8px" }}>
          <article className="card-shell">alpha</article>
        </Grid.Item>
        <Grid.Item span="full">
          <FancyCard label="beta" />
        </Grid.Item>
      </Grid>
    );

    expect(Grid.Item).toBeDefined();
    expect(markup).toContain("feature-shell");
    expect(markup).toContain("card-shell");
    expect(markup).toContain("padding:8px");
    expect(markup).toContain("grid-column:span 6 / span 6");
    expect(markup).toContain("grid-column:1 / -1");
    expect(markup).toContain(">beta<");
  });

  test("renders responsive template and span CSS in SSR markup", () => {
    const markup = renderToStaticMarkup(
      <Grid
        templateColumns={{
          0: "1fr",
          900: "minmax(0, 1.4fr) minmax(0, 1fr)",
          1200: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)",
        }}
        gap={{ 0: 12, 1200: 18 }}
      >
        <Grid.Item span={{ 0: "full", 900: 2 }}>
          <FancyCard label="alpha" />
        </Grid.Item>
      </Grid>
    );

    expect(markup).toContain('data-rmg-grid-item-key="rmg-1"');
    expect(markup).toContain("grid-template-columns:1fr;");
    expect(markup).toContain("@media (min-width:900px)");
    expect(markup).toContain("grid-template-columns:minmax(0, 1.4fr) minmax(0, 1fr);");
    expect(markup).toContain("--rmg-grid-gap:18px;");
    expect(markup).toContain("grid-column:1 / -1;");
    expect(markup).toContain("grid-column:span 2 / span 2;");
  });

  test("templateColumns overrides columns and minColumnWidth", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const markup = renderToStaticMarkup(
      <Grid
        templateColumns="2fr 1fr 1fr"
        columns={12}
        minColumnWidth={240}
      >
        alpha
      </Grid>
    );

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("templateColumns")
    );
    expect(markup).toContain("grid-template-columns:2fr 1fr 1fr");
    expect(markup).not.toContain("repeat(12");
  });

  test("ignores spans in auto-fill minColumnWidth mode and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const markup = renderToStaticMarkup(
      <Grid minColumnWidth={220}>
        <Grid.Item span={6}>alpha</Grid.Item>
      </Grid>
    );

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("span` is ignored")
    );
    expect(markup).not.toContain("grid-column:span 6 / span 6");
  });

  test("marks lazy-load wrappers for staged content stretching", () => {
    const markup = renderToStaticMarkup(
      <Grid columns={1} plugins={[gridLazyLoad()]}>
        <article>
          <img src="/image-a.jpg" alt="Image A" />
        </article>
      </Grid>
    );

    expect(markup).toContain('data-rmg-grid-lazy-host="true"');
    expect(markup).toContain('data-rmg-lazy-src="/image-a.jpg"');
  });

  test("stages item reveal without mounting an inner skeleton", () => {
    const markup = renderToStaticMarkup(
      <Grid columns={1} loading={{ timing: { exitMs: 1200 } }}>
        <article>alpha</article>
      </Grid>
    );

    expect(markup).toContain('data-rmg-grid-item-stage="1"');
    expect(markup).not.toContain('data-rmg-grid-item-skeleton="true"');
  });

  test("renders structured skeleton slots as first-paint grid items in SSR", () => {
    const skeleton: GridSkeletonSpec = {
      shimmer: {
        durationMs: 1444,
      },
      layout: {
        kind: "grid",
        item: {
          kind: "rect",
          style: { width: "100%", height: 120 },
        },
        slots: [
          {
            span: { 0: "full", 900: 2 },
            item: {
              kind: "rect",
              style: { width: "100%", height: 160 },
            },
          },
          {
            span: 1,
            item: {
              kind: "text",
              barHeight: 14,
              lineHeight: 1.5,
              lines: 2,
            },
          },
        ],
      },
    };

    const markup = renderToStaticMarkup(
      <Grid columns={{ 0: 1, 900: 2 }} gap={{ 0: 12, 900: 18 }} loading={{ skeleton }}>
        <Grid.Item span={{ 0: "full", 900: 2 }}>
          <article>alpha</article>
        </Grid.Item>
        <Grid.Item span={1}>
          <article>beta</article>
        </Grid.Item>
      </Grid>
    );

    const liveGridIndex = markup.indexOf('data-rmg-grid-node="true"');
    const firstSkeletonIndex = markup.indexOf('data-rmg-grid-item-skeleton="true"');
    const firstContentIndex = markup.indexOf('data-rmg-grid-item-content="true"');

    expect(markup).not.toContain('data-rmg-skeleton-wrapper="true"');
    expect(markup).not.toContain('data-rmg-skeleton-layout-owner="skeleton"');
    expect(markup).not.toContain('data-rmg-skeleton-loading-layer="true"');
    expect(markup).not.toContain('data-rmg-grid-structured-skeleton-plane="true"');
    expect(markup).not.toContain('data-rmg-grid-structured-skeleton-mounted="true"');
    expect(markup).toContain('data-rmg-grid-skeleton-owner="items"');
    expect(liveGridIndex).toBeGreaterThan(-1);
    expect(firstSkeletonIndex).toBeGreaterThan(liveGridIndex);
    expect(markup.match(/<div[^>]+data-rmg-grid-item-skeleton="true"/g) ?? []).toHaveLength(2);
    expect(markup.match(/data-rmg-grid-item-layered="1"/g) ?? []).toHaveLength(2);
    expect(markup).toContain('data-rmg-grid-item-content="true"');
    expect(markup).not.toContain(">alpha<");
    expect(markup).not.toContain(">beta<");
    expect(markup).toContain(sharedSkeletonStyles.skelCardShimmer);
    expect(markup).toContain("--rmg-skel-shimmer-duration:1444ms");
    expect(markup).not.toContain('data-rmg-grid-item-shimmer="off"');
    expect(markup).not.toContain("data-rmg-grid-item-layout-seed");
    expect(markup).not.toContain("--rmg-grid-item-seed-height");
    expect(firstSkeletonIndex).toBeLessThan(firstContentIndex);
  });

  test("fills first-paint structured skeleton slots before live items catch up", () => {
    const skeleton: GridSkeletonSpec = {
      layout: {
        kind: "grid",
        count: 3,
        item: {
          kind: "rect",
          style: { width: "100%", height: 120 },
        },
        slots: [
          {
            span: "full",
            item: {
              kind: "rect",
              style: { width: "100%", height: 180 },
            },
          },
          {
            span: 6,
            item: {
              kind: "rect",
              style: { width: "100%", height: 140 },
            },
          },
          {
            span: 6,
            item: {
              kind: "rect",
              style: { width: "100%", height: 160 },
            },
          },
        ],
      },
    };

    const markup = renderToStaticMarkup(
      <Grid columns={12} loading={{ skeleton }}>
        <Grid.Item span="full">
          <article>alpha</article>
        </Grid.Item>
      </Grid>
    );

    expect(markup).not.toContain('data-rmg-grid-structured-skeleton-plane="true"');
    expect(markup).toContain('data-rmg-grid-item-key="rmg-1"');
    expect(markup).toContain('data-rmg-grid-item-key="rmg-grid-loading-1"');
    expect(markup).toContain('data-rmg-grid-item-key="rmg-grid-loading-2"');
    expect(markup.match(/<div[^>]+data-rmg-grid-item-skeleton="true"/g) ?? []).toHaveLength(3);
    expect(markup.match(/data-rmg-grid-item-content="true"/g) ?? []).toHaveLength(3);
    expect(markup).not.toContain(">alpha<");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("grid-column:1 / -1");
    expect(markup).toContain("grid-column:span 6 / span 6");
    expect(markup).toContain("height:180px");
    expect(markup).toContain("height:140px");
    expect(markup).toContain("height:160px");
  });

  test("renders empty active placeholders through structured inner skeleton slots", () => {
    const skeleton: GridSkeletonSpec = {
      layout: {
        kind: "grid",
        item: {
          kind: "rect",
          style: { width: "100%", height: 120 },
        },
        slots: [
          {
            span: { 0: "full", 900: 6 },
            item: {
              kind: "rect",
              style: { width: "100%", height: 180 },
            },
          },
          {
            span: 3,
            item: {
              kind: "rect",
              style: { width: "100%", height: 140 },
            },
          },
        ],
      },
    };

    const markup = renderToStaticMarkup(
      <Grid columns={12} loading={{ active: true, count: 2, skeleton }} />
    );

    expect(markup).toContain('data-rmg-grid-item-key="rmg-grid-loading-0"');
    expect(markup).toContain('data-rmg-grid-item-key="rmg-grid-loading-1"');
    expect(markup).not.toContain('data-rmg-skeleton-wrapper="true"');
    expect(markup).not.toContain('data-rmg-skeleton-layout-owner="skeleton"');
    expect(markup).not.toContain('data-rmg-grid-structured-skeleton-plane="true"');
    expect(markup).toContain('data-rmg-grid-skeleton-owner="items"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup.match(/<div[^>]+data-rmg-grid-item-skeleton="true"/g) ?? []).toHaveLength(2);
    expect(markup.match(/data-rmg-grid-item-layered="1"/g) ?? []).toHaveLength(2);
    expect(markup).not.toContain("data-rmg-grid-item-layout-seed");
    expect(markup).toContain("grid-column:1 / -1");
    expect(markup).toContain("grid-column:span 6 / span 6");
    expect(markup).toContain("grid-column:span 3 / span 3");
    expect(markup).toContain("height:180px");
    expect(markup).not.toContain("--rmg-grid-item-seed-height");
  });

  test("keeps container-responsive structured skeleton CSS without height seeds", () => {
    const skeleton: GridSkeletonSpec = {
      layout: {
        kind: "grid",
        item: {
          kind: "col",
          style: { gap: 12 },
          children: [
            {
              kind: "rect",
              style: { width: "100%", aspectRatio: "4 / 5" },
            },
            {
              kind: "text",
              barHeight: 14,
              lineHeight: 1.5,
              lines: { 0: 3, 300: 2 },
              responsiveBy: "container",
            },
          ],
        },
      },
    };

    const markup = renderToStaticMarkup(
      <Grid minColumnWidth={220} loading={{ skeleton }}>
        <article>alpha</article>
      </Grid>
    );

    expect(markup).not.toContain('data-rmg-skeleton-wrapper="true"');
    expect(markup).not.toContain('data-rmg-grid-structured-skeleton-plane="true"');
    expect(markup).toContain('data-rmg-grid-skeleton-owner="items"');
    expect(markup).toContain('data-rmg-grid-item-skeleton="true"');
    expect(markup).toContain("container-type:inline-size");
    expect(markup).toContain("@container (min-width:300px)");
    expect(markup).not.toContain("100cqw");
    expect(markup).not.toContain("min-height:var(--rmg-grid-item-seed-height)");
  });

  test("applies the same spans through the Skeleton grid wrapper", () => {
    const skeleton: GridSkeletonSpec = {
      layout: {
        kind: "grid",
        item: {
          kind: "rect",
          style: { width: "100%", aspectRatio: 1 },
        },
      },
    };

    const markup = renderToStaticMarkup(
      <Skeleton
        layout={skeleton}
        ready={false}
        grid={{
          count: 2,
          columns: 12,
          items: [
            { id: "rmg-1", span: 6 },
            { id: "rmg-2", span: "full" },
          ],
          allowItemSpans: true,
        }}
      >
        <Grid columns={12}>
          <Grid.Item span={6}>alpha</Grid.Item>
          <Grid.Item span="full">beta</Grid.Item>
        </Grid>
      </Skeleton>
    );

    expect(markup.match(/grid-column:span 6 \/ span 6/g) ?? []).toHaveLength(2);
    expect(markup.match(/grid-column:1 \/ -1/g) ?? []).toHaveLength(2);
  });

  test("keeps span styles when Skeleton uses slot overrides", () => {
    const skeleton: GridSkeletonSpec = {
      layout: {
        kind: "grid",
        item: {
          kind: "text",
          barHeight: 14,
          lineHeight: 1.5,
          style: {
            width: "70%",
          },
        },
        slots: [
          {
            item: {
              kind: "rect",
              style: {
                width: "100%",
                height: 120,
              },
            },
          },
        ],
      },
    };

    const markup = renderToStaticMarkup(
      <Skeleton
        layout={skeleton}
        ready={false}
        grid={{
          count: 2,
          columns: 12,
          items: [
            { id: "rmg-1", span: 6 },
            { id: "rmg-2", span: "full" },
          ],
          allowItemSpans: true,
        }}
      >
        <Grid columns={12}>
          <Grid.Item span={6}>alpha</Grid.Item>
          <Grid.Item span="full">beta</Grid.Item>
        </Grid>
      </Skeleton>
    );

    expect(markup.match(/grid-column:span 6 \/ span 6/g) ?? []).toHaveLength(2);
    expect(markup.match(/grid-column:1 \/ -1/g) ?? []).toHaveLength(2);
    expect(markup).toContain("height:120px");
    expect(markup.match(/width:70%/g) ?? []).toHaveLength(1);
  });

  test("keeps span styles when passthrough mode wraps each child", () => {
    const markup = renderToStaticMarkup(
      <Grid columns={12} renderMode="passthrough">
        <Grid.Item span={6}>
          <article>alpha</article>
        </Grid.Item>
      </Grid>
    );

    expect(markup).toContain('data-rmg-idx="0"');
    expect(markup).toContain("grid-column:span 6 / span 6");
    expect(markup).toContain("<article>alpha</article>");
  });
});
