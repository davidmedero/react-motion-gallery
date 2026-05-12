import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  buildActiveMasonrySeedHeights,
  buildMasonryFirstPaintLayoutCss,
  buildMasonryPositionedLayout,
  buildMasonrySkeletonPrediction,
  resolveActiveMasonryPredictionVariant,
  resolveActiveFlexStateKey,
} from "./prediction";

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("shared masonry skeleton prediction", () => {
  test("resolves the active responsive masonry variant from viewport width", () => {
    expect(
      resolveActiveFlexStateKey(
        [
          { minWidth: 0, columns: 1, gapPx: 12, key: "c1_g12" },
          { minWidth: 720, columns: 2, gapPx: 12, key: "c2_g12" },
          { minWidth: 1140, columns: 3, gapPx: 18, key: "c3_g18" },
        ],
        1280
      )
    ).toBe("c3_g18");

    expect(
      resolveActiveFlexStateKey(
        [
          { minWidth: 0, columns: 1, gapPx: 12, key: "c1_g12" },
          { minWidth: 720, columns: 2, gapPx: 12, key: "c2_g12" },
          { minWidth: 1140, columns: 3, gapPx: 18, key: "c3_g18" },
        ],
        900
      )
    ).toBe("c2_g12");
  });

  test("predicts legacy masonry placeholder heights and balanced columns deterministically", () => {
    const prediction = buildMasonrySkeletonPrediction({
      count: 4,
      columns: { 0: 1, 720: 2, 1140: 3 },
      gap: { 0: 12, 1140: 18 },
      ratios: [100, 150, 90, 130],
      placement: "balanced",
    });

    const active = resolveActiveMasonryPredictionVariant(prediction.variants, 1024);

    expect(active?.state.key).toBe("c2_g12");
    expect(active?.items.map((item) => item.height)).toEqual([354, 531, 319, 460]);
    expect(active?.items.map((item) => item.columnIndex)).toEqual([0, 1, 0, 1]);
  });

  test("predicts structured slot-based masonry shell heights deterministically", () => {
    const prediction = buildMasonrySkeletonPrediction({
      count: 1,
      spec: {
        ratios: [55],
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
                  height: 180,
                },
              },
              {
                kind: "text",
                barHeight: 18,
                lineHeight: 1.35,
                lines: 2,
                style: {
                  width: "88%",
                },
              },
              {
                kind: "text",
                barHeight: 14,
                lineHeight: 1.55,
                lines: 3,
                style: {
                  width: "100%",
                },
              },
            ],
          },
        },
      },
    });

    expect(prediction.variants[0]?.items[0]?.height).toBe(370);
  });

  test("builds live seed heights for every masonry placement", () => {
    expect(
      buildActiveMasonrySeedHeights({
        viewportWidth: 1024,
        count: 2,
        columns: { 0: 1, 720: 2, 1140: 3 },
        gap: 12,
        placement: "roundRobin",
        ratios: [80, 100],
      })
    ).toEqual([283, 354]);

    expect(
      buildActiveMasonrySeedHeights({
        viewportWidth: 1024,
        count: 2,
        columns: { 0: 1, 720: 2, 1140: 3 },
        gap: 12,
        placement: "balanced",
        ratios: [80, 100],
      })
    ).toEqual([283, 354]);

    expect(
      buildActiveMasonrySeedHeights({
        viewportWidth: 1024,
        count: 2,
        columns: { 0: 1, 720: 2, 1140: 3 },
        gap: 12,
        placement: "horizontalOrder",
        ratios: [80, 100],
      })
    ).toEqual([283, 354]);
  });

  test("lays out span-aware balanced, round-robin, and horizontal-order items distinctly", () => {
    const shared = {
      itemCount: 5,
      columnCount: 4,
      heights: [100, 80, 60, 70, 90],
      gapPx: 10,
      spans: [2, 1, 1, 2, 1],
    };

    expect(
      buildMasonryPositionedLayout({
        ...shared,
        placement: "balanced",
      })
    ).toEqual({
      height: 200,
      items: [
        { index: 0, span: 2, columnStart: 0, top: 0, height: 100 },
        { index: 1, span: 1, columnStart: 2, top: 0, height: 80 },
        { index: 2, span: 1, columnStart: 3, top: 0, height: 60 },
        { index: 3, span: 2, columnStart: 2, top: 90, height: 70 },
        { index: 4, span: 1, columnStart: 0, top: 110, height: 90 },
      ],
    });

    expect(
      buildMasonryPositionedLayout({
        ...shared,
        placement: "roundRobin",
      })
    ).toEqual({
      height: 370,
      items: [
        { index: 0, span: 2, columnStart: 0, top: 0, height: 100 },
        { index: 1, span: 1, columnStart: 1, top: 110, height: 80 },
        { index: 2, span: 1, columnStart: 2, top: 0, height: 60 },
        { index: 3, span: 2, columnStart: 0, top: 200, height: 70 },
        { index: 4, span: 1, columnStart: 0, top: 280, height: 90 },
      ],
    });

    expect(
      buildMasonryPositionedLayout({
        ...shared,
        placement: "horizontalOrder",
      })
    ).toEqual({
      height: 180,
      items: [
        { index: 0, span: 2, columnStart: 0, top: 0, height: 100 },
        { index: 1, span: 1, columnStart: 2, top: 0, height: 80 },
        { index: 2, span: 1, columnStart: 3, top: 0, height: 60 },
        { index: 3, span: 2, columnStart: 0, top: 110, height: 70 },
        { index: 4, span: 1, columnStart: 2, top: 90, height: 90 },
      ],
    });
  });

  test("predicts span-aware horizontal-order positions from responsive spans", () => {
    const prediction = buildMasonrySkeletonPrediction({
      count: 2,
      columns: { 0: 1, 900: 4 },
      gap: 16,
      heightsPx: [240, 180],
      spans: [{ 0: "full", 900: 2 }, 1],
      placement: "horizontalOrder",
    });

    const active = resolveActiveMasonryPredictionVariant(prediction.variants, 1000);

    expect(prediction.states.map((state) => state.minWidth)).toEqual([0, 900]);
    expect(active?.items.map((item) => item.span)).toEqual([2, 1]);
    expect(active?.items.map((item) => item.columnStart)).toEqual([0, 2]);
    expect(active?.items.map((item) => item.top)).toEqual([0, 0]);
  });

  test("resolves container-keyed text lines against the predicted container width", () => {
    // Regression: previously, text nodes with `responsiveBy: "container"`
    // had their `lines`/`barHeight`/`lineHeight` looked up against the
    // viewport state's minWidth, even though the DOM honors `@container`
    // rules driven by the local available width. With 4 columns at
    // viewport >= 1140 and a layout width of 1100, the meta column ends up
    // ~ ((1100 - 3*18)/4 - 20 - 8) = 233.5px wide. For a body with
    // `lines: {0:4, 225:3, 354:2, 663:1}`, the @container rule yields 3
    // lines at that width, but the old code resolved against minWidth=1140
    // and produced lines=1 — making the predicted item height ~46.6px too
    // short and pushing every row-2 skeleton up into the row-1 cards.
    const prediction = buildMasonrySkeletonPrediction({
      count: 2,
      columns: { 0: 1, 1140: 4 },
      gap: 18,
      placement: "horizontalOrder",
      layoutWidthPx: 1100,
      spec: {
        layout: {
          kind: "masonry",
          itemWrapStyle: { padding: "10px 10px 14px" },
          item: {
            kind: "col",
            style: { gap: 12 },
            children: [
              {
                kind: "rect",
                style: { width: "100%", aspectRatio: "4 / 5" },
              },
              {
                kind: "col",
                style: { gap: 5, padding: "0 4px" },
                children: [
                  {
                    kind: "text",
                    barHeight: 11.84,
                    lineHeight: 1.4,
                    lines: 1,
                    responsiveBy: "container",
                  },
                  {
                    kind: "text",
                    barHeight: 16.32,
                    lineHeight: 1.2,
                    lines: 1,
                    responsiveBy: "container",
                  },
                  {
                    kind: "text",
                    barHeight: 14.72,
                    lineHeight: 1.55,
                    lines: { 0: 4, 225: 3, 354: 2, 663: 1 },
                    responsiveBy: "container",
                  },
                ],
              },
            ],
          },
        },
      },
    });

    const active = resolveActiveMasonryPredictionVariant(prediction.variants, 1280);
    expect(active?.state.minWidth).toBe(1140);

    // Single-span slot 0 at layoutWidthPx=1100 has card-content-width ≈ 233.5
    // → meta col content ≈ 225.5 → body lines bucket = 3.
    // Card body contribution: 3 lines × 14.72 × 1.55 = 68.448
    // (vs. lines=1 → 22.816 with the old broken behavior, a difference of
    // 45.632 per item.)
    const slot0Body = 3 * 14.72 * 1.55;
    const slot0Title = 1 * 16.32 * 1.2;
    const slot0Badge = 1 * 11.84 * 1.4;
    const innerColGaps = 5 + 5;
    const outerColGap = 12;
    const cardPadding = 10 + 14;
    const expectedTextSection =
      slot0Badge + slot0Title + slot0Body + innerColGaps + outerColGap;

    // Item width at 4 cols / 1100 / gap 18 = (1100 - 54)/4 = 261.5
    // Card content width = 261.5 - 20 = 241.5
    // Image rect at aspectRatio 4/5: height = 241.5 / (4/5) = 301.875
    const itemWidthPx = 261.5;
    const cardContentWidth = itemWidthPx - 20;
    const imageHeight = cardContentWidth / (4 / 5);
    const expectedSlot0Height = imageHeight + expectedTextSection + cardPadding;

    // The buggy behavior would have produced ~407 here (1-line body),
    // so a >= 440 floor would only pass with the responsiveBy: "container"
    // fix in place. Use a tolerance of ~5px to absorb sub-pixel rounding
    // in the predictor.
    const buggySlot0Height =
      imageHeight + (slot0Badge + slot0Title + 1 * 14.72 * 1.55 + innerColGaps + outerColGap) + cardPadding;
    expect(active?.items[0]?.height).toBeGreaterThan(buggySlot0Height + 30);
    expect(active?.items[0]?.height).toBeCloseTo(expectedSlot0Height, -1);
  });

  test("uses constrained layout width for four-column container-keyed text predictions", () => {
    const prediction = buildMasonrySkeletonPrediction({
      count: 6,
      columns: { 0: 1, 1140: 4 },
      gap: { 0: 12, 1140: 18 },
      placement: "horizontalOrder",
      viewportWidth: 1600,
      layoutWidthPx: 962,
      spec: {
        layout: {
          kind: "masonry",
          itemWrapStyle: { padding: 10 },
          item: {
            kind: "col",
            style: { gap: 12 },
            children: [
              {
                kind: "rect",
                style: { width: "100%", aspectRatio: "5 / 4" },
              },
              {
                kind: "text",
                barHeight: 14.72,
                lineHeight: 1.55,
                lines: { 0: 4, 240: 1 },
                responsiveBy: "container",
              },
            ],
          },
          slots: [
            {
              span: { 0: 1, 1140: 2 },
              item: {
                kind: "rect",
                style: { width: "100%", aspectRatio: "4 / 5" },
              },
            },
            {},
            {},
            {
              span: { 0: 1, 1140: 2 },
              item: {
                kind: "rect",
                style: { width: "100%", aspectRatio: "16 / 10" },
              },
            },
            {},
            {},
          ],
        },
      },
    });

    const active = resolveActiveMasonryPredictionVariant(prediction.variants, 1600);
    expect(active?.state.key).toBe("c4_g18");

    const itemWidthPx = (962 - 18 * 3) / 4;
    const cardContentWidth = itemWidthPx - 20;
    const expectedSingleColumnHeight = Math.ceil(
      cardContentWidth / (5 / 4) + 12 + 4 * 14.72 * 1.55 + 20
    );

    expect(active?.items[1]?.height).toBe(expectedSingleColumnHeight);
    expect(active?.items[2]?.height).toBe(expectedSingleColumnHeight);
    expect(active?.items[4]?.top).toBe(expectedSingleColumnHeight + 18);
    expect(active?.items[5]?.top).toBe(expectedSingleColumnHeight + 18);
  });

  test("emits container-query first-paint masonry CSS without layout width", () => {
    const prediction = buildMasonrySkeletonPrediction({
      count: 6,
      columns: { 0: 1, 1140: 4 },
      gap: { 0: 12, 1140: 18 },
      placement: "horizontalOrder",
      viewportWidth: 1600,
      spec: {
        layout: {
          kind: "masonry",
          itemWrapStyle: { padding: 10 },
          item: {
            kind: "col",
            style: { gap: 12 },
            children: [
              {
                kind: "rect",
                style: { width: "100%", aspectRatio: "5 / 4" },
              },
              {
                kind: "col",
                style: { gap: 5, padding: "0 4px" },
                children: [
                  {
                    kind: "text",
                    barHeight: 16.32,
                    lineHeight: 1.2,
                    lines: { 0: 2, 199.484: 1 },
                    responsiveBy: "container",
                  },
                  {
                    kind: "text",
                    barHeight: 14.72,
                    lineHeight: 1.55,
                    lines: { 0: 5, 172.5: 4, 200.453: 3, 288: 2 },
                    responsiveBy: "container",
                  },
                ],
              },
            ],
          },
          slots: [
            {
              span: { 0: 1, 1140: 2 },
              item: {
                kind: "rect",
                style: { width: "100%", aspectRatio: "4 / 5" },
              },
            },
            {},
            {},
            {
              span: { 0: 1, 1140: 2 },
              item: {
                kind: "rect",
                style: { width: "100%", aspectRatio: "16 / 10" },
              },
            },
            {},
            {},
          ],
        },
      },
    });

    const active = resolveActiveMasonryPredictionVariant(prediction.variants, 1600);
    expect(active?.state.key).toBe("c4_g18");

    const itemWidthPx = (1140 - 18 * 3) / 4;
    const cardContentWidth = itemWidthPx - 20;
    const conservativeHeight = Math.ceil(
      cardContentWidth / (5 / 4) +
        12 +
        2 * 16.32 * 1.2 +
        5 +
        5 * 14.72 * 1.55 +
        20
    );

    expect(active?.items[1]?.height).toBe(conservativeHeight);

    const firstPaintCss = buildMasonryFirstPaintLayoutCss({
      scopeId: "seed_test",
      prediction,
    });

    expect(firstPaintCss).toContain("@container (min-width:856px)");
    expect(firstPaintCss).toContain("@container (min-width:963.936px)");
    expect(firstPaintCss).toContain("--rmg-mskel-height-1:calc(((((var(--rmg-mskel-width-1)) - (20)) / 1.25) + (147.43200000000002px)) + (20)) !important;");
    expect(firstPaintCss).toContain("--rmg-mskel-height-1:calc(((((var(--rmg-mskel-width-1)) - (20)) / 1.25) + (127.84800000000001px)) + (20)) !important;");
  });
});
