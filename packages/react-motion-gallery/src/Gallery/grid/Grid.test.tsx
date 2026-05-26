import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";

import Grid from "./index";
import { GridSkeleton as Skeleton } from "../skeleton/grid";
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
