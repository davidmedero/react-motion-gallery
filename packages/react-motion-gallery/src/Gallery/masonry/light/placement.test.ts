import { describe, expect, test } from "vitest";

import {
  buildDimensionedMasonryFluidLayout,
  buildDimensionedMasonryLayout,
  collectMasonryResponsiveMinWidths,
} from "./placement";

const shared = {
  columnCount: 4,
  gapPx: 10,
  containerWidth: 430,
  items: [
    { width: 210, height: 100, span: 2 },
    { width: 100, height: 80 },
    { width: 100, height: 60 },
    { width: 210, height: 70, span: 2 },
    { width: 100, height: 90 },
  ],
};

describe("dimensioned masonry placement", () => {
  test("supports span-aware balanced placement", () => {
    const layout = buildDimensionedMasonryLayout({
      ...shared,
      placement: "balanced",
    });

    expect(layout.items.map((item) => item.columnStart)).toEqual([0, 2, 3, 2, 0]);
    expect(layout.items.map((item) => item.span)).toEqual([2, 1, 1, 2, 1]);
    expect(layout.height).toBe(200);
  });

  test("supports round-robin placement", () => {
    const layout = buildDimensionedMasonryLayout({
      ...shared,
      placement: "roundRobin",
    });

    expect(layout.items.map((item) => item.columnStart)).toEqual([0, 1, 2, 0, 0]);
    expect(layout.height).toBe(370);
  });

  test("supports horizontal-order placement", () => {
    const layout = buildDimensionedMasonryLayout({
      ...shared,
      placement: "horizontalOrder",
    });

    expect(layout.items.map((item) => item.columnStart)).toEqual([0, 2, 3, 0, 2]);
    expect(layout.height).toBe(180);
  });

  test("resolves responsive full spans", () => {
    const layout = buildDimensionedMasonryLayout({
      columnCount: 3,
      gapPx: 12,
      containerWidth: 624,
      viewportWidth: 900,
      placement: "horizontalOrder",
      items: [
        { width: 100, height: 50, span: { 0: 1, 800: "full" } },
        { width: 100, height: 100 },
      ],
    });

    expect(layout.items[0]).toMatchObject({
      span: 3,
      columnStart: 0,
      width: 624,
      height: 312,
    });
    expect(layout.items[1]).toMatchObject({
      span: 1,
      columnStart: 0,
      top: 324,
    });
  });

  test("builds container-width CSS for first-paint dimensioned layouts", () => {
    const layout = buildDimensionedMasonryFluidLayout({
      columnCount: 3,
      gapPx: 12,
      viewportWidth: 1200,
      placement: "balanced",
      items: [
        { width: 1200, height: 900 },
        { width: 1200, height: 1600 },
        { width: 1200, height: 1500, span: 2 },
      ],
    });

    expect(layout.items[0]).toMatchObject({
      left: "0px",
      width: "calc(33.333cqw - 8px)",
      height: "calc(25cqw - 6px)",
    });
    expect(layout.items[2]).toMatchObject({
      span: 2,
      left: "calc(33.333cqw + 4px)",
      width: "calc(66.667cqw - 4px)",
    });
    expect(layout.height).toContain("cqw");
  });

  test("collects responsive masonry breakpoints from columns, gap, and spans", () => {
    expect(
      collectMasonryResponsiveMinWidths({
        columns: { 0: 1, 720: 2, 1080: 3 },
        gap: { 0: 12, md: 16 },
        breakpointMap: { md: 900 },
        items: [
          { width: 100, height: 120 },
          { width: 100, height: 80, span: { 0: 1, 1080: 2 } },
        ],
      })
    ).toEqual([0, 720, 900, 1080]);
  });
});
