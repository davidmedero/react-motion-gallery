import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  buildMasonryColumnLayout,
  MasonryCore,
  seedUnmeasuredMasonryHeights,
} from "./Masonry";
import {
  buildMasonrySkeletonPrediction,
  resolveActiveMasonryPredictionVariant,
} from "./prediction";
import Masonry from "./index";

describe("Masonry runtime item wrapper props", () => {
  test("distributes equal-height balanced items across columns instead of collapsing into the first lane", () => {
    expect(
      buildMasonryColumnLayout({
        itemCount: 6,
        columnCount: 3,
        placement: "balanced",
        heights: [0, 0, 0, 0, 0, 0],
        estimatedItemHeight: 0,
        gapPx: 12,
      })
    ).toEqual([0, 1, 2, 0, 1, 2]);
  });

  test("uses the shared viewport width snapshot for responsive SSR column markup", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        Masonry,
        {
          columns: { 0: 1, 720: 2, 1140: 3 },
          gap: 12,
          loading: { enabled: false },
        },
        React.createElement("div", null, "alpha"),
        React.createElement("div", null, "beta"),
        React.createElement("div", null, "gamma")
      )
    );

    expect(markup.match(/style="flex:1;min-width:0;display:flex;flex-direction:column"/g))
      .toHaveLength(2);
  });

  test("resolves responsive masonry markup from an explicit viewport snapshot", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MasonryCore, {
        items: ["alpha", "beta", "gamma"],
        masonryColumns: { 0: 1, 720: 2, 1140: 3 },
        masonryGap: { 0: 12, 1140: 18 },
        responsiveViewportWidth: 1280,
      })
    );

    expect(markup).toContain("column-gap:18px");
    expect(markup.match(/style="flex:1;min-width:0;display:flex;flex-direction:column"/g))
      .toHaveLength(3);
  });

  test("applies itemWrapClassName and itemWrapStyle to the masonry item wrapper", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        Masonry,
        {
          columns: 1,
          gap: 12,
          loading: { enabled: false },
          classNames: {
            item: "legacy-shell",
          },
          itemWrapClassName: "wrap-shell",
          itemWrapStyle: {
            padding: "6px",
          },
        },
        "alpha"
      )
    );

    expect(markup).toContain('class="rmg__masonry-item legacy-shell wrap-shell"');
    expect(markup).toContain("padding:6px");
    expect(markup).toContain("--rmg-intro-index:0");
    expect(markup).toContain(">alpha<");
  });

  test("renders SSR fallback inline styles that keep content above the skeleton while preserving the hidden-content fallback", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        Masonry,
        {
          columns: 1,
          gap: 12,
          loading: {
            enabled: true,
            timing: {
              exitMs: 360,
            },
          },
        },
        "alpha"
      )
    );

    expect(markup).toContain('style="opacity:1;pointer-events:none;transition:opacity 360ms ease"');
    expect(markup).toContain(
      'style="position:absolute;inset:0;min-width:0;z-index:2;pointer-events:none;height:0"'
    );
    expect(markup).toContain('style="opacity:0;pointer-events:none;transition:opacity 360ms ease"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain(">alpha<");
  });

  test("initializes unmeasured masonry heights from shared skeleton prediction seeds", () => {
    expect(
      seedUnmeasuredMasonryHeights({
        itemCount: 3,
        previousHeights: [],
        measuredIndices: new Set(),
        initialHeights: [320, 280, 400],
        estimatedItemHeight: 340,
      })
    ).toEqual([320, 280, 400]);
  });

  test("reseeds only still-unmeasured items when responsive prediction changes", () => {
    expect(
      seedUnmeasuredMasonryHeights({
        itemCount: 3,
        previousHeights: [320, 280, 400],
        measuredIndices: new Set([1]),
        initialHeights: [300, 260, 420],
        estimatedItemHeight: 340,
      })
    ).toEqual([300, 280, 420]);
  });

  test("falls back to estimatedItemHeight only when prediction is unavailable", () => {
    expect(
      seedUnmeasuredMasonryHeights({
        itemCount: 3,
        previousHeights: [],
        measuredIndices: new Set(),
        initialHeights: [undefined, 250],
        estimatedItemHeight: 340,
      })
    ).toEqual([340, 250, 340]);
  });

  test("matches live balanced initial packing to the shared skeleton prediction at the SSR viewport width", () => {
    const prediction = buildMasonrySkeletonPrediction({
      count: 4,
      columns: { 0: 1, 720: 2, 1140: 3 },
      gap: { 0: 12, 1140: 18 },
      placement: "balanced",
      spec: {
        layout: {
          kind: "masonry",
          itemWrapStyle: {
            padding: 12,
          },
          item: {
            kind: "col",
            style: {
              gap: 12,
              padding: 14,
            },
            children: [
              {
                kind: "rect",
                style: {
                  width: "100%",
                  aspectRatio: "4 / 5",
                },
              },
              {
                kind: "text",
                fontSize: 18,
                lineHeight: 1.35,
                lines: 2,
                style: {
                  width: "88%",
                },
              },
            ],
          },
          slots: [
            {},
            {
              item: {
                kind: "col",
                style: {
                  gap: 12,
                  padding: 14,
                },
                children: [
                  {
                    kind: "rect",
                    style: {
                      width: "100%",
                      aspectRatio: "3 / 5",
                    },
                  },
                  {
                    kind: "text",
                    fontSize: 18,
                    lineHeight: 1.35,
                    lines: 2,
                    style: {
                      width: "88%",
                    },
                  },
                ],
              },
            },
            {},
            {
              item: {
                kind: "col",
                style: {
                  gap: 12,
                  padding: 14,
                },
                children: [
                  {
                    kind: "rect",
                    style: {
                      width: "100%",
                      aspectRatio: "5 / 4",
                    },
                  },
                  {
                    kind: "text",
                    fontSize: 18,
                    lineHeight: 1.35,
                    lines: 2,
                    style: {
                      width: "88%",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });

    const active = resolveActiveMasonryPredictionVariant(prediction.variants, 1024);
    const seededHeights = seedUnmeasuredMasonryHeights({
      itemCount: active?.items.length ?? 0,
      previousHeights: [],
      measuredIndices: new Set(),
      initialHeights: active?.items.map((item) => item.height),
      estimatedItemHeight: 340,
    });

    expect(active?.state.key).toBe("c2_g12");
    expect(
      buildMasonryColumnLayout({
        itemCount: seededHeights.length,
        columnCount: active?.state.columns ?? 0,
        placement: "balanced",
        heights: seededHeights,
        estimatedItemHeight: 340,
        gapPx: active?.state.gapPx ?? 0,
      })
    ).toEqual(active?.items.map((item) => item.columnIndex));
  });
});
